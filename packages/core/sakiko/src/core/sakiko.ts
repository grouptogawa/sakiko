import type {
    ExtractBotType,
    UmiriContext,
    UmiriEvent,
    UmiriEventConstructor,
    UmiriEventMatcher
} from "@togawa-dev/umiri";
import { PKG_NAME, VERSION } from "../global";
import { band, info } from "./welcome";
import { createDefaultLogger, normalizeLogLevel } from "../log/default";

import type { ILogger } from "@togawa-dev/utils";
import { MatcherBuilderWithIns } from "./matcher";
import { PluginManager } from "./plugin";
import { ProtocolBotManager } from "./bot";
import type { SakikoConfig } from "./config";
import type { SakikoPlugin } from "./plugin";
import { SnowFlake } from "@togawa-dev/utils/snowflake";
import { Umiri } from "@togawa-dev/umiri";
import chalk from "chalk";
import { merge } from "@togawa-dev/utils";

/**
 * Sakiko 核心类 / Sakiko core class
 */
export class Sakiko<Config extends SakikoConfig = SakikoConfig> {
    // 一些生命周期标志量
    private _started = false;
    private _withBlock = false;
    private _disposed = false;

    // 一些常用内部实例
    private _logger?: ILogger;
    private _bus: Umiri;
    private _snowflake?: SnowFlake;

    private _config: Config = {} as Config;

    /**
     * 机器人实例管理器 / Bot instance manager
     */
    public readonly bots = new ProtocolBotManager(this);
    /**
     * 插件管理器 / Plugin manager
     */
    public readonly plugins = new PluginManager(this);

    private readonly _plugins_load_on_startup: Set<SakikoPlugin> = new Set();

    constructor(conf?: Config) {
        this._config = conf || ({} as Config);
        // 初始化事件总线
        this._bus = new Umiri(
            this.snowflake,
            this.getNamedLogger(chalk.cyanBright("umiri"))
        );

        return this as unknown as Sakiko<Config>; // 强制逆变
    }

    /**
     * 获取框架版本号 / Get framework version
     * @returns 版本号 / Version number
     */
    static get version() {
        return VERSION;
    }

    /**
     * 获取框架包名 / Get framework package name
     * @returns 包名 / Package name
     */
    static get pkgName() {
        return PKG_NAME;
    }

    /**
     * 获取框架版本号 / Get framework version
     * @returns 版本号 / Version number
     */
    get version() {
        return VERSION;
    }

    /**
     * 获取框架包名 / Get framework package name
     * @returns 包名 / Package name
     */
    get pkgName() {
        return PKG_NAME;
    }

    /**
     * 获取日志记录器 / Get logger
     * @returns 日志记录器 / Logger
     */
    get logger() {
        if (this._logger) {
            return this._logger;
        }
        // 使用配置中的日志记录器，或者创建默认日志记录器
        if (this._config.logger) {
            this._logger = this._config.logger;
        } else {
            this._logger = createDefaultLogger(
                normalizeLogLevel(this._config.logLevel)
            );
        }
        return this._logger;
    }

    /**
     * 获取命名日志记录器 / Get named logger
     * @param name 日志记录器名称 / Logger name
     * @returns 日志记录器 / Logger
     */
    getNamedLogger(name: string): ILogger {
        return {
            trace: (...args: any[]) => this.logger.trace(`${name}`, ...args),
            debug: (...args: any[]) => this.logger.debug(`${name}`, ...args),
            info: (...args: any[]) => this.logger.info(`${name}`, ...args),
            warn: (...args: any[]) => this.logger.warn(`${name}`, ...args),
            error: (...args: any[]) => this.logger.error(`${name}`, ...args)
        };
    }

    /**
     * 获取框架内部的日志记录器 / Get framework logger
     * @returns 日志记录器 / Logger
     */
    private get frameworkLogger() {
        return this.getNamedLogger(chalk.rgb(119, 153, 204)("framework"));
    }

    /**
     * 获取当前配置 / Get current config
     * @returns 配置对象 / Config object
     */
    get config() {
        return Object.freeze({ ...this._config });
    }

    /**
     * 获取事件总线实例 / Get event bus instance
     * @returns 事件总线实例 / Event bus instance
     */
    get bus() {
        if (this._bus) {
            return this._bus;
        }
        const e = new Error("umiri is not initialized");
        this.logger.error(e);
        throw e;
    }

    /**
     * 获取 Snowflake 实例 / Get Snowflake instance
     * @returns Snowflake 实例 / Snowflake instance
     */
    get snowflake() {
        if (this._snowflake) {
            return this._snowflake;
        }
        // 初始化 snowflake 实例
        const workerId = this._config.workerId ?? 1;
        this._snowflake = new SnowFlake(workerId);
        return this._snowflake;
    }

