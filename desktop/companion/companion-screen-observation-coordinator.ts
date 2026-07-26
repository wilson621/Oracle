import type {
  OracleCompanionSession,
} from "./companion-session.js";
import {
  createInitialOracleCompanionScreenObservationState,
  createOracleCompanionScreenObservationControl,
  createOracleCompanionScreenObservationState,
  type OracleCompanionScreenObservationControl,
  type OracleCompanionScreenObservationState,
} from "./companion-screen-observation-contract.js";
import type {
  OracleDesktopAttachmentTarget,
} from "../overlay/attachment-state.js";
import {
  MINECRAFT_JAVA_COMPATIBILITY_CERTIFICATE,
} from "../../lib/oracle/game-integrations/minecraft-java/minecraft-java-compatibility-certificate.js";
import {
  resolveOracleGameIntegrationCompatibility,
  type OracleGameIntegrationRuntimeProfile,
} from "../../lib/oracle/game-integrations/compatibility/index.js";

export type OracleCompanionRawFrame = {
  pixels: Buffer;
  width: number;
  height: number;
};

export interface OracleCompanionLocalWindowCapture {
  captureAllowlistedRegion(
    target: OracleDesktopAttachmentTarget
  ): Promise<OracleCompanionRawFrame>;
}

export class OracleCompanionScreenObservationCoordinator {
  private state = createInitialOracleCompanionScreenObservationState();
  private generation = 0;
  private consent:
    | Readonly<{
        targetId: string;
        control: OracleCompanionScreenObservationControl;
      }>
    | null = null;
  private listeners =
    new Set<(state: OracleCompanionScreenObservationState) => void>();
  private observationExpiryTimer: NodeJS.Timeout | null = null;

  constructor(
    private readonly capture: OracleCompanionLocalWindowCapture,
    private readonly now = () => new Date().toISOString(),
    private readonly certificate = MINECRAFT_JAVA_COMPATIBILITY_CERTIFICATE
  ) {}

  getState(): OracleCompanionScreenObservationState {
    return this.state;
  }

  subscribe(
    listener: (state: OracleCompanionScreenObservationState) => void
  ): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  synchronise(
    session: OracleCompanionSession | null,
    target: OracleDesktopAttachmentTarget | null
  ): void {
    const eligible =
      session?.status === "attached" &&
      session.currentContext?.game?.integrationId === "minecraft-java" &&
      target !== null;
    if (!eligible) {
      this.invalidate("Local observation requires an attached certified Minecraft Java session.");
      return;
    }
    if (this.consent && this.consent.targetId !== target.id) {
      this.invalidate("Attachment changed. Local observation consent was revoked.");
      return;
    }
    if (!this.consent && this.state.status !== "ready") {
      const observationDeclaredEligible =
        this.certificate.state === "certified" ||
        (
          this.certificate.state === "provisionally-certified" &&
          this.certificate.verifiedCapabilities.includes("observation")
        );
      this.publish({
        status: observationDeclaredEligible ? "ready" : "unavailable",
        active: false,
        consented: false,
        indicator: "observation-off",
        gameIntegrationId: "minecraft-java",
        certificateState: this.certificate.state,
        latestObservation: null,
        message: observationDeclaredEligible
          ? "Minecraft is attached. Screen observation remains off until enabled."
          : "Minecraft observation is provisionally certified and remains disabled pending exact-profile live verification.",
        updatedAt: this.now(),
      });
    }
  }

  async applyControl(
    value: unknown,
    session: OracleCompanionSession | null,
    target: OracleDesktopAttachmentTarget | null
  ): Promise<OracleCompanionScreenObservationState> {
    const control = createOracleCompanionScreenObservationControl(value);
    if (control.action === "revoke") {
      this.invalidate("Local screen observation consent was revoked.");
      return this.state;
    }
    if (control.action === "pause") {
      this.generation += 1;
      if (this.consent) {
        this.publish({
          ...this.state,
          status: "paused",
          active: false,
          indicator: "observation-paused",
          latestObservation: null,
          message: "Local screen observation is paused.",
          updatedAt: this.now(),
        });
      }
      return this.state;
    }
    if (control.action === "observe" && !this.consent) {
      this.publish({
        ...this.state,
        status: "disabled",
        active: false,
        consented: false,
        indicator: "observation-off",
        latestObservation: null,
        message:
          "Screen observation remains off until the Operator explicitly enables it.",
        updatedAt: this.now(),
      });
      return this.state;
    }
    const eligible =
      session?.status === "attached" &&
      session.currentContext?.game?.integrationId === "minecraft-java" &&
      target !== null;
    if (!eligible || !target) {
      this.invalidate("No eligible Minecraft Java attachment is available.");
      return this.state;
    }
    const resolution = resolveOracleGameIntegrationCompatibility(
      this.certificate,
      createRuntimeProfile(target, control),
      this.now()
    );
    if (
      !resolution.eligibleCapabilities.includes("observation") ||
      !resolution.eligibleCapabilities.includes("transient-progress")
    ) {
      this.invalidate(resolution.reason, resolution.effectiveState);
      return this.state;
    }
    this.consent = Object.freeze({ targetId: target.id, control });
    return this.observe(target, resolution.effectiveState);
  }

