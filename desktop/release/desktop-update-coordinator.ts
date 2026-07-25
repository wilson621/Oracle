import {
  ORACLE_DESKTOP_RELEASE_CONTRACT,
  type OracleDesktopReleaseState,
} from "./desktop-release-contract.js";
import {
  requireOracleReleaseManifest,
  type OracleReleaseManifest,
} from "./release-manifest-contract.js";

const LOCAL_SIGNING_LIMITATION =
  "Local test signing proves packaging and distribution mechanics only. It must never be interpreted as production publisher trust, public release readiness, operational certification, deployment authority or permission to distribute Oracle externally.";

export type OracleReleaseManifestProvider =
  () => Promise<unknown>;

export type OracleDesktopReplacementBoundary =
  Readonly<{
    invalidateObservation: () =>
      Promise<void> | void;
    detachCompanion: () =>
      Promise<void> | void;
    stopRuntime: () =>
      Promise<void> | void;
  }>;

export class OracleDesktopUpdateCoordinator {
  private state:
    OracleDesktopReleaseState;

  constructor(
    private readonly options: Readonly<{
      currentVersion: string;
      manifestProvider:
        OracleReleaseManifestProvider | null;
      replacementBoundary?:
        OracleDesktopReplacementBoundary;
      now?: () => Date;
    }>
  ) {
    this.state = createState({
      currentVersion:
        options.currentVersion,
      status: "inactive",
      availableVersion: null,
      checkedAt: null,
      errorCode: null,
    });
  }

  getState(): OracleDesktopReleaseState {
    return this.state;
  }

  async checkForUpdates(): Promise<
    OracleDesktopReleaseState
  > {
    if (!this.options.manifestProvider) {
      return this.replaceState({
        status: "inactive",
        availableVersion: null,
        checkedAt: this.now(),
        errorCode:
          "release-hosting-not-authorised",
      });
    }

    this.replaceState({
      status: "checking",
      availableVersion: null,
      checkedAt: this.now(),
      errorCode: null,
    });

    try {
      const manifest =
        requireOracleReleaseManifest(
          await this.options
            .manifestProvider()
        );
      this.requireEligibleManifest(
        manifest
      );

      const isNewer =
        compareVersions(
          manifest.version,
          this.options.currentVersion
        ) > 0;

      return this.replaceState({
        status: isNewer
          ? "available"
          : "ready",
        availableVersion: isNewer
          ? manifest.version
          : null,
        checkedAt: this.now(),
        errorCode: null,
      });
    } catch {
      return this.replaceState({
        status: "failed",
        availableVersion: null,
        checkedAt: this.now(),
        errorCode:
          "release-manifest-rejected",
      });
    }
  }

  async prepareForReplacement():
    Promise<void> {
    const boundary =
      this.options
        .replacementBoundary;
    if (!boundary) {
      throw new Error(
        "Desktop replacement boundary is unavailable."
      );
    }

    await boundary
      .invalidateObservation();
    await boundary
      .detachCompanion();
    await boundary.stopRuntime();
  }

  private requireEligibleManifest(
    manifest: OracleReleaseManifest
  ): void {
    if (
      manifest.channel !== "beta" ||
      manifest.signing.classification !==
        "local-test-only" ||
      manifest.signing
        .productionTrusted ||
      manifest.signing
        .externalDistributionAuthorised ||
      manifest.signing
        .deploymentAuthorised
    ) {
      throw new Error(
        "Release manifest is outside the local certification boundary."
      );
    }
  }

  private replaceState(input: {
    status:
      OracleDesktopReleaseState["status"];
    availableVersion: string | null;
    checkedAt: string | null;
    errorCode: string | null;
  }): OracleDesktopReleaseState {
    this.state = createState({
      currentVersion:
        this.options.currentVersion,
      ...input,
    });
    return this.state;
  }

  private now(): string {
    return (
      this.options.now?.() ??
      new Date()
    ).toISOString();
  }
}

function createState(input: {
  currentVersion: string;
  status:
    OracleDesktopReleaseState["status"];
  availableVersion: string | null;
  checkedAt: string | null;
  errorCode: string | null;
}): OracleDesktopReleaseState {
  return Object.freeze({
    contract:
      ORACLE_DESKTOP_RELEASE_CONTRACT,
    status: input.status,
    channel: "beta",
    currentVersion:
      input.currentVersion,
    availableVersion:
      input.availableVersion,
    trust: "local-test-only",
    publication: "not-authorised",
    externalDistribution:
      "not-authorised",
    productionTrusted: false,
    checkedAt: input.checkedAt,
    limitation:
      LOCAL_SIGNING_LIMITATION,
    errorCode: input.errorCode,
  });
}

function compareVersions(
  left: string,
  right: string
): number {
  const leftParts =
    requireVersion(left);
  const rightParts =
    requireVersion(right);
  const length = Math.max(
    leftParts.length,
    rightParts.length
  );

  for (
    let index = 0;
    index < length;
    index += 1
  ) {
    const difference =
      (leftParts[index] ?? 0) -
      (rightParts[index] ?? 0);
    if (difference !== 0) {
      return Math.sign(difference);
    }
  }

  return 0;
}

function requireVersion(
  value: string
): number[] {
  if (!/^\d+(?:\.\d+){1,3}$/.test(value)) {
    throw new Error(
      "Release version is invalid."
    );
  }
  return value
    .split(".")
    .map((part) => Number(part));
}
