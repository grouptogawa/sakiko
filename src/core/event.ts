import type { SakikoBot } from "./bot";
import { UmiriEvent } from "@grouptogawa/umiri";
import { sf } from "@/utils/snowflake";

/**
 * Sakiko 事件基类，一般来讲所有消息事件均应继承自此类。
 *
 * the base class for all Sakiko events.
 *
 * @template Payload 事件负载类型 / The type of the event payload
 * @abstract
 */
export class SakikoEvent<
    Payload extends object = any,
    Bot extends SakikoBot<any> = SakikoBot<any>
> extends UmiriEvent<Payload> {
    // 生成一个自增且唯一的事件 ID
    protected readonly _id = sf.bigint();
    protected readonly _createdAt = Date.now();
    protected _selfId: string;
    protected _bot: Bot;

    constructor(bot: Bot, payload: Payload) {
        super(payload);
        this._selfId = bot.selfId;
        this._bot = bot;
    }

    /**
     * 获取所属的机器人实例。
     *
     * get the bot instance.
     *
     * @returns 机器人实例 / The bot instance
     */
    getBot(): Bot {
        return this._bot;
    }

    /**
     * 获取事件 ID。
     *
     * get the event ID.
     *
     * @returns 事件 ID / The event ID
     */
    getEventId(): bigint {
        return this._id;
    }

    /**
     * 获取事件创建时间戳。
     *
     * get the event creation timestamp.
     * @returns 事件创建时间戳 / The event creation timestamp
     */
    getCreatedAt(): number {
        return this._createdAt;
    }

    /**
     * 获取自身 ID。
     *
     * get the self ID.
     *
     * @returns 自身 ID / The self ID
     */
    getSelfId(): string {
        return this._selfId;
    }

    /**
     * 获取完整事件负载。
     *
     * get the event payload.
     *
     * @returns 事件负载 / The event payload
     */
    get payload(): Payload {
        return this.getPayload();
    }
}

// 下面是可选的接口预定义，方便扩展出可以使用通用的处理器生成器的事件类型

export interface hasSender {
    getSenderId(): string;
}

export interface Targetable {
    mentioned(userId: string): boolean;
    mentionedMe(): boolean;
}

export interface Messageable {
    summary(): string;
    plaintext(): string;
}
