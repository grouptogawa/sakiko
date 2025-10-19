import * as z from "zod";

/** NullBotConfigSchema NullBot的配置验证结构，通过zod对配置的内容进行验证
 *
 */
const NullBotConfigSchema = z.object({
	/** NullBot的监听地址 */
	host: z.ipv4().optional().default("127.0.0.1"),
	/** NullBot的监听端口 */
	port: z.number().min(1).max(65535).optional().default(8080),
	/** NullBot调用API的超时时间，单位秒 */
	apiTimeout: z.number().min(1).optional().default(30),
	/** 设置日志记录器的输出等级（仅在使用内置的日志记录器时有效） */
	logLevel: z.int().optional().default(3),
	/** 是否启用日志记录器的美观输出，这会使控制台的输出内容更加可读，但是会一定程度上增大性能开销（绝大多数情况下这点开销不会产生什么影响） （仅在使用内置的日志记录器时有效） */
	usePrettyLogger: z.boolean().optional().default(true),
});

export default NullBotConfigSchema;
