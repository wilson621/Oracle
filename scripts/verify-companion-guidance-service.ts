import assert from "node:assert/strict";
import type {
  OracleCompanionGuidancePackageManifest,
  OracleCompanionGuidanceProvider,
  OracleCompanionGuidanceRequest,
} from "../lib/companion/guidance";
import {
  OracleCompanionGuidanceProviderService,
} from "../lib/oracle/services/companion-guidance";

const requestedAt =
  "2026-07-21T14:00:00.000Z";

const request = {
  contract: {
    name:
      "oracle.companion-guidance-request",
    version: 1,
  },
  requestId: "request-service-1",
  requestedAt,
  session: {
    contract: {
      name:
        "oracle.companion-guidance-session-projection",
      version: 1,
    },
    sessionId: "session-service-1",
    capturedAt: requestedAt,
    context: {
      analysisScope: "current-session",
    },
    game: {
      integrationId: "example-game",
      gameName: "Example Game",
      integrationVersion: "1.0.0",
      context: {
        mode: "exploration",
      },
    },
  },
  category: null,
  type: null,
  operatorPrompt: null,
  maximumSpoilerLevel: "minor",
};

let syncRequestWasFrozen = false;
let asyncProviderExecuted = false;
let ineligibleProviderExecuted = false;

const mutableManifest =
  createManifest(
    "provider.sync"
  );

const syncProvider:
  OracleCompanionGuidanceProvider = {
  manifest: mutableManifest,
  provideGuidance(
    receivedRequest
  ) {
    syncRequestWasFrozen =
      isDeeplyFrozenRequest(
        receivedRequest
      );

    return [
      createGuidance({
        id: "sync-low-first",
        providerId:
          "provider.sync",
        priority: "low",
      }),
      createGuidance({
        id: "sync-high-second",
        providerId:
          "provider.sync",
        priority: "high",
      }),
      createGuidance({
        id: "sync-spoiler-filtered",
        providerId:
          "provider.sync",
        spoilerLevel: "major",
      }),
      createGuidance({
        id: "sync-expired-filtered",
        providerId:
          "provider.sync",
        expiresAt:
          requestedAt,
      }),
    ];
  },
};

const failingAsyncProvider:
  OracleCompanionGuidanceProvider = {
  manifest:
    createManifest(
      "provider.async-failure"
    ),
  async provideGuidance() {
    asyncProviderExecuted = true;
    throw new Error(
      "Provider unavailable."
    );
  },
};

const gameProvider:
  OracleCompanionGuidanceProvider = {
  manifest:
    createManifest(
      "provider.game",
      "example-game"
    ),
  provideGuidance() {
    return [
      createGuidance({
        id: "game-third",
        providerId:
          "provider.game",
        integrationId:
          "example-game",
      }),
    ];
  },
};

const successfulAsyncProvider:
  OracleCompanionGuidanceProvider = {
  manifest:
    createManifest(
      "provider.async-success"
    ),
  async provideGuidance() {
    return Promise.resolve([
      createGuidance({
        id: "async-fourth",
        providerId:
          "provider.async-success",
      }),
    ]);
  },
};

const ineligibleProvider:
  OracleCompanionGuidanceProvider = {
  manifest:
    createManifest(
      "provider.other-game",
      "other-game"
    ),
  provideGuidance() {
    ineligibleProviderExecuted = true;
    return [];
  },
};

const partiallyInvalidProvider:
  OracleCompanionGuidanceProvider = {
  manifest:
    createManifest(
      "provider.partial"
    ),
  provideGuidance() {
    return [
      {
        ...createGuidance({
          id: "invalid-executable",
          providerId:
            "provider.partial",
        }),
        executable: () =>
          "must be rejected",
      },
      createGuidance({
        id: "invalid-provenance",
        providerId:
          "different-provider",
      }),
      createGuidance({
        id: "invalid-integration",
        providerId:
          "provider.partial",
        integrationId:
          "other-game",
      }),
      createGuidance({
        id: "valid-after-invalid",
        providerId:
          "provider.partial",
        type:
          "future-unknown-type",
      }),
    ];
  },
};

const invalidCollectionProvider = {
  manifest:
    createManifest(
      "provider.invalid-collection"
    ),
  provideGuidance: () => ({
    invalid: true,
  }),
} as unknown as
  OracleCompanionGuidanceProvider;

const service =
  new OracleCompanionGuidanceProviderService(
    [
      syncProvider,
      failingAsyncProvider,
      gameProvider,
      successfulAsyncProvider,
      ineligibleProvider,
      partiallyInvalidProvider,
      invalidCollectionProvider,
    ]
  );

(
  mutableManifest as {
    id: string;
  }
).id = "mutated-after-discovery";

const manifests =
  service.getProviderManifests();

assert.equal(
  manifests[0].id,
  "provider.sync"
);
assert.equal(
  Object.isFrozen(manifests),
  true
);
assert.equal(
  Object.isFrozen(manifests[0]),
  true
);

