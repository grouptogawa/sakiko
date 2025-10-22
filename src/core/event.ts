import { snowflakeIdBase36 } from "@/utils/snowflake";
import type { ISakikoEvent } from "./interface";

export abstract class SakikoEvent implements ISakikoEvent {
	private id: string = snowflakeIdBase36();
	private timestamp: number = Date.now();
	senderId: string = "";
	selfId: string = "";
	types: number[] = [];

	getId(): string {
		return this.id;
	}

	getTimestamp(): number {
		return this.timestamp;
	}

	getProtocol(): string {
		return "";
	}

	getSenderId(): string {
		return this.senderId;
	}

	getSelfId(): string {
		return this.selfId;
	}

	getTypes(): number[] {
		return this.types;
	}

	isType(target: number | number[]): boolean {
		return true;
	}

	toString(): string {
		return "";
	}
}
