import type {
  ExecutableGameMatchReason,
  ExecutableGameMatchResult,
  ExecutableGameMatcherInput,
  ExecutableGameTitlePattern,
} from "./executable-game-detection-types";

export function matchExecutableGame(
  input:
    ExecutableGameMatcherInput
): ExecutableGameMatchResult {
  const processName =
    normaliseExecutableName(
      input.observation.processName
    );

  const processAlias =
    removeExecutableExtension(
      processName
    );

  const executableMatch =
    findNormalisedMatch(
      processName,
      input.profile.executableNames,
      normaliseExecutableName
    );

  const processAliasMatch =
    findNormalisedMatch(
      processAlias,
      input.profile.processAliases,
      normaliseProcessAlias
    );

  const launcherMatch =
    findNormalisedMatch(
      processName,
      input.profile.launcherProcessNames,
      normaliseExecutableName
    );

  const titlePatternMatch =
    findTitlePatternMatch(
      input.observation.title,
      input.profile.titlePatterns
    );

  const activeGameProcessMatched =
    executableMatch !== null ||
    processAliasMatch !== null;

  const reasons:
    ExecutableGameMatchReason[] =
      [];

  if (executableMatch) {
    reasons.push({
      type:
        "active-executable",

      explanation:
        `Active executable matched '${executableMatch}'.`,
    });
  }

  if (
    !executableMatch &&
    processAliasMatch
  ) {
    reasons.push({
      type:
        "active-process-alias",

      explanation:
        `Active process alias matched '${processAliasMatch}'.`,
    });
  }

  if (titlePatternMatch) {
    reasons.push({
      type:
        "title-pattern",

      explanation:
        titlePatternMatch.explanation,
    });
  }

  if (launcherMatch) {
    reasons.push({
      type:
        "launcher",

      explanation:
        `Launcher process matched '${launcherMatch}'. Launcher evidence does not identify an active game target by itself.`,
    });
  }

  return {
    matched:
      activeGameProcessMatched,

    activeGameProcessMatched,

    launcherMatched:
      launcherMatch !== null,

    matchedExecutableName:
      executableMatch,

    matchedProcessAlias:
      processAliasMatch,

    matchedTitlePatternId:
      titlePatternMatch?.id ??
      null,

    reasons:
      reasons.map(
        cloneMatchReason
      ),
  };
}

function findTitlePatternMatch(
  title: string,
  patterns:
    readonly ExecutableGameTitlePattern[]
): ExecutableGameTitlePattern | null {
  const normalisedTitle =
    normaliseText(title);

  if (
    normalisedTitle.length === 0
  ) {
    return null;
  }

  for (const pattern of patterns) {
    const patternValue =
      normaliseText(
        pattern.value
      );

    if (
      patternValue.length === 0
    ) {
      continue;
    }

    const matched =
      pattern.kind === "equals"
        ? normalisedTitle ===
          patternValue
        : normalisedTitle.includes(
            patternValue
          );

    if (matched) {
      return {
        id:
          pattern.id,

        kind:
          pattern.kind,

        value:
          pattern.value,

        explanation:
          pattern.explanation,
      };
    }
  }

  return null;
}

function findNormalisedMatch(
  observedValue: string,
  configuredValues:
    readonly string[],
  normaliseConfiguredValue:
    (value: string) => string
): string | null {
  if (
    observedValue.length === 0
  ) {
    return null;
  }

  for (
    const configuredValue
    of configuredValues
  ) {
    if (
      observedValue ===
      normaliseConfiguredValue(
        configuredValue
      )
    ) {
      return configuredValue;
    }
  }

  return null;
}

function normaliseExecutableName(
  value: string
): string {
  const normalised =
    normaliseText(value)
      .replaceAll("\\", "/");

  const segments =
    normalised.split("/");

  return (
    segments.at(-1) ??
    ""
  );
}

function normaliseProcessAlias(
  value: string
): string {
  return removeExecutableExtension(
    normaliseExecutableName(
      value
    )
  );
}

function removeExecutableExtension(
  value: string
): string {
  return value.endsWith(".exe")
    ? value.slice(
        0,
        -4
      )
    : value;
}

function normaliseText(
  value: string
): string {
  return value
    .trim()
    .toLocaleLowerCase(
      "en-US"
    );
}

function cloneMatchReason(
  reason:
    ExecutableGameMatchReason
): ExecutableGameMatchReason {
  return {
    type:
      reason.type,

    explanation:
      reason.explanation,
  };
}