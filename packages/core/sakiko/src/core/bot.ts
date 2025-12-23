import type { UmiriBot } from "@togawa-dev/umiri";
import type { MessageArray } from "@togawa-dev/utils/unimsg";
import type { HasContactId } from "../mixin/event";
import type { Sakiko } from "./sakiko";
import {
    ProtocolBotConnected,
    ProtocolBotDisconnected
} from "../built-in/bot-event";
import { Framework } from "../built-in/framework-bot";
import type { ILogger } from "@togawa-dev/utils";
import type {
    APIAction,
    APIMap,
    APIReq,
    APIRes
} from "@togawa-dev/utils/endpoint";

/** 用于和协议实现进行通讯的机器人接口 / Protocol Bot Interface */
export type ProtocolBot<M extends APIMap> = UmiriBot & {
    get platform(): string;
    get protocol(): string;

    call<Endpoint extends APIAction<M>>(
        endpoint: Endpoint,
        data?: APIReq<M, Endpoint>
    ): Promise<APIRes<M, Endpoint>>;

    send(target: string | HasContactId, ...msg: MessageArray): Promise<boolean>;
};

export class ProtocolBotManager extends Map<string, ProtocolBot<any>> {
    private _frameworkBot = new Framework();
    private _logger: ILogger;

    constructor(private _sakiko: Sakiko) {
        super();
        this._logger = this._sakiko.getNamedLogger("protocol-bot-manager");
    }

    add(bot: ProtocolBot<any>) {
        if (this.has(bot.selfId)) {
            const e = new Error(
                `ProtocolBot with selfId ${bot.selfId} already exists`
            );
            this._logger.error(e);
            throw e;
        }
        this.set(bot.selfId, bot);

        // 发布机器人连接事件
        this._sakiko.bus.publish(
            new ProtocolBotConnected(
                {
                    time: Date.now(),
                    selfId: bot.selfId,
                    nickname: bot.nickname
                },
                bot
            )
        );
    }

    remove(selfId: string, reason?: string) {
        if (!this.has(selfId)) {
            const e = new Error(
                `ProtocolBot with selfId ${selfId} does not exist`
            );
            this._logger.error(e);
            throw e;
        }
        this.delete(selfId);

        // 发布机器人断开连接事件
        this._sakiko.bus.publish(
            new ProtocolBotDisconnected(
                {
                    time: Date.now(),
                    selfId: selfId,
                    reason
                },
                this._frameworkBot
            )
        );
    }

    filterPlatform(platform: string) {
        const bots: ProtocolBot<any>[] = [];
        for (const bot of this.values()) {
            if (bot.platform === platform) {
                bots.push(bot);
            }
        }
        return bots;
    }

    filterProtocol(protocol: string) {
        const bots: ProtocolBot<any>[] = [];
        for (const bot of this.values()) {
            if (bot.protocol === protocol) {
                bots.push(bot);
            }
        }
        return bots;
    }
}
