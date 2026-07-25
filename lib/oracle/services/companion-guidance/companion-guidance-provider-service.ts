import {
  createOracleCompanionGuidance,
  createOracleCompanionGuidancePackageManifest,
  createOracleCompanionGuidanceRequest,
  type OracleCompanionGuidance,
  type OracleCompanionGuidancePackageManifest,
  type OracleCompanionGuidanceProvider,
  type OracleCompanionGuidanceRequest,
  type OracleCompanionGuidanceSpoilerLevel,
} from "../../../companion/guidance";
import type {
  OracleCompanionGuidanceProviderEligibilityReason,
  OracleCompanionGuidanceProviderExecution,
  OracleCompanionGuidanceProviderFailure,
  OracleCompanionGuidanceProviderManifestSnapshot,
  OracleCompanionGuidanceServiceResult,
} from "./companion-guidance-service-types";

const WILDCARD_CAPABILITY = "*";

export type OracleCompanionGuidanceExecutionPolicy = Readonly<{
  maximumSourceAgeMs: number | null;
}>;

const DEFAULT_EXECUTION_POLICY: OracleCompanionGuidanceExecutionPolicy =
  Object.freeze({
    maximumSourceAgeMs: 180 * 24 * 60 * 60 * 1_000,
  });

const SPOILER_ORDER:
  Readonly<
    Record<
      OracleCompanionGuidanceSpoilerLevel,
      number
    >
  > = Object.freeze({
    none: 0,
    minor: 1,
    major: 2,
    full: 3,
  });

type RegisteredProvider =
  Readonly<{
    manifest:
      OracleCompanionGuidancePackageManifest;

    provideGuidance:
      OracleCompanionGuidanceProvider["provideGuidance"];
  }>;

/**
 * Services-owned orchestration boundary for Companion Guidance providers.
 *
 * The service discovers providers only through constructor injection, runs
 * eligible providers sequentially and preserves provider/output order. It
 * validates data but does not generate, rank, personalise or present Guidance.
 */
export class OracleCompanionGuidanceProviderService {
  private readonly providers:
    readonly RegisteredProvider[];

  constructor(
    providers:
      readonly OracleCompanionGuidanceProvider[],
    private readonly policy:
      OracleCompanionGuidanceExecutionPolicy =
        DEFAULT_EXECUTION_POLICY
  ) {
    if (
      this.policy.maximumSourceAgeMs !== null &&
      (!Number.isFinite(this.policy.maximumSourceAgeMs) ||
        this.policy.maximumSourceAgeMs < 0)
    ) {
      throw new Error(
        "Oracle Companion Guidance source freshness policy is invalid."
      );
    }
    this.providers =
      createProviderSnapshot(
        providers
      );
  }

  getProviderManifests():
    readonly OracleCompanionGuidanceProviderManifestSnapshot[] {
    return Object.freeze(
      this.providers.map(
        (provider) =>
          provider.manifest
      )
    );
  }

  async execute(
    value: unknown
  ): Promise<OracleCompanionGuidanceServiceResult> {
    const request =
      createOracleCompanionGuidanceRequest(
        value
      );

    const guidance:
      OracleCompanionGuidance[] = [];

    const failures:
      OracleCompanionGuidanceProviderFailure[] = [];

    const executions:
      OracleCompanionGuidanceProviderExecution[] = [];

    const acceptedIds =
      new Set<string>();

    for (
      const provider
      of this.providers
    ) {
      const eligibilityReason =
        getEligibilityReason(
          provider.manifest,
          request
        );

      if (eligibilityReason) {
        executions.push(
          createExecution({
            provider,
            status: "ineligible",
            eligibilityReason,
          })
        );
        continue;
      }

      const execution =
        await executeProvider({
          provider,
          request,
          acceptedIds,
          policy: this.policy,
        });

      guidance.push(
        ...execution.guidance
      );

      failures.push(
        ...execution.failures
      );

      executions.push(
        execution.provider
      );
    }

    return Object.freeze({
      guidance:
        Object.freeze(guidance),
      failures:
        Object.freeze(failures),
      providers:
        Object.freeze(executions),
    });
  }
}

