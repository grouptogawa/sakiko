import type {
    EventConstructor,
    EventHandler,
    HandlerContextConstructor,
    IHandlerContext
} from "@togawa-dev/umiri";

import { Sakiko } from "./sakiko";
import type { SakikoBot } from "../core/bot";
import { SakikoEvent } from "./event";

/**
 * 事件匹配器构建器接口
 *
 * Event matcher builder interface
 */
export interface IMatcherBuilder<
    Bot extends SakikoBot<any>,
    Context extends IHandlerContext,
    Events extends SakikoEvent<any, Bot>[]
> {
    ct: HandlerContextConstructor<Context>;
    ets: { [K in keyof Events]: EventConstructor<Events[K]> };
    build(sakiko: Sakiko): EventHandler<Events[number], Context>;
}

/**
 * 匹配器函数类型
 *
 * Matcher function type
 */
export type MatcherFn<
    Bot extends SakikoBot<any>,
    Context extends IHandlerContext,
    Event extends SakikoEvent<any, Bot>
> = (
    bot: Bot,
    event: Event,
    context: Context
) => Promise<boolean> | boolean | void | Promise<void>;