    /**
     * 定义配置 / Define config
     * @param conf 配置对象 / Config object
     */
    defineConfig<NewConfig extends SakikoConfig>(conf: NewConfig) {
        if (this._started) {
            const e = new Error("cannot redefine config after sakiko started");
            this.frameworkLogger.error(e);
            throw e;
        }
        this._config = { ...this._config, ...conf };
    }

    /**
     * 合并配置 / Merge config
     * @param conf 配置对象 / Config object
     */
    mergeConfig(conf: object) {
        this._config = merge(this._config, conf);
    }

    /**
     * 创建事件匹配器构建器 / Create event matcher builder
     * @param ets 事件构造器数组 / Array of event constructors
     * @returns 事件匹配器构建器 / Event matcher builder
     */
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

    /**
     * 提交事件匹配器 / Commit event matchers
     * @param matchers 事件匹配器数组 / Array of event matchers
     */
    commit(...matchers: UmiriEventMatcher<any, any>[]) {
        this.bus.register(...matchers);
    }

    /**
     * 加载插件 / Load plugin
     * @param plugin 插件实例 / Plugin instance
     */
    load(plugin: SakikoPlugin) {
        if (this._started) {
            this.plugins.load(plugin);
        } else {
            this._plugins_load_on_startup.add(plugin);
        }
    }

    /**
     * 卸载插件 / Unload plugin
     * @param pluginName 插件名称 / Plugin name
     */
    unload(pluginName: string) {
        if (this._started) {
            this.plugins.unload(pluginName);
        } else {
            this.frameworkLogger.warn(
                `cannot unload plugin ${pluginName} before sakiko started`
            );
        }
    }

    /**
     * 启动 Sakiko 框架 / Launch Sakiko framework
     */
    async launch() {
        let stopping = false;
        this._withBlock = true; // 标记为阻塞启动

        const onSigint = async () => {
            if (stopping) return; // 阻止多次 stop
            stopping = true;
            console.log(); // 换行以美化输出
            this.frameworkLogger.warn(
                "received shutdown signal, shutting down..."
            );
            try {
                await this.dispose(); // 确认所有资源释放
            } catch (err) {
                this.frameworkLogger.error("error during stop:", err);
            }

            process.exit(0); // 只有等所有资源释放完再真正退出
        };
        process.on("SIGINT", onSigint);
        process.on("SIGTERM", onSigint); // 处理 SIGTERM 信号

        await this.launchWithoutBlock(); // 启动

        // 防止主线程提前退出
        await new Promise(() => {}); // 永远 pending，直到 SIGINT 导致 exit
    }

    /**
     * 启动 Sakiko 框架（非阻塞）/ Launch Sakiko framework (non-blocking)
     */
    async launchWithoutBlock() {
        // 标识框架进入启动状态
        this._started = true;

        // 输出字符画
        console.log(info);

        this.frameworkLogger.info("starting sakiko...");

        // 输出当前的配置内容
        this.frameworkLogger.debug(
            "with config:",
            JSON.stringify(this.config, null, 0)
        );

        // 计时计算整个启动流程花费的时间
        const startTime = Date.now();

        // 设置事件总线的启动状态
        this.bus.startHandling();
        this.frameworkLogger.debug("event bus has been started");

        // 加载在启动前注册的插件
        for (const plugin of this._plugins_load_on_startup) {
            await this.plugins.load(plugin);
        }
        this._plugins_load_on_startup.clear();

        this.frameworkLogger.info("pre-installed plugins have been loaded");

        // 调用插件管理器的启动流程
        await this.plugins._runStartUp();

        // 启动完成，输出完成信息
        const endTime = Date.now();
        const duration = endTime - startTime;

        this.frameworkLogger.info(
            `registered ${this.bus.getTotalRegisteredMatcherCount()} matchers on ${this.bus.getTotalRegisteredPriorityCount()} priorities, with ${this.bus.getTotalRegisteredEventTypeCount()} event types`
        );

        this.frameworkLogger.info(
            `done. (took ${chalk.yellowBright(duration + "ms")})`
        );
    }

    /**
     * 释放资源 / Dispose resources
     */
    async dispose() {
        // 调用插件管理器的清理流程
        await this.plugins._runShutDown();

        // 解除插件管理器的引用
        this.plugins.clear();

        // 调用机器人连接实例管理器的清理流程
        this.bots.clear();

        // 清除事件总线中剩余的事件匹配器
        this.bus.clear();

        this._disposed = true;

        if (this._withBlock) {
            this.frameworkLogger.info("shutdown complete, exiting.");
            this.frameworkLogger.info(`Goodbye/^ ${band}`);
            // 如果阻塞启动，则发送 SIGINT 信号以退出进程
            process.kill(process.pid, "SIGINT");
        }
    }
}
