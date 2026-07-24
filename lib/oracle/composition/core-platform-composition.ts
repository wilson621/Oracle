import { CompanionRuntime } from "../../companion/companion-runtime";
import { OracleExtensionRuntime } from "../../companion/extensions/extension-runtime";
import {
  createCoreOracleApplicationRegistry,
} from "../applications/register-core-applications";
import {
  createCallOfDutyCuratedGuidanceProvider,
} from "../game-integrations/call-of-duty/guidance/call-of-duty-curated-guidance-provider";
import {
  OracleCompanionGuidanceProviderService,
} from "../services/companion-guidance/companion-guidance-provider-service";
import {
  createOracleGameIntegrationRegistry,
} from "../game-integrations/oracle-game-integration-registry";
import {
  createCoreOracleServiceRegistry,
} from "../services/register-core-services";
import type {
  OraclePlatformComposition,
  OracleRuntimeCompositionManifest,
} from "../platform/platform-composition";

export function createCoreOraclePlatformComposition(
  manifest: OracleRuntimeCompositionManifest
): OraclePlatformComposition {
  const providers = Object.freeze([
    createCallOfDutyCuratedGuidanceProvider(),
  ]);

  return Object.freeze({
    manifest,
    services: createCoreOracleServiceRegistry(),
    applications: createCoreOracleApplicationRegistry(),
    gameIntegrations: createOracleGameIntegrationRegistry(),
    guidance: new OracleCompanionGuidanceProviderService(providers),
    extensions: new OracleExtensionRuntime(),
    companion: new CompanionRuntime(),
  });
}
