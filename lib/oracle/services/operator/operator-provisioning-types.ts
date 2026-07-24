export const OPERATOR_PROVISIONING_CONTRACT = Object.freeze({
  name: "oracle.operator-provisioning-command" as const,
  version: 1 as const,
});

export const OPERATOR_COMMISSIONING_POLICY_CONTRACT = Object.freeze({
  name: "oracle.operator-commissioning-policy" as const,
  version: 1 as const,
});

export type OperatorProvisioningCommand = Readonly<{
  contract: Readonly<{
    name: typeof OPERATOR_PROVISIONING_CONTRACT.name;
    version: typeof OPERATOR_PROVISIONING_CONTRACT.version;
  }>;
  commandId: string;
  callsign: string;
  policyId: string;
  policyVersion: string;
}>;

export type OperatorProvisioningOutcome = "created";

export type OperatorProvisioningResult = Readonly<{
  outcome: OperatorProvisioningOutcome;
  operator: Readonly<{
    id: string;
    email: string | null;
    callsign: string;
    designation: string;
    primary_game: string | null;
    combat_rating: string | null;
    xp: number;
    level: number;
    total_sessions: number;
    created_at: string;
  }>;
}>;

export type OperatorCommissioningPolicy = Readonly<{
  contract: Readonly<{
    name: typeof OPERATOR_COMMISSIONING_POLICY_CONTRACT.name;
    version: typeof OPERATOR_COMMISSIONING_POLICY_CONTRACT.version;
  }>;
  id: string;
  policyVersion: string;
  callsign: Readonly<{
    unicodeNormalization: "none" | "NFC" | "NFKC";
    caseNormalization: "preserve" | "lowercase" | "uppercase";
    minimumLength: number;
    maximumLength: number;
    allowedPattern: string | null;
    reserved: readonly string[];
    reservedComparison: "case-sensitive" | "case-insensitive";
    uniqueness: "not-required" | "global";
  }>;
}>;

export class OperatorCommissioningPolicyUnavailableError extends Error {
  readonly code = "OPERATOR_COMMISSIONING_POLICY_UNAVAILABLE";

  constructor() {
    super("Operator commissioning policy is unavailable.");
    this.name = "OperatorCommissioningPolicyUnavailableError";
  }
}

export class OperatorProvisioningCommandInvalidError extends Error {
  readonly code = "OPERATOR_PROVISIONING_COMMAND_INVALID";

  constructor(message: string) {
    super(message);
    this.name = "OperatorProvisioningCommandInvalidError";
  }
}

export function createOperatorProvisioningCommand(
  value: unknown,
  policy: OperatorCommissioningPolicy
): OperatorProvisioningCommand {
  const validatedPolicy = createOperatorCommissioningPolicy(policy);
  if (!isRecord(value) || !isRecord(value.contract)) {
    throw new OperatorProvisioningCommandInvalidError(
      "Operator provisioning command is invalid."
    );
  }

  if (
    value.contract.name !== OPERATOR_PROVISIONING_CONTRACT.name ||
    value.contract.version !== OPERATOR_PROVISIONING_CONTRACT.version
  ) {
    throw new OperatorProvisioningCommandInvalidError(
      "Operator provisioning contract identity is unsupported."
    );
  }

  const commandId = requireUuid(value.commandId, "commandId");
  const policyId = requireNonEmptyString(value.policyId, "policyId");
  const policyVersion = requireNonEmptyString(
    value.policyVersion,
    "policyVersion"
  );

  if (
    policyId !== validatedPolicy.id ||
    policyVersion !== validatedPolicy.policyVersion
  ) {
    throw new OperatorProvisioningCommandInvalidError(
      "Operator commissioning policy identity does not match."
    );
  }

  if (typeof value.callsign !== "string") {
    throw new OperatorProvisioningCommandInvalidError(
      "Operator callsign is invalid."
    );
  }

  const callsign = normalizeCallsign(
    value.callsign,
    validatedPolicy.callsign
  );
  if (!isCallsignAllowed(callsign, validatedPolicy.callsign)) {
    throw new OperatorProvisioningCommandInvalidError(
      "Operator callsign does not satisfy the approved policy."
    );
  }

  return Object.freeze({
    contract: Object.freeze({ ...OPERATOR_PROVISIONING_CONTRACT }),
    commandId,
    callsign,
    policyId,
    policyVersion,
  });
}

