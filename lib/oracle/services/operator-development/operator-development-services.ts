import { createHash } from "node:crypto";
import {
  createOracleDevelopmentProgramme,
  type OracleAchievementAward,
  type OracleCoachingFocus,
  type OracleDevelopmentProgramme,
  type OracleMission,
  type OracleMissionCommand,
  type OraclePlannerEntry,
  type OracleProgressionTransaction,
} from "../../development";
import type { OracleDevelopmentRepository } from "../../repositories/operator-development-repository";
import type { OracleSessionReportRepository } from "../../repositories/session-report-repository";
import { OracleSessionService } from "../sessions";

export class OracleAICoachService {
  createFocus(
    operatorId: string,
    report: Awaited<ReturnType<OracleSessionReportRepository["findById"]>>,
    createdAt: string
  ): OracleCoachingFocus {
    if (!report || report.operatorId !== operatorId) {
      throw new Error("AI Coach requires an authorised Session Report.");
    }
    return Object.freeze({
      contract: "oracle.coaching-focus",
      contractVersion: 1,
      id: digest(`focus|${operatorId}|${report.id}`),
      operatorId,
      reportId: report.id,
      summary: report.recommendation.summary,
      confidence: report.recommendation.confidence,
      evidenceReferenceIds: Object.freeze([
        ...report.recommendation.evidenceReferenceIds,
      ]),
      createdAt,
    });
  }
}

export class OracleMissionGenerationEngine {
  generate(focus: OracleCoachingFocus, occurredAt: string): OracleMission {
    return Object.freeze({
      contract: "oracle.mission",
      contractVersion: 1,
      id: digest(`mission|${focus.operatorId}|${focus.id}`),
      operatorId: focus.operatorId,
      reportId: focus.reportId,
      coachingFocusId: focus.id,
      status: "proposed",
      version: 1,
      title: "Evidence-Bound Improvement Mission",
      objective: focus.summary,
      requiredEvidenceCount: 1,
      rewardXp: 100,
      createdAt: occurredAt,
      updatedAt: occurredAt,
      completionId: null,
      completionSessionId: null,
      completionEvidenceReferenceIds: Object.freeze([]),
    });
  }
}

export class OraclePlannerService {
  project(mission: OracleMission, createdAt: string): OraclePlannerEntry {
    return Object.freeze({
      contract: "oracle.planner-entry",
      contractVersion: 1,
      id: digest(`planner|${mission.operatorId}|${mission.id}`),
      operatorId: mission.operatorId,
      missionId: mission.id,
      priority: 1,
      scheduledFor: createdAt,
      rationale: "Highest-priority evidence-bound Session recommendation.",
      createdAt,
    });
  }
}

export class OracleProgressionService {
  private readonly completionTransactions = new Map<
    string,
    Readonly<{
      transaction: OracleProgressionTransaction;
      awards: readonly OracleAchievementAward[];
    }>
  >();

  award(
    mission: OracleMission,
    completionId: string,
    evidenceReferenceIds: readonly string[],
    recordedAt: string
  ) {
    if (mission.status !== "completed" || mission.completionId !== completionId) {
      throw new Error("Progression requires authoritative Mission completion.");
    }
    const key = `${mission.operatorId}|${completionId}`;
    const replay = this.completionTransactions.get(key);
    if (replay) return replay;
    const transaction: OracleProgressionTransaction = Object.freeze({
      contract: "oracle.progression-transaction",
      contractVersion: 1,
      id: digest(`progression|${key}`),
      operatorId: mission.operatorId,
      missionId: mission.id,
      completionId,
      xp: mission.rewardXp,
      evidenceReferenceIds: Object.freeze([...new Set(evidenceReferenceIds)]),
      recordedAt,
    });
    const award: OracleAchievementAward = Object.freeze({
      contract: "oracle.achievement-award",
      contractVersion: 1,
      id: digest(`achievement|${mission.operatorId}|first-mission`),
      operatorId: mission.operatorId,
      achievementId: "first-evidence-bound-mission",
      progressionTransactionId: transaction.id,
      awardedAt: recordedAt,
    });
    const result = Object.freeze({
      transaction,
      awards: Object.freeze([award]),
    });
    this.completionTransactions.set(key, result);
    return result;
  }
}

export class OracleMissionService {
  private readonly commandResults = new Map<string, OracleDevelopmentProgramme>();

  constructor(
    private readonly reports: OracleSessionReportRepository,
    private readonly sessions: OracleSessionService,
    private readonly repository: OracleDevelopmentRepository,
    private readonly coach: OracleAICoachService,
    private readonly engine: OracleMissionGenerationEngine,
    private readonly planner: OraclePlannerService,
    private readonly progression: OracleProgressionService
  ) {}

