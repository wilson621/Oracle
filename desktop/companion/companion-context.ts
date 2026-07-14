import type {
  OracleDesktopHostState,
} from "../host-state.js";

export type OracleCompanionGameContext = {
  integrationId: string;
  gameName: string;
  version: string;
  state: Record<string, unknown>;
};

export type OracleCompanionContext = {
  desktop:
    OracleDesktopHostState | null;

  game:
    OracleCompanionGameContext | null;

  capturedAt: string;
};

export type CreateOracleCompanionContextInput = {
  desktop?:
    OracleDesktopHostState | null;

  game?:
    OracleCompanionGameContext | null;

  capturedAt?: string;
};

export function createOracleCompanionContext(
  input:
    CreateOracleCompanionContextInput = {}
): OracleCompanionContext {
  const capturedAt =
    input.capturedAt ??
    new Date().toISOString();

  return {
    desktop:
      input.desktop == null
        ? null
        : structuredClone(
            input.desktop
          ),

    game:
      input.game == null
        ? null
        : structuredClone(
            input.game
          ),

    capturedAt,
  };
}