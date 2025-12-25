/**
 * Umiri 中的 Bot 接口类型约束
 */
export type UmiriBot = Readonly<{
    get selfId(): string;
    get nickname(): string;
}>;
