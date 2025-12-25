import type {
    ExtractBotType,
    UmiriContext,
    UmiriEvent,
    UmiriEventConstructor,
    UmiriEventMatcher
} from "@togawa-dev/umiri";

import type { ILogger } from "@togawa-dev/utils";
import { MatcherBuilderWithIns } from "./matcher";
import type { Sakiko } from "./sakiko";
import type { SakikoConfig } from "./config";
import chalk from "chalk";

/**
 * Sakiko 插件类型定义
 *
 * Sakiko Plugin Type Definition
 */
export type SakikoPlugin = {
    readonly pluginId: string;
    readonly pluginDisplayName?: string;
    readonly pluginVersion?: string;
    readonly pluginDescription?: string;
    readonly pluginAuthor?: string;

    readonly pluginDependencies?: string[];

    // 可选提供属于这个插件的事件匹配器
    getMatchers?(): UmiriEventMatcher<any, any>[];
    // 可选的设置日志实例方法
    setLogger?(logger: ILogger): void;
    // 可选的设置配置方法
    setConfig?(config: SakikoConfig): void;

    // 可选实现的生命周期钩子
    onLoad?(sakiko: Sakiko): Promise<void | boolean>;
    onUnload?(sakiko: Sakiko): Promise<void>;
    onStartUp?(): Promise<void | boolean>;
    onShutDown?(): Promise<void>;
};

/**
 * Sakiko 适配器类型定义
 *
 * Sakiko Adapter Type Definition
 */
export type SakikoAdapter = SakikoPlugin & {
    readonly platformName: string;
    readonly protocolName: string;
};

/**
 * 判断对象是否为插件
 *
 * Determine whether an object is a Sakiko plugin
 */
export function isSakikoPlugin(obj: any): obj is SakikoPlugin {
    return obj && typeof obj.pluginId === "string";
}

/**
 * 判断对象是否为适配器
 *
 * Determine whether an object is a Sakiko adapter
 */
export function isSakikoAdapter(obj: any): obj is SakikoAdapter {
    return (
        obj &&
        typeof obj.platformName === "string" &&
        typeof obj.protocolName === "string" &&
        isSakikoPlugin(obj)
    );
}

/**
 * 插件管理器 / Plugin manager
 */
export class PluginManager extends Map<string, SakikoPlugin> {
    private _logger: ILogger;

    constructor(private _sakiko: Sakiko) {
        super();
        this._logger = this._sakiko.getNamedLogger(
            chalk.blue("plugin-manager")
        );
    }

    /**
     * 加载插件 / Load plugin
     * @param plugin 插件实例 / Plugin instance
     */
    async load(plugin: SakikoPlugin) {
        // 对插件实例进行类型检查
        if (!isSakikoPlugin(plugin)) {
            const e = new Error("invalid Sakiko plugin");
            this._logger.error(e);
            throw e;
        }
        // 检查插件是否已存在
        if (this.has(plugin.pluginId)) {
            const e = new Error(
                `plugin with id ${chalk.magenta(plugin.pluginId)} is already loaded`
            );
            this._logger.error(e);
            throw e;
        }

        // 检查插件管理器中是否存在插件依赖
        if (plugin.pluginDependencies) {
            const hasDependencies = plugin.pluginDependencies?.every((dep) =>
                this.has(dep)
            );
            if (!hasDependencies) {
                const e = new Error(
                    `missing dependencies for plugin ${chalk.magenta(plugin.pluginId)}: ${plugin.pluginDependencies.join(
                        ", "
                    )}`
                );
                this._logger.error(e);
                throw e;
            }
        }

        // 检查插件是否实现了注入日志记录器的方法
        if (typeof plugin.setLogger === "function") {
            plugin.setLogger(
                this._sakiko.getNamedLogger(
                    chalk.magenta(plugin.pluginDisplayName || plugin.pluginId) // 如果没有定义显示名称则使用 ID 作为名称
                )
            );
        }

        // 检查插件是否实现了注入配置的方法
        if (typeof plugin.setConfig === "function") {
            plugin.setConfig(this._sakiko.config);
        }

        // 调用插件的加载钩子
        if (plugin.onLoad) {
            const loadResult = await plugin.onLoad(this._sakiko);
            if (loadResult === false) {
                this._logger.warn(
                    `plugin ${chalk.magenta(plugin.pluginId)}'s "onLoad" hook returned false, aborting load`
                );
                // 加载被插件的 onLoad 钩子截断，跳过这个插件的加载
                return;
            }
        }

        // 注册这个插件的所有事件匹配器
        this._registerPluginMatchers(plugin);

        this.set(plugin.pluginId, plugin);

        this._logger.info(
            `loaded plugin ${chalk.magenta(plugin.pluginId)} ${chalk.greenBright("v" + (plugin.pluginVersion || "0.0.0"))}`
        );
    }

