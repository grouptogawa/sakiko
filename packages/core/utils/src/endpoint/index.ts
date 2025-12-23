import type { z } from "zod";

/* API 端点数据结构定义 */
export type APIEndpoint<Req = unknown, Res = unknown> = {
    req: z.ZodType<Req, any>; // 使用 zod 验证请求类型
    res: z.ZodType<Res, any>; // 使用 zod 验证响应类型
};

/* API 映射表类型定义 */
export type APIMap = Record<string, APIEndpoint<any, any>>;

/* 提取指定端点的请求类型（输入类型，适合用于调用方构造 data） */
export type APIReq<M extends APIMap, A extends APIAction<M>> = z.input<
    M[A]["req"]
>;

/* 提取指定端点的响应类型（输出类型，适合用于 parse 后/返回值） */
export type APIRes<M extends APIMap, A extends APIAction<M>> = z.output<
    M[A]["res"]
>;

/* 从 API 映射表中提取对应端点的请求和响应类型的辅助类型 / Helper types to extract request and response types from the API map */
export type APIAction<M extends APIMap> = keyof M & string;

/* 根据 API 映射表生成对应的函数类型 / Generate function types based on the API map */
export type APIFunctions<M extends APIMap> = {
    [A in APIAction<M>]: (req: APIReq<M, A>) => Promise<APIRes<M, A>>;
};

/**
 * 验证请求数据
 * @param apiMap API 映射表
 * @param action API 端点
 * @param data 要验证的请求数据
 * @returns 返回验证通过的数据或抛出验证错误
 */
export function validateRequest<M extends APIMap, A extends APIAction<M>>(
    apiMap: M,
    action: A,
    data: APIReq<M, A>
): APIReq<M, A> {
    const entry = apiMap[action];
    if (!entry) {
        throw new Error(`unknown action: ${String(action)}`);
    }

    const schema = entry.req;

    try {
        // ↓ 下面是 copilot 的意见
        //
        // parse 返回 output；这里 req schema 通常 input≈output
        // 若你希望严格区分，可把返回类型改为 z.output<M[A]["req"]>
        return schema.parse(data) as APIReq<M, A>;
    } catch (e: any) {
        throw new Error(
            `invalid response data for ${String(action)}: ${e?.message ?? String(e)}`
        );
    }
}

/**
 * 验证响应数据
 * @param apiMap API 映射表
 * @param action API 端点
 * @param data 要验证的响应数据
 * @returns 返回验证通过的数据或抛出验证错误
 */
export function validateResponse<M extends APIMap, A extends APIAction<M>>(
    apiMap: M,
    action: A,
    data: APIRes<M, A>
): APIRes<M, A> {
    const entry = apiMap[action];
    if (!entry) {
        throw new Error(`unknown action: ${String(action)}`);
    }

    const schema = entry.res;

    try {
        return schema.parse(data);
    } catch (e: any) {
        throw new Error(
            `invalid response data for ${String(action)}: ${e?.message ?? String(e)}`
        );
    }
}
