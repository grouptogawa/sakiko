import type { ISakikoAdapter } from "@/adapter";
import { Event } from "@/builtin";
import {
  type EventConstructor,
  type EventHandlerBuilder,
  type IEventBus,
  Umiri
} from "@/bus";
import { ANSI_BOLD, ANSI_GREEN, ANSI_RESET } from "@/colors";
import type { ILogger } from "@/logger";
import { SnowFlake, type SnowFlakeOptions } from "@/utils";

// Sakiko 的配置选项接口定义
// The interface definition of Sakiko configuration options
interface SakikoOptions {
  logger?: ILogger;
  bus?: IEventBus;
  nodeId?: number;
  sfOptions?: SnowFlakeOptions;
}

/**
 * # Sakiko
 *
 * 一个轻量级的事件驱动通信框架，为聊天机器人应用提供简洁高效的 API 和快速开发体验
 *
 * A lightweight event-driven communication framework that provides a simple and efficient API and rapid development experience for chatbot applications
 */
export class Sakiko {
  private logger: ILogger;
  private bus: IEventBus;
  private nodeId: number;
  private snowflake: SnowFlake;

  private adapters: ISakikoAdapter[] = [];

  private stopPromise: Promise<void> | null = null;
  private resolveStopPromise: (() => void) | null = null;

  private displayName = ANSI_BOLD + "sakiko" + ANSI_RESET;

  constructor(options?: SakikoOptions) {
    this.logger = options?.logger || console;
    this.bus = options?.bus || new Umiri(this.logger);
    this.nodeId = options?.nodeId || 1;
    this.snowflake = new SnowFlake(this.nodeId, options?.sfOptions);
  }

  static init(options?: SakikoOptions): Sakiko {
    return new Sakiko(options);
  }

  /**
   * 输出一条 trace 级别的日志
   *
   * Output a trace level log
   * @param args 要输出的日志内容 The content of the log to be output
   */
  trace(...args: any[]): void {
    this.logger.trace(...args);
  }

  /**
   * 输出一条 debug 级别的日志
   *
   * Output a debug level log
   * @param args 要输出的日志内容 The content of the log to be output
   */
  debug(...args: any[]): void {
    this.logger.debug(...args);
  }

  /**
   * 输出一条 info 级别的日志
   *
   * Output an info level log
   * @param args 要输出的日志内容 The content of the log to be output
   */
  info(...args: any[]): void {
    this.logger.info(...args);
  }

  /**
   * 输出一条 warn 级别的日志
   *
   * Output a warn level log
   * @param args 要输出的日志内容 The content of the log to be output
   */
  warn(...args: any[]): void {
    this.logger.warn(...args);
  }

  /**
   * 输出一条 error 级别的日志
   *
   * Output an error level log
   * @param args 要输出的日志内容 The content of the log to be output
   */
  error(...args: any[]): void {
    this.logger.error(...args);
  }

  /**
   * 应用一个适配器到 Sakiko 框架中
   *
   * Apply an adapter to the Sakiko framework
   * @param adapter 要应用的适配器 The adapter to be applied
   */
  apply(adapter: ISakikoAdapter): void {
    try {
      adapter.init(this);
      this.adapters.push(adapter);
      this.info(
        `[${this.displayName}] adapter ${ANSI_GREEN}${adapter.name}${ANSI_RESET} applied.`
      );
    } catch (error) {
      this.error(
        `[${this.displayName}] failed to apply adapter ${ANSI_GREEN}${adapter.name}${ANSI_RESET}:`,
        error
      );
    }
  }

  /**
   * 启动 Sakiko 框架
   *
   * Start the Sakiko framework
   */
  async run() {
    this.debug(`[${this.displayName}] running sakiko...`);
    // 并发启动所有已应用的适配器
    await Promise.all(
      this.adapters.map(async (adapter) => {
        try {
          await adapter.start();
        } catch (error) {
          this.error(
            `[${this.displayName}] failed to run adapter ${ANSI_GREEN}${adapter.name}${ANSI_RESET}:`,
            error
          );
        }
      })
    );

    // 创建一个可解决的Promise来等待停止信号
    this.stopPromise = new Promise<void>((resolve) => {
      this.resolveStopPromise = resolve;
    });

    // 等待停止信号
    await this.stopPromise;

    this.debug(`[${this.displayName}] run() function completed.`);
  }

  /**
   * 停止 Sakiko 框架
   *
   * Stop the Sakiko framework
   */
  async stop() {
    this.debug(`[${this.displayName}] stopping sakiko...`);

    // 并发停止所有已应用的适配器
    await Promise.all(
      this.adapters.map(async (adapter) => {
        try {
          await adapter.stop();
        } catch (error) {
          this.error(
            `[${this.displayName}] failed to stop adapter ${ANSI_GREEN}${adapter.name}${ANSI_RESET}:`,
            error
          );
        }
      })
    );

    // 发送停止信号，使run()函数中的Promise完成
    if (this.resolveStopPromise) {
      this.resolveStopPromise();
      this.resolveStopPromise = null;
      this.stopPromise = null;
    }

    this.info(`[${this.displayName}] sakiko stopped, goodbye`);
  }

  /**
   * 获取 SnowFlake ID 生成器实例
   *
   * Get the SnowFlake ID generator instance
   */
  snowflakeGenerator(): SnowFlake {
    return this.snowflake;
  }

  /**
   * 获取当前 Bot 的节点 ID
   *
   * Get the current node ID
   */
  getNodeId(): number {
    return this.nodeId;
  }

  /**
   * 获取事件总线实例
   *
   * Get the event bus instance
   */
  getBus<T extends IEventBus = IEventBus>(): T {
    return this.bus as T;
  }

  /**
   * 获取日志记录器实例
   *
   * Get the logger instance
   */
  getLogger<T extends ILogger = ILogger>(): T {
    return this.logger as T;
  }

  /**
   * 获取所有已应用的适配器实例
   *
   * Get all applied adapter instances
   * @returns
   */
  getAllAdapters(): ISakikoAdapter[] {
    return this.adapters;
  }

  /**
   * 事件总线的快捷订阅方法
   *
   * A shortcut method to access the event bus
   */
  on<TEvents extends Event[], U extends ISakikoAdapter = ISakikoAdapter>(
    ...ets: { [K in keyof TEvents]: EventConstructor<TEvents[K]> }
  ): EventHandlerBuilder<TEvents[number], U> {
    return this.bus.on(...ets) as EventHandlerBuilder<TEvents[number], U>;
  }

  /**
   * 事件总线的快捷发布方法
   *
   * A shortcut method to emit events to the event bus
   */
  async emit<
    T extends Event = Event,
    U extends ISakikoAdapter = ISakikoAdapter
  >(event: T, adapter: U): Promise<void> {
    return this.bus.emit(event, adapter);
  }
}

/**
 * 创建一个 Sakiko 实例
 * Create a Sakiko instance
 * @param options Sakiko 的配置选项 Sakiko configuration options
 * @returns Sakiko 实例 Sakiko instance
 */
export function sakiko(options?: SakikoOptions): Sakiko {
  return new Sakiko(options);
}

export * from "@/adapter";
export * from "@/builtin";
export * from "@/bus";
export * from "@/colors";
export * from "@/logger";
export * from "@/rule";
export * from "@/utils";
