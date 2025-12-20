import { type Context } from "@togawa-dev/utils/context";

export type StartsWithContext = Context<{
    startWithResult: {
        matchedText: string;
        caseSensitive: boolean;
    };
}>;

export type EndsWithContext = Context<{
    endWithResult: {
        matchedText: string;
        caseSensitive: boolean;
    };
}>;

export type FullMatchContext = Context<{
    fullMatchResult: {
        matchedText: string;
        caseSensitive: boolean;
    };
}>;

export type ContainsContext = Context<{
    containsResult: {
        matchedText: string;
        caseSensitive: boolean;
    };
}>;

export type RegexContext = Context<{
    regexResult: {
        matchedText: string;
        regexGroups: RegExpMatchArray;
        regexDict?: Record<string, string | undefined>;
    };
}>;
