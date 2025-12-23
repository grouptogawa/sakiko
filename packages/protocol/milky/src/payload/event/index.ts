import { IncomingMessageEntity } from "../api/message";
import { z } from "zod/v4";

// 事件数据 schema 定义 / Event Data Schema Definitions

/**
 * 机器人离线事件 / Bot Offline Event
 */
export const BotOfflineEventDataSchema = z.object({
    /** 下线原因 */
    reason: z.string()
});

export type BotOfflineEventData = z.infer<typeof BotOfflineEventDataSchema>;

/**
 * 消息接收事件 / Message Receive Event
 */
export const MessageReceiveEventDataSchema = IncomingMessageEntity;

export type MessageReceiveEventData = z.infer<
    typeof MessageReceiveEventDataSchema
>;

/**
 * 消息撤回事件 / Message Recall Event
 */
export const MessageRecallEventDataSchema = z.object({
    /** 消息场景 */
    message_scene: z.enum(["friend", "group", "temp"]),
    /** 好友 QQ 号或群号 */
    peer_id: z.int64(),
    /** 消息序列号 */
    message_seq: z.int64(),
    /** 被撤回的消息的发送者 QQ 号 */
    sender_id: z.int64(),
    /** 操作者 QQ 号 */
    operator_id: z.int64(),
    /** 撤回提示的后缀文本 */
    display_suffix: z.string()
});

export type MessageRecallEventData = z.infer<
    typeof MessageRecallEventDataSchema
>;

/**
 * 好友请求事件 / Friend Request Event
 */
export const FriendRequestEventDataSchema = z.object({
    /** 申请好友的用户 QQ 号 */
    initiator_id: z.int64(),
    /** 用户 UID */
    initiator_uid: z.string(),
    /** 申请附加信息 */
    comment: z.string(),
    /** 申请来源 */
    via: z.string()
});

export type FriendRequestEventData = z.infer<
    typeof FriendRequestEventDataSchema
>;

/**
 * 入群请求事件 / Group Join Request Event
 */
export const GroupJoinRequestEventDataSchema = z.object({
    /** 群号 */
    group_id: z.int64(),
    /** 请求对应的通知序列号 */
    notification_seq: z.int64(),
    /** 请求是否被过滤（发起自风险账户） */
    is_filtered: z.boolean(),
    /** 申请入群的用户 QQ 号 */
    initiator_id: z.int64(),
    /** 申请附加信息 */
    comment: z.string()
});

export type GroupJoinRequestEventData = z.infer<
    typeof GroupJoinRequestEventDataSchema
>;

/**
 * 群成员邀请他人入群请求事件 / Group Invited Join Request Event
 */
export const GroupInvitedJoinRequestEventDataSchema = z.object({
    /** 群号 */
    group_id: z.int64(),
    /** 请求对应的通知序列号 */
    notification_seq: z.int64(),
    /** 邀请者 QQ 号 */
    initiator_id: z.int64(),
    /** 被邀请者 QQ 号 */
    target_user_id: z.int64()
});

export type GroupInvitedJoinRequestEventData = z.infer<
    typeof GroupInvitedJoinRequestEventDataSchema
>;

/**
 * 他人邀请自身入群事件 / Group Invitation Event
 */
export const GroupInvitationEventDataSchema = z.object({
    /** 群号 */
    group_id: z.int64(),
    /** 邀请序列号 */
    invitation_seq: z.int64(),
    /** 邀请者 QQ 号 */
    initiator_id: z.int64()
});

export type GroupInvitationEventData = z.infer<
    typeof GroupInvitationEventDataSchema
>;

/**
 * 好友戳一戳事件 / Friend Nudge Event
 */
export const FriendNudgeEventDataSchema = z.object({
    /** 好友 QQ 号 */
    user_id: z.int64(),
    /** 是否是自己发送的戳一戳 */
    is_self_send: z.boolean(),
    /** 是否是自己接收的戳一戳 */
    is_self_receive: z.boolean(),
    /** 戳一戳提示的动作文本 */
    display_action: z.string(),
    /** 戳一戳提示的后缀文本 */
    display_suffix: z.string(),
    /** 戳一戳提示的动作图片 URL，用于取代动作提示文本 */
    display_action_img_url: z.string()
});

export type FriendNudgeEventData = z.infer<typeof FriendNudgeEventDataSchema>;

/**
 * 好友文件上传事件 / Friend File Upload Event
 */
export const FriendFileUploadEventDataSchema = z.object({
    /** 好友 QQ 号 */
    user_id: z.int64(),
    /** 文件 ID */
    file_id: z.string(),
    /** 文件名称 */
    file_name: z.string(),
    /** 文件大小（字节） */
    file_size: z.int64(),
    /** 文件的 TriSHA1 哈希值 */
    file_hash: z.string(),
    /** 是否是自己发送的文件 */
    is_self: z.boolean()
});

