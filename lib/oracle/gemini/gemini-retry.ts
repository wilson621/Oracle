// Shared across every Gemini-backed Oracle feature (Full Match Analysis,
// Loadout Intelligence, ...) -- originally lived only in
// oracle-match-video-coaching-service.ts, pulled out here once a second
// feature needed the exact same retry/error-formatting behaviour rather
// than copy-pasting it.

// HTTP statuses the Gemini API returns for transient, short-lived problems
// (most commonly 503 "This model is currently experiencing high demand" --
// Google documents this as a normal, expected occurrence during load
// spikes, not a sign of anything actually broken) plus 429 rate-limiting.
// Anything else (a bad API key, a malformed request, a genuinely rejected
// input) is not worth retrying -- it will just fail the same way again.
const RETRYABLE_GEMINI_STATUS_CODES = new Set([429, 500, 502, 503, 504]);
// Raised from 3 to 5 after real-world testing on a flaky connection hit a
// dropped connection (see isNetworkError below) twice in a row followed by
// a genuine Gemini 503 on the very next attempt -- three attempts wasn't
// enough headroom to absorb two independent kinds of transient failure
// back to back, even though each individually is exactly the kind of
// short-lived problem retrying is meant to ride out.
const MAX_GEMINI_ATTEMPTS = 5;
const GEMINI_RETRY_BASE_DELAY_MS = 2_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * The @google/genai SDK's ApiError shape (status: number, message: string)
 * -- checked structurally rather than with `instanceof ApiError` so this
 * still works if the SDK's error class identity ever gets duplicated across
 * module instances, which `instanceof` is notoriously fragile against.
 */
function isApiErrorLike(
  error: unknown
): error is { status: number; message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    typeof (error as { status?: unknown }).status === "number" &&
    typeof (error as { message?: unknown }).message === "string"
  );
}

// Node's fetch (used internally by @google/genai to actually reach
// Google's servers) wraps any connection-level failure -- a dropped
// connection, a DNS blip, a reset mid-transfer -- as a generic
// `TypeError: fetch failed`, with the real cause nested in `.cause` (e.g.
// an Error with `.code` "ECONNRESET"/"ETIMEDOUT"/etc). This has no
// `.status`, so it never matched isApiErrorLike above and was never
// retried -- meaning a single momentary network drop during a long video
// upload (more likely the longer that upload takes, which is exactly what
// the higher-quality Content Clips capture setting makes more likely)
// failed the whole report outright instead of being retried like any other
// transient problem.
const RETRYABLE_NETWORK_ERROR_CODES = new Set([
  "ECONNRESET",
  "ETIMEDOUT",
  "ECONNREFUSED",
  "ENOTFOUND",
  "EAI_AGAIN",
  "EPIPE",
  "UND_ERR_SOCKET",
  "UND_ERR_CONNECT_TIMEOUT",
]);

function networkErrorCode(error: unknown): string | undefined {
  if (!(error instanceof Error)) return undefined;
  const cause = (error as { cause?: unknown }).cause;
  const code =
    cause && typeof cause === "object"
      ? (cause as { code?: unknown }).code
      : undefined;
  return typeof code === "string" ? code : undefined;
}

function isNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const code = networkErrorCode(error);
  if (code && RETRYABLE_NETWORK_ERROR_CODES.has(code)) return true;
  // Fall back to matching Node's own generic wrapper message directly --
  // covers cases where `.cause` doesn't carry a recognised `.code`.
  return error.message === "fetch failed";
}

function isRetryableGeminiError(error: unknown): boolean {
  return (
    (isApiErrorLike(error) &&
      RETRYABLE_GEMINI_STATUS_CODES.has(error.status)) ||
    isNetworkError(error)
  );
}

// A small safety cap on the delay we'll actually honour -- Google's
// suggested wait has been a handful of seconds in testing, but this stops
// a pathological value from stalling a request far longer than an
// Operator would reasonably expect.
const MAX_SUGGESTED_RETRY_DELAY_MS = 60_000;

/**
 * Google's own suggested wait before retrying a 429, when it provides one
 * -- present in the raw error body as a `RetryInfo` detail (a `retryDelay`
 * field like "23.19s") and, in every case seen so far, also baked directly
 * into the human-readable message text ("...Please retry in
 * 23.190195011s."). Observed directly in live testing: Content Clips
 * firing its own full Gemini video upload+analysis immediately after Full
 * Match Analysis had already used up the free tier's short-window request
 * quota (`generate_content_free_tier_requests`, limit 20) -- and the old
 * fixed ~2-8s backoff never got close to the ~23s Google was actually
 * asking for, burning through every one of the 5 retry attempts well
 * before the quota window had a chance to reset. Reading this value
 * directly, instead of guessing, means the retry loop waits as long as
 * Google actually says is needed rather than either wasting attempts too
 * eagerly or making the Operator wait longer than necessary.
 */
function retryDelayMsFromApiError(message: string): number | null {
  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(message);
  } catch {
    parsedBody = undefined;
  }
  if (parsedBody && typeof parsedBody === "object") {
    const details = (parsedBody as { error?: { details?: unknown } }).error
      ?.details;
    if (Array.isArray(details)) {
      for (const detail of details) {
        if (
          detail &&
          typeof detail === "object" &&
          typeof (detail as { retryDelay?: unknown }).retryDelay === "string"
        ) {
          const seconds = parseSecondsDuration(
            (detail as { retryDelay: string }).retryDelay
          );
          if (seconds !== null) return Math.ceil(seconds * 1_000);
        }
      }
    }
  }
  // Fall back to Google's human-readable message text -- covers cases
  // where the structured RetryInfo detail isn't present but the same hint
  // is still there as plain prose.
  const match = message.match(/retry in\s+([\d.]+)\s*s/i);
  if (match) {
    const seconds = Number(match[1]);
    if (Number.isFinite(seconds)) return Math.ceil(seconds * 1_000);
  }
  return null;
}

