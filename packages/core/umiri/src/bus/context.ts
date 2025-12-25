import { SnowFlake } from "@togawa-dev/utils/snowflake";
import type { UmiriBot } from "./bot";
import type { UmiriEventConstructor, UmiriEvent } from "./event";
import { createContext } from "@togawa-dev/utils/context";

/**
 * Umiri 框架中使用的上下文对象类型
 *
 * The context object type used in the Umiri framework
 * @template Bot 机器人类型 / Bot type
 * @template Events 事件类型 / Event type
 */
export type UmiriContext<
    Bot extends UmiriBot,
    Events extends UmiriEvent<any, Bot>[]
> = Readonly<{
    processId: string;

    bot: Bot;
    event: Events[number];

    get selfId(): string;
    get nickname(): string;
    get payload(): Events[number]["payload"];
    isEvent(...eventConstructors: UmiriEventConstructor<any>[]): boolean;
}>;

/**
 * 创建 Umiri 框架使用的上下文对象
 *
 * Creates a context object used in the Umiri framework
 *
 * @param bot 机器人实例 / Bot instance
 * @param event 事件实例 / Event instance
 * @param snowflakeIns 用于生成唯一进程 ID 的 SnowFlake 实例 / SnowFlake instance used to generate unique process ID
 * @template Bot 机器人类型 / Bot type
 * @template Events 事件类型 / Event type
 * @returns Umiri 框架使用的上下文对象 / Context object used in the Umiri framework
 */
export function createUmiriContext<
    Bot extends UmiriBot,
    Events extends UmiriEvent<any, Bot>[]
>(
    snowflakeIns: SnowFlake,
    bot: Bot,
    event: Events[number]
): UmiriContext<Bot, Events> {
    return createContext({
        processId: snowflakeIns.base36(),
        bot,
        event,

        get selfId() {
            return bot.selfId;
        },
        get nickname() {
            return bot.nickname;
        },
        get payload() {
            return event.payload;
        },
        isEvent(...eventConstructors) {
            return eventConstructors.some((Ctor) => event instanceof Ctor);
        }
    });
}
