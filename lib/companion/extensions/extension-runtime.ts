import type { OracleExtension } from "./oracle-extension";
import {
  createExtensionRuntimeState,
  type OracleExtensionRuntimeState,
} from "./extension-runtime-state";

export class OracleExtensionRuntime {
  private readonly runtimeStates = new Map<
    string,
    OracleExtensionRuntimeState
  >();

  register(extension: OracleExtension): void {
    if (this.runtimeStates.has(extension.manifest.id)) {
      return;
    }

    this.runtimeStates.set(
      extension.manifest.id,
      createExtensionRuntimeState(extension.manifest.id)
    );
  }

  getState(
    extensionId: string
  ): OracleExtensionRuntimeState | undefined {
    return this.runtimeStates.get(extensionId);
  }

  getStates(): OracleExtensionRuntimeState[] {
    return [...this.runtimeStates.values()];
  }

  transition(
    extensionId: string,
    status: OracleExtensionRuntimeState["status"],
    error: string | null = null
  ): void {
    const current = this.runtimeStates.get(extensionId);

    if (!current) {
      return;
    }

    this.runtimeStates.set(extensionId, {
      ...current,
      status,
      error,
      startedAt:
        status === "running" && current.startedAt === null
          ? new Date().toISOString()
          : current.startedAt,
      updatedAt: new Date().toISOString(),
    });
  }
}