import type {
  OracleCompanionSerializableValue,
} from "./companion-guidance-types";

const SEMANTIC_VERSION_PATTERN =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;

export function requirePlainRecord(
  value: unknown,
  path: string
): Record<string, unknown> {
  if (!isPlainRecord(value)) {
    throw new Error(
      `Oracle Companion Guidance '${path}' must be a plain record.`
    );
  }

  return value;
}

export function requireNonEmptyString(
  value: unknown,
  path: string
): string {
  if (
    typeof value !== "string" ||
    value.trim().length === 0
  ) {
    throw new Error(
      `Oracle Companion Guidance '${path}' must be a non-empty string.`
    );
  }

  return value;
}

export function requireNullableString(
  value: unknown,
  path: string
): string | null {
  if (value === null) {
    return null;
  }

  return requireNonEmptyString(
    value,
    path
  );
}

export function requireIsoTimestamp(
  value: unknown,
  path: string
): string {
  const timestamp =
    requireNonEmptyString(
      value,
      path
    );

  if (
    Number.isNaN(
      Date.parse(timestamp)
    ) ||
    new Date(timestamp).toISOString() !==
      timestamp
  ) {
    throw new Error(
      `Oracle Companion Guidance '${path}' must be a UTC ISO 8601 timestamp.`
    );
  }

  return timestamp;
}

export function requireNullableIsoTimestamp(
  value: unknown,
  path: string
): string | null {
  return value === null
    ? null
    : requireIsoTimestamp(
        value,
        path
      );
}

export function requireSemanticVersion(
  value: unknown,
  path: string
): string {
  const version =
    requireNonEmptyString(
      value,
      path
    );

  if (
    !SEMANTIC_VERSION_PATTERN.test(
      version
    )
  ) {
    throw new Error(
      `Oracle Companion Guidance '${path}' must use semantic versioning.`
    );
  }

  return version;
}

export function requireNullableSemanticVersion(
  value: unknown,
  path: string
): string | null {
  return value === null
    ? null
    : requireSemanticVersion(
        value,
        path
      );
}

export function requireFiniteNumber(
  value: unknown,
  path: string
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    throw new Error(
      `Oracle Companion Guidance '${path}' must be a finite number.`
    );
  }

  return value;
}

export function requireStringArray(
  value: unknown,
  path: string
): string[] {
  if (!Array.isArray(value)) {
    throw new Error(
      `Oracle Companion Guidance '${path}' must be an array.`
    );
  }

  return value.map(
    (item, index) =>
      requireNonEmptyString(
        item,
        `${path}[${index}]`
      )
  );
}

export function requireHttpUri(
  value: unknown,
  path: string
): string | null {
  if (value === null) {
    return null;
  }

  const uri =
    requireNonEmptyString(
      value,
      path
    );

  let url: URL;

  try {
    url = new URL(uri);
  } catch {
    throw new Error(
      `Oracle Companion Guidance '${path}' must be a valid HTTP or HTTPS URI.`
    );
  }

  if (
    url.protocol !== "https:" &&
    url.protocol !== "http:"
  ) {
    throw new Error(
      `Oracle Companion Guidance '${path}' must use HTTP or HTTPS.`
    );
  }

  return uri;
}

/**
 * Validates the complete input, including unknown future fields. Compatible
 * fields may be ignored by an older normaliser, but executable values cannot
 * hide in an extension field.
 */
export function assertSerializableData(
  value: unknown,
  path: string
): void {
  assertSerializableValue(
    value,
    path,
    new WeakSet<object>()
  );
}

export function cloneSerializableRecord(
  value: unknown,
  path: string
): Readonly<
  Record<
    string,
    OracleCompanionSerializableValue
  >
> {
  const record =
    requirePlainRecord(
      value,
      path
    );

  assertSerializableData(
    record,
    path
  );

  return structuredClone(
    record
  ) as Record<
    string,
    OracleCompanionSerializableValue
  >;
}

export function deepFreeze<T>(
  value: T
): T {
  if (
    value === null ||
    typeof value !== "object" ||
    Object.isFrozen(value)
  ) {
    return value;
  }

  for (
    const nestedValue
    of Object.values(value)
  ) {
    deepFreeze(nestedValue);
  }

  return Object.freeze(value);
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
    requireFiniteNumber(
      value,
      path
    );
    return;
  }

  if (typeof value !== "object") {
    throw new Error(
      `Oracle Companion Guidance '${path}' contains non-serializable ${typeof value} data.`
    );
  }

  if (ancestors.has(value)) {
    throw new Error(
      `Oracle Companion Guidance '${path}' contains a circular reference.`
    );
  }

  if (
    !Array.isArray(value) &&
    !isPlainRecord(value)
  ) {
    throw new Error(
      `Oracle Companion Guidance '${path}' must contain only plain records and arrays.`
    );
  }

  ancestors.add(value);

  if (Array.isArray(value)) {
    assertSerializableArray(
      value,
      path,
      ancestors
    );
  } else {
    assertSerializableRecord(
      value,
      path,
      ancestors
    );
  }

  ancestors.delete(value);
}

function assertSerializableArray(
  values: readonly unknown[],
  path: string,
  ancestors: WeakSet<object>
): void {
  for (
    let index = 0;
    index < values.length;
    index += 1
  ) {
    if (
      !Object.prototype.hasOwnProperty.call(
        values,
        index
      )
    ) {
      throw new Error(
        `Oracle Companion Guidance '${path}' contains a sparse array.`
      );
    }

    assertSerializableValue(
      values[index],
      `${path}[${index}]`,
      ancestors
    );
  }

  for (
    const key
    of Reflect.ownKeys(values)
  ) {
    if (key === "length") {
      continue;
    }

    if (
      typeof key !== "string" ||
      !isArrayIndex(
        key,
        values.length
      )
    ) {
      throw new Error(
        `Oracle Companion Guidance '${path}' contains a non-serializable array property.`
      );
    }
  }
}

function assertSerializableRecord(
  record: Record<string, unknown>,
  path: string,
  ancestors: WeakSet<object>
): void {
  for (
    const key
    of Reflect.ownKeys(record)
  ) {
    if (typeof key !== "string") {
      throw new Error(
        `Oracle Companion Guidance '${path}' contains a symbol key.`
      );
    }

    const descriptor =
      Object.getOwnPropertyDescriptor(
        record,
        key
      );

    if (
      !descriptor ||
      !descriptor.enumerable ||
      !("value" in descriptor)
    ) {
      throw new Error(
        `Oracle Companion Guidance '${path}.${key}' must be an enumerable data property.`
      );
    }

    assertSerializableValue(
      descriptor.value,
      `${path}.${key}`,
      ancestors
    );
  }
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

  const prototype =
    Object.getPrototypeOf(value);

  return (
    prototype === Object.prototype ||
    prototype === null
  );
}

function isArrayIndex(
  key: string,
  length: number
): boolean {
  const index = Number(key);

  return (
    Number.isInteger(index) &&
    index >= 0 &&
    index < length &&
    String(index) === key
  );
}
