import {
  execFile,
  type ExecFileOptions,
} from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const DISCOVERY_TIMEOUT_MS = 5_000;
const DISCOVERY_MAX_BUFFER_BYTES =
  2 * 1024 * 1024;

const WINDOWS_DISCOVERY_EXECUTABLE =
  "Oracle.WindowDiscovery.exe";

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
        .sort(compareDiscoveredWindows);

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
        error: getErrorMessage(error),
      };
    }
  }
}

async function discoverWindowsWithNativeHelper(): Promise<
  WindowsWindowRecord[]
> {
  const executablePath =
    resolveDiscoveryExecutablePath();

  if (!existsSync(executablePath)) {
    throw new Error(
      `Oracle native window discovery helper was not found at '${executablePath}'. Run the native helper build before starting Oracle Companion.`
    );
  }

  const options: ExecFileOptions = {
    windowsHide: true,
    timeout: DISCOVERY_TIMEOUT_MS,
    maxBuffer:
      DISCOVERY_MAX_BUFFER_BYTES,
    encoding: "utf8",
  };

  const { stdout } = await execFileAsync(
    executablePath,
    [],
    options
  );

  const output =
    typeof stdout === "string"
      ? stdout.trim()
      : stdout.toString("utf8").trim();

  if (!output) {
    throw new Error(
      "Oracle native window discovery helper returned no output."
    );
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(output);
  } catch {
    throw new Error(
      "Oracle native window discovery helper returned invalid JSON."
    );
  }

  if (!Array.isArray(parsed)) {
    throw new Error(
      "Oracle native window discovery helper returned an unexpected payload."
    );
  }

  return parsed.filter(isObjectRecord);
}

function resolveDiscoveryExecutablePath(): string {
  const configuredPath =
    process.env
      .ORACLE_WINDOW_DISCOVERY_EXECUTABLE;

  if (
    typeof configuredPath === "string" &&
    configuredPath.trim().length > 0
  ) {
    return resolve(
      configuredPath.trim()
    );
  }

  /*
   * Compiled Electron files live in dist-electron.
   * The native helper is built into the sibling
   * dist-native directory.
   */
  return resolve(
    __dirname,
    "..",
    "dist-native",
    WINDOWS_DISCOVERY_EXECUTABLE
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
    return left.minimized ? 1 : -1;
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

  const normalised = value.trim();

  return normalised.length > 0
    ? normalised
    : null;
}

function normaliseOptionalString(
  value: unknown
): string | null {
  return normaliseRequiredString(value);
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
    !Number.isFinite(numericValue)
  ) {
    return null;
  }

  return Math.round(numericValue);
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
  if (
    typeof error === "object" &&
    error !== null
  ) {
    const commandError = error as {
      message?: unknown;
      stderr?: unknown;
      code?: unknown;
      killed?: unknown;
      signal?: unknown;
    };

    const stderr =
      normaliseErrorOutput(
        commandError.stderr
      );

    if (stderr) {
      return stderr;
    }

    if (
      commandError.killed === true
    ) {
      return `Oracle native window discovery exceeded the ${DISCOVERY_TIMEOUT_MS}ms timeout.`;
    }

    if (
      commandError.code === "ENOENT"
    ) {
      return (
        "Oracle native window discovery helper could not be found or started."
      );
    }

    if (
      typeof commandError.message ===
      "string"
    ) {
      return sanitiseCommandError(
        commandError.message
      );
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function normaliseErrorOutput(
  output: unknown
): string | null {
  let text: string | null = null;

  if (typeof output === "string") {
    text = output;
  } else if (Buffer.isBuffer(output)) {
    text =
      output.toString("utf8");
  }

  if (!text) {
    return null;
  }

  const normalised = text.trim();

  return normalised.length > 0
    ? normalised
    : null;
}

function sanitiseCommandError(
  message: string
): string {
  const normalised =
    message.trim();

  const lineBreakIndex =
    normalised.indexOf("\n");

  if (lineBreakIndex === -1) {
    return normalised;
  }

  const firstLine = normalised
    .slice(0, lineBreakIndex)
    .trim();

  return (
    firstLine ||
    "Oracle native window discovery failed."
  );
}