import type { ISakikoLogger } from "../log/interface";
import type { UmiriBus } from "@grouptogawa/umiri";

export interface SakikoInit {
    // Sakiko 内部状态相关的配置项

    logger?: ISakikoLogger;
    bus?: UmiriBus;

    // 用于控制其他功能的配置项

    logLevel?: number;
    noAsciiArt?: boolean;
}
