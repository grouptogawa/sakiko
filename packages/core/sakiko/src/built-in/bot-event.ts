import type { Framework } from "./framework-bot";
import { UmiriEvent, type UmiriBot } from "@togawa-dev/umiri";

/**
 * 协议机器人连接事件的载荷 / Protocol bot connected event payload
 */
export interface ProtocolBotConnectedPayload {
    time: number;
    selfId: string;
    nickname: string;
}

/**
 * 协议机器人断开连接事件的载荷 / Protocol bot disconnected event payload
 */
export interface ProtocolBotDisconnectedPayload {
    time: number;
    selfId: string;
    reason?: string;
}

/**
 * 协议机器人连接事件 / Protocol bot connected event
 */
export class ProtocolBotConnected<Bot extends UmiriBot> extends UmiriEvent<
    ProtocolBotConnectedPayload,
    Bot
> {
    constructor(payload: ProtocolBotConnectedPayload, bot: Bot) {
        super(payload, bot);
    }
}

/**
 * 协议机器人断开连接事件 / Protocol bot disconnected event
 */
export class ProtocolBotDisconnected extends UmiriEvent<
    ProtocolBotDisconnectedPayload,
    Framework
> {}
