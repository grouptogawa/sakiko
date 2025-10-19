import { type EventHandler } from "./handler";

/**
 * INullBotEvent NullBot使用的事件接口，实现该接口的数据都可以在事件总线上传递
 * @interface INullBotEvent
 */
interface INullBotEvent {
	/** 事件唯一标识符 */
	id: string;
	/** 事件发起时间戳 */
	timestamp: number;
	/** 事件类型 */
	type: number;

	/** 判断事件类型是否匹配
	 * @param type 事件类型
	 * @returns 是否匹配
	 */
	isType(event: INullBotEvent | number): boolean;
}

/** INullBot NullBot的Bot接口，由适配器实现其具体功能
 * @interface INullBot
 */
interface INullBot {
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
	): Promise<INullBotCallApiResult>;

	callApi<TParams extends Record<string, any>, TResult>(
		api: string,
		params: TParams,
	): Promise<INullBotCallApiResult<TResult>>;

	// sendMessage(): void; // 发送消息的部分暂时没有想好怎么实现
	// onCallingApi(): void; // 调用API时的钩子，暂时没有想好怎么实现
}

/** INullBotCallApiResult NullBot调用API接口的结果封装
 * @interface INullBotCallApiResult
 */
interface INullBotCallApiResult<TResult = unknown> {
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
interface IEventBus {
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
	publish(event: INullBotEvent): Promise<void>;
}

export type { INullBotEvent, INullBot, INullBotCallApiResult, IEventBus };
