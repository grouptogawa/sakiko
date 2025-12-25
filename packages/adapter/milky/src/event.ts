import * as p from "@togawa-dev/protocol-milky/payload/event";

import type {
    HasContactId,
    HasMessage,
    HasOperatorId,
    HasReceiverId,
    HasScene,
    HasSceneId,
    HasUniMessage,
    Plainable,
    Quoteable
} from "@togawa-dev/sakiko/mixin/event";

import type { MilkyBot } from "./bot";
import { UmiriEvent } from "@togawa-dev/umiri";
import type { UniMessage } from "@togawa-dev/utils/unimsg";
import { icmsg } from "@togawa-dev/protocol-milky/message";

export class MilkyEvent<Payload extends p.MilkyEventPayload> extends UmiriEvent<
    Payload,
    MilkyBot
> {
    eventType: string;
    time: number;

    constructor(payload: Payload, bot: MilkyBot) {
        super(payload, bot);
        this.eventType = payload.event_type;
        this.time = payload.time;
    }

    get data(): Payload["data"] {
        return this.payload.data;
    }
}

/** 机器人账号离线事件
 *
 * Bot Offline Event
 */
export class BotOffline extends MilkyEvent<p.BotOfflineEventPayload> {}

/** 消息接收事件
 *
 * Message Receive Event
 */
export class MessageReceive
    extends MilkyEvent<p.MessageReceiveEventPayload>
    implements
        Plainable,
        HasContactId,
        Quoteable,
        HasUniMessage,
        HasMessage<icmsg.MilkyIncomingMessage>,
        HasScene,
        HasSceneId
{
    // 适配器内部使用的消息实例
    private _instancedMessage?: icmsg.MilkyIncomingMessage;

    getPlaintext(): string {
        return this.getMessage().plain();
    }

    getContactId(): string {
        return this.data.sender_id.toString();
    }

    getMessageId(): string {
        return this.data.message_seq.toString();
    }

    getMessageSeq(): number {
        return this.data.message_seq;
    }

    getUniMessage(): UniMessage {
        return this.getMessage().toUniMessage();
    }

    getMessage(): icmsg.MilkyIncomingMessage {
        // 懒实例化消息对象
        if (!this._instancedMessage) {
            this._instancedMessage = new icmsg.MilkyIncomingMessage(
                ...this.data.segments
            );
        }
        return this._instancedMessage;
    }

    isPrivate(): boolean {
        return (
            this.data.message_scene === "friend" ||
            this.data.message_scene === "temp"
        );
    }

    isPublic(): boolean {
        return this.data.message_scene === "group";
    }

    getSceneId(): string {
        return this.data.peer_id.toString();
    }

    getFriendInfo() {
        if (this.data.message_scene === "friend") {
            return this.data.friend;
        }
        return undefined;
    }

    getGroupInfo() {
        if (
            this.data.message_scene === "group" ||
            this.data.message_scene === "temp"
        ) {
            return this.data.group;
        }
        return undefined;
    }

    getGroupMemberInfo() {
        if (this.data.message_scene === "group") {
            return this.data.group_member;
        }
        return undefined;
    }
}

/** 消息撤回事件
 *
 * Message Recall Event
 */
export class MessageRecall
    extends MilkyEvent<p.MessageRecallEventPayload>
    implements HasContactId, HasScene, HasSceneId, HasOperatorId
{
    getContactId(): string {
        return this.data.sender_id.toString();
    }

    isPrivate(): boolean {
        return this.data.message_scene === "friend";
    }

    isPublic(): boolean {
        return this.data.message_scene === "group";
    }

    getSceneId(): string {
        return this.data.peer_id.toString();
    }

    getSuffix(): string {
        return this.data.display_suffix;
    }

    getOperatorId(): string {
        return this.data.operator_id.toString();
    }

    getMessageSeq(): number {
        return this.data.message_seq;
    }

    getSenderId(): string {
        return this.data.sender_id.toString();
    }
}

/** 好友请求事件
 *
 * Friend Request Event
 */
export class FriendRequest extends MilkyEvent<p.FriendRequestEventPayload> {
    getInitiatorId(): string {
        return this.data.initiator_id.toString();
    }

    getInitiatorUid(): string {
        return this.data.initiator_uid;
    }

    getComment(): string {
        return this.data.comment;
    }

    getVia(): string {
        return this.data.via;
    }

