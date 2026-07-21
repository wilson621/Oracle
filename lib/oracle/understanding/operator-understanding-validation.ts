import type {
  OperatorUnderstandingSerializableValue,
} from "./operator-understanding-types";

const SEMANTIC_VERSION_PATTERN =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;

const PROHIBITED_RAW_EVIDENCE_KEYS = new Set([
  "operatorPrompt",
  "prompt",
  "rawPrompt",
]);

export function requireUnderstandingRecord(
  value: unknown,
  path: string
): Record<string, unknown> {
  if (!isPlainRecord(value)) {
    throw new Error(
      `Operator Understanding '${path}' must be a plain record.`
    );
  }

  return value;
}

export function requireUnderstandingString(
  value: unknown,
  path: string
): string {
  if (
    typeof value !== "string" ||
    value.trim().length === 0
  ) {
    throw new Error(
      `Operator Understanding '${path}' must be a non-empty string.`
    );
  }

  return value;
}

export function requireNullableUnderstandingString(
  value: unknown,
  path: string
): string | null {
  return value === null
    ? null
    : requireUnderstandingString(value, path);
}

export function requireUnderstandingTimestamp(
  value: unknown,
  path: string
): string {
  const timestamp = requireUnderstandingString(value, path);

  if (
    Number.isNaN(Date.parse(timestamp)) ||
    new Date(timestamp).toISOString() !== timestamp
  ) {
    throw new Error(
      `Operator Understanding '${path}' must be a UTC ISO 8601 timestamp.`
    );
  }

  return timestamp;
}

export function requireNullableUnderstandingTimestamp(
  value: unknown,
  path: string
): string | null {
  return value === null
    ? null
    : requireUnderstandingTimestamp(value, path);
}

export function requireUnderstandingSemanticVersion(
  value: unknown,
  path: string
): string {
  const version = requireUnderstandingString(value, path);

  if (!SEMANTIC_VERSION_PATTERN.test(version)) {
    throw new Error(
      `Operator Understanding '${path}' must use semantic versioning.`
    );
  }

  return version;
}

export function requireUnderstandingNumber(
  value: unknown,
  path: string
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    throw new Error(
      `Operator Understanding '${path}' must be a finite number.`
    );
  }

  return value;
}

export function requireUnderstandingInteger(
  value: unknown,
  path: string
): number {
  const integer = requireUnderstandingNumber(value, path);

  if (!Number.isInteger(integer) || integer < 0) {
    throw new Error(
      `Operator Understanding '${path}' must be a non-negative integer.`
    );
  }

  return integer;
}

export function requireUnderstandingStringArray(
  value: unknown,
  path: string
): string[] {
  if (!Array.isArray(value)) {
    throw new Error(
      `Operator Understanding '${path}' must be an array.`
    );
  }

  return value.map((entry, index) =>
    requireUnderstandingString(entry, `${path}[${index}]`)
  );
}

export function requireUnderstandingArray(
  value: unknown,
  path: string
): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(
      `Operator Understanding '${path}' must be an array.`
    );
  }

  return value;
}

export function cloneUnderstandingValue(
  value: unknown,
  path: string
): OperatorUnderstandingSerializableValue {
  assertUnderstandingSerializable(value, path);

  return structuredClone(
    value
  ) as OperatorUnderstandingSerializableValue;
}

export function assertUnderstandingSerializable(
  value: unknown,
  path: string
): void {
  assertSerializableValue(value, path, new WeakSet<object>());
}

export function assertNoRawEvidencePayload(
  value: unknown,
  path: string
): void {
  visitRawEvidenceKeys(value, path, new WeakSet<object>());
}

export function deepFreezeUnderstanding<T>(value: T): T {
  if (
    value === null ||
    typeof value !== "object" ||
    Object.isFrozen(value)
  ) {
    return value;
  }

  for (const nested of Object.values(value)) {
    deepFreezeUnderstanding(nested);
  }

  return Object.freeze(value);
}

export function assertUniqueUnderstandingIds(
  ids: readonly string[],
  path: string
): void {
  if (new Set(ids).size !== ids.length) {
    throw new Error(
      `Operator Understanding '${path}' contains duplicate identifiers.`
    );
  }
}

function assertSerializableValue(
  value: unknown,
  path: string,
  ancestors: WeakSet<object>
): void {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return;
  }

  if (typeof value === "number") {
    requireUnderstandingNumber(value, path);
    return;
  }

  if (typeof value !== "object") {
    throw new Error(
      `Operator Understanding '${path}' contains non-serializable ${typeof value} data.`
    );
  }

  if (ancestors.has(value)) {
    throw new Error(
      `Operator Understanding '${path}' contains a circular reference.`
    );
  }

  if (!Array.isArray(value) && !isPlainRecord(value)) {
    throw new Error(
      `Operator Understanding '${path}' must contain only plain records and arrays.`
    );
  }

  ancestors.add(value);

  if (Array.isArray(value)) {
    assertSerializableArray(value, path, ancestors);
  } else {
    assertSerializableRecord(value, path, ancestors);
  }

  ancestors.delete(value);
}

function assertSerializableArray(
  values: readonly unknown[],
  path: string,
  ancestors: WeakSet<object>
): void {
  for (let index = 0; index < values.length; index += 1) {
    if (!Object.prototype.hasOwnProperty.call(values, index)) {
      throw new Error(
        `Operator Understanding '${path}' contains a sparse array.`
      );
    }

    assertSerializableValue(values[index], `${path}[${index}]`, ancestors);
  }

  for (const key of Reflect.ownKeys(values)) {
    if (key === "length") {
      continue;
    }

    if (
      typeof key !== "string" ||
      !isArrayIndex(key, values.length)
    ) {
      throw new Error(
        `Operator Understanding '${path}' contains a non-serializable array property.`
      );
    }
  }
}

function assertSerializableRecord(
  record: Record<string, unknown>,
  path: string,
  ancestors: WeakSet<object>
): void {
  for (const key of Reflect.ownKeys(record)) {
    if (typeof key !== "string") {
      throw new Error(
        `Operator Understanding '${path}' contains a symbol key.`
      );
    }

    const descriptor = Object.getOwnPropertyDescriptor(record, key);

    if (
      !descriptor ||
      !descriptor.enumerable ||
      !("value" in descriptor)
    ) {
      throw new Error(
        `Operator Understanding '${path}.${key}' must be an enumerable data property.`
      );
    }

    assertSerializableValue(descriptor.value, `${path}.${key}`, ancestors);
  }
}

function visitRawEvidenceKeys(
  value: unknown,
  path: string,
  ancestors: WeakSet<object>
): void {
  if (value === null || typeof value !== "object") {
    return;
  }

  if (ancestors.has(value)) {
    return;
  }

  ancestors.add(value);

  for (const [key, nested] of Object.entries(value)) {
    if (PROHIBITED_RAW_EVIDENCE_KEYS.has(key)) {
      throw new Error(
        `Operator Understanding '${path}.${key}' must not contain raw prompt evidence.`
      );
    }

    visitRawEvidenceKeys(nested, `${path}.${key}`, ancestors);
  }

  ancestors.delete(value);
}

function isPlainRecord(
  value: unknown
): value is Record<string, unknown> {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);

  return (
    prototype === Object.prototype ||
    prototype === null
  );
}

function isArrayIndex(key: string, length: number): boolean {
  const index = Number(key);

  return (
    Number.isInteger(index) &&
    index >= 0 &&
    index < length &&
    String(index) === key
  );
}