function createProviderSnapshot(
  providers:
    readonly OracleCompanionGuidanceProvider[]
): readonly RegisteredProvider[] {
  if (!Array.isArray(providers)) {
    throw new Error(
      "Oracle Companion Guidance providers must be supplied as an array."
    );
  }

  const providerIds =
    new Set<string>();

  const snapshot =
    providers.map(
      (provider, index) => {
        if (
          provider === null ||
          typeof provider !== "object" ||
          typeof provider.provideGuidance !==
            "function"
        ) {
          throw new Error(
            `Oracle Companion Guidance provider at index ${index} is invalid.`
          );
        }

        const manifest =
          createOracleCompanionGuidancePackageManifest(
            provider.manifest
          );

        if (
          providerIds.has(
            manifest.id
          )
        ) {
          throw new Error(
            `Oracle Companion Guidance provider '${manifest.id}' is registered more than once.`
          );
        }

        providerIds.add(
          manifest.id
        );

        return Object.freeze({
          manifest,
          provideGuidance:
            (request:
              OracleCompanionGuidanceRequest) =>
              provider.provideGuidance(
                request
              ),
        });
      }
    );

  return Object.freeze(snapshot);
}

function getEligibilityReason(
  manifest:
    OracleCompanionGuidancePackageManifest,
  request:
    OracleCompanionGuidanceRequest
): OracleCompanionGuidanceProviderEligibilityReason | null {
  if (manifest.integrationId) {
    if (!request.session.game) {
      return "integration-not-active";
    }

    if (
      request.session.game
        .integrationId !==
      manifest.integrationId
    ) {
      return "integration-not-supported";
    }
  }

  if (
    request.category &&
    !supportsValue(
      manifest.categories,
      request.category
    )
  ) {
    return "category-not-supported";
  }

  if (
    request.type &&
    !supportsValue(
      manifest.types,
      request.type
    )
  ) {
    return "type-not-supported";
  }

  return null;
}

async function executeProvider(
  input: Readonly<{
    provider: RegisteredProvider;
    request:
      OracleCompanionGuidanceRequest;
    acceptedIds: Set<string>;
    policy:
      OracleCompanionGuidanceExecutionPolicy;
  }>
): Promise<
  Readonly<{
    guidance:
      readonly OracleCompanionGuidance[];
    failures:
      readonly OracleCompanionGuidanceProviderFailure[];
    provider:
      OracleCompanionGuidanceProviderExecution;
  }>
> {
  let output: unknown;

  try {
    output = await input.provider
      .provideGuidance(
        input.request
      );
  } catch (error) {
    const failure =
      createFailure({
        provider:
          input.provider,
        stage: "execution",
        code:
          "guidance.provider-execution-failed",
        message:
          getErrorMessage(error),
        outputIndex: null,
      });

    return Object.freeze({
      guidance: Object.freeze([]),
      failures:
        Object.freeze([failure]),
      provider:
        createExecution({
          provider:
            input.provider,
          status: "failed",
          failureCount: 1,
        }),
    });
  }

  if (!Array.isArray(output)) {
    const failure =
      createFailure({
        provider:
          input.provider,
        stage: "output-validation",
        code:
          "guidance.provider-output-not-array",
        message:
          "Guidance provider output must be an array.",
        outputIndex: null,
      });

    return Object.freeze({
      guidance: Object.freeze([]),
      failures:
        Object.freeze([failure]),
      provider:
        createExecution({
          provider:
            input.provider,
          status: "failed",
          failureCount: 1,
        }),
    });
  }

  const guidance:
    OracleCompanionGuidance[] = [];

  const failures:
    OracleCompanionGuidanceProviderFailure[] = [];

  let filteredCount = 0;

  for (
    let index = 0;
    index < output.length;
    index += 1
  ) {
    try {
      const candidate =
        createOracleCompanionGuidance(
          output[index]
        );

      assertProviderOwnsGuidance(
        input.provider,
        candidate
      );

      assertRequestMatchesGuidance(
        input.request,
        candidate
      );

      assertIntegrationCompatibility(
        input.provider,
        input.request,
        candidate
      );

      if (
        shouldFilterGuidance(
          input.request,
          candidate,
          input.policy
        )
      ) {
        filteredCount += 1;
        continue;
      }

      if (
        input.acceptedIds.has(
          candidate.id
        )
      ) {
        throw new Error(
          `Guidance identifier '${candidate.id}' has already been accepted.`
        );
      }

      input.acceptedIds.add(
        candidate.id
      );

      guidance.push(candidate);
    } catch (error) {
      failures.push(
        createFailure({
          provider:
            input.provider,
          stage:
            "output-validation",
          code:
            "guidance.provider-output-invalid",
          message:
            getErrorMessage(error),
          outputIndex: index,
        })
      );
    }
  }

  return Object.freeze({
    guidance:
      Object.freeze(guidance),
    failures:
      Object.freeze(failures),
    provider:
      createExecution({
        provider: input.provider,
        status:
          failures.length > 0
            ? "completed-with-failures"
            : "completed",
        acceptedCount:
          guidance.length,
        filteredCount,
        failureCount:
          failures.length,
      }),
  });
}

