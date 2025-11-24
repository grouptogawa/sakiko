import type { ILogger } from "@/logger";
import type { SakikoAdapter } from "./adapter";

const BUILDER_LOCKED_ERROR_MESSAGE = "Builder is locked after handle() call";

/**
 * 事件总线上传递的基本事件类型
 *
 * The basic event type passed on the event bus
 */
export class Event {}

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
export type Rule<T extends Event> =
  | ((event: T) => boolean | Promise<boolean>)
  | (() => boolean | Promise<boolean>);

/**
 * 事件处理器的匹配器函数类型定义
 *
 * The type definition of matcher functions for event handlers
 */
export type Matcher<T extends Event> = (event: T) => boolean | Promise<boolean>;

/**
 * 事件处理器的预处理器函数类型定义
 *
 * The type definition of processor functions for event handlers
 */
export type Processor<T extends Event> = (event: T) => T | Promise<T>;

/**
 * 事件处理器的主处理函数类型定义
 *
 * The type definition of main handler functions for event handlers
 */
export type Handler<T extends Event> =
  | ((event: T) => void | boolean | Promise<void | boolean>)
  | ((
      event: T,
      adapter: SakikoAdapter
    ) => void | boolean | Promise<void | boolean>);

/**
 * 事件处理器的构建器的接口定义
 *
 * The interface definition of event handler builders
 */
export interface EventHandlerBuilder<T extends Event> {
  priority(priority: number): EventHandlerBuilder<T>;
  block(block: boolean): EventHandlerBuilder<T>;
  timeout(timeout: number): EventHandlerBuilder<T>;
  check(rule: Rule<T>): EventHandlerBuilder<T>;
  match(matcher: Matcher<T>): EventHandlerBuilder<T>;
  process(processor: Processor<T>): EventHandlerBuilder<T>;
  handle(handler: Handler<T>): () => void;
}

/**
 * 事件处理器的类型结构定义
 *
 * The type structure definition of event handlers
 */
export type EventHandler<T extends Event> = {
  priority: number;
  block: boolean;
  timeout?: number;
  rules?: Set<Rule<T>>;
  matchers?: Set<Matcher<T>>;
  processors?: Processor<T>[];
  handler: Handler<T>;
};

/**
 * 事件总线接口定义
 *
 * The interface definition of event bus
 */
export interface IEventBus {
  on<T extends Event>(...ets: EventConstructor<T>[]): EventHandlerBuilder<T>;
  emit<T extends Event>(event: T, adapter: SakikoAdapter): Promise<void>;
}

/**
 * Umiri
 *
 * Sakiko 的默认本地事件总线实现
 *
 * The default local event bus implementation of Sakiko
 */
export class Umiri implements IEventBus {
  private handlerMap = new Map<
    number,
    Map<EventConstructor<any>, Set<EventHandler<any>>>
  >();

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
  on<T extends Event>(...ets: EventConstructor<T>[]): EventHandlerBuilder<T> {
    // 事件类型的构造器定义
    let priority = 0;
    let block = false;
    let timeout: number | undefined = undefined;
    let rules: Set<Rule<T>> = new Set();
    let matchers: Set<Matcher<T>> = new Set();
    let processors: Processor<T>[] = [];

    let handled = false;

    const umiri = this;
    const builder: EventHandlerBuilder<T> = {
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
      check(rule: Rule<T>) {
        if (handled) throw new Error(BUILDER_LOCKED_ERROR_MESSAGE);
        rules.add(rule);
        return builder;
      },
      match(matcher: Matcher<T>) {
        if (handled) throw new Error(BUILDER_LOCKED_ERROR_MESSAGE);
        matchers.add(matcher);
        return builder;
      },
      process(processor: Processor<T>) {
        if (handled) throw new Error(BUILDER_LOCKED_ERROR_MESSAGE);
        processors.push(processor);
        return builder;
      },
      handle(handler: Handler<T>): () => void {
        if (handled) throw new Error(BUILDER_LOCKED_ERROR_MESSAGE);
        handled = true;
        // 记录所有注册的 {priority, et, handlers, handlerObj} 以便后续取消
        const registered: Array<{
          priority: number;
          et: EventConstructor<T>;
          handlers: Set<EventHandler<T>>;
          handlerObj: EventHandler<T>;
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
          const handlerObj: EventHandler<T> = {
            priority,
            block,
            timeout,
            rules: rules.size ? rules : undefined,
            matchers: matchers.size ? matchers : undefined,
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
  async emit<T extends Event>(event: T, adapter: SakikoAdapter): Promise<void> {
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
        const task = async () => {
          // 规则检查
          if (handlerObj.rules) {
            const ruleResults = await Promise.all(
              Array.from(handlerObj.rules).map((rule) =>
                rule.length === 0
                  ? (rule as () => boolean | Promise<boolean>)()
                  : (rule as (e: T) => boolean | Promise<boolean>)(event)
              )
            );
            if (!ruleResults.every(Boolean)) return;
          }

          // 匹配器检查
          if (handlerObj.matchers) {
            const matcherResults = await Promise.all(
              Array.from(handlerObj.matchers).map((matcher) => matcher(event))
            );
            if (!matcherResults.every(Boolean)) return;
          }

          // 顺序执行预处理函数
          let processedEvent = event;
          if (handlerObj.processors) {
            for (const processor of handlerObj.processors) {
              processedEvent = await processor(processedEvent);
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
          } else {
            result = await (
              handlerObj.handler as (
                event: T,
                adapter: SakikoAdapter
              ) => void | boolean | Promise<void | boolean>
            )(processedEvent, adapter);
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
