import type { ISakikoLogger } from "@/log/interface";
import { type EventHandler } from "./handler";
import type { Sakiko } from "@/framework/sakiko";

/**
 * ISakikoEvent Sakiko使用的事件接口，实现该接口的数据都可以在事件总线上传递
 * @interface ISakikoEvent
 */
export interface ISakikoEvent {
	getId(): string;

	getTimestamp(): number;

	getProtocol(): string;

	getSenderId(): string;

	getSelfId(): string;

	getTypes(): number[];

	isType(target: number | number[]): boolean;

	toString(): string;
}

/** ISakikoBot Sakiko的Bot接口，由适配器实现其具体功能
 * @interface ISakiko
 */
export interface ISakikoBot {
	/** 获取当前Bot自身的Id */
	getSelfId(): string | null;
	/** 获取当前Bot所使用的协议名称 */
	getProtocolName(): string;

	/** 调用Bot的API接口
	 *
	 * @param api
	 * @param params
	 */
	callApi<TParams extends Record<string, any>>(
		api: string,
		params: TParams,
	): Promise<ISakikoCallApiResult>;

	callApi<TParams extends Record<string, any>, TResult>(
		api: string,
		params: TParams,
	): Promise<ISakikoCallApiResult<TResult>>;

	// sendMessage(): void; // 发送消息的部分暂时没有想好怎么实现
	// onCallingApi(): void; // 调用API时的钩子，暂时没有想好怎么实现
}

/** ISakikoCallApiResult Sakiko调用API接口的结果封装
 * @interface ISakikoCallApiResult
 */
export interface ISakikoCallApiResult<TResult = unknown> {
	/** 判断API调用是否成功 */
	isSuccess(): boolean;
	/** 获取API调用的状态码 */
	getStatus(): number;
	/** 获取API调用返回的数据 */
	getData(): TResult;
}

/** 事件总线接口定义
 * @interface IEventBus
 */
export interface ISakikoEventBus {
	/** 获取事件总线名称 */
	getBusName(): string;

	/**
	 * 注册事件处理器
	 * @param handler 事件处理器
	 * @returns 取消注册的函数
	 */
	register(handler: EventHandler): () => void;

	/**
	 * 取消注册事件处理器
	 * @param handler 已注册的事件处理器
	 */
	unregister(handler: EventHandler): void;

	/**
	 * 发布事件
	 * @param event 要发布的事件
	 */
	publish(event: ISakikoEvent): Promise<void>;
}

export interface ISakikoAdapter {
	getAdapterName(): string;
	getAdapterVersion(): string;
	getProtocolName(): string;

	init(framework: Sakiko): void | Promise<void>;
	start(): void | Promise<void>;
	setLogger(logger: ISakikoLogger): void;
	getLogger(): ISakikoLogger;
	getEventBus(): ISakikoEventBus;
	setEventBus(eventBus: ISakikoEventBus): void;
}

export interface ISakikoPlugin {
	getPlginName(): string;
}
