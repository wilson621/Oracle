import type {
  OracleDevelopmentProgramme,
  OracleMission,
} from "./operator-development-types";

export function createOracleMission(value: OracleMission): OracleMission {
  if (
    value.contract !== "oracle.mission" ||
    value.contractVersion !== 1 ||
    !value.id ||
    !value.operatorId ||
    !value.reportId ||
    !value.coachingFocusId ||
    !Number.isInteger(value.version) ||
    value.version < 1 ||
    !Number.isInteger(value.requiredEvidenceCount) ||
    value.requiredEvidenceCount < 1 ||
    !Number.isInteger(value.rewardXp) ||
    value.rewardXp < 0 ||
    !Number.isFinite(Date.parse(value.createdAt)) ||
    !Number.isFinite(Date.parse(value.updatedAt))
  ) {
    throw new Error("Oracle Mission contract is invalid.");
  }
  if (
    value.status === "completed" &&
    (!value.completionId ||
      !value.completionSessionId ||
      value.completionEvidenceReferenceIds.length < value.requiredEvidenceCount)
  ) {
    throw new Error("Completed Mission requires verified Evidence.");
  }
  return deepFreeze(structuredClone(value));
}

export function createOracleDevelopmentProgramme(
  value: OracleDevelopmentProgramme
): OracleDevelopmentProgramme {
  if (
    value.contract !== "oracle.operator-development-programme" ||
    value.contractVersion !== 1 ||
    value.operatorId !== value.mission.operatorId ||
    value.operatorId !== value.coachingFocus.operatorId ||
    value.operatorId !== value.plannerEntry.operatorId ||
    value.reassessment.causalClaim !== false
  ) {
    throw new Error("Operator Development Programme contract is invalid.");
  }
  createOracleMission(value.mission);
  return deepFreeze(structuredClone(value));
}

function deepFreeze<Value>(value: Value): Value {
  if (value && typeof value === "object") {
    Object.freeze(value);
    for (const nested of Object.values(value)) deepFreeze(nested);
  }
  return value;
}
