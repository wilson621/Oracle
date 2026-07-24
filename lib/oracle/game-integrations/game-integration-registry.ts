import type {
  OracleGameIntegration,
} from "./game-integration";

export interface OracleGameIntegrationRegistryContract {
  getAll(): OracleGameIntegration[];
  getById(id: string): OracleGameIntegration | null;
}

export class OracleGameIntegrationRegistry
  implements OracleGameIntegrationRegistryContract {
  private readonly integrations =
    new Map<
      string,
      OracleGameIntegration
    >();

  register(
    integration:
      OracleGameIntegration
  ): void {
    if (
      this.integrations.has(
        integration.id
      )
    ) {
      throw new Error(
        `Game integration '${integration.id}' is already registered.`
      );
    }

    this.integrations.set(
      integration.id,
      integration
    );
  }

  getAll(): OracleGameIntegration[] {
    return Array.from(
      this.integrations.values()
    );
  }

  getById(
    id: string
  ): OracleGameIntegration | null {
    return (
      this.integrations.get(id) ??
      null
    );
  }

  clear(): void {
    this.integrations.clear();
  }
}
