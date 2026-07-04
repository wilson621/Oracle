export type OracleReport = {
  summary: string;
  winChance: number;
  confidence: number;
  grade: string;
  diagnosis: string;
  strength: string;
  correction: string;
  training: string;
  scores: {
    positioning: number;
    aim: number;
    movement: number;
    decisionMaking: number;
    gameSense: number;
  };
};