import { PKG_NAME, VERSION } from "../global";
import type { UmiriEvent, UmiriEventConstructor } from "./event";

import type { ILogger } from "@togawa-dev/utils";
import type { SnowFlake } from "@togawa-dev/utils/snowflake";
import type { UmiriBot } from "./bot";
import type { UmiriEventMatcher } from "./matcher";
import { createUmiriContext } from "./context";

/**
 * Umiri 事件总线
 *
 * Umiri Event Bus
 */
export class Umiri {
    private matchersMap = new Map<
        number,
        Map<UmiriEventConstructor<any>, Set<UmiriEventMatcher<any, any>>>
    >();

    private registeredMatchers = new Set<UmiriEventMatcher<any, any>>();

    private handling: boolean = false;

    constructor(
        protected readonly sfNode: SnowFlake,
        protected readonly logger: ILogger = console
    ) {}

    get version() {
        return VERSION;
    }

    get pkgName() {
        return PKG_NAME;
    }

    getTotalRegisteredMatcherCount() {
        return this.registeredMatchers.size;
    }

    getTotalRegisteredPriorityCount() {
        return this.matchersMap.size;
    }

    getTotalRegisteredEventTypeCount() {
        const countedEventTypes = new Set<UmiriEventConstructor<any>>();
        for (const priorityMap of this.matchersMap.values()) {
            for (const et of priorityMap.keys()) countedEventTypes.add(et);
        }
        return countedEventTypes.size;
    }

    startHandling() {
        this.handling = true;
    }

    stopHandling() {
        this.handling = false;
    }

    match(...ems: UmiriEventMatcher<any, any>[]) {
        for (const eh of ems) {
            if (this.registeredMatchers.has(eh)) continue; // 这个事件匹配器已经被注册过，跳过
            // 遍历每个事件类型
            eh.ets.forEach((et) => {
                // 获取该优先级的匹配器映射
                let priorityMap = this.matchersMap.get(eh.priority);
                // 如果这个优先级对应的映射不存在，则创建一个新的映射
                if (!priorityMap) {
                    priorityMap = new Map<UmiriEventConstructor<any>, any>();
                    this.matchersMap.set(eh.priority, priorityMap);
                }
                // 获取这个优先级映射下的事件匹配器集合
                let matchers = priorityMap.get(et);
                // 如果这个事件类型对应的匹配器集合不存在，则创建一个新的集合
                if (!matchers) {
                    matchers = new Set<UmiriEventMatcher<any, any>>();
                    priorityMap.set(et, matchers);
                }
                // 将事件匹配器添加到集合中
                matchers.add(eh);
                // 标记这个事件匹配器为已注册
                this.registeredMatchers.add(eh);
            });
        }

        // 返回一个取消注册的函数
        return () => this.unmatch(...ems);
    }

    unmatch(...ems: UmiriEventMatcher<any, any>[]) {
        for (const eh of ems) {
            if (!this.registeredMatchers.has(eh)) continue; // 这个事件匹配器没有被注册过，跳过
            // 遍历每个事件类型
            eh.ets.forEach((et) => {
                const priorityMap = this.matchersMap.get(eh.priority);
                if (!priorityMap) return; // 这个优先级没有任何注册，跳过
                const matchers = priorityMap.get(et);
                if (!matchers) return; // 这个事件类型没有任何注册，跳过
                matchers.delete(eh); // 从集合中删除事件匹配器
                // 如果集合为空，则从映射中删除该事件类型
                if (matchers.size === 0) {
                    priorityMap.delete(et);
                }
                // 如果优先级映射为空，则从总映射中删除该优先级
                if (priorityMap.size === 0) {
                    this.matchersMap.delete(eh.priority);
                }
                // 标记这个事件匹配器为未注册
                this.registeredMatchers.delete(eh);
            });
        }
    }

    async publish<Bot extends UmiriBot, Event extends UmiriEvent<any, Bot>>(
        bot: Bot,
        event: Event
    ): Promise<void> {
        // 如果事件总线没有启动处理，直接返回
        if (!this.handling) {
            return;
        }

        // 获取当前可用的优先级列表，并按从高到低排序
        const priorities = Array.from(this.matchersMap.keys()).sort(
            (a, b) => b - a
        );

        let blocked = false; // 标识是否被阻塞的 flag

        // 遍历每个优先级，从高到低处理事件
        for (const priority of priorities) {
            this.logger.debug(`collecting matchers on priority ${priority}`);

            if (blocked) break; // 如果被阻塞，跳出循环

            const priorityMap = this.matchersMap.get(priority); // 获取对应优先级的匹配器映射
            if (!priorityMap) continue; // 这个优先级没有任何注册，跳过

            // 匹配并收集当前优先级下可用的事件匹配器
            let matchers: Set<UmiriEventMatcher<any, any>> = new Set();
            for (const [et, hs] of priorityMap.entries()) {
                if (event instanceof et) {
                    // 如果事件实例是这一事件类型的子类型，则收集这个匹配器
                    hs.forEach((matcher) => matchers.add(matcher));
                }
            }

            if (matchers.size === 0) continue; // 如果没有匹配到任何匹配器，跳过

            this.logger.debug(
                `collected ${matchers.size} available matchers on priority ${priority}`
            );

            // 收集到当前优先级下的可用匹配器后，并发执行所有匹配器
            const tasks = Array.from(matchers).map((matcher) => async () => {
                // 创建事件处理上下文
                const ctx = createUmiriContext(this.sfNode, bot, event);

                // 创建处理任务
                const task = async () => {
                    // 执行中间件链
                    let c: typeof ctx = ctx;
                    let ctn = true; // 标识是否继续处理的 flag

                    for (const mw of matcher.mws || []) {
                        const [newC, isCtn] = mw(c);
                        c = newC;
                        if (!isCtn) {
                            // 中间件取消了处理，跳过这个处理流程
                            ctn = false;
                            break;
                        }
                    }
                    if (!ctn) return; // 中间件取消了处理，跳过这个处理流程

                    // 执行处理函数
                    const result = await matcher.action(c); // result 返回 false 则表示阻塞后续优先级的处理
                    // 如果 result 为 undefined，则视为 true（不阻塞）
                    const shouldContinue = result === undefined ? true : result;
                    if (!shouldContinue) {
                        blocked = true; // 如果处理函数返回 false 且设置了阻塞，则标记为阻塞，不再继续后续优先级的处理
                        this.logger.debug(
                            `handling blocked by matcher on priority ${priority}`
                        );
                    }
                };
                // 处理任务的超时机制
                if (matcher.timeout) {
                    // 对这个task设置竞速
                    await Promise.race([
                        task(),
                        new Promise((_, rej) =>
                            setTimeout(
                                () =>
                                    rej(
                                        new Error(
                                            `matcher timed out after ${matcher.timeout} ms`
                                        )
                                    ),
                                matcher.timeout
                            )
                        )
                    ]);
                } else {
                    // 否则直接执行任务
                    await task();
                }
            });

            // 并发执行所有任务
            this.logger.debug(
                `handling ${tasks.length} matchers on priority ${priority}`
            );
            await Promise.all(tasks.map((t) => t()));
        }

        this.logger.debug(`collecting completed`);
    }
}
