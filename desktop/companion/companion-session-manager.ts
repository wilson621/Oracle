import type {
  OracleDesktopHostSnapshot,
} from "../platform/desktop-host-snapshot.js";
import {
  createOracleCompanionContext,
  type OracleCompanionContext,
} from "./companion-context.js";
import {
  createOracleCompanionSession,
  endOracleCompanionSession,
  markOracleCompanionSessionAttached,
  markOracleCompanionSessionReady,
  updateOracleCompanionSessionContext,
  type OracleCompanionSession,
} from "./companion-session.js";

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
    desktopSnapshot:
      OracleDesktopHostSnapshot | null = null
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
          createContext(desktopSnapshot),
      });

    return this.getRequiredSnapshot();
  }

  markReady(
    desktopSnapshot:
      OracleDesktopHostSnapshot | null = null
  ): OracleCompanionSession {
    const session =
      this.getRequiredSession();

    this.currentSession =
      markOracleCompanionSessionReady(
        session,
        {
          currentContext:
            createContext(desktopSnapshot),
        }
      );

    return this.getRequiredSnapshot();
  }

  markAttached(
    desktopSnapshot:
      OracleDesktopHostSnapshot | null = null
  ): OracleCompanionSession {
    const session =
      this.getRequiredSession();

    this.currentSession =
      markOracleCompanionSessionAttached(
        session,
        {
          currentContext:
            createContext(desktopSnapshot),
        }
      );

    return this.getRequiredSnapshot();
  }

  captureContext(
    desktopSnapshot:
      OracleDesktopHostSnapshot
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
            createContext(desktopSnapshot),
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

  end(
    desktopSnapshot:
      OracleDesktopHostSnapshot | null = null
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
            createContext(desktopSnapshot),
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
  desktopSnapshot:
    OracleDesktopHostSnapshot | null
) {
  return createOracleCompanionContext({
    desktop: desktopSnapshot,
  });
}

function cloneSession(
  session:
    OracleCompanionSession
): OracleCompanionSession {
  return structuredClone(session);
}
