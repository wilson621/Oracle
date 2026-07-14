import type {
  OracleDesktopDisplayState,
} from "../host-state.js";
import type {
  OracleDesktopWindowBounds,
} from "../window-discovery.js";

export type OracleDesktopTargetEvidence = {
  windowArea: number;
  aspectRatio: number;

  displayId: string | null;
  displayCoverage: number | null;
  isPrimaryDisplay: boolean | null;

  /**
   * Null until a reliable foreground-window snapshot is supplied
   * by the native desktop boundary.
   */
  isForeground: boolean | null;
};

export type OracleDesktopTargetEvidenceInput = {
  bounds: OracleDesktopWindowBounds;

  display:
    OracleDesktopDisplayState | null;

  isForeground?:
    boolean | null;
};

export function createDesktopTargetEvidence(
  input: OracleDesktopTargetEvidenceInput
): OracleDesktopTargetEvidence {
  const windowArea =
    calculateArea(input.bounds);

  const aspectRatio =
    input.bounds.height > 0
      ? normaliseDecimal(
          input.bounds.width /
            input.bounds.height
        )
      : 0;

  return {
    windowArea,
    aspectRatio,

    displayId:
      input.display?.id ?? null,

    displayCoverage:
      input.display
        ? calculateDisplayCoverage(
            input.bounds,
            input.display.bounds
          )
        : null,

    isPrimaryDisplay:
      input.display?.primary ?? null,

    isForeground:
      input.isForeground ?? null,
  };
}

export function cloneDesktopTargetEvidence(
  evidence: OracleDesktopTargetEvidence
): OracleDesktopTargetEvidence {
  return {
    windowArea:
      evidence.windowArea,

    aspectRatio:
      evidence.aspectRatio,

    displayId:
      evidence.displayId,

    displayCoverage:
      evidence.displayCoverage,

    isPrimaryDisplay:
      evidence.isPrimaryDisplay,

    isForeground:
      evidence.isForeground,
  };
}

function calculateDisplayCoverage(
  windowBounds:
    OracleDesktopWindowBounds,
  displayBounds:
    OracleDesktopWindowBounds
): number | null {
  const displayArea =
    calculateArea(displayBounds);

  if (displayArea <= 0) {
    return null;
  }

  const intersectionWidth =
    Math.max(
      0,
      Math.min(
        windowBounds.x +
          windowBounds.width,
        displayBounds.x +
          displayBounds.width
      ) -
        Math.max(
          windowBounds.x,
          displayBounds.x
        )
    );

  const intersectionHeight =
    Math.max(
      0,
      Math.min(
        windowBounds.y +
          windowBounds.height,
        displayBounds.y +
          displayBounds.height
      ) -
        Math.max(
          windowBounds.y,
          displayBounds.y
        )
    );

  const intersectionArea =
    intersectionWidth *
    intersectionHeight;

  return normaliseDecimal(
    clamp(
      intersectionArea /
        displayArea,
      0,
      1
    )
  );
}

function calculateArea(
  bounds:
    OracleDesktopWindowBounds
): number {
  if (
    !Number.isFinite(bounds.width) ||
    !Number.isFinite(bounds.height) ||
    bounds.width <= 0 ||
    bounds.height <= 0
  ) {
    return 0;
  }

  return (
    Math.round(bounds.width) *
    Math.round(bounds.height)
  );
}

function normaliseDecimal(
  value: number
): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Number(
    value.toFixed(6)
  );
}

function clamp(
  value: number,
  minimum: number,
  maximum: number
): number {
  return Math.min(
    maximum,
    Math.max(
      minimum,
      value
    )
  );
}