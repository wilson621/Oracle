import type {
  CompanionContext,
  CompanionDiscovery,
  CompanionOverlayMode,
} from "./companion-types";

export type CompanionEvent =
  | CompanionGameDetectedEvent
  | CompanionGameClosedEvent
  | CompanionOverlayModeChangedEvent
  | CompanionDiscoveryDetectedEvent
  | CompanionQuestUpdatedEvent
  | CompanionObjectiveUpdatedEvent
  | CompanionHintRequestedEvent;

type CompanionBaseEvent = {
  id: string;
  timestamp: string;
};

export type CompanionGameDetectedEvent = CompanionBaseEvent & {
  type: "game.detected";
  context: CompanionContext;
};

export type CompanionGameClosedEvent = CompanionBaseEvent & {
  type: "game.closed";
};

export type CompanionOverlayModeChangedEvent = CompanionBaseEvent & {
  type: "overlay.mode.changed";
  mode: CompanionOverlayMode;
};

export type CompanionDiscoveryDetectedEvent = CompanionBaseEvent & {
  type: "discovery.detected";
  discovery: CompanionDiscovery;
};

export type CompanionQuestUpdatedEvent = CompanionBaseEvent & {
  type: "quest.updated";
  quest: string;
};

export type CompanionObjectiveUpdatedEvent = CompanionBaseEvent & {
  type: "objective.updated";
  objective: string;
};

export type CompanionHintRequestedEvent = CompanionBaseEvent & {
  type: "hint.requested";
  level: 1 | 2 | 3 | 4;
};