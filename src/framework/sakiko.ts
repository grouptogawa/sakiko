import type { ISakikoLogger } from "@/log/interface";
import type {
	ISakikoAdapter,
	ISakikoEventBus,
	ISakikoPlugin,
} from "@/core/interface";
import { hasGetNamedSubLogger } from "@/log/interface";

export class Sakiko {
	logger: ISakikoLogger;
	eventBus: ISakikoEventBus;
	config: Record<string, any>;

	adapters: Map<string, ISakikoAdapter> = new Map();
	plugins: Map<string, ISakikoPlugin> = new Map();

	constructor(
		conf: Record<string, any>,
		logger: ISakikoLogger,
		eventBus: ISakikoEventBus,
	) {
		this.config = conf;
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

	addAdapter(adapter: ISakikoAdapter): void {}

	addPlugin(plugin: ISakikoPlugin): void {}
}
