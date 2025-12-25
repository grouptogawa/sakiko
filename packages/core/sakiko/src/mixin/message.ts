import type { UniMessage } from "@togawa-dev/utils/unimsg";

/**
 * 可转换为 UniMessage 的对象
 */
export type CanConvertToUniMessage = {
    toUniMessage(): UniMessage;
};

/**
 * 判断对象是否可转换为 UniMessage
 * @param obj 待判断对象
 * @returns 是否可转换为 UniMessage
 */
export function isCanConvertToUniMessage(
    obj: any
): obj is CanConvertToUniMessage {
    return obj && typeof obj.toUniMessage === "function";
}

/**
 * 可从 UniMessage 转换的对象
 */
export type CanFromUniMessage = {
    fromUniMessage(msg: UniMessage): any;
};

/**
 * 判断对象是否可从 UniMessage 转换
 * @param obj 待判断对象
 * @returns 是否可从 UniMessage 转换
 */
export function isCanFromUniMessage(obj: any): obj is CanFromUniMessage {
    return obj && typeof obj.fromUniMessage === "function";
}
