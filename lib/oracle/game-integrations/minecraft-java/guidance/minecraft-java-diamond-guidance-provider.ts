import {
  createOracleCompanionGuidancePackageManifest,
  type OracleCompanionGuidanceProvider,
  type OracleCompanionGuidanceRequest,
  type OracleCompanionGuidanceSpoilerLevel,
} from "../../../../companion/guidance";
import {
  MINECRAFT_JAVA_CERTIFIED_GAME_VERSION,
} from "../minecraft-java-compatibility-certificate";
import {
  MINECRAFT_JAVA_INTEGRATION_ID,
  MINECRAFT_JAVA_INTEGRATION_VERSION,
} from "../minecraft-java-integration";

export const MINECRAFT_JAVA_DIAMOND_GUIDANCE_PROVIDER_ID =
  "game-integrations.minecraft-java.diamond-discovery-guidance";
export const MINECRAFT_JAVA_DIAMOND_GUIDANCE_PROVIDER_VERSION = "1.0.0";

export const MINECRAFT_JAVA_DIAMOND_GUIDANCE_PROVIDER_MANIFEST =
  createOracleCompanionGuidancePackageManifest({
    id: MINECRAFT_JAVA_DIAMOND_GUIDANCE_PROVIDER_ID,
    version: MINECRAFT_JAVA_DIAMOND_GUIDANCE_PROVIDER_VERSION,
    integrationId: MINECRAFT_JAVA_INTEGRATION_ID,
    categories: ["discovery"],
    types: ["diamond-advancement-journey"],
  });

const SPOILER_ORDER: Record<OracleCompanionGuidanceSpoilerLevel, number> = {
  none: 0,
  minor: 1,
  major: 2,
  full: 3,
};

const STEPS = Object.freeze([
  Object.freeze({
    id: "minecraft-java.diamond-discovery.prepare",
    spoilerLevel: "none" as const,
    title: "Prepare for a careful underground journey",
    summary: "Bring reliable tools, food, light and spare building blocks.",
    recommendation:
      "Prepare before descending, keep a safe route back, and explore at your own pace.",
    detail:
      "This first hint deliberately avoids a location answer. It focuses on surviving the discovery journey.",
  }),
  Object.freeze({
    id: "minecraft-java.diamond-discovery.go-deeper",
    spoilerLevel: "minor" as const,
    title: "Search deep underground",
    summary: "Diamond ore is associated with the deeper parts of the world.",
    recommendation:
      "Continue downward cautiously, watching for hazards and preserving a marked return route.",
    detail:
      "The official source describes diamonds as a deep-underground discovery. No automated action is taken.",
  }),
  Object.freeze({
    id: "minecraft-java.diamond-discovery.inspect-stone",
    spoilerLevel: "major" as const,
    title: "Inspect concealed rock as well as open caves",
    summary: "A visible cave is not the only place worth searching.",
    recommendation:
      "Use a deliberate mining route and inspect newly exposed stone while keeping lava safety in mind.",
    detail:
      "This narrows the search without claiming that Oracle observed an ore block or completed an advancement.",
  }),
  Object.freeze({
    id: "minecraft-java.diamond-discovery.secure-find",
    spoilerLevel: "full" as const,
    title: "Secure the area before mining",
    summary: "Treat lava and hidden drops as the immediate risk around a find.",
    recommendation:
      "Light and inspect the area, block exposed lava where practical, then mine the ore manually with an appropriate tool.",
    detail:
      "Oracle provides text only. The Operator retains all gameplay control and confirms any progress.",
  }),
]);

export function createMinecraftJavaDiamondGuidanceProvider():
  OracleCompanionGuidanceProvider {
  return Object.freeze({
    manifest: MINECRAFT_JAVA_DIAMOND_GUIDANCE_PROVIDER_MANIFEST,
    provideGuidance(request: OracleCompanionGuidanceRequest) {
      if (!isEligibleRequest(request)) {
        return Object.freeze([]);
      }
      const maximum = SPOILER_ORDER[request.maximumSpoilerLevel];
      return Object.freeze(
        STEPS.filter(
          (step) => SPOILER_ORDER[step.spoilerLevel] <= maximum
        ).map((step) => ({
          contract: { name: "oracle.companion-guidance", version: 1 },
          id: step.id,
          category: "discovery",
          type: "diamond-advancement-journey",
          title: step.title,
          summary: step.summary,
          delivery: "advisory",
          recommendation: step.recommendation,
          detailedExplanation: step.detail,
          rationale:
            "Original bounded guidance derived from reviewed official Minecraft material for a Founder-controlled single-player journey.",
          evidence: [{
            id: `${step.id}.evidence`,
            summary:
              "The approved journey is bounded to manual, local, single-player discovery.",
            sourceIds: ["minecraft-official-diamond-inventory"],
          }],
          confidence: {
            score: 0.82,
            level: "high",
            rationale:
              "The recommendation is conservative, version-bounded, and does not infer completion from screen pixels.",
          },
          priority: "normal",
          sources: [{
            id: "minecraft-official-diamond-inventory",
            type: "official-guide",
            title: "Taking Inventory: Diamond",
            uri: "https://www.minecraft.net/en-us/article/taking-inventory--diamond",
            publisher: "Minecraft",
            version: null,
            verifiedAt: "2026-07-25T00:00:00.000Z",
          }],
          spoilerLevel: step.spoilerLevel,
          reassessmentTrigger:
            "Reassess when the Operator requests another spoiler level, the Context changes, or the compatibility certificate changes.",
          provenance: {
            method: "curated",
            providerId: MINECRAFT_JAVA_DIAMOND_GUIDANCE_PROVIDER_ID,
            providerVersion: MINECRAFT_JAVA_DIAMOND_GUIDANCE_PROVIDER_VERSION,
            generatedAt: request.requestedAt,
          },
          compatibility: {
            minimumCompanionVersion: null,
            integrationId: MINECRAFT_JAVA_INTEGRATION_ID,
            integrationVersion: MINECRAFT_JAVA_INTEGRATION_VERSION,
            gameVersion: MINECRAFT_JAVA_CERTIFIED_GAME_VERSION,
          },
          createdAt: request.requestedAt,
          expiresAt: null,
        }))
      );
    },
  });
}

function isEligibleRequest(request: OracleCompanionGuidanceRequest): boolean {
  const game = request.session.game;
  return (
    game?.integrationId === MINECRAFT_JAVA_INTEGRATION_ID &&
    game.integrationVersion === MINECRAFT_JAVA_INTEGRATION_VERSION &&
    game.context.detectedGameVersion ===
      MINECRAFT_JAVA_CERTIFIED_GAME_VERSION &&
    game.context.playerMode === "single-player" &&
    (request.category === null || request.category === "discovery") &&
    (request.type === null ||
      request.type === "diamond-advancement-journey")
  );
}
