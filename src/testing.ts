import { SakikoBot } from "./core/bot";
import { SakikoEvent, type Messageable } from "./core/event";
import { onEvent, onStartsWith } from "./core/matcher";
import type { Sakiko } from "./core/sakiko";
import { SakikoAdapter } from "./plugin/adapter";

class TestAdapter extends SakikoAdapter {
    override protocolName: string = "test-protocol";
    override platformName: string = "test-platform";
    get sakiko(): Sakiko {
        return {} as any as Sakiko;
    }
    override install(sakiko: Sakiko): boolean | Promise<boolean> {
        return true;
    }

    override uninstall(sakiko: Sakiko): boolean | Promise<boolean> {
        return true;
    }

    override cleanup(): void | Promise<void> {
        return;
    }
}

class TestBot extends SakikoBot<TestAdapter> {
    override callApi(action: string, params: any): Promise<any> {
        return Promise.resolve({});
    }
}

class TestEvent1
    extends SakikoEvent<{ message: string }, TestBot>
    implements Messageable
{
    summary(): string {
        return "Summary";
    }

    plaintext(): string {
        return "Plaintext";
    }
}
class TestEvent2
    extends SakikoEvent<{ userId: number }, TestBot>
    implements Messageable
{
    summary(): string {
        return "Summary2";
    }

    plaintext(): string {
        return "Plaintext2";
    }
}

const testMatcher = onStartsWith("hi")
    .ofEvent(TestEvent1, TestEvent2)
    .handle(async (b, e, c) => {
        return true;
    });
