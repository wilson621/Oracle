import { randomUUID } from "node:crypto";
import { GoogleGenAI } from "@google/genai";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  GEMINI_LOADOUT_MODEL,
  GEMINI_LOADOUT_RESPONSE_SCHEMA,
  type OracleLoadoutBuild,
  type OracleLoadoutRecommendationRow,
  type OracleLoadoutSource,
} from "./oracle-loadout-recommendation-report";
import { persistLoadoutRecommendation } from "./persist-loadout-recommendation";
import {
  describeGeminiFailure,
  withGeminiRetry,
} from "../gemini/gemini-retry";
import { recordGeminiUsage } from "../gemini/gemini-usage-log";

export type GenerateLoadoutRecommendationInput = Readonly<{
  supabase: SupabaseClient;
  operatorId: string;
  game: string;
  /** What the Operator actually typed, e.g. "no recoil build", "movement build". */
  requestedGoal: string;
}>;

// How many of the Operator's most recent completed Full Match Analysis
// reports to consider when building a playstyle profile. Bounded rather
// than "all of them" both to keep the prompt small/cheap and because a
// playstyle from 6 months ago is less relevant than one from this week.
const MAX_MATCHES_FOR_PROFILE = 20;

const LOADOUT_SYSTEM_PROMPT = `
You are Oracle, an elite Call of Duty loadout strategist. An Operator has
asked you for a specific kind of build (e.g. "no recoil build", "movement
build") and you need to give them one real, currently-usable loadout that
actually fits both what they asked for and, when it's provided, how they
actually play.

A real Call of Duty loadout has two weapon slots this tool recommends for --
Primary Weapon and Secondary Weapon -- and a skilled player treats the
pairing as a deliberate decision, not primary-plus-an-afterthought: each
weapon should cover a different part of the fight so the Operator isn't
caught out at a range their primary is weak at. Both slots can be filled
from any non-melee weapon category the current game has -- Assault Rifles,
SMGs, LMGs, Shotguns, Marksman Rifles, Sniper Rifles, Battle Rifles,
Pistols, Launchers, whatever exists in the current game per your search
(in current titles this dual-primary flexibility is Overkill, and it's the
default now, not a perk/wildcard tax the Operator has to pay for it -- so
freely pair two full-size weapons, e.g. AR+SMG or AR+Sniper, whenever the
goal calls for it, exactly as often as a Primary+Pistol pairing). The one
category never valid in primaryWeapon or secondaryWeapon is Melee: Melee
weapons occupy their own separate, dedicated equip slot alongside these two
(pulled out with its own button/key), which this tool doesn't recommend
for, so a Melee weapon -- however good a search result looks for it -- can
never be the answer for either field. Actively choose a secondary that
complements the primary's engagement range for THIS Operator's stated
goal/playstyle: an aggressive, close-quarters Operator who also needs to
hold mid-range might get an AR paired with an SMG, but just as easily a
different goal calls for a Sniper Rifle paired with a Shotgun, an LMG
paired with a Pistol, a Marksman Rifle paired with an SMG, or any other
combination -- work out which two categories the goal/playstyle actually
calls for rather than reaching for the same pairing every time. Explain
that pairing logic explicitly in the summary: which weapon covers which
range/situation and why that split fits this Operator. A secondary should
still be null when the goal is genuinely single-weapon-focused or a second
weapon wouldn't meaningfully help -- never add one just to fill the slot.

Attachment selection is where this actually gets proven, not just the
weapon names -- treat each weapon's attachments as answering a specific
question, not just "some reasonable attachments for this gun", and this
applies to every weapon category the same way, not just the categories used
as examples here. Work out what this weapon in this build needs to optimise
for (recoil control, mobility/ADS-and-sprint-to-fire speed, effective
range, handling, magazine size, one-shot reliability, etc. -- whatever
actually matters for that weapon's category and this build) from the
Operator's stated goal, and pick attachments that actually serve that --
including trading away a stat that doesn't matter for this build to get one
that does, the way a real attachment build always involves a tradeoff. When
the Operator's goal names different priorities for different weapons (e.g.
"no recoil AR, movement SMG" -- equally applicable to any other pairing,
like "fast ADS sniper, no recoil shotgun"), apply each priority to its own
weapon rather than blending them -- one weapon's attachments should be
chosen for its stated priority even if that costs it some other stat, and
the same for the other weapon on its own priority, not a one-size-fits-all
attachment philosophy applied to both. Say in the summary what each
weapon's attachments are actually optimising for and why.

You have live Google Search available -- use it. Never name a weapon,
attachment, or perk from memory alone: search for the current Call of Duty
weapon/attachment/perk data for the game and season in question, and build
the recommendation only from what you actually find. If search results are
thin or ambiguous for something, say so in the summary rather than guessing.
Getting this wrong (a weapon or attachment that isn't actually in the
current game) is worse than a shorter, more honest answer.

When a playstyle profile is provided, this is the whole point of the
exercise: don't hand back a generic "meta" build a search engine would give
anyone. Explain, concretely, why this specific build fits both their stated
goal AND their actual observed playstyle (engagement range, aggression,
movement habits, weapons they've actually used). When no playstyle profile
is provided, say plainly in the summary that this build is based on their
stated goal and current meta only, since they don't have any analysed
matches yet -- never imply personalisation that isn't there.
`.trim();

