export type OracleNativeHelperErrorCode =
  | "helper-not-found"
  | "helper-timeout"
  | "helper-start-failed"
  | "helper-exit-failed"
  | "helper-empty-output"
  | "helper-invalid-json";

export class OracleNativeHelperError extends Error {
  readonly code: OracleNativeHelperErrorCode;

  readonly helperName: string;

  readonly exitCode: number | string | null;

  constructor(options: {
    code: OracleNativeHelperErrorCode;
    helperName: string;
    message: string;
    exitCode?: number | string | null;
    cause?: unknown;
  }) {
    super(options.message, {
      cause: options.cause,
    });

    this.name = "OracleNativeHelperError";
    this.code = options.code;
    this.helperName = options.helperName;
    this.exitCode =
      options.exitCode ?? null;
  }
}