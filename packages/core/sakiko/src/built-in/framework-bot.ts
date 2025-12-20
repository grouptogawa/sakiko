import type { UmiriBot } from "@togawa-dev/umiri";

export class Framework implements UmiriBot {
    get selfId(): string {
        return "0";
    }

    get nickname(): string {
        return "Togawa Sakiko";
    }
}
