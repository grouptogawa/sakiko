import type { SakikoAdapter } from "@/adapter";
import {
  type EventConstructor,
  type EventHandlerBuilder,
  type IEventBus,
  Umiri
} from "@/bus";
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

  private adapters: SakikoAdapter[] = [];

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
  apply(adapter: SakikoAdapter): void {
    try {
      adapter.init(this);
      this.adapters.push(adapter);
      this.info(`adapter ${adapter.name} applied.`);
    } catch (error) {
      this.error(`failed to apply adapter ${adapter.name}:`, error);
    }
  }

  /**
   * 启动 Sakiko 框架
   *
   * Start the Sakiko framework
   */
  async run() {
    // 并发启动所有已应用的适配器
    await Promise.all(
      this.adapters.map(async (adapter) => {
        try {
          await adapter.start();
        } catch (error) {
          this.error(`failed to run adapter ${adapter.name}:`, error);
        }
      })
    );

    // 挂起主线程，防止进程退出
    await new Promise(() => {});
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
  getAllAdapters(): SakikoAdapter[] {
    return this.adapters;
  }

  /**
   * 事件总线的快捷订阅方法
   *
   * A shortcut method to access the event bus
   */
  on<T extends Event>(...ets: EventConstructor<T>[]): EventHandlerBuilder<T> {
    return this.bus.on(...ets);
  }

  /**
   * 事件总线的快捷发布方法
   *
   * A shortcut method to emit events to the event bus
   */
  async emit<T extends Event>(event: T, adapter: SakikoAdapter): Promise<void> {
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
export * from "@/logger";
export * from "@/utils";
