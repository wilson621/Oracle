import type {
  OracleDesktopHostSnapshot,
} from "../platform/desktop-host-snapshot.js";

export type OracleCompanionGameContext = {
  integrationId: string;
  gameName: string;
  version: string;
  state: Record<string, unknown>;
};

export type OracleCompanionContext = {
  desktop:
    OracleDesktopHostSnapshot | null;

  game:
    OracleCompanionGameContext | null;

  capturedAt: string;
};

export type CreateOracleCompanionContextInput = {
  desktop?:
    OracleDesktopHostSnapshot | null;

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
