import type {
    ProtocolBot,
    Sakiko,
    SakikoAdapter,
    SakikoConfig
} from "@togawa-dev/sakiko";

import { EventSource } from "eventsource";
import type { ILogger } from "@togawa-dev/utils";
import { MilkyBot } from "./bot";
import { MilkyEventPayloadSchema } from "@togawa-dev/protocol-milky/payload/event";
import { VERSION } from "./global";
import { WebSocket } from "ws";
import { createEvent } from "./event";
import { z } from "zod";

export * from "./event"; // 导出事件

export const baseUrlOptionSchema = z.object({
    /** Milky 服务器的基础 URL，用于构建 API 和事件的完整 URL 地址。
     *
     * The base URL of the Milky server, used to construct the full URL addresses for APIs and events.
     *
     * @default "https://127.0.0.1:3000"
     */
    baseUrl: z.url().optional().default("http://127.0.0.1:3000"),
    /** Milky API 的基础 URL，如果与 baseUrl 不同，可以单独配置。
     *
     * The base URL for Milky APIs, can be configured separately if different from baseUrl.
     *
     * @default undefined
     */
    apiBaseUrl: z.url().optional(),
    /** Milky 事件的基础 URL，如果与 baseUrl 不同，可以单独配置。
     *
     * The base URL for Milky events, can be configured separately if different from baseUrl.
     *
     * @default undefined
     */
    eventBaseUrl: z.url().optional(),
    /** 事件连接模式，支持 WebSocket（"ws"）和 Server-Sent Events（"sse"）。
     *
     * The event connection mode, supports WebSocket ("ws") and Server-Sent Events ("sse").
     *
     * @default "sse"
     */
    mode: z.enum(["ws", "sse"]).optional().default("sse"),
    /** SSE 重连间隔时间（毫秒）。设置为 0 禁用自动重连。
     *
     * SSE reconnection interval in milliseconds. Set to 0 to disable auto-reconnection.
     *
     * @default 10000
     */
    reconnectInterval: z.number().optional().default(10000),
    /** SSE 最大重连次数。设置为 -1 表示无限重连。
     *
     * Maximum SSE reconnection attempts. Set to -1 for infinite reconnections.
     *
     * @default -1
     */
    maxReconnectAttempts: z.number().optional().default(-1)
});

export type baseUrlOption = z.input<typeof baseUrlOptionSchema>;
export type baseUrlOptionParsed = z.infer<typeof baseUrlOptionSchema>;

export const milkyOptionSchema = z.object({
    /** Milky 服务的基础 URL 配置,可以是单个 URL 或 URL 数组。
     *
     * The base URL configuration for the Milky service, can be a single URL or an array of URLs.
     *
     * @default { baseUrl: "https://127.0.0.1:3000", mode: "sse", reconnectInterval: 10000, maxReconnectAttempts: -1 }
     */
    server: z
        .union([baseUrlOptionSchema, z.array(baseUrlOptionSchema)])
        .optional()
        .default({
            baseUrl: "https://127.0.0.1:3000",
            mode: "sse",
            reconnectInterval: 10000,
            maxReconnectAttempts: -1
        }),

    /** 和 Milky 服务器通信时使用的访问令牌。
     *
     * The access token used for communication with the Milky server.
     *
     * @default undefined
     */
    accessToken: z.string().optional()
});

export type milkyOption = z.input<typeof milkyOptionSchema>;
export type milkyOptionParsed = z.infer<typeof milkyOptionSchema>;

declare module "@togawa-dev/sakiko" {
    interface SakikoConfigExtension {
        /** Milky 协议适配器的配置项 / The configuration options for the Milky protocol adapter */
        milky?: milkyOption;
    }
}

/**
 * Sakiko 的 Milky 协议适配器
 *
 * The Milky protocol adapter for Sakiko
 */
export class Milky implements SakikoAdapter {
    readonly pluginId = "adapter-milky";
    readonly pluginDisplayName = "adapter-milky";
    readonly pluginVersion = VERSION;
    readonly pluginAuthor = "machinacanis";
    readonly pluginDescription = "sakiko's milky protocol adapter";
    readonly pluginDependencies = [];

