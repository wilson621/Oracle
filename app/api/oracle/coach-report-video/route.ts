import { randomUUID } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { generateMatchVideoCoachingReport } from "@/lib/oracle/match-coaching/oracle-match-video-coaching-service";
import { ensureOperatorBinding } from "@/lib/oracle/operator/ensure-operator-binding";
import {
  FULL_MATCH_ANALYSIS_DAILY_CAP,
  dailyCapReachedMessage,
  getRemainingDailyAllowance,
  recordDailyUsage,
} from "@/lib/oracle/usage-caps/daily-usage-cap";

// Node's fs is required to stream the uploaded video to a temp file before
// handing it to Gemini's Files API -- this route cannot run on the edge
// runtime.
export const runtime = "nodejs";

// A Vercel-specific hint (ignored on this project's self-hosted standalone
// deployment, where the Node process just runs as long as it needs to) --
// kept here as documentation of the real worst case: uploading a large
// video plus waiting for Gemini to process and analyse it can genuinely
// take several minutes for a full-length match. If this is ever deployed
// somewhere that DOES enforce a function/request timeout (Vercel, or a
// reverse proxy in front of the standalone server), that timeout needs to
// accommodate this too.
export const maxDuration = 800;

// A full 45-minute recording at the desktop app's standard ~900kbps target
// caps out around ~304MB, or, when the Operator has opted into "record in
// high quality for Content Clips", ~1.01GB at that mode's ~3Mbps target
// (see match-video-recording-coordinator.ts) -- this leaves meaningful
// headroom above the larger of those two for encoder/container overhead
// while still rejecting anything wildly out of bounds outright.
const MAX_VIDEO_BYTES = 1200 * 1024 * 1024;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json(
      { error: "You need to be signed in to generate a coaching report." },
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

  // Checked before even reading the (potentially huge) upload off the
  // wire -- no point spending the bandwidth/time on a request that's
  // going to be rejected anyway. This is a daily count of reports
  // actually generated, not upload attempts -- a failed generation below
  // never counts against it (see the recordDailyUsage call further down).
  const remainingToday = await getRemainingDailyAllowance(
    operatorId,
    "full-match-analysis",
    FULL_MATCH_ANALYSIS_DAILY_CAP
  );
  if (remainingToday <= 0) {
    return NextResponse.json(
      {
        error: dailyCapReachedMessage(
          "full-match-analysis",
          FULL_MATCH_ANALYSIS_DAILY_CAP
        ),
      },
      { status: 429 }
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch (error) {
    // If this fires for a real (non-tiny) submission, the most likely
    // cause is the request body getting truncated before it reaches here
    // -- see `experimental.proxyClientMaxBodySize` in next.config.ts.
    console.error(
      "[coach-report-video] failed to parse multipart form. content-length:",
      request.headers.get("content-length"),
      "error:",
      error
    );
    return NextResponse.json(
      { error: "Full Match Analysis upload must be valid multipart form data." },
      { status: 400 }
    );
  }

  const video = form.get("video");
  const clientSessionId = form.get("clientSessionId");
  const startedAt = form.get("startedAt");
  const endedAt = form.get("endedAt");
  const game = form.get("game");
  const durationMs = form.get("durationMs");
  const matchStartOffsetMs = form.get("matchStartOffsetMs");

  if (
    !(video instanceof Blob) ||
    video.size === 0 ||
    typeof clientSessionId !== "string" ||
    !clientSessionId ||
    typeof startedAt !== "string" ||
    typeof endedAt !== "string" ||
    typeof durationMs !== "string" ||
    !Number.isFinite(Number(durationMs))
  ) {
    return NextResponse.json(
      {
        error:
          "Full Match Analysis upload requires a non-empty video plus clientSessionId, startedAt, endedAt and durationMs.",
      },
      { status: 400 }
    );
  }

  if (video.size > MAX_VIDEO_BYTES) {
    return NextResponse.json(
      {
        error: `Match video is too large (${Math.round(
          video.size / (1024 * 1024)
        )}MB) -- the maximum is ${Math.round(
          MAX_VIDEO_BYTES / (1024 * 1024)
        )}MB.`,
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

  const tempDir = await mkdtemp(join(tmpdir(), "oracle-match-video-"));
  const tempVideoPath = join(tempDir, `${randomUUID()}.webm`);

  try {
    await writeFile(tempVideoPath, Buffer.from(await video.arrayBuffer()));

    const report = await generateMatchVideoCoachingReport({
      supabase,
      operatorId,
      clientSessionId,
      game: typeof game === "string" && game ? game : "Call of Duty",
      startedAt,
      endedAt,
      videoPath: tempVideoPath,
      mimeType: video.type || "video/webm",
      durationMs: Number(durationMs),
      matchStartOffsetMs: resolvedOffsetMs,
    });
    // Only counts against today's allowance if a report actually came out
    // of it -- a failed generation (bad upload, Gemini error) shouldn't
    // cost the Operator one of their two reports for the day.
    if (report.status !== "failed") {
      await recordDailyUsage(operatorId, "full-match-analysis", 1);
    }
    return NextResponse.json({ report });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Full Match Analysis report generation failed.",
      },
      { status: 502 }
    );
  } finally {
    // Never leave the uploaded video sitting on this server's disk --
    // best-effort cleanup regardless of how the request above turned out.
    await rm(tempDir, { recursive: true, force: true }).catch(() => undefined);
  }
}
