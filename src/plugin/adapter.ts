import type { ISakikoLogger } from "../log/interface";
import type { ISakikoPlugin } from "./interface";
import type { Sakiko } from "../core/sakiko";

/**
 * Sakiko 适配器抽象类。
 *
 * 适配器是一种特别的插件，负责将不同的平台与 Sakiko 框架连接起来。
 *
 * Sakiko Adapter abstract class.
 *
 * An adapter is a special type of plugin that connects different platforms to the Sakiko framework.
 */
export abstract class SakikoAdapter implements ISakikoPlugin {
    name?: string;
    displayName?: string;
    version?: string;
    description?: string;
    logger?: ISakikoLogger;

    abstract protocolName: string;
    abstract platformName: string;

    abstract sakiko: Sakiko;

    abstract install(sakiko: Sakiko): boolean | Promise<boolean>;

    abstract uninstall(sakiko: Sakiko): boolean | Promise<boolean>;

    abstract cleanup(): void | Promise<void>;
}
