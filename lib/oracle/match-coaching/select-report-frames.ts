export type SelectableFrame = {
  capturedAt: string;
  jpegBase64: string;
  diffScore: number;
};

export type SelectedReportFrame = SelectableFrame & {
  tag: "overview" | "moment";
};

// There is no reliable OS-level signal for "lobby ended, match started" --
// it's the same game window throughout, and nobody can be tapping a
// button mid-firefight to mark it. So this is a best-effort guess from
// motion alone: lobby/loadout screens are mostly static (reading menus,
// the occasional click), while actual gameplay has near-continuous
// camera/environment motion. Find the first point where motion stays
// elevated for a sustained stretch and treat that as "probably dropped
// in," then concentrate frame selection after it instead of spreading
// evenly across lobby time too. Deliberately conservative: if nothing
// clearly sustained is found, or a session is too short to judge, it
// falls back to not trimming anything rather than risking cutting real
// match content on a bad guess.
const MOTION_WINDOW_FRAMES = 5;
const SUSTAINED_MOTION_THRESHOLD = 0.15;
const MAX_LOBBY_FRACTION = 0.6;
const MIN_FRAMES_TO_ATTEMPT_TRIM = 20;

const OVERVIEW_FRAME_TARGET = 12;
// Lower than before: a real gunfight's frame-to-frame pixel change is
// often smaller than a full scene cut (menu open, killcam transition,
// loadout/gulag screens), which previously dominated the top spikes and
// crowded actual combat out of the selected set entirely. Casting a wider
// net here, and leaning on MOMENT_SPIKE_CAP/MOMENT_CONTEXT_FRAMES below to
// keep both combat and UI-transition spikes without losing either.
const MOMENT_DIFF_THRESHOLD = 0.08;
const MOMENT_SPIKE_CAP = 20;
// 2 neighbours on each side (5 frames per spike) instead of 1, so a burst
// actually covers a few seconds either side of a cut -- important for
// killcams specifically, since the informative part (the enemy's position
// and sightline) is usually a second or two into the replay, not the very
// first frame after the cut.
const MOMENT_CONTEXT_FRAMES = 2;

/**
 * Reduces a full match's captured frames down to a bounded set worth
 * sending to a vision model: a spread of frames across the whole session
 * for overall pacing/positioning, plus short bursts of frames around the
 * biggest visual jumps (a cheap stand-in for death/killcam transitions,
 * since those are visually distinct screen changes -- the model itself
 * decides what actually happened in each burst).
 *
 * Keeping this bounded keeps report cost and turnaround predictable
 * regardless of how long a match runs.
 */
export function selectReportFrames(
  frames: readonly SelectableFrame[]
): readonly SelectedReportFrame[] {
  if (frames.length === 0) return [];

  const matchStartIndex = detectLikelyMatchStart(frames);
  const inMatchFrames = frames.slice(matchStartIndex);

  const overviewIndices = evenlySpacedIndices(
    inMatchFrames.length,
    Math.min(OVERVIEW_FRAME_TARGET, inMatchFrames.length)
  ).map((index) => index + matchStartIndex);

  const spikeIndices = inMatchFrames
    .map((frame, index) => ({
      index: index + matchStartIndex,
      diffScore: frame.diffScore,
    }))
    .filter(({ diffScore }) => diffScore >= MOMENT_DIFF_THRESHOLD)
    .sort((a, b) => b.diffScore - a.diffScore)
    .slice(0, MOMENT_SPIKE_CAP)
    .map(({ index }) => index);

  const momentIndices = new Set<number>();
  for (const index of spikeIndices) {
    for (
      let offset = -MOMENT_CONTEXT_FRAMES;
      offset <= MOMENT_CONTEXT_FRAMES;
      offset += 1
    ) {
      const neighbour = index + offset;
      if (neighbour >= 0 && neighbour < frames.length) {
        momentIndices.add(neighbour);
      }
    }
  }

  // A single frame from before the detected match start, kept only for
  // loadout/context continuity -- not counted against the overview budget,
  // which is now spent entirely on the part of the session that's
  // actually the match.
  const anchorIndices = matchStartIndex > 0 ? [0] : [];

  const selectedIndices = new Set<number>([
    ...anchorIndices,
    ...overviewIndices,
    ...momentIndices,
  ]);

  return [...selectedIndices]
    .sort((a, b) => a - b)
    .map((index) => ({
      ...frames[index],
      tag: momentIndices.has(index)
        ? ("moment" as const)
        : ("overview" as const),
    }));
}

/**
 * Scans forward for the first stretch of MOTION_WINDOW_FRAMES consecutive
 * frames whose average diffScore stays at or above SUSTAINED_MOTION_
 * THRESHOLD, and returns its starting index. Only looks within the first
 * MAX_LOBBY_FRACTION of the session, and returns 0 (no trim) if nothing
 * qualifies, the session is too short to judge, or a match happens to
 * start in near-total darkness/stillness right away -- a missed guess
 * just means lobby frames aren't trimmed, which is the pre-existing
 * behaviour, not a regression.
 */
function detectLikelyMatchStart(frames: readonly SelectableFrame[]): number {
  if (frames.length < MIN_FRAMES_TO_ATTEMPT_TRIM) return 0;

  const searchLimit = Math.floor(frames.length * MAX_LOBBY_FRACTION);
  for (
    let start = 0;
    start <= searchLimit - MOTION_WINDOW_FRAMES;
    start += 1
  ) {
    let sum = 0;
    for (let offset = 0; offset < MOTION_WINDOW_FRAMES; offset += 1) {
      sum += frames[start + offset].diffScore;
    }
    const windowedAverage = sum / MOTION_WINDOW_FRAMES;
    if (windowedAverage >= SUSTAINED_MOTION_THRESHOLD) {
      return start;
    }
  }

  return 0;
}

function evenlySpacedIndices(length: number, count: number): number[] {
  if (count <= 0) return [];
  if (count >= length) return Array.from({ length }, (_, index) => index);
  const step = length / count;
  return Array.from({ length: count }, (_, position) =>
    Math.min(length - 1, Math.round(position * step))
  );
}
