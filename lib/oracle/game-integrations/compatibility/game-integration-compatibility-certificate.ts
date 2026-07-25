export const ORACLE_GAME_INTEGRATION_COMPATIBILITY_CERTIFICATE =
  "oracle.game-integration-compatibility-certificate";
export const ORACLE_GAME_INTEGRATION_COMPATIBILITY_CERTIFICATE_VERSION = 1;
export const ORACLE_GAME_INTEGRATION_MAXIMUM_CERTIFICATE_AGE_MS =
  90 * 24 * 60 * 60 * 1_000;

export type OracleGameIntegrationCertificateState =
  | "certified"
  | "provisionally-certified"
  | "expired"
  | "revoked";

export type OracleGameIntegrationCapability =
  | "detection"
  | "context"
  | "observation"
  | "guidance"
  | "transient-progress";

export type OracleGameIntegrationDisplayMode =
  | "windowed"
  | "borderless-windowed";

export type OracleGameIntegrationPlayerMode =
  "single-player";

export type OracleGameIntegrationCompatibilityProfile =
  Readonly<{
    gameId: string;
    edition: string;
    gameVersion: string;
    operatingSystem: "win32";
    executableNames: readonly string[];
    locales: readonly string[];
    displayModes:
      readonly OracleGameIntegrationDisplayMode[];
    minimumWindowBounds: Readonly<{
      width: number;
      height: number;
    }>;
    uiScales: readonly number[];
    playerModes:
      readonly OracleGameIntegrationPlayerMode[];
    observationMethod:
      "attached-window-local-pixels";
  }>;

export type OracleGameIntegrationPolicySource =
  Readonly<{
    url: string;
    reviewedAt: string;
  }>;

export type OracleGameIntegrationCompatibilityCertificate =
  Readonly<{
    contract: Readonly<{
      name:
        typeof ORACLE_GAME_INTEGRATION_COMPATIBILITY_CERTIFICATE;
      version:
        typeof ORACLE_GAME_INTEGRATION_COMPATIBILITY_CERTIFICATE_VERSION;
    }>;
    certificateId: string;
    integrationId: string;
    integrationVersion: string;
    state: OracleGameIntegrationCertificateState;
    profile: OracleGameIntegrationCompatibilityProfile;
    capabilities:
      readonly OracleGameIntegrationCapability[];
    verifiedCapabilities:
      readonly OracleGameIntegrationCapability[];
    uncertainCapabilities:
      readonly OracleGameIntegrationCapability[];
    policySources:
      readonly OracleGameIntegrationPolicySource[];
    issuedAt: string;
    expiresAt: string;
    stateReason: string;
  }>;

export type OracleGameIntegrationRuntimeProfile =
  Readonly<{
    gameId: string;
    edition: string;
    gameVersion: string;
    operatingSystem: NodeJS.Platform;
    executableName: string;
    locale: string;
    displayMode: string;
    windowBounds: Readonly<{
      width: number;
      height: number;
    }>;
    uiScale: number;
    playerMode: string;
    observationMethod: string;
  }>;

export type OracleGameIntegrationCompatibilityResolution =
  Readonly<{
    certificateId: string;
    declaredState: OracleGameIntegrationCertificateState;
    effectiveState: OracleGameIntegrationCertificateState;
    exactProfileMatch: boolean;
    eligibleCapabilities:
      readonly OracleGameIntegrationCapability[];
    disabledCapabilities:
      readonly OracleGameIntegrationCapability[];
    reason: string;
  }>;

const CAPABILITIES:
  readonly OracleGameIntegrationCapability[] =
    Object.freeze([
      "detection",
      "context",
      "observation",
      "guidance",
      "transient-progress",
    ]);

const STATES:
  readonly OracleGameIntegrationCertificateState[] =
    Object.freeze([
      "certified",
      "provisionally-certified",
      "expired",
      "revoked",
    ]);

