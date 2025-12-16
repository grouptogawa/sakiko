/* 
Utils: 上下文 / Context

[zh]
Sakiko 框架中使用的上下文对象的实现，用于在事件处理流程中传递数据和方法。

简单来讲这种设计里的上下文信息就是一个浅不可变的只读对象，创建之后可以携带引用和方法，但是其本身不能修改。

[en]
Implementation of context objects used in the Sakiko framework for passing data and methods during event handling processes.

In simple terms, the context information in this design is a shallow immutable readonly object that can carry references and methods after creation, but cannot be modified itself.
*/

/** 上下文对象类型约束，任意只读对象 */
export type Context<T extends object = {}> = Readonly<T>;

/** 用于把联合类型转换为交叉类型的类型工具 */
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
    k: infer I
) => void
    ? I
    : never;

/**
 * 创建一个不可变的上下文对象
 *
 * Creates an immutable context object.
 *
 * @template T 上下文对象类型约束，任意只读对象 / Constraint for the context object type, any readonly object
 * @param initial 初始上下文对象 / Initial context object
 * @returns 不可变的上下文对象 / Immutable context object
 */
export function createContext<T extends object = {}>(initial?: T): Context<T> {
    return Object.freeze((initial ?? {}) as T) as Context<T>;
}

/**
 * 合并两个上下文对象，返回一个新的不可变上下文对象
 *
 * Merges two context objects and returns a new immutable context object.
 *
 * @param a 上下文对象A / Context object A
 * @param b 上下文对象B / Context object B
 * @returns 新的不可变上下文对象 / New immutable context object
 */
export function mergeContext<A extends object, B extends object>(
    a: Context<A>,
    b: Context<B>
): Context<A & B> {
    return Object.freeze({ ...a, ...b } as A & B) as Context<A & B>;
}

/**
 * 合并多个上下文对象，返回一个新的不可变上下文对象
 *
 * Merges multiple context objects and returns a new immutable context object.
 *
 * @param ctx 基础上下文对象 / Base context object
 * @param patches 需要合并的多个上下文对象 / Multiple context objects to be merged
 * @returns 新的不可变上下文对象 / New immutable context object
 */
export function mergeMany<A extends object, P extends readonly object[]>(
    ctx: Context<A>,
    ...patches: P
): Context<A & UnionToIntersection<P[number]>> {
    return Object.freeze(Object.assign({}, ctx, ...patches)) as Context<
        A & UnionToIntersection<P[number]>
    >;
}
