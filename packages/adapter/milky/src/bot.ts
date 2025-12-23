import {
    validateRequest,
    validateResponse,
    type APIAction,
    type APIReq,
    type APIRes
} from "@togawa-dev/utils/endpoint";

import type { Milky } from ".";
import type { ProtocolBot } from "@togawa-dev/sakiko";
import { milkyAPIMap } from "@togawa-dev/protocol-milky/payload/api";

type MilkyAPIMap = typeof milkyAPIMap;

export class MilkyBot implements ProtocolBot<MilkyAPIMap> {
    private readonly _logger?;

    constructor(
        private readonly _adapter: Milky,
        private readonly _options: {
            _selfId: string;
            _nickname: string;
            _apiBaseUrl: URL;
            _accessToken?: string;
        }
    ) {
        this._logger = _adapter.logger;
    }

    get nickname(): string {
        return this._options._nickname;
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
        return this.call("get_user_profile", { user_id: BigInt(userId) });
    }

    /** 获取好友列表 */
    async getFriendList(noCache?: boolean) {
        return this.call("get_friend_list", { no_cache: noCache });
    }

    /** 获取好友信息 */
    async getFriendInfo(userId: string | number | bigint, noCache?: boolean) {
        return this.call("get_friend_info", {
            user_id: BigInt(userId),
            no_cache: noCache
        });
    }

    /** 获取群列表 */
    async getGroupList(noCache?: boolean) {
        return this.call("get_group_list", { no_cache: noCache });
    }

    /** 获取群信息 */
    async getGroupInfo(groupId: string | number | bigint, noCache?: boolean) {
        return this.call("get_group_info", {
            group_id: BigInt(groupId),
            no_cache: noCache
        });
    }

    /** 获取群成员列表 */
    async getGroupMemberList(
        groupId: string | number | bigint,
        noCache?: boolean
    ) {
        return this.call("get_group_member_list", {
            group_id: BigInt(groupId),
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
            group_id: BigInt(groupId),
            user_id: BigInt(userId),
            no_cache: noCache
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

    // TODO: 实现更多 API 快捷方法

    send(target: any, ...msg: any): Promise<boolean> {
        // TODO: 实现发送消息的逻辑
        return {} as any;
    }
}
