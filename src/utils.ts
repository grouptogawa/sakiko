/**  雪花算法的配置项
 *
 * Snowflake algorithm configuration options
 */
export interface SnowFlakeOptions {
  epoch?: number;
  workerIdBits?: number;
  sequenceBits?: number;
  maxSequence?: number;
}

/**
 * 一个简单的雪花算法 ID 生成器
 *
 * A simple Snowflake ID generator
 */
export class SnowFlake {
  private epoch: number = 1704067200000; // 2024-01-01 00:00:00 UTC
  private workerIdBits: number = 10;
  private sequenceBits: number = 12;
  private maxSequence: number = (1 << this.sequenceBits) - 1;

  private lastMs: number = 0;
  private sequence: number = 0;
  private workerId: number = 1;

  constructor(workerId: number, options?: SnowFlakeOptions) {
    this.workerId = workerId;
    if (options) {
      if (options.epoch !== undefined) this.epoch = options.epoch;
      if (options.workerIdBits !== undefined)
        this.workerIdBits = options.workerIdBits;
      if (options.sequenceBits !== undefined)
        this.sequenceBits = options.sequenceBits;
      if (options.maxSequence !== undefined)
        this.maxSequence = options.maxSequence;
    }
  }

  bigint(): bigint {
    const now = Date.now();
    if (now === this.lastMs) {
      this.sequence = (this.sequence + 1) & this.maxSequence;
      if (this.sequence === 0) {
        while (Date.now() <= this.lastMs) {}
      }
    } else {
      this.sequence = 0;
      this.lastMs = now;
    }

    const timestampPart =
      BigInt(now - this.epoch) << BigInt(this.workerIdBits + this.sequenceBits);
    const workerPart = BigInt(this.workerId) << BigInt(this.sequenceBits);
    const id = timestampPart | workerPart | BigInt(this.sequence);
    return id;
  }

  bigIntUnsafe(): bigint {
    const now = Date.now();

    this.sequence = (this.sequence + 1) & this.maxSequence;
    if (now !== this.lastMs) {
      this.lastMs = now;
    }

    const timestampPart =
      BigInt(now - this.epoch) << BigInt(this.workerIdBits + this.sequenceBits);
    const workerPart = BigInt(this.workerId) << BigInt(this.sequenceBits);
    const id = timestampPart | workerPart | BigInt(this.sequence);
    return id;
  }

  base36(): string {
    return this.bigint().toString(36);
  }

  base36Unsafe(): string {
    return this.bigIntUnsafe().toString(36);
  }
}
