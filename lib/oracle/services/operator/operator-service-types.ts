import type {
  OperatorCommissioningPolicy,
  OperatorProvisioningResult,
} from "./operator-provisioning-types";

export const OPERATOR_ACCESS_POLICY = Object.freeze({
  mode: "authenticated-account" as const,
  appliesTo: Object.freeze([
    "production",
    "development",
    "test",
  ] as const),
  allowsSharedFallback: false,
});

export type Operator = Readonly<{
  id: string;
  email: string | null;
  callsign: string | null;
  designation: string | null;
  primary_game: string | null;
  combat_rating: string | null;
  xp: number;
  level: number;
  total_sessions: number;
  created_at: string;
}>;

export class OperatorAuthenticationRequiredError extends Error {
  readonly code = "OPERATOR_AUTHENTICATION_REQUIRED";

  constructor() {
    super(
      "An authenticated Supabase Account is required to resolve the current Operator in every environment, including local development."
    );
    this.name = "OperatorAuthenticationRequiredError";
  }
}

export class OperatorOwnershipNotEstablishedError extends Error {
  readonly code = "OPERATOR_OWNERSHIP_NOT_ESTABLISHED";

  constructor() {
    super("No Operator ownership is established for the authenticated Account.");
    this.name = "OperatorOwnershipNotEstablishedError";
  }
}

export class OperatorRecordUnavailableError extends Error {
  readonly code = "OPERATOR_RECORD_UNAVAILABLE";

  constructor(operatorId: string) {
    super(`The authorised Operator ${operatorId} is unavailable.`);
    this.name = "OperatorRecordUnavailableError";
  }
}

export type OperatorService = Readonly<{
  getCurrentOperator(): Promise<Operator>;
  provisionCurrentOperator(
    command: unknown,
    policy: OperatorCommissioningPolicy | null
  ): Promise<OperatorProvisioningResult>;
}>;

export type {
  OperatorCommissioningPolicy,
  OperatorProvisioningResult,
};
