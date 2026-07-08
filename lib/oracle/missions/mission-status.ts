export type MissionStatus =
  | "assigned"
  | "active"
  | "review"
  | "completed"
  | "failed";

export function getMissionStatusLabel(status: MissionStatus) {
  switch (status) {
    case "assigned":
      return "Assigned";
    case "active":
      return "Active";
    case "review":
      return "Under Review";
    case "completed":
      return "Completed";
    case "failed":
      return "Failed";
  }
}

export function getMissionStatusColour(status: MissionStatus) {
  switch (status) {
    case "assigned":
    case "active":
      return "text-cyan-300";
    case "review":
      return "text-amber-300";
    case "completed":
      return "text-emerald-300";
    case "failed":
      return "text-rose-300";
  }
}

export function getMissionStatusBorder(status: MissionStatus) {
  switch (status) {
    case "assigned":
    case "active":
      return "border-cyan-500/20";
    case "review":
      return "border-amber-500/20";
    case "completed":
      return "border-emerald-500/20";
    case "failed":
      return "border-rose-500/20";
  }
}