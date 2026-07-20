import {
  randomUUID,
} from "node:crypto";

import type {
  OracleCompanionContext,
} from "./companion-context.js";

export type OracleCompanionSessionStatus =
  | "created"
  | "ready"
  | "attached"
  | "ended";

export type OracleCompanionSession = {
  id: string;

  status:
    OracleCompanionSessionStatus;

  startedAt: string;
  updatedAt: string;
  endedAt: string | null;

  currentContext:
    OracleCompanionContext | null;
};

export type CreateOracleCompanionSessionInput = {
  id?: string;
  startedAt?: string;

  currentContext?:
    OracleCompanionContext | null;
};

export type UpdateOracleCompanionSessionInput = {
  updatedAt?: string;

  currentContext?:
    OracleCompanionContext | null;
};

export type EndOracleCompanionSessionInput = {
  endedAt?: string;

  currentContext?:
    OracleCompanionContext | null;
};

/**
 * Creates the initial declarative state for one Oracle Companion
 * desktop session.
 *
 * This function does not perform lifecycle transitions, desktop
 * observation, attachment, game detection, persistence or IPC.
 */
export function createOracleCompanionSession(
  input:
    CreateOracleCompanionSessionInput = {}
): OracleCompanionSession {
  const startedAt =
    input.startedAt ??
    new Date().toISOString();

  return {
    id:
      input.id ??
      randomUUID(),

    status:
      "created",

    startedAt,

    updatedAt:
      startedAt,

    endedAt:
      null,

    currentContext:
      cloneCompanionContext(
        input.currentContext
      ),
  };
}

/**
 * Marks a created or previously attached Companion session as ready.
 *
 * Ready means Oracle Companion is prepared to observe and attach.
 * It does not imply that a supported game or active gameplay has
 * been detected.
 */
export function markOracleCompanionSessionReady(
  session:
    OracleCompanionSession,
  input:
    UpdateOracleCompanionSessionInput = {}
): OracleCompanionSession {
  assertAllowedStatus(
    session,
    ["created", "attached"],
    "ready"
  );

  const updatedAt =
    input.updatedAt ??
    new Date().toISOString();

  return {
    ...session,

    status:
      "ready",

    updatedAt,

    currentContext:
      resolveCompanionContext(
        session.currentContext,
        input
      ),
  };
}

/**
 * Marks a ready Companion session as attached.
 *
 * Attached means Oracle Companion has an established desktop target.
 * It does not imply supported game detection or active gameplay.
 */
export function markOracleCompanionSessionAttached(
  session:
    OracleCompanionSession,
  input:
    UpdateOracleCompanionSessionInput = {}
): OracleCompanionSession {
  assertAllowedStatus(
    session,
    ["ready"],
    "attached"
  );

  const updatedAt =
    input.updatedAt ??
    new Date().toISOString();

  return {
    ...session,

    status:
      "attached",

    updatedAt,

    currentContext:
      resolveCompanionContext(
        session.currentContext,
        input
      ),
  };
}

/**
 * Ends a Companion session.
 *
 * Ended sessions are terminal and cannot transition to another
 * lifecycle state.
 */
export function endOracleCompanionSession(
  session:
    OracleCompanionSession,
  input:
    EndOracleCompanionSessionInput = {}
): OracleCompanionSession {
  assertAllowedStatus(
    session,
    [
      "created",
      "ready",
      "attached",
    ],
    "ended"
  );

  const endedAt =
    input.endedAt ??
    new Date().toISOString();

  return {
    ...session,

    status:
      "ended",

    updatedAt:
      endedAt,

    endedAt,

    currentContext:
      resolveCompanionContext(
        session.currentContext,
        input
      ),
  };
}

function assertAllowedStatus(
  session:
    OracleCompanionSession,
  allowedStatuses:
    OracleCompanionSessionStatus[],
  nextStatus:
    OracleCompanionSessionStatus
): void {
  if (
    allowedStatuses.includes(
      session.status
    )
  ) {
    return;
  }

  throw new Error(
    `Oracle Companion session cannot transition from '${session.status}' to '${nextStatus}'.`
  );
}

function resolveCompanionContext(
  currentContext:
    OracleCompanionContext | null,
  input: {
    currentContext?:
      OracleCompanionContext | null;
  }
): OracleCompanionContext | null {
  if (
    !Object.prototype.hasOwnProperty.call(
      input,
      "currentContext"
    )
  ) {
    return cloneCompanionContext(
      currentContext
    );
  }

  return cloneCompanionContext(
    input.currentContext
  );
}

function cloneCompanionContext(
  context:
    OracleCompanionContext | null | undefined
): OracleCompanionContext | null {
  return context == null
    ? null
    : structuredClone(context);
}