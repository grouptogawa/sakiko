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

export class MilkyEvent<Payload> extends UmiriEvent<Payload, MilkyBot> {
    eventType: string;
    time: bigint;

    constructor(
        payload: { event_type: string; time: bigint; data: Payload },
        bot: MilkyBot
    ) {
        super(payload.data, bot);
        this.eventType = payload.event_type;
        this.time = payload.time;
    }
}

/** 机器人账号离线事件
 *
 * Bot Offline Event
 */
export class BotOffline extends MilkyEvent<p.BotOfflineEventData> {}

/** 消息接收事件
 *
 * Message Receive Event
 */
export class MessageReceive
    extends MilkyEvent<p.MessageReceiveEventData>
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
        return this.payload.sender_id.toString();
    }

    getMessageId(): string {
        return this.payload.message_seq.toString();
    }

    getMessageSeq(): bigint {
        return this.payload.message_seq;
    }

    getUniMessage(): UniMessage {
        return this.getMessage().toUniMessage();
    }

    getMessage(): icmsg.MilkyIncomingMessage {
        // 懒实例化消息对象
        if (!this._instancedMessage) {
            this._instancedMessage = new icmsg.MilkyIncomingMessage(
                ...this.payload.segments
            );
        }
        return this._instancedMessage;
    }

    isPrivate(): boolean {
        return (
            this.payload.message_scene === "friend" ||
            this.payload.message_scene === "temp"
        );
    }

    isPublic(): boolean {
        return this.payload.message_scene === "group";
    }

    getSceneId(): string {
        return this.payload.peer_id.toString();
    }

    getFriendInfo() {
        if (this.payload.message_scene === "friend") {
            return this.payload.friend;
        }
        return undefined;
    }

    getGroupInfo() {
        if (
            this.payload.message_scene === "group" ||
            this.payload.message_scene === "temp"
        ) {
            return this.payload.group;
        }
        return undefined;
    }

    getGroupMemberInfo() {
        if (this.payload.message_scene === "group") {
            return this.payload.group_member;
        }
        return undefined;
    }
}

/** 消息撤回事件
 *
 * Message Recall Event
 */
export class MessageRecall
    extends MilkyEvent<p.MessageRecallEventData>
    implements HasContactId, HasScene, HasSceneId, HasOperatorId
{
    getContactId(): string {
        return this.payload.sender_id.toString();
    }

    isPrivate(): boolean {
        return this.payload.message_scene === "friend";
    }

    isPublic(): boolean {
        return this.payload.message_scene === "group";
    }

    getSceneId(): string {
        return this.payload.peer_id.toString();
    }

    getSuffix(): string {
        return this.payload.display_suffix;
    }

    getOperatorId(): string {
        return this.payload.operator_id.toString();
    }

    getMessageSeq(): bigint {
        return this.payload.message_seq;
    }

    getSenderId(): string {
        return this.payload.sender_id.toString();
    }
}

/** 好友请求事件
 *
 * Friend Request Event
 */
export class FriendRequest extends MilkyEvent<p.FriendRequestEventData> {
    getInitiatorId(): string {
        return this.payload.initiator_id.toString();
    }

    getInitiatorUid(): string {
        return this.payload.initiator_uid;
    }

    getComment(): string {
        return this.payload.comment;
    }

    getVia(): string {
        return this.payload.via;
    }

    async accept(): Promise<void> {
        // TODO: 实现接受好友请求的逻辑
    }

    async reject(): Promise<void> {
        // TODO: 实现拒绝好友请求的逻辑
    }
}

/** 入群请求事件
 *
 * Group Join Request Event
 */
export class GroupJoinRequest extends MilkyEvent<p.GroupJoinRequestEventData> {
    getGroupId(): string {
        return this.payload.group_id.toString();
    }

    getInitiatorId(): string {
        return this.payload.initiator_id.toString();
    }

    getComment(): string {
        return this.payload.comment;
    }

    isFiltered(): boolean {
        return this.payload.is_filtered;
    }

