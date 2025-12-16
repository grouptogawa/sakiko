export interface hasSender {
    getSenderId(): string;
}

export interface Targetable {
    mentioned(userId: string): boolean;
    mentionedMe(): boolean;
}

export interface Messageable {
    summary(): string;
    plaintext(): string;
}