    async accept() {
        return this.bot.acceptFriendRequest(this.getInitiatorId());
    }

    async reject() {
        return this.bot.rejectFriendRequest(this.getInitiatorId());
    }
}

/** 入群请求事件
 *
 * Group Join Request Event
 */
export class GroupJoinRequest extends MilkyEvent<p.GroupJoinRequestEventPayload> {
    getGroupId(): string {
        return this.data.group_id.toString();
    }

    getInitiatorId(): string {
        return this.data.initiator_id.toString();
    }

    getComment(): string {
        return this.data.comment;
    }

    isFiltered(): boolean {
        return this.data.is_filtered;
    }

    getNoticifactionSeq(): number {
        return this.data.notification_seq;
    }

    async accept() {
        return this.bot.acceptGroupRequest(
            this.getNoticifactionSeq(),
            "join_request",
            this.getGroupId(),
            this.isFiltered()
        );
    }

    async reject(reason?: string) {
        return this.bot.rejectGroupRequest(
            this.getNoticifactionSeq(),
            "join_request",
            this.getGroupId(),
            {
                isFiltered: this.isFiltered(),
                reason: reason || ""
            }
        );
    }
}

/** 群成员邀请他人入群请求事件
 *
 * Group Invited Join Request Event
 */
export class GroupInvitedJoinRequest
    extends MilkyEvent<p.GroupInvitedJoinRequestEventPayload>
    implements HasSceneId, HasScene
{
    getSceneId(): string {
        return this.data.group_id.toString();
    }

    isPrivate(): boolean {
        return false;
    }

    isPublic(): boolean {
        return true;
    }

    getInitiatorId(): string {
        return this.data.initiator_id.toString();
    }

    getTargetId(): string {
        return this.data.target_user_id.toString();
    }

    async accept() {
        return this.bot.acceptGroupRequest(
            this.data.notification_seq,
            "invited_join_request",
            this.getSceneId(),
            false
        );
    }

    async reject(reason?: string) {
        return this.bot.rejectGroupRequest(
            this.data.notification_seq,
            "invited_join_request",
            this.getSceneId(),
            {
                isFiltered: false,
                reason: reason || ""
            }
        );
    }
}

/** 他人邀请自身入群事件
 *
 * Group Invitation Event
 */
export class GroupInvitation extends MilkyEvent<p.GroupInvitationEventPayload> {
    getGroupId(): string {
        return this.data.group_id.toString();
    }

    getInitiatorId(): string {
        return this.data.initiator_id.toString();
    }

    getInvitationSeq(): number {
        return this.data.invitation_seq;
    }

    async accept() {
        return this.bot.acceptGroupInvitation(
            this.getGroupId(),
            this.getInvitationSeq()
        );
    }

    async reject() {
        return this.bot.rejectGroupInvitation(
            this.getGroupId(),
            this.getInvitationSeq()
        );
    }
}

/** 好友戳一戳事件
 *
 * Friend Nudge Event
 */
export class FriendNudge
    extends MilkyEvent<p.FriendNudgeEventPayload>
    implements HasOperatorId
{
    getOperatorId(): string {
        return this.data.user_id.toString();
    }

    getUserId(): string {
        return this.data.user_id.toString();
    }

    getAction(): string {
        return this.data.display_action;
    }

    getActionImage(): string {
        return this.data.display_action_img_url;
    }

    getSuffix(): string {
        return this.data.display_suffix;
    }
}

/** 好友文件上传事件
 *
 * Friend File Upload Event
 */
export class FriendFileUpload
    extends MilkyEvent<p.FriendFileUploadEventPayload>
    implements HasOperatorId, HasScene, HasSceneId
{
    getOperatorId(): string {
        return this.data.user_id.toString();
    }

    isPrivate(): boolean {
        return true;
    }

    isPublic(): boolean {
        return false;
    }

    getSceneId(): string {
        return this.data.user_id.toString();
    }

    getUserId(): string {
        return this.data.user_id.toString();
    }

    getFileId(): string {
        return this.data.file_id;
    }

    getFileName(): string {
        return this.data.file_name;
    }

    getFileSize(): number {
        return this.data.file_size;
    }

    getFileHash(): string {
        return this.data.file_hash;
    }

    async save(): Promise<boolean> {
        // TODO: 实现好友文件保存逻辑
        throw "Not implemented";
    }
}

/** 群管理员变更事件
 *
 * Group Admin Change Event
 */
