import { Logger, type ILogObj } from "tslog";
import type { ISakikoLogger } from "./interface";

class ExtendedTSLogger extends Logger<ILogObj> implements ISakikoLogger {
	getNamedSubLogger(name: string): ISakikoLogger {
		return this.getSubLogger({ name: name });
	}
}

function newLogger(conf: Record<string, any>): ISakikoLogger {
	// 如果没有读取到配置项则自动Fallback
	let logLevel: number = conf["logLevel"] ?? 3;
	let enbalePrettyLogger: boolean = conf["enablePrettyLogger"] ?? true;
	let enableConsoleLogger: boolean = conf["enableConsoleLogger"] ?? true;
	let enablePathLogging: boolean = conf["enablePathLogging"] ?? false;

	// 日志记录器实例
	let logger: Logger<ILogObj>;

	// 是否禁用控制台输出
	if (enableConsoleLogger) {
		if (enbalePrettyLogger) {
			// 自定义日志级别名称映射
			const customLogLevelNames: Record<number, string> = {
				0: "SILLY",
				1: "TRACE",
				2: "DEBUG",
				3: "INFO_",
				4: "WARN_",
				5: "ERROR",
				6: "FATAL",
			};
			logger = new Logger({
				name: "sakiko",
				type: "pretty",
				minLevel: logLevel,
				prettyLogTemplate: `{{mm}}.{{dd}} {{hh}}:{{MM}}:{{ss}} [{{logLevelName}}]${enablePathLogging ? " [{{filePathWithLine}}]" : ""} [{{name}}] `,
				overwrite: {
					addPlaceholders: (logObjMeta, placeholderValues) => {
						// 获取原始日志级别
						const originalLevel = logObjMeta.logLevelId;
						placeholderValues["logLevelName"] =
							customLogLevelNames[originalLevel] || "UNKNOWN";
					},
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
						FATAL: ["bold", "redBright"],
					},
				},
			});
		} else {
			logger = new ExtendedTSLogger({
				type: "json",
				hideLogPositionForProduction: true,
				minLevel: logLevel,
			});
		}
	} else {
		logger = new ExtendedTSLogger({
			type: "hidden",
			hideLogPositionForProduction: true,
			minLevel: logLevel,
		});
	}
	return logger;
}

export default newLogger;
export { ExtendedTSLogger };
