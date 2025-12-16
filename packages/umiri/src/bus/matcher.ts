import type { UmiriEvent, UmiriEventConstructor } from "./event";

import type { UmiriContext } from "./context";
import type { UmiriEventMiddleware } from "./middleware";

export type UmiriEventMatcherFn<Context extends UmiriContext<any, any>> = (
    ctx: Context
) => void | Promise<void> | boolean | Promise<boolean>;

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