void verify();

async function verify(): Promise<void> {
const result =
  await service.execute(request);

assert.deepEqual(
  result.guidance.map(
    (guidance) => guidance.id
  ),
  [
    "sync-low-first",
    "sync-high-second",
    "game-third",
    "async-fourth",
    "valid-after-invalid",
  ]
);

assert.equal(
  syncRequestWasFrozen,
  true
);
assert.equal(
  asyncProviderExecuted,
  true
);
assert.equal(
  ineligibleProviderExecuted,
  false
);

assert.deepEqual(
  result.providers.map(
    (provider) =>
      provider.status
  ),
  [
    "completed",
    "failed",
    "completed",
    "completed",
    "ineligible",
    "completed-with-failures",
    "failed",
  ]
);

assert.equal(
  result.providers[0]
    .filteredCount,
  2
);
assert.equal(
  result.providers[4]
    .eligibilityReason,
  "integration-not-supported"
);

assert.deepEqual(
  result.failures.map(
    (failure) => ({
      providerId:
        failure.providerId,
      stage: failure.stage,
      outputIndex:
        failure.outputIndex,
    })
  ),
  [
    {
      providerId:
        "provider.async-failure",
      stage: "execution",
      outputIndex: null,
    },
    {
      providerId:
        "provider.partial",
      stage: "output-validation",
      outputIndex: 0,
    },
    {
      providerId:
        "provider.partial",
      stage: "output-validation",
      outputIndex: 1,
    },
    {
      providerId:
        "provider.partial",
      stage: "output-validation",
      outputIndex: 2,
    },
    {
      providerId:
        "provider.invalid-collection",
      stage: "output-validation",
      outputIndex: null,
    },
  ]
);

assert.equal(
  Object.isFrozen(result),
  true
);
assert.equal(
  Object.isFrozen(
    result.guidance
  ),
  true
);
assert.equal(
  Object.isFrozen(
    result.failures[0]
  ),
  true
);
assert.equal(
  Object.isFrozen(
    result.providers[0]
  ),
  true
);

assert.throws(
  () =>
    new OracleCompanionGuidanceProviderService(
      [syncProvider, syncProvider]
    ),
  /registered more than once/
);

const requestedTypeService =
  new OracleCompanionGuidanceProviderService(
    [
      {
        manifest:
          createManifest(
            "provider.specific",
            null,
            ["knowledge"],
            ["specific-type"]
          ),
        provideGuidance: () => [],
      },
    ]
  );

const ineligibleResult =
  await requestedTypeService.execute({
    ...request,
    type: "different-type",
  });

assert.equal(
  ineligibleResult.providers[0]
    .eligibilityReason,
  "type-not-supported"
);

console.log(
  "Companion Guidance provider service verification passed."
);
}

function createManifest(
  id: string,
  integrationId: string | null = null,
  categories:
    readonly string[] = ["*"],
  types:
    readonly string[] = ["*"]
): OracleCompanionGuidancePackageManifest {
  return {
    id,
    version: "1.0.0",
    integrationId,
    categories,
    types,
  };
}

function createGuidance(
  input: Readonly<{
    id: string;
    providerId: string;
    priority?:
      "low" | "normal" | "high";
    spoilerLevel?:
      "none" | "minor" | "major" | "full";
    expiresAt?: string | null;
    integrationId?: string | null;
    type?: string;
  }>
) {
  const integrationId =
    input.integrationId ?? null;

  return {
    contract: {
      name:
        "oracle.companion-guidance",
      version: 1,
    },
    id: input.id,
    category: "knowledge",
    type:
      input.type ?? "general",
    title: "Test guidance",
    summary:
      "Test guidance summary.",
    delivery: "advisory",
    recommendation:
      "Consider the available evidence.",
    detailedExplanation: null,
    rationale:
      "The verification provider supplied deterministic evidence.",
    evidence: [],
    confidence: {
      score: 0.8,
      rationale:
        "The verification input is deterministic.",
    },
    priority:
      input.priority ?? "normal",
    sources: [],
    spoilerLevel:
      input.spoilerLevel ?? "none",
    reassessmentTrigger: null,
    provenance: {
      method: "verification",
      providerId:
        input.providerId,
      providerVersion: "1.0.0",
      generatedAt: requestedAt,
    },
    compatibility: {
      minimumCompanionVersion: null,
      integrationId,
      integrationVersion:
        integrationId === null
          ? null
          : "1.0.0",
      gameVersion: null,
    },
    createdAt: requestedAt,
    expiresAt:
      input.expiresAt ?? null,
  };
}

function isDeeplyFrozenRequest(
  value:
    OracleCompanionGuidanceRequest
): boolean {
  return (
    Object.isFrozen(value) &&
    Object.isFrozen(
      value.session
    ) &&
    Object.isFrozen(
      value.session.context
    ) &&
    Object.isFrozen(
      value.session.game?.context
    )
  );
}
