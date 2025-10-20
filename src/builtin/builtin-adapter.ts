import NullBotAdapter from "@/core/adapter";
import { BUILTIN_ADAPTER_NAME } from "./constants";

class BuiltinAdapter extends NullBotAdapter {
	getAdapterName(): string {
		return BUILTIN_ADAPTER_NAME;
	}
}

export default BuiltinAdapter;
