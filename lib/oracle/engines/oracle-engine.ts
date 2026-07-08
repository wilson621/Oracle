import type { OracleContext } from "@/lib/oracle/context";

export type OracleEngineResult<TOutput> = {
  engineId: string;
  generatedAt: string;
  output: TOutput;
};

export interface OracleEngine<TOutput> {
  id: string;
  execute(context: OracleContext): Promise<OracleEngineResult<TOutput>>;
}