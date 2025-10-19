import { Logger, type ILogObj } from "tslog";
import type { INullBotLogger } from "./interface";

function newLogger(): INullBotLogger {
	const log: Logger<ILogObj> = new Logger();
	return log;
}
