import { createOperatorUnderstandingSnapshot } from "../../understanding";
import type { OperatorService } from "../operator";
import type {
  CurrentOperatorUnderstandingRequest,
  OperatorUnderstandingProjectionSource,
  OperatorUnderstandingService,
} from "./operator-understanding-service-types";

export function createOperatorUnderstandingService(
  operatorService: OperatorService,
  source: OperatorUnderstandingProjectionSource,
  policy: Readonly<{ maximumSourceAgeSeconds: number }>
): OperatorUnderstandingService {
  if (
    !Number.isInteger(policy.maximumSourceAgeSeconds) ||
    policy.maximumSourceAgeSeconds < 1
  ) {
    throw new Error(
      "Operator Understanding source freshness policy must be positive."
    );
  }

  return Object.freeze({
    async getCurrentSnapshot(request: CurrentOperatorUnderstandingRequest) {
      const asOf = Date.parse(request.asOf);
      if (!Number.isFinite(asOf)) {
        throw new Error("Operator Understanding request asOf must be a timestamp.");
      }
      const operator = await operatorService.getCurrentOperator();
      const projection = await source.load(operator.id, request);
      if (projection.operatorId !== operator.id) {
        throw new Error(
          "Operator Understanding source crossed authenticated Operator ownership."
        );
      }
      const sourceAge = asOf - Date.parse(projection.sourceUpdatedAt);
      if (
        !Number.isFinite(sourceAge) ||
        sourceAge < 0 ||
        sourceAge > policy.maximumSourceAgeSeconds * 1_000
      ) {
        throw new Error(
          "Operator Understanding source is outside the approved freshness budget."
        );
      }

      return createOperatorUnderstandingSnapshot(
        {
          contract: {
            name: "oracle.operator-understanding-snapshot",
            version: 1,
          },
          operatorId: operator.id,
          generatedAt: request.asOf,
          asOf: request.asOf,
          purpose: request.purpose,
          policySetVersion: projection.policySetVersion,
          identity: projection.identity,
          preferences: projection.preferences,
          goals: projection.goals,
          state: projection.state,
          memory: projection.memory,
          intelligence: projection.intelligence,
          unknowns: projection.unknowns,
        },
        projection.evidenceReferences
      );
    },
  });
}