/**
 * Calls Gemini (with live Google Search grounding, so weapon/attachment
 * data reflects the current game rather than the model's training data) to
 * turn an Operator's stated goal, plus their playstyle profile aggregated
 * from past Full Match Analysis reports when they have any, into one
 * concrete loadout recommendation. Always returns a row rather than
 * throwing -- same reasoning as generateMatchVideoCoachingReport: a failed
 * call still leaves the Operator a saved, visible "this didn't work"
 * record instead of the request just disappearing.
 */
export async function generateLoadoutRecommendation(
  input: GenerateLoadoutRecommendationInput
): Promise<OracleLoadoutRecommendationRow> {
  const id = randomUUID();
  const base = {
    id,
    operatorId: input.operatorId,
    game: input.game,
    requestedGoal: input.requestedGoal,
    generatedAt: new Date().toISOString(),
  } as const;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return persistLoadoutRecommendation(input.supabase, {
      ...base,
      status: "failed",
      model: null,
      personalizationLevel: null,
      matchesConsidered: 0,
      loadout: null,
      summary: null,
      sources: [],
      rawError: "GEMINI_API_KEY is not configured on this server.",
    });
  }

  const profile = await buildPlaystyleProfile(
    input.supabase,
    input.operatorId
  );

  try {
    const ai = new GoogleGenAI({ apiKey });

    const profileNote =
      profile.matchesConsidered > 0
        ? `This Operator has ${profile.matchesConsidered} analysed match(es) on file. Their playstyle profile: ${profile.summaryText}`
        : "This Operator has no analysed match history yet -- base the build on their stated goal and current meta only, and say so plainly in the summary.";

    const response = await withGeminiRetry("loadout recommendation", () =>
      ai.models.generateContent({
        model: GEMINI_LOADOUT_MODEL,
        contents: [
          {
            role: "user",
            parts: [
              {
                text:
                  `Game: ${input.game}.\n` +
                  `Operator's requested goal: "${input.requestedGoal}"\n` +
                  `${profileNote}\n\n` +
                  "Search for current, real weapon/attachment/perk data and produce one loadout recommendation.",
              },
            ],
          },
        ],
        config: {
          systemInstruction: LOADOUT_SYSTEM_PROMPT,
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseJsonSchema: GEMINI_LOADOUT_RESPONSE_SCHEMA,
        },
      })
    );

    const text = response.text;
    if (!text) {
      throw new Error("Gemini returned an empty response.");
    }
    const parsed = JSON.parse(text) as {
      loadout: OracleLoadoutBuild;
      summary: string;
    };

    const sources = extractGroundingSources(response);

    await recordGeminiUsage(input.supabase, {
      operatorId: input.operatorId,
      feature: "loadout-intelligence",
      model: GEMINI_LOADOUT_MODEL,
      response,
    });

    return await persistLoadoutRecommendation(input.supabase, {
      ...base,
      status: "complete",
      model: GEMINI_LOADOUT_MODEL,
      personalizationLevel:
        profile.matchesConsidered > 0 ? "personalized" : "generic",
      matchesConsidered: profile.matchesConsidered,
      loadout: parsed.loadout,
      summary: parsed.summary,
      sources,
      rawError: null,
    });
  } catch (error) {
    return persistLoadoutRecommendation(input.supabase, {
      ...base,
      status: "failed",
      model: GEMINI_LOADOUT_MODEL,
      personalizationLevel:
        profile.matchesConsidered > 0 ? "personalized" : "generic",
      matchesConsidered: profile.matchesConsidered,
      loadout: null,
      summary: null,
      sources: [],
      rawError: describeGeminiFailure(error),
    });
  }
}

