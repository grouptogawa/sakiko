import type { z } from "zod";

/* API 端点数据结构定义 */
export type APIEndpoint<Req = unknown, Res = unknown> = {
    req: z.ZodType<Req, any>; // 使用 zod 验证请求类型
    res: z.ZodType<Res, any>; // 使用 zod 验证响应类型
};

/* API 映射表类型定义 */
export type APIMap = Record<string, APIEndpoint<any, any>>;

/* 提取指定端点的请求类型 */
export type APIReq<M extends APIMap, A extends APIAction<M>> = M[A]["req"];

/* 提取指定端点的响应类型 */
export type APIRes<M extends APIMap, A extends APIAction<M>> = M[A]["res"];

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
        return schema.parse(data);
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
