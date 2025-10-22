import * as z from "zod";

/** SakikoConfigSchema Sakiko的配置验证结构，通过zod对配置的内容进行验证
 *
 */
export const SakikoConfigSchema = z.object({
	/** 适配器的默认监听地址 */
	host: z.ipv4().optional().default("127.0.0.1"),
	/** 适配器的默认监听端口 */
	port: z.number().min(1).max(65535).optional().default(8080),
	/** 适配器调用API的超时时间，单位秒 */
	apiTimeout: z.number().min(1).optional().default(30),
	/** 访问令牌，用于适配器进行鉴权 */
	accessToken: z.string().optional().default(""),
	/** 设置日志记录器的输出等级（仅在使用内置的日志记录器时有效） */
	logLevel: z.int().optional().default(3),
	/** 是否启用日志记录器的美观输出，这会使控制台的输出内容更加可读，但是会一定程度上增大性能开销（绝大多数情况下这点开销不会产生什么影响）（仅在使用内置的日志记录器时有效） */
	enablePrettyLogger: z.boolean().optional().default(true),
	/** 是否启用控制台输出，如果禁用会使控制台不再输出日志，但是不会影响日志记录器本身的输出（仅在使用内置的日志记录器时有效） */
	enableConsoleLogger: z.boolean().optional().default(true),
	/** 是否启用源码路径日志记录，这会使日志记录器在输出日志时包含源码的路径信息（仅在使用内置的日志记录器时有效） */
	enablePathLogging: z.boolean().optional().default(false),
});

export type SakikoConfig = Partial<z.infer<typeof SakikoConfigSchema>> &
	Record<string, any>;
