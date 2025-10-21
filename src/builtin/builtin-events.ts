import SakikoEvent from "@/core/event";
import { BUILTIN_PROTOCOL_NAME } from "./constants";

abstract class BuiltInSakikoEvent extends SakikoEvent {
	getProtocol(): string {
		return BUILTIN_PROTOCOL_NAME;
	}
}
