import type {
    UmiriBot,
    UmiriContext,
    UmiriEvent,
    UmiriEventConstructor,
    UmiriEventMatcher,
    UmiriEventMatcherFn,
    UmiriEventMiddleware
} from "@togawa-dev/umiri";

export class MatcherBuilder<
    Bot extends UmiriBot,
    Events extends UmiriEvent<any, Bot>[],
    Context extends UmiriContext<Bot, Events>
> {
    protected _priority = 0;
    protected _block = false;
    protected _timeout = 0;
    protected _mws: UmiriEventMiddleware<any, any>[] = [];
    protected _fn?: UmiriEventMatcherFn<Context>;
    constructor(
        protected ets: {
            [K in keyof Events]: UmiriEventConstructor<Events[K]>;
        }
    ) {}

    filter<Next extends Context = Context>(
        mw: UmiriEventMiddleware<Context, Next>
    ) {
        this._mws.push(mw);
        return this as unknown as MatcherBuilder<Bot, Events, Next>;
    }

    handle(
        fn: UmiriEventMatcherFn<Context>,
        options?: { priority?: number; block?: boolean; timeout?: number }
    ) {
        this._fn = fn;
        if (options) {
            if (options.priority !== undefined) {
                this._priority = options.priority;
            }
            if (options.block !== undefined) {
                this._block = options.block;
            }
            if (options.timeout !== undefined) {
                this._timeout = options.timeout;
            }
        }
        return this;
    }
}

export class MatcherBuilderWithIns<
    Bot extends UmiriBot,
    Events extends UmiriEvent<any, Bot>[],
    Context extends UmiriContext<Bot, Events>
> extends MatcherBuilder<Bot, Events, Context> {
    constructor(
        protected ins: {
            // 只需要是实现了 commit 方法的对象即可，可以是 Sakiko 实例也可以是实现了这个方法的插件对象
            commit: (...matchers: UmiriEventMatcher<any, any>[]) => void;
        },
        protected override ets: {
            [K in keyof Events]: UmiriEventConstructor<Events[K]>;
        }
    ) {
        super(ets);
    }

    commit() {
        const matcher: UmiriEventMatcher<Context, Events[number]> = {
            ets: this.ets,
            priority: this._priority,
            timeout: this._timeout,
            block: this._block,
            mws: this._mws,
            action: this._fn!
        };
        return this.ins.commit(matcher);
    }
}
