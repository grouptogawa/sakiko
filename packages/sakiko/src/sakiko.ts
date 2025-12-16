import type {
    ExtractBotType,
    Umiri,
    UmiriBot,
    UmiriContext,
    UmiriEvent,
    UmiriEventConstructor,
    UmiriEventMatcher
} from "@togawa-dev/umiri";
import { PKG_NAME, VERSION } from "./global";

import type { ILogger } from "@togawa-dev/utils";
import { MatcherBuilder } from "./matcher-builder";
import { snowflake, type SnowFlake } from "@togawa-dev/utils/snowflake";

export class Sakiko {
    private _started = false;
    private _withBlock = false;

    private _logger: ILogger = console;
    private _bus?: Umiri;
    private _snowflake: SnowFlake = snowflake;

    private _config: Record<string, any> = {};
    private _bots: Map<string, UmiriBot> = new Map();

    private _matchers: UmiriEventMatcher<any, any>[] = [];

    get version() {
        return VERSION;
    }

    get pkgName() {
        return PKG_NAME;
    }

    set logger(logger: ILogger) {
        if (this._started) {
            const e = new Error("cannot set logger after Sakiko is started");
            this._logger.error(e);
        }
        this._logger = logger;
    }

    get logger() {
        return this._logger;
    }

    get config() {
        return Object.freeze({ ...this._config });
    }

    get bus() {
        if (this._bus) {
            return this._bus;
        }
        const e = new Error("umiri is not initialized");
        this._logger.error(e);
        throw e;
    }

    get snowflake() {
        return this._snowflake;
    }

    ofEvent<Events extends UmiriEvent<any, any>[]>(
        ...ets: { [K in keyof Events]: UmiriEventConstructor<Events[K]> }
    ) {
        type Bot = ExtractBotType<Events[number]>;
        type Context = UmiriContext<Bot, Events>;
        return new MatcherBuilder<Bot, Events, Context>(this, ets);
    }

    match(...matcherBuilder: UmiriEventMatcher<any, any>[]) {
        for (const matcher of matcherBuilder) {
            if (!this._matchers.includes(matcher)) {
                this._matchers.push(matcher);
            }
        }
        return this._matchers.length;
    }

    addBot(bot: UmiriBot) {
        if (this._bots.has(bot.selfId)) {
        }
        this._bots.set(bot.selfId, bot);
    }

    removeBot(selfId: string) {
        this._bots.delete(selfId);
    }

    run() {}

    runWithBlock() {}
}
