import type { UmiriBot } from "./bot";

/**
 * Umiri 事件总线中传递的事件基类，通过携带负载数据及其类型信息，实现类型安全的事件传递。
 *
 * 事件在处理过程中是不可变的，可以通过 copy 和 update 方法创建新的事件实例并替换。
 *
 * The base class for events passed in the Umiri event bus, which carries payload data and its type information to achieve type-safe event transmission.
 *
 * Events passed in Umiri are immutable during processing, and new event instances can be created and replaced through the copy and update methods.
 *
 * @template Payload 事件负载数据类型 / Event payload data type
 */
export abstract class UmiriEvent<Payload, Bot extends UmiriBot> {
    constructor(
        protected readonly _payload: Payload,
        protected readonly _bot: Bot
    ) {}

    /** 获取事件负载数据 / Get event payload data */
    get payload(): Payload {
        return this._payload;
    }

    /** 获取事件所属的机器人实例 / Get the bot instance to which the event belongs */
    get bot(): Bot {
        return this._bot;
    }

    /** 创建当前事件的副本 / Create a copy of the current event */
    copy(): this {
        const Ctor = this.constructor as new (
            payload: Payload,
            bot: Bot
        ) => this;
        return new Ctor(this._payload, this._bot);
    }

    /** 使用部分负载数据更新当前事件，返回一个新的事件实例 / Update the current event with partial payload data, returning a new event instance */
    update(partial: Partial<Payload>): this {
        const Ctor = this.constructor as new (
            payload: Payload,
            bot: Bot
        ) => this;
        return new Ctor({ ...this._payload, ...partial }, this._bot);
    }
}

/**
 * Umiri 事件构造器类型
 *
 * The constructor type of Umiri events
 *
 * @template T 事件类型 / Event type
 */
export type UmiriEventConstructor<T extends UmiriEvent<any, any>> = new (
    ...args: any[]
) => T;

/** 从事件类型中提取对应的机器人类型 / Extract the corresponding bot type from the event type */
export type ExtractBotType<E> = E extends UmiriEvent<any, infer B> ? B : never;
