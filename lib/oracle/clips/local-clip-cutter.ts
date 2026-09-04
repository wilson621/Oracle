import "server-only";
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import ffmpegPath from "ffmpeg-static";

// The hook font, bundled with the repo (assets/fonts/anton/, SIL Open Font
// License -- see OFL.txt there) rather than relying on whatever's installed
// on the Operator's machine. Anton was picked over the previous plain Arial
// specifically because it's the actual bold/condensed display font real
// short-form creators use for hook text (research 2026-09-04 -- the same
// look commonly associated with high-performing TikTok/Reels captions),
// not a generic system font.
//
// Resolved via process.cwd() rather than __dirname: this file runs through
// Next.js's Route Handler bundling, which rewrites __dirname to a location
// that doesn't match the real filesystem (see the ffmpeg-static ENOENT bug
// this exact issue caused before -- fixed via serverExternalPackages, but
// that trick only applies to an installed npm package, not a repo-local
// asset folder like this one). process.cwd() is the Next.js server's
// project root regardless of bundling, so it stays correct.
const HOOK_FONT_DIR = join(process.cwd(), "assets", "fonts", "anton");
const HOOK_FONT_NAME = "Anton";

/**
 * Cuts one short, vertical (9:16), social-ready clip out of a longer local
 * source recording using a bundled ffmpeg binary (`ffmpeg-static` -- no
 * system ffmpeg install required on the Operator's PC).
 *
 * The composition deliberately never crops any of the original frame out
 * (unlike a naive 16:9->9:16 centre-crop, which is the single biggest
 * quality gap found in every competitor researched -- see
 * oracle-content-clips-service.ts): the full original frame is kept intact
 * and centred, with a blurred, cropped copy of the same frame filling the
 * empty top/bottom bars so there's no letterboxing.
 *
 * The hook line is burned onto the clip as on-screen text. This uses
 * ffmpeg's `subtitles` filter (via libass), not `drawtext` -- confirmed by
 * testing that the `ffmpeg-static` binary's build does not include
 * `drawtext` at all, even though `subtitles`/libass is present and works.
 */

export type CutContentClipInput = Readonly<{
  /** Local path to the already-downloaded/written source recording. */
  sourceVideoPath: string;
  /** Where to write the finished vertical clip (must end in .mp4). */
  outputPath: string;
  startOffsetMs: number;
  endOffsetMs: number;
  /** Short on-screen hook line, burned onto the clip near the top. */
  hookText: string;
}>;

const OUTPUT_WIDTH = 1080;
const OUTPUT_HEIGHT = 1920;
// A couple of seconds of headroom before the clip's actual boundaries --
// Gemini is already asked for sensible start/end points (see
// oracle-clip-detection-report.ts), this is just a safety margin so a
// slightly-early/late model estimate doesn't chop off the key moment.
const START_PAD_SEC = 0;

export async function cutContentClip(
  input: CutContentClipInput
): Promise<void> {
  const durationMs = input.endOffsetMs - input.startOffsetMs;
  if (!Number.isFinite(durationMs) || durationMs <= 0) {
    throw new Error(
      `Content clip has a non-positive duration (${durationMs}ms) -- refusing to cut it.`
    );
  }
  if (!ffmpegPath) {
    throw new Error(
      "No bundled ffmpeg binary is available for this platform/architecture."
    );
  }

  await mkdir(dirname(input.outputPath), { recursive: true });

  const startSec = Math.max(0, input.startOffsetMs / 1_000 - START_PAD_SEC);
  const durationSec = durationMs / 1_000;

  const assDir = await mkdir(join(tmpdir(), "oracle-content-clips"), {
    recursive: true,
  }).then(() => join(tmpdir(), "oracle-content-clips"));
  const assPath = join(assDir, `${randomUUID()}.ass`);

  try {
    await writeFile(assPath, buildHookSubtitleFile(input.hookText), "utf8");

    try {
      await runFfmpeg(ffmpegPath, [
        ...trimArgs(startSec, durationSec, input.sourceVideoPath),
        "-filter_complex",
        buildFilterGraph({ withSubtitles: true, assPath }),
        ...outputArgs(input.outputPath),
      ]);
    } catch (withTextError) {
      // Burning the hook line on is a nice-to-have, not the point of the
      // feature -- a font/subtitles-rendering hiccup on some machine
      // should never be the reason a clip fails outright. Fall back to
      // the same composition without the text overlay.
      console.warn(
        "[local-clip-cutter] subtitles overlay failed, retrying without it:",
        withTextError
      );
      await runFfmpeg(ffmpegPath, [
        ...trimArgs(startSec, durationSec, input.sourceVideoPath),
        "-filter_complex",
        buildFilterGraph({ withSubtitles: false }),
        ...outputArgs(input.outputPath),
      ]);
    }
  } finally {
    await rm(assPath, { force: true }).catch(() => undefined);
  }
}