export class GroupAdminChange
    extends MilkyEvent<p.GroupAdminChangeEventPayload>
    implements HasSceneId, HasScene, HasReceiverId
{
    getSceneId(): string {
        return this.data.group_id.toString();
    }

    isPrivate(): boolean {
        return false;
    }

    isPublic(): boolean {
        return true;
    }

    getReceiverId(): string {
        return this.data.user_id.toString();
    }

    isSet(): boolean {
        return this.data.is_set;
    }
}

/** 群精华消息变更事件
 *
 * Group Essence Message Change Event
 */
export class GroupEssenceMessageChange
    extends MilkyEvent<p.GroupEssenceMessageChangeEventPayload>
    implements HasSceneId, HasScene
{
    getMessageSeq(): number {
        return this.data.message_seq;
    }

    getGroupId(): string {
        return this.data.group_id.toString();
    }

    isSet(): boolean {
        return this.data.is_set;
    }

    isPrivate(): boolean {
        return false;
    }

    isPublic(): boolean {
        return true;
    }

    getSceneId(): string {
        return this.data.group_id.toString();
    }
}

/** 群成员增加事件
 *
 * Group Member Increase Event
 */
export class GroupMemberIncrease
    extends MilkyEvent<p.GroupMemberIncreaseEventPayload>
    implements HasSceneId, HasScene, HasReceiverId, HasOperatorId
{
    getSceneId(): string {
        return this.data.group_id.toString();
    }

    isPrivate(): boolean {
        return false;
    }

    isPublic(): boolean {
        return true;
    }

    getReceiverId(): string {
        return this.data.user_id.toString();
    }

    getOperatorId(): string {
        return this.data.operator_id?.toString() || "";
    }

    getInvitorId(): string {
        return this.data.invitor_id?.toString() || "";
    }
}

/** 群成员减少事件
 *
 * Group Member Decrease Event
 */
export class GroupMemberDecrease
    extends MilkyEvent<p.GroupMemberDecreaseEventPayload>
    implements HasSceneId, HasScene, HasReceiverId, HasOperatorId
{
    getSceneId(): string {
        return this.data.group_id.toString();
    }

    isPrivate(): boolean {
        return false;
    }

    isPublic(): boolean {
        return true;
    }

    getReceiverId(): string {
        return this.data.user_id.toString();
    }

    getOperatorId(): string {
        return this.data.operator_id?.toString() || "";
    }
}

/** 群名称变更事件
 *
 * Group Name Change Event
 */
export class GroupNameChange
    extends MilkyEvent<p.GroupNameChangeEventPayload>
    implements HasSceneId, HasScene, HasOperatorId
{
    getSceneId(): string {
        return this.data.group_id.toString();
    }

    isPrivate(): boolean {
        return false;
    }

    isPublic(): boolean {
        return true;
    }

    getOperatorId(): string {
        return this.data.operator_id.toString();
    }

    getNewName(): string {
        return this.data.new_group_name;
    }
}

/** 群消息表情回应事件
 *
 * Group Message Reaction Event
 */
export class GroupMessageReaction
    extends MilkyEvent<p.GroupMessageReactionEventPayload>
    implements HasSceneId, HasScene, HasOperatorId
{
    getSceneId(): string {
        return this.data.group_id.toString();
    }

    isPrivate(): boolean {
        return false;
    }

    isPublic(): boolean {
        return true;
    }

    getOperatorId(): string {
        return this.data.user_id.toString();
    }

    getUserId(): string {
        return this.data.user_id.toString();
    }

    getMessageSeq(): number {
        return this.data.message_seq;
    }

    getFaceId(): string {
        return this.data.face_id;
    }

    isAdd(): boolean {
        return this.data.is_add;
    }
}

/** 群禁言事件
 *
 * Group Mute Event
 */
export class GroupMute
    extends MilkyEvent<p.GroupMuteEventPayload>
    implements HasSceneId, HasScene, HasOperatorId, HasReceiverId
{
    getSceneId(): string {
        return this.data.group_id.toString();
    }

    isPrivate(): boolean {
        return false;
    }

    isPublic(): boolean {
        return true;
    }

    getOperatorId(): string {
        return this.data.operator_id.toString();
    }

    getReceiverId(): string {
        return this.data.user_id.toString();
    }

    getUserId(): string {
        return this.data.user_id.toString();
    }

    getGroupId(): string {
        return this.data.group_id.toString();
    }

    getDurationSeconds(): number {
        return this.data.duration;
    }

    getDurationMilliseconds(): number {
        return this.data.duration * 1000;
    }
}

