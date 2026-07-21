import assert from "node:assert/strict";
import {
  createOracleCompanionGuidance,
  createOracleCompanionGuidancePackageManifest,
  createOracleCompanionGuidanceRequest,
  isOracleCompanionGuidance,
} from "../lib/companion/guidance/index";

const capturedAt =
  "2026-07-21T12:00:00.000Z";

const sessionInput = {
  contract: {
    name:
      "oracle.companion-guidance-session-projection",
    version: 1,
  },
  sessionId: "session-1",
  capturedAt,
  context: {
    analysisScope: "current-session",
  },
  game: {
    integrationId: "example-game",
    gameName: "Example Game",
    integrationVersion: "1.0.0",
    context: {
      mode: "exploration",
      nested: {
        objective: "Find the archive",
      },
    },
  },
};

const guidanceInput = {
  contract: {
    name: "oracle.companion-guidance",
    version: 1,
  },
  id: "guidance-1",
  category: "future-analysis-domain",
  type: "future-guidance-type",
  title: "Review the available evidence",
  summary:
    "Evidence supports reviewing the objective before continuing.",
  delivery: "advisory",
  recommendation:
    "Consider reviewing the objective details.",
  detailedExplanation: null,
  rationale:
    "The current context contains an unresolved objective.",
  evidence: [
    {
      id: "evidence-1",
      summary:
        "The Session projection contains an active objective.",
      sourceIds: ["source-1"],
    },
  ],
  confidence: {
    score: 0.8,
    rationale:
      "The objective is present in validated Session Context.",
  },
  priority: "normal",
  sources: [
    {
      id: "source-1",
      type: "future-source-type",
      title: "Validated Session Context",
      uri: null,
      publisher: "Oracle",
      version: "1",
      verifiedAt: capturedAt,
    },
  ],
  spoilerLevel: "none",
  reassessmentTrigger:
    "Reassess when the objective changes.",
  provenance: {
    method: "future-provider-method",
    providerId: "oracle.example-provider",
    providerVersion: "1.0.0",
    generatedAt: capturedAt,
  },
  compatibility: {
    minimumCompanionVersion: "1.0.0",
    integrationId: "example-game",
    integrationVersion: "1.0.0",
    gameVersion: null,
  },
  createdAt: capturedAt,
  expiresAt: null,
  compatibleFutureField: {
    value: "ignored safely by a version 1 consumer",
  },
};

const request =
  createOracleCompanionGuidanceRequest({
    contract: {
      name:
        "oracle.companion-guidance-request",
      version: 1,
    },
    requestId: "request-1",
    requestedAt: capturedAt,
    session: sessionInput,
    category: null,
    type: "future-guidance-type",
    operatorPrompt: null,
    maximumSpoilerLevel: "minor",
  });

const guidance =
  createOracleCompanionGuidance(
    guidanceInput
  );

const manifest =
  createOracleCompanionGuidancePackageManifest({
    id: "oracle.example-package",
    version: "1.0.0",
    integrationId: "example-game",
    categories: ["future-analysis-domain"],
    types: ["future-guidance-type"],
  });

assert.equal(
  guidance.type,
  "future-guidance-type"
);
assert.equal(
  guidance.confidence.level,
  "high"
);
assert.equal(
  isOracleCompanionGuidance(
    guidanceInput
  ),
  true
);

assert.equal(
  Object.isFrozen(guidance),
  true
);
assert.equal(
  Object.isFrozen(
    guidance.evidence
  ),
  true
);
assert.equal(
  Object.isFrozen(
    guidance.evidence[0]
      .sourceIds
  ),
  true
);
assert.equal(
  Object.isFrozen(
    request.session.game?.context
  ),
  true
);
assert.equal(
  Object.isFrozen(
    request.session.context
  ),
  true
);
assert.equal(
  Object.isFrozen(manifest.types),
  true
);

sessionInput.game.context.nested.objective =
  "Mutated after validation";

assert.equal(
  JSON.stringify(
    request.session.game?.context
  ),
  JSON.stringify({
    mode: "exploration",
    nested: {
      objective: "Find the archive",
    },
  })
);

assert.throws(
  () =>
    createOracleCompanionGuidance({
      ...guidanceInput,
      executableExtension: () =>
        "must be rejected",
    }),
  /non-serializable function data/
);

assert.throws(
  () =>
    createOracleCompanionGuidanceRequest({
      contract: {
        name:
          "oracle.companion-guidance-request",
        version: 1,
      },
      requestId: "request-2",
      requestedAt: capturedAt,
      session: {
        ...sessionInput,
        game: {
          ...sessionInput.game,
          context: {
            unsafe: new Date(),
          },
        },
      },
      category: null,
      type: null,
      operatorPrompt: null,
      maximumSpoilerLevel: "none",
    }),
  /plain records and arrays/
);

assert.throws(
  () =>
    createOracleCompanionGuidance({
      ...guidanceInput,
      contract: {
        name:
          "oracle.companion-guidance",
        version: 2,
      },
    }),
  /unsupported/
);

assert.throws(
  () =>
    createOracleCompanionGuidance({
      ...guidanceInput,
      evidence: [
        {
          id: "evidence-1",
          summary: "Invalid reference",
          sourceIds: ["unknown-source"],
        },
      ],
    }),
  /references unknown source/
);

const accessorInput = {
  ...guidanceInput,
};

Object.defineProperty(
  accessorInput,
  "unsafeAccessor",
  {
    enumerable: true,
    get: () => "must not execute",
  }
);

assert.throws(
  () =>
    createOracleCompanionGuidance(
      accessorInput
    ),
  /enumerable data property/
);

console.log(
  "Companion Guidance contract verification passed."
);
