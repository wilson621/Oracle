import type {
  OracleCompanionGuidancePriority,
  OracleCompanionGuidanceSource,
  OracleCompanionGuidanceSpoilerLevel,
} from "../../../../companion/guidance";

export const CALL_OF_DUTY_GUIDANCE_SOURCE_REVIEWED_AT =
  "2026-07-21T00:00:00.000Z";

const WARZONE_HOW_TO_PLAY_SOURCE =
  Object.freeze({
    id: "call-of-duty-warzone-how-to-play",
    type: "official-guide",
    title: "Warzone: How to Play",
    uri: "https://www.callofduty.com/guides/training/call-of-duty-guides-warzone-how-to-play",
    publisher: "Call of Duty",
    version: null,
    verifiedAt:
      CALL_OF_DUTY_GUIDANCE_SOURCE_REVIEWED_AT,
  } satisfies OracleCompanionGuidanceSource);

const WARZONE_PC_TROUBLESHOOTING_SOURCE =
  Object.freeze({
    id: "activision-warzone-pc-troubleshooting",
    type: "official-support",
    title: "Call of Duty: Warzone PC Troubleshooting",
    uri: "https://support.activision.com/warzone-2/articles/warzone-2-pc-troubleshooting",
    publisher: "Activision Support",
    version: null,
    verifiedAt:
      CALL_OF_DUTY_GUIDANCE_SOURCE_REVIEWED_AT,
  } satisfies OracleCompanionGuidanceSource);

export type CallOfDutyCuratedGuidanceCatalogueEntry =
  Readonly<{
    id: string;
    category: string;
    type: string;
    title: string;
    summary: string;
    recommendation: string;
    detailedExplanation: string | null;
    rationale: string;
    evidenceSummary: string;
    confidenceScore: number;
    confidenceRationale: string;
    priority:
      OracleCompanionGuidancePriority;
    sources:
      readonly OracleCompanionGuidanceSource[];
    spoilerLevel:
      OracleCompanionGuidanceSpoilerLevel;
    reassessmentTrigger: string;
  }>;

/**
 * Reviewed, data-only knowledge owned by the Call of Duty Game Integration.
 * Catalogue order is significant and is preserved by the provider.
 */
export const CALL_OF_DUTY_CURATED_GUIDANCE_CATALOGUE =
  Object.freeze([
    createCatalogueEntry({
      id: "call-of-duty.warzone.prepare-settings",
      category: "preparation",
      type: "control-settings-review",
      title: "Tune settings before the session",
      summary:
        "Review control and sensitivity settings before entering a live match.",
      recommendation:
        "Use the settings menu and a low-pressure practice environment to find controls that let you turn comfortably while retaining accurate aim.",
      detailedExplanation:
        "Keep the adjustment Operator-led: change one setting at a time, practise with it, and retain the value only when it feels repeatable.",
      rationale:
        "The official Warzone guide recommends fine-tuning settings before a match. This is a stable preparation habit and does not depend on a weapon, map or seasonal balance state.",
      evidenceSummary:
        "The official guide identifies settings preparation as a recommended task before entering a Warzone match.",
      confidenceScore: 0.92,
      confidenceRationale:
        "The recommendation is a direct, conservative restatement of an official Call of Duty guide and avoids prescriptive values.",
      priority: "normal",
      sources:
        Object.freeze([
          WARZONE_HOW_TO_PLAY_SOURCE,
        ]),
      spoilerLevel: "none",
      reassessmentTrigger:
        "Reassess after a control-device change, a major settings reset or an official control-model update.",
    }),
    createCatalogueEntry({
      id: "call-of-duty.warzone.learn-loadout",
      category: "preparation",
      type: "loadout-familiarity",
      title: "Learn the role of your loadout",
      summary:
        "Understand the intended strengths and limitations of the equipment you choose.",
      recommendation:
        "Before relying on a loadout, practise with it long enough to understand the ranges and situations in which its weapon classes and equipment feel dependable to you.",
      detailedExplanation:
        "This guidance deliberately avoids naming weapons, attachments or a current meta. The useful skill is knowing the selected tools well enough to make your own decisions.",
      rationale:
        "The official Warzone guide advises Operators to know their equipped weapons and equipment before deciding how to engage.",
      evidenceSummary:
        "The official guide connects loadout familiarity with understanding weapon and equipment strengths.",
      confidenceScore: 0.9,
      confidenceRationale:
        "The recommendation follows official foundational guidance while excluding balance-sensitive loadout claims.",
      priority: "normal",
      sources:
        Object.freeze([
          WARZONE_HOW_TO_PLAY_SOURCE,
        ]),
      spoilerLevel: "none",
      reassessmentTrigger:
        "Reassess after changing a loadout or after an official update materially changes its components.",
    }),
    createCatalogueEntry({
      id: "call-of-duty.warzone.practice-fundamentals",
      category: "operator-development",
      type: "fundamentals-practice",
      title: "Build confidence in official training",
      summary:
        "Use an official training option to practise fundamentals when one is available.",
      recommendation:
        "Choose an in-game tutorial, training mode or other low-pressure official practice option before moving those fundamentals into standard matches.",
      detailedExplanation:
        "Training availability and names can change. Confirm the current options in the game rather than relying on a historic mode name.",
      rationale:
        "Call of Duty's official Warzone guide presents training as a way for new players to learn the experience and build confidence before a standard drop.",
      evidenceSummary:
        "The official guide describes an in-game training experience intended to help players learn the ropes and build confidence.",
      confidenceScore: 0.88,
      confidenceRationale:
        "The coaching principle is directly supported, while the recommendation remains conditional on current in-game availability.",
      priority: "normal",
      sources:
        Object.freeze([
          WARZONE_HOW_TO_PLAY_SOURCE,
        ]),
      spoilerLevel: "none",
      reassessmentTrigger:
        "Reassess when official training options change or the Operator no longer benefits from fundamentals practice.",
    }),
    createCatalogueEntry({
      id: "call-of-duty.warzone.complete-shader-preload",
      category: "performance",
      type: "shader-preload-readiness",
      title: "Let shader preloading finish on PC",
      summary:
        "On PC, allow Warzone shader preloading to complete before starting play.",
      recommendation:
        "If the game is preloading shaders, remain at the main menu until the process completes before entering a mode.",
      detailedExplanation:
        "This recommendation applies only to the PC version and only when shader preloading is in progress.",
      rationale:
        "Activision Support states that shader preloading is important during first boot and that leaving the main menu can stop it and contribute to performance issues.",
      evidenceSummary:
        "The official PC troubleshooting article directs players to allow shader preloading to complete before play.",
      confidenceScore: 0.97,
      confidenceRationale:
        "This is a direct operational recommendation from the current official Activision Support article.",
      priority: "normal",
      sources:
        Object.freeze([
          WARZONE_PC_TROUBLESHOOTING_SOURCE,
        ]),
      spoilerLevel: "none",
      reassessmentTrigger:
        "Reassess after shader preloading completes or Activision changes its PC troubleshooting guidance.",
    }),
  ]);

function createCatalogueEntry(
  entry:
    CallOfDutyCuratedGuidanceCatalogueEntry
): CallOfDutyCuratedGuidanceCatalogueEntry {
  return Object.freeze(entry);
}
