import SakikoAdapter from "@/core/adapter";
import { BUILTIN_ADAPTER_NAME } from "./constants";

class BuiltinAdapter extends SakikoAdapter {
	getAdapterName(): string {
		return BUILTIN_ADAPTER_NAME;
	}
}

export default BuiltinAdapter;
