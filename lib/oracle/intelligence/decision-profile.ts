import type { OracleDecision } from "./decision-types";
import {
  selectPrimaryOracleDecision,
  type OracleDecisionSelection,
} from "./decision-selection";

export type OracleDecisionProfile = OracleDecisionSelection & {
  decisions: OracleDecision[];
};

export function buildOracleDecisionProfile(
  decisions: OracleDecision[]
): OracleDecisionProfile {
  const selection = selectPrimaryOracleDecision(decisions);

  return {
    ...selection,
    decisions,
  };
}