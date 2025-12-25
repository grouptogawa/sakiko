import {
    type APIAction,
    type APIReq,
    type APIRes,
    validateRequest,
    validateResponse
} from "@togawa-dev/utils/endpoint";

import type { Milky } from ".";
import type { ProtocolBot } from "@togawa-dev/sakiko";
import { milkyAPIMap } from "@togawa-dev/protocol-milky/payload/api";
import { icmsg, ogmsg } from "@togawa-dev/protocol-milky/message";
import {
    isHasContactId,
    isHasScene,
    isHasSceneId,
    type HasContactId,
    type HasScene,
    type HasSceneId
} from "@togawa-dev/sakiko/mixin/event";
import { UniMessage } from "@togawa-dev/utils/unimsg";

type MilkyAPIMap = typeof milkyAPIMap;

export class MilkyBot implements ProtocolBot<MilkyAPIMap> {
    private readonly _logger?;
    private _nickname: string | undefined = undefined;

    constructor(
        private readonly _adapter: Milky,
        private readonly _options: {
            _selfId: string;
            _apiBaseUrl: URL;
            _accessToken?: string;
        }
    ) {
        this._logger = _adapter.logger;
    }

    async init() {
        this._nickname = (await this.getLoginInfo())?.nickname;
    }

    get nickname(): string {
        if (this._nickname) return this._nickname; // 当昵称已设置时返回昵称
        // 一般来讲这个信息是在初始化流程就获取完成的，这里作为一种 fallback
        return "";
    }

    get selfId(): string {
        return this._options._selfId;
    }

    get platform(): string {
        return this._adapter.platformName;
    }

    get protocol(): string {
        return this._adapter.protocolName;
    }

