import {
  validatePublicRuntimeConfiguration,
  type OraclePublicRuntimeConfiguration,
} from "./public-runtime-configuration";

export function resolvePublicRuntimeConfiguration(
  environment: Readonly<Record<string, string | undefined>>
): OraclePublicRuntimeConfiguration {
  const installedUrl = environment["ORACLE_SUPABASE_URL"];
  const installedAnonKey = environment["ORACLE_SUPABASE_ANON_KEY"];
  const sourceUrl = environment["NEXT_PUBLIC_SUPABASE_URL"];
  const sourceAnonKey = environment["NEXT_PUBLIC_SUPABASE_ANON_KEY"];
  const installedPresent = installedUrl !== undefined || installedAnonKey !== undefined;
  const sourcePresent = sourceUrl !== undefined || sourceAnonKey !== undefined;

  if (installedPresent) {
    if (installedUrl === undefined || installedAnonKey === undefined) {
      throw new Error("Oracle installed runtime configuration is incomplete.");
    }
    if (
      sourcePresent &&
      (sourceUrl === undefined ||
        sourceAnonKey === undefined ||
        sourceUrl !== installedUrl ||
        sourceAnonKey !== installedAnonKey)
    ) {
      throw new Error("Oracle runtime configuration is ambiguous.");
    }
    return validatePublicRuntimeConfiguration(installedUrl, installedAnonKey);
  }

  if (sourceUrl === undefined || sourceAnonKey === undefined) {
    throw new Error("Oracle source runtime configuration is unavailable.");
  }
  return validatePublicRuntimeConfiguration(sourceUrl, sourceAnonKey);
}
