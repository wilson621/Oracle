export type OracleGameDetectionMatch =
  Readonly<{
    integrationId: string;

    gameName: string;

    integrationVersion: string;

    explanation: string;
  }>;

export type OracleGameDetectionResult =
  | Readonly<{
      detected: false;
    }>
  | Readonly<{
      detected: true;

      match:
        OracleGameDetectionMatch;
    }>;

export type OracleGameDetectionFailure =
  Readonly<{
    integrationId: string;

    gameName: string;

    integrationVersion: string;

    explanation: string;
  }>;

type OracleGameDetectionOutcomeBase =
  Readonly<{
    failures:
      readonly OracleGameDetectionFailure[];
  }>;

export type OracleGameNotDetectedOutcome =
  OracleGameDetectionOutcomeBase &
    Readonly<{
      status:
        "not-detected";

      matches: readonly [];
    }>;

export type OracleGameDetectedOutcome =
  OracleGameDetectionOutcomeBase &
    Readonly<{
      status: "detected";

      match:
        OracleGameDetectionMatch;

      matches:
        readonly [
          OracleGameDetectionMatch,
        ];
    }>;

export type OracleGameAmbiguousOutcome =
  OracleGameDetectionOutcomeBase &
    Readonly<{
      status: "ambiguous";

      matches:
        readonly OracleGameDetectionMatch[];
    }>;

export type OracleGameDetectionOutcome =
  | OracleGameNotDetectedOutcome
  | OracleGameDetectedOutcome
  | OracleGameAmbiguousOutcome;
