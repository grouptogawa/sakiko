import { type INullBotEvent } from "./interface";

/** EventHandler NullBot的事件处理器类型 */
type EventHandler = {
	pluginId: string;
	signature: string;

	priority: number;
	block: boolean;
	timeout: number;
	handle: (event: INullBotEvent) => Promise<boolean>;
};

export type { EventHandler };
