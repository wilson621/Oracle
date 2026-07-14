import {
  execFile,
  type ExecFileOptions,
} from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { promisify } from "node:util";
import {
  OracleNativeHelperError,
} from "./native-errors.js";

const execFileAsync = promisify(execFile);

const DEFAULT_TIMEOUT_MS = 5_000;

const DEFAULT_MAX_BUFFER_BYTES =
  2 * 1024 * 1024;

export type OracleNativeHelperDefinition = {
  name: string;
  executableName: string;

  environmentPathVariable?: string;

  timeoutMs?: number;
  maxBufferBytes?: number;
};

export type OracleNativeHelperRunOptions = {
  arguments?: string[];
};

export class OracleNativeHelper {
  constructor(
    private readonly definition: OracleNativeHelperDefinition
  ) {}

  getExecutablePath(): string {
    const configuredPath =
      this.getConfiguredExecutablePath();

    if (configuredPath) {
      return configuredPath;
    }

    /*
     * Compiled files under desktop/native are emitted to:
     *
     * dist-electron/native/native-helper.js
     *
     * Native executables are built into:
     *
     * dist-native/
     */
    return resolve(
      __dirname,
      "..",
      "..",
      "dist-native",
      this.definition.executableName
    );
  }

  async runJson(
    options: OracleNativeHelperRunOptions = {}
  ): Promise<unknown> {
    const executablePath =
      this.getExecutablePath();

    this.assertExecutableExists(
      executablePath
    );

    const output =
      await this.execute(
        executablePath,
        options.arguments ?? []
      );

    if (!output) {
      throw new OracleNativeHelperError({
        code: "helper-empty-output",
        helperName:
          this.definition.name,
        message:
          `${this.definition.name} returned no output.`,
      });
    }

    try {
      return JSON.parse(output);
    } catch (error) {
      throw new OracleNativeHelperError({
        code: "helper-invalid-json",
        helperName:
          this.definition.name,
        message:
          `${this.definition.name} returned invalid JSON.`,
        cause: error,
      });
    }
  }

  private getConfiguredExecutablePath():
    | string
    | null {
    const variableName =
      this.definition
        .environmentPathVariable;

    if (!variableName) {
      return null;
    }

    const configuredValue =
      process.env[variableName];

    if (
      typeof configuredValue !== "string" ||
      configuredValue.trim().length === 0
    ) {
      return null;
    }

    return resolve(
      configuredValue.trim()
    );
  }

  private assertExecutableExists(
    executablePath: string
  ): void {
    if (existsSync(executablePath)) {
      return;
    }

    throw new OracleNativeHelperError({
      code: "helper-not-found",
      helperName:
        this.definition.name,
      message:
        `${this.definition.name} was not found at '${executablePath}'. Run the native desktop build before starting Oracle Companion.`,
    });
  }

  private async execute(
    executablePath: string,
    arguments_: string[]
  ): Promise<string> {
    const timeoutMs =
      this.definition.timeoutMs ??
      DEFAULT_TIMEOUT_MS;

    const options: ExecFileOptions = {
      windowsHide: true,
      timeout: timeoutMs,
      maxBuffer:
        this.definition.maxBufferBytes ??
        DEFAULT_MAX_BUFFER_BYTES,
      encoding: "utf8",
    };

    try {
      const { stdout } =
        await execFileAsync(
          executablePath,
          arguments_,
          options
        );

      return normaliseProcessOutput(
        stdout
      );
    } catch (error) {
      throw createExecutionError({
        error,
        helperName:
          this.definition.name,
        timeoutMs,
      });
    }
  }
}

function createExecutionError(options: {
  error: unknown;
  helperName: string;
  timeoutMs: number;
}): OracleNativeHelperError {
  const commandError =
    normaliseCommandError(
      options.error
    );

  if (commandError.killed) {
    return new OracleNativeHelperError({
      code: "helper-timeout",
      helperName: options.helperName,
      message:
        `${options.helperName} exceeded the ${options.timeoutMs}ms timeout.`,
      exitCode:
        commandError.exitCode,
      cause: options.error,
    });
  }

  if (
    commandError.code === "ENOENT"
  ) {
    return new OracleNativeHelperError({
      code: "helper-start-failed",
      helperName: options.helperName,
      message:
        `${options.helperName} could not be found or started.`,
      exitCode:
        commandError.exitCode,
      cause: options.error,
    });
  }

  const stderr =
    normaliseProcessOutput(
      commandError.stderr
    );

  const message =
    stderr ||
    sanitiseCommandMessage(
      commandError.message
    ) ||
    `${options.helperName} exited unexpectedly.`;

  return new OracleNativeHelperError({
    code: "helper-exit-failed",
    helperName: options.helperName,
    message,
    exitCode:
      commandError.exitCode,
    cause: options.error,
  });
}

type NormalisedCommandError = {
  message: string | null;
  stderr: unknown;
  code: unknown;
  killed: boolean;
  exitCode: number | string | null;
};

function normaliseCommandError(
  error: unknown
): NormalisedCommandError {
  if (
    typeof error !== "object" ||
    error === null
  ) {
    return {
      message: String(error),
      stderr: null,
      code: null,
      killed: false,
      exitCode: null,
    };
  }

  const value = error as {
    message?: unknown;
    stderr?: unknown;
    code?: unknown;
    killed?: unknown;
  };

  return {
    message:
      typeof value.message === "string"
        ? value.message
        : null,

    stderr: value.stderr,

    code: value.code,

    killed: value.killed === true,

    exitCode:
      typeof value.code === "number" ||
      typeof value.code === "string"
        ? value.code
        : null,
  };
}

function normaliseProcessOutput(
  output: unknown
): string {
  if (typeof output === "string") {
    return output.trim();
  }

  if (Buffer.isBuffer(output)) {
    return output
      .toString("utf8")
      .trim();
  }

  return "";
}

function sanitiseCommandMessage(
  message: string | null
): string | null {
  if (!message) {
    return null;
  }

  const normalised =
    message.trim();

  if (!normalised) {
    return null;
  }

  const firstLine =
    normalised
      .split(/\r?\n/u, 1)[0]
      ?.trim();

  return firstLine || null;
}