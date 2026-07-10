export type EngineHealthStatus =
  | "healthy"
  | "warning"
  | "degraded"
  | "failed";

export type EngineHealthReason = {
  code: string;
  message: string;
};

export type EngineHealth = {
  status: EngineHealthStatus;

  score: number;

  reasons: EngineHealthReason[];
};