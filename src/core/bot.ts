import type { SakikoAdapter } from "../plugin/adapter";

export abstract class SakikoBot<T extends SakikoAdapter> {
    protected _selfId: string;
    protected _config: object;
    protected _adapter: T;

    protected _nickname: string = "";

    constructor(init: {
        selfId: string;
        config: object;
        adapter: T;
        nickname?: string;
    }) {
        this._selfId = init.selfId;
        this._config = init.config;
        this._adapter = init.adapter;
        this._nickname = init.nickname ?? init.selfId;
    }

    get selfId(): string {
        return this._selfId;
    }

    get config(): object {
        return this._config;
    }

    get adapter(): T {
        return this._adapter;
    }

    get nickname(): string {
        return this._nickname;
    }

    abstract callApi(action: string, params: any): Promise<any>;
}
