import { randomUUID } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { generateContentClips } from "@/lib/oracle/clips/oracle-content-clips-service";
import { ensureOperatorBinding } from "@/lib/oracle/operator/ensure-operator-binding";

// Same reasoning as coach-report-video/route.ts: streaming the uploaded
// video to a temp file (for Gemini's upload) and then invoking ffmpeg on
// it both need real Node filesystem/process APIs, so this can't run on the
// edge runtime.
export const runtime = "nodejs";

// Detection is one Gemini call (comparable to Full Match Analysis), plus
// up to MAX_CLIPS_PER_REQUEST local ffmpeg cuts afterwards -- generous
// enough to cover a slow ffmpeg pass on a loaded machine without timing
// out mid-way through.
export const maxDuration = 800;

// See match-video-recording-coordinator.ts: a full 45-minute recording
// caps out around ~304MB at the standard capture settings, or ~1.01GB at
// the higher "record in high quality for Content Clips" setting this
// feature actually expects to receive most of its uploads at. Matches the
// same limit coach-report-video/route.ts uses, for the same reason.
const MAX_VIDEO_BYTES = 1200 * 1024 * 1024;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json(
      { error: "You need to be signed in to generate clips." },
      { status: 401 }
    );
  }

  let operatorId: string;
  try {
    operatorId = await ensureOperatorBinding(supabase, user);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not set up an Operator profile for this account.",
      },
      { status: 500 }
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch (error) {
    console.error(
      "[content-clips] failed to parse multipart form. content-length:",
      request.headers.get("content-length"),
      "error:",
      error
    );
    return NextResponse.json(
      { error: "Content Clips upload must be valid multipart form data." },
      { status: 400 }
    );
  }

  const video = form.get("video");
  const game = form.get("game");
  const matchStartOffsetMs = form.get("matchStartOffsetMs");
  const outputRoot = form.get("outputRoot");

  if (!(video instanceof Blob) || video.size === 0) {
    return NextResponse.json(
      { error: "Content Clips requires a non-empty video." },
      { status: 400 }
    );
  }

  if (video.size > MAX_VIDEO_BYTES) {
    return NextResponse.json(
      {
        error: `Match video is too large (${Math.round(
          video.size / (1024 * 1024)
        )}MB) -- the maximum is ${Math.round(MAX_VIDEO_BYTES / (1024 * 1024))}MB.`,
      },
      { status: 400 }
    );
  }

  const parsedOffset = Number(matchStartOffsetMs);
  const resolvedOffsetMs =
    typeof matchStartOffsetMs === "string" &&
    matchStartOffsetMs.length > 0 &&
    Number.isFinite(parsedOffset)
      ? parsedOffset
      : null;

  const tempDir = await mkdtemp(join(tmpdir(), "oracle-content-clips-"));
  const tempVideoPath = join(tempDir, `${randomUUID()}.webm`);

  try {
    await writeFile(tempVideoPath, Buffer.from(await video.arrayBuffer()));

    const result = await generateContentClips({
      supabase,
      operatorId,
      game: typeof game === "string" && game ? game : "Call of Duty",
      videoPath: tempVideoPath,
      mimeType: video.type || "video/webm",
      matchStartOffsetMs: resolvedOffsetMs,
      outputRoot: typeof outputRoot === "string" ? outputRoot : null,
    });

    if (result.status === "failed") {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Content Clips generation failed.",
      },
      { status: 502 }
    );
  } finally {
    // Never leave the uploaded video sitting on this server's disk --
    // best-effort cleanup regardless of how the request above turned out.
    await rm(tempDir, { recursive: true, force: true }).catch(() => undefined);
  }
}
