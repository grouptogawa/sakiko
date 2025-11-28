import type { Sakiko } from ".";

/**
 * 事件总线上传递的基本事件类型
 *
 * The basic event type passed on the event bus
 */
export class Event {}

export abstract class SakikoBaseEvent extends Event {
  eventId: string;
  nodeId: number;

  abstract selfId: string;

  constructor(framework: Sakiko) {
    super();
    this.eventId = framework.snowflakeGenerator().base36();
    this.nodeId = framework.getNodeId();
  }
}

export abstract class SakikoMetaEvent extends SakikoBaseEvent {
  constructor(framework: Sakiko) {
    super(framework);
  }
}

export abstract class SakikoMessageEvent extends SakikoBaseEvent {
  abstract getPlainText(): string;
  abstract toMe(): boolean;

  constructor(framework: Sakiko) {
    super(framework);
  }
}

export abstract class SakikoNoticeEvent extends SakikoBaseEvent {
  constructor(framework: Sakiko) {
    super(framework);
  }
}
