export type OracleGameContext = {
  /**
   * Stable identifier for the game integration.
   *
   * Example:
   * league-of-legends
   */
  integrationId: string;

  /**
   * Human-readable game name.
   */
  gameName: string;

  /**
   * Integration version.
   */
  version: string;

  /**
   * Serialisable game-specific context.
   *
   * This remains owned by the integration.
   */
  state: Record<string, unknown>;
};