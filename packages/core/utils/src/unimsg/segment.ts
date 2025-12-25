import { z } from "zod"; // 假设使用标准 zod 或兼容的 zod-mini

/**
 * 基础统一消息段 Schema
 */
export const UniSegmentSchema = z
    .object({
        type: z.string(),
        data: z.record(z.string(), z.any())
    })
    .loose();

export type UniSegmentLike = z.infer<typeof UniSegmentSchema>;

/** 文本消息段 */
export const TextSchema = z.object({
    type: z.literal("text"),
    data: z.object({
        text: z.string()
    })
});

export type Text = z.infer<typeof TextSchema> & UniSegmentLike;

/** 图片消息段 */
export const ImageSchema = z.object({
    type: z.literal("image"),
    data: z.object({
        fileUrl: z.string()
    })
});

export type Image = z.infer<typeof ImageSchema> & UniSegmentLike;

/** 音频消息段 */
export const AudioSchema = z.object({
    type: z.literal("audio"),
    data: z.object({
        fileUrl: z.string()
    })
});

export type Audio = z.infer<typeof AudioSchema> & UniSegmentLike;

/** 视频消息段 */
export const VideoSchema = z.object({
    type: z.literal("video"),
    data: z.object({
        fileUrl: z.string()
    })
});

export type Video = z.infer<typeof VideoSchema> & UniSegmentLike;

/** 文件消息段 */
export const FileSchema = z.object({
    type: z.literal("file"),
    data: z.object({
        fileUrl: z.string()
    })
});

export type File = z.infer<typeof FileSchema> & UniSegmentLike;

/** 提及消息段 */
export const MentionSchema = z.object({
    type: z.literal("mention"),
    data: z.object({
        /** 用户 ID 或 "all" */
        userId: z.union([z.string(), z.literal("all")])
    })
});

export type Mention = z.infer<typeof MentionSchema> & UniSegmentLike;

/** 引用消息段 */
export const QuoteSchema = z.object({
    type: z.literal("quote"),
    data: z.object({
        msgId: z.string()
    })
});

export type Quote = z.infer<typeof QuoteSchema> & UniSegmentLike;

/** 其他/未知消息段 (用于兜底) */
export const OtherSchema = z.object({
    type: z.literal("other"),
    data: z.object({
        originalType: z.string(),
        originalData: z.record(z.string(), z.any())
    })
});

export type Other = z.infer<typeof OtherSchema> & UniSegmentLike;

/** 消息段联合类型 Schema */
export const MessageSegmentSchema = z.discriminatedUnion("type", [
    TextSchema,
    ImageSchema,
    AudioSchema,
    VideoSchema,
    FileSchema,
    MentionSchema,
    QuoteSchema,
    OtherSchema
]);

/** 消息段联合类型 */
export type MessageSegment = z.infer<typeof MessageSegmentSchema>;
