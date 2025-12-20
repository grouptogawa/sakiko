import type { UmiriEvent, UmiriEventConstructor } from "./event";

import type { UmiriContext } from "./context";
import type { UmiriEventMiddleware } from "./middleware";

/**
 * Umiri 框架中使用的事件匹配器函数类型
 *
 * The event matcher function type used in the Umiri framework
 *
 * @template Context 上下文对象类型 / Context object type
 */
export type UmiriEventMatcherFn<Context extends UmiriContext<any, any>> = (
    ctx: Context
) => void | boolean | Promise<boolean | void>;

/**
 * Umiri 框架中使用的事件匹配器类型
 *
 * The event matcher type used in the Umiri framework
 *
 * @template Context 上下文对象类型 / Context object type
 * @template Event 事件类型 / Event type
 */
export type UmiriEventMatcher<
    Context extends UmiriContext<any, any>,
    Event extends UmiriEvent<any, any>
> = {
    ets: UmiriEventConstructor<Event>[];
    priority: number;
    timeout: number;
    block: boolean;
    mws: UmiriEventMiddleware<any, any>[];
    action: UmiriEventMatcherFn<Context>;
};