    readonly platformName = "qqnt";
    readonly protocolName = "milky";

    private _logger?: ILogger;

    /** 获取适配器的日志记录器 / Get the logger for the adapter */
    get logger() {
        if (!this._logger) {
            throw new Error("logger has not been set for this plugin");
        }
        return this._logger;
    }

    private _config?: SakikoConfig;

    /** 获取框架传入的配置项 / Get the configuration options from the framework */
    get config() {
        if (!this._config) {
            throw new Error("config has not been set for this plugin");
        }
        return this._config;
    }

    private _sakiko?: Sakiko;

    /** 获取框架实例 / Get the framework instance */
    get sakiko() {
        if (!this._sakiko) {
            throw new Error("sakiko has not been injected for this plugin");
        }
        return this._sakiko;
    }

    // SSE 连接清理处理器
    private _sseCleanupHandlers: Array<() => void> = [];
    // WebSocket 连接清理处理器
    private _wsCleanupHandlers: Array<() => void> = [];

    /** 设置日志记录器 / Set the logger for the adapter */
    setLogger(logger: ILogger): void {
        this._logger = logger;
    }

    /** 设置配置项 / Set the configuration options for the adapter */
    setConfig(config: SakikoConfig): void {
        this._config = config;
    }

    /** 在适配器加载时执行的逻辑 / Logic to be executed when the adapter is loaded */
    async onLoad(sakiko: Sakiko): Promise<void | boolean> {
        // 在适配器加载时执行的逻辑
        this._sakiko = sakiko;
    }

    /** 在适配器启动时执行的逻辑 / Logic to be executed when the adapter is started */
    async onStartUp(): Promise<void | boolean> {
        // 检查是否注入了milky的配置
        if (!this.config.milky) {
            // 一般来讲不会到这里，但是为了保险起见留这里了
            this.logger.warn(
                "milky config is not provided, abort starting milky adapter"
            );
            return false;
        }

        // 解析配置项
        const parsedConfig = milkyOptionSchema.parse(this.config.milky);

        // 根据配置项启动对应类型的服务
        const { server, accessToken } = parsedConfig;

        // 如果 server 不是数组，则包装成数组
        const serverArray = Array.isArray(server) ? server : [server];

        if (!server || serverArray.length === 0) {
            this.logger.warn("no server config provided");
            return;
        }

        for (const serverOption of serverArray) {
            switch (serverOption.mode) {
                case "ws":
                    await this.createWebSocketClient(serverOption, accessToken);
                    break;
                case "sse":
                    await this.createSSEClient(serverOption, accessToken);
                    break;
            }
        }
    }

    /** 在适配器关闭时执行的逻辑 / Logic to be executed when the adapter is closed */
    async onShutDown(): Promise<void> {
        this.logger.debug(
            "shutting down milky adapter, closing all SSE connections..."
        );

        // 执行所有 SSE 连接的清理函数
        for (const cleanup of this._sseCleanupHandlers) {
            try {
                cleanup();
            } catch (error) {
                this.logger.error("Error during SSE cleanup:", error);
            }
        }

        // 清空清理处理器数组
        this._sseCleanupHandlers = [];
        this.logger.debug("all SSE connections closed");
    }

