/** 统一消息段类型注册表 / Unified Message Segment Type Registry */
export interface UniSegmentTypeRegistry {
    /** 文本消息段 / Text Segment */
    TEXT: "text";
    /** 图片消息段 / Image Segment */
    IMAGE: "image";
    /** 音频消息段 / Audio Segment */
    AUDIO: "audio";
    /** 视频消息段 / Video Segment */
    VIDEO: "video";
    /** 文件消息段 / File Segment */
    FILE: "file";
    /** 提及消息段 / Mention Segment */
    MENTION: "mention";
    /** 链接消息段 / Quote Segment */
    QUOTE: "quote";
    /** 其他消息段 / Other Segment */
    OTHER: "other";
}

/** 统一消息段类型 / Unified Message Segment Type */
export type UniSegmentType<
    Registry extends UniSegmentTypeRegistry = UniSegmentTypeRegistry
> = Registry[keyof Registry];

/** 统一消息段类型 / Unified Message Segment Type */
export type UniSegmentLike<
    Registry extends UniSegmentTypeRegistry = UniSegmentTypeRegistry
> = {
    type: UniSegmentType<Registry>;
    data: object;
};

/** 统一消息段 - 文本 / Unified Message Segment - Text */
export type Text = UniSegmentLike & {
    type: "text";
    data: {
        text: string;
    };
};

/** 统一消息段 - 图片 / Unified Message Segment - Image */
export type Image = UniSegmentLike & {
    type: "image";
    data: {
        fileUrl: string;
    };
};

/** 统一消息段 - 音频 / Unified Message Segment - Audio */
export type Audio = UniSegmentLike & {
    type: "audio";
    data: {
        fileUrl: string;
    };
};

/** 统一消息段 - 视频 / Unified Message Segment - Video */
export type Video = UniSegmentLike & {
    type: "video";
    data: {
        fileUrl: string;
    };
};

/** 统一消息段 - 文件 / Unified Message Segment - File */
export type File = UniSegmentLike & {
    type: "file";
    data: {
        fileUrl: string;
    };
};

/** 统一消息段 - 提及 / Unified Message Segment - Mention */
export type Mention = UniSegmentLike & {
    type: "mention";
    data: {
        userId: string | "all";
    };
};

/** 统一消息段 - 引用 / Unified Message Segment - Quote */
export type Quote = UniSegmentLike & {
    type: "quote";
    data: {
        msgId: string;
    };
};

/** 统一消息段 - 其他 / Unified Message Segment - Other */
export type Other = UniSegmentLike & {
    type: "other";
    data: {
        originalType: string;
        originalData: object;
    };
};