  async propose(
    authority: OracleMissionCommand["authority"],
    reportId: string,
    occurredAt: string
  ): Promise<OracleDevelopmentProgramme> {
    const existing = await this.repository.findByReport(
      authority.operatorId,
      reportId
    );
    if (existing) return existing;
    const report = await this.reports.findById(authority.operatorId, reportId);
    const focus = this.coach.createFocus(authority.operatorId, report, occurredAt);
    const mission = this.engine.generate(focus, occurredAt);
    const programme = createOracleDevelopmentProgramme({
      contract: "oracle.operator-development-programme",
      contractVersion: 1,
      operatorId: authority.operatorId,
      coachingFocus: focus,
      mission,
      plannerEntry: this.planner.project(mission, occurredAt),
      progressionTransaction: null,
      achievementAwards: [],
      reassessment: {
        status: "pending",
        summary: "Effectiveness is unknown until later verified Session Evidence.",
        causalClaim: false,
        evidenceReferenceIds: [],
        confidence: 0,
      },
    });
    return this.repository.save(programme, null);
  }

  async accept(command: OracleMissionCommand) {
    return this.transition(command, ["proposed"], "active");
  }

  async complete(
    command: OracleMissionCommand &
      Readonly<{
        completionId: string;
        sessionId: string;
        evidenceReferenceIds: readonly string[];
      }>
  ) {
    const replay = this.commandResults.get(commandKey(command));
    if (replay) return replay;
    const current = await this.requireCurrent(command);
    if (current.mission.status === "completed") {
      if (current.mission.completionId === command.completionId) return current;
      throw new Error("Mission already completed by another completion.");
    }
    if (current.mission.status !== "active") {
      throw new Error("Only an active Mission can complete.");
    }
    const session = await this.sessions.getCompletedSession(
      command.authority,
      command.sessionId
    );
    if (!session) throw new Error("Mission completion Session is unavailable.");
    const admitted = new Set(session.evidence.map(({ id }) => id));
    const evidence = [...new Set(command.evidenceReferenceIds)];
    if (
      evidence.length < current.mission.requiredEvidenceCount ||
      evidence.some((id) => !admitted.has(id))
    ) {
      throw new Error("Mission completion requires verified admitted Evidence.");
    }
    const mission: OracleMission = Object.freeze({
      ...current.mission,
      status: "completed",
      version: current.mission.version + 1,
      updatedAt: command.occurredAt,
      completionId: command.completionId,
      completionSessionId: session.id,
      completionEvidenceReferenceIds: Object.freeze(evidence),
    });
    const awarded = this.progression.award(
      mission,
      command.completionId,
      evidence,
      command.occurredAt
    );
    const next = createOracleDevelopmentProgramme({
      ...current,
      mission,
      progressionTransaction: awarded.transaction,
      achievementAwards: awarded.awards,
      reassessment: {
        status: "correlated",
        summary:
          "Mission completion correlates with later verified Session Evidence; causation is not established.",
        causalClaim: false,
        evidenceReferenceIds: Object.freeze(evidence),
        confidence: current.coachingFocus.confidence,
      },
    });
    const committed = await this.repository.save(next, current.mission.version);
    this.commandResults.set(commandKey(command), committed);
    return committed;
  }

  private async transition(
    command: OracleMissionCommand,
    allowed: readonly OracleMission["status"][],
    status: OracleMission["status"]
  ) {
    const replay = this.commandResults.get(commandKey(command));
    if (replay) return replay;
    const current = await this.requireCurrent(command);
    if (!allowed.includes(current.mission.status)) {
      throw new Error(`Mission cannot transition from '${current.mission.status}'.`);
    }
    const next = createOracleDevelopmentProgramme({
      ...current,
      mission: {
        ...current.mission,
        status,
        version: current.mission.version + 1,
        updatedAt: command.occurredAt,
      },
    });
    const committed = await this.repository.save(next, current.mission.version);
    this.commandResults.set(commandKey(command), committed);
    return committed;
  }

  private async requireCurrent(command: OracleMissionCommand) {
    const current = await this.repository.find(
      command.authority.operatorId,
      command.missionId
    );
    if (!current) throw new Error("Oracle Mission does not exist.");
    if (current.mission.version !== command.expectedVersion) {
      throw new Error("Oracle Mission command has a stale expected version.");
    }
    return current;
  }
}

function commandKey(command: OracleMissionCommand) {
  return `${command.authority.operatorId}|${command.idempotencyKey}`;
}

function digest(value: string) {
  return createHash("sha256").update(value).digest("hex");
}
