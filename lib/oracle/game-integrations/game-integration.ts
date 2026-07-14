import type { OracleDesktopTargetCandidate } from "@/desktop/targeting";
import type {
  OracleGameContext,
} from "./game-context";
import type {
  OracleGameDetectionResult,
} from "./game-detection";

export interface OracleGameIntegration {
  /**
   * Stable integration identifier.
   */
  readonly id: string;

  /**
   * Human-readable game name.
   */
  readonly gameName: string;

  /**
   * Integration version.
   */
  readonly version: string;

  /**
   * Determine whether this integration applies
   * to the supplied desktop target.
   *
   * Must be deterministic.
   */
  detect(
    candidate: OracleDesktopTargetCandidate
  ): OracleGameDetectionResult;

  /**
   * Construct serialisable game context.
   *
   * Only called after detection succeeds.
   */
  createContext(
    candidate: OracleDesktopTargetCandidate
  ): OracleGameContext;
}