function parseSecondsDuration(value: string): number | null {
  const match = value.match(/^([\d.]+)s$/);
  if (!match) return null;
  const seconds = Number(match[1]);
  return Number.isFinite(seconds) ? seconds : null;
}

/**
 * How long to wait before the next attempt: Google's own suggested delay
 * (see retryDelayMsFromApiError) when one is available and longer than our
 * default short backoff, plus a small buffer -- retrying at the exact
 * instant the window is said to reset risks landing just before it
 * actually does, given ordinary clock/latency slop. Falls back to the
 * plain exponential-ish backoff for every other retryable error (a
 * transient 503 or a dropped connection), which was never the problem
 * here.
 */
function nextRetryDelayMs(error: unknown, attempt: number): number {
  const defaultDelay = GEMINI_RETRY_BASE_DELAY_MS * attempt;
  if (!isApiErrorLike(error)) return defaultDelay;
  const suggested = retryDelayMsFromApiError(error.message);
  if (suggested === null) return defaultDelay;
  const withBuffer = suggested + 1_500;
  return Math.min(
    Math.max(defaultDelay, withBuffer),
    MAX_SUGGESTED_RETRY_DELAY_MS
  );
}

/**
 * Runs one Gemini API call, retrying a couple of times with a short
 * backoff if it fails with a transient status (see
 * RETRYABLE_GEMINI_STATUS_CODES) -- most commonly a 503 "high demand"
 * overload, which is short-lived and usually gone within seconds. A
 * non-retryable failure (bad key, malformed request, genuine rejection)
 * throws immediately rather than wasting the customer's time retrying
 * something that will never succeed.
 */
export async function withGeminiRetry<T>(
  label: string,
  call: () => Promise<T>
): Promise<T> {
  for (let attempt = 1; attempt <= MAX_GEMINI_ATTEMPTS; attempt++) {
    try {
      return await call();
    } catch (error) {
      const isLastAttempt = attempt === MAX_GEMINI_ATTEMPTS;
      if (!isRetryableGeminiError(error) || isLastAttempt) {
        throw error;
      }
      const reason = isApiErrorLike(error)
        ? `status ${error.status}`
        : `network error${networkErrorCode(error) ? ` (${networkErrorCode(error)})` : ""}`;
      const delayMs = nextRetryDelayMs(error, attempt);
      console.warn(
        `[gemini-retry] ${label} failed (attempt ` +
          `${attempt}/${MAX_GEMINI_ATTEMPTS}, ${reason}) -- retrying in ` +
          `${Math.round(delayMs / 1_000)}s.`
      );
      await sleep(delayMs);
    }
  }
  // Unreachable: the loop above always either returns or throws on its
  // last iteration. Satisfies the compiler's control-flow analysis.
  throw new Error(`${label}: exhausted retries without a result.`);
}

/**
 * Turns whatever a failed Gemini call (or our own code) threw into a
 * message worth showing a customer. The SDK's ApiError carries the raw API
 * error body JSON.stringify-ed into .message (see throwErrorIfNotOK in
 * @google/genai) -- e.g. `{"error":{"code":503,"message":"...","status":
 * "UNAVAILABLE"}}` verbatim, which is what would otherwise end up on
 * screen unparsed. This extracts Google's actual human-readable message
 * and writes a clear sentence around it instead.
 */
export function describeGeminiFailure(error: unknown): string {
  if (isApiErrorLike(error)) {
    let detail: string | undefined;
    try {
      const parsed = JSON.parse(error.message) as {
        error?: { message?: string };
      };
      detail = parsed.error?.message;
    } catch {
      // error.message wasn't JSON -- fall through and use it as-is below.
    }
    // 429 is bucketed separately from the 500/502/503/504 "overloaded"
    // group even though both are in RETRYABLE_GEMINI_STATUS_CODES: a 429 is
    // Google saying "you've used up your quota", which retrying for a few
    // seconds will never fix (quota windows are per-minute/day, not
    // per-second) -- telling the customer "try again in a minute" here is
    // actively misleading. 500/502/503/504 really are short-lived overload
    // and that message is accurate for those.
    if (error.status === 429) {
      return (
        "Gemini's usage limit has been reached for now" +
        (detail ? ` (Google said: "${detail}")` : "") +
        ". If this account is on the Gemini API free tier, that tier's " +
        "limits are quite low and this can take a while to reset -- " +
        "check current usage and limits at https://ai.dev/rate-limit, " +
        "or add billing to raise them."
      );
    }
    if (RETRYABLE_GEMINI_STATUS_CODES.has(error.status)) {
      return (
        "Gemini was temporarily too busy to process this, even after " +
        "retrying a few times. This is usually short-lived -- please " +
        "try again in a minute or two." +
        (detail ? ` (Google said: "${detail}")` : "")
      );
    }
    return `Gemini returned an error (status ${error.status}): ${
      detail ?? error.message
    }`;
  }
  if (isNetworkError(error)) {
    const code = networkErrorCode(error);
    return (
      "Couldn't reach Gemini's servers, even after retrying a few times " +
      "-- this usually means the internet connection dropped out briefly " +
      "partway through uploading the video (more likely the longer an " +
      "upload takes)." +
      (code ? ` (${code})` : "") +
      " Check your connection and try again."
    );
  }
  return error instanceof Error ? error.message : String(error);
}
