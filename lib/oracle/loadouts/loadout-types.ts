import type { OracleWeaponDecision } from "./oracle-decision-engine";

export type WeaponRole =
  | "primary_assault"
  | "close_range"
  | "sniper_support"
  | "long_range"
  | "flex";

export type WeaponPerformance = {
  weaponName: string;
  role: WeaponRole;
  operatorAccuracy: number;
  engagementSuccessRate: number;
  metaRank: number;
  personalRank: number;
  confidence: number;
};

export type LoadoutRecommendation = {
  recommendedWeapon: string;
  currentMetaWeapon: string;
  role: WeaponRole;
  operatorCompatibility: number;
  confidence: number;
  summary: string;
  evidence: string[];
};

export type LoadoutIntelligenceReport = {
  primaryRecommendation: LoadoutRecommendation;
  oracleDecision: OracleWeaponDecision;
  weaponPerformance: WeaponPerformance[];
};