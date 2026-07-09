import { DEFAULT_ORACLE_LIFECYCLE } from "./default-lifecycle";
import type {
  OracleLifecycle,
  OracleLifecycleStage,
} from "./lifecycle-types";

export function getOracleLifecycle(): OracleLifecycle {
  return DEFAULT_ORACLE_LIFECYCLE;
}

export function getLifecycleStep(stage: OracleLifecycleStage) {
  return DEFAULT_ORACLE_LIFECYCLE.steps.find(
    (step) => step.stage === stage
  );
}

export function getLifecycleOrder(stage: OracleLifecycleStage): number {
  return (
    DEFAULT_ORACLE_LIFECYCLE.steps.find(
      (step) => step.stage === stage
    )?.order ?? 999
  );
}