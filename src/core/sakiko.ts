import type { ISakikoLogger } from "@/log/interface";
import type { ISakikoPlugin } from "@/plugin/interface";
import type { MatcherBuilder } from "./matcher";
import type { SakikoBot } from "./bot";
import type { SakikoInit } from "@/core/init";
import { UmiriBus } from "@grouptogawa/umiri";
import chalk from "chalk";
import { createDefaultLogger } from "@/log/default";
import { merge } from "@/utils/merge";

/**
 * Sakiko 框架的核心类
 *
 * sakiko 是一个模块化的聊天机器人框架，致力于简化在 TypeScript 中开发跨平台聊天机器人的流程。
 *
 * 你可以在 [Sakiko 的文档网站](https://grouptogawa.github.io/togawa-docs/) 上找到更多信息。
 *
 * the core class of the Sakiko framework
 * 
 * sakiko is a modular chatbot framework that aims to simplify the process of developing cross-platform chatbots in TypeScript.

 * You can find more information on [the documentation site of Sakiko](https://grouptogawa.github.io/togawa-docs/).
 */
export class Sakiko {
    protected readonly _name: string = "sakiko";
    protected readonly _displayName: string =
        "[" + chalk.green(this._name) + "]";
    protected readonly _version: string = "0.4.3";

    private _logger?: ISakikoLogger;
    private _bus?: UmiriBus;

    private _config: object = {};
    private _inited: boolean = false;

    private _plugins: Set<ISakikoPlugin> = new Set();
    private _bots: Map<string, SakikoBot<any>> = new Map();

    /**
     * 获取 Sakiko 中存储的日志记录器
     *
     * 如果未设置自定义日志记录器，则返回默认的控制台日志记录器。
     *
     * get the logger stored in Sakiko
     *
     * if no custom logger is set, return the default console logger.
     *
     * @returns Sakiko 使用的日志记录器 / the logger used by Sakiko
     */
    get logger(): ISakikoLogger {
        return this._logger ?? console;
    }

    /**
     * 创建一个带有显示名称的日志记录器
     *
     * create a logger with display name for the plugin
     *
     * @param displayName - 插件的显示名称 / the display name of the plugin
     * @returns 带有显示名称的日志记录器 / the logger with display name
     */
    getNamedLogger(displayName: string): ISakikoLogger {
        const logger = this.logger;
        const newLogger = {
            _logger: logger,
            _displayName: displayName,
            trace(...args: any[]) {
                this._logger.trace(this._displayName, ...args);
            },
            debug(...args: any[]) {
                this._logger.debug(this._displayName, ...args);
            },
            info(...args: any[]) {
                this._logger.info(this._displayName, ...args);
            },
            warn(...args: any[]) {
                this._logger.warn(this._displayName, ...args);
            },
            error(...args: any[]) {
                this._logger.error(this._displayName, ...args);
            }
        };
        return newLogger;
    }

    /**
     * 获取带有 Sakiko 显示名称的日志记录器
     *
     * get the logger with Sakiko display name
     *
     * @returns 带有 Sakiko 显示名称的日志记录器 / the logger with Sakiko display name
     */
    getSakikoLogger(): ISakikoLogger {
        return this.getNamedLogger(this.displayName);
    }

    /**
     * 获取 Sakiko 中存储的 Umiri 事件总线实例
     *
     * get the Umiri event bus instance stored in Sakiko
     *
     * @returns Sakiko 使用的 Umiri 事件总线实例 / the Umiri event bus instance used by Sakiko
     * @throws 如果 UmiriBus 尚未初始化则抛出错误 / throws an error if the UmiriBus is not initialized yet
     */
    get bus(): UmiriBus {
        if (this._bus) {
            return this._bus;
        }
        const e = new Error("umiri(the event bus) is not initialized yet.");
        this.getSakikoLogger().error(e);
        throw e;
    }

    /**
     * 获取 Sakiko 实例的名称
     *
     * get the name of Sakiko instance
     *
     * @returns Sakiko 的名称 / the name of Sakiko
     */
    get name(): string {
        return this._name;
    }

    /**
     * 获取 Sakiko 实例的显示名称
     *
     * get the display name of Sakiko instance
     *
     * @returns Sakiko 的显示名称 / the display name of Sakiko
     */
    get displayName(): string {
        return this._displayName;
    }

