import type {
  OracleGameDetectionInput,
} from "./game-detection-input";
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
  input: OracleGameDetectionInput
): OracleGameDetectionResult;

  /**
   * Construct serialisable game context.
   *
   * Only called after detection succeeds.
   */
  createContext(
  input: OracleGameDetectionInput
): OracleGameContext;
}