export function createOracleGameIntegrationCompatibilityCertificate(
  input: OracleGameIntegrationCompatibilityCertificate
): OracleGameIntegrationCompatibilityCertificate {
  if (!isRecord(input)) {
    throw new Error(
      "Game Integration compatibility certificate must be a plain record."
    );
  }
  if (
    input.contract?.name !==
      ORACLE_GAME_INTEGRATION_COMPATIBILITY_CERTIFICATE ||
    input.contract.version !==
      ORACLE_GAME_INTEGRATION_COMPATIBILITY_CERTIFICATE_VERSION
  ) {
    throw new Error(
      "Game Integration compatibility certificate contract is invalid."
    );
  }
  assertIdentity(input.certificateId, "certificateId");
  assertIdentity(input.integrationId, "integrationId");
  assertIdentity(input.integrationVersion, "integrationVersion");
  if (!STATES.includes(input.state)) {
    throw new Error(
      "Game Integration compatibility certificate state is invalid."
    );
  }

  const profile = createProfile(input.profile);
  const capabilities = createCapabilitySet(
    input.capabilities,
    "capabilities",
    false
  );
  const verifiedCapabilities = createCapabilitySet(
    input.verifiedCapabilities,
    "verifiedCapabilities",
    true
  );
  const uncertainCapabilities = createCapabilitySet(
    input.uncertainCapabilities,
    "uncertainCapabilities",
    true
  );
  assertCapabilityLifecycle(
    input.state,
    capabilities,
    verifiedCapabilities,
    uncertainCapabilities
  );

  const issuedAt = requireTimestamp(input.issuedAt, "issuedAt");
  const expiresAt = requireTimestamp(input.expiresAt, "expiresAt");
  const lifetime = Date.parse(expiresAt) - Date.parse(issuedAt);
  if (
    lifetime <= 0 ||
    lifetime >
      ORACLE_GAME_INTEGRATION_MAXIMUM_CERTIFICATE_AGE_MS
  ) {
    throw new Error(
      "Game Integration compatibility certificate exceeds the 90-day review interval."
    );
  }
  if (
    !Array.isArray(input.policySources) ||
    input.policySources.length === 0
  ) {
    throw new Error(
      "Game Integration compatibility certificate requires policy sources."
    );
  }
  const policySources = input.policySources.map((source) => {
    if (
      !isRecord(source) ||
      typeof source.url !== "string" ||
      typeof source.reviewedAt !== "string" ||
      !/^https:\/\//u.test(source.url)
    ) {
      throw new Error(
        "Game Integration compatibility policy source URL is invalid."
      );
    }
    return Object.freeze({
      url: source.url,
      reviewedAt: requireTimestamp(
        source.reviewedAt,
        "policySources.reviewedAt"
      ),
    });
  });
  if (
    typeof input.stateReason !== "string" ||
    input.stateReason.trim().length === 0
  ) {
    throw new Error(
      "Game Integration compatibility certificate requires a state reason."
    );
  }

  return deepFreeze({
    contract: {
      name:
        ORACLE_GAME_INTEGRATION_COMPATIBILITY_CERTIFICATE,
      version:
        ORACLE_GAME_INTEGRATION_COMPATIBILITY_CERTIFICATE_VERSION,
    },
    certificateId: input.certificateId,
    integrationId: input.integrationId,
    integrationVersion: input.integrationVersion,
    state: input.state,
    profile,
    capabilities,
    verifiedCapabilities,
    uncertainCapabilities,
    policySources,
    issuedAt,
    expiresAt,
    stateReason: input.stateReason.trim(),
  });
}

export function resolveOracleGameIntegrationCompatibility(
  certificate: OracleGameIntegrationCompatibilityCertificate,
  runtimeProfile: OracleGameIntegrationRuntimeProfile,
  evaluatedAt: string
): OracleGameIntegrationCompatibilityResolution {
  const validated =
    createOracleGameIntegrationCompatibilityCertificate(certificate);
  const now = requireTimestamp(evaluatedAt, "evaluatedAt");
  const exactProfileMatch = matchesProfile(
    validated.profile,
    runtimeProfile
  );
  const effectiveState =
    validated.state === "revoked"
      ? "revoked"
      : Date.parse(now) >= Date.parse(validated.expiresAt)
        ? "expired"
        : validated.state;

  const eligibleCapabilities =
    !exactProfileMatch ||
    effectiveState === "expired" ||
    effectiveState === "revoked"
      ? []
      : effectiveState === "provisionally-certified"
        ? [...validated.verifiedCapabilities]
        : [...validated.capabilities];
  const eligible = new Set(eligibleCapabilities);
  const disabledCapabilities =
    validated.capabilities.filter(
      (capability) => !eligible.has(capability)
    );

  return deepFreeze({
    certificateId: validated.certificateId,
    declaredState: validated.state,
    effectiveState,
    exactProfileMatch,
    eligibleCapabilities,
    disabledCapabilities,
    reason: createResolutionReason({
      effectiveState,
      exactProfileMatch,
      disabledCapabilities,
    }),
  });
}

