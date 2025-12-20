import type { Contactable, Plainable, Quoteable } from "../mixin/mixin";

import type { ProtocolBot } from "./bot";
import type { UmiriBot } from "@togawa-dev/umiri";
import { UmiriEvent } from "@togawa-dev/umiri";

export abstract class SakikoMessageEvent
    extends UmiriEvent<any, ProtocolBot<any>>
    implements Plainable, Contactable, Quoteable
{
    constructor(payload: any, bot: ProtocolBot<any>) {
        super(payload, bot);
    }

    abstract get plain(): string;

    abstract get contactId(): string;

    abstract get msgId(): string;
}
