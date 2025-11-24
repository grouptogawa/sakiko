import { randomUUID } from "node:crypto";
import type { Sakiko } from ".";

export abstract class SakikoAdapter {
  abstract name: string;
  abstract version: string;
  abstract protocolName: string;
  abstract platformName: string;

  selfId = randomUUID();

  abstract init(sakiko: Sakiko): void;
  abstract start(): void | Promise<void>;
  abstract stop(): void | Promise<void>;
}
