import type { Sakiko } from "./sakiko";

export type HookFn = () => void | Promise<void>;

export type HookFnCancelable = () =>
    | boolean
    | Promise<boolean>
    | void
    | Promise<void>;

export type HookFnWithIns = (sakiko: Sakiko) => void | Promise<void>;

export type HookFnWithInsCancelable = (
    sakiko: Sakiko
) => boolean | Promise<boolean> | void | Promise<void>;
