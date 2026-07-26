import type {
  OracleOperationalDiagnosticAttributes,
  OracleOperationalDiagnosticDefinition,
  OracleOperationalDiagnosticRejectionReason,
} from "./operational-diagnostic-contract";

const IDENTITY_PATTERN = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/u;
const ATTRIBUTE_PATTERN = /^[a-z][A-Za-z0-9]{0,47}$/u;
const DIAGNOSTIC_ID_PATTERN = /^diagnostic-[A-Za-z0-9._:-]{1,96}$/u;
const CORRELATION_PATTERN =
  /^diagnostic-correlation-[A-Za-z0-9._:-]{1,96}$/u;
const EMAIL_PATTERN = /\b[^@\s]+@[^@\s]+\.[^@\s]+\b/u;
const WINDOWS_PATH_PATTERN = /(?:^|[\s"'(])(?:[a-z]:\\|\\\\)/iu;
const SECRET_VALUE_PATTERN =
  /(?:bearer\s+|password\s*[=:]|token\s*[=:]|secret\s*[=:]|authorization\s*[=:]|eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.)/iu;

const PROHIBITED_ATTRIBUTE_TERMS = Object.freeze([
  "authorization",
  "callSign",
  "callsign",
  "clip",
  "content",
  "cookie",
  "credential",
  "email",
  "evidence",
  "frame",
  "gameplay",
  "guidance",
  "memory",
  "operator",
  "password",
  "prompt",
  "refreshToken",
  "response",
  "screenshot",
  "secret",
  "session",
  "token",
  "understanding",
  "windowTitle",
]);

export function requireOperationalDiagnosticDefinitions(
  definitions: readonly OracleOperationalDiagnosticDefinition[]
): ReadonlyMap<string, OracleOperationalDiagnosticDefinition> {
  const registry = new Map<string, OracleOperationalDiagnosticDefinition>();

  for (const definition of definitions) {
    requireIdentity(definition.code, "diagnostic code");
    requireIdentity(definition.subsystem, "diagnostic subsystem");
    requireSummary(definition.summary);

    if (registry.has(definition.code)) {
      throw new Error(
        `Operational diagnostic code '${definition.code}' is duplicated.`
      );
    }

    const allowedAttributes = definition.allowedAttributes.map((attribute) => {
      if (!ATTRIBUTE_PATTERN.test(attribute)) {
        throw new Error(
          `Operational diagnostic attribute '${attribute}' is invalid.`
        );
      }
      if (isProhibitedOperationalDiagnosticAttribute(attribute)) {
        throw new Error(
          `Operational diagnostic attribute '${attribute}' is prohibited.`
        );
      }
      return attribute;
    });

    if (new Set(allowedAttributes).size !== allowedAttributes.length) {
      throw new Error(
        `Operational diagnostic '${definition.code}' declares duplicate attributes.`
      );
    }

    registry.set(
      definition.code,
      deepFreeze({
        ...definition,
        allowedAttributes: [...allowedAttributes],
      })
    );
  }

  return registry;
}

export function validateOperationalDiagnosticAttributes(
  definition: OracleOperationalDiagnosticDefinition,
  attributes: OracleOperationalDiagnosticAttributes
): OracleOperationalDiagnosticRejectionReason | null {
  const allowed = new Set(definition.allowedAttributes);

  for (const [key, value] of Object.entries(attributes)) {
    if (isProhibitedOperationalDiagnosticAttribute(key)) {
      return "prohibited-attribute";
    }
    if (!allowed.has(key)) {
      return "undeclared-attribute";
    }
    if (!isSafeOperationalDiagnosticValue(value)) {
      return "unsafe-attribute-value";
    }
  }

  return null;
}

export function isValidOperationalDiagnosticTimestamp(value: string): boolean {
  const parsed = new Date(value);
  return (
    Number.isFinite(parsed.getTime()) &&
    parsed.toISOString() === value
  );
}

export function isValidOperationalDiagnosticCorrelationId(
  value: string
): boolean {
  return CORRELATION_PATTERN.test(value);
}

export function isValidOperationalDiagnosticId(value: string): boolean {
  return DIAGNOSTIC_ID_PATTERN.test(value);
}

export function isProhibitedOperationalDiagnosticAttribute(
  attribute: string
): boolean {
  const normalised = attribute.replace(/[^a-z]/giu, "").toLowerCase();
  return PROHIBITED_ATTRIBUTE_TERMS.some((term) =>
    normalised.includes(term.toLowerCase())
  );
}

function isSafeOperationalDiagnosticValue(
  value: unknown
): value is string | number | boolean | null {
  if (
    value === null ||
    typeof value === "boolean"
  ) {
    return true;
  }
  if (typeof value === "number") {
    return Number.isFinite(value);
  }
  if (typeof value !== "string") {
    return false;
  }
  return (
    value.length <= 160 &&
    !containsControlCharacter(value) &&
    !EMAIL_PATTERN.test(value) &&
    !WINDOWS_PATH_PATTERN.test(value) &&
    !SECRET_VALUE_PATTERN.test(value)
  );
}

function requireIdentity(value: string, label: string): void {
  if (!IDENTITY_PATTERN.test(value)) {
    throw new Error(`Operational ${label} '${value}' is invalid.`);
  }
}

function requireSummary(value: string): void {
  if (
    value.length < 1 ||
    value.length > 160 ||
    containsControlCharacter(value) ||
    EMAIL_PATTERN.test(value) ||
    WINDOWS_PATH_PATTERN.test(value) ||
    SECRET_VALUE_PATTERN.test(value)
  ) {
    throw new Error("Operational diagnostic summary is invalid.");
  }
}

function containsControlCharacter(value: string): boolean {
  return Array.from(value).some((character) => {
    const codePoint = character.codePointAt(0);
    return codePoint !== undefined && codePoint <= 0x1f;
  });
}

export function deepFreeze<T>(value: T): T {
  if (
    value === null ||
    typeof value !== "object" ||
    Object.isFrozen(value)
  ) {
    return value;
  }

  for (const nested of Object.values(value)) {
    deepFreeze(nested);
  }

  return Object.freeze(value);
}
