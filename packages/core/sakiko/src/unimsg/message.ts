import type { Mention, UniSegmentLike } from "./segment";

/**
 * Sakiko 框架中使用的统一消息对象
 *
 * The unified message object in Sakiko.
 */
export class UniMessage<
    Segment extends UniSegmentLike<any> = UniSegmentLike<any>
> extends Array<Segment> {
    constructor(...segments: Array<Segment>) {
        super(...segments);
    }

    /**
     * 预留方法，用于从统一消息格式构建各个平台的消息格式，仅在继承统一消息格式实现的子类型中有用
     *
     * Reserved method for constructing platform-specific message formats from the unified message format, only useful in subclasses implementing the unified message format
     *
     * @param msg 统一消息对象 / The unified message object
     * @returns 新的消息对象 / A new message object
     */
    static fromUniMessage(msg: UniMessage) {
        return new UniMessage(...msg);
    }

    /**
     * 预留方法，用于将各个平台的消息格式转换为统一消息格式，仅在继承统一消息格式实现的子类型中有用
     *
     * Reserved method for converting platform-specific message formats to the unified message format, only useful in subclasses implementing the unified message format
     *
     * @returns 统一消息对象 / The unified message object
     */
    toUniMessage(): UniMessage<Segment> {
        return new UniMessage<Segment>(...this);
    }

    /** 创建一个新的消息对象，并附加更多的消息段 / Create a new message object with additional segments */
    update(...seg: Segment[]): UniMessage<Segment> {
        return new UniMessage<Segment>(...this, ...seg);
    }

    /** 提取纯文本内容 / Extract plain text content */
    plain(): string {
        return this.filter((seg) => seg.type === "text")
            .map((seg) => (seg.data as any).text)
            .join("");
    }

    /** 检查是否包含提及指定用户的消息段 / Check if the message contains a mention segment for the specified user */
    mentioned(userId: string | number, allowAll: boolean): boolean {
        return this.some(
            (seg) =>
                seg.type === "mention" &&
                ((seg as Mention).data.userId === String(userId) ||
                    (allowAll && (seg as Mention).data.userId === "all"))
        );
    }

    /** 检查是否包含引用指定消息ID的消息段 / Check if the message contains a quote segment for the specified message ID */
    quoted(msgId: string): boolean {
        return this.some(
            (seg) => seg.type === "quote" && (seg as any).data.msgId === msgId
        );
    }

    /** 添加文本消息段 / Add a text message segment */
    text(...contents: unknown[]): UniMessage<Segment> {
        const combined = contents.map((t) => String(t)).join;
        return this.update({
            type: "text",
            data: {
                text: combined
            }
        } as Segment);
    }

    /** 添加提及消息段 / Add a mention message segment */
    mention(userId: string | number): UniMessage<Segment> {
        return this.update({
            type: "mention",
            data: {
                userId: String(userId)
            }
        } as Segment);
    }

    /** 添加引用消息段 / Add a quote message segment */
    quote(msgId: string): UniMessage<Segment> {
        return this.update({
            type: "quote",
            data: {
                msgId: msgId
            }
        } as Segment);
    }

    /** 添加其他类型的消息段 / Add a message segment of other types */
    other(data: {
        originalType: string;
        originalData: object;
    }): UniMessage<Segment> {
        return this.update({
            type: "other",
            data: data
        } as Segment);
    }

    /** 添加图片消息段 / Add an image message segment */
    image(fileUrl: string): UniMessage<Segment> {
        return this.update({
            type: "image",
            data: {
                fileUrl: fileUrl
            }
        } as Segment);
    }

    /** 添加音频消息段 / Add an audio message segment */
    audio(fileUrl: string): UniMessage<Segment> {
        return this.update({
            type: "audio",
            data: {
                fileUrl: fileUrl
            }
        } as Segment);
    }

    /** 添加视频消息段 / Add a video message segment */
    video(fileUrl: string): UniMessage<Segment> {
        return this.update({
            type: "video",
            data: {
                fileUrl: fileUrl
            }
        } as Segment);
    }

    /** 添加文件消息段 / Add a file message segment */
    file(fileUrl: string): UniMessage<Segment> {
        return this.update({
            type: "file",
            data: {
                fileUrl: fileUrl
            }
        } as Segment);
    }
}

/** 可能的消息类型 /  Possible message types */
export type MessageArrayLike<
    Segment extends UniSegmentLike = UniSegmentLike<any>,
    Message extends UniMessage<Segment> = UniMessage<Segment>
> = Array<string | number | Segment> | Message;
