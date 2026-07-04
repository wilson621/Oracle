import OpenAI from "openai";
import { oraclePrompt } from "./oraclePrompt";
import type { OracleReport } from "@/types/oracle";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyseFight(prompt: string): Promise<OracleReport> {
  const response = await client.responses.create({
    model: "gpt-5.5",
    text: {
      format: {
        type: "json_schema",
        name: "oracle_report",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            summary: { type: "string" },
            winChance: { type: "number" },
            confidence: { type: "number" },
            grade: { type: "string" },
            diagnosis: { type: "string" },
            strength: { type: "string" },
            correction: { type: "string" },
            training: { type: "string" },
            scores: {
              type: "object",
              additionalProperties: false,
              properties: {
                positioning: { type: "number" },
                aim: { type: "number" },
                movement: { type: "number" },
                decisionMaking: { type: "number" },
                gameSense: { type: "number" },
              },
              required: [
                "positioning",
                "aim",
                "movement",
                "decisionMaking",
                "gameSense",
              ],
            },
          },
          required: [
            "summary",
            "winChance",
            "confidence",
            "grade",
            "diagnosis",
            "strength",
            "correction",
            "training",
            "scores",
          ],
        },
      },
    },
    input: `${oraclePrompt}

Player's fight:

${prompt}`,
  });

  return JSON.parse(response.output_text) as OracleReport;
}