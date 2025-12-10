import type { ISakikoLogger } from "../log/interface";
import type { Sakiko } from "../core/sakiko";

export interface ISakikoPlugin {
    // 插件元信息
    name?: string;
    displayName?: string;
    version?: string;
    description?: string;

    // 存储日志记录器实例
    logger?: ISakikoLogger;

    install(sakiko: Sakiko): boolean | Promise<boolean>;

    uninstall(sakiko: Sakiko): boolean | Promise<boolean>;

    cleanup(): void | Promise<void>;

    // 可选的生命周期钩子函数

    beforeInstall?(sakiko: Sakiko): boolean | Promise<boolean>;

    afterInstall?(sakiko: Sakiko): void | Promise<void>;

    beforeUninstall?(sakiko: Sakiko): boolean | Promise<boolean>;

    afterUninstall?(sakiko: Sakiko): void | Promise<void>;

    beforeCleanup?(): void | Promise<void>;

    afterCleanup?(): void | Promise<void>;

    beforeSakikoStart?(): void | Promise<void>;
}
