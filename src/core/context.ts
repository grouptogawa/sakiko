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

// 定义一些混入接口用于描述上下文管理器的功能

export interface hasMatchResult {
    matched: boolean;
    matchedText: string[];
}

export interface hasRegexResult extends hasMatchResult {
    regexGroups?: RegExpMatchArray;
    regexDict?: Record<string, string>;
}

// 定义一些预置的上下文混入类型

export class MatchContext extends SakikoContext implements hasMatchResult {
    matched: boolean = false;
    matchedIndex: number = -1;
    matchedText: string[] = [];
}

export class RegexContext extends MatchContext implements hasRegexResult {
    regexGroups?: RegExpMatchArray;
    regexDict?: Record<string, string>;
}