    /**
     * 卸载插件 / Unload plugin
     * @param pluginId 插件 ID / Plugin ID
     */
    async unload(pluginId: string) {
        const plugin = this.get(pluginId);
        if (!plugin) {
            const e = new Error(
                `plugin with id ${pluginId} hasn't been loaded`
            );
            this._logger.error(e);
            throw e;
        }

        // 检查是否有其他插件依赖这个插件
        const dependentPlugins = Array.from(this.values()).filter(
            (p) =>
                p.pluginDependencies && p.pluginDependencies.includes(pluginId)
        );
        if (dependentPlugins.length > 0) {
            const e = new Error(
                `cannot unload plugin ${chalk.magenta(plugin.pluginId)} because other plugins depend on it: ${dependentPlugins
                    .map((p) => p.pluginId)
                    .join(", ")}`
            );
            this._logger.error(e);
            throw e;
        }

        // 移除这个插件注册的所有事件匹配器
        this._unregisterPluginMatchers(plugin);

        // 调用插件的卸载钩子
        if (plugin.onUnload) {
            await plugin.onUnload(this._sakiko);
        }

        // 从插件管理器中移除这个插件
        this.delete(pluginId);

        this._logger.info(`unloaded plugin ${pluginId}`);
    }

    /**
     * 注册插件的事件匹配器 / Register plugin matchers
     * @param plugin 插件实例 / Plugin instance
     */
    private _registerPluginMatchers(plugin: SakikoPlugin) {
        const matchers = plugin.getMatchers?.();
        if (!(matchers && Array.isArray(matchers))) {
            return;
        }

        this._sakiko.bus.register(...matchers);

        this._logger.debug(
            `registered ${matchers.length} matchers from plugin ${chalk.magenta(plugin.pluginId)}`
        );
    }

    /**
     * 注销插件的事件匹配器 / Unregister plugin matchers
     * @param plugin 插件实例 / Plugin instance
     */
    private _unregisterPluginMatchers(plugin: SakikoPlugin) {
        const matchers = plugin.getMatchers?.();
        if (!(matchers && Array.isArray(matchers))) {
            return;
        }

        this._sakiko.bus.unregister(...matchers);

        this._logger.debug(
            `unregistered ${matchers.length} matchers from plugin ${chalk.magenta(plugin.pluginId)}`
        );
    }

    /**
     * 运行插件的启动钩子 / Run plugin startup hooks
     */
    async _runStartUp() {
        this._logger.debug("running startup hooks...");
        for (const plugin of this.values()) {
            if (plugin.onStartUp) {
                const result = await plugin.onStartUp();
                if (result === false) {
                    this._logger.warn(
                        `plugin ${chalk.magenta(plugin.pluginId)} aborted startup, unloading`
                    );
                    await this.unload(plugin.pluginId);
                }
            }
        }
    }

    /**
     * 运行插件的关闭钩子 / Run plugin shutdown hooks
     */
    async _runShutDown() {
        this._logger.debug("running shutdown hooks...");
        for (const plugin of this.values()) {
            if (plugin.onShutDown) {
                await plugin.onShutDown();
            }
        }

        // 解除所有插件注册的事件匹配器
        for (const plugin of this.values()) {
            this._unregisterPluginMatchers(plugin);
        }
    }
}

