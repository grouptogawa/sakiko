import type {
    EventConstructor,
    EventHandler,
    EventHandlerMiddleware,
    HandlerContextConstructor,
    IHandlerContext
} from "@grouptogawa/umiri";
import { MatchContext, RegexContext, SakikoContext } from "./context";
import { SakikoEvent, type Messageable } from "./event";
import { contains, endswith, fullmatch, regex, startswith } from "./mw";

import { Sakiko } from "./sakiko";
import type { SakikoAdapter } from "@/plugin/adapter";
import type { SakikoBot } from "@/core/bot";
import { sakiko } from "../global";

/**
 * Bot 构造函数类型
 *
 * Bot constructor type
 */
type BotConstructor<Bot extends SakikoBot<any>> = new (...args: any[]) => Bot;

/**
 * 匹配器函数类型
 *
 * Matcher function type
 */
type MatcherFn<
    Bot extends SakikoBot<any>,
    Context extends IHandlerContext,
    Event extends SakikoEvent<any>
> = (bot: Bot, event: Event, context: Context) => Promise<boolean> | boolean;

/**
 * 事件处理器构建器
 *
 * Event handler builder
 */
export class MatcherBuilder<
    Bot extends SakikoBot<any>,
    Context extends IHandlerContext,
    Events extends SakikoEvent<any, Bot>[]
> {
    _priority = 0;
    _block = false;
    _timeout = 0;
    _mws = [] as EventHandlerMiddleware<any, any>[];
    _fn?: MatcherFn<Bot, Context, Events[number]>;

    constructor(
        public ct: HandlerContextConstructor<Context>,
        public ets: { [K in keyof Events]: EventConstructor<Events[K]> }
    ) {}

    /**
     * 设置事件处理器的优先级
     *
     * set the priority of the event handler.
     * @param priority 优先级 the priority
     * @returns 事件处理器构建器 this event handler builder
     */
    priority(priority: number) {
        this._priority = priority;
        return this;
    }

    /**
     * 设置事件处理器是否为阻塞型
     *
     * set whether the event handler is blocking.
     * @param block 是否为阻塞型 whether to be blocking
     * @returns 事件处理器构建器 this event handler builder
     */
    block(block: boolean = true) {
        this._block = block;
        return this;
    }

    /**
     * 设置事件处理器的超时时间
     *
     * set the timeout for the event handler.
     * @param timeout 超时时间 the timeout
     * @returns 事件处理器构建器 this event handler builder
     */
    timeout(timeout: number) {
        this._timeout = timeout;
        return this;
    }

    /**
     * 为事件处理器添加中间件
     *
     * add middleware to the event handler.
     * @param mw 中间件 the middleware
     * @returns 事件处理器构建器 this event handler builder
     */
    use(mw: EventHandlerMiddleware<Events[number], Context>) {
        this._mws.push(mw);
        return this;
    }

    /**
     * 设置事件处理函数
     *
     * set the event handler function.
     * @param fn 事件处理函数 the event handler function
     * @returns 事件处理器 the event handler
     */
    handle(fn: MatcherFn<Bot, Context, Events[number]>) {
        this._fn = fn;
        return this;
    }

    /**
     * 构建事件处理器，你不应该直接调用它，当一个 matcher 被注册到 sakiko 时会自动调用它
     *
     * build the event handler.
     * @param sakiko Sakiko 实例 the Sakiko instance
     * @returns 事件处理器 the event handler
     */
    build(sakiko: Sakiko) {
        return {
            ets: this.ets,
            ct: this.ct,
            priority: this._priority,
            block: this._block,
            timeout: this._timeout > 0 ? this._timeout : undefined,
            middlewares: this._mws.length > 0 ? this._mws : undefined,
            handle: (event: Events[number], context: Context) => {
                // 注入bot
                return this._fn
                    ? this._fn(event.getBot(), event, context)
                    : Promise.resolve(true);
            },
            registered: false
        } as EventHandler<Events[number], Context>;
    }
}

/**
 * 创建一个事件处理器构建器
 *
 * create an event handler builder
 */