    async accept(): Promise<void> {
        // TODO: 实现接受入群请求的逻辑
    }

    async reject(): Promise<void> {
        // TODO: 实现拒绝入群请求的逻辑
    }
}

/** 群成员邀请他人入群请求事件
 *
 * Group Invited Join Request Event
 */
export class GroupInvitedJoinRequest
    extends MilkyEvent<p.GroupInvitedJoinRequestEventData>
    implements HasSceneId, HasScene
{
    getSceneId(): string {
        return this.payload.group_id.toString();
    }

    isPrivate(): boolean {
        return false;
    }

    isPublic(): boolean {
        return true;
    }

    getInitiatorId(): string {
        return this.payload.initiator_id.toString();
    }

    getTargetId(): string {
        return this.payload.target_user_id.toString();
    }

    async accept(): Promise<void> {
        // TODO: 实现接受入群请求的逻辑
    }

    async reject(): Promise<void> {
        // TODO: 实现拒绝入群请求的逻辑
    }
}

/** 他人邀请自身入群事件
 *
 * Group Invitation Event
 */
export class GroupInvitation extends MilkyEvent<p.GroupInvitationEventData> {
    getGroupId(): string {
        return this.payload.group_id.toString();
    }

    getInitiatorId(): string {
        return this.payload.initiator_id.toString();
    }

    async accept(): Promise<void> {
        // TODO: 实现接受入群请求的逻辑
    }

    async reject(): Promise<void> {
        // TODO: 实现拒绝入群请求的逻辑
    }
}

/** 好友戳一戳事件
 *
 * Friend Nudge Event
 */
export class FriendNudge
    extends MilkyEvent<p.FriendNudgeEventData>
    implements HasOperatorId
{
    getOperatorId(): string {
        return this.payload.user_id.toString();
    }

    getUserId(): string {
        return this.payload.user_id.toString();
    }

    getAction(): string {
        return this.payload.display_action;
    }

    getActionImage(): string {
        return this.payload.display_action_img_url;
    }

    getSuffix(): string {
        return this.payload.display_suffix;
    }
}

/** 好友文件上传事件
 *
 * Friend File Upload Event
 */
export class FriendFileUpload
    extends MilkyEvent<p.FriendFileUploadEventData>
    implements HasOperatorId, HasScene, HasSceneId
{
    getOperatorId(): string {
        return this.payload.user_id.toString();
    }

    isPrivate(): boolean {
        return true;
    }

    isPublic(): boolean {
        return false;
    }

    getSceneId(): string {
        return this.payload.user_id.toString();
    }

    getUserId(): string {
        return this.payload.user_id.toString();
    }

    getFileId(): string {
        return this.payload.file_id;
    }

    getFileName(): string {
        return this.payload.file_name;
    }

    getFileSize(): bigint {
        return this.payload.file_size;
    }

    getFileHash(): string {
        return this.payload.file_hash;
    }

    async save(): Promise<boolean> {
        // TODO: 实现好友文件保存逻辑
        return false;
    }
}

/** 群管理员变更事件
 *
 * Group Admin Change Event
 */
export class GroupAdminChange
    extends MilkyEvent<p.GroupAdminChangeEventData>
    implements HasSceneId, HasScene, HasReceiverId
{
    getSceneId(): string {
        return this.payload.group_id.toString();
    }

    isPrivate(): boolean {
        return false;
    }

    isPublic(): boolean {
        return true;
    }

    getReceiverId(): string {
        return this.payload.user_id.toString();
    }

    isSet(): boolean {
        return this.payload.is_set;
    }
}

/** 群精华消息变更事件
 *
 * Group Essence Message Change Event
 */
export class GroupEssenceMessageChange
    extends MilkyEvent<p.GroupEssenceMessageChangeEventData>
    implements HasSceneId, HasScene
{
    getMessageSeq(): bigint {
        return this.payload.message_seq;
    }

    getGroupId(): string {
        return this.payload.group_id.toString();
    }

    isSet(): boolean {
        return this.payload.is_set;
    }

    isPrivate(): boolean {
        return false;
    }

    isPublic(): boolean {
        return true;
    }

    getSceneId(): string {
        return this.payload.group_id.toString();
    }
}

