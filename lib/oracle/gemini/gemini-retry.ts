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
const MAX_GEMINI_ATTEMPTS = 3;
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

function isRetryableGeminiError(error: unknown): boolean {
  return (
    isApiErrorLike(error) && RETRYABLE_GEMINI_STATUS_CODES.has(error.status)
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
      console.warn(
        `[gemini-retry] ${label} failed (attempt ` +
          `${attempt}/${MAX_GEMINI_ATTEMPTS}, status ` +
          `${(error as { status: number }).status}) -- retrying shortly.`
      );
      await sleep(GEMINI_RETRY_BASE_DELAY_MS * attempt);
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
  return error instanceof Error ? error.message : String(error);
}
