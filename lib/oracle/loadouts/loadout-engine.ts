import type {
  LoadoutIntelligenceReport,
  WeaponPerformance,
  WeaponRole,
} from "./loadout-types";
import { generateWeaponRecommendation } from "./weapon-recommendations";
import { generateOracleWeaponDecision } from "./oracle-decision-engine";

export function generateLoadoutIntelligenceReport({
  role,
  weaponPerformance,
}: Readonly<{
  role: WeaponRole;
  weaponPerformance: readonly WeaponPerformance[];
}>): LoadoutIntelligenceReport {
  const admittedPerformance = weaponPerformance.map((weapon) => ({
    ...weapon,
  }));
  if (!admittedPerformance.some((weapon) => weapon.role === role)) {
    throw new Error(
      "Loadout intelligence requires admitted performance for the requested role."
    );
  }
  const primaryRecommendation = generateWeaponRecommendation({
    role,
    weapons: admittedPerformance,
  });

  return {
    primaryRecommendation,
    oracleDecision: generateOracleWeaponDecision({
      recommendation: primaryRecommendation,
      weaponPerformance: admittedPerformance,
    }),
    weaponPerformance: admittedPerformance,
  };
}
