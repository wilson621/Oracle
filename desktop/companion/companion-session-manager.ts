import type {
  OracleDesktopHostState,
} from "../host-state.js";
import {
  createOracleCompanionContext,
} from "./companion-context.js";
import {
  createOracleCompanionSession,
  endOracleCompanionSession,
  markOracleCompanionSessionAttached,
  markOracleCompanionSessionReady,
  type OracleCompanionSession,
} from "./companion-session.js";

/**
 * Owns the lifecycle of the current desktop Companion session.
 *
 * The desktop host reports lifecycle events and immutable host-state
 * snapshots to this manager. The manager is the only desktop class that
 * creates or transitions OracleCompanionSession state.
 */
export class OracleCompanionSessionManager {
  private currentSession:
    OracleCompanionSession | null = null;

  start(
    desktopState:
      OracleDesktopHostState | null = null
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
          createContext(desktopState),
      });

    return this.getRequiredSnapshot();
  }

  markReady(
    desktopState:
      OracleDesktopHostState | null = null
  ): OracleCompanionSession {
    const session =
      this.getRequiredSession();

    this.currentSession =
      markOracleCompanionSessionReady(
        session,
        {
          currentContext:
            createContext(desktopState),
        }
      );

    return this.getRequiredSnapshot();
  }

  markAttached(
    desktopState:
      OracleDesktopHostState | null = null
  ): OracleCompanionSession {
    const session =
      this.getRequiredSession();

    this.currentSession =
      markOracleCompanionSessionAttached(
        session,
        {
          currentContext:
            createContext(desktopState),
        }
      );

    return this.getRequiredSnapshot();
  }

  end(
    desktopState:
      OracleDesktopHostState | null = null
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
            createContext(desktopState),
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

function createContext(
  desktopState:
    OracleDesktopHostState | null
) {
  return createOracleCompanionContext({
    desktop: desktopState,
  });
}

function cloneSession(
  session:
    OracleCompanionSession
): OracleCompanionSession {
  return structuredClone(session);
}