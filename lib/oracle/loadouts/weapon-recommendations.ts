import type {
  LoadoutRecommendation,
  WeaponPerformance,
  WeaponRole,
} from "./loadout-types";

type RecommendationInput = {
  role: WeaponRole;
  weapons: WeaponPerformance[];
};

function getBestPersonalWeapon(weapons: WeaponPerformance[]) {
  return [...weapons].sort(
    (a, b) =>
      b.engagementSuccessRate - a.engagementSuccessRate ||
      b.operatorAccuracy - a.operatorAccuracy
  )[0];
}

function getBestMetaWeapon(weapons: WeaponPerformance[]) {
  return [...weapons].sort((a, b) => a.metaRank - b.metaRank)[0];
}

export function generateWeaponRecommendation({
  role,
  weapons,
}: RecommendationInput): LoadoutRecommendation {
  const roleWeapons = weapons.filter((weapon) => weapon.role === role);

  const bestPersonal = getBestPersonalWeapon(roleWeapons);
  const bestMeta = getBestMetaWeapon(roleWeapons);

  const compatibility = Math.round(
    (bestPersonal.engagementSuccessRate + bestPersonal.operatorAccuracy) / 2
  );

  const delta =
    bestPersonal.engagementSuccessRate - bestMeta.engagementSuccessRate;

  const summary =
    bestPersonal.weaponName === bestMeta.weaponName
      ? `${bestPersonal.weaponName} is currently aligned with both the meta and your personal performance profile.`
      : `Although ${bestMeta.weaponName} is currently meta, your engagement success changes by ${delta}% when using it. Continue using ${bestPersonal.weaponName} until close-range tracking improves.`;

  return {
    recommendedWeapon: bestPersonal.weaponName,
    currentMetaWeapon: bestMeta.weaponName,
    role,
    operatorCompatibility: compatibility,
    confidence: bestPersonal.confidence,
    summary,
    evidence: [
      `${bestPersonal.weaponName} has your highest engagement success rate in this role.`,
      `${bestPersonal.weaponName} currently ranks #${bestPersonal.personalRank} in your personal weapon profile.`,
      `${bestMeta.weaponName} currently ranks #${bestMeta.metaRank} in the wider meta profile.`,
    ],
  };
}