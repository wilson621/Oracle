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
import {
  createOperatorProvisioningCommand,
  OperatorCommissioningPolicyUnavailableError,
} from "./operator-provisioning-types";

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

  async function provisionCurrentOperator(
    command: unknown,
    policy: Parameters<OperatorService["provisionCurrentOperator"]>[1]
  ) {
    if (!policy) {
      throw new OperatorCommissioningPolicyUnavailableError();
    }

    const accountId = await repository.getAuthenticatedAccountId();
    if (!accountId) {
      throw new OperatorAuthenticationRequiredError();
    }

    const validated = createOperatorProvisioningCommand(command, policy);
    return repository.provisionOperator(accountId, validated, policy);
  }

  return Object.freeze({
    getCurrentOperator,
    provisionCurrentOperator,
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
