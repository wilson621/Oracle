export const ORACLE_RELEASE_MANIFEST_CONTRACT =
  Object.freeze({
    name: "oracle.release-manifest",
    version: 1,
  } as const);

export type OracleReleaseArtifact =
  Readonly<{
    kind:
      | "msix"
      | "native-helper"
      | "sbom"
      | "provenance";
    path: string;
    sha256: string;
    size: number;
  }>;

export type OracleReleaseManifest =
  Readonly<{
    contract:
      typeof ORACLE_RELEASE_MANIFEST_CONTRACT;
    releaseId: string;
    version: string;
    packageVersion: string;
    channel: "beta" | "stable";
    architecture: "x64";
    packageIdentity: Readonly<{
      name: string;
      publisher: string;
    }>;
    runtimeCompositionManifestVersion:
      string;
    artifacts:
      readonly OracleReleaseArtifact[];
    rollback: Readonly<{
      allowedTargets:
        readonly string[];
      arbitraryDowngrade: false;
    }>;
    signing: Readonly<{
      classification:
        "local-test-only";
      productionTrusted: false;
      publicReleaseReady: false;
      externalDistributionAuthorised:
        false;
      deploymentAuthorised: false;
    }>;
  }>;

export function requireOracleReleaseManifest(
  value: unknown
): OracleReleaseManifest {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    throw new Error(
      "Oracle Release Manifest must be an object."
    );
  }

  const manifest = value as Record<
    string,
    unknown
  >;
  const contract = manifest.contract;
  const identity =
    manifest.packageIdentity;
  const rollback = manifest.rollback;
  const signing = manifest.signing;

  if (
    !hasExactKeys(manifest, [
      "contract",
      "releaseId",
      "version",
      "packageVersion",
      "channel",
      "architecture",
      "packageIdentity",
      "runtimeCompositionManifestVersion",
      "artifacts",
      "rollback",
      "signing",
    ]) ||
    typeof contract !== "object" ||
    contract === null ||
    Array.isArray(contract) ||
    !hasExactKeys(
      contract as Record<string, unknown>,
      ["name", "version"]
    ) ||
    (contract as Record<string, unknown>)
      .name !==
      ORACLE_RELEASE_MANIFEST_CONTRACT.name ||
    (contract as Record<string, unknown>)
      .version !==
      ORACLE_RELEASE_MANIFEST_CONTRACT.version
  ) {
    throw new Error(
      "Oracle Release Manifest contract is unsupported."
    );
  }

  if (
    typeof manifest.releaseId !==
      "string" ||
    manifest.releaseId.trim().length === 0 ||
    typeof manifest.version !== "string" ||
    !isVersion(manifest.version, 2, 4) ||
    typeof manifest.packageVersion !==
      "string" ||
    !isVersion(
      manifest.packageVersion,
      4,
      4
    ) ||
    (
      manifest.channel !== "beta" &&
      manifest.channel !== "stable"
    ) ||
    manifest.architecture !== "x64" ||
    typeof manifest
      .runtimeCompositionManifestVersion !==
      "string" ||
    !isVersion(
      manifest
        .runtimeCompositionManifestVersion,
      3,
      3
    ) ||
    !Array.isArray(manifest.artifacts) ||
    manifest.artifacts.length === 0
  ) {
    throw new Error(
      "Oracle Release Manifest metadata is invalid."
    );
  }

  if (
    typeof identity !== "object" ||
    identity === null ||
    Array.isArray(identity) ||
    !hasExactKeys(
      identity as Record<string, unknown>,
      ["name", "publisher"]
    ) ||
    typeof (
      identity as Record<string, unknown>
    ).name !== "string" ||
    (
      identity as Record<string, string>
    ).name.trim().length === 0 ||
    typeof (
      identity as Record<string, unknown>
    ).publisher !== "string" ||
    (
      identity as Record<string, string>
    ).publisher.trim().length === 0
  ) {
    throw new Error(
      "Oracle Release Manifest package identity is invalid."
    );
  }

  for (
    const artifact of
      manifest.artifacts
  ) {
    requireReleaseArtifact(artifact);
  }
  const artifacts =
    manifest.artifacts as OracleReleaseArtifact[];
  if (
    new Set(
      artifacts.map(
        (artifact) => artifact.path
      )
    ).size !== artifacts.length ||
    artifacts.filter(
      (artifact) =>
        artifact.kind === "msix"
    ).length !== 1 ||
    artifacts.filter(
      (artifact) =>
        artifact.kind === "sbom"
    ).length !== 1 ||
    artifacts.filter(
      (artifact) =>
        artifact.kind === "provenance"
    ).length !== 1
  ) {
    throw new Error(
      "Oracle Release Manifest artifact set is invalid."
    );
  }

  if (
    typeof rollback !== "object" ||
    rollback === null ||
    Array.isArray(rollback) ||
    !hasExactKeys(
      rollback as Record<string, unknown>,
      [
        "allowedTargets",
        "arbitraryDowngrade",
      ]
    ) ||
    !Array.isArray(
      (
        rollback as Record<string, unknown>
      ).allowedTargets
    ) ||
    (
      rollback as Record<string, unknown>
    ).arbitraryDowngrade !== false
  ) {
    throw new Error(
      "Oracle Release Manifest rollback policy is invalid."
    );
  }
  const allowedTargets = (
    rollback as {
      allowedTargets: unknown[];
    }
  ).allowedTargets;
  if (
    !allowedTargets.every(
      (target) =>
        typeof target === "string" &&
        isVersion(target, 4, 4)
    ) ||
    new Set(allowedTargets).size !==
      allowedTargets.length ||
    allowedTargets.includes(
      manifest.packageVersion
    )
  ) {
    throw new Error(
      "Oracle Release Manifest rollback targets are invalid."
    );
  }

  if (
    typeof signing !== "object" ||
    signing === null ||
    Array.isArray(signing) ||
    !hasExactKeys(
      signing as Record<string, unknown>,
      [
        "classification",
        "productionTrusted",
        "publicReleaseReady",
        "externalDistributionAuthorised",
        "deploymentAuthorised",
      ]
    ) ||
    (
      signing as Record<string, unknown>
    ).classification !==
      "local-test-only" ||
    (
      signing as Record<string, unknown>
    ).productionTrusted !== false ||
    (
      signing as Record<string, unknown>
    ).publicReleaseReady !== false ||
    (
      signing as Record<string, unknown>
    ).externalDistributionAuthorised !==
      false ||
    (
      signing as Record<string, unknown>
    ).deploymentAuthorised !== false
  ) {
    throw new Error(
      "Oracle Release Manifest signing boundary is invalid."
    );
  }

  return deepFreeze(
    structuredClone(
      value as OracleReleaseManifest
    )
  );
}

