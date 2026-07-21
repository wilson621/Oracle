import type {
  OperatorDeclaredItem,
  OperatorExplicitUnderstandingItem,
} from "../../understanding";

export type CurrentOperatorDeclarations = Readonly<{
  identity: readonly OperatorExplicitUnderstandingItem[];
  preferences: readonly OperatorDeclaredItem[];
  goals: readonly OperatorDeclaredItem[];
}>;

/**
 * Operator Service-owned declaration capability. It deliberately resolves the
 * authenticated current Operator rather than accepting an application-supplied
 * Operator identifier.
 */
export type OperatorDeclarationService = Readonly<{
  getCurrentOperatorDeclarations(): Promise<CurrentOperatorDeclarations>;
}>;