export function createOperatorCommissioningPolicy(
  value: unknown
): OperatorCommissioningPolicy {
  if (
    !isRecord(value) ||
    !isRecord(value.contract) ||
    !isRecord(value.callsign) ||
    value.contract.name !== OPERATOR_COMMISSIONING_POLICY_CONTRACT.name ||
    value.contract.version !== OPERATOR_COMMISSIONING_POLICY_CONTRACT.version
  ) {
    throw new OperatorProvisioningCommandInvalidError(
      "Operator commissioning policy is invalid."
    );
  }

  const minimumLength = requirePositiveInteger(
    value.callsign.minimumLength,
    "callsign.minimumLength"
  );
  const maximumLength = requirePositiveInteger(
    value.callsign.maximumLength,
    "callsign.maximumLength"
  );
  if (minimumLength > maximumLength) {
    throw new OperatorProvisioningCommandInvalidError(
      "Operator commissioning callsign bounds are invalid."
    );
  }

  const allowedPattern = value.callsign.allowedPattern;
  if (allowedPattern !== null && typeof allowedPattern !== "string") {
    throw new OperatorProvisioningCommandInvalidError(
      "Operator commissioning callsign pattern is invalid."
    );
  }
  if (allowedPattern !== null) {
    try {
      new RegExp(allowedPattern, "u");
    } catch {
      throw new OperatorProvisioningCommandInvalidError(
        "Operator commissioning callsign pattern is invalid."
      );
    }
  }

  if (
    !Array.isArray(value.callsign.reserved) ||
    value.callsign.reserved.some(
      (item) => typeof item !== "string" || item.length === 0
    )
  ) {
    throw new OperatorProvisioningCommandInvalidError(
      "Operator commissioning reserved callsigns are invalid."
    );
  }

  const unicodeNormalization = requireMember(
    value.callsign.unicodeNormalization,
    ["none", "NFC", "NFKC"] as const,
    "callsign.unicodeNormalization"
  );
  const caseNormalization = requireMember(
    value.callsign.caseNormalization,
    ["preserve", "lowercase", "uppercase"] as const,
    "callsign.caseNormalization"
  );
  const reservedComparison = requireMember(
    value.callsign.reservedComparison,
    ["case-sensitive", "case-insensitive"] as const,
    "callsign.reservedComparison"
  );
  const uniqueness = requireMember(
    value.callsign.uniqueness,
    ["not-required", "global"] as const,
    "callsign.uniqueness"
  );

  return Object.freeze({
    contract: Object.freeze({ ...OPERATOR_COMMISSIONING_POLICY_CONTRACT }),
    id: requireNonEmptyString(value.id, "policy.id"),
    policyVersion: requireNonEmptyString(
      value.policyVersion,
      "policy.policyVersion"
    ),
    callsign: Object.freeze({
      unicodeNormalization,
      caseNormalization,
      minimumLength,
      maximumLength,
      allowedPattern,
      reserved: Object.freeze([...(value.callsign.reserved as string[])]),
      reservedComparison,
      uniqueness,
    }),
  });
}

function normalizeCallsign(
  value: string,
  policy: OperatorCommissioningPolicy["callsign"]
): string {
  let normalized = value.trim();
  if (policy.unicodeNormalization !== "none") {
    normalized = normalized.normalize(policy.unicodeNormalization);
  }
  if (policy.caseNormalization === "lowercase") {
    normalized = normalized.toLocaleLowerCase("en-US");
  } else if (policy.caseNormalization === "uppercase") {
    normalized = normalized.toLocaleUpperCase("en-US");
  }
  return normalized;
}

function isCallsignAllowed(
  value: string,
  policy: OperatorCommissioningPolicy["callsign"]
): boolean {
  const length = [...value].length;
  if (length < policy.minimumLength || length > policy.maximumLength) {
    return false;
  }
  if (policy.allowedPattern !== null && !new RegExp(
    policy.allowedPattern,
    "u"
  ).test(value)) {
    return false;
  }

  const comparisonValue = policy.reservedComparison === "case-insensitive"
    ? value.toLocaleLowerCase("en-US")
    : value;
  return !policy.reserved.some((reserved) => {
    const comparisonReserved =
      policy.reservedComparison === "case-insensitive"
        ? reserved.toLocaleLowerCase("en-US")
        : reserved;
    return comparisonReserved === comparisonValue;
  });
}

function requireNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new OperatorProvisioningCommandInvalidError(
      `Operator provisioning ${field} is invalid.`
    );
  }

  return value;
}

function requireUuid(value: unknown, field: string): string {
  const candidate = requireNonEmptyString(value, field);
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      candidate
    )
  ) {
    throw new OperatorProvisioningCommandInvalidError(
      `Operator provisioning ${field} must be a UUID.`
    );
  }

  return candidate.toLowerCase();
}

function requirePositiveInteger(value: unknown, field: string): number {
  if (!Number.isInteger(value) || (value as number) < 1) {
    throw new OperatorProvisioningCommandInvalidError(
      `Operator provisioning ${field} is invalid.`
    );
  }
  return value as number;
}

function requireMember<const T extends readonly string[]>(
  value: unknown,
  allowed: T,
  field: string
): T[number] {
  if (typeof value !== "string" || !allowed.includes(value)) {
    throw new OperatorProvisioningCommandInvalidError(
      `Operator provisioning ${field} is invalid.`
    );
  }
  return value as T[number];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