function requireReleaseArtifact(
  value: unknown
): asserts value is OracleReleaseArtifact {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    throw new Error(
      "Oracle release artifact is invalid."
    );
  }

  const artifact = value as Record<
    string,
    unknown
  >;

  if (
    !hasExactKeys(artifact, [
      "kind",
      "path",
      "sha256",
      "size",
    ]) ||
    (
      artifact.kind !== "msix" &&
      artifact.kind !==
        "native-helper" &&
      artifact.kind !== "sbom" &&
      artifact.kind !== "provenance"
    ) ||
    typeof artifact.path !== "string" ||
    !isSafeArtifactPath(
      artifact.path
    ) ||
    typeof artifact.sha256 !== "string" ||
    !/^[a-f0-9]{64}$/.test(
      artifact.sha256
    ) ||
    typeof artifact.size !== "number" ||
    !Number.isSafeInteger(
      artifact.size
    ) ||
    artifact.size < 0
  ) {
    throw new Error(
      "Oracle release artifact declaration is invalid."
    );
  }
}

function isSafeArtifactPath(
  value: string
): boolean {
  if (
    value.trim() !== value ||
    value.length === 0 ||
    value.includes("\\") ||
    value.includes("\0")
  ) {
    return false;
  }
  const path = value.startsWith(
    "package:/"
  )
    ? value.slice("package:/".length)
    : value;
  return (
    path.length > 0 &&
    !path.startsWith("/") &&
    !path.split("/").includes("..")
  );
}

function isVersion(
  value: string,
  minimumParts: number,
  maximumParts: number
): boolean {
  const parts = value.split(".");
  return (
    parts.length >= minimumParts &&
    parts.length <= maximumParts &&
    parts.every(
      (part) =>
        /^(?:0|[1-9]\d*)$/.test(part) &&
        Number.isSafeInteger(
          Number(part)
        )
    )
  );
}

function hasExactKeys(
  value: Record<string, unknown>,
  expected: readonly string[]
): boolean {
  const keys = Reflect.ownKeys(value);
  return (
    keys.length === expected.length &&
    expected.every(
      (key) =>
        Object.hasOwn(value, key)
    )
  );
}

function deepFreeze<T>(
  value: T
): T {
  if (
    typeof value !== "object" ||
    value === null ||
    Object.isFrozen(value)
  ) {
    return value;
  }
  for (
    const nested of
      Object.values(value)
  ) {
    deepFreeze(nested);
  }
  return Object.freeze(value);
}
