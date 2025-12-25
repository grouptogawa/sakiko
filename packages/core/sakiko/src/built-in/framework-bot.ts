import type { UmiriBot } from "@togawa-dev/umiri";

/**
 * 框架机器人 / Framework bot
 */
export class Framework implements UmiriBot {
    /**
     * 获取机器人自身 ID / Get the bot's self ID
     * @returns 机器人自身 ID / Bot's self ID
     */
    get selfId(): string {
        return "0";
    }

    /**
     * 获取机器人昵称 / Get the bot's nickname
     * @returns 机器人昵称 / Bot's nickname
     */
    get nickname(): string {
        return "Togawa Sakiko";
    }
}