    async call<Endpoint extends APIAction<MilkyAPIMap>>(
        endpoint: Endpoint,
        data?: APIReq<MilkyAPIMap, Endpoint>
    ): Promise<APIRes<MilkyAPIMap, Endpoint>> {
        // 验证请求数据是否符合 schema
        // 如果不符合则会在这里抛出异常
        try {
            data = validateRequest(milkyAPIMap, endpoint as any, data || {});
        } catch (error) {
            this._logger?.error(
                `API request validation failed for endpoint ${endpoint}: ${
                    (error as Error).message
                }`
            );
            throw error;
        }

        // 向 API 服务发送请求
        const result = await fetch(
            new URL(endpoint, this._options._apiBaseUrl),
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: this._options._accessToken
                        ? `Bearer ${this._options._accessToken}`
                        : ""
                },
                body: JSON.stringify(data)
            }
        );

        // 处理响应
        if (!result.ok) {
            const e = new Error(
                `API request to endpoint ${endpoint} failed with status ${result.status}`
            );
            this._logger?.error(e.message);
            throw e;
        }

        // 解析响应数据
        const resp = (await result.json()) as {
            status: string;
            retcode: number;
            data: any;
        };

        // 对响应数据进行检查和断言
        if (!(resp.status && resp.retcode && resp.data)) {
            const e = new Error(
                `API response from endpoint ${endpoint} is malformed`
            );
            this._logger?.error(e.message);
            throw e;
        }

        // 验证响应数据是否符合 schema 并返回
        try {
            return validateResponse(
                milkyAPIMap,
                endpoint as any,
                resp.data
            ) as APIRes<MilkyAPIMap, Endpoint>;
        } catch (error) {
            this._logger?.error(
                `API response validation failed for endpoint ${endpoint}: ${
                    (error as Error).message
                }`
            );
            // 即使验证失败也返回原始数据，避免因为 API 返回值变更导致功能完全不可用
            return resp.data as APIRes<MilkyAPIMap, Endpoint>;
        }
    }

    /** 获取登录信息 */
    async getLoginInfo() {
        return this.call("get_login_info", {});
    }

    /** 获取协议端信息 */
    async getImplInfo() {
        return this.call("get_impl_info", {});
    }

    /** 获取用户个人信息 */
    async getUserProfile(userId: string | number | bigint) {
        return this.call("get_user_profile", { user_id: Number(userId) });
    }

    /** 获取好友列表 */
    async getFriendList(noCache?: boolean) {
        return this.call("get_friend_list", { no_cache: noCache });
    }

    /** 获取好友信息 */
    async getFriendInfo(userId: string | number | bigint, noCache?: boolean) {
        return this.call("get_friend_info", {
            user_id: Number(userId),
            no_cache: noCache
        });
    }

    /** 发送好友戳一戳 */
    async sendFriendNudge(userId: string | number | bigint, isSelf?: boolean) {
        return this.call("send_friend_nudge", {
            user_id: Number(userId),
            is_self: isSelf
        });
    }

    /** 发送名片点赞 */
    async sendProfileLike(userId: string | number | bigint, count?: number) {
        return this.call("send_profile_like", {
            user_id: Number(userId),
            count: count ?? 1
        });
    }

    /** 获取好友请求列表 */
    async getFriendRequests(options?: {
        limit?: number;
        isFiltered?: boolean;
    }) {
        return this.call("get_friend_requests", {
            limit: options?.limit ?? 20,
            is_filtered: options?.isFiltered ?? false
        });
    }

    /** 同意好友请求 */
    async acceptFriendRequest(initiatorUid: string, isFiltered?: boolean) {
        return this.call("accept_friend_request", {
            initiator_uid: initiatorUid,
            is_filtered: isFiltered
        });
    }

    /** 拒绝好友请求 */
    async rejectFriendRequest(
        initiatorUid: string,
        options?: { isFiltered?: boolean; reason?: string }
    ) {
        return this.call("reject_friend_request", {
            initiator_uid: initiatorUid,
            is_filtered: options?.isFiltered,
            reason: options?.reason
        });
    }

    /** 获取群列表 */
    async getGroupList(noCache?: boolean) {
        return this.call("get_group_list", { no_cache: noCache });
    }

    /** 获取群信息 */
    async getGroupInfo(groupId: string | number | bigint, noCache?: boolean) {
        return this.call("get_group_info", {
            group_id: Number(groupId),
            no_cache: noCache
        });
    }

    /** 获取群成员列表 */
    async getGroupMemberList(
        groupId: string | number | bigint,
        noCache?: boolean
    ) {
        return this.call("get_group_member_list", {
            group_id: Number(groupId),
            no_cache: noCache
        });
    }

    /** 获取群成员信息 */
    async getGroupMemberInfo(
        groupId: string | number | bigint,
        userId: string | number | bigint,
        noCache?: boolean
    ) {
        return this.call("get_group_member_info", {
            group_id: Number(groupId),
            user_id: Number(userId),
            no_cache: noCache
        });
    }

    /** 设置群名称 */
    async setGroupName(
        groupId: string | number | bigint,
        newGroupName: string
    ) {
        return this.call("set_group_name", {
            group_id: Number(groupId),
            new_group_name: newGroupName
        });
    }

    /** 设置群头像 */
    async setGroupAvatar(groupId: string | number | bigint, imageUri: string) {
        return this.call("set_group_avatar", {
            group_id: Number(groupId),
            image_uri: imageUri
        });
    }

    /** 设置群名片 */
    async setGroupMemberCard(
        groupId: string | number | bigint,
        userId: string | number | bigint,
        card: string
    ) {
        return this.call("set_group_member_card", {
            group_id: Number(groupId),
            user_id: Number(userId),
            card
        });
    }

    /** 设置群成员专属头衔 */
    async setGroupMemberSpecialTitle(
        groupId: string | number | bigint,
        userId: string | number | bigint,
        specialTitle: string
    ) {
        return this.call("set_group_member_special_title", {
            group_id: Number(groupId),
            user_id: Number(userId),
            special_title: specialTitle
        });
    }

    /** 设置群管理员 */
    async setGroupMemberAdmin(
        groupId: string | number | bigint,
        userId: string | number | bigint,
        isSet?: boolean
    ) {
        return this.call("set_group_member_admin", {
            group_id: Number(groupId),
            user_id: Number(userId),
            is_set: isSet
        });
    }

    /** 设置群成员禁言 */
    async setGroupMemberMute(
        groupId: string | number | bigint,
        userId: string | number | bigint,
        duration?: number
    ) {
        return this.call("set_group_member_mute", {
            group_id: Number(groupId),
            user_id: Number(userId),
            duration: duration ?? 0
        });
    }

    /** 设置群全员禁言 */
    async setGroupWholeMute(
        groupId: string | number | bigint,
        isMute?: boolean
    ) {
        return this.call("set_group_whole_mute", {
            group_id: Number(groupId),
            is_mute: isMute
        });
    }

    /** 踢出群成员 */
    async kickGroupMember(
        groupId: string | number | bigint,
        userId: string | number | bigint,
        rejectAddRequest?: boolean
    ) {
        return this.call("kick_group_member", {
            group_id: Number(groupId),
            user_id: Number(userId),
            reject_add_request: rejectAddRequest
        });
    }

    /** 获取群公告列表 */
    async getGroupAnnouncements(groupId: string | number | bigint) {
        return this.call("get_group_announcements", {
            group_id: Number(groupId)
        });
    }

    /** 发送群公告 */
    async sendGroupAnnouncement(
        groupId: string | number | bigint,
        content: string,
        imageUri?: string
    ) {
        return this.call("send_group_announcement", {
            group_id: Number(groupId),
            content,
            image_uri: imageUri
        });
    }

    /** 删除群公告 */
    async deleteGroupAnnouncement(
        groupId: string | number | bigint,
        announcementId: string
    ) {
        return this.call("delete_group_announcement", {
            group_id: Number(groupId),
            announcement_id: announcementId
        });
    }

    /** 获取群精华消息列表 */
    async getGroupEssenceMessages(
        groupId: string | number | bigint,
        pageIndex: number,
        pageSize: number
    ) {
        const result = await this.call("get_group_essence_messages", {
            group_id: Number(groupId),
            page_index: pageIndex,
            page_size: pageSize
        });

        const typedMessages = result.messages.map((msg) => ({
            ...msg,
            segments: new icmsg.MilkyIncomingMessage(...msg.segments)
        }));

        return {
            ...result,
            messages: typedMessages
        };
    }

    /** 设置群精华消息 */
    async setGroupEssenceMessage(
        groupId: string | number | bigint,
        messageSeq: string | number | bigint,
        isSet?: boolean
    ) {
        return this.call("set_group_essence_message", {
            group_id: Number(groupId),
            message_seq: Number(messageSeq),
            is_set: isSet
        });
    }

    /** 退出群 */
    async quitGroup(groupId: string | number | bigint) {
        return this.call("quit_group", { group_id: Number(groupId) });
    }

    /** 发送群消息表情回应 */
    async sendGroupMessageReaction(
        groupId: string | number | bigint,
        messageSeq: string | number | bigint,
        reaction: string,
        isAdd?: boolean
    ) {
        return this.call("send_group_message_reaction", {
            group_id: Number(groupId),
            message_seq: Number(messageSeq),
            reaction,
            is_add: isAdd
        });
    }

    /** 发送群戳一戳 */
    async sendGroupNudge(
        groupId: string | number | bigint,
        userId: string | number | bigint
    ) {
        return this.call("send_group_nudge", {
            group_id: Number(groupId),
            user_id: Number(userId)
        });
    }

    /** 获取群通知列表 */
    async getGroupNotifications(options?: {
        startNotificationSeq?: string | number | bigint;
        isFiltered?: boolean;
        limit?: number;
    }) {
        return this.call("get_group_notifications", {
            start_notification_seq: options?.startNotificationSeq
                ? Number(options.startNotificationSeq)
                : undefined,
            is_filtered: options?.isFiltered,
            limit: options?.limit
        });
    }

    /** 同意入群/邀请他人入群请求 */
    async acceptGroupRequest(
        notificationSeq: string | number | bigint,
        notificationType: "join_request" | "invited_join_request",
        groupId: string | number | bigint,
        isFiltered?: boolean
    ) {
        return this.call("accept_group_request", {
            notification_seq: Number(notificationSeq),
            notification_type: notificationType,
            group_id: Number(groupId),
            is_filtered: isFiltered
        });
    }

    /** 拒绝入群/邀请他人入群请求 */
    async rejectGroupRequest(
        notificationSeq: string | number | bigint,
        notificationType: "join_request" | "invited_join_request",
        groupId: string | number | bigint,
        options?: { isFiltered?: boolean; reason?: string }
    ) {
        return this.call("reject_group_request", {
            notification_seq: Number(notificationSeq),
            notification_type: notificationType,
            group_id: Number(groupId),
            is_filtered: options?.isFiltered,
            reason: options?.reason
        });
    }

    /** 同意他人邀请自身入群 */
    async acceptGroupInvitation(
        groupId: string | number | bigint,
        invitationSeq: string | number | bigint
    ) {
        return this.call("accept_group_invitation", {
            group_id: Number(groupId),
            invitation_seq: Number(invitationSeq)
        });
    }

    /** 拒绝他人邀请自身入群 */
    async rejectGroupInvitation(
        groupId: string | number | bigint,
        invitationSeq: string | number | bigint
    ) {
        return this.call("reject_group_invitation", {
            group_id: Number(groupId),
            invitation_seq: Number(invitationSeq)
        });
    }

    /** 获取 Cookies */
    async getCookies(domain: string) {
        return this.call("get_cookies", { domain });
    }

    /** 获取 CSRF Token */
    async getCsrfToken() {
        return this.call("get_csrf_token", {});
    }

    /** 上传私聊文件 */
    async uploadPrivateFile(
        userId: string | number | bigint,
        fileUri: string,
        fileName: string
    ) {
        return this.call("upload_private_file", {
            user_id: Number(userId),
            file_uri: fileUri,
            file_name: fileName
        });
    }

    /** 上传群文件 */
    async uploadGroupFile(
        groupId: string | number | bigint,
        fileUri: string,
        fileName: string,
        parentFolderId?: string
    ) {
        return this.call("upload_group_file", {
            group_id: Number(groupId),
            parent_folder_id: parentFolderId ?? "/",
            file_uri: fileUri,
            file_name: fileName
        });
    }

    /** 获取私聊文件下载链接 */
    async getPrivateFileDownloadUrl(
        userId: string | number | bigint,
        fileId: string,
        fileHash: string
    ) {
        return this.call("get_private_file_download_url", {
            user_id: Number(userId),
            file_id: fileId,
            file_hash: fileHash
        });
    }

    /** 获取群文件下载链接 */
    async getGroupFileDownloadUrl(
        groupId: string | number | bigint,
        fileId: string
    ) {
        return this.call("get_group_file_download_url", {
            group_id: Number(groupId),
            file_id: fileId
        });
    }

    /** 获取群文件列表 */
    async getGroupFiles(
        groupId: string | number | bigint,
        parentFolderId?: string
    ) {
        return this.call("get_group_files", {
            group_id: Number(groupId),
            parent_folder_id: parentFolderId ?? "/"
        });
    }

    /** 移动群文件 */
    async moveGroupFile(
        groupId: string | number | bigint,
        fileId: string,
        options?: { parentFolderId?: string; targetFolderId?: string }
    ) {
        return this.call("move_group_file", {
            group_id: Number(groupId),
            file_id: fileId,
            parent_folder_id: options?.parentFolderId ?? "/",
            target_folder_id: options?.targetFolderId ?? "/"
        });
    }

    /** 重命名群文件 */
    async renameGroupFile(
        groupId: string | number | bigint,
        fileId: string,
        newFileName: string,
        parentFolderId?: string
    ) {
        return this.call("rename_group_file", {
            group_id: Number(groupId),
            file_id: fileId,
            parent_folder_id: parentFolderId ?? "/",
            new_file_name: newFileName
        });
    }

    /** 删除群文件 */
    async deleteGroupFile(groupId: string | number | bigint, fileId: string) {
        return this.call("delete_group_file", {
            group_id: Number(groupId),
            file_id: fileId
        });
    }

    /** 创建群文件夹 */
    async createGroupFolder(
        groupId: string | number | bigint,
        folderName: string
    ) {
        return this.call("create_group_folder", {
            group_id: Number(groupId),
            folder_name: folderName
        });
    }

    /** 重命名群文件夹 */
    async renameGroupFolder(
        groupId: string | number | bigint,
        folderId: string,
        newFolderName: string
    ) {
        return this.call("rename_group_folder", {
            group_id: Number(groupId),
            folder_id: folderId,
            new_folder_name: newFolderName
        });
    }

    /** 删除群文件夹 */
    async deleteGroupFolder(
        groupId: string | number | bigint,
        folderId: string
    ) {
        return this.call("delete_group_folder", {
            group_id: Number(groupId),
            folder_id: folderId
        });
    }

    /** 发送私聊消息 */
    async sendPrivateMessage(
        userId: string | number | bigint,
        message: ogmsg.MilkyOutgoingMessage
    ) {
        return this.call("send_private_message", {
            user_id: Number(userId),
            message: [...message] // 解包数据
        });
    }

    /** 发送群消息 */
    async sendGroupMessage(
        groupId: string | number | bigint,
        message: ogmsg.MilkyOutgoingMessage
    ) {
        return this.call("send_group_message", {
            group_id: Number(groupId),
            message: [...message] // 解包数据
        });
    }

    /** 撤回私聊消息 */
    async recallPrivateMessage(
        userId: string | number | bigint,
        messageSeq: string | number | bigint
    ) {
        return this.call("recall_private_message", {
            user_id: Number(userId),
            message_seq: Number(messageSeq)
        });
    }

    /** 撤回群消息 */
    async recallGroupMessage(
        groupId: string | number | bigint,
        messageSeq: string | number | bigint
    ) {
        return this.call("recall_group_message", {
            group_id: Number(groupId),
            message_seq: Number(messageSeq)
        });
    }

    /** 获取消息详情 */
    async getMessage(
        messageScene: "friend" | "group" | "temp",
        peerId: string | number | bigint,
        messageSeq: string | number | bigint
    ) {
        const result = await this.call("get_message", {
            message_scene: messageScene,
            peer_id: Number(peerId),
            message_seq: Number(messageSeq)
        });

        // 转换结果中的消息段列表为 MilkyIncomingMessage 实例
        const typedSegments = new icmsg.MilkyIncomingMessage(
            ...result.message.segments
        );

        return {
            ...result,
            message: {
                ...result.message,
                segments: typedSegments
            }
        };
    }

    /** 获取历史消息 */
    async getHistoryMessages(
        messageScene: "friend" | "group" | "temp",
        peerId: string | number | bigint,
        options?: {
            startSeq?: string | number | bigint;
            limit?: number;
        }
    ) {
        const result = await this.call("get_history_messages", {
            message_scene: messageScene,
            peer_id: Number(peerId),
            start_message_seq: options?.startSeq
                ? Number(options.startSeq)
                : undefined,
            limit:
                options?.limit === undefined ? 20 : Math.min(options.limit, 30)
        });

        const typedMessages = result.messages.map((msg) => ({
            ...msg,
            segments: new icmsg.MilkyIncomingMessage(...msg.segments)
        }));

        return {
            ...result,
            messages: typedMessages
        };
    }

    /** 获取资源临时链接 */
    async getResourceTempUrl(resourceId: string) {
        return this.call("get_resource_temp_url", { resource_id: resourceId });
    }

    /** 获取合并消息内容 */
    async getForwardedMessages(forwardId: string) {
        const result = await this.call("get_forwarded_messages", {
            forward_id: forwardId
        });

        const typedMessages = result.messages.map((msg) => ({
            ...msg,
            segments: new icmsg.MilkyIncomingMessage(...msg.segments)
        }));

        return {
            messages: typedMessages
        };
    }

    /** 标记消息为已读 */
    async markMessageAsRead(
        messageScene: "friend" | "group" | "temp",
        peerId: string | number | bigint,
        messageSeq: string | number | bigint
    ) {
        return this.call("mark_message_as_read", {
            message_scene: messageScene,
            peer_id: Number(peerId),
            message_seq: Number(messageSeq)
        });
    }

    async send(
        target: HasContactId & HasScene & HasSceneId,
        msg: UniMessage | ogmsg.MilkyOutgoingMessage
    ) {
        // 对 target 进行类型判断
        if (
            !(
                isHasContactId(target) &&
                isHasScene(target) &&
                isHasSceneId(target)
            )
        ) {
            // 抛出类型错误
            throw new Error("wrong target type for MilkyBot.send");
        }

        // 对 msg 的类型进行判断
        let milkyMsg: ogmsg.MilkyOutgoingMessage;
        if (msg instanceof UniMessage) {
            // 将 UniMessage 转换为 MilkyOutgoingMessage
            milkyMsg = ogmsg.MilkyOutgoingMessage.fromUniMessage(msg);
        } else if (msg instanceof ogmsg.MilkyOutgoingMessage) {
            milkyMsg = msg;
        } else {
            // 抛出类型错误
            throw new Error("wrong message type for MilkyBot.send");
        }

        // 根据场景调用不同的发送方法
        if (target.isPublic()) {
            const res = await this.sendGroupMessage(
                target.getSceneId(),
                milkyMsg
            );
            return {
                messageId: res.message_seq.toString(),
                time: Number(res.time)
            };
        } else if (target.isPrivate()) {
            const res = await this.sendPrivateMessage(
                target.getContactId(),
                milkyMsg
            );
            return {
                messageId: res.message_seq.toString(),
                time: Number(res.time)
            };
        }

        // 下面的代码理论上不应该被执行到
        throw new Error(
            "unexpected code reached in MilkyBot.send, please report a bug"
        );
    }
}
