import {
  OracleNativeHelper,
} from "../native/native-helper.js";
import type {
  OracleDesktopWindowBounds,
} from "../window-discovery.js";

const WINDOW_OBSERVER_HELPER =
  new OracleNativeHelper({
    name:
      "Oracle native window observer",

    executableName:
      "Oracle.WindowObserver.exe",

    environmentPathVariable:
      "ORACLE_WINDOW_OBSERVER_EXECUTABLE",

    timeoutMs: 5_000,

    maxBufferBytes:
      256 * 1024,
  });

export type OracleDesktopWindowObservation = {
  handle: string;

  exists: boolean;
  visible: boolean;
  minimized: boolean;

  bounds:
    OracleDesktopWindowBounds | null;

  observedAt: string;
};

type NativeWindowObservationPayload = {
  handle?: unknown;

  exists?: unknown;
  visible?: unknown;
  minimized?: unknown;

  bounds?: unknown;
};

type NativeWindowBoundsPayload = {
  x?: unknown;
  y?: unknown;
  width?: unknown;
  height?: unknown;
};

export class OracleDesktopWindowObserver {
  async observe(
    handle: string
  ): Promise<OracleDesktopWindowObservation> {
    const normalisedHandle =
      normaliseHandle(handle);

    if (!normalisedHandle) {
      throw new Error(
        "A valid native window handle is required for observation."
      );
    }

    if (process.platform !== "win32") {
      throw new Error(
        "Native desktop window observation is currently implemented for Windows only."
      );
    }

    const payload =
      await WINDOW_OBSERVER_HELPER.runJson({
        arguments: [
          normalisedHandle,
        ],
      });

    return normaliseObservation(
      payload,
      normalisedHandle
    );
  }
}

function normaliseObservation(
  payload: unknown,
  expectedHandle: string
): OracleDesktopWindowObservation {
  if (!isObjectRecord(payload)) {
    throw new Error(
      "Oracle native window observer returned an unexpected payload."
    );
  }

  const nativePayload =
    payload as NativeWindowObservationPayload;

  const handle =
    normaliseHandle(
      nativePayload.handle
    );

  if (
    !handle ||
    handle !== expectedHandle
  ) {
    throw new Error(
      "Oracle native window observer returned an unexpected window handle."
    );
  }

  const exists =
    normaliseBoolean(
      nativePayload.exists
    );

  const visible =
    normaliseBoolean(
      nativePayload.visible
    );

  const minimized =
    normaliseBoolean(
      nativePayload.minimized
    );

  const bounds =
    normaliseBounds(
      nativePayload.bounds
    );

  if (
    exists &&
    !minimized &&
    bounds === null
  ) {
    throw new Error(
      "Oracle native window observer did not return usable bounds for the target window."
    );
  }

  return {
    handle,

    exists,
    visible,
    minimized,

    bounds,

    observedAt:
      new Date().toISOString(),
  };
}

function normaliseBounds(
  value: unknown
): OracleDesktopWindowBounds | null {
  if (value === null) {
    return null;
  }

  if (!isObjectRecord(value)) {
    return null;
  }

  const bounds =
    value as NativeWindowBoundsPayload;

  const x =
    normaliseInteger(bounds.x);

  const y =
    normaliseInteger(bounds.y);

  const width =
    normalisePositiveInteger(
      bounds.width
    );

  const height =
    normalisePositiveInteger(
      bounds.height
    );

  if (
    x === null ||
    y === null ||
    width === null ||
    height === null
  ) {
    return null;
  }

  return {
    x,
    y,
    width,
    height,
  };
}

function normaliseHandle(
  value: unknown
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalised =
    value.trim();

  if (
    normalised.length === 0 ||
    !/^-?\d+$/u.test(
      normalised
    ) ||
    normalised === "0"
  ) {
    return null;
  }

  return normalised;
}

function normaliseBoolean(
  value: unknown
): boolean {
  return value === true;
}

function normaliseInteger(
  value: unknown
): number | null {
  const numericValue =
    typeof value === "number"
      ? value
      : Number(value);

  if (
    !Number.isFinite(
      numericValue
    )
  ) {
    return null;
  }

  return Math.round(
    numericValue
  );
}

function normalisePositiveInteger(
  value: unknown
): number | null {
  const numericValue =
    normaliseInteger(value);

  if (
    numericValue === null ||
    numericValue <= 0
  ) {
    return null;
  }

  return numericValue;
}

function isObjectRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}