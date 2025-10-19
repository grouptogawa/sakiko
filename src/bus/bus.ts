import { type EventHandler } from "../core/handler";
import { type INullBotEvent, type IEventBus } from "../core/interface";

/** NullBotEventBus 事件总线实现类
 * 负责管理事件处理器的注册、注销以及事件的发布与分发
 */
class NullBotEventBus implements IEventBus {
	/** 一个事件处理器映射 */
	private eventHandlerMap: Map<number, EventHandler[]> = new Map();
	/** 已注册的优先级列表，按降序排列 */
	private priorities: number[] = [];

	/** 注册事件处理器到事件总线上
	 *
	 * @param handler 事件处理器
	 * @returns 注销函数
	 */
	register(handler: EventHandler): () => void {
		const { priority } = handler; // 提取优先级

		if (!this.eventHandlerMap.has(priority)) {
			// 如果没有这一优先级，则创建一个新的数组
			this.eventHandlerMap.set(priority, []);
			// 将处理器放入
			this.priorities.push(priority);
			// 降序排序优先级列表
			this.priorities.sort((a, b) => b - a);
		}

		// 将处理器放入对应优先级的数组中
		this.eventHandlerMap.get(priority)!.push(handler);

		// 返回注销函数
		return () => this.unregister(handler);
	}

	/** 从事件总线上取消事件处理器的注册
	 *
	 * @param handler 已注册的事件处理器
	 * @returns void
	 */
	unregister(handler: EventHandler): void {
		const { priority } = handler; // 提取优先级
		const list = this.eventHandlerMap.get(priority); // 获取对应优先级的处理器列表

		if (!list) return; // 如果没有找到对应优先级的列表，直接返回

		const index = list.indexOf(handler); // 查找处理器在列表中的索引
		if (index !== -1) list.splice(index, 1); // 如果找到了这个处理器，则移除它
		if (list.length === 0) {
			// 如果该优先级下没有处理器了，则删除该优先级
			this.eventHandlerMap.delete(priority);
			this.priorities = this.priorities.filter((p) => p !== priority);
		}
	}

	/** 发布事件到事件总线，按优先级分发给处理器
	 *
	 * @param event 事件对象
	 */
	async publish(event: INullBotEvent): Promise<void> {
		// 遍历所有优先级
		for (const priority of this.priorities) {
			const handlers = this.eventHandlerMap.get(priority); // 获取该优先级下的处理器列表
			if (!handlers) {
				// 如果没有处理器，跳过这个优先级并从已注册的优先级中删除这一优先级
				this.priorities = this.priorities.filter((p) => p !== priority);
				continue;
			}

			// 启动一个并发收集
			const results = await Promise.all(
				handlers.map((h) => {
					const timeoutPromise =
						h.timeout > 0 // 如果超时时间大于0，则设置这个Promise的超时截断
							? new Promise<boolean>((resolve) =>
									setTimeout(() => resolve(false), h.timeout),
								)
							: new Promise(() => {}); // 超时时间为0则不会执行超时逻辑

					// 返回处理器处理事件的Promise与超时Promise的竞速结果
					return Promise.race([h.handle(event), timeoutPromise]);
				}),
			);

			// 检查是否有处理器设置了阻塞
			for (let i = 0; i < handlers.length; i++) {
				if (handlers[i]?.block && results[i]) return; // 如果处理器设置了阻塞且返回true，则停止继续处理事件
			}
		}
	}
}

export default NullBotEventBus; // 导出事件总线类
