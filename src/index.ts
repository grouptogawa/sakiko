import SakikoConfigSchema from "./config/sakiko-config";
import type { SakikoConfig } from "./config/sakiko-config";
import type { ISakikoLogger } from "./log/interface";
import hasGetNamedSubLogger from "./log/interface";
import * as z from "zod";
import newLogger from "./log/logger";
import ExtendedTSLogger from "./log/logger";
import pc from "picocolors";
import { SakikoEventBus } from "./bus/bus";
import Sakiko from "./core/sakiko";
import type {
	ISakikoEvent,
	ISakikoBot,
	ISakikoCallApiResult,
	ISakikoAdapter,
	ISakikoEventBus,
	ISakikoPlugin,
} from "./core/interface";

import SakikoAdapter from "./core/adapter";
import SakikoEvent from "./core/event";
import type { EventHandler } from "./core/handler";
import { snowflakeIdBase36, snowflakeIdBase36Unsafe } from "./utils/snowflake";

/** Sakiko的初始化入口
 * @param config 配置项（可选）
 * @param eventBus 事件总线实例（可选）
 */
function init(
	config?: Record<string, any>,
	eventBus?: ISakikoEventBus,
): Sakiko {
	let confParsedFlag = true; // 配置是否成功解析
	let SakikoConf: Record<string, any>; // 解析后的内置配置部分
	let zodParsedError: z.ZodError; // 可能产生的异常

	if (config) {
		// 第一遍配置解析，只解析Sakiko预置的配置结构
		try {
			SakikoConf = SakikoConfigSchema.parse(config);
		} catch (e) {
			confParsedFlag = false;
			if (e instanceof z.ZodError) {
				// 配置解析失败，使用默认值替代
				zodParsedError = e;
				SakikoConf = SakikoConfigSchema.parse({});
			} else {
				throw e;
			}
		}
	} else {
		// 没有传入任何配置，使用默认配置项
		SakikoConf = SakikoConfigSchema.parse({});
	}

	// 基于配置项初始化日志记录器
	let logger = newLogger(SakikoConf);

	if (!confParsedFlag) {
		logger.error(
			pc.red("读取机器人配置时遇到错误，将使用默认的机器人配置"),
			zodParsedError!,
		);
	}
	logger.debug(pc.green("机器人配置已加载"), JSON.stringify(SakikoConf));

	logger.info("正在初始化 Sakiko...");

	// 事件总线的初始化流程

	if (!eventBus) {
		// 如果没有传入事件总线实例，那么初始化一个Sakiko内置的事件总线实例
		eventBus = new SakikoEventBus(logger);
		logger.debug("未传入事件总线实例，将会初始化内置的事件总线");
	}

	logger.debug(pc.green(eventBus.getBusName()), "类型的事件总线已被成功载入");

	// 初始化Bot实例
	let botInstance = new Sakiko(SakikoConf, logger, eventBus);

	// logger.info("Sakiko 初始化完成");

	return botInstance;
}

// 导出
export { init };
export { type ISakikoLogger, hasGetNamedSubLogger, ExtendedTSLogger }; // log
export { SakikoConfigSchema, type SakikoConfig }; // config
export {
	Sakiko,
	type ISakikoEvent,
	type ISakikoBot,
	type ISakikoCallApiResult,
	type ISakikoAdapter,
	type ISakikoEventBus,
	type ISakikoPlugin,
	SakikoAdapter,
	SakikoEvent,
	type EventHandler,
}; // core
export { SakikoEventBus }; // bus
export { snowflakeIdBase36, snowflakeIdBase36Unsafe }; // utils
