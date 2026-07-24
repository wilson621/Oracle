export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { startOracleWebPlatform } = await import(
    "./lib/oracle/composition/web-composition-root"
  );
  const health = startOracleWebPlatform();
  if (health.status === "failed") {
    throw new Error(
      "Oracle Web Platform failed its composition readiness gate."
    );
  }
}
