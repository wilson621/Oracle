export type OracleLifecycleStage =
  | "initialise"
  | "context"
  | "engine-execution"
  | "graph"
  | "brain"
  | "timeline"
  | "planner"
  | "operator-profile"
  | "explainability"
  | "state"
  | "mission"
  | "complete";

export type OracleLifecycleStep = {
  stage: OracleLifecycleStage;
  title: string;
  description: string;
  order: number;
};

export type OracleLifecycle = {
  version: string;
  steps: OracleLifecycleStep[];
};