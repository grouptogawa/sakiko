import { FriendEntity, GroupEntity, GroupMemberEntity } from "./system";

import { IncomingSegmentSchema } from "../../message/incoming-segment";
import { OutgoingSegmentSchema } from "../../message/outgoing-segment";
import { z } from "zod/v4";

// 数据实体定义 / Entity definitions

/**
 * 收到的消息 / Incoming Message
 */
export const IncomingMessageEntity = z.discriminatedUnion("message_scene", [
    z.object({
        /** 消息场景 */
        message_scene: z.literal("friend"),
        /** 好友 QQ 号或群号 */
        peer_id: z.int64(),
        /** 消息序列号 */
        message_seq: z.int64(),
        /** 发送者 QQ 号 */
        sender_id: z.int64(),
        /** 消息 Unix 时间戳（秒） */
        time: z.int64(),
        /** 消息段列表 */
        segments: z.array(IncomingSegmentSchema),
        /** 好友信息 */
        friend: FriendEntity
    }),
    z.object({
        /** 消息场景 */
        message_scene: z.literal("group"),
        /** 好友 QQ 号或群号 */
        peer_id: z.int64(),
        /** 消息序列号 */
        message_seq: z.int64(),
        /** 发送者 QQ 号 */
        sender_id: z.int64(),
        /** 消息 Unix 时间戳（秒） */
        time: z.int64(),
        /** 消息段列表 */
        segments: z.array(IncomingSegmentSchema),
        /** 群信息 */
        group: GroupEntity,
        /** 群成员信息 */
        group_member: GroupMemberEntity
    }),
    z.object({
        /** 消息场景 */
        message_scene: z.literal("temp"),
        /** 好友 QQ 号或群号 */
        peer_id: z.int64(),
        /** 消息序列号 */
        message_seq: z.int64(),
        /** 发送者 QQ 号 */
        sender_id: z.int64(),
        /** 消息 Unix 时间戳（秒） */
        time: z.int64(),
        /** 消息段列表 */
        segments: z.array(IncomingSegmentSchema),
        /** 临时会话发送者的所在的群信息 */
        group: GroupEntity.optional()
    })
]);

export type IncomingMessage = z.infer<typeof IncomingMessageEntity>;

/**
 * 合并转发消息 / Forwarded Message
 */
export const IncomingForwardedMessageEntity = z.object({
    /** 发送者名称 */
    sender_name: z.string(),
    /** 发送者头像 URL */
    avatar_url: z.string(),
    /** 消息 Unix 时间戳（秒） */
    time: z.int64(),
    /** 消息段列表 */
    segments: z.array(IncomingSegmentSchema)
});

export type IncomingForwardedMessage = z.infer<
    typeof IncomingForwardedMessageEntity
>;

// API 请求和响应数据结构定义 / API request and response data structure definitions

/**
 * 发送私聊消息 / Send Private Message
 */
export const sendPrivateMessageReq = z.object({
    /** 好友 QQ 号 */
    user_id: z.int64(),
    /** 消息内容 */
    message: z.array(OutgoingSegmentSchema)
});

export const sendPrivateMessageRes = z.object({
    /** 消息序列号 */
    message_seq: z.int64(),
    /** 消息发送时间，Unix 时间戳（秒） */
    time: z.int64()
});

/**
 * 发送群聊消息 / Send Group Message
 */
export const sendGroupMessageReq = z.object({
    /** 群号 */
    group_id: z.int64(),
    /** 消息内容 */
    message: z.array(OutgoingSegmentSchema)
});

export const sendGroupMessageRes = z.object({
    /** 消息序列号 */
    message_seq: z.int64(),
    /** 消息发送时间，Unix 时间戳（秒） */
    time: z.int64()
});

/**
 * 撤回私聊消息 / Recall Private Message
 */
export const recallPrivateMessageReq = z.object({
    /** 好友 QQ 号 */
    user_id: z.int64(),
    /** 消息序列号 */
    message_seq: z.int64()
});

export const recallPrivateMessageRes = z.object({});

/**
 * 撤回群聊消息 / Recall Group Message
 */
export const recallGroupMessageReq = z.object({
    /** 群号 */
    group_id: z.int64(),
    /** 消息序列号 */
    message_seq: z.int64()
});

export const recallGroupMessageRes = z.object({});

/**
 * 获取消息 / Get Message
 */
export const getMessageReq = z.object({
    /** 消息场景 */
    message_scene: z.enum(["friend", "group", "temp"]),
    /** 好友 QQ 号或群号 */
    peer_id: z.int64(),
    /** 消息序列号 */
    message_seq: z.int64()
});

export const getMessageRes = z.object({
    /** 消息内容 */
    message: IncomingMessageEntity
});

/**
 * 获取历史消息列表 / Get History Messages
 */
export const getHistoryMessagesReq = z.object({
    /** 消息场景 */
    message_scene: z.enum(["friend", "group", "temp"]),
    /** 好友 QQ 号或群号 */
    peer_id: z.int64(),
    /** 起始消息序列号，由此开始从新到旧查询，不提供则从最新消息开始 */
    start_message_seq: z.int64().optional(),
    /** 期望获取到的消息数量，最多 30 条 (default: 20) */
    limit: z.int32().optional().default(20)
});

export const getHistoryMessagesRes = z.object({
    /** 获取到的消息（message_seq 升序排列），部分消息可能不存在，如撤回的消息 */
    messages: z.array(IncomingMessageEntity),
    /** 下一页起始消息序列号 */
    next_message_seq: z.int64().optional()
});

/**
 * 获取临时资源链接 / Get Resource Temp URL
 */
export const getResourceTempUrlReq = z.object({
    /** 资源 ID */
    resource_id: z.string()
});

export const getResourceTempUrlRes = z.object({
    /** 临时资源链接 */
    url: z.string()
});

/**
 * 获取合并转发消息内容 / Get Forwarded Messages
 */
export const getForwardedMessagesReq = z.object({
    /** 转发消息 ID */
    forward_id: z.string()
});

export const getForwardedMessagesRes = z.object({
    /** 转发消息内容 */
    messages: z.array(IncomingForwardedMessageEntity)
});

/**
 * 标记消息为已读 / Mark Message As Read
 */
export const markMessageAsReadReq = z.object({
    /** 消息场景 */
    message_scene: z.enum(["friend", "group", "temp"]),
    /** 好友 QQ 号或群号 */
    peer_id: z.int64(),
    /** 标为已读的消息序列号，该消息及更早的消息将被标记为已读 */
    message_seq: z.int64()
});

export const markMessageAsReadRes = z.object({});
