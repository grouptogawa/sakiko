import type { UmiriBot } from "@togawa-dev/umiri";
import type { UniMessage } from "@togawa-dev/utils/unimsg";
import type { HasContactId, HasScene, HasSceneId } from "../mixin/event";
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
import chalk from "chalk";

/** 用于和协议实现进行通讯的机器人接口 / Protocol Bot Interface */
export type ProtocolBot<M extends APIMap> = UmiriBot & {
    get platform(): string;
    get protocol(): string;

    /**
     * 调用协议接口 / Call protocol API
     * @param endpoint 接口名称 / API name
     * @param data 请求数据 / Request data
     * @returns 响应数据 / Response data
     */
    call<Endpoint extends APIAction<M>>(
        endpoint: Endpoint,
        data?: APIReq<M, Endpoint>
    ): Promise<APIRes<M, Endpoint>>;

    /**
     * 发送消息 / Send message
     * @param target 目标 / Target
     * @param msg 消息 / Message
     * @returns 消息 ID 和发送时间 / Message ID and time sent
     */
    send(
        target: HasContactId & HasScene & HasSceneId,
        msg: UniMessage
    ): Promise<{
        /** 消息 ID / Message ID */
        messageId: string;
        /** 发送时间 / Time sent */
        time: number;
    }>;
};

/**
 * 协议机器人管理器 / Protocol bot manager
 */
export class ProtocolBotManager extends Map<string, ProtocolBot<any>> {
    private _frameworkBot = new Framework();
    private _logger: ILogger;

    constructor(private _sakiko: Sakiko) {
        super();
        this._logger = this._sakiko.getNamedLogger(chalk.blue("bot-manager"));
    }

    /**
     * 添加协议机器人 / Add protocol bot
     * @param bot 协议机器人 / Protocol bot
     */
    add(bot: ProtocolBot<any>) {
        if (this.has(bot.selfId)) {
            const e = new Error(
                `ProtocolBot with selfId ${bot.selfId} already exists`
            );
            this._logger.error(e);
            throw e;
        }
        this.set(bot.selfId, bot);

        this._logger.info(
            `protocol bot with selfId ${chalk.cyan.bold(bot.selfId)} connected`
        );

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

    /**
     * 移除协议机器人 / Remove protocol bot
     * @param selfId 机器人自身 ID / Bot's self ID
     * @param reason 断开连接原因 / Reason for disconnection
     */
    remove(selfId: string, reason?: string) {
        if (!this.has(selfId)) {
            const e = new Error(
                `ProtocolBot with selfId ${selfId} does not exist`
            );
            this._logger.error(e);
            throw e;
        }
        this.delete(selfId);

        this._logger.info(
            `protocol bot with selfId ${chalk.cyan.bold(selfId)} disconnected`
        );

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

    /**
     * 根据平台过滤协议机器人 / Filter protocol bots by platform
     * @param platform 平台 / Platform
     * @returns 协议机器人列表 / List of protocol bots
     */
    filterPlatform(platform: string) {
        const bots: ProtocolBot<any>[] = [];
        for (const bot of this.values()) {
            if (bot.platform === platform) {
                bots.push(bot);
            }
        }
        return bots;
    }

    /**
     * 根据协议过滤协议机器人 / Filter protocol bots by protocol
     * @param protocol 协议 / Protocol
     * @returns 协议机器人列表 / List of protocol bots
     */
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
