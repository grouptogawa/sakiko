import { UmiriEvent, type UmiriBot } from "@togawa-dev/umiri";
import type { Bot } from "../bot";

/**
 * Onebot V11 基础事件类
 *
 * @template Payload 事件负载类型
 * @extends {SakikoEvent<Payload>}
 */
export class OB11BaseEvent<
    Payload extends object,
    B extends UmiriBot = Bot
> extends UmiriEvent<Payload, B> {
    constructor(bot: B, payload: Payload) {
        super(payload, bot);
    }
}
