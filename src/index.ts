// 导出需要导出的部分

// core

export { SakikoBot } from "./core/bot";
export {
    SakikoContext,
    type hasMatchResult,
    type hasRegexResult,
    MatchContext,
    RegexContext
} from "./core/context";
export {
    SakikoEvent,
    type hasSender,
    type Targetable,
    type Messageable
} from "./core/event";
export {
    MatcherBuilder,
    buildMatcherFor,
    onStartsWith,
    onEndsWith,
    onFullMatch,
    onContains,
    onRegex
} from "./core/matcher";
export { startswith, endswith, fullmatch, contains, regex } from "./core/mw";
export { Sakiko } from "./core/sakiko";

// log

export { type ISakikoLogger, isSakikoLogger } from "./log/interface";

// plugin

export { SakikoAdapter } from "./plugin/adapter";
export { type ISakikoPlugin } from "./plugin/interface";

// utils

export { merge } from "./utils/merge";
export { sf } from "./utils/snowflake";

// global singleton

export { sakiko } from "./global";
