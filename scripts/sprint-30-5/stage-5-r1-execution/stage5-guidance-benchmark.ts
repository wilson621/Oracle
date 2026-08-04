import assert from "node:assert/strict";
import fs from "node:fs";
import { performance } from "node:perf_hooks";
import { createCallOfDutyCuratedGuidanceProvider } from "../../../lib/oracle/game-integrations/call-of-duty/guidance/index.js";
import { OracleCompanionGuidanceProviderService } from "../../../lib/oracle/services/companion-guidance/index.js";
import type { OracleCompanionGuidanceRequest } from "../../../lib/companion/guidance/index.js";

const output = process.env.ORACLE_STAGE5_GUIDANCE_OUTPUT;
if (!output) throw new Error("Stage 5 Guidance output is absent.");
if (fs.existsSync(output)) throw new Error("Stage 5 Guidance output is create-only.");
const service = new OracleCompanionGuidanceProviderService([createCallOfDutyCuratedGuidanceProvider()]);
const timestamp = "2026-08-04T00:00:00.000Z";
const request: OracleCompanionGuidanceRequest = {
  contract: { name: "oracle.companion-guidance-request", version: 1 },
  requestId: "stage5-r1-qualified-guidance", requestedAt: timestamp,
  session: { contract: { name: "oracle.companion-guidance-session-projection", version: 1 }, sessionId: "stage5-r1-qualified-session", capturedAt: timestamp, context: {}, game: { integrationId: "call-of-duty", gameName: "Call of Duty", integrationVersion: "1.0.0", context: { supportedExperience: "warzone", detectedExperience: "warzone" } } },
  category: null, type: null, operatorPrompt: null, maximumSpoilerLevel: "none",
};
for (let index = 0; index < 50; index++) await service.execute(request);
const durationsMilliseconds: number[] = [];
for (let index = 0; index < 1_000; index++) {
  const started = performance.now();
  const result = await service.execute(request);
  durationsMilliseconds.push(performance.now() - started);
  assert.equal(result.guidance.length, 4); assert.equal(result.failures.length, 0);
}
fs.writeFileSync(output, `${JSON.stringify({ contract: "oracle.sprint-30-5.stage-5-r1-guidance-latency", result: "passed", classification: "GOVERNED-STAGE-5-R1-QUALIFICATION", durationsMilliseconds }, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
