import type { INullBotLogger } from "@/log/interface";
import type {
	INullBotAdapter,
	INullBotEventBus,
	INullBotPlugin,
} from "./interface";
import hasGetNamedSubLogger from "@/log/interface";

class NullBot {
	logger: INullBotLogger;
	eventBus: INullBotEventBus;
	config: Record<string, any>;

	adapters: Map<string, INullBotAdapter> = new Map();
	plugins: Map<string, INullBotPlugin> = new Map();

	constructor(
		conf: Record<string, any>,
		logger: INullBotLogger,
		eventBus: INullBotEventBus,
	) {
		this.config = conf;
		this.logger = logger;
		this.eventBus = eventBus;
	}

	getLogger(name?: string): INullBotLogger {
		if (!name) {
			return this.logger; // 如果没有传入名称，直接返回原始logger
		}

		if (!hasGetNamedSubLogger(this.logger)) {
			return this.logger; // 如果类型守卫检测不通过，直接返回原始logger
		}
		return this.logger.getNamedSubLogger(name); // 返回具有指定名称的子日志记录器
	}

	addAdapter(adapter: INullBotAdapter): void {}

	addPlugin(plugin: INullBotPlugin): void {}
}

export default NullBot;
