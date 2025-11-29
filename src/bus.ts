import type { ILogger } from "@/logger";
import type { ISakikoAdapter } from "./adapter";
import { Event } from "./builtin";

const BUILDER_LOCKED_ERROR_MESSAGE = "Builder is locked after handle() call";

/**
 * 用于在事件处理流程中管理上下文的上下文管理器
 *
 * The context manager for event handling flow
 */
export class EventHandleContext {
  /** 匹配到的文本 The text that matched the pattern */
  matchedText?: string;

  /** 正则表达式匹配组 The regex match groups */
  regexGroup?: string[];
  /** 正则表达式匹配字典 The regex match dictionary */
  regexDict?: Record<string, string>;
  [key: string]: any;
}

/**
 * 事件类型的构造器定义
 *
 * The constructor definition for event types
 */
export type EventConstructor<T extends Event = Event> = new (
  ...args: any[]
) => T;

/**
 * 事件处理器的规则函数类型定义
 *
 * The type definition of rule functions for event handlers
 */
export type Rule<T extends Event = Event> =
  | ((event: T, ctx: EventHandleContext) => boolean | Promise<boolean>)
  | ((event: T) => boolean | Promise<boolean>)
  | (() => boolean | Promise<boolean>);

/**
 * 事件处理器的预处理器函数类型定义
 *
 * The type definition of processor functions for event handlers
 */
export type Processor<T extends Event = Event> =
  | ((event: T, ctx: EventHandleContext) => T | Promise<T>)
  | ((event: T) => T | Promise<T>);

/**
 * 事件处理器的主处理函数类型定义
 *
 * The type definition of main handler functions for event handlers
 */
export type Handler<
  T extends Event = Event,
  U extends ISakikoAdapter = ISakikoAdapter
> = (
  event: T,
  ctx: EventHandleContext,
  adapter: U
) => void | boolean | Promise<void | boolean>;

/**
 * 事件处理器的构建器的接口定义
 *
 * The interface definition of event handler builders
 */
export interface EventHandlerBuilder<
  T extends Event = Event,
  U extends ISakikoAdapter = ISakikoAdapter
> {
  priority(priority: number): EventHandlerBuilder<T, U>;
  block(block: boolean): EventHandlerBuilder<T, U>;
  timeout(timeout: number): EventHandlerBuilder<T, U>;

  // Rule重载
  match(matcher: () => boolean | Promise<boolean>): EventHandlerBuilder<T, U>;
  match(
    matcher: (event: T) => boolean | Promise<boolean>
  ): EventHandlerBuilder<T, U>;
  match(
    matcher: (event: T, ctx: EventHandleContext) => boolean | Promise<boolean>
  ): EventHandlerBuilder<T, U>;

  // Processor重载
  process(processor: (event: T) => T | Promise<T>): EventHandlerBuilder<T, U>;
  process(
    processor: (event: T, ctx: EventHandleContext) => T | Promise<T>
  ): EventHandlerBuilder<T, U>;

  handle(handler: Handler<T, U>): () => void;
}

/**
 * 事件处理器的类型结构定义
 *
 * The type structure definition of event handlers
 */
export type EventHandler<
  T extends Event = Event,
  U extends ISakikoAdapter = ISakikoAdapter
> = {
  priority: number;
  block: boolean;
  timeout?: number;
  rules?: Set<Rule<T>>;
  processors?: Processor<T>[];
  handler: Handler<T, U>;
};

/**
 * 事件总线接口定义
 *
 * The interface definition of event bus
 */
export interface IEventBus<U extends ISakikoAdapter = ISakikoAdapter> {
  on<TEvents extends Event[]>(
    ...ets: { [K in keyof TEvents]: EventConstructor<TEvents[K]> }
  ): EventHandlerBuilder<TEvents[number], U>;

  emit<T extends Event = Event, U extends ISakikoAdapter = ISakikoAdapter>(
    event: T,
    adapter: U
  ): Promise<void>;
}

