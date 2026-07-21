import {
  createCompanionGuidanceUnavailableState,
  type CompanionGuidanceApplicationState,
} from "@/lib/oracle/applications/companion";

/**
 * The route has no authoritative runtime delivery boundary yet. Present the
 * Applications-owned unavailable state rather than inventing Session Context
 * or guidance. A later composition commit can replace this value.
 */
export const COMPANION_PAGE_INITIAL_STATE:
  CompanionGuidanceApplicationState =
  createCompanionGuidanceUnavailableState();
