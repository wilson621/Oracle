import {
  CallOfDutyIntegration,
} from "./call-of-duty/call-of-duty-integration";
import {
  MinecraftJavaIntegration,
} from "./minecraft-java/minecraft-java-integration";
import {
  OracleGameIntegrationRegistry,
} from "./game-integration-registry";

export function createOracleGameIntegrationRegistry(): OracleGameIntegrationRegistry {
  const registry =
    new OracleGameIntegrationRegistry();

  registry.register(
    new CallOfDutyIntegration()
  );
  registry.register(
    new MinecraftJavaIntegration()
  );

  return registry;
}