export type FriendFileUploadEventData = z.infer<
    typeof FriendFileUploadEventDataSchema
>;

/**
 * 群管理员变更事件 / Group Admin Change Event
 */
export const GroupAdminChangeEventDataSchema = z.object({
    /** 群号 */
    group_id: z.int64(),
    /** 发生变更的用户 QQ 号 */
    user_id: z.int64(),
    /** 是否被设置为管理员，`false` 表示被取消管理员 */
    is_set: z.boolean()
});

export type GroupAdminChangeEventData = z.infer<
    typeof GroupAdminChangeEventDataSchema
>;

/**
 * 群精华消息变更事件 / Group Essence Message Change Event
 */
export const GroupEssenceMessageChangeEventDataSchema = z.object({
    /** 群号 */
    group_id: z.int64(),
    /** 发生变更的消息序列号 */
    message_seq: z.int64(),
    /** 是否被设置为精华，`false` 表示被取消精华 */
    is_set: z.boolean()
});

export type GroupEssenceMessageChangeEventData = z.infer<
    typeof GroupEssenceMessageChangeEventDataSchema
>;

/**
 * 群成员增加事件 / Group Member Increase Event
 */
export const GroupMemberIncreaseEventDataSchema = z.object({
    /** 群号 */
    group_id: z.int64(),
    /** 发生变更的用户 QQ 号 */
    user_id: z.int64(),
    /** 管理员 QQ 号，如果是管理员同意入群 */
    operator_id: z.int64().optional(),
    /** 邀请者 QQ 号，如果是邀请入群 */
    invitor_id: z.int64().optional()
});

export type GroupMemberIncreaseEventData = z.infer<
    typeof GroupMemberIncreaseEventDataSchema
>;

/**
 * 群成员减少事件 / Group Member Decrease Event
 */
export const GroupMemberDecreaseEventDataSchema = z.object({
    /** 群号 */
    group_id: z.int64(),
    /** 发生变更的用户 QQ 号 */
    user_id: z.int64(),
    /** 管理员 QQ 号，如果是管理员踢出 */
    operator_id: z.int64().optional()
});

export type GroupMemberDecreaseEventData = z.infer<
    typeof GroupMemberDecreaseEventDataSchema
>;

/**
 * 群名称变更事件 / Group Name Change Event
 */
export const GroupNameChangeEventDataSchema = z.object({
    /** 群号 */
    group_id: z.int64(),
    /** 新的群名称 */
    new_group_name: z.string(),
    /** 操作者 QQ 号 */
    operator_id: z.int64()
});

export type GroupNameChangeEventData = z.infer<
    typeof GroupNameChangeEventDataSchema
>;

/**
 * 群消息表情回应事件 / Group Message Reaction Event
 */
export const GroupMessageReactionEventDataSchema = z.object({
    /** 群号 */
    group_id: z.int64(),
    /** 发送回应者 QQ 号 */
    user_id: z.int64(),
    /** 消息序列号 */
    message_seq: z.int64(),
    /** 表情 ID */
    face_id: z.string(),
    /** 是否为添加，`false` 表示取消回应 */
    is_add: z.boolean()
});

export type GroupMessageReactionEventData = z.infer<
    typeof GroupMessageReactionEventDataSchema
>;

/**
 * 群禁言事件 / Group Mute Event
 */
export const GroupMuteEventDataSchema = z.object({
    /** 群号 */
    group_id: z.int64(),
    /** 发生变更的用户 QQ 号 */
    user_id: z.int64(),
    /** 操作者 QQ 号 */
    operator_id: z.int64(),
    /** 禁言时长（秒），为 0 表示取消禁言 */
    duration: z.int32()
});

export type GroupMuteEventData = z.infer<typeof GroupMuteEventDataSchema>;

/**
 * 群全体禁言事件 / Group Whole Mute Event
 */
export const GroupWholeMuteEventDataSchema = z.object({
    /** 群号 */
    group_id: z.int64(),
    /** 操作者 QQ 号 */
    operator_id: z.int64(),
    /** 是否全员禁言，`false` 表示取消全员禁言 */
    is_mute: z.boolean()
});

export type GroupWholeMuteEventData = z.infer<
    typeof GroupWholeMuteEventDataSchema
>;

/**
 * 群戳一戳事件 / Group Nudge Event
 */
export const GroupNudgeEventDataSchema = z.object({
    /** 群号 */
    group_id: z.int64(),
    /** 发送者 QQ 号 */
    sender_id: z.int64(),
    /** 接收者 QQ 号 */
    receiver_id: z.int64(),
    /** 戳一戳提示的动作文本 */
    display_action: z.string(),
    /** 戳一戳提示的后缀文本 */
    display_suffix: z.string(),
    /** 戳一戳提示的动作图片 URL，用于取代动作提示文本 */
    display_action_img_url: z.string()
});

