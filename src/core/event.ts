import { snowflakeIdBase36 } from "@/utils/snowflake";
import type { ISakikoEvent } from "./interface";

abstract class SakikoEvent implements ISakikoEvent {
	private id: string = snowflakeIdBase36();
	private timestamp: number = Date.now();

	getId(): string {
		return this.id;
	}

	getTimestamp(): number {
		return this.timestamp;
	}

	abstract getType(): number;

	abstract getProtocol(): string;

	isType(target: ISakikoEvent | number | number[]): boolean {
		let result = false;
		if (typeof target === "number") {
			// 传入的参数是整数
			result = this.getType() === target;
		} else if (Array.isArray(target)) {
			// 传入的参数是整数数组
			result = target.includes(this.getType());
		} else {
			// 传入的参数是实现了ISakikoEvent接口的实例
			result = this.getType() === target.getType();
		}
		return result;
	}

	abstract toString(): string;
}

export default SakikoEvent;
