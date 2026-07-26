import type { CompanionRuntime } from "../../companion/companion-runtime";
import type { OracleExtensionRuntime } from "../../companion/extensions/extension-runtime";
import type {
  OracleOperationalDiagnosticsRuntimeDeclaration,
} from "./operational-diagnostics/operational-diagnostic-contract";
import type {
  OracleOperationalDiagnosticsService,
} from "./operational-diagnostics/operational-diagnostics-service";

export type OracleComposedService = Readonly<{
  id: string;
  status: string;
}>;

export type OracleComposedApplication = Readonly<{
  id: string;
  requiredServices: readonly string[];
  status: string;
}>;

export type OracleComposedGameIntegration = Readonly<{
  id: string;
}>;

export type OracleComposedGuidanceManifest = Readonly<{
  id: string;
}>;

export type OracleServiceCompositionRegistry = Readonly<{
  getAll(): readonly OracleComposedService[];
}>;

export type OracleApplicationCompositionRegistry = Readonly<{
  getAll(): readonly OracleComposedApplication[];
}>;

export type OracleGameIntegrationCompositionRegistry = Readonly<{
  getAll(): readonly OracleComposedGameIntegration[];
  getById(id: string): OracleComposedGameIntegration | null;
}>;

export type OracleGuidanceCompositionRegistry = Readonly<{
  getProviderManifests(): readonly OracleComposedGuidanceManifest[];
}>;

export const ORACLE_RUNTIME_COMPOSITION_CONTRACT =
  "oracle.runtime-composition";
export const ORACLE_RUNTIME_COMPOSITION_CONTRACT_VERSION = 1;

export type OracleRuntimeTarget = "web" | "electron";

export type OracleSessionLifecycleDeclaration = Readonly<{
  contract: "oracle.session-lifecycle";
  contractVersion: 1;
  authority: "session-service";
  persistence: "disabled";
}>;

export type OracleSessionLifecycleRuntimeContract = Readonly<{
  getMetrics(): Readonly<{
    commandAttempts: number;
    committedMutations: number;
    idempotentReplays: number;
    rejectedCommands: number;
  }>;
}>;

export type OraclePlatformSubsystemId =
  | "composition"
  | "operational-diagnostics"
  | "services"
  | "session-lifecycle"
  | "applications"
  | "game-integrations"
  | "guidance"
  | "extensions"
  | "companion";

export type OracleRuntimeSubsystemDeclaration = Readonly<{
  id: OraclePlatformSubsystemId;
  required: boolean;
}>;

export type OracleRuntimeCompositionManifest = Readonly<{
  contract: typeof ORACLE_RUNTIME_COMPOSITION_CONTRACT;
  contractVersion: typeof ORACLE_RUNTIME_COMPOSITION_CONTRACT_VERSION;
  manifestVersion: string;
  target: OracleRuntimeTarget;
  subsystems: readonly OracleRuntimeSubsystemDeclaration[];
  operationalDiagnostics: OracleOperationalDiagnosticsRuntimeDeclaration;
  services: readonly string[];
  sessionLifecycle: OracleSessionLifecycleDeclaration;
  applications: readonly string[];
  gameIntegrations: readonly string[];
  guidanceProviders: readonly string[];
}>;

export type OraclePlatformComposition = Readonly<{
  manifest: OracleRuntimeCompositionManifest;
  operationalDiagnostics: OracleOperationalDiagnosticsService;
  services: OracleServiceCompositionRegistry;
  sessionLifecycle: Readonly<{
    declaration: OracleSessionLifecycleDeclaration;
    service: OracleSessionLifecycleRuntimeContract;
  }>;
  applications: OracleApplicationCompositionRegistry;
  gameIntegrations: OracleGameIntegrationCompositionRegistry;
  guidance: OracleGuidanceCompositionRegistry;
  extensions: OracleExtensionRuntime;
  companion: CompanionRuntime;
}>;

export function createOracleRuntimeCompositionManifest(
  input: OracleRuntimeCompositionManifest
): OracleRuntimeCompositionManifest {
  if (
    input.contract !== ORACLE_RUNTIME_COMPOSITION_CONTRACT ||
    input.contractVersion !== ORACLE_RUNTIME_COMPOSITION_CONTRACT_VERSION ||
    (input.target !== "web" && input.target !== "electron")
  ) {
    throw new OracleRuntimeCompositionDivergenceError(
      "Manifest contract identity, version or target is unsupported."
    );
  }
  assertUnique("subsystems", input.subsystems.map(({ id }) => id));
  assertUnique("services", input.services);
  assertUnique("applications", input.applications);
  assertUnique("gameIntegrations", input.gameIntegrations);
  assertUnique("guidanceProviders", input.guidanceProviders);
  assertExact(
    "subsystems",
    [
      "composition",
      "operational-diagnostics",
      "services",
      "session-lifecycle",
      "applications",
      "game-integrations",
      "guidance",
      "extensions",
      "companion",
    ],
    input.subsystems.map(({ id }) => id)
  );

  return Object.freeze({
    contract: ORACLE_RUNTIME_COMPOSITION_CONTRACT,
    contractVersion: ORACLE_RUNTIME_COMPOSITION_CONTRACT_VERSION,
    manifestVersion: requireIdentity(
      input.manifestVersion,
      "manifestVersion"
    ),
    target: input.target,
    subsystems: Object.freeze(
      input.subsystems.map((subsystem) => Object.freeze({ ...subsystem }))
    ),
    operationalDiagnostics: Object.freeze({
      ...input.operationalDiagnostics,
      definitions: Object.freeze(
        input.operationalDiagnostics.definitions.map((definition) =>
          Object.freeze({
            ...definition,
            allowedAttributes: Object.freeze([
              ...definition.allowedAttributes,
            ]),
          })
        )
      ),
    }),
    services: freezeIdentities(input.services, "services"),
    sessionLifecycle: Object.freeze({ ...input.sessionLifecycle }),
    applications: freezeIdentities(input.applications, "applications"),
    gameIntegrations: freezeIdentities(
      input.gameIntegrations,
      "gameIntegrations"
    ),
    guidanceProviders: freezeIdentities(
      input.guidanceProviders,
      "guidanceProviders"
    ),
  });
}

