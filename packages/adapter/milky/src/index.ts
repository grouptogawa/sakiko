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
import { createEvent } from "./event";
import { z } from "zod";

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
    /** 是否启用 EventHook 功能，用于接收 Milky 服务器推送的事件。
     *
     * Whether to enable the EventHook feature for receiving events pushed by the Milky server.
     *
     * @default false
     */
    enableEventHook: z.boolean().optional().default(false),
    /** EventHook 服务器的主机地址。
     *
     * The host address of the EventHook server.
     *
     * @default "127.0.0.1"
     */
    eventHookHost: z.string().optional().default("127.0.0.1"),
    /** EventHook 服务器的端口号。
     *
     * The port number of the EventHook server.
     *
     * @default 8080
     */
    eventHookPort: z.number().optional().default(8080),
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

    get logger() {
        if (!this._logger) {
            throw new Error("logger has not been set for this plugin");
        }
        return this._logger;
    }

    private _config?: SakikoConfig;

    get config() {
        if (!this._config) {
            throw new Error("config has not been set for this plugin");
        }
        return this._config;
    }

    private _sakiko?: Sakiko;

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

    setLogger(logger: ILogger): void {
        this._logger = logger;
    }

    setConfig(config: SakikoConfig): void {
        this._config = config;
    }

    async onLoad(sakiko: Sakiko): Promise<void | boolean> {
        // 在适配器加载时执行的逻辑
        this._sakiko = sakiko;
    }

    async onStartUp(): Promise<void | boolean> {
        // 检查是否注入了milky的配置
        if (!this.config.milky) {
            this.logger.warn(
                "milky config is not provided, abort starting milky adapter"
            );
            return false;
        }

        // 解析配置项
        const parsedConfig = milkyOptionSchema.parse(this.config.milky);

        this.logger.debug(JSON.stringify(parsedConfig, null, 2));

        // 根据配置项启动对应类型的服务
        const {
            server,
            enableEventHook,
            eventHookHost,
            eventHookPort,
            accessToken
        } = parsedConfig;

        // 如果 server 不是数组，则包装成数组
        const serverArray = Array.isArray(server) ? server : [server];

        if (!server || serverArray.length === 0) {
            this.logger.warn("no server config provided");
            return;
        }

        for (const serverOption of serverArray) {
            switch (serverOption.mode) {
                case "ws":
                    this.logger.error("WebSocket mode is not supported yet");
                    return;
                case "sse":
                    await this.createSSEClient(serverOption, accessToken);
            }
        }
    }

    async onShutDown(): Promise<void> {
        this.logger.info(
            "Shutting down Milky adapter, closing all SSE connections..."
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
        this.logger.info("All SSE connections closed");
    }

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

        // 懒实例化bot
        const getBot = async (selfId: string) => {
            if (bot) {
                return bot;
            }
        };

        // 清理
        const cleanup = () => {
            isManualClose = true; // 标记为手动关闭，阻止重连

            // 清除重连定时器
            if (reconnectTimer) {
                clearTimeout(reconnectTimer);
                reconnectTimer = null;
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
                // 使用 globalThis.fetch 确保 Node.js 和 Bun 中都能正确访问
                return globalThis.fetch(url, {
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
                adapter.logger.info(
                    `SSE connection established for Milky server at ${eventUrl.toString()}`
                );
            };

            es.onmessage = async (event) => {
                let raw: unknown;
                try {
                    raw = JSON.parse(event.data);
                } catch (e) {
                    console.error(
                        "JSON parse failed:",
                        e,
                        "raw data:",
                        event.data
                    );
                    return;
                }
                console.log(raw);
                // 验证事件数据
                const result = MilkyEventPayloadSchema.safeParse(raw);
                console.log(result.error);
                if (result.success) {
                    // 事件数据有效，可以创建事件
                    if (bot) {
                        const e = createEvent(result.data, bot);
                        console.log(e?.payload);
                    } else {
                        // 这个连接对应的机器人实例还没有被创建
                        // 当前连接的机器人实例没有被初始化

                        bot = new MilkyBot(adapter, {
                            _selfId: String(result.data.self_id),
                            _apiBaseUrl: option.eventBaseUrl
                                ? new URL(option.eventBaseUrl)
                                : new URL("/api", new URL(option.baseUrl)),
                            _accessToken: accessCode
                        });

                        await bot.init(); // 触发获取信息用的初始化方法

                        adapter.logger.debug(
                            `created milky bot instance for selfId ${result.data.self_id}`
                        );

                        // 将机器人实例的引用挂到框架上
                        this.sakiko.bots.set(
                            String(result.data.self_id),
                            bot as ProtocolBot<any>
                        );
                    }
                }
            };

            es.onerror = (err) => {
                adapter.logger.error(
                    `SSE connection error for Milky server at ${eventUrl.toString()}:`,
                    err
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
}
