const PREFIXES = [
  "OR",
  "ORX",
  "AEG",
  "VX",
  "OD",
  "ARC",
  "ECHO",
  "NOVA",
];

export function generateOperatorDesignation(): string {
  const prefix =
    PREFIXES[Math.floor(Math.random() * PREFIXES.length)];

  const number = Math.floor(
    1000 + Math.random() * 9000
  );

  return `${prefix}-${number}`;
}