import type {
  OracleCompanionGuidanceSpoilerLevel,
} from "../../lib/companion/guidance/index.js";

export type OracleCompanionGuidanceControl = Readonly<{
  category: string | null;
  maximumSpoilerLevel: OracleCompanionGuidanceSpoilerLevel;
}>;

const SPOILER_LEVELS: readonly OracleCompanionGuidanceSpoilerLevel[] =
  Object.freeze(["none", "minor", "major", "full"]);

export function createOracleCompanionGuidanceControl(
  value: unknown
): OracleCompanionGuidanceControl {
  if (!isRecord(value)) {
    throw new Error("Companion Guidance control must be a plain record.");
  }
  if (
    Reflect.ownKeys(value).length !== 2 ||
    !Object.hasOwn(value, "category") ||
    !Object.hasOwn(value, "maximumSpoilerLevel")
  ) {
    throw new Error("Companion Guidance control shape is invalid.");
  }
  const category = value.category;
  if (
    category !== null &&
    (typeof category !== "string" ||
      !/^[a-z0-9][a-z0-9.-]{0,63}$/u.test(category))
  ) {
    throw new Error("Companion Guidance category control is invalid.");
  }
  if (
    typeof value.maximumSpoilerLevel !== "string" ||
    !SPOILER_LEVELS.includes(
      value.maximumSpoilerLevel as OracleCompanionGuidanceSpoilerLevel
    )
  ) {
    throw new Error("Companion Guidance spoiler control is invalid.");
  }
  return Object.freeze({
    category,
    maximumSpoilerLevel:
      value.maximumSpoilerLevel as OracleCompanionGuidanceSpoilerLevel,
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}
