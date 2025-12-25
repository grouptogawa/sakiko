import type {
    FuzzyContainsContext,
    FuzzyHit,
    FuzzySearchContext
} from "./context";
import type { UmiriContext, UmiriEventMiddleware } from "@togawa-dev/umiri";

import { importOptionalDependency } from "../internal/optional-dep";
import { isPlainable } from "@togawa-dev/sakiko/mixin/event";
import { mergeContext } from "@togawa-dev/utils/context";

// 让 gemini 改了一遍，导致我自己都有点认不出来这里写的东西具体干了什么了
// 测试的时候要重点关照一下这块！

// 记得要缓存一下获取依赖的结果，不然每次调用都会重新导入一次
let _fuzzJsOnce: Promise<typeof import("fuse.js")> | null = null;

/**
 * 检查模糊匹配所需的 Fuse.js 依赖是否存在。
 *
 * check optional dependency for fuzzy matcher.
 * @returns A promise that resolves when the check is complete.
 */
export async function getFuseJS() {
    return (_fuzzJsOnce ??= importOptionalDependency<typeof import("fuse.js")>(
        "fuse.js",
        "@togawa-dev/uika/matcher-fuzzy"
    ));
}

// 定义关键词及其权重的类型
export type WeightedKeyword = { text: string; weight: number };

// 对消息事件执行模糊匹配
async function executeFuzzy(
    ctx: UmiriContext<any, any>,
    options: {
        keywords: string[] | WeightedKeyword[];
        threshold: number;
        locationSensitive?: boolean;
        caseSensitive?: boolean;
        fieldNormSensitive?: boolean;
        matchThreshold?: number;
    }
) {
    // 使用消息事件类型的守卫
    if (!isPlainable(ctx.event)) {
        return null;
    }

    // 处理空关键词
    if (!options.keywords || options.keywords.length === 0) {
        return { empty: true };
    }

    // 将传入的字符串数组形式的关键词统一转换为带权重的关键词数组
    const normalized: WeightedKeyword[] =
        typeof (options.keywords as any)[0] === "string"
            ? (options.keywords as string[]).map((t) => ({
                  text: t,
                  weight: 1
              }))
            : (options.keywords as WeightedKeyword[]).map((k) => ({
                  text: k.text,
                  weight: Number.isFinite(k.weight) ? k.weight : 1
              }));

    // 导入 Fuse.js 进行模糊匹配
    const { default: Fuse } = await getFuseJS();

    // 获取消息文本
    const text = ctx.event.getPlaintext();

    // 实例创建
    const fuse = new Fuse([{ text }], {
        keys: ["text"],
        includeScore: true,
        includeMatches: true,
        threshold: options.threshold,
        isCaseSensitive: options.caseSensitive ?? false,
        ignoreLocation: !(options.locationSensitive ?? false),
        ignoreFieldNorm: !(options.fieldNormSensitive ?? false)
    });

    const matchThreshold = options.matchThreshold ?? options.threshold;

    // 计算匹配Hit结果
    const scores: FuzzyHit[] = normalized.map((kw) => {
        const r = fuse.search(kw.text, { limit: 1 });
        const item = r[0];
        // 若无匹配结果则得分为1（表示未匹配）
        const score = r.length ? (item?.score ?? 1) : 1;

        // 提取匹配的下标范围
        const indices = item?.matches?.[0]?.indices as
            | [number, number][]
            | undefined;

        return {
            text: kw.text,
            weight: kw.weight,
            score,
            matched: score <= matchThreshold,
            indices
        };
    });

    // 提取命中的关键词放入匹配结果数组
    const matched = scores
        .filter((x) => x.matched)
        .sort((a, b) => a.score - b.score);

    // 计算加权得分
    const weightedScore = (() => {
        const hits = matched;
        if (hits.length === 0) return 1;
        const sumW = hits.reduce((acc, x) => acc + x.weight, 0);
        if (sumW <= 0) return 1;
        const sum = hits.reduce((acc, x) => acc + x.score * x.weight, 0);
        return sum / sumW;
    })();

    return {
        normalized,
        scores,
        matched,
        weightedScore,
        minScore: Math.min(...scores.map((s) => s.score)),
        maxScore: Math.max(...scores.map((s) => s.score))
    };
}

/**
 * 模糊匹配事件中是否包含指定的关键词
 *
 * fuzzy match to check if event contains specified keywords.
 *
 * @param options 匹配选项
 * - keywords: 要匹配的关键词列表，可以是字符串数组或带权重的关键词对象数组 / list of keywords to match, can be string array or weighted keyword object array
 * - threshold: 匹配阈值，范围为 0 到 1，值越小表示匹配要求越严格 / matching threshold, range from 0 to 1, lower value means stricter matching
 * - locationSensitive: 是否考虑关键词在文本中的位置，默认为 false，如果开启则只搜索前60个字符 / whether to consider keyword location in text, default is false, if enabled only search in first 60 characters
 * - caseSensitive: 是否区分大小写，默认为 false / whether to be case sensitive, default is false
 * - fieldNormSensitive: 是否对文本长度敏感，默认为 false，对于较长文本中匹配短文本要求更宽松 / whether to be field norm sensitive, default is false, which relaxes matching for short text in longer texts
 * - requireAllMatch: 是否需要所有关键词都匹配才能通过，默认为 false / whether all keywords need to match to pass, default is false
 * @returns 一个中间件函数，返回扩展了模糊匹配结果的上下文和匹配是否通过的布尔值 / a middleware function that returns context extended with fuzzy match result and a boolean indicating if the match passed
 */
