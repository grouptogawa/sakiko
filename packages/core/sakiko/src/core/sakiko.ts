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

    public readonly bots = new ProtocolBotManager(this);
    public readonly plugins = new PluginManager(this);
    public readonly _plugins_load_on_startup: Set<SakikoPlugin> = new Set();

    constructor(conf?: Config) {
        this._config = conf || ({} as Config);
        // 初始化事件总线
        this._bus = new Umiri(this.snowflake, this.getNamedLogger("umiri"));

        return this as unknown as Sakiko<Config>; // 强制逆变
    }

    static get version() {
        return VERSION;
    }

    static get pkgName() {
        return PKG_NAME;
    }

    get version() {
        return VERSION;
    }

    get pkgName() {
        return PKG_NAME;
    }

    get logger() {
        if (this._logger) {
            return this._logger;
        }
        this._logger = createDefaultLogger(
            normalizeLogLevel(this._config.logLevel)
        );
        return this._logger;
    }

    getNamedLogger(name: string): ILogger {
        return {
            trace: (...args: any[]) => this.logger.trace(`${name}`, ...args),
            debug: (...args: any[]) => this.logger.debug(`${name}`, ...args),
            info: (...args: any[]) => this.logger.info(`${name}`, ...args),
            warn: (...args: any[]) => this.logger.warn(`${name}`, ...args),
            error: (...args: any[]) => this.logger.error(`${name}`, ...args)
        };
    }

    private get frameworkLogger() {
        return this.getNamedLogger(chalk.rgb(119, 153, 204)("framework"));
    }

    get config() {
        return Object.freeze({ ...this._config });
    }

    get bus() {
        if (this._bus) {
            return this._bus;
        }
        const e = new Error("umiri is not initialized");
        this.logger.error(e);
        throw e;
    }

    get snowflake() {
        if (this._snowflake) {
            return this._snowflake;
        }
        // 初始化 snowflake 实例
        const workerId = this._config.workerId ?? 1;
        this._snowflake = new SnowFlake(workerId);
        return this._snowflake;
    }

    defineConfig<NewConfig extends SakikoConfig>(conf: NewConfig) {
        if (this._started) {
            const e = new Error("cannot redefine config after sakiko started");
            this.frameworkLogger.error(e);
            throw e;
        }
        this._config = { ...this._config, ...conf };
    }

    mergeConfig(conf: object) {
        this._config = merge(this._config, conf);
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

    commit(...matchers: UmiriEventMatcher<any, any>[]) {
        this.bus.register(...matchers);
    }

    load(plugin: SakikoPlugin) {
        if (this._started) {
            this.plugins.load(plugin);
        } else {
            this._plugins_load_on_startup.add(plugin);
        }
    }

    unload(pluginName: string) {
        if (!this._started) {
            this.plugins.unload(pluginName);
        } else {
            this.frameworkLogger.warn(
                `cannot unload plugin ${pluginName} before sakiko started`
            );
        }
    }

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

    async launchWithoutBlock() {
        // 标识框架进入启动状态
        this._started = true;

        // 输出字符画
        console.log(info);

        this.frameworkLogger.info("starting sakiko...");

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

        this.frameworkLogger.info("plugins have been loaded");

        // 调用插件管理器的启动流程
        await this.plugins._runStartUp();

        // 启动完成，输出完成信息
        const endTime = Date.now();
        const duration = endTime - startTime;
        this.frameworkLogger.info(
            `done. (took ${chalk.yellowBright(duration + "ms")})`
        );
    }

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
