import { createCoreOraclePlatformComposition } from "../composition/core-platform-composition";
import type { OracleRuntimeCompositionManifest } from "./platform-composition";
import { OraclePlatformRuntime } from "./platform-runtime";
import type { OraclePlatformState } from "./platform-types";

export function bootstrapOraclePlatform(
  manifest: OracleRuntimeCompositionManifest
): OraclePlatformState {
  const runtime = new OraclePlatformRuntime(
    createCoreOraclePlatformComposition(manifest)
  );

  return runtime.start();
}
