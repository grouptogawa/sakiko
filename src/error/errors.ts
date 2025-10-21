/** 事件总线未初始化错误，这个错误表示适配器尝试获取事件总线时，发现它尚未被正确设置。*/
export class AdapterEventBusUnsetError extends Error {
	constructor(adapterName: string) {
		super(
			`适配器 ${adapterName} 的事件总线未初始化，请确保适配器已被正确的初始化！`,
		);
		this.name = "AdapterEventBusUnsetError";

		Object.setPrototypeOf(this, new.target.prototype);

		if (Error.captureStackTrace)
			Error.captureStackTrace(this, AdapterEventBusUnsetError);
	}
}

export class AdapterLoggerUnsetError extends Error {
	constructor(adapterName: string) {
		super(
			`适配器 ${adapterName} 的日志记录器未初始化，请确保适配器已被正确的初始化！`,
		);
		this.name = "AdapterLoggerUnsetError";

		Object.setPrototypeOf(this, new.target.prototype);

		if (Error.captureStackTrace)
			Error.captureStackTrace(this, AdapterLoggerUnsetError);
	}
}
