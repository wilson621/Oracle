export type OracleGameDetectionResult =
  | {
      detected: false;
    }
  | {
      detected: true;

      integrationId: string;

      explanation: string;
    };