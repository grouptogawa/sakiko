import type { UmiriContext } from "./context";

/**
 * Umiri 框架中使用的中间件类型
 *
 * The middleware type used in the Umiri framework
 *
 * @template Context 上下文对象类型 / Context object type
 * @template Next 下一个上下文对象类型 / Next context object type
 */
export type UmiriEventMiddleware<
    Context extends UmiriContext<any, any>,
    Next extends Context = Context
> = (ctx: Context) => [Next, boolean] | Promise<[Next, boolean]>;
