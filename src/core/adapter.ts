import type { ISakikoAdapter, ISakikoEventBus } from "./interface";

abstract class SakikoAdapter implements ISakikoAdapter {
	private eventBus: ISakikoEventBus;

	constructor(eventBus: ISakikoEventBus) {
		this.eventBus = eventBus;
	}

	abstract getAdapterName(): string;

	setEventBus(eventBus: ISakikoEventBus): void {
		this.eventBus = eventBus;
	}
}

export default SakikoAdapter;