    /**
     * 获取 Sakiko 实例中存储的机器人实例映射
     *
     * get the bot instance map stored in the Sakiko instance
     *
     * @returns Sakiko 实例中存储的机器人实例映射 / the bot instance map stored in the Sakiko instance
     */
    get bots(): Map<string, SakikoBot<any>> {
        return this._bots;
    }

    /**
     * 使用给定的初始化配置初始化 Sakiko 实例
     *
     * initialize the Sakiko instance with the given initialization configuration
     *
     * @param init - 初始化配置 / the initialization configuration
     */
    init(init?: SakikoInit) {
        // TODO: 使init中的配置项可以覆盖withConfig传入的配置项

        if (!init?.noAsciiArt) {
            const ascii_art = chalk.hex("#7799CC")(
                `
    ██                                  ██     
   ██            ▄▄     ▀▀  ▄▄           ██    
  ██ ▄█▀▀▀  ▀▀█▄ ██ ▄█▀ ██  ██ ▄█▀ ▄███▄  ██   
 ██  ▀███▄ ▄█▀██ ████   ██  ████   ██ ██   ██  
██   ▄▄▄█▀ ▀█▄██ ██ ▀█▄ ██▄ ██ ▀█▄ ▀███▀    ██ 

${chalk.hex("#7799CC")("█") + chalk.hex("#335566")("█") + chalk.hex("#BB9955")("█") + chalk.hex("#AA4477")("█") + chalk.hex("#779977")("█") + chalk.reset(chalk.bold(" Sakiko"), chalk.gray("v" + this._version))}
${chalk.reset(`A modular chatbot framework project for ${chalk.bold.underline("TypeScript")}`)}

${chalk.gray(`- For more information or documents about the project, see https://grouptogawa.github.io/togawa-docs/`)}
${chalk.gray(`- @GroupTogawa 2025 | MIT License`)}
    `
            );
            // 打印 ASCII 字符画
            console.log(chalk.cyan(ascii_art));
        }

        // 如果没有提供 logger，则创建一个默认的 tslog logger
        this._logger = init?.logger ?? createDefaultLogger(init?.logLevel);
        this._bus = init?.bus ?? new UmiriBus(this.logger);

        this._inited = true;
        this.getSakikoLogger().info("sakiko initialized successfully.");
    }

    /**
     * 向 Sakiko 实例添加配置项，需要在初始化之前调用此方法
     *
     * add configuration items to the Sakiko instance, which needs to be called before initialization
     *
     * @param conf - 要添加的配置项 / the configuration items to add
     * @throws 如果 Sakiko 实例已经初始化则抛出错误 / throws an error if the Sakiko instance is already initialized
     */
    withConfig<T extends object = object>(conf: T) {
        if (this._inited) {
            const e = new Error("cannot modify config after initialization.");
            this.getSakikoLogger().error(e);
            throw e;
        }
        this._config = merge(this._config, conf);
    }

    /**
     * 获取 Sakiko 实例的配置项访问器
     *
     * get the configuration accessor of the Sakiko instance
     *
     * @returns Sakiko 实例的配置项访问器 / the configuration accessor of the Sakiko instance
     *
     * @example
     * // 方法调用(支持默认值) / method call (with default value)
     * sakiko.config.get('key', 'default');
     * sakiko.config.get<string>('key', 'default');
     *
     * // 直接属性访问 / direct property access
     * sakiko.config.key;
     *
     * // 带类型提示的属性访问 / property access with type hint
     * sakiko.config.of<string>('key');
     */
    get config(): {
        _sakiko: Sakiko;
        get<T = any>(key: string, defaultValue?: T): T | undefined;
        of<T = any>(key: string): T | undefined;
        [key: string]: any;
    } {
        const sakiko = this;
        const configObj = {
            _sakiko: sakiko,
            get<T = any>(key: string, defaultValue?: T): T | undefined {
                return (sakiko._config as any)[key] ?? defaultValue;
            },
            of<T = any>(key: string): T | undefined {
                return (sakiko._config as any)[key];
            }
        };

        return new Proxy(configObj, {
            get(target, prop: string) {
                // 如果访问的是对象自身的属性或方法，直接返回
                if (prop in target) {
                    return (target as any)[prop];
                }
                // 否则从配置对象中获取
                return (sakiko._config as any)[prop];
            }
        });
    }

    /**
     * 获取 Sakiko 实例中加载的所有配置项
     *
     * get all configuration items of the Sakiko instance
     *
     * @returns Sakiko 实例的所有配置项 / all configuration items of the Sakiko instance
     */
    getAllConfigs(): object {
        return { ...this._config };
    }

    /**
     * 获取 Sakiko 实例中加载的所有配置项（别名）
     *
     * get all configuration items of the Sakiko instance (alias)
     *
     * @returns Sakiko 实例的所有配置项 / all configuration items of the Sakiko instance
     */
    get configs(): object {
        return this.getAllConfigs();
    }

    /**
     * 安装一个 Sakiko 插件
     *
     * install a Sakiko plugin
     *
     * @param plugin - 要安装的插件实例 / the plugin instance to install
     * @returns 安装是否成功 / whether the installation is successful
     */
    async install(plugin: ISakikoPlugin) {
        // 检查并补全插件的元信息
        plugin.name = plugin.name ?? "unknown-plugin";
        plugin.displayName =
            plugin.displayName ?? "[" + chalk.blue(plugin.name) + "]";
        plugin.version = plugin.version ?? "0.0.0";
        plugin.description = plugin.description ?? "no description provided.";

        // 为插件创建并存储日志记录器实例
        plugin.logger = this.getNamedLogger(plugin.displayName);

        // 给插件注入一个 uuid 作为唯一标识
        (plugin as any)._uuid = crypto.randomUUID();

        // 调用插件的安装前钩子（如果有）
        if (plugin.beforeInstall) {
            const beforeResult = await plugin.beforeInstall(this);
            if (!beforeResult) {
                this.getSakikoLogger().warn(
                    `plugin ${plugin.name} ${chalk.cyanBright("v" + plugin.version)} "beforeInstall" hook returned false, installation aborted.`
                );
                return false;
            }
        }
        // 调用插件的安装方法
        const result = await plugin.install(this);
        if (result) {
            this.getSakikoLogger().info(
                `plugin "${chalk.greenBright(plugin.name)}" ${chalk.cyanBright("v" + plugin.version)} installed successfully.`
            );
            this.getSakikoLogger().debug(
                chalk.gray(`with uuid ${(plugin as any)._uuid}`)
            );
            this._plugins.add(plugin);

            // 调用插件的安装后钩子（如果有）
            if (plugin.afterInstall) {
                await plugin.afterInstall(this);
            }
            return true;
        }
        // 安装失败，调用清理方法并返回失败状态
        this.getSakikoLogger().warn(
            `plugin ${plugin.name} ${chalk.cyanBright("v" + plugin.version)} installation failed, cleaning up.`
        );
        // 调用清理前钩子（如果有）
        if (plugin.beforeCleanup) {
            await plugin.beforeCleanup();
        }
        // 调用插件的清理方法
        await plugin.cleanup();
        // 调用清理后钩子（如果有）
        if (plugin.afterCleanup) {
            await plugin.afterCleanup();
        }
        return result;
    }

    /**
     * 卸载一个已安装的 Sakiko 插件
     *
     * uninstall an installed Sakiko plugin
     *
     * @param plugin - 要卸载的插件实例 / the plugin instance to uninstall
     * @returns 卸载是否成功 / whether the uninstallation is successful
     */
    async uninstall(plugin: ISakikoPlugin) {
        // 检查插件是否已安装
        if (!this._plugins.has(plugin)) {
            this.getSakikoLogger().warn(
                `plugin ${plugin.name} with uuid ${(plugin as any)._uuid} is not installed yet.`
            );
            return false;
        }
        // 调用插件的卸载前钩子（如果有）
        if (plugin.beforeUninstall) {
            const beforeResult = await plugin.beforeUninstall(this);
            if (!beforeResult) {
                this.getSakikoLogger().warn(
                    `plugin ${plugin.name} ${chalk.cyanBright("v" + plugin.version)} "beforeUninstall" hook returned false, uninstallation aborted.`
                );
                return false;
            }
        }
        // 调用插件的卸载方法
        const result = await plugin.uninstall(this);
        if (result) {
            this._plugins.delete(plugin);
            // 调用插件的卸载后钩子（如果有）
            if (plugin.afterUninstall) {
                await plugin.afterUninstall(this);
            }
            this.getSakikoLogger().info(
                `plugin "${chalk.greenBright(plugin.name)}" ${chalk.cyanBright("v" + plugin.version)} with uuid ${chalk.gray((plugin as any)._uuid)} uninstalled successfully.`
            );
            return true;
        }
        return result;
    }

    /**
     * 根据机器人 ID 获取对应的 Sakiko 机器人实例
     *
     * get the corresponding Sakiko bot instance by bot ID
     *
     * @param selfId - 机器人的 ID / the ID of the bot
     * @returns 对应的 Sakiko 机器人实例 / the corresponding Sakiko bot instance
     */
    getBot(selfId: string): SakikoBot<any> | undefined {
        return this._bots.get(selfId);
    }

    /**
     * 向 Sakiko 实例添加一个机器人实例
     *
     * add a bot instance to the Sakiko instance
     *
     * @param bot - 要添加的机器人实例 / the bot instance to add
     */
    addBot(bot: SakikoBot<any>): void {
        // 首先要检测该机器人是否已经存在
        if (this._bots.has(bot.selfId)) {
            this.getSakikoLogger().warn(
                `bot with selfId ${bot.selfId} already exists, stop adding.`
            );
            return;
        }
        this._bots.set(bot.selfId, bot);
    }

    /**
     * 从 Sakiko 实例中移除一个机器人实例
     *
     * remove a bot instance from the Sakiko instance
     *
     * @param selfId - 要移除的机器人的 ID / the ID of the bot to remove
     */
    removeBot(selfId: string): void {
        if (!this._bots.has(selfId)) {
            this.getSakikoLogger().warn(
                `bot with selfId ${selfId} does not exist, stop removing.`
            );
            return;
        }
        this._bots.delete(selfId);
    }

    /**
     * 启动 Sakiko 实例，运行已安装的插件的启动前钩子
     *
     * start the Sakiko instance and run the installed plugins' before start hooks
     */
    async runWithoutBlock() {
        this.getSakikoLogger().info("starting sakiko...");
        // 计时计算整个启动流程花费的时间
        const startTime = Date.now();

        // 触发所有已安装插件的 beforeSakikoStart 钩子（如果有）
        for (const plugin of this._plugins) {
            if (plugin.beforeSakikoStart) {
                await plugin.beforeSakikoStart();
            }
        }

        const endTime = Date.now();
        const duration = endTime - startTime;
        this.getSakikoLogger().info(
            `done. (took ${chalk.yellowBright(duration + "ms")})`
        );
    }

    /**
     * 启动 Sakiko 实例并阻塞主线程，直到收到 SIGINT 信号
     *
     * start the Sakiko instance and block the main thread until receiving SIGINT signal
     */
    async run() {
        let stopping = false;

        const onSigint = async () => {
            if (stopping) return; // 阻止多次 stop
            stopping = true;
            console.log(); // 换行以美化输出
            this.getSakikoLogger().warn(
                "received sigint, starting shutdown..."
            );
            try {
                await this.stop(); // 确认所有资源释放
            } catch (err) {
                this.getSakikoLogger().error("error during stop:", err);
            }

            this.getSakikoLogger().info("shutdown complete, exiting.");
            this.getSakikoLogger().info("goodbye.");

            process.exit(0); // 只有等所有插件 stop 完再真正退出
        };
        process.on("SIGINT", onSigint);

        await this.runWithoutBlock();

        // 防止主线程提前退出
        await new Promise(() => {}); // 永远 pending，直到 SIGINT 导致 exit
    }

    /**
     * 启动 Sakiko 实例（run() 的别名）
     *
     * start the Sakiko instance (alias)
     */
    async start() {
        await this.run();
    }

    /**
     * 停止 Sakiko 实例，卸载所有已安装的插件
     *
     * stop the Sakiko instance and uninstall all installed plugins
     */
    async stop() {
        // 卸载全部已安装的插件
        for (const plugin of Array.from(this._plugins)) {
            await this.uninstall(plugin);
        }

        // 发送 sigint 信号保证进程退出
        process.kill(process.pid, "SIGINT");
    }

    /**
     * 注册一个事件匹配器到 Sakiko 实例的事件总线
     *
     * register an event matcher to the event bus of the Sakiko instance
     *
     * @param matcher - 要注册的事件匹配器 / the event matcher to register
     * @returns 注销该事件匹配器的函数 / the function to unregister the event matcher
     */
    match(matcher: MatcherBuilder<any, any, any>) {
        // 把matcher构建成事件处理器并注册到bus上
        try {
            const handler = matcher.build(this);
            const unregister = this.bus.register(handler);
            return unregister;
        } catch (e) {
            this.getSakikoLogger().error(
                `failed to register matcher with details: ets=[${matcher.ets
                    .map((et) => et.name)
                    .join(", ")}], ct=${matcher.ct.name}`,
                e
            );
        }
        return () => {};
    }
}
