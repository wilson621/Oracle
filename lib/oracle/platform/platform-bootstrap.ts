import { createCoreOraclePlatformComposition } from "../composition/core-platform-composition";
import type { OracleRuntimeCompositionManifest } from "./platform-composition";
import { OraclePlatformRuntime } from "./platform-runtime";
import type { OraclePlatformState } from "./platform-types";
import type {
  OracleOperationalDiagnosticsService,
} from "./operational-diagnostics";

export function bootstrapOraclePlatform(
  manifest: OracleRuntimeCompositionManifest,
  operationalDiagnostics: OracleOperationalDiagnosticsService
): OraclePlatformState {
  const runtime = new OraclePlatformRuntime(
    createCoreOraclePlatformComposition(manifest, operationalDiagnostics)
  );

  return runtime.start();
}
