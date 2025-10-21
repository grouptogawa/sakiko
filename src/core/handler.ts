import { type ISakikoEvent } from "./interface";

/** EventHandler Sakiko的事件处理器类型 */
type EventHandler = {
	pluginId: string;
	signature: string;

	priority: number;
	block: boolean;
	timeout: number;
	handle: (event: ISakikoEvent) => Promise<boolean>;
};

export type { EventHandler };
