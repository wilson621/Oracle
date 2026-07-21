import {
  ORACLE_COMPANION_GUIDANCE_REQUEST_CONTRACT,
  ORACLE_COMPANION_GUIDANCE_REQUEST_CONTRACT_VERSION,
  ORACLE_COMPANION_GUIDANCE_SESSION_CONTRACT,
  ORACLE_COMPANION_GUIDANCE_SESSION_CONTRACT_VERSION,
  type OracleCompanionGuidanceGameProjection,
  type OracleCompanionGuidanceRequest,
  type OracleCompanionGuidanceSessionProjection,
  type OracleCompanionGuidanceSpoilerLevel,
} from "./companion-guidance-types";
import {
  assertSerializableData,
  cloneSerializableRecord,
  deepFreeze,
  requireIsoTimestamp,
  requireNonEmptyString,
  requireNullableString,
  requirePlainRecord,
  requireSemanticVersion,
} from "./companion-guidance-validation";

const SPOILER_LEVELS:
  readonly OracleCompanionGuidanceSpoilerLevel[] =
    [
      "none",
      "minor",
      "major",
      "full",
    ];

export function createOracleCompanionGuidanceSessionProjection(
  value: unknown
): OracleCompanionGuidanceSessionProjection {
  assertSerializableData(
    value,
    "session"
  );

  const input =
    requirePlainRecord(
      value,
      "session"
    );

  const projection:
    OracleCompanionGuidanceSessionProjection = {
    contract:
      createSessionContract(
        input.contract
      ),

    sessionId:
      requireNonEmptyString(
        input.sessionId,
        "session.sessionId"
      ),

    capturedAt:
      requireIsoTimestamp(
        input.capturedAt,
        "session.capturedAt"
      ),

    context:
      cloneSerializableRecord(
        input.context,
        "session.context"
      ),

    game:
      input.game === null
        ? null
        : createGameProjection(
            input.game
          ),
  };

  return deepFreeze(
    projection
  );
}

export function isOracleCompanionGuidanceSessionProjection(
  value: unknown
): value is OracleCompanionGuidanceSessionProjection {
  try {
    createOracleCompanionGuidanceSessionProjection(
      value
    );
    return true;
  } catch {
    return false;
  }
}

export function createOracleCompanionGuidanceRequest(
  value: unknown
): OracleCompanionGuidanceRequest {
  assertSerializableData(
    value,
    "request"
  );

  const input =
    requirePlainRecord(
      value,
      "request"
    );

  const request:
    OracleCompanionGuidanceRequest = {
    contract:
      createRequestContract(
        input.contract
      ),

    requestId:
      requireNonEmptyString(
        input.requestId,
        "request.requestId"
      ),

    requestedAt:
      requireIsoTimestamp(
        input.requestedAt,
        "request.requestedAt"
      ),

    session:
      createOracleCompanionGuidanceSessionProjection(
        input.session
      ),

    category:
      requireNullableString(
        input.category,
        "request.category"
      ),

    type:
      requireNullableString(
        input.type,
        "request.type"
      ),

    operatorPrompt:
      requireNullableString(
        input.operatorPrompt,
        "request.operatorPrompt"
      ),

    maximumSpoilerLevel:
      requireSpoilerLevel(
        input.maximumSpoilerLevel,
        "request.maximumSpoilerLevel"
      ),
  };

  return deepFreeze(request);
}

export function isOracleCompanionGuidanceRequest(
  value: unknown
): value is OracleCompanionGuidanceRequest {
  try {
    createOracleCompanionGuidanceRequest(
      value
    );
    return true;
  } catch {
    return false;
  }
}

function createRequestContract(
  value: unknown
) {
  const contract =
    requirePlainRecord(
      value,
      "request.contract"
    );

  if (
    contract.name !==
      ORACLE_COMPANION_GUIDANCE_REQUEST_CONTRACT ||
    contract.version !==
      ORACLE_COMPANION_GUIDANCE_REQUEST_CONTRACT_VERSION
  ) {
    throw new Error(
      "Oracle Companion Guidance Request contract identity or version is unsupported."
    );
  }

  return {
    name:
      ORACLE_COMPANION_GUIDANCE_REQUEST_CONTRACT,

    version:
      ORACLE_COMPANION_GUIDANCE_REQUEST_CONTRACT_VERSION,
  } as const;
}

function createSessionContract(
  value: unknown
) {
  const contract =
    requirePlainRecord(
      value,
      "session.contract"
    );

  if (
    contract.name !==
      ORACLE_COMPANION_GUIDANCE_SESSION_CONTRACT ||
    contract.version !==
      ORACLE_COMPANION_GUIDANCE_SESSION_CONTRACT_VERSION
  ) {
    throw new Error(
      "Oracle Companion Guidance Session contract identity or version is unsupported."
    );
  }

  return {
    name:
      ORACLE_COMPANION_GUIDANCE_SESSION_CONTRACT,

    version:
      ORACLE_COMPANION_GUIDANCE_SESSION_CONTRACT_VERSION,
  } as const;
}

function createGameProjection(
  value: unknown
): OracleCompanionGuidanceGameProjection {
  const game =
    requirePlainRecord(
      value,
      "session.game"
    );

  return {
    integrationId:
      requireNonEmptyString(
        game.integrationId,
        "session.game.integrationId"
      ),

    gameName:
      requireNonEmptyString(
        game.gameName,
        "session.game.gameName"
      ),

    integrationVersion:
      requireSemanticVersion(
        game.integrationVersion,
        "session.game.integrationVersion"
      ),

    context:
      cloneSerializableRecord(
        game.context,
        "session.game.context"
      ),
  };
}

function requireSpoilerLevel(
  value: unknown,
  path: string
): OracleCompanionGuidanceSpoilerLevel {
  if (
    typeof value === "string" &&
    SPOILER_LEVELS.includes(
      value as OracleCompanionGuidanceSpoilerLevel
    )
  ) {
    return value as
      OracleCompanionGuidanceSpoilerLevel;
  }

  throw new Error(
    `Oracle Companion Guidance '${path}' is unsupported.`
  );
}
