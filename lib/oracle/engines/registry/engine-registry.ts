import type { OracleEngine } from "@/lib/oracle/engines";

export type RegisteredOracleEngine = OracleEngine<unknown>;

const registeredEngines: RegisteredOracleEngine[] = [];

export function registerOracleEngine(engine: RegisteredOracleEngine): void {
  const alreadyRegistered = registeredEngines.some(
    (registeredEngine) =>
      registeredEngine.metadata.id === engine.metadata.id
  );

  if (alreadyRegistered) {
    return;
  }

  registeredEngines.push(engine);
}

export function getRegisteredOracleEngines(): RegisteredOracleEngine[] {
  return [...registeredEngines].sort(
    (a, b) => a.metadata.priority - b.metadata.priority
  );
}

export function clearOracleEngineRegistry(): void {
  registeredEngines.length = 0;
}