    /** 创建一个 SSE 客户端 / Create an SSE client */
    async createSSEClient(option: baseUrlOptionParsed, accessCode?: string) {
        const eventUrl = option.eventBaseUrl
            ? new URL(option.eventBaseUrl)
            : new URL("/event", new URL(option.baseUrl));

        const adapter = this;

        let bot: MilkyBot | undefined = undefined;
        let reconnectCount = 0;
        let reconnectTimer: Timer | null = null;
        let isManualClose = false;
        let currentEventSource: EventSource | null = null;

        // 清理
        const cleanup = () => {
            isManualClose = true; // 标记为手动关闭，阻止重连

            // 清除重连定时器
            if (reconnectTimer) {
                clearTimeout(reconnectTimer);
                reconnectTimer = null;
            }

            // 清除对应的bot实例
            if (bot) {
                this.sakiko.bots.remove(bot.selfId, "connection closed");
            }

            // 关闭 EventSource 连接
            if (currentEventSource) {
                currentEventSource.close();
                currentEventSource = null;
            }

            adapter.logger.debug(
                `SSE connection cleanup completed for ${eventUrl.toString()}`
            );
        };

        // 注册清理处理器
        this._sseCleanupHandlers.push(cleanup);

        // 创建 SSE 连接的函数
        const createConnection = () => {
            // 如果已手动关闭，不创建新连接
            if (isManualClose) {
                return;
            }

            // 创建并返回 SSE 客户端实例
            const customFetch = async (
                url: string | URL,
                init?: RequestInit
            ): Promise<Response> => {
                const headers = new Headers(init?.headers);
                if (accessCode) {
                    headers.set("Authorization", `Bearer ${accessCode}`);
                }
                return fetch(url, {
                    ...init,
                    headers
                });
            };

            const es = new EventSource(eventUrl.toString(), {
                fetch: customFetch
            });

            // 保存当前连接实例以便清理
            currentEventSource = es;

            es.onopen = () => {
                reconnectCount = 0; // 重置重连计数器
                adapter.logger.debug(
                    `SSE connection established for milky server at ${eventUrl.toString()}`
                );
            };

            es.onmessage = async (event) => {
                let raw: unknown;
                try {
                    raw = JSON.parse(event.data);
                } catch (e) {
                    this.logger.error(
                        "JSON parse failed:",
                        e,
                        "raw data:",
                        event.data
                    );
                    return;
                }
                // 验证事件数据
                const result = MilkyEventPayloadSchema.safeParse(raw);
                if (result.success) {
                    // 事件数据有效，可以创建事件
                    if (bot) {
                        const e = createEvent(result.data, bot);
                        if (e) {
                            adapter.sakiko.bus.publish(e);
                        }
                        // 如果接受到了数据但是没有成功解析出事件，那么默认为是心跳包或者其它无关紧要的数据，不做处理
                    } else {
                        // 这个连接对应的机器人实例还没有被创建
                        // 当前连接的机器人实例没有被初始化

                        bot = new MilkyBot(adapter, {
                            _selfId: String(result.data.self_id),
                            _apiBaseUrl: option.apiBaseUrl
                                ? new URL(option.apiBaseUrl)
                                : new URL("/api", new URL(option.baseUrl)),
                            _accessToken: accessCode
                        });

                        await bot.init(); // 触发获取信息用的初始化方法

                        adapter.logger.debug(
                            `created milky bot instance for selfId ${result.data.self_id}`
                        );

                        // 将机器人实例的引用挂到框架上
                        this.sakiko.bots.add(bot as ProtocolBot<any>);

                        const e = createEvent(result.data, bot);
                        if (e) {
                            adapter.sakiko.bus.publish(e);
                        }
                    }
                }
            };

            es.onerror = (err) => {
                adapter.logger.error(
                    `SSE connection error for milky server at ${eventUrl.toString()}:`,
                    err.message
                );

                // 关闭当前连接
                es.close();

                // 如果是手动关闭，不进行重连
                if (isManualClose) {
                    return;
                }

                // 检查是否需要重连
                const shouldReconnect =
                    option.reconnectInterval > 0 &&
                    (option.maxReconnectAttempts === -1 ||
                        reconnectCount < option.maxReconnectAttempts);

                if (shouldReconnect) {
                    reconnectCount++;
                    adapter.logger.warn(
                        `attempting to reconnect to SSE server (${reconnectCount}${option.maxReconnectAttempts === -1 ? "" : `/${option.maxReconnectAttempts}`})...`
                    );

                    // 清除之前的定时器
                    if (reconnectTimer) {
                        clearTimeout(reconnectTimer);
                    }

                    // 设置重连定时器
                    reconnectTimer = setTimeout(() => {
                        createConnection();
                    }, option.reconnectInterval);
                } else {
                    adapter.logger.error(
                        `failed to connect to SSE server after ${reconnectCount} attempts. giving up.`
                    );
                }
            };

            return es;
        };

        // 启动第一轮连接
        createConnection();
    }

