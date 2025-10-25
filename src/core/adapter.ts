import {
	AdapterEventBusUnsetError,
	AdapterLoggerUnsetError,
} from "@/error/errors";
import type { ISakikoAdapter, ISakikoEventBus } from "./interface";
import { hasGetNamedSubLogger, type ISakikoLogger } from "@/log/interface";
import type { Sakiko } from "../framework/sakiko";
import type { ZodObject } from "zod";

export abstract class SakikoAdapter implements ISakikoAdapter {
	private eventBus!: ISakikoEventBus;
	private logger!: ISakikoLogger;
	public framework!: Sakiko;

	abstract getAdapterName(): string;

	abstract getAdapterVersion(): string;

	abstract getProtocolName(): string;

	abstract getExtraConfigSchema(): ZodObject;

	abstract init(framework: Sakiko): void | Promise<void>;

	abstract stop(): void | Promise<void>;

	abstract start(): void | Promise<void>;

	getEventBus(): ISakikoEventBus {
		if (this.eventBus !== null) {
			return this.eventBus;
		} else {
			throw new AdapterEventBusUnsetError(this.getAdapterName());
		}
	}

	setEventBus(eventBus: ISakikoEventBus): void {
		this.eventBus = eventBus;
	}

	setLogger(logger: ISakikoLogger) {
		if (logger !== null) {
			// 创建一个子日志记录器给适配器使用
			if (hasGetNamedSubLogger(logger)) {
				this.logger = logger.getNamedSubLogger(this.getAdapterName());
			} else {
				this.logger = logger;
			}
		} else {
			throw new AdapterLoggerUnsetError(this.getAdapterName());
		}
	}

	getLogger(): ISakikoLogger {
		return this.logger;
	}
}
