import type { Sakiko } from ".";

export abstract class SakikoBaseEvent {
  eventId: string;
  nodeId: number;

  abstract selfId: string;

  constructor(framework: Sakiko) {
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
  abstract isMentioned(): boolean;

  constructor(framework: Sakiko) {
    super(framework);
  }
}

export abstract class SakikoNoticeEvent extends SakikoBaseEvent {
  constructor(framework: Sakiko) {
    super(framework);
  }
}
