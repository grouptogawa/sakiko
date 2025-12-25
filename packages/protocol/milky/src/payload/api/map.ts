import type { APIMap } from "@togawa-dev/utils/endpoint";

import * as file from "./file";
import * as friend from "./friend";
import * as group from "./group";
import * as message from "./message";
import * as system from "./system";

/**
 * Milky API action -> (req/res) zod schema mapping.
 *
 * Notes:
 * - Action keys are kept in `camelCase` to match the exported schema pairs.
 * - Each entry must contain both `req` and `res` to satisfy `APIMap`.
 */
export const milkyAPIMap = {
    // file
    upload_private_file: {
        req: file.uploadPrivateFileReq,
        res: file.uploadPrivateFileRes
    },
    upload_group_file: {
        req: file.uploadGroupFileReq,
        res: file.uploadGroupFileRes
    },
    get_private_file_download_url: {
        req: file.getPrivateFileDownloadUrlReq,
        res: file.getPrivateFileDownloadUrlRes
    },
    get_group_file_download_url: {
        req: file.getGroupFileDownloadUrlReq,
        res: file.getGroupFileDownloadUrlRes
    },
    get_group_files: { req: file.getGroupFilesReq, res: file.getGroupFilesRes },
    move_group_file: { req: file.moveGroupFileReq, res: file.moveGroupFileRes },
    rename_group_file: {
        req: file.renameGroupFileReq,
        res: file.renameGroupFileRes
    },
    delete_group_file: {
        req: file.deleteGroupFileReq,
        res: file.deleteGroupFileRes
    },
    create_group_folder: {
        req: file.createGroupFolderReq,
        res: file.createGroupFolderRes
    },
    rename_group_folder: {
        req: file.renameGroupFolderReq,
        res: file.renameGroupFolderRes
    },
    delete_group_folder: {
        req: file.deleteGroupFolderReq,
        res: file.deleteGroupFolderRes
    },

    // friend
    send_friend_nudge: {
        req: friend.sendFriendNudgeReq,
        res: friend.sendFriendNudgeRes
    },
    send_profile_like: {
        req: friend.sendProfileLikeReq,
        res: friend.sendProfileLikeRes
    },
    get_friend_requests: {
        req: friend.getFriendRequestsReq,
        res: friend.getFriendRequestsRes
    },
    accept_friend_request: {
        req: friend.acceptFriendRequestReq,
        res: friend.acceptFriendRequestRes
    },
    reject_friend_request: {
        req: friend.rejectFriendRequestReq,
        res: friend.rejectFriendRequestRes
    },

    // group
    set_group_name: { req: group.setGroupNameReq, res: group.setGroupNameRes },
    set_group_avatar: {
        req: group.setGroupAvatarReq,
        res: group.setGroupAvatarRes
    },
    set_group_member_card: {
        req: group.setGroupMemberCardReq,
        res: group.setGroupMemberCardRes
    },
    set_group_member_special_title: {
        req: group.setGroupMemberSpecialTitleReq,
        res: group.setGroupMemberSpecialTitleRes
    },
    set_group_member_admin: {
        req: group.setGroupMemberAdminReq,
        res: group.setGroupMemberAdminRes
    },
    set_group_member_mute: {
        req: group.setGroupMemberMuteReq,
        res: group.setGroupMemberMuteRes
    },
    set_group_whole_mute: {
        req: group.setGroupWholeMuteReq,
        res: group.setGroupWholeMuteRes
    },
    kick_group_member: {
        req: group.kickGroupMemberReq,
        res: group.kickGroupMemberRes
    },
    get_group_announcements: {
        req: group.getGroupAnnouncementsReq,
        res: group.getGroupAnnouncementsRes
    },
    send_group_announcement: {
        req: group.sendGroupAnnouncementReq,
        res: group.sendGroupAnnouncementRes
    },
    delete_group_announcement: {
        req: group.deleteGroupAnnouncementReq,
        res: group.deleteGroupAnnouncementRes
    },
    get_group_essence_messages: {
        req: group.getGroupEssenceMessagesReq,
        res: group.getGroupEssenceMessagesRes
    },
    set_group_essence_message: {
        req: group.setGroupEssenceMessageReq,
        res: group.setGroupEssenceMessageRes
    },
    quit_group: { req: group.quitGroupReq, res: group.quitGroupRes },
    send_group_message_reaction: {
        req: group.sendGroupMessageReactionReq,
        res: group.sendGroupMessageReactionRes
    },
    send_group_nudge: {
        req: group.sendGroupNudgeReq,
        res: group.sendGroupNudgeRes
    },
    get_group_notifications: {
        req: group.getGroupNotificationsReq,
        res: group.getGroupNotificationsRes
    },
    accept_group_request: {
        req: group.acceptGroupRequestReq,
        res: group.acceptGroupRequestRes
    },
    reject_group_request: {
        req: group.rejectGroupRequestReq,
        res: group.rejectGroupRequestRes
    },
    accept_group_invitation: {
        req: group.acceptGroupInvitationReq,
        res: group.acceptGroupInvitationRes
    },
    reject_group_invitation: {
        req: group.rejectGroupInvitationReq,
        res: group.rejectGroupInvitationRes
    },

    // message
    send_private_message: {
        req: message.sendPrivateMessageReq,
        res: message.sendPrivateMessageRes
    },
    send_group_message: {
        req: message.sendGroupMessageReq,
        res: message.sendGroupMessageRes
    },
    recall_private_message: {
        req: message.recallPrivateMessageReq,
        res: message.recallPrivateMessageRes
    },
    recall_group_message: {
        req: message.recallGroupMessageReq,
        res: message.recallGroupMessageRes
    },
    get_message: { req: message.getMessageReq, res: message.getMessageRes },
    get_history_messages: {
        req: message.getHistoryMessagesReq,
        res: message.getHistoryMessagesRes
    },
    get_resource_temp_url: {
        req: message.getResourceTempUrlReq,
        res: message.getResourceTempUrlRes
    },
    get_forwarded_messages: {
        req: message.getForwardedMessagesReq,
        res: message.getForwardedMessagesRes
    },
    mark_message_as_read: {
        req: message.markMessageAsReadReq,
        res: message.markMessageAsReadRes
    },

    // system
    get_login_info: {
        req: system.getLoginInfoReq,
        res: system.getLoginInfoRes
    },
    get_impl_info: { req: system.getImplInfoReq, res: system.getImplInfoRes },
    get_user_profile: {
        req: system.getUserProfileReq,
        res: system.getUserProfileRes
    },
    get_friend_list: {
        req: system.getFriendListReq,
        res: system.getFriendListRes
    },
    get_friend_info: {
        req: system.getFriendInfoReq,
        res: system.getFriendInfoRes
    },
    get_group_list: {
        req: system.getGroupListReq,
        res: system.getGroupListRes
    },
    get_group_info: {
        req: system.getGroupInfoReq,
        res: system.getGroupInfoRes
    },
    get_group_member_list: {
        req: system.getGroupMemberListReq,
        res: system.getGroupMemberListRes
    },
    get_group_member_info: {
        req: system.getGroupMemberInfoReq,
        res: system.getGroupMemberInfoRes
    },
    get_cookies: { req: system.getCookiesReq, res: system.getCookiesRes },
    get_csrf_token: { req: system.getCsrfTokenReq, res: system.getCsrfTokenRes }
} satisfies APIMap;