/**
 * Umiri
 *
 * Sakiko 的默认本地事件总线实现
 *
 * The default local event bus implementation of Sakiko
 */
export class Umiri implements IEventBus {
  private handlerMap = new Map<number, Map<EventConstructor<any>, Set<any>>>();

  private logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger;
  }

  /**
   * 在事件总线上注册事件处理器
   *
   * Register event handlers on the event bus
   * @param ets 处理器需要监听的事件类型构造器列表 The list of event type constructors that the handler needs to listen to
   * @returns 用于链式调用以完成事件处理器构建的构建器对象 The builder object for chaining calls to complete the event handler construction
   */
  on<TEvents extends Event[], U extends ISakikoAdapter = ISakikoAdapter>(
    ...ets: { [K in keyof TEvents]: EventConstructor<TEvents[K]> }
  ): EventHandlerBuilder<TEvents[number], U> {
    // 解决传入多个类型构造器参数时的泛型推导问题
    // 把原来 on 函数内部的实现的 T 换成 TEvents[number]
    type T = TEvents[number];

    // 事件类型的构造器定义
    let priority = 0;
    let block = false;
    let timeout: number | undefined = undefined;
    let rules: Set<Rule<T>> = new Set();
    let processors: Processor<T>[] = [];

    let handled = false;

    const umiri = this;
    const builder: EventHandlerBuilder<T, U> = {
      priority(p: number) {
        if (handled) throw new Error(BUILDER_LOCKED_ERROR_MESSAGE);
        priority = p;
        return builder;
      },
      block(b: boolean) {
        if (handled) throw new Error(BUILDER_LOCKED_ERROR_MESSAGE);
        block = b;
        return builder;
      },
      timeout(t: number) {
        if (handled) throw new Error(BUILDER_LOCKED_ERROR_MESSAGE);
        timeout = t;
        return builder;
      },
      match(matcher: Rule<T>) {
        if (handled) throw new Error(BUILDER_LOCKED_ERROR_MESSAGE);
        rules.add(matcher);
        return builder;
      },
      process(processor: Processor<T>) {
        if (handled) throw new Error(BUILDER_LOCKED_ERROR_MESSAGE);
        processors.push(processor);
        return builder;
      },
      handle(handler: Handler<T, U>): () => void {
        if (handled) throw new Error(BUILDER_LOCKED_ERROR_MESSAGE);
        handled = true;
        // 记录所有注册的 {priority, et, handlers, handlerObj} 以便后续取消
        const registered: Array<{
          priority: number;
          et: EventConstructor<T>;
          handlers: Set<EventHandler<T, U>>;
          handlerObj: EventHandler<T, U>;
        }> = [];
        ets.forEach((et) => {
          let priorityMap = umiri.handlerMap.get(priority);
          if (!priorityMap) {
            priorityMap = new Map();
            umiri.handlerMap.set(priority, priorityMap);
          }
          let handlers = priorityMap.get(et);
          if (!handlers) {
            handlers = new Set();
            priorityMap.set(et, handlers);
          }
          const handlerObj: EventHandler<T, U> = {
            priority,
            block,
            timeout,
            rules: rules.size ? rules : undefined,
            processors: processors.length ? processors : undefined,
            handler
          };
          handlers.add(handlerObj);
          registered.push({ priority, et, handlers, handlerObj });
        });
        // 返回取消订阅函数
        return () => {
          for (const { priority, et, handlers, handlerObj } of registered) {
            handlers.delete(handlerObj);
            // 如果该事件类型下已无处理器，移除该事件类型
            if (handlers.size === 0) {
              const priorityMap = umiri.handlerMap.get(priority);
              if (priorityMap) {
                priorityMap.delete(et);
                // 如果该优先级下已无事件类型，移除该优先级
                if (priorityMap.size === 0) {
                  umiri.handlerMap.delete(priority);
                }
              }
            }
          }
        };
      }
    };
    return builder;
  }

  /**
   * 向事件总线发布事件并触发相应的事件处理器
   *
   * Emit an event on the event bus and trigger the corresponding event handlers
   * @param event 要发布的事件 The event to be emitted
   */
  async emit<
    T extends Event = Event,
    U extends ISakikoAdapter = ISakikoAdapter
  >(event: T, adapter: U): Promise<void> {
    // 获取当前的可用优先级列表
    const priorities = Array.from(this.handlerMap.keys()).sort((a, b) => b - a); // 从高到低排序

    let blocked = false; // 阻断 flag
    for (const priority of priorities) {
      if (blocked) break;

      const priorityMap = this.handlerMap.get(priority);
      if (!priorityMap) continue;

      // 依次匹配并收集每个优先级的事件处理器
      let handlersAtType: Set<EventHandler<T>> = new Set();
      for (const [et, handlers] of priorityMap.entries()) {
        if (event instanceof et) {
          // 这里通过类型实例信息来匹配事件类型
          // 如果这个事件类型是目标事件类型或者是它的子类，那么这个instanceof判断会返回true
          for (const handlerObj of handlers) {
            handlersAtType.add(handlerObj as EventHandler<T>);
          }
        }
      }

      // 收集到当前优先级的所有处理器后，并发执行这些处理器
      const tasks = Array.from(handlersAtType).map((handlerObj) => async () => {
        // 创建事件处理上下文
        const ctx = new EventHandleContext();

        const task = async () => {
          // 规则检查
          if (handlerObj.rules) {
            const ruleResults = await Promise.all(
              Array.from(handlerObj.rules).map((rule) => {
                if (rule.length === 0) {
                  return (rule as () => boolean | Promise<boolean>)();
                } else if (rule.length === 1) {
                  return (rule as (e: T) => boolean | Promise<boolean>)(event);
                } else {
                  return (
                    rule as (
                      e: T,
                      ctx: EventHandleContext
                    ) => boolean | Promise<boolean>
                  )(event, ctx);
                }
              })
            );
            if (!ruleResults.every(Boolean)) return;
          }

          // 顺序执行预处理函数
          let processedEvent = event;
          if (handlerObj.processors) {
            for (const processor of handlerObj.processors) {
              if (processor.length === 1) {
                processedEvent = await (processor as (e: T) => T | Promise<T>)(
                  processedEvent
                );
              } else {
                processedEvent = await (
                  processor as (e: T, ctx: EventHandleContext) => T | Promise<T>
                )(processedEvent, ctx);
              }
            }
          }

          // 执行处理函数
          let result: void | boolean | Promise<void | boolean>;

          // 根据 handler 函数的参数长度决定调用方式
          if (handlerObj.handler.length === 1) {
            result = await (
              handlerObj.handler as (
                event: T
              ) => void | boolean | Promise<void | boolean>
            )(processedEvent);
          } else if (handlerObj.handler.length === 2) {
            result = await (
              handlerObj.handler as unknown as (
                event: T,
                ctx: EventHandleContext
              ) => void | boolean | Promise<void | boolean>
            )(processedEvent, ctx);
          } else {
            result = await (
              handlerObj.handler as (
                event: T,
                ctx: EventHandleContext,
                adapter: U
              ) => void | boolean | Promise<void | boolean>
            )(processedEvent, ctx, adapter);
          }

          if (handlerObj.block && result === false) {
            blocked = true;
          }
        };
        // 处理超时逻辑
        if (handlerObj.timeout) {
          // 对这个处理器的 task 设置竞速
          await Promise.race([
            task(),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("timeout")), handlerObj.timeout)
            )
          ]).catch(() => {});
        } else {
          await task();
        }
      });
      // 并发执行所有 task
      await Promise.all(tasks.map((t) => t()));
    }
  }
}
