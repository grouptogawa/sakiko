interface INullBotLogger {
	trace(...args: any): void;
	debug(...args: any): void;
	info(...args: any): void;
	warn(...args: any): void;
	error(...args: any): void;
	fatal(...args: any): void;
	getNamedSubLogger?(name: string): INullBotLogger;
}

/** hasGetNamedSubLogger 类型守卫函数，检测实例是否实现了接口中的getNamedSubLogger方法
 *
 * @param logger
 * @returns
 */
function hasGetNamedSubLogger(
	logger: INullBotLogger,
): logger is INullBotLogger & {
	getNamedSubLogger: (name: string) => INullBotLogger;
} {
	return typeof logger.getNamedSubLogger === "function";
}

export type { INullBotLogger };
export default hasGetNamedSubLogger;