export type GroupNudgeEventData = z.infer<typeof GroupNudgeEventDataSchema>;

/**
 * 群文件上传事件 / Group File Upload Event
 */
export const GroupFileUploadEventDataSchema = z.object({
    /** 群号 */
    group_id: z.int64(),
    /** 发送者 QQ 号 */
    user_id: z.int64(),
    /** 文件 ID */
    file_id: z.string(),
    /** 文件名称 */
    file_name: z.string(),
    /** 文件大小（字节） */
    file_size: z.int64()
});

export type GroupFileUploadEventData = z.infer<
    typeof GroupFileUploadEventDataSchema
>;

// 事件payload定义 / Event Payload Definitions

/**
 * 机器人离线事件 / Bot Offline Event
 */
export const BotOfflineEventPayload = z.object({
    event_type: z.literal("bot_offline"),
    time: z.int64(),
    self_id: z.int64(),
    data: BotOfflineEventDataSchema
});

export type BotOfflineEventPayload = z.infer<typeof BotOfflineEventPayload>;

/**
 * 消息接收事件 / Message Receive Event
 */
export const MessageReceiveEventPayload = z.object({
    event_type: z.literal("message_receive"),
    time: z.int64(),
    self_id: z.int64(),
    data: MessageReceiveEventDataSchema
});

export type MessageReceiveEventPayload = z.infer<
    typeof MessageReceiveEventPayload
>;

/**
 * 消息撤回事件 / Message Recall Event
 */
export const MessageRecallEventPayload = z.object({
    event_type: z.literal("message_recall"),
    time: z.int64(),
    self_id: z.int64(),
    data: MessageRecallEventDataSchema
});

export type MessageRecallEventPayload = z.infer<
    typeof MessageRecallEventPayload
>;

/**
 * 好友请求事件 / Friend Request Event
 */
export const FriendRequestEventPayload = z.object({
    event_type: z.literal("friend_request"),
    time: z.int64(),
    self_id: z.int64(),
    data: FriendRequestEventDataSchema
});

export type FriendRequestEventPayload = z.infer<
    typeof FriendRequestEventPayload
>;

/**
 * 入群请求事件 / Group Join Request Event
 */
export const GroupJoinRequestEventPayload = z.object({
    event_type: z.literal("group_join_request"),
    time: z.int64(),
    self_id: z.int64(),
    data: GroupJoinRequestEventDataSchema
});

export type GroupJoinRequestEventPayload = z.infer<
    typeof GroupJoinRequestEventPayload
>;

/**
 * 群成员邀请他人入群请求事件 / Group Invited Join Request Event
 */
export const GroupInvitedJoinRequestEventPayload = z.object({
    event_type: z.literal("group_invited_join_request"),
    time: z.int64(),
    self_id: z.int64(),
    data: GroupInvitedJoinRequestEventDataSchema
});

export type GroupInvitedJoinRequestEventPayload = z.infer<
    typeof GroupInvitedJoinRequestEventPayload
>;

/**
 * 他人邀请自身入群事件 / Group Invitation Event
 */
export const GroupInvitationEventPayload = z.object({
    event_type: z.literal("group_invitation"),
    time: z.int64(),
    self_id: z.int64(),
    data: GroupInvitationEventDataSchema
});

export type GroupInvitationEventPayload = z.infer<
    typeof GroupInvitationEventPayload
>;

/**
 * 好友戳一戳事件 / Friend Nudge Event
 */
export const FriendNudgeEventPayload = z.object({
    event_type: z.literal("friend_nudge"),
    time: z.int64(),
    self_id: z.int64(),
    data: FriendNudgeEventDataSchema
});

export type FriendNudgeEventPayload = z.infer<typeof FriendNudgeEventPayload>;

/**
 * 好友文件上传事件 / Friend File Upload Event
 */
export const FriendFileUploadEventPayload = z.object({
    event_type: z.literal("friend_file_upload"),
    time: z.int64(),
    self_id: z.int64(),
    data: FriendFileUploadEventDataSchema
});

export type FriendFileUploadEventPayload = z.infer<
    typeof FriendFileUploadEventPayload
>;

/**
 * 群管理员变更事件 / Group Admin Change Event
 */
export const GroupAdminChangeEventPayload = z.object({
    event_type: z.literal("group_admin_change"),
    time: z.int64(),
    self_id: z.int64(),
    data: GroupAdminChangeEventDataSchema
});

export type GroupAdminChangeEventPayload = z.infer<
    typeof GroupAdminChangeEventPayload
