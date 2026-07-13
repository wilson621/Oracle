import {
  execFile,
  type ExecFileOptions,
} from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const DISCOVERY_TIMEOUT_MS = 5_000;
const DISCOVERY_MAX_BUFFER_BYTES =
  2 * 1024 * 1024;

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
    const discoveredAt = new Date().toISOString();

    if (process.platform !== "win32") {
      return {
        status: "unsupported",
        platform: process.platform,
        windows: [],
        discoveredAt,
        durationMs: Date.now() - startedAt,
        error:
          "Desktop window discovery is currently implemented for Windows only.",
      };
    }

    try {
      const records =
        await discoverWindowsWithPowerShell();

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
        durationMs: Date.now() - startedAt,
        error: null,
      };
    } catch (error) {
      return {
        status: "failed",
        platform: process.platform,
        windows: [],
        discoveredAt,
        durationMs: Date.now() - startedAt,
        error: getErrorMessage(error),
      };
    }
  }
}

async function discoverWindowsWithPowerShell(): Promise<
  WindowsWindowRecord[]
> {
  const options: ExecFileOptions = {
    windowsHide: true,
    timeout: DISCOVERY_TIMEOUT_MS,
    maxBuffer: DISCOVERY_MAX_BUFFER_BYTES,
    encoding: "utf8",
  };

  const { stdout } = await execFileAsync(
    "powershell.exe",
    [
      "-NoLogo",
      "-NoProfile",
      "-NonInteractive",
      "-ExecutionPolicy",
      "Bypass",
      "-Command",
      WINDOWS_WINDOW_DISCOVERY_SCRIPT,
    ],
    options
  );

  const output =
    typeof stdout === "string"
      ? stdout.trim()
      : stdout.toString("utf8").trim();

  if (!output) {
    return [];
  }

  const parsed: unknown = JSON.parse(output);

  if (Array.isArray(parsed)) {
    return parsed.filter(isObjectRecord);
  }

  if (isObjectRecord(parsed)) {
    return [parsed];
  }

  throw new Error(
    "Windows window discovery returned an unexpected payload."
  );
}

function normaliseWindowRecord(
  record: WindowsWindowRecord,
  discoveredAt: string
): OracleDesktopDiscoveredWindow | null {
  const handle = normaliseRequiredString(
    record.handle
  );

  const title = normaliseRequiredString(
    record.title
  );

  const processId = normaliseNonNegativeInteger(
    record.processId
  );

  const x = normaliseInteger(record.x);
  const y = normaliseInteger(record.y);

  const width = normalisePositiveInteger(
    record.width
  );

  const height = normalisePositiveInteger(
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
    processName: normaliseOptionalString(
      record.processName
    ),

    visible: normaliseBoolean(
      record.visible
    ),

    minimized: normaliseBoolean(
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
    left.minimized !== right.minimized
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
    left.processId - right.processId
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
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

const WINDOWS_WINDOW_DISCOVERY_SCRIPT = String.raw`
$ErrorActionPreference = "Stop"

Add-Type @"
using System;
using System.Text;
using System.Runtime.InteropServices;

public static class OracleWindowDiscovery
{
    public delegate bool EnumWindowsProc(
        IntPtr hWnd,
        IntPtr lParam
    );

    [StructLayout(LayoutKind.Sequential)]
    public struct RECT
    {
        public int Left;
        public int Top;
        public int Right;
        public int Bottom;
    }

    [DllImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool EnumWindows(
        EnumWindowsProc callback,
        IntPtr lParam
    );

    [DllImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool IsWindowVisible(
        IntPtr hWnd
    );

    [DllImport("user32.dll")]
    public static extern int GetWindowTextLength(
        IntPtr hWnd
    );

    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    public static extern int GetWindowText(
        IntPtr hWnd,
        StringBuilder text,
        int maxLength
    );

    [DllImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool GetWindowRect(
        IntPtr hWnd,
        out RECT rectangle
    );

    [DllImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool IsIconic(
        IntPtr hWnd
    );

    [DllImport("user32.dll")]
    public static extern uint GetWindowThreadProcessId(
        IntPtr hWnd,
        out uint processId
    );

    [DllImport("dwmapi.dll")]
    public static extern int DwmGetWindowAttribute(
        IntPtr hWnd,
        int attribute,
        out int value,
        int valueSize
    );
}
"@

$windows = New-Object System.Collections.Generic.List[object]

$callback = [OracleWindowDiscovery+EnumWindowsProc]{
    param(
        [IntPtr] $windowHandle,
        [IntPtr] $parameter
    )

    if (-not [OracleWindowDiscovery]::IsWindowVisible($windowHandle)) {
        return $true
    }

    $titleLength = [OracleWindowDiscovery]::GetWindowTextLength($windowHandle)

    if ($titleLength -le 0) {
        return $true
    }

    $titleBuilder = New-Object System.Text.StringBuilder ($titleLength + 1)

    [void][OracleWindowDiscovery]::GetWindowText(
        $windowHandle,
        $titleBuilder,
        $titleBuilder.Capacity
    )

    $title = $titleBuilder.ToString().Trim()

    if ([string]::IsNullOrWhiteSpace($title)) {
        return $true
    }

    $cloaked = 0
    $dwmResult = [OracleWindowDiscovery]::DwmGetWindowAttribute(
        $windowHandle,
        14,
        [ref] $cloaked,
        4
    )

    if ($dwmResult -eq 0 -and $cloaked -ne 0) {
        return $true
    }

    $rectangle = New-Object OracleWindowDiscovery+RECT

    if (-not [OracleWindowDiscovery]::GetWindowRect(
        $windowHandle,
        [ref] $rectangle
    )) {
        return $true
    }

    $width = $rectangle.Right - $rectangle.Left
    $height = $rectangle.Bottom - $rectangle.Top

    if ($width -le 0 -or $height -le 0) {
        return $true
    }

    [uint32] $processId = 0

    [void][OracleWindowDiscovery]::GetWindowThreadProcessId(
        $windowHandle,
        [ref] $processId
    )

    $processName = $null

    if ($processId -gt 0) {
        try {
            $processName = (
                Get-Process -Id $processId -ErrorAction Stop
            ).ProcessName
        }
        catch {
            $processName = $null
        }
    }

    $windows.Add(
        [PSCustomObject]@{
            handle = $windowHandle.ToInt64().ToString()
            title = $title
            processId = [int] $processId
            processName = $processName
            visible = $true
            minimized = [OracleWindowDiscovery]::IsIconic($windowHandle)
            x = $rectangle.Left
            y = $rectangle.Top
            width = $width
            height = $height
        }
    )

    return $true
}

[void][OracleWindowDiscovery]::EnumWindows(
    $callback,
    [IntPtr]::Zero
)

ConvertTo-Json -InputObject @($windows) -Compress
`;