/** 群成员增加事件
 *
 * Group Member Increase Event
 */
export class GroupMemberIncrease
    extends MilkyEvent<p.GroupMemberIncreaseEventData>
    implements HasSceneId, HasScene, HasReceiverId, HasOperatorId
{
    getSceneId(): string {
        return this.payload.group_id.toString();
    }

    isPrivate(): boolean {
        return false;
    }

    isPublic(): boolean {
        return true;
    }

    getReceiverId(): string {
        return this.payload.user_id.toString();
    }

    getOperatorId(): string {
        return this.payload.operator_id?.toString() || "";
    }

    getInvitorId(): string {
        return this.payload.invitor_id?.toString() || "";
    }
}

/** 群成员减少事件
 *
 * Group Member Decrease Event
 */
export class GroupMemberDecrease
    extends MilkyEvent<p.GroupMemberDecreaseEventData>
    implements HasSceneId, HasScene, HasReceiverId, HasOperatorId
{
    getSceneId(): string {
        return this.payload.group_id.toString();
    }

    isPrivate(): boolean {
        return false;
    }

    isPublic(): boolean {
        return true;
    }

    getReceiverId(): string {
        return this.payload.user_id.toString();
    }

    getOperatorId(): string {
        return this.payload.operator_id?.toString() || "";
    }
}

/** 群名称变更事件
 *
 * Group Name Change Event
 */
export class GroupNameChange
    extends MilkyEvent<p.GroupNameChangeEventData>
    implements HasSceneId, HasScene, HasOperatorId
{
    getSceneId(): string {
        return this.payload.group_id.toString();
    }

    isPrivate(): boolean {
        return false;
    }

    isPublic(): boolean {
        return true;
    }

    getOperatorId(): string {
        return this.payload.operator_id.toString();
    }

    getNewName(): string {
        return this.payload.new_group_name;
    }
}

/** 群消息表情回应事件
 *
 * Group Message Reaction Event
 */
export class GroupMessageReaction
    extends MilkyEvent<p.GroupMessageReactionEventData>
    implements HasSceneId, HasScene, HasOperatorId
{
    getSceneId(): string {
        return this.payload.group_id.toString();
    }

    isPrivate(): boolean {
        return false;
    }

    isPublic(): boolean {
        return true;
    }

    getOperatorId(): string {
        return this.payload.user_id.toString();
    }

    getUserId(): string {
        return this.payload.user_id.toString();
    }

    getMessageSeq(): bigint {
        return this.payload.message_seq;
    }

    getFaceId(): string {
        return this.payload.face_id;
    }

    isAdd(): boolean {
        return this.payload.is_add;
    }
}

/** 群禁言事件
 *
 * Group Mute Event
 */
export class GroupMute
    extends MilkyEvent<p.GroupMuteEventData>
    implements HasSceneId, HasScene, HasOperatorId, HasReceiverId
{
    getSceneId(): string {
        return this.payload.group_id.toString();
    }

    isPrivate(): boolean {
        return false;
    }

    isPublic(): boolean {
        return true;
    }

    getOperatorId(): string {
        return this.payload.operator_id.toString();
    }

    getReceiverId(): string {
        return this.payload.user_id.toString();
    }

    getUserId(): string {
        return this.payload.user_id.toString();
    }

    getGroupId(): string {
        return this.payload.group_id.toString();
    }

    getDurationSeconds(): number {
        return this.payload.duration;
    }

    getDurationMilliseconds(): number {
        return this.payload.duration * 1000;
    }
}

/** 群全体禁言事件
 *
 * Group Whole Mute Event
 */
export class GroupWholeMute
    extends MilkyEvent<p.GroupWholeMuteEventData>
    implements HasSceneId, HasScene, HasOperatorId
{
    getSceneId(): string {
        return this.payload.group_id.toString();
    }

    isPrivate(): boolean {
        return false;
    }

    isPublic(): boolean {
        return true;
    }

    getOperatorId(): string {
        return this.payload.operator_id.toString();
    }

    getGroupId(): string {
        return this.payload.group_id.toString();
    }

    isMute(): boolean {
        return this.payload.is_mute;
    }
}

