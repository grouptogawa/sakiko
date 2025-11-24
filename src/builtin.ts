import type { Sakiko } from ".";

export abstract class BaseSakikoEvent {
  eventId: string;
  nodeId: number;
  time: number = Date.now();

  abstract selfId: string;

  constructor(framework: Sakiko) {
    this.eventId = framework.snowflakeGenerator().base36();
    this.nodeId = framework.getNodeId();
  }
}

export abstract class SakikoMetaEvent extends BaseSakikoEvent {
  constructor(framework: Sakiko) {
    super(framework);
  }
}

export abstract class SakikoMessageEvent extends BaseSakikoEvent {
  abstract getPlainText(): string;
  abstract isMentioned(): boolean;

  constructor(framework: Sakiko) {
    super(framework);
  }
}

export abstract class SakikoNoticeEvent extends BaseSakikoEvent {
  constructor(framework: Sakiko) {
    super(framework);
  }
}