export function assertOracleCompositionMatchesManifest(
  composition: OraclePlatformComposition
): void {
  const { manifest } = composition;
  if (
    manifest.contract !== ORACLE_RUNTIME_COMPOSITION_CONTRACT ||
    manifest.contractVersion !== ORACLE_RUNTIME_COMPOSITION_CONTRACT_VERSION
  ) {
    throw new OracleRuntimeCompositionDivergenceError(
      "Composition contract identity is unsupported."
    );
  }

  if (
    JSON.stringify(manifest.operationalDiagnostics) !==
    JSON.stringify(composition.operationalDiagnostics.getDeclaration())
  ) {
    throw new OracleRuntimeCompositionDivergenceError(
      "Operational Diagnostics declaration does not match the constructed runtime."
    );
  }
  assertExact(
    "services",
    manifest.services,
    composition.services.getAll().map(({ id }) => id)
  );
  if (
    JSON.stringify(manifest.sessionLifecycle) !==
      JSON.stringify(composition.sessionLifecycle.declaration) ||
    manifest.sessionLifecycle.contract !== "oracle.session-lifecycle" ||
    manifest.sessionLifecycle.contractVersion !== 1 ||
    manifest.sessionLifecycle.authority !== "session-service" ||
    manifest.sessionLifecycle.persistence !== "disabled"
  ) {
    throw new OracleRuntimeCompositionDivergenceError(
      "Session lifecycle declaration does not match the constructed Session Service."
    );
  }
  assertExact(
    "applications",
    manifest.applications,
    composition.applications.getAll().map(({ id }) => id)
  );
  assertExact(
    "gameIntegrations",
    manifest.gameIntegrations,
    composition.gameIntegrations.getAll().map(({ id }) => id)
  );
  assertExact(
    "guidanceProviders",
    manifest.guidanceProviders,
    composition.guidance.getProviderManifests().map(({ id }) => id)
  );

  const declaredSubsystems = manifest.subsystems.map(({ id }) => id);
  assertExact(
    "subsystems",
    [
      "composition",
      "operational-diagnostics",
      "services",
      "session-lifecycle",
      "applications",
      "game-integrations",
      "guidance",
      "extensions",
      "companion",
    ],
    declaredSubsystems
  );

  const serviceIds = new Set(manifest.services);
  for (const application of composition.applications.getAll()) {
    for (const serviceId of application.requiredServices) {
      if (!serviceIds.has(serviceId)) {
        throw new OracleRuntimeCompositionDivergenceError(
          `Application '${application.id}' requires undeclared Service '${serviceId}'.`
        );
      }
    }
  }
}

export function getOracleSubsystemDeclaration(
  manifest: OracleRuntimeCompositionManifest,
  id: OraclePlatformSubsystemId
): OracleRuntimeSubsystemDeclaration {
  const declaration = manifest.subsystems.find(
    (subsystem) => subsystem.id === id
  );
  if (!declaration) {
    throw new OracleRuntimeCompositionDivergenceError(
      `Subsystem '${id}' is not declared.`
    );
  }
  return declaration;
}

export class OracleRuntimeCompositionDivergenceError extends Error {
  constructor(message: string) {
    super(`Oracle runtime composition diverged from its manifest: ${message}`);
    this.name = "OracleRuntimeCompositionDivergenceError";
  }
}

function assertExact(
  collection: string,
  declared: readonly string[],
  constructed: readonly string[]
): void {
  assertUnique(`declared ${collection}`, declared);
  assertUnique(`constructed ${collection}`, constructed);
  if (
    declared.length !== constructed.length ||
    declared.some((identity, index) => identity !== constructed[index])
  ) {
    throw new OracleRuntimeCompositionDivergenceError(
      `${collection} declared [${declared.join(", ")}] but constructed ` +
        `[${constructed.join(", ")}].`
    );
  }
}

function assertUnique(collection: string, identities: readonly string[]): void {
  if (new Set(identities).size !== identities.length) {
    throw new OracleRuntimeCompositionDivergenceError(
      `${collection} contains duplicate identities.`
    );
  }
}

function freezeIdentities(
  identities: readonly string[],
  collection: string
): readonly string[] {
  return Object.freeze(
    identities.map((identity) => requireIdentity(identity, collection))
  );
}

function requireIdentity(value: string, path: string): string {
  if (!/^[a-z0-9][a-z0-9.-]*$/u.test(value)) {
    throw new OracleRuntimeCompositionDivergenceError(
      `${path} contains invalid identity '${value}'.`
    );
  }
  return value;
}
