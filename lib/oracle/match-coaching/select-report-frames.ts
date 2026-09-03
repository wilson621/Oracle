export type SelectableFrame = {
  capturedAt: string;
  jpegBase64: string;
  diffScore: number;
};

export type SelectedReportFrame = SelectableFrame & {
  tag: "overview" | "moment";
};

const OVERVIEW_FRAME_TARGET = 8;
const MOMENT_DIFF_THRESHOLD = 0.12;
const MOMENT_SPIKE_CAP = 15;
const MOMENT_CONTEXT_FRAMES = 1;

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
