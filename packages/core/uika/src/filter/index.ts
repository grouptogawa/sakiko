import type {
    ContainsContext,
    EndsWithContext,
    FullMatchContext,
    RegexContext,
    StartsWithContext
} from "./context";
import type { UmiriContext, UmiriEventMiddleware } from "@togawa-dev/umiri";

import { isPlainable } from "@togawa-dev/sakiko/mixin";
import { mergeContext } from "@togawa-dev/utils/context";

export function startsWith<Context extends UmiriContext<any, any>>(
    text: string[] | string,
    caseSensitive = true
): UmiriEventMiddleware<
    Context,
    Readonly<Context> & Partial<StartsWithContext>
> {
    return (ctx: Context) => {
        if (!isPlainable(ctx.event)) {
            return [
                ctx as Readonly<Context> & Partial<StartsWithContext>,
                false
            ];
        }

        const message = caseSensitive
            ? ctx.event.plain
            : ctx.event.plain.toLowerCase();

        const texts = Array.isArray(text) ? text : [text];
        for (let t of texts) {
            if (!caseSensitive) t = t.toLowerCase();

            if (message.startsWith(t)) {
                const extend: StartsWithContext = {
                    startWithResult: { matchedText: t, caseSensitive }
                };
                const next = mergeContext(ctx, extend) as Readonly<Context> &
                    StartsWithContext;
                return [next, true];
            }
        }

        return [ctx as Readonly<Context> & Partial<StartsWithContext>, false];
    };
}

export function endsWith<Context extends UmiriContext<any, any>>(
    text: string[] | string,
    caseSensitive = true
): UmiriEventMiddleware<Context, Readonly<Context> & Partial<EndsWithContext>> {
    return (ctx: Context) => {
        if (!isPlainable(ctx.event)) {
            return [ctx as Readonly<Context> & Partial<EndsWithContext>, false];
        }

        const message = caseSensitive
            ? ctx.event.plain
            : ctx.event.plain.toLowerCase();

        const texts = Array.isArray(text) ? text : [text];
        for (let t of texts) {
            if (!caseSensitive) t = t.toLowerCase();

            if (message.endsWith(t)) {
                const extend: EndsWithContext = {
                    endWithResult: { matchedText: t, caseSensitive }
                };
                const next = mergeContext(ctx, extend) as Readonly<Context> &
                    EndsWithContext;
                return [next, true];
            }
        }

        return [ctx as Readonly<Context> & Partial<EndsWithContext>, false];
    };
}

export function fullMatch<Context extends UmiriContext<any, any>>(
    text: string[] | string,
    caseSensitive = true
): UmiriEventMiddleware<
    Context,
    Readonly<Context> & Partial<FullMatchContext>
> {
    return (ctx: Context) => {
        if (!isPlainable(ctx.event)) {
            return [
                ctx as Readonly<Context> & Partial<FullMatchContext>,
                false
            ];
        }

        const message = caseSensitive
            ? ctx.event.plain
            : ctx.event.plain.toLowerCase();

        const texts = Array.isArray(text) ? text : [text];
        for (let t of texts) {
            if (!caseSensitive) t = t.toLowerCase();

            if (message === t) {
                const extend: FullMatchContext = {
                    fullMatchResult: { matchedText: t, caseSensitive }
                };
                const next = mergeContext(ctx, extend) as Readonly<Context> &
                    FullMatchContext;
                return [next, true];
            }
        }

        return [ctx as Readonly<Context> & Partial<FullMatchContext>, false];
    };
}

export function contains<Context extends UmiriContext<any, any>>(
    text: string[] | string,
    ignoreCase = false
): UmiriEventMiddleware<Context, Readonly<Context> & Partial<ContainsContext>> {
    return (ctx: Context) => {
        if (!isPlainable(ctx.event)) {
            return [ctx as Readonly<Context> & Partial<ContainsContext>, false];
        }

        const msg = ignoreCase
            ? ctx.event.plain.toLowerCase()
            : ctx.event.plain;

        const texts = Array.isArray(text) ? text : [text];
        for (let t of texts) {
            if (ignoreCase) t = t.toLowerCase();
            if (msg.includes(t)) {
                const extend: ContainsContext = {
                    containsResult: {
                        matchedText: t,
                        caseSensitive: !ignoreCase
                    }
                };
                const next = mergeContext(ctx, extend) as Readonly<Context> &
                    ContainsContext;
                return [next, true];
            }
        }

        return [ctx as Readonly<Context> & Partial<ContainsContext>, false];
    };
}

export function regex<Context extends UmiriContext<any, any>>(
    pattern: RegExp
): UmiriEventMiddleware<Context, Readonly<Context> & Partial<RegexContext>> {
    return (ctx: Context) => {
        if (!isPlainable(ctx.event)) {
            return [ctx as Readonly<Context> & Partial<RegexContext>, false];
        }

        const msg = ctx.event.plain;
        const match = msg.match(pattern);
        if (!match) {
            return [ctx as Readonly<Context> & Partial<RegexContext>, false];
        }

        const extend: RegexContext = {
            regexResult: {
                matchedText: match[0],
                regexGroups: match,
                regexDict: match.groups
            }
        };
        const next = mergeContext(ctx, extend) as Readonly<Context> &
            RegexContext;
        return [next, true];
    };
}
