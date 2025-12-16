import { type Context as Ctx } from "@togawa-dev/utils/context";
import type { UmiriBot } from "./bot";
import type { UmiriContext } from "./context";
import type { UmiriEvent } from "./event";

export type UmiriEventMiddleware<
    Context extends UmiriContext<any, any>,
    Next extends Context = Context
> = (ctx: Context) => [Next, boolean | Promise<boolean>];