export function fuzzyContains<Context extends UmiriContext<any, any>>(options: {
    keywords: string[] | WeightedKeyword[];
    threshold: number;
    locationSensitive?: boolean;
    caseSensitive?: boolean;
    fieldNormSensitive?: boolean;
    requireAllMatch?: boolean;
}): UmiriEventMiddleware<
    Context,
    Readonly<Context> & Partial<FuzzyContainsContext>
> {
    return async (ctx: Context) => {
        const result = await executeFuzzy(ctx, options);

        // 如果没有结果，说明 event 不是消息类型
        if (!result || result.empty) {
            return [
                ctx as Readonly<Context> & Partial<FuzzyContainsContext>,
                false
            ];
        }

        const {
            normalized,
            scores,
            matched,
            weightedScore,
            minScore,
            maxScore
        } = result;

        const extend: FuzzyContainsContext = {
            fuzzyContainsResult: {
                options: {
                    keywords: normalized!,
                    threshold: options.threshold,
                    locationSensitive: options.locationSensitive,
                    caseSensitive: options.caseSensitive,
                    fieldNormSensitive: options.fieldNormSensitive,
                    requireAllMatch: options.requireAllMatch
                },
                minScore: minScore!,
                maxScore: maxScore!,
                keywordScores: scores!,
                matchedKeywords: matched!,
                weightedScore: weightedScore!
            }
        };

        const next = mergeContext(ctx, extend) as Readonly<Context> &
            FuzzyContainsContext;

        const needAll = options.requireAllMatch ?? false;
        const passed = needAll
            ? matched!.length === scores!.length
            : matched!.length > 0;
        return [next, passed];
    };
}

/**
 * 模糊搜索事件中的关键词
 *
 * fuzzy search keywords in event.
 *
 * @param options 匹配选项
 * - keywords: 要匹配的关键词列表，可以是字符串数组或带权重的关键词对象数组 / list of keywords to match, can be string array or weighted keyword object array
 * - threshold: 匹配阈值，范围为 0 到 1，值越小表示匹配要求越严格 / matching threshold, range from 0 to 1, lower value means stricter matching
 * - locationSensitive: 是否考虑关键词在文本中的位置，默认为 false，如果开启则只搜索前60个字符 / whether to consider keyword location in text, default is false, if enabled only search in first 60 characters
 * - caseSensitive: 是否区分大小写，默认为 false / whether to be case sensitive, default is false
 * - fieldNormSensitive: 是否对文本长度敏感，默认为 false，对于较长文本中匹配短文本要求更宽松 / whether to be field norm sensitive, default is false, which relaxes matching for short text in longer texts
 * - requireMatch: 是否需要至少命中一个关键词才能通过，默认为 true / whether at least one keyword needs to match to pass, default is true
 * - matchThreshold: 命中阈值，默认为与 threshold 相同，可以单独设置 / matching threshold, default is same as threshold, can be set separately
 * @returns 一个中间件函数，返回扩展了模糊搜索结果的上下文和匹配是否通过的布尔值 / a middleware function that returns context extended with fuzzy search result and a boolean indicating if the match passed
 */
export function fuzzySearch<Context extends UmiriContext<any, any>>(options: {
    keywords: string[] | WeightedKeyword[];
    threshold: number;

    locationSensitive?: boolean;
    caseSensitive?: boolean;
    fieldNormSensitive?: boolean;

    // true: 只有命中时才返回 true；false: 即使一个都没命中也返回 true（仅做提取）
    requireMatch?: boolean;

    // 命中阈值：默认用 options.threshold，你也可以允许单独设置（可选）
    matchThreshold?: number;
}): UmiriEventMiddleware<
    Context,
    Readonly<Context> & Partial<FuzzySearchContext>
> {
    return async (ctx: Context) => {
        const result = await executeFuzzy(ctx, options);

        if (!result) {
            return [
                ctx as Readonly<Context> & Partial<FuzzySearchContext>,
                false
            ];
        }

        if (result.empty) {
            return [
                ctx as Readonly<Context> & Partial<FuzzySearchContext>,
                false
            ];
        }

        const { normalized, scores, matched, weightedScore } = result;

        const extend: FuzzySearchContext = {
            fuzzySearchResult: {
                options: {
                    keywords: normalized!,
                    threshold: options.threshold,
                    locationSensitive: options.locationSensitive,
                    caseSensitive: options.caseSensitive,
                    fieldNormSensitive: options.fieldNormSensitive,
                    requireMatch: options.requireMatch,
                    matchThreshold: options.matchThreshold
                },
                keywordScores: scores!,
                matchedKeywords: matched!,
                weightedScore: weightedScore!
            }
        };

        const next = mergeContext(ctx, extend) as Readonly<Context> &
            FuzzySearchContext;

        if (options.requireMatch ?? true) {
            return [next, matched!.length > 0];
        }

        return [next, true];
    };
}
