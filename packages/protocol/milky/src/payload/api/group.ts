import { IncomingSegmentSchema } from "../../message/incoming-segment";
import { z } from "zod/v4";

// 数据实体定义 / Entity definitions

/**
 * 群公告 / Group Announcement
 */
export const GroupAnnouncementEntity = z.object({
    /** 群号 */
    group_id: z.number(),
    /** 公告 ID */
    announcement_id: z.string(),
    /** 发送者 QQ 号 */
    user_id: z.number(),
    /** Unix 时间戳（秒） */
    time: z.number(),
    /** 公告内容 */
    content: z.string(),
    /** 公告图片 URL */
    image_url: z.string().optional()
});

export type GroupAnnouncement = z.infer<typeof GroupAnnouncementEntity>;

/**
 * 群精华消息 / Group Essence Message
 */
export const GroupEssenceMessageEntity = z.object({
    /** 群号 */
    group_id: z.number(),
    /** 消息序列号 */
    message_seq: z.number(),
    /** 消息发送时的 Unix 时间戳（秒） */
    message_time: z.number(),
    /** 发送者 QQ 号 */
    sender_id: z.number(),
    /** 发送者名称 */
    sender_name: z.string(),
    /** 设置精华的操作者 QQ 号 */
    operator_id: z.number(),
    /** 设置精华的操作者名称 */
    operator_name: z.string(),
    /** 消息被设置精华时的 Unix 时间戳（秒） */
    operation_time: z.number(),
    /** 消息段列表 */
    segments: z.array(IncomingSegmentSchema)
});

export type GroupEssenceMessage = z.infer<typeof GroupEssenceMessageEntity>;

/**
 * 群通知 - 用户入群请求 / Group Notification - Join Request
 */
export const GroupJoinRequestNotificationEntity = z.object({
    /** 表示用户入群请求 */
    type: z.literal("join_request"),
    /** 群号 */
    group_id: z.number(),
    /** 通知序列号 */
    notification_seq: z.number(),
    /** 请求是否被过滤（发起自风险账户） */
    is_filtered: z.boolean(),
    /** 发起者 QQ 号 */
    initiator_id: z.number(),
    /** 请求状态 */
    state: z.enum(["pending", "accepted", "rejected", "ignored"]),
    /** 处理请求的管理员 QQ 号 */
    operator_id: z.number().optional(),
    /** 入群请求附加信息 */
    comment: z.string()
});

/**
 * 群通知 - 群管理员变更通知 / Group Notification - Admin Change
 */
export const GroupAdminChangeNotificationEntity = z.object({
    /** 表示群管理员变更通知 */
    type: z.literal("admin_change"),
    /** 群号 */
    group_id: z.number(),
    /** 通知序列号 */
    notification_seq: z.number(),
    /** 被设置/取消用户 QQ 号 */
    target_user_id: z.number(),
    /** 是否被设置为管理员，`false` 表示被取消管理员 */
    is_set: z.boolean(),
    /** 操作者（群主）QQ 号 */
    operator_id: z.number()
});

/**
 * 群通知 - 群成员被移除通知 / Group Notification - Kick
 */
export const GroupKickNotificationEntity = z.object({
    /** 表示群成员被移除通知 */
    type: z.literal("kick"),
    /** 群号 */
    group_id: z.number(),
    /** 通知序列号 */
    notification_seq: z.number(),
    /** 被移除用户 QQ 号 */
    target_user_id: z.number(),
    /** 移除用户的管理员 QQ 号 */
    operator_id: z.number()
});

/**
 * 群通知 - 群成员退群通知 / Group Notification - Quit
 */
export const GroupQuitNotificationEntity = z.object({
    /** 表示群成员退群通知 */
    type: z.literal("quit"),
    /** 群号 */
    group_id: z.number(),
    /** 通知序列号 */
    notification_seq: z.number(),
    /** 退群用户 QQ 号 */
    target_user_id: z.number()
});

/**
 * 群通知 - 群成员邀请他人入群请求 / Group Notification - Invited Join Request
 */
export const GroupInvitedJoinRequestNotificationEntity = z.object({
    /** 表示群成员邀请他人入群请求 */
    type: z.literal("invited_join_request"),
    /** 群号 */
    group_id: z.number(),
    /** 通知序列号 */
    notification_seq: z.number(),
    /** 邀请者 QQ 号 */
    initiator_id: z.number(),
    /** 被邀请用户 QQ 号 */
    target_user_id: z.number(),
    /** 请求状态 */
    state: z.enum(["pending", "accepted", "rejected", "ignored"]),
    /** 处理请求的管理员 QQ 号 */
    operator_id: z.number().optional()
});

