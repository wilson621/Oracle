import type { OracleEngine } from "@/lib/oracle/engines";

export type RegisteredOracleEngine = OracleEngine<unknown>;

const registeredEngines: RegisteredOracleEngine[] = [];

export function registerOracleEngine(engine: RegisteredOracleEngine): void {
  const alreadyRegistered = registeredEngines.some(
    (registeredEngine) => registeredEngine.id === engine.id
  );

  if (alreadyRegistered) {
    return;
  }

  registeredEngines.push(engine);
}

export function getRegisteredOracleEngines(): RegisteredOracleEngine[] {
  return [...registeredEngines];
}

export function clearOracleEngineRegistry(): void {
  registeredEngines.length = 0;
}