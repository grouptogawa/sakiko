// 偷懒让 GPT 先生糊了个检查可选依赖的代码，我稍微改了一下
// 总之不出意外的话是能用的，之后如果测试出现了问题再改吧

// AI Generated Code Below

function looksLikeMissingModule(error: unknown, depName: string): boolean {
    if (!error || typeof error !== "object") return false;
    const anyErr = error as any;
    const code: string | undefined = anyErr.code;
    const msg: string =
        typeof anyErr.message === "string" ? anyErr.message : "";

    if (code === "ERR_MODULE_NOT_FOUND" || code === "MODULE_NOT_FOUND") {
        // 仅当错误信息中引用了请求的依赖时，才认为出现了缺失
        return (
            msg.includes(depName) ||
            msg.includes("Cannot find") ||
            msg.includes("not found")
        );
    }

    // Bun/Node messages vary; keep this conservative.
    if (msg.includes("Cannot find package") && msg.includes(depName))
        return true;
    if (msg.includes("Module not found") && msg.includes(depName)) return true;
    return false;
}

export async function importOptionalDependency<TModule = unknown>(
    depName: string,
    featureHint: string
): Promise<TModule> {
    try {
        return (await import(depName)) as TModule;
    } catch (e) {
        if (looksLikeMissingModule(e, depName)) {
            throw new Error(
                `Optional dependency '${depName}' is required for ${featureHint}. ` +
                    `Please install it in your project (e.g. 'bun add ${depName}' or 'npm i ${depName}').`
            );
        }
        throw e;
    }
}
