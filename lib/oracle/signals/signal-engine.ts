import type {
  OracleSignal,
  OracleSignalCategory,
  OracleSignalDirection,
} from "./signal-types";
import { getSignalSeverity } from "./signal-priority";

type CreateSignalInput = {
  category: OracleSignalCategory;
  title: string;
  summary: string;
  direction: OracleSignalDirection;
  confidence: number;
};

function createSignalId(category: OracleSignalCategory, title: string) {
  return `${category}-${title.toLowerCase().replaceAll(" ", "-")}`;
}

export function createOracleSignal({
  category,
  title,
  summary,
  direction,
  confidence,
}: CreateSignalInput): OracleSignal {
  return {
    id: createSignalId(category, title),
    category,
    title,
    summary,
    direction,
    confidence,
    severity: getSignalSeverity(confidence),
    createdAt: new Date().toISOString(),
  };
}