function assertProviderOwnsGuidance(
  provider: RegisteredProvider,
  guidance: OracleCompanionGuidance
): void {
  if (
    guidance.provenance
      .providerId !==
      provider.manifest.id ||
    guidance.provenance
      .providerVersion !==
      provider.manifest.version
  ) {
    throw new Error(
      "Guidance provenance does not match the executing provider manifest."
    );
  }

  if (
    !supportsValue(
      provider.manifest.categories,
      guidance.category
    ) ||
    !supportsValue(
      provider.manifest.types,
      guidance.type
    )
  ) {
    throw new Error(
      "Guidance category or type is not declared by the executing provider."
    );
  }
}

function assertRequestMatchesGuidance(
  request:
    OracleCompanionGuidanceRequest,
  guidance:
    OracleCompanionGuidance
): void {
  if (
    request.category &&
    request.category !==
      guidance.category
  ) {
    throw new Error(
      "Guidance category does not match the request."
    );
  }

  if (
    request.type &&
    request.type !== guidance.type
  ) {
    throw new Error(
      "Guidance type does not match the request."
    );
  }
}

function assertIntegrationCompatibility(
  provider: RegisteredProvider,
  request:
    OracleCompanionGuidanceRequest,
  guidance:
    OracleCompanionGuidance
): void {
  const activeGame =
    request.session.game;

  const compatibility =
    guidance.compatibility;

  if (
    compatibility.integrationId ===
    null
  ) {
    if (
      provider.manifest
        .integrationId !== null
    ) {
      throw new Error(
        "Integration-specific provider output must declare integration compatibility."
      );
    }

    return;
  }

  if (
    !activeGame ||
    compatibility.integrationId !==
      activeGame.integrationId ||
    compatibility.integrationVersion !==
      activeGame.integrationVersion
  ) {
    throw new Error(
      "Guidance integration compatibility does not match the active Session projection."
    );
  }

  if (
    provider.manifest.integrationId &&
    compatibility.integrationId !==
      provider.manifest.integrationId
  ) {
    throw new Error(
      "Guidance integration compatibility does not match the provider manifest."
    );
  }
}

function shouldFilterGuidance(
  request:
    OracleCompanionGuidanceRequest,
  guidance:
    OracleCompanionGuidance,
  policy:
    OracleCompanionGuidanceExecutionPolicy
): boolean {
  if (
    SPOILER_ORDER[
      guidance.spoilerLevel
    ] >
    SPOILER_ORDER[
      request.maximumSpoilerLevel
    ]
  ) {
    return true;
  }

  if (
    policy.maximumSourceAgeMs !== null &&
    guidance.sources.some(
      (source) => {
        if (source.verifiedAt === null) {
          return true;
        }
        const age =
          Date.parse(request.requestedAt) -
          Date.parse(source.verifiedAt);
        return (
          age < 0 ||
          age >
            policy.maximumSourceAgeMs!
        );
      }
    )
  ) {
    return true;
  }

  return (
    guidance.expiresAt !== null &&
    Date.parse(
      guidance.expiresAt
    ) <=
      Date.parse(
        request.requestedAt
      )
  );
}

function supportsValue(
  supported: readonly string[],
  value: string
): boolean {
  return (
    supported.includes(value) ||
    supported.includes(
      WILDCARD_CAPABILITY
    )
  );
}

function createFailure(
  input: Readonly<{
    provider: RegisteredProvider;
    stage:
      OracleCompanionGuidanceProviderFailure["stage"];
    code: string;
    message: string;
    outputIndex: number | null;
  }>
): OracleCompanionGuidanceProviderFailure {
  return Object.freeze({
    providerId:
      input.provider.manifest.id,
    providerVersion:
      input.provider.manifest
        .version,
    stage: input.stage,
    code: input.code,
    message: input.message,
    outputIndex:
      input.outputIndex,
  });
}

function createExecution(
  input: Readonly<{
    provider: RegisteredProvider;
    status:
      OracleCompanionGuidanceProviderExecution["status"];
    eligibilityReason?:
      OracleCompanionGuidanceProviderEligibilityReason | null;
    acceptedCount?: number;
    filteredCount?: number;
    failureCount?: number;
  }>
): OracleCompanionGuidanceProviderExecution {
  return Object.freeze({
    providerId:
      input.provider.manifest.id,
    providerVersion:
      input.provider.manifest
        .version,
    status: input.status,
    eligibilityReason:
      input.eligibilityReason ??
      null,
    acceptedCount:
      input.acceptedCount ?? 0,
    filteredCount:
      input.filteredCount ?? 0,
    failureCount:
      input.failureCount ?? 0,
  });
}

function getErrorMessage(
  error: unknown
): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}
