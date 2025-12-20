import type { UniSegment } from "@togawa-dev/utils/unimsg";
import { z } from "zod/v4";

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

export type Text = z.infer<typeof TextSchema> & UniSegment.UniSegmentLike;

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

export type Mention = z.infer<typeof MentionSchema> & UniSegment.UniSegmentLike;

/**
 * 提及全体消息段 / Mention All Segment
 */
export const MentionAllSchema = z.object({
    type: z.literal("mention_all"),
    data: z.object({})
});

export type MentionAll = z.infer<typeof MentionAllSchema> &
    UniSegment.UniSegmentLike;

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

export type Face = z.infer<typeof FaceSchema> & UniSegment.UniSegmentLike;

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

export type Reply = z.infer<typeof ReplySchema> & UniSegment.UniSegmentLike;

/**
 * 图片消息段 / Image Segment
 */
export const ImageSchema = z.object({
    type: z.literal("image"),
    data: z.object({
        /** 资源 ID */
        resource_id: z.string(),
        /** 临时 URL */
        temp_url: z.string(),
        /** 图片宽度 */
        width: z.int32(),
        /** 图片高度 */
        height: z.int32(),
        /** 图片预览文本 */
        summary: z.string(),
        /** 图片类型 */
        sub_type: z.enum(["normal", "sticker"])
    })
});

export type Image = z.infer<typeof ImageSchema> & UniSegment.UniSegmentLike;

/**
 * 语音消息段 / Record Segment
 */
export const RecordSchema = z.object({
    type: z.literal("record"),
    data: z.object({
        /** 资源 ID */
        resource_id: z.string(),
        /** 临时 URL */
        temp_url: z.string(),
        /** 语音时长（秒） */
        duration: z.int32()
    })
});

export type Record = z.infer<typeof RecordSchema> & UniSegment.UniSegmentLike;

/**
 * 视频消息段 / Video Segment
 */
export const VideoSchema = z.object({
    type: z.literal("video"),
    data: z.object({
        /** 资源 ID */
        resource_id: z.string(),
        /** 临时 URL */
        temp_url: z.string(),
        /** 视频宽度 */
        width: z.int32(),
        /** 视频高度 */
        height: z.int32(),
        /** 视频时长（秒） */
        duration: z.int32()
    })
});

export type Video = z.infer<typeof VideoSchema> & UniSegment.UniSegmentLike;

/**
 * 文件消息段 / File Segment
 */
export const FileSchema = z.object({
    type: z.literal("file"),
    data: z.object({
        /** 文件 ID */
        file_id: z.string(),
        /** 文件名称 */
        file_name: z.string(),
        /** 文件大小（字节） */
        file_size: z.int64(),
        /** 文件的 TriSHA1 哈希值，仅在私聊文件中存在 */
        file_hash: z.string().optional()
    })
});

export type File = z.infer<typeof FileSchema> & UniSegment.UniSegmentLike;

/**
 * 合并转发消息段 / Forward Segment
 */
export const ForwardSchema = z.object({
    type: z.literal("forward"),
    data: z.object({
        /** 合并转发 ID */
        forward_id: z.string()
    })
});

export type Forward = z.infer<typeof ForwardSchema> & UniSegment.UniSegmentLike;

/**
 * 市场表情消息段 / Market Face Segment
 */
export const MarketFaceSchema = z.object({
    type: z.literal("market_face"),
    data: z.object({
        /** 市场表情 URL */
        url: z.string()
    })
});

export type MarketFace = z.infer<typeof MarketFaceSchema> &
    UniSegment.UniSegmentLike;

/**
 * 小程序消息段 / Light App Segment
 */
export const LightAppSchema = z.object({
    type: z.literal("light_app"),
    data: z.object({
        /** 小程序名称 */
        app_name: z.string(),
        /** 小程序 JSON 数据 */
        json_payload: z.string()
    })
});

export type LightApp = z.infer<typeof LightAppSchema> &
    UniSegment.UniSegmentLike;

/**
 * XML 消息段 / XML Segment
 */
export const XmlSchema = z.object({
    type: z.literal("xml"),
    data: z.object({
        /** 服务 ID */
        service_id: z.int32(),
        /** XML 数据 */
        xml_payload: z.string()
    })
});

export type Xml = z.infer<typeof XmlSchema> & UniSegment.UniSegmentLike;

/**
 * 消息段 Schema 联合类型 / Message Segment Schema Union
 */
export const IncommingSegmentSchema = z.discriminatedUnion("type", [
    TextSchema,
    MentionSchema,
    MentionAllSchema,
    FaceSchema,
    ReplySchema,
    ImageSchema,
    RecordSchema,
    VideoSchema,
    FileSchema,
    ForwardSchema,
    MarketFaceSchema,
    LightAppSchema,
    XmlSchema
]);

export type IncommingSegment = z.infer<typeof IncommingSegmentSchema> &
    UniSegment.UniSegmentLike;
