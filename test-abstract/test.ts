abstract class Sakiko {
    abstract init(): void | Promise<void>;
    abstract start(): void | Promise<void>;
}

// ✅ 实现1：两个方法都返回 void
class SyncImpl extends Sakiko {
    init(): void {
        console.log("Sync init");
    }

    start(): void {
        console.log("Sync start");
    }
}

// ✅ 实现2：两个方法都返回 Promise<void>
class AsyncImpl extends Sakiko {
    async init(): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log("Async init");
    }

    async start(): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log("Async start");
    }
}

// ✅ 实现3：一个返回 void，一个返回 Promise<void>
class MixedImpl extends Sakiko {
    init(): void {
        console.log("Mixed init (sync)");
    }

    async start(): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log("Mixed start (async)");
    }
}

// ✅ 实现4：返回类型更具体的 void（也是允许的）
class StrictVoidImpl extends Sakiko {
    init(): void {
        console.log("Strict void init");
        // 返回 undefined 也是 void
        return undefined;
    }

    start(): void {
        console.log("Strict void start");
        // 不写 return 也是 void
    }
}

// 测试函数
async function testImplementations() {
    console.log("=== Testing Sync Implementation ===");
    const sync = new SyncImpl();
    sync.init();
    sync.start();

    console.log("\n=== Testing Async Implementation ===");
    const asyncImpl = new AsyncImpl();
    await asyncImpl.init();
    await asyncImpl.start();

    console.log("\n=== Testing Mixed Implementation ===");
    const mixed = new MixedImpl();
    mixed.init(); // 不需要 await
    await mixed.start(); // 需要 await

    console.log("\n=== Testing Strict Void Implementation ===");
    const strict = new StrictVoidImpl();
    strict.init();
    strict.start();
}

// 运行测试
testImplementations().catch(console.error);

// 类型检查示例
function testTypeCompatibility() {
    const sakiko: Sakiko = new SyncImpl(); // ✅ 兼容
    const sakiko2: Sakiko = new AsyncImpl(); // ✅ 兼容
    const sakiko3: Sakiko = new MixedImpl(); // ✅ 兼容

    // 调用时需要考虑可能的异步性
    const result1 = sakiko.init(); // 类型是 void | Promise<void>
    const result2 = sakiko2.init(); // 类型是 void | Promise<void>

    // 安全的使用方式
    if (result1 instanceof Promise) {
        result1.then(() => console.log("Async init completed"));
    } else {
        console.log("Sync init completed");
    }
}

testTypeCompatibility();