  invalidate(
    message = "Local screen observation is off.",
    certificateState:
      OracleCompanionScreenObservationState["certificateState"] = null
  ): void {
    this.generation += 1;
    this.clearObservationExpiry();
    this.consent = null;
    this.publish({
      status: "disabled",
      active: false,
      consented: false,
      indicator: "observation-off",
      gameIntegrationId: null,
      certificateState,
      latestObservation: null,
      message,
      updatedAt: this.now(),
    });
  }

  private async observe(
    target: OracleDesktopAttachmentTarget,
    certificateState:
      NonNullable<OracleCompanionScreenObservationState["certificateState"]>
  ): Promise<OracleCompanionScreenObservationState> {
    const generation = ++this.generation;
    this.publish({
      status: "observing",
      active: true,
      consented: true,
      indicator: "observation-on",
      gameIntegrationId: "minecraft-java",
      certificateState,
      latestObservation: null,
      message: "Observing one allowlisted region locally. Pixels are not retained or uploaded.",
      updatedAt: this.now(),
    });
    let frame: OracleCompanionRawFrame | null = null;
    try {
      frame = await this.capture.captureAllowlistedRegion(target);
      const observation = deriveVisibleFrameObservation(frame, this.now());
      if (generation !== this.generation || this.consent?.targetId !== target.id) {
        return this.state;
      }
      this.publish({
        ...this.state,
        status: "ready",
        active: false,
        indicator: "observation-off",
        latestObservation: observation,
        message:
          "Local frame visibility was validated. No gameplay outcome or advancement was inferred.",
        updatedAt: this.now(),
      });
      this.scheduleObservationExpiry(generation, observation.expiresAt);
    } catch {
      if (generation === this.generation) {
        this.publish({
          ...this.state,
          status: "unavailable",
          active: false,
          indicator: "observation-off",
          latestObservation: null,
          message:
            "The allowlisted local frame could not be validated. Observation failed closed.",
          updatedAt: this.now(),
        });
      }
    } finally {
      frame?.pixels.fill(0);
    }
    return this.state;
  }

  private publish(
    input: Omit<OracleCompanionScreenObservationState, "contract">
  ): void {
    this.state = createOracleCompanionScreenObservationState(input);
    for (const listener of this.listeners) listener(this.state);
  }

  private scheduleObservationExpiry(
    generation: number,
    expiresAt: string
  ): void {
    this.clearObservationExpiry();
    const delay = Math.max(0, Date.parse(expiresAt) - Date.parse(this.now()));
    this.observationExpiryTimer = setTimeout(() => {
      this.observationExpiryTimer = null;
      if (
        generation !== this.generation ||
        this.state.latestObservation?.expiresAt !== expiresAt
      ) {
        return;
      }
      this.publish({
        ...this.state,
        latestObservation: null,
        message:
          "The transient local observation expired. Observe again only if still needed.",
        updatedAt: this.now(),
      });
    }, delay);
    this.observationExpiryTimer.unref();
  }

  private clearObservationExpiry(): void {
    if (this.observationExpiryTimer) {
      clearTimeout(this.observationExpiryTimer);
      this.observationExpiryTimer = null;
    }
  }
}

function createRuntimeProfile(
  target: OracleDesktopAttachmentTarget,
  control: OracleCompanionScreenObservationControl
): OracleGameIntegrationRuntimeProfile {
  return {
    gameId: "minecraft",
    edition: "java",
    gameVersion: "26.1.1",
    operatingSystem: process.platform,
    executableName: target.processName ?? "",
    locale: control.locale,
    displayMode: control.displayMode,
    windowBounds: target.bounds,
    uiScale: control.uiScale,
    playerMode: control.playerMode,
    observationMethod: "attached-window-local-pixels",
  };
}

function deriveVisibleFrameObservation(
  frame: OracleCompanionRawFrame,
  observedAt: string
) {
  if (
    !Buffer.isBuffer(frame.pixels) ||
    frame.pixels.length < 16 ||
    !Number.isInteger(frame.width) ||
    !Number.isInteger(frame.height) ||
    frame.width < 1 ||
    frame.height < 1
  ) {
    throw new Error("Captured frame is invalid.");
  }
  const first = frame.pixels[0];
  let differences = 0;
  const stride = Math.max(1, Math.floor(frame.pixels.length / 256));
  for (let index = 0; index < frame.pixels.length; index += stride) {
    if (frame.pixels[index] !== first) differences += 1;
  }
  if (differences < 4) {
    throw new Error("Captured frame does not contain enough visible variation.");
  }
  const score = Math.min(0.95, 0.65 + differences / 1_000);
  return Object.freeze({
    kind: "visible-game-frame" as const,
    purpose: "minecraft-diamond-discovery" as const,
    confidence: Object.freeze({
      score,
      level: score >= 0.75 ? "high" as const : "medium" as const,
      rationale:
        "The allowlisted attached-window region contains a non-uniform visible frame; no semantic gameplay claim was inferred.",
    }),
    observedAt,
    expiresAt: new Date(Date.parse(observedAt) + 2_000).toISOString(),
    authoritative: false as const,
  });
}
