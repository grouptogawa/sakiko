interface INullBotLogger {
	trace(...args: any): void;
	debug(...args: any): void;
	info(...args: any): void;
	warn(...args: any): void;
	error(...args: any): void;
	fatal(...args: any): void;
}

export type { INullBotLogger };