function createProfile(
  input: OracleGameIntegrationCompatibilityProfile
): OracleGameIntegrationCompatibilityProfile {
  if (!isRecord(input)) {
    throw new Error(
      "Game Integration compatibility profile must be a plain record."
    );
  }
  assertIdentity(input.gameId, "profile.gameId");
  assertIdentity(input.edition, "profile.edition");
  assertIdentity(input.gameVersion, "profile.gameVersion");
  if (input.operatingSystem !== "win32") {
    throw new Error(
      "Sprint 27 compatibility profiles are Windows-only."
    );
  }
  const executableNames = createStringSet(
    input.executableNames,
    "profile.executableNames"
  ).map((value) => value.toLowerCase());
  const locales = createStringSet(
    input.locales,
    "profile.locales"
  );
  const displayModes = createStringSet(
    input.displayModes,
    "profile.displayModes"
  );
  if (
    displayModes.some(
      (mode) =>
        mode !== "windowed" &&
        mode !== "borderless-windowed"
    )
  ) {
    throw new Error(
      "Game Integration compatibility display mode is invalid."
    );
  }
  if (
    !isRecord(input.minimumWindowBounds) ||
    !Number.isInteger(input.minimumWindowBounds.width) ||
    !Number.isInteger(input.minimumWindowBounds.height) ||
    input.minimumWindowBounds.width < 1 ||
    input.minimumWindowBounds.height < 1
  ) {
    throw new Error(
      "Game Integration minimum window bounds are invalid."
    );
  }
  if (
    !Array.isArray(input.uiScales) ||
    input.uiScales.length === 0 ||
    input.uiScales.some(
      (scale) => !Number.isInteger(scale) || scale < 1
    ) ||
    new Set(input.uiScales).size !== input.uiScales.length
  ) {
    throw new Error(
      "Game Integration compatibility UI scales are invalid."
    );
  }
  const playerModes = createStringSet(
    input.playerModes,
    "profile.playerModes"
  );
  if (
    playerModes.some(
      (mode) => mode !== "single-player"
    )
  ) {
    throw new Error(
      "Sprint 27 compatibility profiles are single-player only."
    );
  }
  if (
    input.observationMethod !==
      "attached-window-local-pixels"
  ) {
    throw new Error(
      "Game Integration observation method is outside the approved boundary."
    );
  }
  return deepFreeze({
    gameId: input.gameId,
    edition: input.edition,
    gameVersion: input.gameVersion,
    operatingSystem: "win32",
    executableNames,
    locales,
    displayModes:
      displayModes as OracleGameIntegrationDisplayMode[],
    minimumWindowBounds: {
      width: input.minimumWindowBounds.width,
      height: input.minimumWindowBounds.height,
    },
    uiScales: [...input.uiScales],
    playerModes:
      playerModes as OracleGameIntegrationPlayerMode[],
    observationMethod:
      "attached-window-local-pixels",
  });
}

function assertCapabilityLifecycle(
  state: OracleGameIntegrationCertificateState,
  capabilities: readonly OracleGameIntegrationCapability[],
  verified: readonly OracleGameIntegrationCapability[],
  uncertain: readonly OracleGameIntegrationCapability[]
): void {
  const declared = new Set(capabilities);
  if (
    [...verified, ...uncertain].some(
      (capability) => !declared.has(capability)
    ) ||
    verified.some((capability) =>
      uncertain.includes(capability)
    )
  ) {
    throw new Error(
      "Game Integration certificate capability lifecycle is inconsistent."
    );
  }
  if (
    state === "certified" &&
    (
      verified.length !== capabilities.length ||
      uncertain.length !== 0
    )
  ) {
    throw new Error(
      "Certified Game Integration capabilities must all be verified."
    );
  }
  if (
    state === "provisionally-certified" &&
    (
      uncertain.length === 0 ||
      verified.length + uncertain.length !==
        capabilities.length
    )
  ) {
    throw new Error(
      "Provisionally certified capabilities must explicitly partition verified and uncertain capability."
    );
  }
  if (
    (state === "expired" || state === "revoked") &&
    verified.length !== 0
  ) {
    throw new Error(
      "Expired or revoked certificates cannot declare verified capabilities."
    );
  }
}

