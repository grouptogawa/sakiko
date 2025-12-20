import { z } from "zod/v4";

// 数据实体定义 / Entity definitions

export const FriendCategoryEntity = z.object({
    /** 好友分组 ID */
    category_id: z.int32(),
    /** 好友分组名称 */
    category_name: z.string()
});

export const FriendEntity = z.object({
    /** 用户 QQ 号 */
    user_id: z.int64(),
    /** 用户昵称 */
    nickname: z.string(),
    /** 用户性别 */
    sex: z.enum(["male", "female", "unknown"]),
    /** 用户 QID */
    qid: z.string(),
    /** 好友备注 */
    remark: z.string(),
    /** 好友分组 */
    category: FriendCategoryEntity
});

export const GroupEntity = z.object({
    /** 群号 */
    group_id: z.int64(),
    /** 群名称 */
    group_name: z.string(),
    /** 群成员数量 */
    member_count: z.int32(),
    /** 群容量 */
    max_member_count: z.int32()
});

export const GroupMemberEntity = z.object({
    /** 用户 QQ 号 */
    user_id: z.int64(),
    /** 用户昵称 */
    nickname: z.string(),
    /** 用户性别 */
    sex: z.enum(["male", "female", "unknown"]),
    /** 群号 */
    group_id: z.int64(),
    /** 成员备注 */
    card: z.string(),
    /** 专属头衔 */
    title: z.string(),
    /** 群等级，注意和 QQ 等级区分 */
    level: z.int32(),
    /** 权限等级 */
    role: z.enum(["owner", "admin", "member"]),
    /** 入群时间，Unix 时间戳（秒） */
    join_time: z.int64(),
    /** 最后发言时间，Unix 时间戳（秒） */
    last_sent_time: z.int64(),
    /** 禁言结束时间，Unix 时间戳（秒） */
    shut_up_end_time: z.int64().optional()
});

// API 请求和响应数据结构定义 / API request and response data structure definitions

export const getLoginInfoReq = z.object({});

export const getLoginInfoRes = z.object({
    /** 登录 QQ 号 */
    uin: z.int64(),
    /** 登录昵称 */
    nickname: z.string()
});

export const getImplInfoReq = z.object({});

export const getImplInfoRes = z.object({
    /** 协议端名称 */
    impl_name: z.string(),
    /** 协议端版本 */
    impl_version: z.string(),
    /** 协议端使用的 QQ 协议版本 */
    qq_protocol_version: z.string(),
    /** 协议端使用的 QQ 协议平台 */
    qq_protocol_type: z.enum([
        "windows",
        "linux",
        "macos",
        "android_pad",
        "android_phone",
        "ipad",
        "iphone",
        "harmony",
        "watch"
    ]),
    /** 协议端实现的 Milky 协议版本*/
    milky_version: z.string()
});

export const getUserProfileReq = z.object({
    /** 用户 QQ 号 */
    user_id: z.int64()
});

export const getUserProfileRes = z.object({
    /** 昵称 */
    nickname: z.string(),
    /** QID */
    qid: z.string(),
    /** 年龄 */
    age: z.int32(),
    /** 性别 */
    sex: z.enum(["male", "female", "unknown"]),
    /** 备注 */
    remark: z.string(),
    /** 个性签名 */
    bio: z.string(),
    /** QQ 等级 */
    level: z.int32(),
    /** 国家或地区 */
    country: z.string(),
    /** 城市 */
    city: z.string(),
    /** 学校 */
    school: z.string()
});

export const getFriendListReq = z.object({
    /** 是否强制不使用缓存 (default: false) */
    no_cache: z.boolean().optional().default(false)
});

export const getFriendListRes = z.object({
    /** 好友列表 */
    friends: z.array(FriendEntity)
});

export const getFriendInfoReq = z.object({
    /** 好友 QQ 号 */
    user_id: z.int64(),
    /** 是否强制不使用缓存 (default: false) */
    no_cache: z.boolean().optional().default(false)
});

export const getFriendInfoRes = z.object({
    /** 好友信息 */
    friend: FriendEntity
});

export const getGroupListReq = z.object({
    /** 是否强制不使用缓存 (default: false) */
    no_cache: z.boolean().optional().default(false)
});

export const getGroupListRes = z.object({
    /** 群列表 */
    groups: z.array(GroupEntity)
});

export const getGroupInfoReq = z.object({
    /** 群号 */
    group_id: z.int64(),
    /** 是否强制不使用缓存 (default: false) */
    no_cache: z.boolean().optional().default(false)
});

export const getGroupInfoRes = z.object({
    /** 群信息 */
    group: GroupEntity
});

export const getGroupMemberListReq = z.object({
    /** 群号 */
    group_id: z.int64(),
    /** 是否强制不使用缓存 (default: false) */
    no_cache: z.boolean().optional().default(false)
});

export const getGroupMemberListRes = z.object({
    /** 群成员列表 */
    members: z.array(GroupMemberEntity)
});

export const getGroupMemberInfoReq = z.object({
    /** 群号 */
    group_id: z.int64(),
    /** 群成员 QQ 号 */
    user_id: z.int64(),
    /** 是否强制不使用缓存 (default: false) */
    no_cache: z.boolean().optional().default(false)
});

export const getGroupMemberInfoRes = z.object({
    /** 群成员信息 */
    member: GroupMemberEntity
});

export const getCookiesReq = z.object({
    /** 需要获取 Cookies 的域名 */
    domain: z.string()
});

export const getCookiesRes = z.object({
    /** 域名对应的 Cookies 字符串 */
    cookies: z.string()
});

export const getCsrfTokenReq = z.object({});

export const getCsrfTokenRes = z.object({
    /** CSRF Token */
    csrf_token: z.string()
});
