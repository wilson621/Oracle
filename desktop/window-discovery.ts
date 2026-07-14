import {
  OracleNativeHelper,
} from "./native/native-helper.js";

const WINDOW_DISCOVERY_HELPER =
  new OracleNativeHelper({
    name:
      "Oracle native window discovery helper",

    executableName:
      "Oracle.WindowDiscovery.exe",

    environmentPathVariable:
      "ORACLE_WINDOW_DISCOVERY_EXECUTABLE",

    timeoutMs: 5_000,

    maxBufferBytes:
      2 * 1024 * 1024,
  });

export type OracleDesktopDiscoveredWindow = {
  id: string;
  handle: string;

  title: string;

  processId: number;
  processName: string | null;

  visible: boolean;
  minimized: boolean;

  bounds: OracleDesktopWindowBounds;

  discoveredAt: string;
};

export type OracleDesktopWindowBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type OracleDesktopWindowDiscoveryStatus =
  | "ready"
  | "unsupported"
  | "failed";

export type OracleDesktopWindowDiscoveryResult = {
  status: OracleDesktopWindowDiscoveryStatus;
  platform: NodeJS.Platform;

  windows: OracleDesktopDiscoveredWindow[];

  discoveredAt: string;
  durationMs: number;

  error: string | null;
};

type WindowsWindowRecord = {
  handle?: unknown;
  title?: unknown;
  processId?: unknown;
  processName?: unknown;
  visible?: unknown;
  minimized?: unknown;
  x?: unknown;
  y?: unknown;
  width?: unknown;
  height?: unknown;
};

export class OracleDesktopWindowDiscoveryService {
  async discover(): Promise<OracleDesktopWindowDiscoveryResult> {
    const startedAt = Date.now();

    const discoveredAt =
      new Date().toISOString();

    if (process.platform !== "win32") {
      return {
        status: "unsupported",
        platform: process.platform,

        windows: [],

        discoveredAt,

        durationMs:
          Date.now() - startedAt,

        error:
          "Desktop window discovery is currently implemented for Windows only.",
      };
    }

    try {
      const records =
        await discoverWindowsWithNativeHelper();

      const windows = records
        .map((record) =>
          normaliseWindowRecord(
            record,
            discoveredAt
          )
        )
        .filter(
          (
            window
          ): window is OracleDesktopDiscoveredWindow =>
            window !== null
        )
        .sort(
          compareDiscoveredWindows
        );

      return {
        status: "ready",
        platform: process.platform,

        windows,

        discoveredAt,

        durationMs:
          Date.now() - startedAt,

        error: null,
      };
    } catch (error) {
      return {
        status: "failed",
        platform: process.platform,

        windows: [],

        discoveredAt,

        durationMs:
          Date.now() - startedAt,

        error:
          getErrorMessage(error),
      };
    }
  }
}

async function discoverWindowsWithNativeHelper(): Promise<
  WindowsWindowRecord[]
> {
  const payload =
    await WINDOW_DISCOVERY_HELPER
      .runJson();

  if (!Array.isArray(payload)) {
    throw new Error(
      "Oracle native window discovery helper returned an unexpected payload."
    );
  }

  return payload.filter(
    isObjectRecord
  );
}

function normaliseWindowRecord(
  record: WindowsWindowRecord,
  discoveredAt: string
): OracleDesktopDiscoveredWindow | null {
  const handle =
    normaliseRequiredString(
      record.handle
    );

  const title =
    normaliseRequiredString(
      record.title
    );

  const processId =
    normaliseNonNegativeInteger(
      record.processId
    );

  const x =
    normaliseInteger(record.x);

  const y =
    normaliseInteger(record.y);

  const width =
    normalisePositiveInteger(
      record.width
    );

  const height =
    normalisePositiveInteger(
      record.height
    );

  if (
    !handle ||
    !title ||
    processId === null ||
    x === null ||
    y === null ||
    width === null ||
    height === null
  ) {
    return null;
  }

  return {
    id: `win32:${handle}`,
    handle,

    title,

    processId,

    processName:
      normaliseOptionalString(
        record.processName
      ),

    visible:
      normaliseBoolean(
        record.visible
      ),

    minimized:
      normaliseBoolean(
        record.minimized
      ),

    bounds: {
      x,
      y,
      width,
      height,
    },

    discoveredAt,
  };
}

function compareDiscoveredWindows(
  left: OracleDesktopDiscoveredWindow,
  right: OracleDesktopDiscoveredWindow
): number {
  if (
    left.minimized !==
    right.minimized
  ) {
    return left.minimized
      ? 1
      : -1;
  }

  const titleComparison =
    left.title.localeCompare(
      right.title,
      undefined,
      {
        sensitivity: "base",
      }
    );

  if (titleComparison !== 0) {
    return titleComparison;
  }

  return (
    left.processId -
    right.processId
  );
}

function normaliseRequiredString(
  value: unknown
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalised =
    value.trim();

  return normalised.length > 0
    ? normalised
    : null;
}

function normaliseOptionalString(
  value: unknown
): string | null {
  return normaliseRequiredString(
    value
  );
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

function normaliseNonNegativeInteger(
  value: unknown
): number | null {
  const numericValue =
    normaliseInteger(value);

  if (
    numericValue === null ||
    numericValue < 0
  ) {
    return null;
  }

  return numericValue;
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
): value is WindowsWindowRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function getErrorMessage(
  error: unknown
): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}