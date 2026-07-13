import type { CompanionGame } from "../companion-types";
import type { CompanionGameConnector } from "./game-connector-types";

const registeredConnectors: CompanionGameConnector[] = [];

export function registerCompanionGameConnector(
  connector: CompanionGameConnector
): void {
  const alreadyRegistered = registeredConnectors.some(
    (registeredConnector) =>
      registeredConnector.id === connector.id
  );

  if (alreadyRegistered) {
    return;
  }

  registeredConnectors.push(connector);
}

export function getRegisteredCompanionGameConnectors(): CompanionGameConnector[] {
  return [...registeredConnectors];
}

export function findCompanionGameConnector(
  game: CompanionGame
): CompanionGameConnector | null {
  return (
    registeredConnectors.find((connector) =>
      connector.supportsGame(game)
    ) ?? null
  );
}

export function clearCompanionGameConnectorRegistry(): void {
  registeredConnectors.length = 0;
}