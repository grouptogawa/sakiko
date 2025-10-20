const EPOCH = 1704067200000;
const WORKER_ID_BITS = 10;
const SEQ_BITS = 12;
const MAX_SEQ = (1 << SEQ_BITS) - 1;

let lastMs = 0;
let seq = 0;
const workerId = 1;

/** snowflakeIdBase36 生成一个基于Snowflake算法的唯一ID，使用Base36编码
 *
 * @returns string 唯一ID的Base36字符串表示
 */
export function snowflakeIdBase36(): string {
	const now = Date.now();
	if (now === lastMs) {
		seq = (seq + 1) & MAX_SEQ;
		if (seq === 0) {
			while (Date.now() <= lastMs) {}
		}
	} else {
		seq = 0;
		lastMs = now;
	}

	const timestampPart =
		BigInt(now - EPOCH) << BigInt(WORKER_ID_BITS + SEQ_BITS);
	const workerPart = BigInt(workerId) << BigInt(SEQ_BITS);
	const id = timestampPart | workerPart | BigInt(seq);
	return id.toString(36);
}

/** snowflakeIdBase36Unsafe 生成一个基于Snowflake算法的唯一ID，使用Base36编码（不保证并发安全，可能会出现序号溢出）
 *
 * @returns string 唯一ID的Base36字符串表示
 */
export function snowflakeIdBase36Unsafe(): string {
	const now = Date.now();

	seq = (seq + 1) & MAX_SEQ;
	if (now !== lastMs) {
		lastMs = now;
	}

	const timestampPart =
		BigInt(now - EPOCH) << BigInt(WORKER_ID_BITS + SEQ_BITS);
	const workerPart = BigInt(workerId) << BigInt(SEQ_BITS);
	const id = timestampPart | workerPart | BigInt(seq);

	return id.toString(36);
}
