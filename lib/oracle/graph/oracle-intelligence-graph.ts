import type {
  OracleIntelligenceGraph,
  OracleIntelligenceGraphEntry,
} from "./oracle-intelligence-graph-types";

export function createEmptyOracleIntelligenceGraph(): OracleIntelligenceGraph {
  return {
    entries: [],
  };
}

export function addOracleIntelligenceGraphEntries(
  graph: OracleIntelligenceGraph,
  entries: OracleIntelligenceGraphEntry[]
): OracleIntelligenceGraph {
  return {
    entries: [...graph.entries, ...entries],
  };
}