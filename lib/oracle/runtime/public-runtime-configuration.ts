export const ORACLE_RUNTIME_SUPABASE_URL_META =
  "oracle-runtime-supabase-url";
export const ORACLE_RUNTIME_SUPABASE_ANON_KEY_META =
  "oracle-runtime-supabase-anon-key";

export type OraclePublicRuntimeConfiguration = Readonly<{
  supabaseUrl: string;
  supabaseAnonKey: string;
}>;

export function validatePublicRuntimeConfiguration(
  supabaseUrl: unknown,
  supabaseAnonKey: unknown
): OraclePublicRuntimeConfiguration {
  if (
    typeof supabaseUrl !== "string" ||
    typeof supabaseAnonKey !== "string" ||
    supabaseAnonKey.length < 20 ||
    supabaseAnonKey.length > 4096 ||
    /\s/u.test(supabaseAnonKey)
  ) {
    throw new Error("Oracle public runtime configuration is unavailable.");
  }

  let url: URL;
  try {
    url = new URL(supabaseUrl);
  } catch {
    throw new Error("Oracle public runtime configuration is unavailable.");
  }

  const secureRemote = url.protocol === "https:";
  const localQualification =
    url.protocol === "http:" && url.hostname === "127.0.0.1";
  if (
    (!secureRemote && !localQualification) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    url.origin !== supabaseUrl
  ) {
    throw new Error("Oracle public runtime configuration is unavailable.");
  }

  return Object.freeze({ supabaseUrl, supabaseAnonKey });
}
