import type {
  OracleCompanionGuidancePackageManifest,
  OracleCompanionGuidanceRequest,
} from "./companion-guidance-types";
import {
  assertSerializableData,
  deepFreeze,
  requireNonEmptyString,
  requireNullableString,
  requirePlainRecord,
  requireSemanticVersion,
  requireStringArray,
} from "./companion-guidance-validation";

export function createOracleCompanionGuidancePackageManifest(
  value: unknown
): OracleCompanionGuidancePackageManifest {
  assertSerializableData(
    value,
    "package"
  );

  const input =
    requirePlainRecord(
      value,
      "package"
    );

  const manifest:
    OracleCompanionGuidancePackageManifest = {
    id:
      requireNonEmptyString(
        input.id,
        "package.id"
      ),

    version:
      requireSemanticVersion(
        input.version,
        "package.version"
      ),

    integrationId:
      requireNullableString(
        input.integrationId,
        "package.integrationId"
      ),

    categories:
      requireUniqueStringArray(
        input.categories,
        "package.categories"
      ),

    types:
      requireUniqueStringArray(
        input.types,
        "package.types"
      ),
  };

  return deepFreeze(manifest);
}

export function isOracleCompanionGuidancePackageManifest(
  value: unknown
): value is OracleCompanionGuidancePackageManifest {
  try {
    createOracleCompanionGuidancePackageManifest(
      value
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * Internal capability boundary for future Services. Provider implementations
 * never cross Session or presentation contracts; their unknown outputs must
 * pass createOracleCompanionGuidance before use.
 */
export type OracleCompanionGuidanceProvider =
  Readonly<{
    manifest:
      OracleCompanionGuidancePackageManifest;

    provideGuidance: (
      request:
        OracleCompanionGuidanceRequest
    ) => Promise<readonly unknown[]>;
  }>;

function requireUniqueStringArray(
  value: unknown,
  path: string
): string[] {
  const values =
    requireStringArray(
      value,
      path
    );

  if (
    new Set(values).size !==
      values.length
  ) {
    throw new Error(
      `Oracle Companion Guidance '${path}' must not contain duplicate values.`
    );
  }

  return values;
}
