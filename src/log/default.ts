import type { ISakikoLogger } from "./interface";
import { Logger } from "tslog";

// Sakiko 默认使用基于 tslog 实现的终端日志记录器。
// 默认的日志记录器实现仅提供了基础的日志记录功能，用户可以通过实现 ISakikoLogger 接口来自定义日志记录器。
// 或者你也可以选择使用 @togawa-dev/anon 包中提供的可选的 Winston 日志记录器实现。

const customLogLevelNames: Record<number, string> = {
    0: "SILLY",
    1: "TRACE",
    2: "DEBUG",
    3: "INFO_",
    4: "WARN_",
    5: "ERROR",
    6: "FATAL"
};

/**
 * 创建一个默认的 Sakiko 日志记录器实例，基于 tslog 实现。
 *
 * create a default Sakiko logger instance, based on tslog.
 * @param logLevel - 日志记录器的最小日志级别，默认为 2（DEBUG 级别）。
 *                   the minimum log level for the logger, default is 2 (DEBUG level).
 * @returns 默认的 Sakiko 日志记录器实例 / the default Sakiko logger instance
 * @since 0.4.0
 */
export function createDefaultLogger(logLevel: number = 3): ISakikoLogger {
    return new Logger({
        minLevel: logLevel,
        prettyLogTemplate: `{{mm}}.{{dd}} {{hh}}:{{MM}}:{{ss}} [{{logLevelName}}] `,
        overwrite: {
            addPlaceholders: (logObjMeta, placeholderValues) => {
                // 获取原始日志级别
                const originalLevel = logObjMeta.logLevelId;
                placeholderValues["logLevelName"] =
                    customLogLevelNames[originalLevel] || "UNKNOWN";
            }
        },
        prettyLogStyles: {
            logLevelName: {
                "*": ["bold", "black", "bgWhiteBright", "dim"],
                SILLY: ["bold", "white"],
                TRACE: ["bold", "whiteBright"],
                DEBUG: ["bold", "green"],
                INFO_: ["bold", "blue"],
                WARN_: ["bold", "yellow"],
                ERROR: ["bold", "red"],
                FATAL: ["bold", "redBright"]
            }
        }
    });
}