>;

/**
 * 群精华消息变更事件 / Group Essence Message Change Event
 */
export const GroupEssenceMessageChangeEventPayload = z.object({
    event_type: z.literal("group_essence_message_change"),
    time: z.int64(),
    self_id: z.int64(),
    data: GroupEssenceMessageChangeEventDataSchema
});

export type GroupEssenceMessageChangeEventPayload = z.infer<
    typeof GroupEssenceMessageChangeEventPayload
>;

/**
 * 群成员增加事件 / Group Member Increase Event
 */
export const GroupMemberIncreaseEventPayload = z.object({
    event_type: z.literal("group_member_increase"),
    time: z.int64(),
    self_id: z.int64(),
    data: GroupMemberIncreaseEventDataSchema
});

export type GroupMemberIncreaseEventPayload = z.infer<
    typeof GroupMemberIncreaseEventPayload
>;

/**
 * 群成员减少事件 / Group Member Decrease Event
 */
export const GroupMemberDecreaseEventPayload = z.object({
    event_type: z.literal("group_member_decrease"),
    time: z.int64(),
    self_id: z.int64(),
    data: GroupMemberDecreaseEventDataSchema
});

export type GroupMemberDecreaseEventPayload = z.infer<
    typeof GroupMemberDecreaseEventPayload
>;

/**
 * 群名称变更事件 / Group Name Change Event
 */
export const GroupNameChangeEventPayload = z.object({
    event_type: z.literal("group_name_change"),
    time: z.int64(),
    self_id: z.int64(),
    data: GroupNameChangeEventDataSchema
});

export type GroupNameChangeEventPayload = z.infer<
    typeof GroupNameChangeEventPayload
>;

/**
 * 群消息表情回应事件 / Group Message Reaction Event
 */
export const GroupMessageReactionEventPayload = z.object({
    event_type: z.literal("group_message_reaction"),
    time: z.int64(),
    self_id: z.int64(),
    data: GroupMessageReactionEventDataSchema
});

export type GroupMessageReactionEventPayload = z.infer<
    typeof GroupMessageReactionEventPayload
>;

/**
 * 群禁言事件 / Group Mute Event
 */
export const GroupMuteEventPayload = z.object({
    event_type: z.literal("group_mute"),
    time: z.int64(),
    self_id: z.int64(),
    data: GroupMuteEventDataSchema
});

export type GroupMuteEventPayload = z.infer<typeof GroupMuteEventPayload>;

/**
 * 群全体禁言事件 / Group Whole Mute Event
 */
export const GroupWholeMuteEventPayload = z.object({
    event_type: z.literal("group_whole_mute"),
    time: z.int64(),
    self_id: z.int64(),
    data: GroupWholeMuteEventDataSchema
});

export type GroupWholeMuteEventPayload = z.infer<
    typeof GroupWholeMuteEventPayload
>;

/**
 * 群戳一戳事件 / Group Nudge Event
 */
export const GroupNudgeEventPayload = z.object({
    event_type: z.literal("group_nudge"),
    time: z.int64(),
    self_id: z.int64(),
    data: GroupNudgeEventDataSchema
});

export type GroupNudgeEventPayload = z.infer<typeof GroupNudgeEventPayload>;

/**
 * 群文件上传事件 / Group File Upload Event
 */
export const GroupFileUploadEventPayload = z.object({
    event_type: z.literal("group_file_upload"),
    time: z.int64(),
    self_id: z.int64(),
    data: GroupFileUploadEventDataSchema
});

export type GroupFileUploadEventPayload = z.infer<
    typeof GroupFileUploadEventPayload
>;

// 事件联合类型 / Event Union Type

/**
 * Milky 事件 Payload / Milky Event Payload (Union Type)
 */
export const MilkyEventPayloadSchema = z.discriminatedUnion("event_type", [
    BotOfflineEventPayload,
    MessageReceiveEventPayload,
    MessageRecallEventPayload,
    FriendRequestEventPayload,
    GroupJoinRequestEventPayload,
    GroupInvitedJoinRequestEventPayload,
    GroupInvitationEventPayload,
    FriendNudgeEventPayload,
    FriendFileUploadEventPayload,
    GroupAdminChangeEventPayload,
    GroupEssenceMessageChangeEventPayload,
    GroupMemberIncreaseEventPayload,
    GroupMemberDecreaseEventPayload,
    GroupNameChangeEventPayload,
    GroupMessageReactionEventPayload,
    GroupMuteEventPayload,
    GroupWholeMuteEventPayload,
    GroupNudgeEventPayload,
    GroupFileUploadEventPayload
]);

export type MilkyEventPayload = z.infer<typeof MilkyEventPayloadSchema>;
