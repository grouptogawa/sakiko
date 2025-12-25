import type { ILogger } from "@togawa-dev/utils";
import { Logger } from "tslog";
import chalk from "chalk";

// Sakiko 默认使用基于 tslog 实现的终端日志记录器。
// 默认的日志记录器实现仅提供了基础的日志记录功能，用户可以通过实现 ISakikoLogger 接口来自定义日志记录器。

const customLogLevelNames: Record<number, string> = {
    0: "SILLY",
    1: "TRACE",
    2: "DEBUG",
    3: "INFO_",
    4: "WARN_",
    5: "ERROR",
    6: "FATAL"
};

function createTSLogger(logLevel: number = 3): ILogger {
    return new Logger({
        minLevel: logLevel,
        prettyLogTemplate: `{{mm}}.{{dd}} {{hh}}:{{MM}}:{{ss}} {{logLevelName}} `,
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

export function createDefaultLogger(logLevel: number = 3): ILogger {
    const _logger = createTSLogger(logLevel);
    return {
        trace: (...args: any[]) => _logger.trace(chalk.cyanBright(...args)),
        debug: (...args: any[]) => _logger.debug(chalk.gray(...args)),
        info: (...args: any[]) => _logger.info(...args),
        warn: (...args: any[]) => _logger.warn(chalk.yellow(...args)),
        error: (...args: any[]) => _logger.error(chalk.red(...args))
    };
}

export function normalizeLogLevel(
    logLevel: number | string | undefined
): number {
    if (typeof logLevel === "number") {
        return logLevel ? Math.min(Math.max(logLevel, 0), 6) : 3; // 默认 INFO 级别
    } else if (typeof logLevel === "string") {
        const level = logLevel.toLowerCase();
        switch (level) {
            case "silly":
                return 0;
            case "trace":
                return 1;
            case "debug":
                return 2;
            case "info":
                return 3;
            case "warn":
            case "warning":
                return 4;
            case "error":
                return 5;
            case "fatal":
                return 6;
            default:
                return 3; // 默认 INFO 级别
        }
    } else {
        return 3; // 默认 INFO 级别
    }
}