function trimArgs(
  startSec: number,
  durationSec: number,
  sourcePath: string
): readonly string[] {
  return [
    "-y",
    "-hide_banner",
    "-loglevel",
    "error",
    "-ss",
    startSec.toFixed(3),
    "-i",
    sourcePath,
    "-t",
    durationSec.toFixed(3),
  ];
}

// The source recording comes from the browser's screen-capture MediaRecorder
// (see match-video-recording-coordinator.ts's CLIPS_TARGET_FRAME_RATE), which
// only *requests* 24fps -- actual frame delivery is irregular (variable frame
// rate: frames land whenever the browser captures them, not on a strict
// clock). Re-encoding through the filter graph above without pinning an
// output frame rate carries that irregularity straight into the finished
// .mp4, which plays back as stutter/lag in simple players (confirmed via
// live testing -- see /areas/oracle-project.md). `-r` on the output forces
// libx264 to duplicate/drop frames as needed to hit a real constant frame
// rate, matching the capture target so motion still looks smooth.
const OUTPUT_FRAME_RATE = 24;

function outputArgs(outputPath: string): readonly string[] {
  return [
    "-map",
    "[outv]",
    "-map",
    "0:a?",
    "-r",
    String(OUTPUT_FRAME_RATE),
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "21",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    "-b:a",
    "160k",
    "-async",
    "1",
    "-movflags",
    "+faststart",
    outputPath,
  ];
}

function buildFilterGraph(
  options: Readonly<{ withSubtitles: boolean; assPath?: string }>
): string {
  const composed =
    `[0:v]split=2[bg][fg];` +
    `[bg]scale=${OUTPUT_WIDTH}:${OUTPUT_HEIGHT}:force_original_aspect_ratio=increase,` +
    `crop=${OUTPUT_WIDTH}:${OUTPUT_HEIGHT},` +
    `boxblur=luma_radius=20:luma_power=2:chroma_radius=20:chroma_power=2[bgblur];` +
    `[fg]scale=${OUTPUT_WIDTH}:-2:force_original_aspect_ratio=decrease[fgscaled];` +
    `[bgblur][fgscaled]overlay=(W-w)/2:(H-h)/2[framed]`;

  if (!options.withSubtitles || !options.assPath) {
    return `${composed};[framed]copy[outv]`;
  }

  return (
    `${composed};[framed]subtitles=filename='${escapeFilterPath(options.assPath)}'` +
    `:fontsdir='${escapeFilterPath(HOOK_FONT_DIR)}'[outv]`
  );
}

// ffmpeg's filter-graph syntax treats ':' as a key=value separator even
// inside an option value, and '\' as its own escape character -- both need
// escaping regardless of platform, and Windows paths (the Operator's PC)
// additionally have a drive-letter colon that hits the same rule. Forward
// slashes work fine as path separators on Windows too, which sidesteps
// having to double up every backslash.
function escapeFilterPath(path: string): string {
  return path.replace(/\\/g, "/").replace(/:/g, "\\:");
}

// Builds a minimal .ass subtitle file with one styled cue spanning the
// whole clip -- rendered via the `subtitles` filter (libass), which IS
// present in the ffmpeg-static build (confirmed by testing), unlike
// `drawtext` (confirmed NOT present). Positioned top-centre, bold white
// text with a black outline and a translucent backing box so it reads
// cleanly over any footage.
function buildHookSubtitleFile(hookText: string): string {
  const text = escapeAssText(hookText);
  return [
    "[Script Info]",
    "ScriptType: v4.00+",
    `PlayResX: ${OUTPUT_WIDTH}`,
    `PlayResY: ${OUTPUT_HEIGHT}`,
    "ScaledBorderAndShadow: yes",
    "",
    "[V4+ Styles]",
    "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
    // Outline bumped from 4->6 to land in the "thick 5-8px outline" range
    // real creator captions use for mobile readability -- Anton is bold
    // enough on its own that Bold=1 isn't needed (it has no separate
    // regular/bold pair; forcing synthetic bold just distorts it).
    `Style: Hook,${HOOK_FONT_NAME},72,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,6,0,8,60,60,140,1`,
    "",
    "[Events]",
    "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
    `Dialogue: 0,0:00:00.00,9:59:59.00,Hook,,0,0,0,,${text}`,
    "",
  ].join("\n");
}

// ASS uses '{' / '}' to delimit override tags and '\' inside text as its
// own escape marker -- strip/escape those so a generated hook line can
// never accidentally inject formatting or break parsing. Newlines are
// flattened since the hook is meant to be one short line.
function escapeAssText(text: string): string {
  return text
    .replace(/[\r\n]+/g, " ")
    .replace(/\\/g, "")
    .replace(/[{}]/g, "")
    .trim()
    .slice(0, 80);
}

function runFfmpeg(binary: string, args: readonly string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(binary, args as string[], { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    child.stderr?.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
      // Never let a runaway amount of ffmpeg error output balloon memory.
      if (stderr.length > 8_000) {
        stderr = stderr.slice(-8_000);
      }
    });
    child.on("error", (error) => reject(error));
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`ffmpeg exited with code ${code}: ${stderr.trim()}`));
    });
  });
}
