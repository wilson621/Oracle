import type { AuthenticatedOracleSessionAuthority } from "../services/sessions";

export const ORACLE_DEVELOPMENT_CONTRACT_VERSION = 1 as const;

export type OracleMissionStatus =
  | "proposed"
  | "accepted"
  | "active"
  | "completed"
  | "abandoned"
  | "superseded"
  | "deleted";

export type OracleCoachingFocus = Readonly<{
  contract: "oracle.coaching-focus";
  contractVersion: 1;
  id: string;
  operatorId: string;
  reportId: string;
  summary: string;
  confidence: number;
  evidenceReferenceIds: readonly string[];
  createdAt: string;
}>;

export type OracleMission = Readonly<{
  contract: "oracle.mission";
  contractVersion: 1;
  id: string;
  operatorId: string;
  reportId: string;
  coachingFocusId: string;
  status: OracleMissionStatus;
  version: number;
  title: string;
  objective: string;
  requiredEvidenceCount: number;
  rewardXp: number;
  createdAt: string;
  updatedAt: string;
  completionId: string | null;
  completionSessionId: string | null;
  completionEvidenceReferenceIds: readonly string[];
}>;

export type OraclePlannerEntry = Readonly<{
  contract: "oracle.planner-entry";
  contractVersion: 1;
  id: string;
  operatorId: string;
  missionId: string;
  priority: 1 | 2 | 3;
  scheduledFor: string;
  rationale: string;
  createdAt: string;
}>;

export type OracleProgressionTransaction = Readonly<{
  contract: "oracle.progression-transaction";
  contractVersion: 1;
  id: string;
  operatorId: string;
  missionId: string;
  completionId: string;
  xp: number;
  evidenceReferenceIds: readonly string[];
  recordedAt: string;
}>;

export type OracleAchievementAward = Readonly<{
  contract: "oracle.achievement-award";
  contractVersion: 1;
  id: string;
  operatorId: string;
  achievementId: string;
  progressionTransactionId: string;
  awardedAt: string;
}>;

export type OracleDevelopmentProgramme = Readonly<{
  contract: "oracle.operator-development-programme";
  contractVersion: 1;
  operatorId: string;
  coachingFocus: OracleCoachingFocus;
  mission: OracleMission;
  plannerEntry: OraclePlannerEntry;
  progressionTransaction: OracleProgressionTransaction | null;
  achievementAwards: readonly OracleAchievementAward[];
  reassessment: Readonly<{
    status: "pending" | "correlated";
    summary: string;
    causalClaim: false;
    evidenceReferenceIds: readonly string[];
    confidence: number;
  }>;
}>;

export type OracleMissionCommand = Readonly<{
  authority: AuthenticatedOracleSessionAuthority;
  missionId: string;
  idempotencyKey: string;
  expectedVersion: number;
  occurredAt: string;
}>;
