import type { WeightedKeyword } from ".";

/**
 * 模糊匹配的单个关键词命中结果的约束类型
 * 包括关键词文本、权重、得分、是否命中及匹配的下标范围等信息
 *
 * the type definition for a single fuzzy match hit result
 * including keyword text, weight, score, whether it matched, and matched indices
 *
 * @property text 关键词文本 / keyword text
 * @property weight 关键词权重 / keyword weight
 * @property score 匹配得分，范围 0~1，越小越好；1 表示没匹配到 / match score, range 0~1, lower is better; 1 means no match
 * @property matched 是否被认为命中（score <= threshold） / whether it is considered matched (score <= threshold)
 * @property indices 匹配到的下标范围 / matched indices ranges
 */
export type FuzzyHit = {
    text: string;
    weight: number;
    score: number;
    matched: boolean;
    indices?: readonly [number, number][]; // 匹配到的下标范围
};

/**
 * 模糊匹配事件中是否包含指定的关键词的上下文扩展类型
 *
 * the context extension type for fuzzy matching whether event contains specified keywords
 */
export type FuzzyContainsContext = {
    /**
     * 模糊匹配结果
     *
     * the fuzzy match result
     */
    fuzzyContainsResult: {
        /** 进行模糊匹配时使用的选项 */
        options: {
            /** 关键词列表 / list of keywords */
            keywords: WeightedKeyword[];
            /** 匹配阈值 / matching threshold */
            threshold: number;
            /** 是否考虑关键词位置 / whether to consider keyword location */
            locationSensitive?: boolean;
            /** 是否区分大小写 / whether to be case sensitive */
            caseSensitive?: boolean;
            /** 是否对文本长度敏感 / whether to be sensitive to text length */
            fieldNormSensitive?: boolean;
            /** 是否需要所有关键词都匹配才能通过 / whether all keywords need to match to pass */
            requireAllMatch?: boolean;
        };
        /** 最小匹配得分，一般是所有关键词中得分最低的那个，大于阈值则表示所有关键词都被匹配到了 / the minimum match score, usually the lowest score among all keywords, greater than threshold means all keywords are matched */
        minScore: number;
        /** 最大匹配得分，一般是所有关键词中得分最高的那个，大于阈值则表示至少有一个关键词被匹配到了 / the maximum match score, usually the highest score among all keywords, greater than threshold means at least one keyword is matched */
        maxScore: number;
        /** 所有关键词的匹配结果列表 / the list of match results for all keywords */
        keywordScores: FuzzyHit[];
        /** 命中的关键词列表 / the list of matched keywords */
        matchedKeywords: FuzzyHit[];
        /** 加权得分，综合考虑关键词权重后的匹配得分 / the weighted score, considering keyword weights */
        weightedScore: number;
    };
};

/**
 * 模糊搜索事件中关键词的上下文扩展类型
 *
 * the context extension type for fuzzy searching keywords in event
 */
export type FuzzySearchContext = {
    /**
     * 模糊搜索结果
     *
     * the fuzzy search result
     */
    fuzzySearchResult: {
        /** 进行模糊搜索时使用的选项 */
        options: {
            /** 关键词列表 / list of keywords */
            keywords: WeightedKeyword[];
            /** 匹配阈值 / matching threshold */
            threshold: number;
            /** 是否考虑关键词位置 / whether to consider keyword location */
            locationSensitive?: boolean;
            /** 是否区分大小写 / whether to be case sensitive */
            caseSensitive?: boolean;
            /** 是否对文本长度敏感 / whether to be sensitive to text length */
            fieldNormSensitive?: boolean;
            /** 是否需要有关键词命中才能通过 / whether any keyword needs to match to pass */
            requireMatch?: boolean;
            /** 命中阈值 / the match threshold */
            matchThreshold?: number;
        };
        /** 最小匹配得分，一般是所有关键词中得分最低的那个 / the minimum match score, usually the lowest score among all keywords */
        keywordScores: FuzzyHit[];
        /** 命中的关键词列表 / the list of matched keywords */
        matchedKeywords: FuzzyHit[];
        /** 加权得分，综合考虑关键词权重后的匹配得分 / the weighted score, considering keyword weights */
        weightedScore: number;
    };
};
