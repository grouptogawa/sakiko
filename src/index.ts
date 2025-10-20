import NullBotConfigSchema from "./config/nullbot-config.js";
import type { NullBotConfig } from "./config/nullbot-config.js";
import * as z from "zod";
import newLogger from "./log/logger";
import pc from "picocolors";
import type { INullBotEventBus } from "./core/interface.js";
import NullBotEventBus from "./bus/bus.js";
import NullBot from "./core/nullbot.js";

/** NullBot的初始化入口
 * @param config 配置项（可选）
 * @param eventBus 事件总线实例（可选）
 */
function init(
	config?: Record<string, any>,
	eventBus?: INullBotEventBus,
): NullBot {
	let confParsedFlag = true; // 配置是否成功解析
	let nullBotConf: Record<string, any>; // 解析后的内置配置部分
	let zodParsedError: z.ZodError; // 可能产生的异常

	if (config) {
		// 第一遍配置解析，只解析NullBot预置的配置结构
		try {
			nullBotConf = NullBotConfigSchema.parse(config);
		} catch (e) {
			confParsedFlag = false;
			if (e instanceof z.ZodError) {
				// 配置解析失败，使用默认值替代
				zodParsedError = e;
				nullBotConf = NullBotConfigSchema.parse({});
			} else {
				throw e;
			}
		}
	} else {
		// 没有传入任何配置，使用默认配置项
		nullBotConf = NullBotConfigSchema.parse({});
	}

	// 基于配置项初始化日志记录器
	let logger = newLogger(nullBotConf);

	if (!confParsedFlag) {
		logger.error(
			pc.red("读取机器人配置时遇到错误，将使用默认的机器人配置"),
			zodParsedError!,
		);
	}
	logger.debug(pc.green("机器人配置已加载"), JSON.stringify(nullBotConf));

	logger.info("正在初始化 NullBot...");

	// 事件总线的初始化流程

	if (!eventBus) {
		// 如果没有传入事件总线实例，那么初始化一个NullBot内置的事件总线实例
		eventBus = new NullBotEventBus(logger);
		logger.debug("未传入事件总线实例，将会初始化内置的事件总线");
	}

	logger.debug(pc.green(eventBus.getBusName()), "类型的事件总线已被成功载入");

	// 初始化Bot实例
	let botInstance = new NullBot(nullBotConf, logger, eventBus);

	// logger.info("NullBot 初始化完成");

	return botInstance;
}

// 导出
export { init };
export { NullBotConfigSchema, type NullBotConfig };
