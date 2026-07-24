import type {
  OperatorControlOperationStatus,
  OperatorControlOperationStepStatus,
} from "./operator-control-types";

const OPERATION_TRANSITIONS = {
  accepted: [
    "eligibility-removed",
    "in-progress",
    "blocked-policy",
    "completed",
  ],
  "eligibility-removed": [
    "in-progress",
    "failed-recoverable",
    "blocked-policy",
    "completed",
  ],
  "in-progress": [
    "in-progress",
    "failed-recoverable",
    "blocked-policy",
    "completed",
  ],
  "failed-recoverable": ["in-progress", "blocked-policy"],
  "blocked-policy": ["in-progress"],
  completed: [],
} as const satisfies Readonly<
  Record<OperatorControlOperationStatus, readonly OperatorControlOperationStatus[]>
>;

const STEP_TRANSITIONS = {
  pending: ["running"],
  running: [
    "failed-recoverable",
    "succeeded",
    "retained-legal",
    "processor-pending",
    "backup-pending",
  ],
  "failed-recoverable": ["running"],
  succeeded: [],
  "retained-legal": [],
  "processor-pending": ["running", "succeeded", "failed-recoverable"],
  "backup-pending": ["running", "succeeded", "failed-recoverable"],
} as const satisfies Readonly<
  Record<
    OperatorControlOperationStepStatus,
    readonly OperatorControlOperationStepStatus[]
  >
>;

export function assertOperatorControlOperationTransition(
  from: OperatorControlOperationStatus,
  to: OperatorControlOperationStatus
): void {
  if (!isOperatorControlOperationTransition(from, to)) {
    throw new Error(
      `Operator control operation transition '${from}' to '${to}' is invalid.`
    );
  }
}

export function isOperatorControlOperationTransition(
  from: OperatorControlOperationStatus,
  to: OperatorControlOperationStatus
): boolean {
  const allowed: readonly OperatorControlOperationStatus[] =
    OPERATION_TRANSITIONS[from];
  return allowed.includes(to);
}

export function assertOperatorControlOperationStepTransition(
  from: OperatorControlOperationStepStatus,
  to: OperatorControlOperationStepStatus
): void {
  if (!isOperatorControlOperationStepTransition(from, to)) {
    throw new Error(
      `Operator control step transition '${from}' to '${to}' is invalid.`
    );
  }
}

export function isOperatorControlOperationStepTransition(
  from: OperatorControlOperationStepStatus,
  to: OperatorControlOperationStepStatus
): boolean {
  const allowed: readonly OperatorControlOperationStepStatus[] =
    STEP_TRANSITIONS[from];
  return allowed.includes(to);
}

export function assertOperatorControlOperationCanComplete(
  steps: readonly Readonly<{ status: OperatorControlOperationStepStatus }>[]
): void {
  if (
    steps.length === 0 ||
    steps.some(
      (step) => step.status !== "succeeded" && step.status !== "retained-legal"
    )
  ) {
    throw new Error(
      "Operator control completion requires every approved live-system step to be verified."
    );
  }
}
