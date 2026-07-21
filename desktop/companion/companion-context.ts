import type {
  OracleDesktopHostSnapshot,
} from "../platform/desktop-host-snapshot.js";

export type OracleCompanionGameContext =
  Readonly<{
    integrationId: string;
    gameName: string;
    version: string;
    state:
      Readonly<
        Record<string, unknown>
      >;
  }>;

export type OracleCompanionContext =
  Readonly<{
  desktop:
    OracleDesktopHostSnapshot | null;

  game:
    OracleCompanionGameContext | null;

  capturedAt: string;
  }>;

export type CreateOracleCompanionContextInput = {
  desktop?:
    OracleDesktopHostSnapshot | null;

  game?:
    OracleCompanionGameContext | null;

  capturedAt?: string;
};

export function createOracleCompanionContext(
  input:
    CreateOracleCompanionContextInput = {}
): OracleCompanionContext {
  const capturedAt =
    input.capturedAt ??
    new Date().toISOString();

  const context:
    OracleCompanionContext = {
    desktop:
      input.desktop == null
        ? null
        : structuredClone(
            input.desktop
          ),

    game:
      input.game == null
        ? null
        : createOracleCompanionGameContext(
            input.game
          ),

    capturedAt,
  };

  return deepFreeze(
    context
  );
}

export function createOracleCompanionGameContext(
  context:
    OracleCompanionGameContext
): OracleCompanionGameContext {
  return deepFreeze(
    cloneSerializableGameContext(
      context
    )
  );
}

export function cloneOracleCompanionContext(
  context:
    OracleCompanionContext
): OracleCompanionContext {
  return createOracleCompanionContext({
    desktop:
      context.desktop,

    game:
      context.game,

    capturedAt:
      context.capturedAt,
  });
}

function cloneSerializableGameContext(
  context:
    OracleCompanionGameContext
): OracleCompanionGameContext {
  if (!isPlainRecord(context)) {
    throw new Error(
      "Oracle Companion game context must be a plain serializable record."
    );
  }

  assertNonEmptyString(
    context.integrationId,
    "integrationId"
  );
  assertNonEmptyString(
    context.gameName,
    "gameName"
  );
  assertNonEmptyString(
    context.version,
    "version"
  );

  if (!isPlainRecord(context.state)) {
    throw new Error(
      "Oracle Companion game context state must be a plain serializable record."
    );
  }

  assertSerializableValue(
    context.state,
    "state",
    new WeakSet<object>()
  );

  try {
    return {
      integrationId:
        context.integrationId,

      gameName:
        context.gameName,

      version:
        context.version,

      state:
        structuredClone(
          context.state
        ),
    };
  } catch (error) {
    throw new Error(
      "Oracle Companion game context could not be serialized.",
      {
        cause: error,
      }
    );
  }
}

function assertSerializableValue(
  value: unknown,
  path: string,
  ancestors: WeakSet<object>
): void {
  if (value === null) {
    return;
  }

  if (
    typeof value === "string" ||
    typeof value === "boolean"
  ) {
    return;
  }

  if (typeof value === "number") {
    if (Number.isFinite(value)) {
      return;
    }

    throw new Error(
      `Oracle Companion game context '${path}' must contain a finite number.`
    );
  }

  if (
    typeof value !== "object"
  ) {
    throw new Error(
      `Oracle Companion game context '${path}' contains a non-serializable ${typeof value} value.`
    );
  }

  if (ancestors.has(value)) {
    throw new Error(
      `Oracle Companion game context '${path}' contains a circular reference.`
    );
  }

  if (
    !Array.isArray(value) &&
    !isPlainRecord(value)
  ) {
    throw new Error(
      `Oracle Companion game context '${path}' must contain only plain objects and arrays.`
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
        `Oracle Companion game context '${path}' contains a sparse array.`
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
        `Oracle Companion game context '${path}' contains a non-serializable array property.`
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
        `Oracle Companion game context '${path}' contains a symbol key.`
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
        `Oracle Companion game context '${path}.${key}' must be an enumerable data property.`
      );
    }

    assertSerializableValue(
      descriptor.value,
      `${path}.${key}`,
      ancestors
    );
  }
}

function assertNonEmptyString(
  value: string,
  field: string
): void {
  if (
    typeof value === "string" &&
    value.trim().length > 0
  ) {
    return;
  }

  throw new Error(
    `Oracle Companion game context '${field}' must be a non-empty string.`
  );
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
    prototype ===
      Object.prototype ||
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

function deepFreeze<T>(
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
