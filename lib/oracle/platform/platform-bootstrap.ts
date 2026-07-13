import { OraclePlatformRuntime } from "./platform-runtime";
import type { OraclePlatformState } from "./platform-types";

export function bootstrapOraclePlatform(): OraclePlatformState {
  const runtime = new OraclePlatformRuntime();

  return runtime.start();
}