function createCapabilitySet(
  input: readonly OracleGameIntegrationCapability[],
  field: string,
  allowEmpty: boolean
): readonly OracleGameIntegrationCapability[] {
  if (
    !Array.isArray(input) ||
    (!allowEmpty && input.length === 0) ||
    input.some((capability) => !CAPABILITIES.includes(capability)) ||
    new Set(input).size !== input.length
  ) {
    throw new Error(
      `Game Integration certificate ${field} is invalid.`
    );
  }
  return Object.freeze([...input]);
}

function createStringSet(
  input: readonly string[],
  field: string
): string[] {
  if (
    !Array.isArray(input) ||
    input.length === 0 ||
    input.some(
      (value) =>
        typeof value !== "string" ||
        value.trim().length === 0
    )
  ) {
    throw new Error(
      `Game Integration compatibility ${field} is invalid.`
    );
  }
  const values = input.map((value) => value.trim());
  if (new Set(values).size !== values.length) {
    throw new Error(
      `Game Integration compatibility ${field} contains duplicates.`
    );
  }
  return values;
}

function matchesProfile(
  expected: OracleGameIntegrationCompatibilityProfile,
  actual: OracleGameIntegrationRuntimeProfile
): boolean {
  return (
    actual.gameId === expected.gameId &&
    actual.edition === expected.edition &&
    actual.gameVersion === expected.gameVersion &&
    actual.operatingSystem === expected.operatingSystem &&
    expected.executableNames.includes(
      actual.executableName.toLowerCase()
    ) &&
    expected.locales.includes(actual.locale) &&
    expected.displayModes.includes(
      actual.displayMode as OracleGameIntegrationDisplayMode
    ) &&
    actual.windowBounds.width >=
      expected.minimumWindowBounds.width &&
    actual.windowBounds.height >=
      expected.minimumWindowBounds.height &&
    expected.uiScales.includes(actual.uiScale) &&
    expected.playerModes.includes(
      actual.playerMode as OracleGameIntegrationPlayerMode
    ) &&
    actual.observationMethod === expected.observationMethod
  );
}

function createResolutionReason(input: {
  effectiveState: OracleGameIntegrationCertificateState;
  exactProfileMatch: boolean;
  disabledCapabilities:
    readonly OracleGameIntegrationCapability[];
}): string {
  if (!input.exactProfileMatch) {
    return "The runtime profile does not exactly match the certified profile.";
  }
  if (input.effectiveState === "expired") {
    return "The compatibility certificate review interval has expired.";
  }
  if (input.effectiveState === "revoked") {
    return "The compatibility certificate has been revoked.";
  }
  if (input.effectiveState === "provisionally-certified") {
    return input.disabledCapabilities.length === 0
      ? "Only independently reverified provisional capabilities are eligible."
      : `Provisional uncertainty disables: ${input.disabledCapabilities.join(", ")}.`;
  }
  return "The exact runtime profile is currently certified.";
}

function assertIdentity(value: string, field: string): void {
  if (
    typeof value !== "string" ||
    !/^[a-z0-9][a-z0-9._-]{0,127}$/u.test(value)
  ) {
    throw new Error(
      `Game Integration compatibility ${field} is invalid.`
    );
  }
}

function requireTimestamp(value: string, field: string): string {
  if (
    typeof value !== "string" ||
    !Number.isFinite(Date.parse(value)) ||
    new Date(value).toISOString() !== value
  ) {
    throw new Error(
      `Game Integration compatibility ${field} must be a UTC ISO timestamp.`
    );
  }
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}

function deepFreeze<T>(value: T): T {
  if (
    value === null ||
    typeof value !== "object" ||
    Object.isFrozen(value)
  ) {
    return value;
  }
  for (const nested of Object.values(value)) {
    deepFreeze(nested);
  }
  return Object.freeze(value);
}
