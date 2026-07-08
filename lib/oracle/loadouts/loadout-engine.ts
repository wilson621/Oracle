import type {
  LoadoutIntelligenceReport,
  WeaponPerformance,
} from "./loadout-types";
import { generateWeaponRecommendation } from "./weapon-recommendations";
import { generateOracleWeaponDecision } from "./oracle-decision-engine";

const mockWeaponPerformance: WeaponPerformance[] = [
  {
    weaponName: "C9",
    role: "close_range",
    operatorAccuracy: 72,
    engagementSuccessRate: 64,
    metaRank: 4,
    personalRank: 1,
    confidence: 88,
  },
  {
    weaponName: "Jackal",
    role: "close_range",
    operatorAccuracy: 61,
    engagementSuccessRate: 56,
    metaRank: 1,
    personalRank: 3,
    confidence: 82,
  },
  {
    weaponName: "XM4",
    role: "primary_assault",
    operatorAccuracy: 69,
    engagementSuccessRate: 62,
    metaRank: 3,
    personalRank: 1,
    confidence: 86,
  },
];

export function generateLoadoutIntelligenceReport(): LoadoutIntelligenceReport {
  const primaryRecommendation = generateWeaponRecommendation({
    role: "close_range",
    weapons: mockWeaponPerformance,
  });

  return {
    primaryRecommendation,
    oracleDecision: generateOracleWeaponDecision({
      recommendation: primaryRecommendation,
      weaponPerformance: mockWeaponPerformance,
    }),
    weaponPerformance: mockWeaponPerformance,
  };
}