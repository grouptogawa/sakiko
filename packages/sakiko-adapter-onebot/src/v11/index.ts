// 事件导出
export { OB11BaseEvent } from "./event/base-event";
export { createEvent } from "./event/factory";
export {
    MessageEvent,
    PrivateMessageEvent,
    GroupMessageEvent
} from "./event/message-event";
export { HeartbeatEvent, LifecycleEvent } from "./event/meta-event";
export * from "./event/notice-event";
export {
    RequestEvent,
    GroupRequestEvent,
    FriendRequestEvent
} from "./event/request-event";

// 消息导出
export { Message, message } from "./message/msg";
export { OB11Segments } from "./message/segment";
export type {
    SegmentLike,
    Text,
    At,
    Reply,
    Face,
    MFace,
    Dice,
    RPS,
    Poke,
    Image,
    Record,
    Video,
    File,
    Shake,
    Json,
    Xml,
    Music,
    Forward,
    Anonymous,
    Share,
    Contact,
    Location,
    Node
} from "./message/segment";
export { summarizeMessage, summarizeSeg } from "./message/summary";

// 负载类型导出
export type {
    OB11APIAction,
    OB11APIRequestResponseMap
} from "./payload/api/map";
export type { OB11EventPayload } from "./payload/event/base";
export type {
    OB11MessageEventPayload,
    OB11GroupMessageAnonymous,
    OB11PrivateMessageEventPayload
} from "./payload/event/message";
export type {
    OB11MetaEventPayload,
    OB11LifecycleMetaEventPayload,
    OB11HeartbeatMetaEventPayload
} from "./payload/event/meta";
export type * from "./payload/event/notice";
export type {
    OB11RequestEventPayload,
    OB11GroupRequestEventPayload,
    OB11FriendRequestEventPayload
} from "./payload/event/request";

// 适配器和Bot导出
export { OnebotV11Adapter } from "./adapter";
export { Bot } from "./bot";