/** 群戳一戳事件
 *
 * Group Nudge Event
 */
export class GroupNudge
    extends MilkyEvent<p.GroupNudgeEventData>
    implements HasSceneId, HasScene, HasReceiverId, HasOperatorId
{
    getSceneId(): string {
        return this.payload.group_id.toString();
    }

    isPrivate(): boolean {
        return false;
    }

    isPublic(): boolean {
        return true;
    }

    getOperatorId(): string {
        return this.payload.sender_id.toString();
    }

    getReceiverId(): string {
        return this.payload.receiver_id.toString();
    }

    getGroupId(): string {
        return this.payload.group_id.toString();
    }

    getSenderId(): string {
        return this.payload.sender_id.toString();
    }

    getAction(): string {
        return this.payload.display_action;
    }

    getActionImage(): string {
        return this.payload.display_action_img_url;
    }

    getSuffix(): string {
        return this.payload.display_suffix;
    }
}

/** 群文件上传事件
 *
 * Group File Upload Event
 */
export class GroupFileUpload
    extends MilkyEvent<p.GroupFileUploadEventData>
    implements HasSceneId, HasScene, HasOperatorId
{
    getSceneId(): string {
        return this.payload.group_id.toString();
    }

    isPrivate(): boolean {
        return false;
    }

    isPublic(): boolean {
        return true;
    }

    getOperatorId(): string {
        return this.payload.user_id.toString();
    }

    getUserId(): string {
        return this.payload.user_id.toString();
    }

    getGroupId(): string {
        return this.payload.group_id.toString();
    }

    getFileId(): string {
        return this.payload.file_id;
    }

    getFileName(): string {
        return this.payload.file_name;
    }

    getFileSize(): bigint {
        return this.payload.file_size;
    }

    async save(): Promise<boolean> {
        // TODO: 实现群文件保存逻辑
        return false;
    }
}

/** 根据原始负载创建对应的事件实例
 *
 * Create corresponding event instance based on the original payload
 */
export function createEvent(payload: any, bot: MilkyBot) {
    // 通过 zod 对 payload 进行类型验证
    const result = p.MilkyEventPayloadSchema.safeParse(payload);
    if (!result.success) {
        return undefined;
    }
    // 根据事件类型创建对应的事件实例
    switch (result.data.event_type) {
        case "bot_offline":
            return new BotOffline(result.data, bot);
        case "message_receive":
            return new MessageReceive(result.data, bot);
        case "message_recall":
            return new MessageRecall(result.data, bot);
        case "friend_request":
            return new FriendRequest(result.data, bot);
        case "group_join_request":
            return new GroupJoinRequest(result.data, bot);
        case "group_invited_join_request":
            return new GroupInvitedJoinRequest(result.data, bot);
        case "group_invitation":
            return new GroupInvitation(result.data, bot);
        case "friend_nudge":
            return new FriendNudge(result.data, bot);
        case "friend_file_upload":
            return new FriendFileUpload(result.data, bot);
        case "group_admin_change":
            return new GroupAdminChange(result.data, bot);
        case "group_essence_message_change":
            return new GroupEssenceMessageChange(result.data, bot);
        case "group_member_increase":
            return new GroupMemberIncrease(result.data, bot);
        case "group_member_decrease":
            return new GroupMemberDecrease(result.data, bot);
        case "group_name_change":
            return new GroupNameChange(result.data, bot);
        case "group_message_reaction":
            return new GroupMessageReaction(result.data, bot);
        case "group_mute":
            return new GroupMute(result.data, bot);
        case "group_whole_mute":
            return new GroupWholeMute(result.data, bot);
        case "group_nudge":
            return new GroupNudge(result.data, bot);
        case "group_file_upload":
            return new GroupFileUpload(result.data, bot);
        default:
            return undefined;
    }
}