type PlaystyleReportRow = Readonly<{
  engagement_range: string | null;
  aggression_style: string | null;
  movement_style: string | null;
  weapons_observed: readonly string[] | null;
  notable_tendencies: readonly string[] | null;
}>;

/**
 * Pulls the Operator's most recent completed Full Match Analysis reports
 * and aggregates their playstyle fields into one compact profile Gemini
 * can use. Reports from before playstyle capture existed (or ones where
 * the footage genuinely didn't show enough to judge) have every field
 * null/empty and are excluded rather than diluting the profile with
 * "no data" noise.
 */
async function buildPlaystyleProfile(
  supabase: SupabaseClient,
  operatorId: string
): Promise<{ matchesConsidered: number; summaryText: string }> {
  const { data, error } = await supabase
    .from("oracle_match_coaching_reports")
    .select(
      "engagement_range,aggression_style,movement_style,weapons_observed,notable_tendencies"
    )
    .eq("operator_id", operatorId)
    .eq("status", "complete")
    .order("generated_at", { ascending: false })
    .limit(MAX_MATCHES_FOR_PROFILE);

  if (error || !data) {
    // Best-effort: a profile query failure shouldn't block generating a
    // (generic) recommendation -- it just falls back to no profile.
    return { matchesConsidered: 0, summaryText: "" };
  }

  const rows = (data as PlaystyleReportRow[]).filter(
    (row) =>
      row.engagement_range !== null ||
      row.aggression_style !== null ||
      row.movement_style !== null ||
      (row.weapons_observed?.length ?? 0) > 0 ||
      (row.notable_tendencies?.length ?? 0) > 0
  );

  if (rows.length === 0) {
    return { matchesConsidered: 0, summaryText: "" };
  }

  const engagementRange = mostCommon(rows.map((row) => row.engagement_range));
  const aggressionStyle = mostCommon(rows.map((row) => row.aggression_style));
  const movementStyle = mostCommon(rows.map((row) => row.movement_style));
  const weapons = uniqueCapped(
    rows.flatMap((row) => row.weapons_observed ?? []),
    15
  );
  const tendencies = uniqueCapped(
    rows.flatMap((row) => row.notable_tendencies ?? []),
    10
  );

  const parts: string[] = [];
  if (engagementRange) parts.push(`typically engages at ${engagementRange} range`);
  if (aggressionStyle) parts.push(`plays a ${aggressionStyle} style`);
  if (movementStyle) parts.push(`movement is ${movementStyle}`);
  if (weapons.length > 0) parts.push(`has used: ${weapons.join(", ")}`);
  if (tendencies.length > 0) {
    parts.push(`notable tendencies: ${tendencies.join("; ")}`);
  }

  return {
    matchesConsidered: rows.length,
    summaryText: parts.length > 0 ? parts.join(". ") + "." : "",
  };
}

function mostCommon(values: readonly (string | null)[]): string | null {
  const counts = new Map<string, number>();
  for (const value of values) {
    if (value === null) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  let best: string | null = null;
  let bestCount = 0;
  for (const [value, count] of counts) {
    if (count > bestCount) {
      best = value;
      bestCount = count;
    }
  }
  return best;
}

function uniqueCapped(values: readonly string[], cap: number): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    result.push(trimmed);
    if (result.length >= cap) break;
  }
  return result;
}

/**
 * Extracts Google Search grounding citations from the response so a
 * recommendation's current-meta claims can be traced back to where they
 * came from -- see GroundingChunk/GroundingChunkWeb in the @google/genai
 * SDK. Deliberately tolerant of the metadata being partial or absent
 * (grounding isn't guaranteed to fire on every call) rather than treating
 * a missing citation as an error.
 */
function extractGroundingSources(response: {
  candidates?: readonly {
    groundingMetadata?: {
      groundingChunks?: readonly {
        web?: { title?: string; uri?: string };
      }[];
    };
  }[];
}): OracleLoadoutSource[] {
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
  const seen = new Set<string>();
  const sources: OracleLoadoutSource[] = [];
  for (const chunk of chunks) {
    const uri = chunk.web?.uri;
    if (!uri || seen.has(uri)) continue;
    seen.add(uri);
    sources.push({ title: chunk.web?.title ?? uri, url: uri });
    if (sources.length >= 10) break;
  }
  return sources;
}
