import { SakikoConfigSchema } from "@/config/sakiko-config";
import * as z from "zod";
import { newLogger } from "@/log/logger";
import pc from "picocolors";
import { SakikoEventBus } from "@/bus/bus";
import { Sakiko } from "@/framework/sakiko";
import type { ISakikoEventBus } from "@/core/interface";

/** Sakiko的初始化入口，允许传入自定义的事件总线实例
 * @param config 配置项（可选）
 * @param eventBus 事件总线实例（可选）
 */
export function initSakikoWithCustomEventBus(
	eventBus: ISakikoEventBus | null,
	...config: Record<string, any>[]
): Sakiko {
	let confParsedFlag = true; // 配置是否成功解析
	let SakikoConf: Record<string, any> = {}; // 解析后的内置配置部分
	let mergedConfig: Record<string, any> = {}; // 合并后的配置项
	let zodParsedError: z.ZodError; // 可能产生的异常

	if (config) {
		// 合并所有传入的配置项
		for (let confPart of config) {
			mergedConfig = { ...mergedConfig, ...confPart };
		}
		// 第一遍配置解析，只解析Sakiko预置的配置结构
		try {
			SakikoConf = SakikoConfigSchema.parse(mergedConfig);
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
	}

	logger.debug(pc.green(eventBus.getBusName()), "类型的事件总线已被成功载入");

	// 初始化框架实例
	let framework = new Sakiko(SakikoConf, mergedConfig, logger, eventBus);

	// logger.info("Sakiko 初始化完成");

	return framework;
}

/** Sakiko的初始化入口
 * @param config 配置项（可选）
 */
export function initSakiko(...config: Record<string, any>[]): Sakiko {
	return initSakikoWithCustomEventBus(null, ...config);
}

export * from "@/core/interface";
export * from "@/core/event";
export * from "@/core/adapter";
export * from "@/core/handler";
export * from "@/core/plugin";
export * from "@/log/interface";
export * from "@/log/logger";
export * from "@/bus/bus";
export * from "@/config/sakiko-config";
export * from "@/config/merger";
export * from "@/utils/snowflake";
export * from "@/error/errors";
export * from "@/framework/sakiko";
