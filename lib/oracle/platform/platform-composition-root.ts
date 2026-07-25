import type {
  OracleGameIntegrationCompositionRegistry,
  OraclePlatformComposition,
} from "./platform-composition";
import {
  createOraclePlatformHealthSnapshot,
  type OraclePlatformHealthSnapshot,
} from "./platform-health";
import { OraclePlatformRuntime } from "./platform-runtime";

export type OraclePlatformCompositionFactory =
  () => OraclePlatformComposition;

export class OraclePlatformCompositionRoot {
  private runtime: OraclePlatformRuntime | null = null;
  private attempt = 0;

  constructor(
    private readonly createComposition: OraclePlatformCompositionFactory
  ) {}

  start(): OraclePlatformHealthSnapshot {
    const existing = this.runtime?.getState();
    if (
      existing &&
      (existing.status === "ready" || existing.status === "degraded")
    ) {
      return createOraclePlatformHealthSnapshot(existing, this.attempt);
    }

    this.attempt += 1;
    this.runtime = new OraclePlatformRuntime(this.createComposition());
    return createOraclePlatformHealthSnapshot(
      this.runtime.start(),
      this.attempt
    );
  }

  recover(): OraclePlatformHealthSnapshot {
    if (this.runtime) {
      try {
        this.runtime.stop();
      } catch {
        // Recovery replaces the failed runtime regardless of shutdown outcome.
      } finally {
        this.runtime = null;
      }
    }
    return this.start();
  }

  stop(): OraclePlatformHealthSnapshot | null {
    if (!this.runtime) return null;
    return createOraclePlatformHealthSnapshot(
      this.runtime.stop(),
      this.attempt
    );
  }

  getHealth(): OraclePlatformHealthSnapshot | null {
    if (!this.runtime) return null;
    return createOraclePlatformHealthSnapshot(
      this.runtime.getState(),
      this.attempt
    );
  }

  getGameIntegrationRegistry(): OracleGameIntegrationCompositionRegistry {
    if (!this.runtime) {
      throw new Error("Oracle Platform composition has not started.");
    }
    return this.runtime.getComposition().gameIntegrations;
  }

  getGuidanceService(): OraclePlatformComposition["guidance"] {
    if (!this.runtime) {
      throw new Error("Oracle Platform composition has not started.");
    }
    return this.runtime.getComposition().guidance;
  }
}