    /** 创建一个 WebSocket 客户端 / Create a WebSocket client */
    async createWebSocketClient(
        option: baseUrlOptionParsed,
        accessCode?: string
    ) {
        // 大部分实现都跟 SSE 客户端差不多，就是换成了 WebSocket
        // 所以我就不写注释了，本来也是让 LLM 帮我 copy 的
        const eventUrl = option.eventBaseUrl
            ? new URL(option.eventBaseUrl)
            : new URL("/event", new URL(option.baseUrl));

        eventUrl.protocol = eventUrl.protocol.replace(/^http/, "ws"); // 如果是 http 协议起始则替换为 ws 协议

        const adapter = this;

        let bot: MilkyBot | undefined = undefined;
        let reconnectCount = 0;
        let reconnectTimer: Timer | null = null;
        let isManualClose = false;
        let currentWebSocket: WebSocket | null = null;

        const cleanup = () => {
            isManualClose = true;

            if (reconnectTimer) {
                clearTimeout(reconnectTimer);
                reconnectTimer = null;
            }

            if (bot) {
                this.sakiko.bots.remove(bot.selfId, "connection closed");
            }

            if (currentWebSocket) {
                currentWebSocket.close();
                currentWebSocket = null;
            }

            adapter.logger.debug(
                `websocket connection cleanup completed for ${eventUrl.toString()}`
            );
        };

        this._wsCleanupHandlers.push(cleanup);

        const createConnection = () => {
            if (isManualClose) {
                return;
            }

            const headers: Record<string, string> = {};
            if (accessCode) {
                headers["Authorization"] = `Bearer ${accessCode}`;
            }

            const ws = new WebSocket(eventUrl.toString(), {
                headers
            });

            currentWebSocket = ws;

            ws.on("open", () => {
                reconnectCount = 0;
                adapter.logger.debug(
                    `websocket connection established for milky server at ${eventUrl.toString()}`
                );
            });

            ws.on("message", async (data: Buffer) => {
                let raw: unknown;
                try {
                    raw = JSON.parse(data.toString());
                } catch (e) {
                    adapter.logger.error(
                        "JSON parse failed:",
                        e,
                        "raw data:",
                        data.toString()
                    );
                    return;
                }

                const result = MilkyEventPayloadSchema.safeParse(raw);
                if (result.success) {
                    if (bot) {
                        const e = createEvent(result.data, bot);
                        if (e) {
                            adapter.sakiko.bus.publish(e);
                        }
                    } else {
                        bot = new MilkyBot(adapter, {
                            _selfId: String(result.data.self_id),
                            _apiBaseUrl: option.apiBaseUrl
                                ? new URL(option.apiBaseUrl)
                                : new URL("/api", new URL(option.baseUrl)),
                            _accessToken: accessCode
                        });

                        await bot.init();

                        adapter.logger.debug(
                            `created milky bot instance for selfId ${result.data.self_id}`
                        );

                        adapter.sakiko.bots.add(bot as ProtocolBot<any>);

                        const e = createEvent(result.data, bot);
                        if (e) {
                            adapter.sakiko.bus.publish(e);
                        }
                    }
                }
            });

            ws.on("error", (err) => {
                adapter.logger.error(
                    `websocket connection error for milky server at ${eventUrl.toString()}:`,
                    err.message
                );
            });

            ws.on("close", () => {
                if (isManualClose) {
                    return;
                }

                const shouldReconnect =
                    option.reconnectInterval > 0 &&
                    (option.maxReconnectAttempts === -1 ||
                        reconnectCount < option.maxReconnectAttempts);

                if (shouldReconnect) {
                    reconnectCount++;
                    adapter.logger.warn(
                        `attempting to reconnect to websocket server (${reconnectCount}${option.maxReconnectAttempts === -1 ? "" : `/${option.maxReconnectAttempts}`})...`
                    );

                    if (reconnectTimer) {
                        clearTimeout(reconnectTimer);
                    }

                    reconnectTimer = setTimeout(() => {
                        createConnection();
                    }, option.reconnectInterval);
                } else {
                    adapter.logger.error(
                        `failed to connect to websocket server after ${reconnectCount} attempts. giving up.`
                    );
                }
            });

            return ws;
        };

        createConnection();
    }
}
