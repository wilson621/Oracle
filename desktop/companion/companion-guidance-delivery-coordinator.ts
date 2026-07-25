import {
  createOracleCompanionGuidanceRequest,
  type OracleCompanionGuidanceRequest,
} from "../../lib/companion/guidance/index.js";
import {
  createCompanionGuidanceApplicationState,
  createCompanionGuidanceLoadingState,
  createCompanionGuidanceUnavailableState,
  type CompanionGuidanceApplicationState,
} from "../../lib/oracle/applications/companion/index.js";
import type {
  OracleCompanionGuidanceProviderService,
} from "../../lib/oracle/services/companion-guidance/index.js";
import type {
  OracleCompanionSession,
} from "./companion-session.js";
import {
  createOracleCompanionGuidanceControl,
  type OracleCompanionGuidanceControl,
} from "./companion-guidance-delivery-contract.js";

const DEFAULT_CONTROL: OracleCompanionGuidanceControl = Object.freeze({
  category: null,
  maximumSpoilerLevel: "none",
});

export class OracleCompanionGuidanceDeliveryCoordinator {
  private generation = 0;
  private contextFingerprint: string | null = null;
  private session: OracleCompanionSession | null = null;
  private control: OracleCompanionGuidanceControl = DEFAULT_CONTROL;
  private state = createCompanionGuidanceUnavailableState();
  private readonly listeners = new Set<
    (state: CompanionGuidanceApplicationState) => void
  >();

  constructor(
    private readonly guidance: Pick<
      OracleCompanionGuidanceProviderService,
      "execute"
    >,
    private readonly now: () => string =
      () => new Date().toISOString()
  ) {}

  getState(): CompanionGuidanceApplicationState {
    return this.state;
  }

  subscribe(
    listener: (state: CompanionGuidanceApplicationState) => void
  ): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  synchronise(session: OracleCompanionSession | null): void {
    this.session = session === null ? null : structuredClone(session);
    const fingerprint = createContextFingerprint(session);
    if (fingerprint === null) {
      this.invalidate();
      return;
    }
    if (fingerprint === this.contextFingerprint) return;
    this.contextFingerprint = fingerprint;
    void this.refresh();
  }

  async request(value: unknown): Promise<CompanionGuidanceApplicationState> {
    this.control = createOracleCompanionGuidanceControl(value);
    if (createContextFingerprint(this.session) === null) {
      this.invalidate();
      return this.getState();
    }
    await this.refresh();
    return this.getState();
  }

  invalidate(): void {
    this.generation += 1;
    this.contextFingerprint = null;
    this.publish(createCompanionGuidanceUnavailableState());
  }

  private async refresh(): Promise<void> {
    const session = this.session;
    const request = session && createGuidanceRequest(
      session,
      this.control,
      this.generation + 1,
      this.now()
    );
    if (!request) {
      this.invalidate();
      return;
    }
    const generation = ++this.generation;
    this.publish(createCompanionGuidanceLoadingState());
    try {
      const result = await this.guidance.execute(request);
      if (generation !== this.generation) return;
      this.publish(createCompanionGuidanceApplicationState(result));
    } catch {
      if (generation !== this.generation) return;
      this.publish(createCompanionGuidanceUnavailableState());
    }
  }

  private publish(state: CompanionGuidanceApplicationState): void {
    this.state = state;
    for (const listener of this.listeners) listener(this.getState());
  }
}

function createGuidanceRequest(
  session: OracleCompanionSession,
  control: OracleCompanionGuidanceControl,
  generation: number,
  requestedAt: string
): OracleCompanionGuidanceRequest | null {
  const context = session.currentContext;
  const game = context?.game;
  if (session.status !== "attached" || !context || !game) return null;
  return createOracleCompanionGuidanceRequest({
    contract: {
      name: "oracle.companion-guidance-request",
      version: 1,
    },
    requestId: `${session.id}:${generation}`,
    requestedAt,
    session: {
      contract: {
        name: "oracle.companion-guidance-session-projection",
        version: 1,
      },
      sessionId: session.id,
      capturedAt: context.capturedAt,
      context: {},
      game: {
        integrationId: game.integrationId,
        gameName: game.gameName,
        integrationVersion: game.version,
        context: game.state,
      },
    },
    category: control.category,
    type: null,
    operatorPrompt: null,
    maximumSpoilerLevel: control.maximumSpoilerLevel,
  });
}

function createContextFingerprint(
  session: OracleCompanionSession | null
): string | null {
  const context = session?.currentContext;
  if (session?.status !== "attached" || !context?.game) return null;
  return JSON.stringify({
    sessionId: session.id,
    integrationId: context.game.integrationId,
    integrationVersion: context.game.version,
    game: context.game.state,
  });
}
