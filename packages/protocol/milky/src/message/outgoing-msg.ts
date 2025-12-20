import * as outgoing from "./outgoing-segment";
import type * as uni from "@togawa-dev/utils/unimsg";

import type { OutgoingSegment } from "./outgoing-segment";
import { UniMessage } from "@togawa-dev/utils/unimsg";

/**
 * Milky 协议的发送消息实现
 *
 * Milky protocol implementation for outgoing messages
 */
export class MilkyOutgoingMessage
    extends Array<OutgoingSegment>
    implements uni.Message<OutgoingSegment>
{
    constructor(...segments: OutgoingSegment[]) {
        super(...segments);
    }

    static fromUniMessage(uniMsg: UniMessage): MilkyOutgoingMessage {
        const segments: OutgoingSegment[] = uniMsg.map((seg) => {
            switch (seg.type) {
                case "text":
                    return {
                        type: "text",
                        data: { text: seg.data.text }
                    } as outgoing.Text;
                case "image":
                    return {
                        type: "image",
                        data: {
                            uri: seg.data.fileUrl,
                            sub_type: "normal"
                        }
                    } as outgoing.Image;
                case "audio":
                    return {
                        type: "record",
                        data: { uri: seg.data.fileUrl }
                    } as outgoing.Record;
                case "video":
                    return {
                        type: "video",
                        data: { uri: seg.data.fileUrl }
                    } as outgoing.Video;
                case "file":
                    return {
                        type: "image",
                        data: {
                            uri: seg.data.fileUrl,
                            sub_type: "normal"
                        }
                    } as outgoing.Image;
                case "mention":
                    // userId 为 "all" 时转换为 mention_all
                    if (seg.data.userId === "all") {
                        return {
                            type: "mention_all",
                            data: {}
                        } as outgoing.MentionAll;
                    }
                    return {
                        type: "mention",
                        data: { user_id: BigInt(seg.data.userId) }
                    } as outgoing.Mention;
                case "quote":
                    return {
                        type: "reply",
                        data: { message_seq: BigInt(seg.data.msgId) }
                    } as outgoing.Reply;
                case "other":
                default:
                    // 无法映射的消息段使用 face 作为占位符，或忽略
                    return {
                        type: "face",
                        data: { face_id: "0" }
                    } as outgoing.Face;
            }
        });
        return new MilkyOutgoingMessage(...segments);
    }

    update(...segments: OutgoingSegment[]): MilkyOutgoingMessage {
        return new MilkyOutgoingMessage(...this, ...segments);
    }

    plain(): string {
        return this.reduce((acc, seg) => {
            if (seg.type === "text") return acc + seg.data.text;
            return acc;
        }, "");
    }

    mentioned(userId: string | number | bigint, allowAll: boolean): boolean {
        const uid = BigInt(userId);
        return this.some((seg) => {
            if (seg.type !== "mention" && seg.type !== "mention_all")
                return false;
            switch (seg.type) {
                case "mention":
                    return seg.data.user_id === uid;
                case "mention_all":
                    return allowAll;
                default:
                    return false;
            }
        });
    }

    quoted(msgId: string | bigint): boolean {
        const id = BigInt(msgId);
        return this.some((seg) => {
            if (seg.type !== "reply") return false;
            return seg.data.message_seq === id;
        });
    }

    text(...contents: unknown[]): MilkyOutgoingMessage {
        const text = contents.map((t) => String(t)).join("");
        return this.update({
            type: "text",
            data: { text }
        } as outgoing.Text);
    }

    mention(userId: string | number | bigint): MilkyOutgoingMessage {
        return this.update({
            type: "mention",
            data: { user_id: BigInt(userId) }
        } as outgoing.Mention);
    }

    mentionAll(): MilkyOutgoingMessage {
        return this.update({
            type: "mention_all",
            data: {}
        } as outgoing.MentionAll);
    }

    reply(messageSeq: string | number | bigint): MilkyOutgoingMessage {
        return this.update({
            type: "reply",
            data: { message_seq: BigInt(messageSeq) }
        } as outgoing.Reply);
    }

    quote(messageSeq: string | number | bigint): MilkyOutgoingMessage {
        return this.reply(messageSeq);
    }

    face(faceId: string | number): MilkyOutgoingMessage {
        return this.update({
            type: "face",
            data: { face_id: String(faceId) }
        } as outgoing.Face);
    }

    image(
        uri: string,
        subType: "normal" | "sticker" = "normal",
        summary?: string
    ): MilkyOutgoingMessage {
        return this.update({
            type: "image",
            data: {
                uri,
                sub_type: subType,
                ...(summary && { summary })
            }
        } as outgoing.Image);
    }

    record(uri: string): MilkyOutgoingMessage {
        return this.update({
            type: "record",
            data: { uri }
        } as outgoing.Record);
    }

    audio(uri: string): MilkyOutgoingMessage {
        return this.record(uri);
    }

    video(uri: string, thumbUri?: string): MilkyOutgoingMessage {
        return this.update({
            type: "video",
            data: {
                uri,
                ...(thumbUri && { thumb_uri: thumbUri })
            }
        } as outgoing.Video);
    }

    forward(
        messages: outgoing.OutgoingForwardedMessage[]
    ): MilkyOutgoingMessage {
        return this.update({
            type: "forward",
            data: { messages }
        } as outgoing.Forward);
    }
}
