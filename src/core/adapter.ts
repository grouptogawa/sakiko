import type { INullBotAdapter, INullBotEventBus } from "./interface";

abstract class NullBotAdapter implements INullBotAdapter {
	private eventBus: INullBotEventBus;

	constructor(eventBus: INullBotEventBus) {
		this.eventBus = eventBus;
	}

	abstract getAdapterName(): string;

	setEventBus(eventBus: INullBotEventBus): void {
		this.eventBus = eventBus;
	}
}

export default NullBotAdapter;
