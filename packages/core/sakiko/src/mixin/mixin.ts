// 事件相关的混入类型

export type Contactable = {
    get contactId(): string;
};

export function isContactable(obj: any): obj is Contactable {
    return obj && typeof obj.contactId === "string";
}

export type Quoteable = {
    get msgId(): string;
};

export function isQuoteable(obj: any): obj is Quoteable {
    return obj && typeof obj.msgId === "string";
}

export type Plainable = {
    get plain(): string;
};

export function isPlainable(obj: any): obj is Plainable {
    return obj && typeof obj.plain === "string";
}
