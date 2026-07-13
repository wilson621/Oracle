import type { CompanionEvent } from "./companion-events";
import {
  createInitialCompanionRuntimeState,
  type CompanionRuntimeState,
} from "./companion-state";
import type {
  CompanionContext,
  CompanionOverlayMode,
} from "./companion-types";

export class CompanionRuntime {
  private state: CompanionRuntimeState;

  private readonly events: CompanionEvent[] = [];

  constructor() {
    this.state = createInitialCompanionRuntimeState();
  }

  getState(): CompanionRuntimeState {
    return this.state;
  }

  getContext(): CompanionContext | null {
    return this.state.context;
  }

  getEvents(): CompanionEvent[] {
    return [...this.events];
  }

  start(): void {
    this.updateState({
      status: "ready",
    });
  }

  stop(): void {
    this.updateState({
      status: "stopped",
    });
  }

  pause(): void {
    this.updateState({
      status: "paused",
    });
  }

  resume(): void {
    this.updateState({
      status: "running",
    });
  }

  setOverlayMode(mode: CompanionOverlayMode): void {
    this.updateState({
      overlayMode: mode,
    });
  }

  setContext(context: CompanionContext): void {
    this.updateState({
      context,
    });
  }

  publish(event: CompanionEvent): void {
    this.events.push(event);
  }

  clearEvents(): void {
    this.events.length = 0;
  }

  private updateState(
    update: Partial<CompanionRuntimeState>
  ): void {
    this.state = {
      ...this.state,
      ...update,
      updatedAt: new Date().toISOString(),
    };
  }
}