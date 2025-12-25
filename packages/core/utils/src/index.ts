import z from "zod";

/**
 * 合并两个对象，返回一个新的对象，包含两个对象的所有属性。
 *
 * 当属性名冲突时，后者的属性值会覆盖前者的属性值。
 *
 * merge two objects into a new object.
 *
 * When there are conflicting property names, the value from the latter object will overwrite the value from the former object.
 * @param a
 * @param b
 * @returns 合并后的新对象 / the merged new object
 */
export function merge<T extends object, U extends object>(a: T, b: U): T & U {
    return { ...a, ...b };
}

/**
 * 简单的日志记录器接口，定义了常用的日志级别方法。
 *
 * A simple logger interface that defines common log level methods.
 */
export type ILogger = {
    trace(...args: any[]): void;
    debug(...args: any[]): void;
    info(...args: any[]): void;
    warn(...args: any[]): void;
    error(...args: any[]): void;
};

/**
 * 使当前协程暂停执行指定的毫秒数。
 *
 * Make the current coroutine pause execution for the specified number of milliseconds.
 * @param ms
 * @returns
 */
export function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// 很显然，相当大一部分的情况下，userId 不一定是 int64 的范围，json 解析时会自动把它变成 number，而 number 只到int32的范围
// 所以需要定义一个可以自动处理 number 的 int64 类型

/**
 * 能够自动处理 number 的 int64 类型
 *
 * A Zod schema for int64 that can automatically handle number.
 */
export const int64WithNumber = z.preprocess((value) => {
    // 处理 number
    if (typeof value === "number") {
        console.log("进入类型升级流程");

        if (!Number.isInteger(value)) {
            return value; // 让后面的 z.int64() 报错
        }

        const INT32_MIN = -2147483648;
        const INT32_MAX = 2147483647;
        if (value < INT32_MIN || value > INT32_MAX) {
            // 超出 int32 范围时，不做转换，让 z.int64() 去报错
            console.log("超出 int32 范围");
            return value;
        }

        // 在 int32 范围内，转换为 BigInt
        return BigInt(value);
    }

    return value;
}, z.int64());