/**
 * 群通知 / Group Notification (Union Type)
 */
export const GroupNotificationEntity = z.discriminatedUnion("type", [
    GroupJoinRequestNotificationEntity,
    GroupAdminChangeNotificationEntity,
    GroupKickNotificationEntity,
    GroupQuitNotificationEntity,
    GroupInvitedJoinRequestNotificationEntity
]);

export type GroupNotification = z.infer<typeof GroupNotificationEntity>;

// API 请求和响应数据结构定义 / API request and response data structure definitions

/**
 * 设置群名称 / Set Group Name
 */
export const setGroupNameReq = z.object({
    /** 群号 */
    group_id: z.number(),
    /** 新群名称 */
    new_group_name: z.string()
});

export const setGroupNameRes = z.object({});

/**
 * 设置群头像 / Set Group Avatar
 */
export const setGroupAvatarReq = z.object({
    /** 群号 */
    group_id: z.number(),
    /** 头像文件 URI，支持 `file://` `http(s)://` `base64://` 三种格式 */
    image_uri: z.string()
});

export const setGroupAvatarRes = z.object({});

/**
 * 设置群名片 / Set Group Member Card
 */
export const setGroupMemberCardReq = z.object({
    /** 群号 */
    group_id: z.number(),
    /** 被设置的群成员 QQ 号 */
    user_id: z.number(),
    /** 新群名片 */
    card: z.string()
});

export const setGroupMemberCardRes = z.object({});

/**
 * 设置群成员专属头衔 / Set Group Member Special Title
 */
export const setGroupMemberSpecialTitleReq = z.object({
    /** 群号 */
    group_id: z.number(),
    /** 被设置的群成员 QQ 号 */
    user_id: z.number(),
    /** 新专属头衔 */
    special_title: z.string()
});

export const setGroupMemberSpecialTitleRes = z.object({});

/**
 * 设置群管理员 / Set Group Member Admin
 */
export const setGroupMemberAdminReq = z.object({
    /** 群号 */
    group_id: z.number(),
    /** 被设置的 QQ 号 */
    user_id: z.number(),
    /** 是否设置为管理员，`false` 表示取消管理员 (default: true) */
    is_set: z.boolean().optional().default(true)
});

export const setGroupMemberAdminRes = z.object({});

/**
 * 设置群成员禁言 / Set Group Member Mute
 */
export const setGroupMemberMuteReq = z.object({
    /** 群号 */
    group_id: z.number(),
    /** 被设置的 QQ 号 */
    user_id: z.number(),
    /** 禁言持续时间（秒），设为 `0` 为取消禁言 (default: 0) */
    duration: z.number().optional().default(0)
});

export const setGroupMemberMuteRes = z.object({});

/**
 * 设置群全员禁言 / Set Group Whole Mute
 */
export const setGroupWholeMuteReq = z.object({
    /** 群号 */
    group_id: z.number(),
    /** 是否开启全员禁言，`false` 表示取消全员禁言 (default: true) */
    is_mute: z.boolean().optional().default(true)
});

export const setGroupWholeMuteRes = z.object({});

/**
 * 踢出群成员 / Kick Group Member
 */
export const kickGroupMemberReq = z.object({
    /** 群号 */
    group_id: z.number(),
    /** 被踢的 QQ 号 */
    user_id: z.number(),
    /** 是否拒绝加群申请，`false` 表示不拒绝 (default: false) */
    reject_add_request: z.boolean().optional().default(false)
});

export const kickGroupMemberRes = z.object({});

/**
 * 获取群公告列表 / Get Group Announcements
 */
export const getGroupAnnouncementsReq = z.object({
    /** 群号 */
    group_id: z.number()
});

export const getGroupAnnouncementsRes = z.object({
    /** 群公告列表 */
    announcements: z.array(GroupAnnouncementEntity)
});

/**
 * 发送群公告 / Send Group Announcement
 */
export const sendGroupAnnouncementReq = z.object({
    /** 群号 */
    group_id: z.number(),
    /** 公告内容 */
    content: z.string(),
    /** 公告附带图像文件 URI，支持 `file://` `http(s)://` `base64://` 三种格式 */
    image_uri: z.string().optional()
});

export const sendGroupAnnouncementRes = z.object({});

/**
 * 删除群公告 / Delete Group Announcement
 */
export const deleteGroupAnnouncementReq = z.object({
    /** 群号 */
    group_id: z.number(),
    /** 公告 ID */
    announcement_id: z.string()
});

