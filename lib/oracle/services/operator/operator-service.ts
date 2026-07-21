import type {
  OperatorRecord,
  OperatorRepository,
} from "@/lib/oracle/repositories/operator-repository";
import {
  OperatorAuthenticationRequiredError,
  OperatorOwnershipNotEstablishedError,
  OperatorRecordUnavailableError,
  type Operator,
  type OperatorService,
} from "./operator-service-types";

export function createOperatorService(
  repository: OperatorRepository
): OperatorService {
  async function getCurrentOperator(): Promise<Operator> {
    const accountId = await repository.getAuthenticatedAccountId();

    if (!accountId) {
      throw new OperatorAuthenticationRequiredError();
    }

    const operatorId = await repository.findOperatorIdForAccount(accountId);

    if (!operatorId) {
      throw new OperatorOwnershipNotEstablishedError();
    }

    const operator = await repository.findOperatorById(operatorId);

    if (!operator) {
      throw new OperatorRecordUnavailableError(operatorId);
    }

    return projectOperator(operator);
  }

  async function completeCurrentOperatorCommissioning(
    callsign: string
  ): Promise<Operator> {
    const normalizedCallsign = callsign.trim();

    if (!normalizedCallsign) {
      throw new Error("Operator callsign is required.");
    }

    const currentOperator = await getCurrentOperator();
    const commissioned = await repository.commissionOperator(
      currentOperator.id,
      normalizedCallsign
    );

    if (!commissioned) {
      throw new OperatorRecordUnavailableError(currentOperator.id);
    }

    return projectOperator(commissioned);
  }

  return Object.freeze({
    getCurrentOperator,
    completeCurrentOperatorCommissioning,
  });
}

function projectOperator(record: OperatorRecord): Operator {
  return Object.freeze({
    id: record.id,
    email: record.email,
    callsign: record.callsign,
    designation: record.designation,
    primary_game: record.primary_game,
    combat_rating: record.combat_rating,
    xp: record.xp,
    level: record.level,
    total_sessions: record.total_sessions,
    created_at: record.created_at,
  });
}
