import { UniMessage, type Message } from "@togawa-dev/utils/unimsg";
// 事件相关的混入类型

/**
 * 获取可交互联系人的能力接口
 */
export type HasContactId = {
    /** 获取可交互联系人的 ID / get the ID of the interactable contact */
    getContactId(): string;
};

/**
 * 判断对象是否实现了 HasContactId 接口
 */
export function isHasContactId(obj: any): obj is HasContactId {
    return obj && typeof obj.getContactId === "function";
}

/**
 * 获取发生场景 ID 的能力接口
 */
export type HasSceneId = {
    /** 获取发生场景的 ID / get the ID of the scene where the event occurred */
    getSceneId(): string;
};

/**
 * 判断对象是否实现了 HasSceneId 接口
 */
export function isHasSceneId(obj: any): obj is HasSceneId {
    return obj && typeof obj.getSceneId === "function";
}

/**
 * 获取发生场景类型的能力接口
 */
export type HasScene = {
    /** 判断事件是否发生在私聊场景中 / whether the event occurred in a private scene */
    isPrivate(): boolean;
    /** 判断事件是否发生在公共场景中 / whether the event occurred in a public scene */
    isPublic(): boolean;
};

/**
 * 判断对象是否实现了 HasScene 接口
 */
export function isHasScene(obj: any): obj is HasScene {
    return (
        obj &&
        typeof obj.isPrivate === "function" &&
        typeof obj.isPublic === "function"
    );
}

/**
 * 获取引用消息 ID 的能力接口
 */
export type Quoteable = {
    /** 获取引用消息的 ID / get the ID of the quoted message */
    getMessageId(): string;
};

/**
 * 判断对象是否实现了 Quoteable 接口
 */
export function isQuoteable(obj: any): obj is Quoteable {
    return obj && typeof obj.getMessageId === "function";
}

/**
 * 获取纯文本内容的能力接口
 */
export type Plainable = {
    /** 获取纯文本内容 / get the plaintext content */
    getPlaintext(): string;
};

/**
 * 判断对象是否实现了 Plainable 接口
 */
export function isPlainable(obj: any): obj is Plainable {
    return obj && typeof obj.getPlaintext === "function";
}

/**
 * 获取统一消息的能力接口
 */
export type HasUniMessage = {
    /** 获取统一消息实例 / get the UniMessage instance */
    getUniMessage(): UniMessage;
};

/**
 * 判断对象是否实现了 HasUniMessage 接口
 */
export function isHasUniMessage(obj: any): obj is HasUniMessage {
    return obj && typeof obj.getUniMessage === "function";
}

/**
 * 获取消息实例的能力接口
 */
export type HasMessage<T extends Message<any>> = {
    /** 获取消息实例 / get the message instance */
    getMessage(): T;
};

/**
 * 判断对象是否实现了 HasMessage 接口
 */
export function isHasMessage<T extends Message<any>>(
    obj: any
): obj is HasMessage<T> {
    return obj && typeof obj.getMessage === "function";
}

/**
 * 获取操作者 ID 的能力接口
 */
export type HasOperatorId = {
    /** 获取操作者的 ID / get the ID of the operator */
    getOperatorId(): string;
};

/**
 * 判断对象是否实现了 HasOperatorId 接口
 */
export function isHasOperatorId(obj: any): obj is HasOperatorId {
    return obj && typeof obj.getOperatorId === "function";
}

/**
 * 获取接收者 ID 的能力接口
 */
export type HasReceiverId = {
    /** 获取接收者的 ID / get the ID of the receiver */
    getReceiverId(): string;
};

/**
 * 判断对象是否实现了 HasReceiverId 接口
 */
export function isHasReceiverId(obj: any): obj is HasReceiverId {
    return obj && typeof obj.getReceiverId === "function";
}