/**
 * 构建可插拔插件 / Build a plugin that can be plugged in
 */
export class buildablePlugin implements SakikoPlugin {
    readonly pluginId: string;
    readonly pluginDisplayName?: string;
    readonly pluginVersion?: string;
    readonly pluginDescription?: string;
    readonly pluginAuthor?: string;
    readonly platformName?: string;
    readonly protocolName?: string;

    readonly pluginDependencies?: string[];

    private readonly onLoadFn?: (sakiko: Sakiko) => Promise<void | boolean>;
    private readonly onUnloadFn?: (sakiko: Sakiko) => Promise<void>;
    private readonly onStartUpFn?: () => Promise<void | boolean>;
    private readonly onShutDownFn?: () => Promise<void>;

    private _logger?: ILogger;
    private _matchers: UmiriEventMatcher<any, any>[] = [];

    get logger() {
        if (!this._logger) {
            throw new Error("logger has not been set for this plugin");
        }
        return this._logger;
    }

    setLogger(logger: ILogger): void {
        this._logger = logger;
    }

    constructor(options: {
        pluginId: string;
        pluginDisplayName?: string;
        pluginVersion?: string;
        pluginDescription?: string;
        pluginAuthor?: string;
        pluginDependencies?: string[];
        platformName?: string;
        protocolName?: string;
        onLoadFn?: (sakiko: Sakiko) => Promise<void | boolean>;
        onUnloadFn?: (sakiko: Sakiko) => Promise<void>;
        onStartUpFn?: () => Promise<void | boolean>;
        onShutDownFn?: () => Promise<void>;
    }) {
        this.pluginId = options.pluginId;
        this.pluginDisplayName = options.pluginDisplayName;
        this.pluginVersion = options.pluginVersion;
        this.pluginDescription = options.pluginDescription;
        this.pluginAuthor = options.pluginAuthor;
        this.pluginDependencies = options.pluginDependencies;
        this.platformName = options.platformName;
        this.protocolName = options.protocolName;
        this.onLoadFn = options.onLoadFn;
        this.onUnloadFn = options.onUnloadFn;
        this.onStartUpFn = options.onStartUpFn;
        this.onShutDownFn = options.onShutDownFn;
    }

    async onLoad?(sakiko: Sakiko) {
        return this.onLoadFn?.(sakiko);
    }

    async onUnload?(sakiko: Sakiko): Promise<void> {
        return this.onUnloadFn?.(sakiko);
    }

    async onStartUp?() {
        return this.onStartUpFn?.();
    }

    async onShutDown?(): Promise<void> {
        return this.onShutDownFn?.();
    }

    getMatchers(): UmiriEventMatcher<any, any>[] {
        return this._matchers;
    }

    commit(...matchers: UmiriEventMatcher<any, any>[]) {
        if (!this._matchers) {
            this._matchers = [];
        }
        this._matchers.push(...matchers);
    }

    match<Events extends UmiriEvent<any, any>[]>(
        ...ets: { [K in keyof Events]: UmiriEventConstructor<Events[K]> }
    ): MatcherBuilderWithIns<
        ExtractBotType<Events[number]>,
        Events,
        UmiriContext<ExtractBotType<Events[number]>, Events>
    > {
        type Bot = ExtractBotType<Events[number]>;
        type Ctx = UmiriContext<Bot, Events>;
        return new MatcherBuilderWithIns<Bot, Events, Ctx>(this, ets);
    }
}

/**
 * 构建插件 / Build plugin
 * @param pluginId 插件 ID / Plugin ID
 * @returns 插件构建器 / Plugin builder
 */
