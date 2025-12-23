import type {
    Sakiko,
    SakikoAdapter,
    SakikoConfig,
    SakikoConfigExtension
} from "@togawa-dev/sakiko";

import type { ILogger } from "@togawa-dev/utils";
import { VERSION } from "./global";
import { z } from "zod";

export const baseUrlOptionSchema = z.object({
    /** Milky 服务器的基础 URL，用于构建 API 和事件的完整 URL 地址。
     *
     * The base URL of the Milky server, used to construct the full URL addresses for APIs and events.
     *
     * @default "https://127.0.0.1:3000"
     */
    baseUrl: z.url().optional().default("https://127.0.0.1:3000"),
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
    mode: z.enum(["ws", "sse"]).optional().default("sse")
});

export type baseUrlOption = z.input<typeof baseUrlOptionSchema>;

declare module "@togawa-dev/sakiko" {
    interface SakikoConfigExtension {
        /** Milky 协议适配器的配置项 / The configuration options for the Milky protocol adapter */
        milky?: {
            /** Milky 服务的基础 URL 配置，可以是单个 URL 或 URL 数组。
             *
             * The base URL configuration for the Milky service, can be a single URL or an array of URLs.
             *
             * @default { baseUrl: "https://127.0.0.1:3000" }
             */
            server: baseUrlOption | baseUrlOption[];

            /** 是否启用 EventHook 功能，用于接收Milky服务器推送的事件。
             *
             * Whether to enable the EventHook feature for receiving events pushed by the Milky server.
             *
             * @default false
             */
            enableEventHook?: boolean;

            /** EventHook 服务器的主机地址。
             *
             * The host address of the EventHook server.
             *
             * @default "127.0.0.1"
             */
            eventHookHost?: string;

            /** EventHook 服务器的端口号。
             *
             * The port number of the EventHook server.
             *
             * @default 8080
             */
            eventHookPort?: number;

            /** 和 Milky 服务器通信时使用的访问令牌。
             *
             * The access token used for communication with the Milky server.
             *
             * @default undefined
             */
            accessToken?: string;
        };
    }
}

export class Milky implements SakikoAdapter {
    readonly pluginId = "adapter-milky";
    readonly pluginDisplayName = "Milky";
    readonly pluginVersion = VERSION;
    readonly pluginAuthor = "machinacanis";
    readonly pluginDescription = "sakiko's milky protocol adapter";
    readonly pluginDependencies = [];

    readonly platformName = "qqnt";
    readonly protocolName = "milky";

    private _logger?: ILogger;
    private _config?: SakikoConfig;

    private _sakiko?: Sakiko;

    setLogger(logger: ILogger): void {
        this._logger = logger;
    }

    setConfig(config: SakikoConfig): void {
        this._config = config;
    }

    get logger() {
        if (!this._logger) {
            throw new Error("logger has not been set for this plugin");
        }
        return this._logger;
    }

    get config() {
        if (!this._config) {
            throw new Error("config has not been set for this plugin");
        }
        return this._config;
    }

    get sakiko() {
        if (!this._sakiko) {
            throw new Error("sakiko has not been injected for this plugin");
        }
        return this._sakiko;
    }

    async onLoad(sakiko: Sakiko): Promise<void | boolean> {
        // 在适配器加载时执行的逻辑
        this._sakiko = sakiko;
    }

    async onStartUp(): Promise<void | boolean> {
        // 根据配置确定要启动的 ws worker
        // 根据配置确定要启动的 sse worker
    }

    async onShutDown(): Promise<void> {}
}
