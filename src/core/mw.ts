import type { MatchContext, RegexContext } from "../core/context";
import { type Messageable } from "../core/event";
import type { UmiriEvent } from "@togawa-dev/umiri";

// 提供一些预置的 UmiriBus Handler 中间件构建器

/**
 * 创建一个用于匹配消息开头文本的中间件。
 *
 * create a middleware to match message starting text.
 * @param text 要匹配的文本数组 / The array of texts to match
 * @param ignoreCase 是否忽略大小写 / Whether to ignore case
 * @returns UmiriBus Handler 中间件 / The UmiriBus Handler middleware
 */
export const startswith =
    (text: string[], ignoreCase = false) =>
    <E extends UmiriEvent<any, any> & Messageable>(e: E, ctx: MatchContext) => {
        const msg = ignoreCase ? e.plaintext().toLowerCase() : e.plaintext();
        for (let t of text) {
            if (ignoreCase) t = t.toLowerCase();
            if (msg.startsWith(t)) {
                ctx.matched = true;
                ctx.matchedText.push(t);
                break;
            }
        }
        return [e, ctx, ctx.matched] as [E, MatchContext, boolean];
    };

/**
 * 创建一个用于匹配消息结尾文本的中间件。
 *
 * create a middleware to match message ending text.
 * @param text 要匹配的文本数组 / The array of texts to match
 * @param ignoreCase 是否忽略大小写 / Whether to ignore case
 * @returns UmiriBus Handler 中间件 / The UmiriBus Handler middleware
 */
export const endswith =
    (text: string[], ignoreCase = false) =>
    <E extends UmiriEvent<any, any> & Messageable>(e: E, ctx: MatchContext) => {
        const msg = ignoreCase ? e.plaintext().toLowerCase() : e.plaintext();
        for (let t of text) {
            if (ignoreCase) t = t.toLowerCase();
            if (msg.endsWith(t)) {
                ctx.matched = true;
                ctx.matchedText.push(t);
                break;
            }
        }
        return [e, ctx, ctx.matched] as [E, MatchContext, boolean];
    };

/**
 * 创建一个用于匹配整段消息文本的中间件。
 *
 * create a middleware to fully match message text.
 * @param text 要匹配的文本数组 / The array of texts to match
 * @param ignoreCase 是否忽略大小写 / Whether to ignore case
 * @returns UmiriBus Handler 中间件 / The UmiriBus Handler middleware
 */
export const fullmatch =
    (text: string[], ignoreCase = false) =>
    <E extends UmiriEvent<any, any> & Messageable>(e: E, ctx: MatchContext) => {
        const msg = ignoreCase ? e.plaintext().toLowerCase() : e.plaintext();
        for (let t of text) {
            if (ignoreCase) t = t.toLowerCase();
            if (msg === t) {
                ctx.matched = true;
                ctx.matchedText.push(t);
                break;
            }
        }
        return [e, ctx, ctx.matched] as [E, MatchContext, boolean];
    };

/**
 * 创建一个用于匹配包含指定文本的中间件。
 *
 * create a middleware to match message containing specified text.
 * @param text 要匹配的文本数组 / The array of texts to match
 * @param ignoreCase 是否忽略大小写 / Whether to ignore case
 * @returns UmiriBus Handler 中间件 / The UmiriBus Handler middleware
 */
export const contains =
    (text: string[], ignoreCase = false) =>
    <E extends UmiriEvent<any, any> & Messageable>(e: E, ctx: MatchContext) => {
        const msg = ignoreCase ? e.plaintext().toLowerCase() : e.plaintext();
        for (let t of text) {
            if (ignoreCase) t = t.toLowerCase();
            if (msg.includes(t)) {
                ctx.matched = true;
                ctx.matchedText.push(t);
                break;
            }
        }
        return [e, ctx, ctx.matched] as [E, MatchContext, boolean];
    };

/**
 * 创建一个用于匹配正则表达式的中间件。
 *
 * create a middleware to match regex pattern.
 * @param pattern 要匹配的正则表达式 / The regex pattern to match
 * @returns UmiriBus Handler 中间件 / The UmiriBus Handler middleware
 */
export const regex =
    (pattern: RegExp) =>
    <E extends UmiriEvent<any, any> & Messageable>(e: E, ctx: RegexContext) => {
        const msg = e.plaintext();
        const match = msg.match(pattern);
        if (!match) return [e, ctx, false] as [E, RegexContext, boolean];

        ctx.matched = true;
        ctx.matchedText = [match[0]];
        ctx.regexGroups = match;
        if (match.groups) ctx.regexDict = { ...match.groups };
        return [e, ctx, true] as [E, RegexContext, boolean];
    };
