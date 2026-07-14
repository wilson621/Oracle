export type OracleGameDetectionInput = {
  processId: number;

  processName: string;

  title: string;

  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  isForeground: boolean | null;
};