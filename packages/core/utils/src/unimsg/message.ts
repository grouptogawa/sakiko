import type * as UniSegment from "./segment";

/**
 * 统一消息接口 / Unified Message Interface
 * 定义了统一消息对象的核心 API
 */
export interface Message<
    Segment extends UniSegment.UniSegmentLike
> extends Array<Segment> {
    /**
     * 创建一个新的消息对象，并附加更多的消息段
     * Create a new message object with additional segments
     */
    update(...segments: Segment[]): Message<Segment>;

    /**
     * 提取纯文本内容
     * Extract plain text content
     */
    plain(): string;

    /**
     * 检查是否包含提及指定用户的消息段
     * Check if the message contains a mention segment for the specified user
     */
    mentioned(userId: string | number, allowAll: boolean): boolean;

    /**
     * 检查是否包含引用指定消息ID的消息段
     * Check if the message contains a quote segment for the specified message ID
     */
    quoted(msgId: string): boolean;
}

/**
 * Sakiko 框架中使用的统一消息对象
 *
 * The unified message object in Sakiko.
 */
export class UniMessage
    extends Array<UniSegment.MessageSegment>
    implements Message<UniSegment.MessageSegment>
{
    constructor(...segments: Array<UniSegment.MessageSegment>) {
        super(...segments);
    }

    update(...segments: UniSegment.MessageSegment[]): UniMessage {
        return new UniMessage(...this, ...segments);
    }

    plain(): string {
        return this.reduce((acc, seg) => {
            if (seg.type === "text") return acc + seg.data.text;
            return acc;
        }, "");
    }

    mentioned(userId: string | number, allowAll: boolean): boolean {
        const uid = String(userId);
        return this.some((seg) => {
            if (seg.type !== "mention") return false;
            return (
                seg.data.userId === uid ||
                (allowAll && seg.data.userId === "all")
            );
        });
    }

    quoted(msgId: string): boolean {
        return this.some((seg) => {
            if (seg.type !== "quote") return false;
            return seg.data.msgId === msgId;
        });
    }

    text(...contents: unknown[]): UniMessage {
        const text = contents.map((t) => String(t)).join("");
        return this.update({
            type: "text",
            data: { text }
        } as UniSegment.MessageSegment);
    }

    mention(userId: string | number): UniMessage {
        return this.update({
            type: "mention",
            data: { userId: String(userId) }
        } as UniSegment.MessageSegment);
    }

    quote(msgId: string): UniMessage {
        return this.update({
            type: "quote",
            data: { msgId }
        } as UniSegment.MessageSegment);
    }

    other(data: { originalType: string; originalData: object }): UniMessage {
        return this.update({
            type: "other",
            data
        } as UniSegment.MessageSegment);
    }

    image(fileUrl: string): UniMessage {
        return this.update({
            type: "image",
            data: { fileUrl }
        } as UniSegment.MessageSegment);
    }

    audio(fileUrl: string): UniMessage {
        return this.update({
            type: "audio",
            data: { fileUrl }
        } as UniSegment.MessageSegment);
    }

    video(fileUrl: string): UniMessage {
        return this.update({
            type: "video",
            data: { fileUrl }
        } as UniSegment.MessageSegment);
    }

    file(fileUrl: string): UniMessage {
        return this.update({
            type: "file",
            data: { fileUrl }
        } as UniSegment.MessageSegment);
    }
}

/** 可能的消息数组类型 / Possible message array types */
export type MessageArray = Array<
    string | number | UniSegment.MessageSegment | UniSegment.UniSegmentLike
>;
