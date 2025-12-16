import type {
    UmiriBot,
    UmiriContext,
    UmiriEvent,
    UmiriEventConstructor,
    UmiriEventMatcher,
    UmiriEventMatcherFn,
    UmiriEventMiddleware
} from "@togawa-dev/umiri";

import type { Sakiko } from "./sakiko";

export class MatcherBuilder<
    Bot extends UmiriBot,
    Events extends UmiriEvent<any, Bot>[],
    Context extends UmiriContext<Bot, Events>
> {
    private _priority = 0;
    private _block = false;
    private _timeout = 0;
    private _mws: UmiriEventMiddleware<any, any>[] = [];
    private _fn?: UmiriEventMatcherFn<Context>;

    constructor(
        private sakiko: Sakiko,
        private ets: {
            [K in keyof Events]: UmiriEventConstructor<Events[K]>;
        }
    ) {}

    priority(priority: number) {
        this._priority = priority;
        return this;
    }

    block(block: boolean = true) {
        this._block = block;
        return this;
    }

    timeout(timeout: number) {
        this._timeout = timeout;
        return this;
    }

    apply<Next extends Context = Context>(
        mw: UmiriEventMiddleware<Context, Next>
    ) {
        this._mws.push(mw);
        return this as unknown as MatcherBuilder<Bot, Events, Next>;
    }

    action(fn: UmiriEventMatcherFn<Context>) {
        this._fn = fn;
        return this;
    }

    match() {
        const matcher: UmiriEventMatcher<Context, Events[number]> = {
            ets: this.ets,
            priority: this._priority,
            timeout: this._timeout,
            block: this._block,
            mws: this._mws,
            action: this._fn!
        };
        return this.sakiko.match(matcher);
    }
}
