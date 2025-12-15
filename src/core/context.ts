import type { IHandlerContext } from "@togawa-dev/umiri";

export class SakikoContext implements IHandlerContext {
    [key: string]: any;

    set<K extends string, V extends any>(key: K, value: V): void {
        (this as any)[key] = value;
    }

    get<K extends string, V extends any>(
        key: K,
        defaultValue?: V
    ): V | undefined {
        const value = (this as any)[key];
        return value === undefined ? defaultValue : value;
    }
}
