import assert from "node:assert/strict";
import type {
  OracleCompanionGuidanceRequest,
} from "../lib/companion/guidance";
import {
  createCallOfDutyCuratedGuidanceProvider,
} from "../lib/oracle/game-integrations/call-of-duty";
import {
  CALL_OF_DUTY_CURATED_GUIDANCE_CATALOGUE,
} from "../lib/oracle/game-integrations/call-of-duty/guidance/call-of-duty-curated-guidance-catalogue";
import {
  OracleCompanionGuidanceProviderService,
} from "../lib/oracle/services/companion-guidance";

const requestedAt =
  "2026-07-21T16:00:00.000Z";

const warzoneRequest =
  createRequest();

void verify();

async function verify(): Promise<void> {
  const provider =
    createCallOfDutyCuratedGuidanceProvider();
  const service =
    new OracleCompanionGuidanceProviderService(
      [provider]
    );

  assert.equal(
    Object.isFrozen(provider),
    true
  );
  assert.equal(
    Object.isFrozen(provider.manifest),
    true
  );

  const first =
    await service.execute(
      warzoneRequest
    );
  const second =
    await service.execute(
      warzoneRequest
    );

  assert.deepEqual(
    first,
    second,
    "Identical immutable requests must produce reproducible results."
  );
  assert.deepEqual(
    first.guidance.map(
      (guidance) => guidance.id
    ),
    [
      "call-of-duty.warzone.prepare-settings",
      "call-of-duty.warzone.learn-loadout",
      "call-of-duty.warzone.practice-fundamentals",
      "call-of-duty.warzone.complete-shader-preload",
    ],
    "Catalogue order must be preserved without ranking."
  );
  assert.equal(first.failures.length, 0);
  assert.deepEqual(
    first.providers[0],
    {
      providerId:
        "game-integrations.call-of-duty.curated-guidance",
      providerVersion: "1.0.0",
      status: "completed",
      eligibilityReason: null,
      acceptedCount: 4,
      filteredCount: 0,
      failureCount: 0,
    }
  );

  for (const guidance of first.guidance) {
    assert.equal(guidance.delivery, "advisory");
    assert.equal(
      guidance.provenance.method,
      "curated"
    );
    assert.equal(
      guidance.provenance.generatedAt,
      requestedAt
    );
    assert.equal(
      guidance.compatibility.integrationId,
      "call-of-duty"
    );
    assert.equal(
      guidance.compatibility.integrationVersion,
      "1.0.0"
    );
    assert.equal(guidance.spoilerLevel, "none");
    assert.ok(guidance.sources.length > 0);
    assert.ok(
      guidance.sources.every(
        (source) =>
          source.publisher ===
            "Call of Duty" ||
          source.publisher ===
            "Activision Support"
      )
    );
    assert.equal(
      isDeeplyFrozen(guidance),
      true
    );
  }

  const filtered =
    await service.execute(
      createRequest({
        category: "preparation",
        type: "loadout-familiarity",
      })
    );

  assert.deepEqual(
    filtered.guidance.map(
      (guidance) => guidance.id
    ),
    [
      "call-of-duty.warzone.learn-loadout",
    ]
  );

  const familyOnly =
    await service.execute(
      createRequest({
        detectedExperience: null,
      })
    );

  assert.equal(
    familyOnly.guidance.length,
    0,
    "Family-level detection must not imply Warzone guidance."
  );
  assert.equal(familyOnly.failures.length, 0);

  const futureIntegration =
    await service.execute(
      createRequest({
        integrationVersion: "2.0.0",
      })
    );

  assert.equal(
    futureIntegration.guidance.length,
    0,
    "A future integration version requires an explicit package compatibility review."
  );

  const otherGame =
    await service.execute(
      createRequest({
        integrationId: "different-game",
      })
    );

  assert.equal(otherGame.guidance.length, 0);
  assert.equal(
    otherGame.providers[0].status,
    "ineligible"
  );
  assert.equal(
    otherGame.providers[0]
      .eligibilityReason,
    "integration-not-supported"
  );

  const mutableEntry = {
    ...CALL_OF_DUTY_CURATED_GUIDANCE_CATALOGUE[0],
    title: "Snapshot title",
    sources:
      CALL_OF_DUTY_CURATED_GUIDANCE_CATALOGUE[0]
        .sources.map(
          (source) => ({
            ...source,
          })
        ),
  };
  const snapshotProvider =
    createCallOfDutyCuratedGuidanceProvider({
      catalogue: [mutableEntry],
    });

  mutableEntry.title = "Mutated title";
  mutableEntry.sources[0].title =
    "Mutated source";

  const snapshotResult =
    await new OracleCompanionGuidanceProviderService(
      [snapshotProvider]
    ).execute(warzoneRequest);

  assert.equal(
    snapshotResult.guidance[0].title,
    "Snapshot title"
  );
  assert.notEqual(
    snapshotResult.guidance[0]
      .sources[0].title,
    "Mutated source"
  );

  process.stdout.write(
    "Call of Duty curated guidance provider verification passed.\n"
  );
}

function createRequest(
  overrides: Readonly<{
    category?: string | null;
    type?: string | null;
    integrationId?: string;
    integrationVersion?: string;
    detectedExperience?:
      "warzone" | null;
  }> = {}
): OracleCompanionGuidanceRequest {
  return {
    contract: {
      name:
        "oracle.companion-guidance-request",
      version: 1,
    },
    requestId:
      "call-of-duty-guidance-request",
    requestedAt,
    session: {
      contract: {
        name:
          "oracle.companion-guidance-session-projection",
        version: 1,
      },
      sessionId: "call-of-duty-session",
      capturedAt: requestedAt,
      context: {},
      game: {
        integrationId:
          overrides.integrationId ??
          "call-of-duty",
        gameName: "Call of Duty",
        integrationVersion:
          overrides.integrationVersion ??
          "1.0.0",
        context: {
          supportedExperience: "warzone",
          detectedExperience:
            overrides.detectedExperience ===
            undefined
              ? "warzone"
              : overrides.detectedExperience,
        },
      },
    },
    category: overrides.category ?? null,
    type: overrides.type ?? null,
    operatorPrompt: null,
    maximumSpoilerLevel: "none",
  };
}

function isDeeplyFrozen(
  value: unknown,
  visited = new Set<object>()
): boolean {
  if (
    value === null ||
    typeof value !== "object"
  ) {
    return true;
  }

  if (visited.has(value)) {
    return true;
  }

  visited.add(value);

  return (
    Object.isFrozen(value) &&
    Object.values(value).every(
      (child) =>
        isDeeplyFrozen(child, visited)
    )
  );
}