export function buildPlugin(pluginId: string) {
    const _pluginId = pluginId;
    let _pluginDisplayName: string | undefined;
    let _pluginVersion: string | undefined;
    let _pluginDescription: string | undefined;
    let _pluginAuthor: string | undefined;
    let _pluginDependencies: string[] | undefined;

    let _platformName: string | undefined;
    let _protocolName: string | undefined;

    let _onLoadFn: ((sakiko: Sakiko) => Promise<void | boolean>) | undefined;
    let _onUnloadFn: ((sakiko: Sakiko) => Promise<void>) | undefined;
    let _onStartUpFn: (() => Promise<void | boolean>) | undefined;
    let _onShutDownFn: (() => Promise<void>) | undefined;

    return {
        /**
         * 设置插件显示名称 / Set plugin display name
         * @param name 显示名称 / Display name
         * @returns 插件构建器 / Plugin builder
         */
        displayName(name: string) {
            _pluginDisplayName = name;
            return this;
        },
        /**
         * 设置插件版本 / Set plugin version
         * @param version 版本号 / Version number
         * @returns 插件构建器 / Plugin builder
         */
        version(version: string) {
            _pluginVersion = version;
            return this;
        },
        /**
         * 设置插件描述 / Set plugin description
         * @param description 描述 / Description
         * @returns 插件构建器 / Plugin builder
         */
        description(description: string) {
            _pluginDescription = description;
            return this;
        },
        /**
         * 设置插件作者 / Set plugin author
         * @param author 作者 / Author
         * @returns 插件构建器 / Plugin builder
         */
        author(author: string) {
            _pluginAuthor = author;
            return this;
        },
        /**
         * 设置插件依赖 / Set plugin dependencies
         * @param deps 依赖列表 / List of dependencies
         * @returns 插件构建器 / Plugin builder
         */
        dependencies(...deps: string[]) {
            _pluginDependencies = deps;
            return this;
        },
        /**
         * 设置插件平台名称 / Set plugin platform name
         * @param name 平台名称 / Platform name
         * @returns 插件构建器 / Plugin builder
         */
        platform(name: string) {
            _platformName = name;
            return this;
        },
        /**
         * 设置插件协议名称 / Set plugin protocol name
         * @param name 协议名称 / Protocol name
         * @returns 插件构建器 / Plugin builder
         */
        protocol(name: string) {
            _protocolName = name;
            return this;
        },
        /**
         * 设置插件加载时执行的函数 / Set function to execute when plugin loads
         * @param fn 加载时执行的函数 / Function to execute when plugin loads
         * @returns 插件构建器 / Plugin builder
         */
        onLoad(fn: (sakiko: Sakiko) => Promise<void | boolean>) {
            _onLoadFn = fn;
            return this;
        },
        /**
         * 设置插件卸载时执行的函数 / Set function to execute when plugin unloads
         * @param fn 卸载时执行的函数 / Function to execute when plugin unloads
         * @returns 插件构建器 / Plugin builder
         */
        onUnload(fn: (sakiko: Sakiko) => Promise<void>) {
            _onUnloadFn = fn;
            return this;
        },
        /**
         * 设置插件启动时执行的函数 / Set function to execute when plugin starts
         * @param fn 启动时执行的函数 / Function to execute when plugin starts
         * @returns 插件构建器 / Plugin builder
         */
        onStartUp(fn: () => Promise<void | boolean>) {
            _onStartUpFn = fn;
            return this;
        },
        /**
         * 设置插件关闭时执行的函数 / Set function to execute when plugin shuts down
         * @param fn 关闭时执行的函数 / Function to execute when plugin shuts down
         * @returns 插件构建器 / Plugin builder
         */
        onShutDown(fn: () => Promise<void>) {
            _onShutDownFn = fn;
            return this;
        },
        /**
         * 构建插件 / Build plugin
         * @returns 插件 / Plugin
         */
        build() {
            return new buildablePlugin({
                pluginId: _pluginId,
                pluginDisplayName: _pluginDisplayName,
                pluginVersion: _pluginVersion,
                pluginDescription: _pluginDescription,
                pluginAuthor: _pluginAuthor,
                pluginDependencies: _pluginDependencies,
                platformName: _platformName,
                protocolName: _protocolName,
                onLoadFn: _onLoadFn,
                onUnloadFn: _onUnloadFn,
                onStartUpFn: _onStartUpFn,
                onShutDownFn: _onShutDownFn
            });
        }
    };
}
