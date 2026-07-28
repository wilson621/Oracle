import os from "node:os";
import { resolve } from "node:path";
import {
  assertRepositoryPreflight,
  contract,
  createAttemptDirectory,
  createAttemptRecord,
  repositoryRoot,
} from "./harness-core.mjs";

const values = parseArguments(process.argv.slice(2));
const required = [
  "attempt-id",
  "timestamp-utc",
  "candidate-commit",
  "harness-commit",
  "machine-identity",
  "package-identity",
  "package-version",
  "output-root",
];
for (const name of required) {
  if (!values.has(name)) {
    throw new Error(`Missing mandatory argument: --${name}`);
  }
}
if (values.size !== required.length) {
  const unexpected = [...values.keys()].filter((name) => !required.includes(name));
  throw new Error(`Unexpected argument(s): ${unexpected.join(", ")}`);
}

const input = {
  attemptId: values.get("attempt-id"),
  timestampUtc: values.get("timestamp-utc"),
  candidateCommit: values.get("candidate-commit"),
  harnessCommit: values.get("harness-commit"),
  machineIdentity: values.get("machine-identity"),
  packageIdentity: values.get("package-identity"),
  packageVersion: values.get("package-version"),
  outputRoot: resolve(repositoryRoot, values.get("output-root")),
};

if (input.machineIdentity !== os.hostname()) {
  throw new Error("The supplied machine identity does not identify this host.");
}

assertRepositoryPreflight(input);
const record = createAttemptRecord(input);
const outputRoot = createAttemptDirectory(record);

console.log(
  JSON.stringify(
    {
      result: "PREPARED",
      programmeIdentity: contract.programmeIdentity,
      attemptId: record.attemptId,
      outputRoot,
      lifecycleState: record.lifecycle.state,
      qualificationExecuted: false,
      buildExecuted: false,
      packageCreated: false,
      certificateCreated: false,
    },
    null,
    2
  )
);

function parseArguments(args) {
  if (args.length === 0 || args.length % 2 !== 0) {
    throw new Error("Arguments must be supplied as --name value pairs.");
  }
  const result = new Map();
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index];
    const value = args[index + 1];
    if (!key.startsWith("--") || value.startsWith("--")) {
      throw new Error(`Invalid argument pair at position ${index + 1}.`);
    }
    const name = key.slice(2);
    if (result.has(name)) {
      throw new Error(`Duplicate argument: --${name}`);
    }
    result.set(name, value);
  }
  return result;
}
