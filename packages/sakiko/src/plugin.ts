import type { Sakiko } from "./sakiko";

export interface ISakikoPlugin {
    get name(): string;
    get displayName(): string;
    get version(): string;
    get author(): string;
    get description(): string;

    onLoad(sakiko: Sakiko): boolean | Promise<boolean>;

    onUnload?(): boolean | Promise<boolean> | void | Promise<void>;

    onDispose?(): void | Promise<void>;

    beforeSakikoStart?(
        sakiko: Sakiko
    ): boolean | Promise<boolean> | void | Promise<void>;

    afterSakikoStart?(): void | Promise<void>;
}
