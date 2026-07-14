import type {
  OracleGameDetectionInput,
} from "../game-detection-input";

export type ExecutableGameTitlePatternKind =
  | "equals"
  | "contains";

export type ExecutableGameTitlePattern = {
  /**
   * Stable profile-owned identifier for this title pattern.
   */
  id: string;

  kind:
    ExecutableGameTitlePatternKind;

  value: string;

  /**
   * Plain factual explanation used when this pattern matches.
   */
  explanation: string;
};

export type ExecutableGameDetectionProfile = {
  /**
   * Executable filenames that identify an active game process.
   *
   * Comparisons are case-insensitive and path-insensitive.
   */
  executableNames:
    readonly string[];

  /**
   * Optional process aliases, normally executable names without
   * their file extension.
   */
  processAliases:
    readonly string[];

  /**
   * Window-title evidence owned by the concrete integration.
   */
  titlePatterns:
    readonly ExecutableGameTitlePattern[];

  /**
   * Known launcher processes.
   *
   * Launcher evidence is supporting context only. A launcher match
   * can never qualify as an active game match by itself.
   */
  launcherProcessNames:
    readonly string[];
};

export type ExecutableGameMatchReasonType =
  | "active-executable"
  | "active-process-alias"
  | "title-pattern"
  | "launcher";

export type ExecutableGameMatchReason = {
  type:
    ExecutableGameMatchReasonType;

  explanation: string;
};

export type ExecutableGameMatchResult = {
  /**
   * True only when active-game process evidence exists.
   *
   * Launcher or title evidence alone is insufficient.
   */
  matched: boolean;

  activeGameProcessMatched:
    boolean;

  launcherMatched:
    boolean;

  matchedExecutableName:
    string | null;

  matchedProcessAlias:
    string | null;

  matchedTitlePatternId:
    string | null;

  reasons:
    ExecutableGameMatchReason[];
};

export type ExecutableGameMatcherInput = {
  observation:
    OracleGameDetectionInput;

  profile:
    ExecutableGameDetectionProfile;
};