export const deleteGroupAnnouncementRes = z.object({});

/**
 * 获取群精华消息列表 / Get Group Essence Messages
 */
export const getGroupEssenceMessagesReq = z.object({
    /** 群号 */
    group_id: z.number(),
    /** 页码索引，从 0 开始 */
    page_index: z.number(),
    /** 每页包含的精华消息数量 */
    page_size: z.number()
});

export const getGroupEssenceMessagesRes = z.object({
    /** 精华消息列表 */
    messages: z.array(GroupEssenceMessageEntity),
    /** 是否已到最后一页 */
    is_end: z.boolean()
});

/**
 * 设置群精华消息 / Set Group Essence Message
 */
export const setGroupEssenceMessageReq = z.object({
    /** 群号 */
    group_id: z.number(),
    /** 消息序列号 */
    message_seq: z.number(),
    /** 是否设置为精华消息，`false` 表示取消精华 (default: true) */
    is_set: z.boolean().optional().default(true)
});

export const setGroupEssenceMessageRes = z.object({});

/**
 * 退出群 / Quit Group
 */
export const quitGroupReq = z.object({
    /** 群号 */
    group_id: z.number()
});

export const quitGroupRes = z.object({});

/**
 * 发送群消息表情回应 / Send Group Message Reaction
 */
export const sendGroupMessageReactionReq = z.object({
    /** 群号 */
    group_id: z.number(),
    /** 要回应的消息序列号 */
    message_seq: z.number(),
    /** 表情 ID */
    reaction: z.string(),
    /** 是否添加表情，`false` 表示取消 (default: true) */
    is_add: z.boolean().optional().default(true)
});

export const sendGroupMessageReactionRes = z.object({});

/**
 * 发送群戳一戳 / Send Group Nudge
 */
export const sendGroupNudgeReq = z.object({
    /** 群号 */
    group_id: z.number(),
    /** 被戳的群成员 QQ 号 */
    user_id: z.number()
});

export const sendGroupNudgeRes = z.object({});

/**
 * 获取群通知列表 / Get Group Notifications
 */
export const getGroupNotificationsReq = z.object({
    /** 起始通知序列号 */
    start_notification_seq: z.number().optional(),
    /** `true` 表示只获取被过滤（由风险账号发起）的通知，`false` 表示只获取未被过滤的通知 (default: false) */
    is_filtered: z.boolean().optional().default(false),
    /** 获取的最大通知数量 (default: 20) */
    limit: z.number().optional().default(20)
});

export const getGroupNotificationsRes = z.object({
    /** 获取到的群通知（notification_seq 降序排列），序列号不一定连续 */
    notifications: z.array(GroupNotificationEntity),
    /** 下一页起始通知序列号 */
    next_notification_seq: z.number().optional()
});

/**
 * 同意入群/邀请他人入群请求 / Accept Group Request
 */
export const acceptGroupRequestReq = z.object({
    /** 请求对应的通知序列号 */
    notification_seq: z.number(),
    /** 请求对应的通知类型 */
    notification_type: z.enum(["join_request", "invited_join_request"]),
    /** 请求所在的群号 */
    group_id: z.number(),
    /** 是否是被过滤的请求 (default: false) */
    is_filtered: z.boolean().optional().default(false)
});

export const acceptGroupRequestRes = z.object({});

/**
 * 拒绝入群/邀请他人入群请求 / Reject Group Request
 */
export const rejectGroupRequestReq = z.object({
    /** 请求对应的通知序列号 */
    notification_seq: z.number(),
    /** 请求对应的通知类型 */
    notification_type: z.enum(["join_request", "invited_join_request"]),
    /** 请求所在的群号 */
    group_id: z.number(),
    /** 是否是被过滤的请求 (default: false) */
    is_filtered: z.boolean().optional().default(false),
    /** 拒绝理由 */
    reason: z.string().optional()
});

export const rejectGroupRequestRes = z.object({});

/**
 * 同意他人邀请自身入群 / Accept Group Invitation
 */
export const acceptGroupInvitationReq = z.object({
    /** 群号 */
    group_id: z.number(),
    /** 邀请序列号 */
    invitation_seq: z.number()
});

export const acceptGroupInvitationRes = z.object({});

/**
 * 拒绝他人邀请自身入群 / Reject Group Invitation
 */
export const rejectGroupInvitationReq = z.object({
    /** 群号 */
    group_id: z.number(),
    /** 邀请序列号 */
    invitation_seq: z.number()
});

export const rejectGroupInvitationRes = z.object({});