/** 群全体禁言事件
 *
 * Group Whole Mute Event
 */
export class GroupWholeMute
    extends MilkyEvent<p.GroupWholeMuteEventPayload>
    implements HasSceneId, HasScene, HasOperatorId
{
    getSceneId(): string {
        return this.data.group_id.toString();
    }

    isPrivate(): boolean {
        return false;
    }

    isPublic(): boolean {
        return true;
    }

    getOperatorId(): string {
        return this.data.operator_id.toString();
    }

    getGroupId(): string {
        return this.data.group_id.toString();
    }

    isMute(): boolean {
        return this.data.is_mute;
    }
}

/** 群戳一戳事件
 *
 * Group Nudge Event
 */
export class GroupNudge
    extends MilkyEvent<p.GroupNudgeEventPayload>
    implements HasSceneId, HasScene, HasReceiverId, HasOperatorId
{
    getSceneId(): string {
        return this.data.group_id.toString();
    }

    isPrivate(): boolean {
        return false;
    }

    isPublic(): boolean {
        return true;
    }

    getOperatorId(): string {
        return this.data.sender_id.toString();
    }

    getReceiverId(): string {
        return this.data.receiver_id.toString();
    }

    getGroupId(): string {
        return this.data.group_id.toString();
    }

    getSenderId(): string {
        return this.data.sender_id.toString();
    }

    getAction(): string {
        return this.data.display_action;
    }

    getActionImage(): string {
        return this.data.display_action_img_url;
    }

    getSuffix(): string {
        return this.data.display_suffix;
    }
}

/** 群文件上传事件
 *
 * Group File Upload Event
 */
export class GroupFileUpload
    extends MilkyEvent<p.GroupFileUploadEventPayload>
    implements HasSceneId, HasScene, HasOperatorId
{
    getSceneId(): string {
        return this.data.group_id.toString();
    }

    isPrivate(): boolean {
        return false;
    }

    isPublic(): boolean {
        return true;
    }

    getOperatorId(): string {
        return this.data.user_id.toString();
    }

    getUserId(): string {
        return this.data.user_id.toString();
    }

    getGroupId(): string {
        return this.data.group_id.toString();
    }

    getFileId(): string {
        return this.data.file_id;
    }

    getFileName(): string {
        return this.data.file_name;
    }

    getFileSize(): number {
        return this.data.file_size;
    }

    async save(): Promise<boolean> {
        // TODO: 实现群文件保存逻辑
        throw "Not implemented";
    }
}

/** 根据原始负载创建对应的事件实例
 *
 * Create corresponding event instance based on the original payload
 */
export function createEvent(payload: p.MilkyEventPayload, bot: MilkyBot) {
    // 根据事件类型创建对应的事件实例
    switch (payload.event_type) {
        case "bot_offline":
            return new BotOffline(payload, bot);
        case "message_receive":
            return new MessageReceive(payload, bot);
        case "message_recall":
            return new MessageRecall(payload, bot);
        case "friend_request":
            return new FriendRequest(payload, bot);
        case "group_join_request":
            return new GroupJoinRequest(payload, bot);
        case "group_invited_join_request":
            return new GroupInvitedJoinRequest(payload, bot);
        case "group_invitation":
            return new GroupInvitation(payload, bot);
        case "friend_nudge":
            return new FriendNudge(payload, bot);
        case "friend_file_upload":
            return new FriendFileUpload(payload, bot);
        case "group_admin_change":
            return new GroupAdminChange(payload, bot);
        case "group_essence_message_change":
            return new GroupEssenceMessageChange(payload, bot);
        case "group_member_increase":
            return new GroupMemberIncrease(payload, bot);
        case "group_member_decrease":
            return new GroupMemberDecrease(payload, bot);
        case "group_name_change":
            return new GroupNameChange(payload, bot);
        case "group_message_reaction":
            return new GroupMessageReaction(payload, bot);
        case "group_mute":
            return new GroupMute(payload, bot);
        case "group_whole_mute":
            return new GroupWholeMute(payload, bot);
        case "group_nudge":
            return new GroupNudge(payload, bot);
        case "group_file_upload":
            return new GroupFileUpload(payload, bot);
        default:
            return undefined;
    }
}
