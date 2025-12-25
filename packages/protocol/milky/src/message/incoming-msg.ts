import * as incoming from "./incoming-segment";

import type { Message, UniSegment } from "@togawa-dev/utils/unimsg";

import type { IncomingSegment } from "./incoming-segment";
import { UniMessage } from "@togawa-dev/utils/unimsg";

export class MilkyIncomingMessage
    extends Array<IncomingSegment>
    implements Message<IncomingSegment>
{
    constructor(...segments: IncomingSegment[]) {
        super(...segments);
    }

    update(...segments: IncomingSegment[]): MilkyIncomingMessage {
        return new MilkyIncomingMessage(...this, ...segments);
    }

    plain(): string {
        return this.reduce((acc, seg) => {
            if (seg.type === "text") return acc + seg.data.text;
            return acc;
        }, "");
    }

    mentioned(userId: string | number | bigint, allowAll: boolean): boolean {
        const uid = Number(userId);
        return this.some((seg) => {
            if (seg.type !== "mention" && seg.type !== "mention_all")
                return false;
            switch (seg.type) {
                case "mention":
                    return seg.data.user_id === uid;
                case "mention_all":
                    return allowAll;
                default:
                    return false; // 不应该到这里
            }
        });
    }

    quoted(msgId: string | bigint): boolean {
        const id = Number(msgId);
        return this.some((seg) => {
            if (seg.type !== "reply") return false;
            return seg.data.message_seq === id;
        });
    }

    text(...contents: unknown[]): MilkyIncomingMessage {
        const text = contents.map((t) => String(t)).join("");
        return this.update({
            type: "text",
            data: { text }
        } as incoming.Text);
    }

    mention(userId: string | number | bigint): MilkyIncomingMessage {
        return this.update({
            type: "mention",
            data: { user_id: Number(userId) }
        } as incoming.Mention);
    }

    mentionAll(): MilkyIncomingMessage {
        return this.update({
            type: "mention_all",
            data: {}
        } as incoming.MentionAll);
    }

    reply(messageSeq: string | number | bigint): MilkyIncomingMessage {
        return this.update({
            type: "reply",
            data: { message_seq: Number(messageSeq) }
        } as incoming.Reply);
    }

    quote(messageSeq: string | number | bigint): MilkyIncomingMessage {
        return this.reply(messageSeq);
    }

    image(
        resourceId: string,
        tempUrl: string,
        width: number,
        height: number,
        summary: string,
        subType: string
    ): MilkyIncomingMessage {
        return this.update({
            type: "image",
            data: {
                resource_id: resourceId,
                temp_url: tempUrl,
                width: width,
                height: height,
                summary: summary,
                sub_type: subType
            }
        } as incoming.Image);
    }

    record(
        resourceId: string,
        tempUrl: string,
        duration: number
    ): MilkyIncomingMessage {
        return this.update({
            type: "record",
            data: {
                resource_id: resourceId,
                temp_url: tempUrl,
                duration: duration
            }
        } as incoming.Record);
    }

    audio(
        resourceId: string,
        tempUrl: string,
        duration: number
    ): MilkyIncomingMessage {
        return this.record(resourceId, tempUrl, duration);
    }

    video(
        resourceId: string,
        tempUrl: string,
        width: number,
        height: number,
        duration: number
    ): MilkyIncomingMessage {
        return this.update({
            type: "video",
            data: {
                resource_id: resourceId,
                temp_url: tempUrl,
                width: width,
                height: height,
                duration: duration
            }
        } as incoming.Video);
    }

    file(
        fileId: string,
        fileName: string,
        fileSize: number | bigint,
        fileHash: string
    ): MilkyIncomingMessage {
        return this.update({
            type: "file",
            data: {
                file_id: fileId,
                file_name: fileName,
                file_size: Number(fileSize),
                file_hash: fileHash
            }
        } as incoming.File);
    }

    face(faceId: number | string): MilkyIncomingMessage {
        return this.update({
            type: "face",
            data: { face_id: String(faceId) }
        } as incoming.Face);
    }

    forward(forwardId: string): MilkyIncomingMessage {
        return this.update({
            type: "forward",
            data: { forward_id: forwardId }
        } as incoming.Forward);
    }

    market_face(url: string): MilkyIncomingMessage {
        return this.update({
            type: "market_face",
            data: { url: url }
        } as incoming.MarketFace);
    }

    lightApp(appName: string, jsonPayload: string): MilkyIncomingMessage {
        return this.update({
            type: "light_app",
            data: {
                app_name: appName,
                json_payload: jsonPayload
            }
        } as incoming.LightApp);
    }

    xml(serviceId: number | string, xmlPayload: string): MilkyIncomingMessage {
        return this.update({
            type: "xml",
            data: {
                service_id: Number(serviceId),
                xml_payload: xmlPayload
            }
        } as incoming.Xml);
    }

    toUniMessage(): UniMessage {
        // 遍历所有消息段，转换为 UniSegment 形式
        const uniSegments: Array<UniSegment.MessageSegment> = this.map(
            (seg) => {
                switch (seg.type) {
                    case "text":
                        return {
                            type: "text",
                            data: { text: seg.data.text }
                        } as UniSegment.Text;
                    case "image":
                        return {
                            type: "image",
                            data: { fileUrl: seg.data.temp_url }
                        } as UniSegment.Image;
                    case "record":
                        return {
                            type: "audio",
                            data: { fileUrl: seg.data.temp_url }
                        } as UniSegment.Audio;
                    case "video":
                        return {
                            type: "video",
                            data: { fileUrl: seg.data.temp_url }
                        } as UniSegment.Video;
                    case "file":
                        return {
                            type: "file",
                            data: { fileUrl: seg.data.file_id }
                        } as UniSegment.File;
                    case "mention":
                        return {
                            type: "mention",
                            data: { userId: seg.data.user_id.toString() }
                        } as UniSegment.Mention;
                    case "mention_all":
                        return {
                            type: "mention",
                            data: { userId: "all" }
                        } as UniSegment.Mention;
                    case "reply":
                        return {
                            type: "quote",
                            data: { msgId: seg.data.message_seq.toString() }
                        } as UniSegment.Quote;
                    default: {
                        return {
                            type: "other",
                            data: {
                                originalType: seg.type,
                                originalData: seg.data
                            }
                        };
                    }
                }
            }
        );
        return new UniMessage(...uniSegments);
    }
}
