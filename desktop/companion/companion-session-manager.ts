import type {
  OracleDesktopHostSnapshot,
} from "../platform/desktop-host-snapshot.js";
import {
  createOracleCompanionContext,
  type OracleCompanionContext,
  type OracleCompanionGameContext,
} from "./companion-context.js";
import {
  createOracleCompanionSession,
  endOracleCompanionSession,
  markOracleCompanionSessionAttached,
  markOracleCompanionSessionReady,
  updateOracleCompanionSessionContext,
  type OracleCompanionSession,
} from "./companion-session.js";
import {
  createOracleSessionCompanionCorrelation,
  type OracleSessionCompanionCorrelation,
} from "../../lib/oracle/sessions/index.js";

/**
 * Owns the lifecycle of the current desktop Companion session.
 *
 * The desktop platform supplies immutable host snapshots to this manager.
 * The manager is the only desktop class that creates or transitions
 * OracleCompanionSession state, but it does not produce platform snapshots.
 */
export class OracleCompanionSessionManager {
  private currentSession:
    OracleCompanionSession | null = null;

  start(
    input:
      OracleCompanionSessionContextInput = {
        desktop: null,
      }
  ): OracleCompanionSession {
    if (
      this.currentSession &&
      this.currentSession.status !== "ended"
    ) {
      throw new Error(
        "Oracle Companion session is already active."
      );
    }

    this.currentSession =
      createOracleCompanionSession({
        currentContext:
          createContext(
            null,
            input
          ),
      });

    return this.getRequiredSnapshot();
  }

  markReady(
    input:
      OracleCompanionSessionContextInput = {
        desktop: null,
      }
  ): OracleCompanionSession {
    const session =
      this.getRequiredSession();

    this.currentSession =
      markOracleCompanionSessionReady(
        session,
        {
          currentContext:
            createContext(
              session.currentContext,
              input
            ),
        }
      );

    return this.getRequiredSnapshot();
  }

  markAttached(
    input:
      OracleCompanionSessionContextInput = {
        desktop: null,
      }
  ): OracleCompanionSession {
    const session =
      this.getRequiredSession();

    this.currentSession =
      markOracleCompanionSessionAttached(
        session,
        {
          currentContext:
            createContext(
              session.currentContext,
              input
            ),
        }
      );

    return this.getRequiredSnapshot();
  }

  captureContext(
    input:
      OracleCompanionSessionContextInput
  ): OracleCompanionSession | null {
    const session =
      this.currentSession;

    if (!session) {
      return null;
    }

    this.currentSession =
      updateOracleCompanionSessionContext(
        session,
        {
          currentContext:
            createContext(
              session.currentContext,
              input
            ),
        }
      );

    return this.getRequiredSnapshot();
  }

  getContextSnapshot(): OracleCompanionContext | null {
    return this.currentSession
      ?.currentContext == null
      ? null
      : structuredClone(
          this.currentSession
            .currentContext
        );
  }

  correlateDurableSession(
    correlation:
      OracleSessionCompanionCorrelation
  ): OracleCompanionSession {
    const session =
      this.getRequiredSession();
    const validated =
      createOracleSessionCompanionCorrelation(
        correlation
      );

    if (
      validated.desktopSessionId !==
      session.id
    ) {
      throw new Error(
        "Durable Session correlation must identify the active Desktop Companion Session."
      );
    }

    if (
      session.durableCorrelation &&
      session.durableCorrelation.sessionId !==
        validated.sessionId
    ) {
      throw new Error(
        "Desktop Companion Session is already correlated to another durable Session."
      );
    }

    this.currentSession = {
      ...session,
      updatedAt:
        validated.establishedAt,
      durableCorrelation:
        validated,
    };

    return this.getRequiredSnapshot();
  }

  end(
    input:
      OracleCompanionSessionContextInput = {
        desktop: null,
      }
  ): OracleCompanionSession | null {
    const session =
      this.currentSession;

    if (!session) {
      return null;
    }

    if (session.status === "ended") {
      const snapshot =
        cloneSession(session);

      this.currentSession = null;

      return snapshot;
    }

    const endedSession =
      endOracleCompanionSession(
        session,
        {
          currentContext:
            createContext(
              session.currentContext,
              input
            ),
        }
      );

    this.currentSession = null;

    return cloneSession(
      endedSession
    );
  }

  getSnapshot(): OracleCompanionSession | null {
    return this.currentSession
      ? cloneSession(
          this.currentSession
        )
      : null;
  }

  private getRequiredSession(): OracleCompanionSession {
    if (!this.currentSession) {
      throw new Error(
        "Oracle Companion session has not been started."
      );
    }

    return this.currentSession;
  }

  private getRequiredSnapshot(): OracleCompanionSession {
    const snapshot =
      this.getSnapshot();

    if (!snapshot) {
      throw new Error(
        "Oracle Companion session snapshot is unavailable."
      );
    }

    return snapshot;
  }
}

type OracleCompanionSessionContextBaseInput =
  Readonly<{
    desktop:
      OracleDesktopHostSnapshot | null;
  }>;

export type OracleCompanionSessionContextInput =
  | OracleCompanionSessionContextBaseInput
  | (
      OracleCompanionSessionContextBaseInput &
        Readonly<{
          game:
            | OracleCompanionGameContext
            | null
            | undefined;
        }>
    );

function createContext(
  currentContext:
    OracleCompanionContext | null,
  input:
    OracleCompanionSessionContextInput
) {
  const game =
    hasGameContextOperation(
      input
    )
      ? input.game ?? null
      : currentContext?.game ??
        null;

  return createOracleCompanionContext({
    desktop:
      input.desktop,

    game,
  });
}

function hasGameContextOperation(
  input:
    OracleCompanionSessionContextInput
): input is OracleCompanionSessionContextBaseInput &
  Readonly<{
    game:
      | OracleCompanionGameContext
      | null
      | undefined;
  }> {
  return Object.prototype.hasOwnProperty.call(
    input,
    "game"
  );
}

function cloneSession(
  session:
    OracleCompanionSession
): OracleCompanionSession {
  return structuredClone(session);
}
