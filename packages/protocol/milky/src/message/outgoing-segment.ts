import type { UniSegment } from "@togawa-dev/utils/unimsg";
import { z } from "zod/v4";

type UniSegmentLike = UniSegment.UniSegmentLike;

/**
 * 文本消息段 / Text Segment
 */
export const TextSchema = z.object({
    type: z.literal("text"),
    data: z.object({
        /** 文本内容 */
        text: z.string()
    })
});

export type Text = z.infer<typeof TextSchema> & UniSegmentLike;

/**
 * 提及消息段 / Mention Segment
 */
export const MentionSchema = z.object({
    type: z.literal("mention"),
    data: z.object({
        /** 提及的 QQ 号 */
        user_id: z.int64()
    })
});

export type Mention = z.infer<typeof MentionSchema> & UniSegmentLike;

/**
 * 提及全体消息段 / Mention All Segment
 */
export const MentionAllSchema = z.object({
    type: z.literal("mention_all"),
    data: z.object({})
});

export type MentionAll = z.infer<typeof MentionAllSchema> & UniSegmentLike;

/**
 * 表情消息段 / Face Segment
 */
export const FaceSchema = z.object({
    type: z.literal("face"),
    data: z.object({
        /** 表情 ID */
        face_id: z.string()
    })
});

export type Face = z.infer<typeof FaceSchema> & UniSegmentLike;

/**
 * 回复消息段 / Reply Segment
 */
export const ReplySchema = z.object({
    type: z.literal("reply"),
    data: z.object({
        /** 被引用的消息序列号 */
        message_seq: z.int64()
    })
});

export type Reply = z.infer<typeof ReplySchema> & UniSegmentLike;

/**
 * 图片消息段 / Image Segment
 */
export const ImageSchema = z.object({
    type: z.literal("image"),
    data: z.object({
        /** 文件 URI，支持 `file://` `http(s)://` `base64://` 三种格式 */
        uri: z.string(),
        /** 图片预览文本 */
        summary: z.string().optional(),
        /** 图片类型 */
        sub_type: z.enum(["normal", "sticker"])
    })
});

export type Image = z.infer<typeof ImageSchema> & UniSegmentLike;

/**
 * 语音消息段 / Record Segment
 */
export const RecordSchema = z.object({
    type: z.literal("record"),
    data: z.object({
        /** 文件 URI，支持 `file://` `http(s)://` `base64://` 三种格式 */
        uri: z.string()
    })
});

export type Record = z.infer<typeof RecordSchema> & UniSegmentLike;

/**
 * 视频消息段 / Video Segment
 */
export const VideoSchema = z.object({
    type: z.literal("video"),
    data: z.object({
        /** 文件 URI，支持 `file://` `http(s)://` `base64://` 三种格式 */
        uri: z.string(),
        /** 封面图片 URI */
        thumb_uri: z.string().optional()
    })
});

export type Video = z.infer<typeof VideoSchema> & UniSegmentLike;

// 先声明类型，用于递归 schema
export interface OutgoingForwardedMessage {
    content: OutgoingSegment[];
    nickname?: string;
    user_id?: bigint;
    timestamp?: bigint;
}

export interface Forward extends UniSegmentLike {
    type: "forward";
    data: {
        messages: OutgoingForwardedMessage[];
    };
}

/**
 * 合并转发消息段 / Forward Segment
 */
export const ForwardSchema: z.ZodType = z.lazy(() =>
    z.object({
        type: z.literal("forward"),
        data: z.object({
            messages: z.array(OutgoingForwardedMessageSchema)
        })
    })
);

/**
 * 合并转发消息 / Forwarded Message
 */
export const OutgoingForwardedMessageSchema: z.ZodType = z.object({
    content: z.array(z.lazy(() => OutgoingSegmentSchema)),
    nickname: z.string().optional(),
    user_id: z.int64().optional(),
    timestamp: z.int64().optional()
});

/**
 * 消息段 Schema 联合类型 / Message Segment Schema Union
 */
export const OutgoingSegmentSchema: z.ZodType = z.union([
    TextSchema,
    MentionSchema,
    MentionAllSchema,
    FaceSchema,
    ReplySchema,
    ImageSchema,
    RecordSchema,
    VideoSchema,
    ForwardSchema
]);

export type OutgoingSegment =
    | Text
    | Mention
    | MentionAll
    | Face
    | Reply
    | Image
    | Record
    | Video
    | Forward;