export function buildMatcherFor<
    Bot extends SakikoBot<any>,
    Context extends IHandlerContext,
    Events extends SakikoEvent<any, Bot>[]
>(
    ct: HandlerContextConstructor<Context>,
    ...ets: { [K in keyof Events]: EventConstructor<Events[K]> }
) {
    return new MatcherBuilder<Bot, Context, Events>(ct, ets);
}

/** 创建一个用于匹配任意消息事件的快捷匹配器
 *
 * create a shortcut matcher to match any message event.
 */
export function onEvent<
    Bot extends SakikoBot<any>,
    Events extends (SakikoEvent<any, Bot> & Messageable)[]
>(...ets: { [K in keyof Events]: EventConstructor<Events[K]> }) {
    return buildMatcherFor<Bot, SakikoContext, Events>(SakikoContext, ...ets);
}

/**
 * 创建一个用于匹配消息开头文本的快捷匹配器
 *
 * create a shortcut matcher to match message starting text.
 */
export function onStartsWith(
    text: string | string[],
    ignoreCase: boolean = false
) {
    return {
        ofEvent<
            Bot extends SakikoBot<any>,
            Events extends (SakikoEvent<any, Bot> & Messageable)[]
        >(...ets: { [K in keyof Events]: EventConstructor<Events[K]> }) {
            return buildMatcherFor<Bot, MatchContext, Events>(
                MatchContext,
                ...ets
            ).use(startswith(Array.isArray(text) ? text : [text], ignoreCase));
        }
    };
}

/** 创建一个用于匹配消息结尾文本的快捷匹配器
 *
 * create a shortcut matcher to match message ending text.
 */
export function onEndsWith(
    text: string | string[],
    ignoreCase: boolean = false
) {
    return {
        ofEvent<
            Bot extends SakikoBot<any>,
            Events extends (SakikoEvent<any, Bot> & Messageable)[]
        >(...ets: { [K in keyof Events]: EventConstructor<Events[K]> }) {
            return buildMatcherFor<Bot, MatchContext, Events>(
                MatchContext,
                ...ets
            ).use(endswith(Array.isArray(text) ? text : [text], ignoreCase));
        }
    };
}

/** 创建一个用于匹配整段消息文本的快捷匹配器
 *
 * create a shortcut matcher to fully match message text.
 */
export function onFullMatch(
    text: string | string[],
    ignoreCase: boolean = false
) {
    return {
        ofEvent<
            Bot extends SakikoBot<any>,
            Events extends (SakikoEvent<any, Bot> & Messageable)[]
        >(...ets: { [K in keyof Events]: EventConstructor<Events[K]> }) {
            return buildMatcherFor<Bot, MatchContext, Events>(
                MatchContext,
                ...ets
            ).use(fullmatch(Array.isArray(text) ? text : [text], ignoreCase));
        }
    };
}

/** 创建一个用于匹配包含指定文本的快捷匹配器
 *
 * create a shortcut matcher to match message containing specified text.
 */
export function onContains(
    text: string | string[],
    ignoreCase: boolean = false
) {
    return {
        ofEvent<
            Bot extends SakikoBot<any>,
            Events extends (SakikoEvent<any, Bot> & Messageable)[]
        >(...ets: { [K in keyof Events]: EventConstructor<Events[K]> }) {
            return buildMatcherFor<Bot, MatchContext, Events>(
                MatchContext,
                ...ets
            ).use(contains(Array.isArray(text) ? text : [text], ignoreCase));
        }
    };
}

/** 创建一个用于匹配正则表达式的快捷匹配器
 *
 * create a shortcut matcher to match regex pattern.
 */
export function onRegex(pattern: RegExp) {
    return {
        ofEvent<
            Bot extends SakikoBot<any>,
            Events extends (SakikoEvent<any, Bot> & Messageable)[]
        >(...ets: { [K in keyof Events]: EventConstructor<Events[K]> }) {
            return buildMatcherFor<Bot, RegexContext, Events>(
                RegexContext,
                ...ets
            ).use(regex(pattern));
        }
    };
}
