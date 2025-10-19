import * as z from "zod";

type Strictness = "object" | "strict" | "loose";

interface MergeOptions {
	strictness?: Strictness;
}

/**
 * 合并多个 ZodObject 的字段定义
 * @param schemas  需要合并的对象 schema（至少 1 个）
 * @param options  合并选项：
 *   - strictness: "object" | "strict" | "loose"
 */
export function mergeZodObjects<
	const T extends readonly [z.ZodObject, ...z.ZodObject[]],
>(schemas: T, options: MergeOptions = {}): z.ZodObject<z.ZodRawShape, any> {
	const { strictness = "object" } = options;

	const mergedShape: z.ZodRawShape = {};

	for (const schema of schemas) {
		const shape = (schema as z.ZodObject<z.ZodRawShape>).shape;

		// 后者覆盖前者
		Object.assign(mergedShape, shape);
	}

	// 基于传入的设置中的严格度返回zod对象
	switch (strictness) {
		case "strict":
			return z.strictObject(mergedShape);
		case "loose":
			return z.looseObject(mergedShape);
		default:
			return z.object(mergedShape);
	}
}
