import type {
  OperatorUnderstandingPurpose,
  OperatorUnderstandingSnapshot,
} from "../../understanding";

export type CurrentOperatorUnderstandingRequest = Readonly<{
  purpose: OperatorUnderstandingPurpose;
  asOf: string;
  applicationId: string | null;
  gameIntegration: Readonly<{
    id: string;
    version: string;
  }> | null;
}>;

/**
 * Authenticated read-projection boundary. Implementations must resolve the
 * current Operator through Operator Service and must not accept an arbitrary
 * Operator identifier from an Application.
 */
export type OperatorUnderstandingService = Readonly<{
  getCurrentSnapshot(
    request: CurrentOperatorUnderstandingRequest
  ): Promise<OperatorUnderstandingSnapshot>;
}>;
