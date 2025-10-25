import type { ISakikoLogger } from "@/log/interface";
import type {
	ISakikoAdapter,
	ISakikoEventBus,
	ISakikoPlugin,
} from "@/core/interface";
import { hasGetNamedSubLogger } from "@/log/interface";
import { ZodError, type ZodObject } from "zod";
import { mergeZodObjects } from "@/config/merger";
import { SakikoConfigSchema } from "@/config/sakiko-config";
import picocolors from "picocolors";

export class Sakiko {
	logger: ISakikoLogger;
	eventBus: ISakikoEventBus;

	rawConfig: Record<string, any>;
	config: Record<string, any>;
	extraSchemas: Array<ZodObject> = [];

	adapters: Map<string, ISakikoAdapter> = new Map();
	plugins: Map<string, ISakikoPlugin> = new Map();

	constructor(
		conf: Record<string, any>,
		rawConf: Record<string, any>,
		logger: ISakikoLogger,
		eventBus: ISakikoEventBus,
	) {
		this.config = conf;
		this.rawConfig = rawConf;
		this.logger = logger;
		this.eventBus = eventBus;
	}

	getLogger(name?: string): ISakikoLogger {
		if (!name) {
			return this.logger; // 如果没有传入名称，直接返回原始logger
		}

		if (!hasGetNamedSubLogger(this.logger)) {
			return this.logger; // 如果类型守卫检测不通过，直接返回原始logger
		}
		return this.logger.getNamedSubLogger(name); // 返回具有指定名称的子日志记录器
	}

	addAdapter(adapter: ISakikoAdapter): void {
		// 将适配器注册到框架中
		this.adapters.set(adapter.getAdapterName(), adapter);
		// 如果适配器提供了额外的配置项schema，则将其加入到框架的extraSchemas中
		if (adapter.getExtraConfigSchema()) {
			this.extraSchemas.push(adapter.getExtraConfigSchema());
			this.logger.debug(
				`适配器 ${picocolors.green(adapter.getAdapterName())} 的配置项已被注册到 Sakiko 中`,
			);
		}
		this.logger.info(
			`适配器 ${picocolors.green(adapter.getAdapterName())}@${picocolors.blue(adapter.getAdapterVersion())} 已被注册到 Sakiko 中，协议类型为 ${picocolors.yellow(adapter.getProtocolName())}`,
		);
	}

	addPlugin(plugin: ISakikoPlugin): void {}

	getConfig(key: string): any | null {
		return this.config[key];
	}

	getConfigSafely<T>(key: string, defaultValue: T): T {
		const value = this.config[key];
		if (value === undefined || value === null) {
			// 首先尝试从原始配置中获取
			const rawValue = this.rawConfig[key];
			if (rawValue !== undefined && rawValue !== null) {
				// 如果原始配置中存在该值，则返回原始值
				return rawValue as T;
			} else {
				this.logger.debug(
					`获取配置项 ${key} 失败，将使用默认值 ${defaultValue} 替代`,
				);
			}
			return defaultValue;
		}
		return value as T;
	}

	run(): void {
		// 启动前首先将配置项进行合并并进行第二次配置校验
		if (this.extraSchemas.length > 0) {
			this.logger.debug("正在合并配置项...");
			const mergedSchema = mergeZodObjects([
				SakikoConfigSchema,
				...this.extraSchemas,
			]);
			// 校验配置项
			try {
				const parsedConfig = mergedSchema.parse(this.rawConfig);
				// 校验成功，更新配置项
				this.config = parsedConfig;
				this.logger.debug("合并后的配置项校验完成");
			} catch (e) {
				if (e instanceof ZodError) {
					this.logger.error("配置项校验失败，详情如下：");
					for (const issue of e.issues) {
						this.logger.error(
							`路径: ${issue.path.join(
								".",
							)}，错误信息: ${issue.message}`,
						);
					}
					this.logger.warn(
						"由于校验配置项失败，Sakiko 无法判断传入的配置项是否正确，这可能导致框架中的适配器和插件在运行时出现异常！",
					);
				}
			}
		}
		// 开始进行启动流程
		// 首先初始化所有适配器
		for (const [name, adapter] of this.adapters) {
			this.logger.debug(`开始加载适配器 ${picocolors.green(name)} ...`);
			try {
				adapter.init(this);
				adapter.start();
				this.logger.info(
					picocolors.green(`适配器 ${picocolors.green(name)} 已加载`),
				);
			} catch (e) {
				this.logger.error(
					`适配器 ${picocolors.green(name)} 加载失败：`,
					e,
				);
			}
		}
	}
}
