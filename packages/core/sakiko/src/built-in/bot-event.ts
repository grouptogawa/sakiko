import type { Framework } from "./framework-bot";
import { UmiriEvent, type UmiriBot } from "@togawa-dev/umiri";

export interface ProtocolBotConnectedPayload {
    time: number;
    selfId: string;
    nickname: string;
}

export interface ProtocolBotDisconnectedPayload {
    time: number;
    selfId: string;
    reason?: string;
}

export class ProtocolBotConnected<Bot extends UmiriBot> extends UmiriEvent<
    ProtocolBotConnectedPayload,
    Bot
> {
    constructor(payload: ProtocolBotConnectedPayload, bot: Bot) {
        super(payload, bot);
    }
}

export class ProtocolBotDisconnected extends UmiriEvent<
    ProtocolBotDisconnectedPayload,
    Framework
> {}
