import NullBotEvent from "@/core/event";
import { BUILTIN_PROTOCOL_NAME } from "./constants";

abstract class BuiltInNullBotEvent extends NullBotEvent {
	getProtocol(): string {
		return BUILTIN_PROTOCOL_NAME;
	}
}
