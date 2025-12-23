import type { UniMessage } from "@togawa-dev/utils/unimsg";

export type CanConvertToUniMessage = {
    toUniMessage(): UniMessage;
};

export function isCanConvertToUniMessage(
    obj: any
): obj is CanConvertToUniMessage {
    return obj && typeof obj.toUniMessage === "function";
}

export type CanFromUniMessage = {
    fromUniMessage(msg: UniMessage): any;
};

export function isCanFromUniMessage(obj: any): obj is CanFromUniMessage {
    return obj && typeof obj.fromUniMessage === "function";
}
