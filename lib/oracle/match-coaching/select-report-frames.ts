export type SelectableFrame = {
  capturedAt: string;
  jpegBase64: string;
  diffScore: number;
};

export type SelectedReportFrame = SelectableFrame & {
  tag: "overview" | "moment";
};

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

  const overviewIndices = evenlySpacedIndices(
    frames.length,
    Math.min(OVERVIEW_FRAME_TARGET, frames.length)
  );

  const spikeIndices = frames
    .map((frame, index) => ({ index, diffScore: frame.diffScore }))
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

  const selectedIndices = new Set<number>([
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

function evenlySpacedIndices(length: number, count: number): number[] {
  if (count <= 0) return [];
  if (count >= length) return Array.from({ length }, (_, index) => index);
  const step = length / count;
  return Array.from({ length: count }, (_, position) =>
    Math.min(length - 1, Math.round(position * step))
  );
}
