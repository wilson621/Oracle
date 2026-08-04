// scripts/sprint-30-5/stage-5-r1-execution/stage5-guidance-benchmark.ts
import assert from "node:assert/strict";
import fs from "node:fs";
import { performance } from "node:perf_hooks";

// lib/companion/guidance/companion-guidance-types.ts
var ORACLE_COMPANION_GUIDANCE_CONTRACT = "oracle.companion-guidance";
var ORACLE_COMPANION_GUIDANCE_CONTRACT_VERSION = 1;
var ORACLE_COMPANION_GUIDANCE_SESSION_CONTRACT = "oracle.companion-guidance-session-projection";
var ORACLE_COMPANION_GUIDANCE_SESSION_CONTRACT_VERSION = 1;
var ORACLE_COMPANION_GUIDANCE_REQUEST_CONTRACT = "oracle.companion-guidance-request";
var ORACLE_COMPANION_GUIDANCE_REQUEST_CONTRACT_VERSION = 1;

// lib/companion/guidance/companion-guidance-validation.ts
var SEMANTIC_VERSION_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;
function requirePlainRecord(value, path) {
  if (!isPlainRecord(value)) {
    throw new Error(
      `Oracle Companion Guidance '${path}' must be a plain record.`
    );
  }
  return value;
}
function requireNonEmptyString(value, path) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(
      `Oracle Companion Guidance '${path}' must be a non-empty string.`
    );
  }
  return value;
}
function requireNullableString(value, path) {
  if (value === null) {
    return null;
  }
  return requireNonEmptyString(
    value,
    path
  );
}
function requireIsoTimestamp(value, path) {
  const timestamp2 = requireNonEmptyString(
    value,
    path
  );
  if (Number.isNaN(
    Date.parse(timestamp2)
  ) || new Date(timestamp2).toISOString() !== timestamp2) {
    throw new Error(
      `Oracle Companion Guidance '${path}' must be a UTC ISO 8601 timestamp.`
    );
  }
  return timestamp2;
}
function requireNullableIsoTimestamp(value, path) {
  return value === null ? null : requireIsoTimestamp(
    value,
    path
  );
}
function requireSemanticVersion(value, path) {
  const version = requireNonEmptyString(
    value,
    path
  );
  if (!SEMANTIC_VERSION_PATTERN.test(
    version
  )) {
    throw new Error(
      `Oracle Companion Guidance '${path}' must use semantic versioning.`
    );
  }
  return version;
}
function requireNullableSemanticVersion(value, path) {
  return value === null ? null : requireSemanticVersion(
    value,
    path
  );
}
function requireFiniteNumber(value, path) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(
      `Oracle Companion Guidance '${path}' must be a finite number.`
    );
  }
  return value;
}
function requireStringArray(value, path) {
  if (!Array.isArray(value)) {
    throw new Error(
      `Oracle Companion Guidance '${path}' must be an array.`
    );
  }
  return value.map(
    (item, index) => requireNonEmptyString(
      item,
      `${path}[${index}]`
    )
  );
}
function requireHttpUri(value, path) {
  if (value === null) {
    return null;
  }
  const uri = requireNonEmptyString(
    value,
    path
  );
  let url;
  try {
    url = new URL(uri);
  } catch {
    throw new Error(
      `Oracle Companion Guidance '${path}' must be a valid HTTP or HTTPS URI.`
    );
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error(
      `Oracle Companion Guidance '${path}' must use HTTP or HTTPS.`
    );
  }
  return uri;
}
function assertSerializableData(value, path) {
  assertSerializableValue(
    value,
    path,
    /* @__PURE__ */ new WeakSet()
  );
}
function cloneSerializableRecord(value, path) {
  const record = requirePlainRecord(
    value,
    path
  );
  assertSerializableData(
    record,
    path
  );
  return structuredClone(
    record
  );
}
function deepFreeze(value) {
  if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }
  for (const nestedValue of Object.values(value)) {
    deepFreeze(nestedValue);
  }
  return Object.freeze(value);
}
function assertSerializableValue(value, path, ancestors) {
  if (value === null || typeof value === "string" || typeof value === "boolean") {
    return;
  }
  if (typeof value === "number") {
    requireFiniteNumber(
      value,
      path
    );
    return;
  }
  if (typeof value !== "object") {
    throw new Error(
      `Oracle Companion Guidance '${path}' contains non-serializable ${typeof value} data.`
    );
  }
  if (ancestors.has(value)) {
    throw new Error(
      `Oracle Companion Guidance '${path}' contains a circular reference.`
    );
  }
  if (!Array.isArray(value) && !isPlainRecord(value)) {
    throw new Error(
      `Oracle Companion Guidance '${path}' must contain only plain records and arrays.`
    );
  }
  ancestors.add(value);
  if (Array.isArray(value)) {
    assertSerializableArray(
      value,
      path,
      ancestors
    );
  } else {
    assertSerializableRecord(
      value,
      path,
      ancestors
    );
  }
  ancestors.delete(value);
}
function assertSerializableArray(values, path, ancestors) {
  for (let index = 0; index < values.length; index += 1) {
    if (!Object.prototype.hasOwnProperty.call(
      values,
      index
    )) {
      throw new Error(
        `Oracle Companion Guidance '${path}' contains a sparse array.`
      );
    }
    assertSerializableValue(
      values[index],
      `${path}[${index}]`,
      ancestors
    );
  }
  for (const key of Reflect.ownKeys(values)) {
    if (key === "length") {
      continue;
    }
    if (typeof key !== "string" || !isArrayIndex(
      key,
      values.length
    )) {
      throw new Error(
        `Oracle Companion Guidance '${path}' contains a non-serializable array property.`
      );
    }
  }
}
function assertSerializableRecord(record, path, ancestors) {
  for (const key of Reflect.ownKeys(record)) {
    if (typeof key !== "string") {
      throw new Error(
        `Oracle Companion Guidance '${path}' contains a symbol key.`
      );
    }
    const descriptor = Object.getOwnPropertyDescriptor(
      record,
      key
    );
    if (!descriptor || !descriptor.enumerable || !("value" in descriptor)) {
      throw new Error(
        `Oracle Companion Guidance '${path}.${key}' must be an enumerable data property.`
      );
    }
    assertSerializableValue(
      descriptor.value,
      `${path}.${key}`,
      ancestors
    );
  }
}
function isPlainRecord(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
function isArrayIndex(key, length) {
  const index = Number(key);
  return Number.isInteger(index) && index >= 0 && index < length && String(index) === key;
}

// lib/companion/guidance/companion-guidance-contract.ts
var PRIORITIES = ["low", "normal", "high"];
var SPOILER_LEVELS = [
  "none",
  "minor",
  "major",
  "full"
];
function createOracleCompanionGuidance(value) {
  assertSerializableData(
    value,
    "guidance"
  );
  const input = requirePlainRecord(
    value,
    "guidance"
  );
  const guidance = {
    contract: createContract(
      input.contract
    ),
    id: requireNonEmptyString(
      input.id,
      "guidance.id"
    ),
    category: requireNonEmptyString(
      input.category,
      "guidance.category"
    ),
    type: requireNonEmptyString(
      input.type,
      "guidance.type"
    ),
    title: requireNonEmptyString(
      input.title,
      "guidance.title"
    ),
    summary: requireNonEmptyString(
      input.summary,
      "guidance.summary"
    ),
    delivery: requireAdvisoryDelivery(
      input.delivery
    ),
    recommendation: requireNonEmptyString(
      input.recommendation,
      "guidance.recommendation"
    ),
    detailedExplanation: requireNullableString(
      input.detailedExplanation,
      "guidance.detailedExplanation"
    ),
    rationale: requireNonEmptyString(
      input.rationale,
      "guidance.rationale"
    ),
    evidence: createEvidence(
      input.evidence
    ),
    confidence: createConfidence(
      input.confidence
    ),
    priority: requirePriority(
      input.priority
    ),
    sources: createSources(
      input.sources
    ),
    spoilerLevel: requireSpoilerLevel(
      input.spoilerLevel
    ),
    reassessmentTrigger: requireNullableString(
      input.reassessmentTrigger,
      "guidance.reassessmentTrigger"
    ),
    provenance: createProvenance(
      input.provenance
    ),
    compatibility: createCompatibility(
      input.compatibility
    ),
    createdAt: requireIsoTimestamp(
      input.createdAt,
      "guidance.createdAt"
    ),
    expiresAt: requireNullableIsoTimestamp(
      input.expiresAt,
      "guidance.expiresAt"
    )
  };
  assertReferencesAreValid(
    guidance
  );
  assertExpiryIsValid(
    guidance.createdAt,
    guidance.expiresAt
  );
  return deepFreeze(guidance);
}
function requireAdvisoryDelivery(value) {
  if (value === "advisory") {
    return value;
  }
  throw new Error(
    "Oracle Companion Guidance delivery must be advisory."
  );
}
function createContract(value) {
  const contract = requirePlainRecord(
    value,
    "guidance.contract"
  );
  if (contract.name !== ORACLE_COMPANION_GUIDANCE_CONTRACT || contract.version !== ORACLE_COMPANION_GUIDANCE_CONTRACT_VERSION) {
    throw new Error(
      "Oracle Companion Guidance contract identity or version is unsupported."
    );
  }
  return {
    name: ORACLE_COMPANION_GUIDANCE_CONTRACT,
    version: ORACLE_COMPANION_GUIDANCE_CONTRACT_VERSION
  };
}
function createConfidence(value) {
  const confidence = requirePlainRecord(
    value,
    "guidance.confidence"
  );
  const score = requireFiniteNumber(
    confidence.score,
    "guidance.confidence.score"
  );
  if (score < 0 || score > 1) {
    throw new Error(
      "Oracle Companion Guidance confidence score must be between 0 and 1."
    );
  }
  return {
    score,
    level: score >= 0.75 ? "high" : score >= 0.45 ? "medium" : "low",
    rationale: requireNonEmptyString(
      confidence.rationale,
      "guidance.confidence.rationale"
    )
  };
}
function createEvidence(value) {
  if (!Array.isArray(value)) {
    throw new Error(
      "Oracle Companion Guidance 'guidance.evidence' must be an array."
    );
  }
  return value.map(
    (entry, index) => {
      const evidence = requirePlainRecord(
        entry,
        `guidance.evidence[${index}]`
      );
      return {
        id: requireNonEmptyString(
          evidence.id,
          `guidance.evidence[${index}].id`
        ),
        summary: requireNonEmptyString(
          evidence.summary,
          `guidance.evidence[${index}].summary`
        ),
        sourceIds: requireStringArray(
          evidence.sourceIds,
          `guidance.evidence[${index}].sourceIds`
        )
      };
    }
  );
}
function createSources(value) {
  if (!Array.isArray(value)) {
    throw new Error(
      "Oracle Companion Guidance 'guidance.sources' must be an array."
    );
  }
  return value.map(
    (entry, index) => {
      const source = requirePlainRecord(
        entry,
        `guidance.sources[${index}]`
      );
      return {
        id: requireNonEmptyString(
          source.id,
          `guidance.sources[${index}].id`
        ),
        type: requireNonEmptyString(
          source.type,
          `guidance.sources[${index}].type`
        ),
        title: requireNonEmptyString(
          source.title,
          `guidance.sources[${index}].title`
        ),
        uri: requireHttpUri(
          source.uri,
          `guidance.sources[${index}].uri`
        ),
        publisher: requireNullableString(
          source.publisher,
          `guidance.sources[${index}].publisher`
        ),
        version: requireNullableString(
          source.version,
          `guidance.sources[${index}].version`
        ),
        verifiedAt: requireNullableIsoTimestamp(
          source.verifiedAt,
          `guidance.sources[${index}].verifiedAt`
        )
      };
    }
  );
}
function createProvenance(value) {
  const provenance = requirePlainRecord(
    value,
    "guidance.provenance"
  );
  return {
    method: requireNonEmptyString(
      provenance.method,
      "guidance.provenance.method"
    ),
    providerId: requireNonEmptyString(
      provenance.providerId,
      "guidance.provenance.providerId"
    ),
    providerVersion: requireSemanticVersion(
      provenance.providerVersion,
      "guidance.provenance.providerVersion"
    ),
    generatedAt: requireIsoTimestamp(
      provenance.generatedAt,
      "guidance.provenance.generatedAt"
    )
  };
}
function createCompatibility(value) {
  const compatibility = requirePlainRecord(
    value,
    "guidance.compatibility"
  );
  const integrationId = requireNullableString(
    compatibility.integrationId,
    "guidance.compatibility.integrationId"
  );
  const integrationVersion = requireNullableSemanticVersion(
    compatibility.integrationVersion,
    "guidance.compatibility.integrationVersion"
  );
  if (integrationId === null !== (integrationVersion === null)) {
    throw new Error(
      "Oracle Companion Guidance integration compatibility requires both integrationId and integrationVersion, or neither."
    );
  }
  return {
    minimumCompanionVersion: requireNullableSemanticVersion(
      compatibility.minimumCompanionVersion,
      "guidance.compatibility.minimumCompanionVersion"
    ),
    integrationId,
    integrationVersion,
    gameVersion: requireNullableString(
      compatibility.gameVersion,
      "guidance.compatibility.gameVersion"
    )
  };
}
function requirePriority(value) {
  if (typeof value === "string" && PRIORITIES.includes(
    value
  )) {
    return value;
  }
  throw new Error(
    "Oracle Companion Guidance priority is unsupported."
  );
}
function requireSpoilerLevel(value) {
  if (typeof value === "string" && SPOILER_LEVELS.includes(
    value
  )) {
    return value;
  }
  throw new Error(
    "Oracle Companion Guidance spoiler level is unsupported."
  );
}
function assertReferencesAreValid(guidance) {
  assertUniqueIds(
    guidance.sources.map(
      (source) => source.id
    ),
    "source"
  );
  assertUniqueIds(
    guidance.evidence.map(
      (evidence) => evidence.id
    ),
    "evidence"
  );
  const sourceIds = new Set(
    guidance.sources.map(
      (source) => source.id
    )
  );
  for (const evidence of guidance.evidence) {
    for (const sourceId of evidence.sourceIds) {
      if (!sourceIds.has(sourceId)) {
        throw new Error(
          `Oracle Companion Guidance evidence '${evidence.id}' references unknown source '${sourceId}'.`
        );
      }
    }
  }
}
function assertUniqueIds(ids, label) {
  if (new Set(ids).size !== ids.length) {
    throw new Error(
      `Oracle Companion Guidance contains duplicate ${label} identifiers.`
    );
  }
}
function assertExpiryIsValid(createdAt, expiresAt) {
  if (expiresAt !== null && Date.parse(expiresAt) < Date.parse(createdAt)) {
    throw new Error(
      "Oracle Companion Guidance expiresAt cannot precede createdAt."
    );
  }
}

// lib/companion/guidance/companion-guidance-provider.ts
function createOracleCompanionGuidancePackageManifest(value) {
  assertSerializableData(
    value,
    "package"
  );
  const input = requirePlainRecord(
    value,
    "package"
  );
  const manifest = {
    id: requireNonEmptyString(
      input.id,
      "package.id"
    ),
    version: requireSemanticVersion(
      input.version,
      "package.version"
    ),
    integrationId: requireNullableString(
      input.integrationId,
      "package.integrationId"
    ),
    categories: requireUniqueStringArray(
      input.categories,
      "package.categories"
    ),
    types: requireUniqueStringArray(
      input.types,
      "package.types"
    )
  };
  return deepFreeze(manifest);
}
function requireUniqueStringArray(value, path) {
  const values = requireStringArray(
    value,
    path
  );
  if (values.length === 0) {
    throw new Error(
      `Oracle Companion Guidance '${path}' must declare at least one value.`
    );
  }
  if (new Set(values).size !== values.length) {
    throw new Error(
      `Oracle Companion Guidance '${path}' must not contain duplicate values.`
    );
  }
  return values;
}

// lib/companion/guidance/companion-guidance-session-contract.ts
var SPOILER_LEVELS2 = [
  "none",
  "minor",
  "major",
  "full"
];
function createOracleCompanionGuidanceSessionProjection(value) {
  assertSerializableData(
    value,
    "session"
  );
  const input = requirePlainRecord(
    value,
    "session"
  );
  const projection = {
    contract: createSessionContract(
      input.contract
    ),
    sessionId: requireNonEmptyString(
      input.sessionId,
      "session.sessionId"
    ),
    capturedAt: requireIsoTimestamp(
      input.capturedAt,
      "session.capturedAt"
    ),
    context: cloneSerializableRecord(
      input.context,
      "session.context"
    ),
    game: input.game === null ? null : createGameProjection(
      input.game
    )
  };
  return deepFreeze(
    projection
  );
}
function createOracleCompanionGuidanceRequest(value) {
  assertSerializableData(
    value,
    "request"
  );
  const input = requirePlainRecord(
    value,
    "request"
  );
  const request2 = {
    contract: createRequestContract(
      input.contract
    ),
    requestId: requireNonEmptyString(
      input.requestId,
      "request.requestId"
    ),
    requestedAt: requireIsoTimestamp(
      input.requestedAt,
      "request.requestedAt"
    ),
    session: createOracleCompanionGuidanceSessionProjection(
      input.session
    ),
    category: requireNullableString(
      input.category,
      "request.category"
    ),
    type: requireNullableString(
      input.type,
      "request.type"
    ),
    operatorPrompt: requireNullableString(
      input.operatorPrompt,
      "request.operatorPrompt"
    ),
    maximumSpoilerLevel: requireSpoilerLevel2(
      input.maximumSpoilerLevel,
      "request.maximumSpoilerLevel"
    )
  };
  return deepFreeze(request2);
}
function createRequestContract(value) {
  const contract = requirePlainRecord(
    value,
    "request.contract"
  );
  if (contract.name !== ORACLE_COMPANION_GUIDANCE_REQUEST_CONTRACT || contract.version !== ORACLE_COMPANION_GUIDANCE_REQUEST_CONTRACT_VERSION) {
    throw new Error(
      "Oracle Companion Guidance Request contract identity or version is unsupported."
    );
  }
  return {
    name: ORACLE_COMPANION_GUIDANCE_REQUEST_CONTRACT,
    version: ORACLE_COMPANION_GUIDANCE_REQUEST_CONTRACT_VERSION
  };
}
function createSessionContract(value) {
  const contract = requirePlainRecord(
    value,
    "session.contract"
  );
  if (contract.name !== ORACLE_COMPANION_GUIDANCE_SESSION_CONTRACT || contract.version !== ORACLE_COMPANION_GUIDANCE_SESSION_CONTRACT_VERSION) {
    throw new Error(
      "Oracle Companion Guidance Session contract identity or version is unsupported."
    );
  }
  return {
    name: ORACLE_COMPANION_GUIDANCE_SESSION_CONTRACT,
    version: ORACLE_COMPANION_GUIDANCE_SESSION_CONTRACT_VERSION
  };
}
function createGameProjection(value) {
  const game = requirePlainRecord(
    value,
    "session.game"
  );
  return {
    integrationId: requireNonEmptyString(
      game.integrationId,
      "session.game.integrationId"
    ),
    gameName: requireNonEmptyString(
      game.gameName,
      "session.game.gameName"
    ),
    integrationVersion: requireSemanticVersion(
      game.integrationVersion,
      "session.game.integrationVersion"
    ),
    context: cloneSerializableRecord(
      game.context,
      "session.game.context"
    )
  };
}
function requireSpoilerLevel2(value, path) {
  if (typeof value === "string" && SPOILER_LEVELS2.includes(
    value
  )) {
    return value;
  }
  throw new Error(
    `Oracle Companion Guidance '${path}' is unsupported.`
  );
}

// lib/oracle/game-integrations/call-of-duty/guidance/call-of-duty-curated-guidance-catalogue.ts
var CALL_OF_DUTY_GUIDANCE_SOURCE_REVIEWED_AT = "2026-07-21T00:00:00.000Z";
var WARZONE_HOW_TO_PLAY_SOURCE = Object.freeze({
  id: "call-of-duty-warzone-how-to-play",
  type: "official-guide",
  title: "Warzone: How to Play",
  uri: "https://www.callofduty.com/guides/training/call-of-duty-guides-warzone-how-to-play",
  publisher: "Call of Duty",
  version: null,
  verifiedAt: CALL_OF_DUTY_GUIDANCE_SOURCE_REVIEWED_AT
});
var WARZONE_PC_TROUBLESHOOTING_SOURCE = Object.freeze({
  id: "activision-warzone-pc-troubleshooting",
  type: "official-support",
  title: "Call of Duty: Warzone PC Troubleshooting",
  uri: "https://support.activision.com/warzone-2/articles/warzone-2-pc-troubleshooting",
  publisher: "Activision Support",
  version: null,
  verifiedAt: CALL_OF_DUTY_GUIDANCE_SOURCE_REVIEWED_AT
});
var CALL_OF_DUTY_CURATED_GUIDANCE_CATALOGUE = Object.freeze([
  createCatalogueEntry({
    id: "call-of-duty.warzone.prepare-settings",
    category: "preparation",
    type: "control-settings-review",
    title: "Tune settings before the session",
    summary: "Review control and sensitivity settings before entering a live match.",
    recommendation: "Use the settings menu and a low-pressure practice environment to find controls that let you turn comfortably while retaining accurate aim.",
    detailedExplanation: "Keep the adjustment Operator-led: change one setting at a time, practise with it, and retain the value only when it feels repeatable.",
    rationale: "The official Warzone guide recommends fine-tuning settings before a match. This is a stable preparation habit and does not depend on a weapon, map or seasonal balance state.",
    evidenceSummary: "The official guide identifies settings preparation as a recommended task before entering a Warzone match.",
    confidenceScore: 0.92,
    confidenceRationale: "The recommendation is a direct, conservative restatement of an official Call of Duty guide and avoids prescriptive values.",
    priority: "normal",
    sources: Object.freeze([
      WARZONE_HOW_TO_PLAY_SOURCE
    ]),
    spoilerLevel: "none",
    reassessmentTrigger: "Reassess after a control-device change, a major settings reset or an official control-model update."
  }),
  createCatalogueEntry({
    id: "call-of-duty.warzone.learn-loadout",
    category: "preparation",
    type: "loadout-familiarity",
    title: "Learn the role of your loadout",
    summary: "Understand the intended strengths and limitations of the equipment you choose.",
    recommendation: "Before relying on a loadout, practise with it long enough to understand the ranges and situations in which its weapon classes and equipment feel dependable to you.",
    detailedExplanation: "This guidance deliberately avoids naming weapons, attachments or a current meta. The useful skill is knowing the selected tools well enough to make your own decisions.",
    rationale: "The official Warzone guide advises Operators to know their equipped weapons and equipment before deciding how to engage.",
    evidenceSummary: "The official guide connects loadout familiarity with understanding weapon and equipment strengths.",
    confidenceScore: 0.9,
    confidenceRationale: "The recommendation follows official foundational guidance while excluding balance-sensitive loadout claims.",
    priority: "normal",
    sources: Object.freeze([
      WARZONE_HOW_TO_PLAY_SOURCE
    ]),
    spoilerLevel: "none",
    reassessmentTrigger: "Reassess after changing a loadout or after an official update materially changes its components."
  }),
  createCatalogueEntry({
    id: "call-of-duty.warzone.practice-fundamentals",
    category: "operator-development",
    type: "fundamentals-practice",
    title: "Build confidence in official training",
    summary: "Use an official training option to practise fundamentals when one is available.",
    recommendation: "Choose an in-game tutorial, training mode or other low-pressure official practice option before moving those fundamentals into standard matches.",
    detailedExplanation: "Training availability and names can change. Confirm the current options in the game rather than relying on a historic mode name.",
    rationale: "Call of Duty's official Warzone guide presents training as a way for new players to learn the experience and build confidence before a standard drop.",
    evidenceSummary: "The official guide describes an in-game training experience intended to help players learn the ropes and build confidence.",
    confidenceScore: 0.88,
    confidenceRationale: "The coaching principle is directly supported, while the recommendation remains conditional on current in-game availability.",
    priority: "normal",
    sources: Object.freeze([
      WARZONE_HOW_TO_PLAY_SOURCE
    ]),
    spoilerLevel: "none",
    reassessmentTrigger: "Reassess when official training options change or the Operator no longer benefits from fundamentals practice."
  }),
  createCatalogueEntry({
    id: "call-of-duty.warzone.complete-shader-preload",
    category: "performance",
    type: "shader-preload-readiness",
    title: "Let shader preloading finish on PC",
    summary: "On PC, allow Warzone shader preloading to complete before starting play.",
    recommendation: "If the game is preloading shaders, remain at the main menu until the process completes before entering a mode.",
    detailedExplanation: "This recommendation applies only to the PC version and only when shader preloading is in progress.",
    rationale: "Activision Support states that shader preloading is important during first boot and that leaving the main menu can stop it and contribute to performance issues.",
    evidenceSummary: "The official PC troubleshooting article directs players to allow shader preloading to complete before play.",
    confidenceScore: 0.97,
    confidenceRationale: "This is a direct operational recommendation from the current official Activision Support article.",
    priority: "normal",
    sources: Object.freeze([
      WARZONE_PC_TROUBLESHOOTING_SOURCE
    ]),
    spoilerLevel: "none",
    reassessmentTrigger: "Reassess after shader preloading completes or Activision changes its PC troubleshooting guidance."
  })
]);
function createCatalogueEntry(entry) {
  return Object.freeze(entry);
}

// lib/oracle/game-integrations/call-of-duty/guidance/call-of-duty-curated-guidance-provider.ts
var CALL_OF_DUTY_CURATED_GUIDANCE_PROVIDER_ID = "game-integrations.call-of-duty.curated-guidance";
var CALL_OF_DUTY_CURATED_GUIDANCE_PROVIDER_VERSION = "1.0.0";
var CALL_OF_DUTY_CURATED_GUIDANCE_PROVIDER_MANIFEST = createOracleCompanionGuidancePackageManifest({
  id: CALL_OF_DUTY_CURATED_GUIDANCE_PROVIDER_ID,
  version: CALL_OF_DUTY_CURATED_GUIDANCE_PROVIDER_VERSION,
  integrationId: "call-of-duty",
  categories: [
    "preparation",
    "operator-development",
    "performance"
  ],
  types: [
    "control-settings-review",
    "loadout-familiarity",
    "fundamentals-practice",
    "shader-preload-readiness"
  ]
});
var DEFAULT_DEPENDENCIES = Object.freeze({
  catalogue: CALL_OF_DUTY_CURATED_GUIDANCE_CATALOGUE
});
function createCallOfDutyCuratedGuidanceProvider(dependencies = DEFAULT_DEPENDENCIES) {
  const catalogue = snapshotCatalogue(
    dependencies.catalogue
  );
  return Object.freeze({
    manifest: CALL_OF_DUTY_CURATED_GUIDANCE_PROVIDER_MANIFEST,
    provideGuidance(request2) {
      if (!isSupportedWarzoneSession(request2)) {
        return Object.freeze([]);
      }
      const applicableEntries = catalogue.filter(
        (entry) => (request2.category === null || request2.category === entry.category) && (request2.type === null || request2.type === entry.type)
      );
      return Object.freeze(
        applicableEntries.map(
          (entry) => createGuidanceCandidate(
            request2,
            entry
          )
        )
      );
    }
  });
}
function snapshotCatalogue(catalogue) {
  if (!Array.isArray(catalogue)) {
    throw new Error(
      "Call of Duty curated guidance catalogue must be an array."
    );
  }
  return Object.freeze(
    catalogue.map(
      (entry) => Object.freeze({
        ...entry,
        sources: Object.freeze(
          entry.sources.map(
            (source) => Object.freeze({
              ...source
            })
          )
        )
      })
    )
  );
}
function isSupportedWarzoneSession(request2) {
  const game = request2.session.game;
  return game?.integrationId === "call-of-duty" && game.integrationVersion === "1.0.0" && game.context.supportedExperience === "warzone" && game.context.detectedExperience === "warzone";
}
function createGuidanceCandidate(request2, entry) {
  const evidenceId = `${entry.id}.evidence`;
  return {
    contract: {
      name: "oracle.companion-guidance",
      version: 1
    },
    id: entry.id,
    category: entry.category,
    type: entry.type,
    title: entry.title,
    summary: entry.summary,
    delivery: "advisory",
    recommendation: entry.recommendation,
    detailedExplanation: entry.detailedExplanation,
    rationale: entry.rationale,
    evidence: [
      {
        id: evidenceId,
        summary: entry.evidenceSummary,
        sourceIds: entry.sources.map(
          (source) => source.id
        )
      }
    ],
    confidence: {
      score: entry.confidenceScore,
      level: confidenceLevel(
        entry.confidenceScore
      ),
      rationale: entry.confidenceRationale
    },
    priority: entry.priority,
    sources: entry.sources,
    spoilerLevel: entry.spoilerLevel,
    reassessmentTrigger: entry.reassessmentTrigger,
    provenance: {
      method: "curated",
      providerId: CALL_OF_DUTY_CURATED_GUIDANCE_PROVIDER_ID,
      providerVersion: CALL_OF_DUTY_CURATED_GUIDANCE_PROVIDER_VERSION,
      generatedAt: request2.requestedAt
    },
    compatibility: {
      minimumCompanionVersion: null,
      integrationId: request2.session.game.integrationId,
      integrationVersion: request2.session.game.integrationVersion,
      gameVersion: null
    },
    createdAt: request2.requestedAt,
    expiresAt: null
  };
}
function confidenceLevel(score) {
  return score >= 0.75 ? "high" : score >= 0.45 ? "medium" : "low";
}

// lib/oracle/services/companion-guidance/companion-guidance-provider-service.ts
var WILDCARD_CAPABILITY = "*";
var DEFAULT_EXECUTION_POLICY = Object.freeze({
  maximumSourceAgeMs: 180 * 24 * 60 * 60 * 1e3
});
var SPOILER_ORDER = Object.freeze({
  none: 0,
  minor: 1,
  major: 2,
  full: 3
});
var OracleCompanionGuidanceProviderService = class {
  constructor(providers, policy = DEFAULT_EXECUTION_POLICY) {
    this.policy = policy;
    if (this.policy.maximumSourceAgeMs !== null && (!Number.isFinite(this.policy.maximumSourceAgeMs) || this.policy.maximumSourceAgeMs < 0)) {
      throw new Error(
        "Oracle Companion Guidance source freshness policy is invalid."
      );
    }
    this.providers = createProviderSnapshot(
      providers
    );
  }
  getProviderManifests() {
    return Object.freeze(
      this.providers.map(
        (provider) => provider.manifest
      )
    );
  }
  async execute(value) {
    const request2 = createOracleCompanionGuidanceRequest(
      value
    );
    const guidance = [];
    const failures = [];
    const executions = [];
    const acceptedIds = /* @__PURE__ */ new Set();
    for (const provider of this.providers) {
      const eligibilityReason = getEligibilityReason(
        provider.manifest,
        request2
      );
      if (eligibilityReason) {
        executions.push(
          createExecution({
            provider,
            status: "ineligible",
            eligibilityReason
          })
        );
        continue;
      }
      const execution = await executeProvider({
        provider,
        request: request2,
        acceptedIds,
        policy: this.policy
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
      guidance: Object.freeze(guidance),
      failures: Object.freeze(failures),
      providers: Object.freeze(executions)
    });
  }
};
function createProviderSnapshot(providers) {
  if (!Array.isArray(providers)) {
    throw new Error(
      "Oracle Companion Guidance providers must be supplied as an array."
    );
  }
  const providerIds = /* @__PURE__ */ new Set();
  const snapshot = providers.map(
    (provider, index) => {
      if (provider === null || typeof provider !== "object" || typeof provider.provideGuidance !== "function") {
        throw new Error(
          `Oracle Companion Guidance provider at index ${index} is invalid.`
        );
      }
      const manifest = createOracleCompanionGuidancePackageManifest(
        provider.manifest
      );
      if (providerIds.has(
        manifest.id
      )) {
        throw new Error(
          `Oracle Companion Guidance provider '${manifest.id}' is registered more than once.`
        );
      }
      providerIds.add(
        manifest.id
      );
      return Object.freeze({
        manifest,
        provideGuidance: (request2) => provider.provideGuidance(
          request2
        )
      });
    }
  );
  return Object.freeze(snapshot);
}
function getEligibilityReason(manifest, request2) {
  if (manifest.integrationId) {
    if (!request2.session.game) {
      return "integration-not-active";
    }
    if (request2.session.game.integrationId !== manifest.integrationId) {
      return "integration-not-supported";
    }
  }
  if (request2.category && !supportsValue(
    manifest.categories,
    request2.category
  )) {
    return "category-not-supported";
  }
  if (request2.type && !supportsValue(
    manifest.types,
    request2.type
  )) {
    return "type-not-supported";
  }
  return null;
}
async function executeProvider(input) {
  let output2;
  try {
    output2 = await input.provider.provideGuidance(
      input.request
    );
  } catch (error) {
    const failure = createFailure({
      provider: input.provider,
      stage: "execution",
      code: "guidance.provider-execution-failed",
      message: getErrorMessage(error),
      outputIndex: null
    });
    return Object.freeze({
      guidance: Object.freeze([]),
      failures: Object.freeze([failure]),
      provider: createExecution({
        provider: input.provider,
        status: "failed",
        failureCount: 1
      })
    });
  }
  if (!Array.isArray(output2)) {
    const failure = createFailure({
      provider: input.provider,
      stage: "output-validation",
      code: "guidance.provider-output-not-array",
      message: "Guidance provider output must be an array.",
      outputIndex: null
    });
    return Object.freeze({
      guidance: Object.freeze([]),
      failures: Object.freeze([failure]),
      provider: createExecution({
        provider: input.provider,
        status: "failed",
        failureCount: 1
      })
    });
  }
  const guidance = [];
  const failures = [];
  let filteredCount = 0;
  for (let index = 0; index < output2.length; index += 1) {
    try {
      const candidate = createOracleCompanionGuidance(
        output2[index]
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
      if (shouldFilterGuidance(
        input.request,
        candidate,
        input.policy
      )) {
        filteredCount += 1;
        continue;
      }
      if (input.acceptedIds.has(
        candidate.id
      )) {
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
          provider: input.provider,
          stage: "output-validation",
          code: "guidance.provider-output-invalid",
          message: getErrorMessage(error),
          outputIndex: index
        })
      );
    }
  }
  return Object.freeze({
    guidance: Object.freeze(guidance),
    failures: Object.freeze(failures),
    provider: createExecution({
      provider: input.provider,
      status: failures.length > 0 ? "completed-with-failures" : "completed",
      acceptedCount: guidance.length,
      filteredCount,
      failureCount: failures.length
    })
  });
}
function assertProviderOwnsGuidance(provider, guidance) {
  if (guidance.provenance.providerId !== provider.manifest.id || guidance.provenance.providerVersion !== provider.manifest.version) {
    throw new Error(
      "Guidance provenance does not match the executing provider manifest."
    );
  }
  if (!supportsValue(
    provider.manifest.categories,
    guidance.category
  ) || !supportsValue(
    provider.manifest.types,
    guidance.type
  )) {
    throw new Error(
      "Guidance category or type is not declared by the executing provider."
    );
  }
}
function assertRequestMatchesGuidance(request2, guidance) {
  if (request2.category && request2.category !== guidance.category) {
    throw new Error(
      "Guidance category does not match the request."
    );
  }
  if (request2.type && request2.type !== guidance.type) {
    throw new Error(
      "Guidance type does not match the request."
    );
  }
}
function assertIntegrationCompatibility(provider, request2, guidance) {
  const activeGame = request2.session.game;
  const compatibility = guidance.compatibility;
  if (compatibility.integrationId === null) {
    if (provider.manifest.integrationId !== null) {
      throw new Error(
        "Integration-specific provider output must declare integration compatibility."
      );
    }
    return;
  }
  if (!activeGame || compatibility.integrationId !== activeGame.integrationId || compatibility.integrationVersion !== activeGame.integrationVersion) {
    throw new Error(
      "Guidance integration compatibility does not match the active Session projection."
    );
  }
  if (provider.manifest.integrationId && compatibility.integrationId !== provider.manifest.integrationId) {
    throw new Error(
      "Guidance integration compatibility does not match the provider manifest."
    );
  }
}
function shouldFilterGuidance(request2, guidance, policy) {
  if (SPOILER_ORDER[guidance.spoilerLevel] > SPOILER_ORDER[request2.maximumSpoilerLevel]) {
    return true;
  }
  if (policy.maximumSourceAgeMs !== null && guidance.sources.some(
    (source) => {
      if (source.verifiedAt === null) {
        return true;
      }
      const age = Date.parse(request2.requestedAt) - Date.parse(source.verifiedAt);
      return age < 0 || age > policy.maximumSourceAgeMs;
    }
  )) {
    return true;
  }
  return guidance.expiresAt !== null && Date.parse(
    guidance.expiresAt
  ) <= Date.parse(
    request2.requestedAt
  );
}
function supportsValue(supported, value) {
  return supported.includes(value) || supported.includes(
    WILDCARD_CAPABILITY
  );
}
function createFailure(input) {
  return Object.freeze({
    providerId: input.provider.manifest.id,
    providerVersion: input.provider.manifest.version,
    stage: input.stage,
    code: input.code,
    message: input.message,
    outputIndex: input.outputIndex
  });
}
function createExecution(input) {
  return Object.freeze({
    providerId: input.provider.manifest.id,
    providerVersion: input.provider.manifest.version,
    status: input.status,
    eligibilityReason: input.eligibilityReason ?? null,
    acceptedCount: input.acceptedCount ?? 0,
    filteredCount: input.filteredCount ?? 0,
    failureCount: input.failureCount ?? 0
  });
}
function getErrorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

// scripts/sprint-30-5/stage-5-r1-execution/stage5-guidance-benchmark.ts
var output = process.env.ORACLE_STAGE5_GUIDANCE_OUTPUT;
if (!output) throw new Error("Stage 5 Guidance output is absent.");
if (fs.existsSync(output)) throw new Error("Stage 5 Guidance output is create-only.");
var service = new OracleCompanionGuidanceProviderService([createCallOfDutyCuratedGuidanceProvider()]);
var timestamp = "2026-08-04T00:00:00.000Z";
var request = {
  contract: { name: "oracle.companion-guidance-request", version: 1 },
  requestId: "stage5-r1-qualified-guidance",
  requestedAt: timestamp,
  session: { contract: { name: "oracle.companion-guidance-session-projection", version: 1 }, sessionId: "stage5-r1-qualified-session", capturedAt: timestamp, context: {}, game: { integrationId: "call-of-duty", gameName: "Call of Duty", integrationVersion: "1.0.0", context: { supportedExperience: "warzone", detectedExperience: "warzone" } } },
  category: null,
  type: null,
  operatorPrompt: null,
  maximumSpoilerLevel: "none"
};
for (let index = 0; index < 50; index++) await service.execute(request);
var durationsMilliseconds = [];
for (let index = 0; index < 1e3; index++) {
  const started = performance.now();
  const result = await service.execute(request);
  durationsMilliseconds.push(performance.now() - started);
  assert.equal(result.guidance.length, 4);
  assert.equal(result.failures.length, 0);
}
fs.writeFileSync(output, `${JSON.stringify({ contract: "oracle.sprint-30-5.stage-5-r1-guidance-latency", result: "passed", classification: "GOVERNED-STAGE-5-R1-QUALIFICATION", durationsMilliseconds }, null, 2)}
`, { encoding: "utf8", flag: "wx" });
