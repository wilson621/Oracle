import type {
  LoadoutRecommendation,
  WeaponPerformance,
} from "./loadout-types";

type OracleWeaponDecisionInput = {
  recommendation: LoadoutRecommendation;
  weaponPerformance: WeaponPerformance[];
};

export type OracleWeaponDecision = {
  decision: string;
  confidence: number;
  summary: string;
  reasoning: string[];
  expectedOutcome: string;
  simulatedOutcome: {
    oracleWeapon: string;
    metaWeapon: string;
    oracleWinProbability: number;
    metaWinProbability: number;
    advantage: number;
  };
  reassessmentTrigger: string;
};

function getWeaponPerformance(
  weaponName: string,
  weapons: WeaponPerformance[]
) {
  return weapons.find((weapon) => weapon.weaponName === weaponName);
}

export function generateOracleWeaponDecision({
  recommendation,
  weaponPerformance,
}: OracleWeaponDecisionInput): OracleWeaponDecision {
  const recommendedWeapon = getWeaponPerformance(
    recommendation.recommendedWeapon,
    weaponPerformance
  );

  const metaWeapon = getWeaponPerformance(
    recommendation.currentMetaWeapon,
    weaponPerformance
  );

  const engagementDelta =
    recommendedWeapon && metaWeapon
      ? recommendedWeapon.engagementSuccessRate -
        metaWeapon.engagementSuccessRate
      : 0;

  const accuracyDelta =
    recommendedWeapon && metaWeapon
      ? recommendedWeapon.operatorAccuracy - metaWeapon.operatorAccuracy
      : 0;

  const oracleWinProbability = recommendedWeapon
    ? Math.round(recommendedWeapon.engagementSuccessRate * 0.75)
    : 0;

  const metaWinProbability = metaWeapon
    ? Math.round(metaWeapon.engagementSuccessRate * 0.75)
    : 0;

  const isAgainstMeta =
    recommendation.recommendedWeapon !== recommendation.currentMetaWeapon;

  return {
    decision: isAgainstMeta
      ? `Continue using the ${recommendation.recommendedWeapon}.`
      : `Maintain the ${recommendation.recommendedWeapon}.`,

    confidence: recommendation.confidence,

    summary: isAgainstMeta
      ? `Although the ${recommendation.currentMetaWeapon} currently leads the public meta, your Operator data favours the ${recommendation.recommendedWeapon}.`
      : `The ${recommendation.recommendedWeapon} is aligned with both the public meta and your Operator performance profile.`,

    reasoning: [
      `Operator compatibility is ${recommendation.operatorCompatibility}%.`,
      `Engagement success is ${engagementDelta}% higher than the current meta weapon.`,
      `Accuracy is ${accuracyDelta}% higher than the current meta weapon.`,
      ...recommendation.evidence,
    ],

    expectedOutcome: isAgainstMeta
      ? `Continuing with the ${recommendation.recommendedWeapon} should preserve your strongest current weapon-performance signal until further close-range data is available.`
      : `Maintaining the ${recommendation.recommendedWeapon} should reinforce both meta alignment and personal performance consistency.`,

    simulatedOutcome: {
      oracleWeapon: recommendation.recommendedWeapon,
      metaWeapon: recommendation.currentMetaWeapon,
      oracleWinProbability,
      metaWinProbability,
      advantage: oracleWinProbability - metaWinProbability,
    },

    reassessmentTrigger:
      "Reassess this decision after 10 additional Oracle Sessions or after a significant meta update.",
  };
}