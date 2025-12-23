import { z } from "zod/v4";

// 数据实体定义 / Entity definitions

/**
 * 群文件 / Group File
 */
export const GroupFileEntity = z.object({
    /** 群号 */
    group_id: z.int64(),
    /** 文件 ID */
    file_id: z.string(),
    /** 文件名称 */
    file_name: z.string(),
    /** 父文件夹 ID */
    parent_folder_id: z.string(),
    /** 文件大小（字节） */
    file_size: z.int64(),
    /** 上传时的 Unix 时间戳（秒） */
    uploaded_time: z.int64(),
    /** 过期时的 Unix 时间戳（秒） */
    expire_time: z.int64().optional(),
    /** 上传者 QQ 号 */
    uploader_id: z.int64(),
    /** 下载次数 */
    downloaded_times: z.int32()
});

export type GroupFile = z.infer<typeof GroupFileEntity>;

/**
 * 群文件夹 / Group Folder
 */
export const GroupFolderEntity = z.object({
    /** 群号 */
    group_id: z.int64(),
    /** 文件夹 ID */
    folder_id: z.string(),
    /** 父文件夹 ID */
    parent_folder_id: z.string(),
    /** 文件夹名称 */
    folder_name: z.string(),
    /** 创建时的 Unix 时间戳（秒） */
    created_time: z.int64(),
    /** 最后修改时的 Unix 时间戳（秒） */
    last_modified_time: z.int64(),
    /** 创建者 QQ 号 */
    creator_id: z.int64(),
    /** 文件数量 */
    file_count: z.int32()
});

export type GroupFolder = z.infer<typeof GroupFolderEntity>;

// API 请求和响应数据结构定义 / API request and response data structure definitions

/**
 * 上传私聊文件 / Upload Private File
 */
export const uploadPrivateFileReq = z.object({
    /** 好友 QQ 号 */
    user_id: z.int64(),
    /** 文件 URI，支持 `file://` `http(s)://` `base64://` 三种格式 */
    file_uri: z.string(),
    /** 文件名称 */
    file_name: z.string()
});

export const uploadPrivateFileRes = z.object({
    /** 文件 ID */
    file_id: z.string()
});

/**
 * 上传群文件 / Upload Group File
 */
export const uploadGroupFileReq = z.object({
    /** 群号 */
    group_id: z.int64(),
    /** 目标文件夹 ID (default: "/") */
    parent_folder_id: z.string().optional().default("/"),
    /** 文件 URI，支持 `file://` `http(s)://` `base64://` 三种格式 */
    file_uri: z.string(),
    /** 文件名称 */
    file_name: z.string()
});

export const uploadGroupFileRes = z.object({
    /** 文件 ID */
    file_id: z.string()
});

/**
 * 获取私聊文件下载链接 / Get Private File Download URL
 */
export const getPrivateFileDownloadUrlReq = z.object({
    /** 好友 QQ 号 */
    user_id: z.int64(),
    /** 文件 ID */
    file_id: z.string(),
    /** 文件的 TriSHA1 哈希值 */
    file_hash: z.string()
});

export const getPrivateFileDownloadUrlRes = z.object({
    /** 文件下载链接 */
    download_url: z.string()
});

/**
 * 获取群文件下载链接 / Get Group File Download URL
 */
export const getGroupFileDownloadUrlReq = z.object({
    /** 群号 */
    group_id: z.int64(),
    /** 文件 ID */
    file_id: z.string()
});

export const getGroupFileDownloadUrlRes = z.object({
    /** 文件下载链接 */
    download_url: z.string()
});

/**
 * 获取群文件列表 / Get Group Files
 */
export const getGroupFilesReq = z.object({
    /** 群号 */
    group_id: z.int64(),
    /** 父文件夹 ID (default: "/") */
    parent_folder_id: z.string().optional().default("/")
});

export const getGroupFilesRes = z.object({
    /** 文件列表 */
    files: z.array(GroupFileEntity),
    /** 文件夹列表 */
    folders: z.array(GroupFolderEntity)
});

/**
 * 移动群文件 / Move Group File
 */
export const moveGroupFileReq = z.object({
    /** 群号 */
    group_id: z.int64(),
    /** 文件 ID */
    file_id: z.string(),
    /** 文件所在的文件夹 ID (default: "/") */
    parent_folder_id: z.string().optional().default("/"),
    /** 目标文件夹 ID (default: "/") */
    target_folder_id: z.string().optional().default("/")
});

export const moveGroupFileRes = z.object({});

/**
 * 重命名群文件 / Rename Group File
 */
export const renameGroupFileReq = z.object({
    /** 群号 */
    group_id: z.int64(),
    /** 文件 ID */
    file_id: z.string(),
    /** 文件所在的文件夹 ID (default: "/") */
    parent_folder_id: z.string().optional().default("/"),
    /** 新文件名称 */
    new_file_name: z.string()
});

export const renameGroupFileRes = z.object({});

/**
 * 删除群文件 / Delete Group File
 */
export const deleteGroupFileReq = z.object({
    /** 群号 */
    group_id: z.int64(),
    /** 文件 ID */
    file_id: z.string()
});

export const deleteGroupFileRes = z.object({});

/**
 * 创建群文件夹 / Create Group Folder
 */
export const createGroupFolderReq = z.object({
    /** 群号 */
    group_id: z.int64(),
    /** 文件夹名称 */
    folder_name: z.string()
});

export const createGroupFolderRes = z.object({
    /** 文件夹 ID */
    folder_id: z.string()
});

/**
 * 重命名群文件夹 / Rename Group Folder
 */
export const renameGroupFolderReq = z.object({
    /** 群号 */
    group_id: z.int64(),
    /** 文件夹 ID */
    folder_id: z.string(),
    /** 新文件夹名 */
    new_folder_name: z.string()
});

export const renameGroupFolderRes = z.object({});

/**
 * 删除群文件夹 / Delete Group Folder
 */
export const deleteGroupFolderReq = z.object({
    /** 群号 */
    group_id: z.int64(),
    /** 文件夹 ID */
    folder_id: z.string()
});

export const deleteGroupFolderRes = z.object({});
