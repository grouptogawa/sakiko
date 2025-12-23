import { z } from "zod/v4";

// 数据实体定义 / Entity definitions

/**
 * 好友请求 / Friend Request
 */
export const FriendRequestEntity = z.object({
    /** 请求发起时的 Unix 时间戳（秒） */
    time: z.int64(),
    /** 请求发起者 QQ 号 */
    initiator_id: z.int64(),
    /** 请求发起者 UID */
    initiator_uid: z.string(),
    /** 目标用户 QQ 号 */
    target_user_id: z.int64(),
    /** 目标用户 UID */
    target_user_uid: z.string(),
    /** 请求状态 */
    state: z.enum(["pending", "accepted", "rejected", "ignored"]),
    /** 申请附加信息 */
    comment: z.string(),
    /** 申请来源 */
    via: z.string(),
    /** 请求是否被过滤（发起自风险账户） */
    is_filtered: z.boolean()
});

export type FriendRequest = z.infer<typeof FriendRequestEntity>;

// API 请求和响应数据结构定义 / API request and response data structure definitions

/**
 * 发送好友戳一戳 / Send Friend Nudge
 */
export const sendFriendNudgeReq = z.object({
    /** 好友 QQ 号 */
    user_id: z.int64(),
    /** 是否戳自己 (default: false) */
    is_self: z.boolean().optional().default(false)
});

export const sendFriendNudgeRes = z.object({});

/**
 * 发送名片点赞 / Send Profile Like
 */
export const sendProfileLikeReq = z.object({
    /** 好友 QQ 号 */
    user_id: z.int64(),
    /** 点赞数量 (default: 1) */
    count: z.int32().optional().default(1)
});

export const sendProfileLikeRes = z.object({});

/**
 * 获取好友请求列表 / Get Friend Requests
 */
export const getFriendRequestsReq = z.object({
    /** 获取的最大请求数量 (default: 20) */
    limit: z.int32().optional().default(20),
    /** true 表示只获取被过滤（由风险账号发起）的通知，false 表示只获取未被过滤的通知 (default: false) */
    is_filtered: z.boolean().optional().default(false)
});

export const getFriendRequestsRes = z.object({
    /** 好友请求列表 */
    requests: z.array(FriendRequestEntity)
});

/**
 * 同意好友请求 / Accept Friend Request
 */
export const acceptFriendRequestReq = z.object({
    /** 请求发起者 UID */
    initiator_uid: z.string(),
    /** 是否是被过滤的请求 (default: false) */
    is_filtered: z.boolean().optional().default(false)
});

export const acceptFriendRequestRes = z.object({});

/**
 * 拒绝好友请求 / Reject Friend Request
 */
export const rejectFriendRequestReq = z.object({
    /** 请求发起者 UID */
    initiator_uid: z.string(),
    /** 是否是被过滤的请求 (default: false) */
    is_filtered: z.boolean().optional().default(false),
    /** 拒绝理由 */
    reason: z.string().optional()
});

export const rejectFriendRequestRes = z.object({});
