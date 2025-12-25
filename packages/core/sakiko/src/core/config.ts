import type { ILogger } from "@togawa-dev/utils";

/**
 * 用于让插件扩展 Sakiko 的配置项扩展接口
 *
 * Used for plugins to extend Sakiko's configuration options
 */
export interface SakikoConfigExtension {}

// TypeScript 中可以通过 declaration merging 实现接口的扩展
// 例如，插件可以通过以下方式扩展 SakikoConfig 接口：
// ```typescript
// declare module "sakiko" {
//     interface SakikoConfigExtension {
//         foo?: {
//             bar: string;
//         };
//     }
// }
// ```

/**
 * Sakiko 的配置项接口
 *
 * The configuration options interface for Sakiko
 */
export type SakikoConfig = {
    /**
     * 用于标识当前运行的工作线程 ID，防止 snowflake ID 冲突。
     *
     * The worker ID to identify the current running worker thread, to prevent snowflake ID conflicts.
     *
     * @default 1
     */
    workerId?: number;

    /**
     * 自定义日志记录器，如果传入此选项，Sakiko 将使用该日志记录器替换默认的 tslog 日志记录器。
     *
     * The custom logger to use. If provided, Sakiko will replace the default tslog logger with this one.
     *
     * @default built-in default logger
     */
    logger?: ILogger;

    /**
     * 日志记录器的日志级别，仅在使用默认日志记录器时有效。
     *
     * 可以传入 0-6 的数字，或者以下字符串之一（不区分大小写）：
     * - "silly" (0)
     * - "trace" (1)
     * - "debug" (2)
     * - "info"  (3)
     * - "warn"  (4)
     * - "error" (5)
     * - "fatal" (6)
     *
     * The log level for the logger. Only effective when using the default logger.
     *
     * Can be a number from 0 to 6, or one of the following strings (case insensitive):
     * - "silly" (0)
     * - "trace" (1)
     * - "debug" (2)
     * - "info"  (3)
     * - "warn"  (4)
     * - "error" (5)
     * - "fatal" (6)
     *
     * @default 3
     */
    logLevel?: number | string;
} &
    // 用于让插件扩展 Sakiko 的配置项
    SakikoConfigExtension;

/**
 * 直接定义 Sakiko 的配置项，带有类型提示
 * @param conf 配置项对象
 * @returns 传入的配置项对象
 */
export function defineConfig<Config extends SakikoConfig>(conf: Config) {
    return conf;
}
