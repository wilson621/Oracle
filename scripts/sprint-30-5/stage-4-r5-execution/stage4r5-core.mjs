import { createHash } from "node:crypto";
import { constants, copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync, statSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { spawnSync } from "node:child_process";

export const harnessRoot = resolve(import.meta.dirname);
export const repositoryRoot = resolve(harnessRoot, "..", "..", "..");
export const contract = JSON.parse(readFileSync(resolve(harnessRoot, "Oracle.Stage4R5ExecutionContract.json"), "utf8"));

export function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

export function assertNoReparseTraversal(path, root) {
  const boundary = resolve(root);
  const target = resolve(path);
  if (target !== boundary && !target.startsWith(`${boundary}${sep}`)) throw new Error(`Path escapes governed root: ${target}`);
  let current = target;
  while (current.length >= boundary.length) {
    if (existsSync(current) && lstatSync(current).isSymbolicLink()) throw new Error(`Link traversal is prohibited: ${current}`);
    if (current === boundary) break;
    current = dirname(current);
  }
  return target;
}

export function assertCreateOnly(path, parent) {
  const target = assertNoReparseTraversal(path, parent);
  if (existsSync(target)) throw new Error(`Create-only destination exists: ${target}`);
  return target;
}

export function mkdirCreateOnly(path, parent) {
  mkdirSync(assertCreateOnly(path, parent));
}

export function copyFileCreateOnly(source, destination, boundary) {
  if (!existsSync(source) || !statSync(source).isFile()) throw new Error(`Required source file is absent: ${source}`);
  assertCreateOnly(destination, boundary);
  mkdirSync(dirname(destination), { recursive: true });
  copyFileSync(source, destination, constants.COPYFILE_EXCL);
}

export function writeFileCreateOnly(path, content, encoding = "utf8") {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, { encoding, flag: "wx" });
}

export function writeJsonCreateOnly(path, value) {
  writeFileCreateOnly(path, `${JSON.stringify(value, null, 2)}\n`);
}

export function inventory(root, inventoryRoot = root) {
  const base = resolve(root);
  const boundary = resolve(inventoryRoot);
  const records = [];
  const walk = directory => {
    for (const name of readdirSync(directory).sort(codePointCompare)) {
      const path = resolve(directory, name);
      assertNoReparseTraversal(path, boundary);
      const item = lstatSync(path);
      if (item.isSymbolicLink()) throw new Error(`Link is prohibited in inventory: ${path}`);
      if (item.isDirectory()) walk(path);
      else if (item.isFile()) records.push({ path: relative(boundary, path).replaceAll("\\", "/"), bytes: item.size, sha256: sha256(path) });
      else throw new Error(`Unsupported inventory entry: ${path}`);
    }
  };
  walk(base);
  return records;
}

export function validateProcess(result, label) {
  if (result.error) throw new Error(`${label} failed to start: ${result.error.message}`);
  if (result.signal) throw new Error(`${label} terminated by signal ${result.signal}.`);
  if (!Number.isInteger(result.status) || result.status !== 0) throw new Error(`${label} exited ${result.status}. stdout: ${result.stdout ?? ""} stderr: ${result.stderr ?? ""}`);
  return result;
}

export function git(args) {
  const executable = contract.toolchain.git.path;
  if (!existsSync(executable) || sha256(executable) !== contract.toolchain.git.sha256) throw new Error("Bound Git identity differs.");
  return validateProcess(spawnSync(executable, args, { cwd: repositoryRoot, encoding: "utf8", shell: false, windowsHide: true, maxBuffer: 64 * 1024 * 1024 }), `git ${args.join(" ")}`).stdout.trim();
}

export function validateRepository(expectedCommit, requireClean = true) {
  const branch = git(["branch", "--show-current"]);
  const head = git(["rev-parse", "HEAD"]);
  const tree = git(["rev-parse", "HEAD^{tree}"]);
  const status = git(["status", "--porcelain=v1", "--untracked-files=all"]);
  if (branch !== contract.requiredBranch) throw new Error(`Required branch differs: ${branch}`);
  if (expectedCommit && head !== expectedCommit) throw new Error(`Execution baseline HEAD differs: ${head}`);
  if (requireClean && status !== "") throw new Error("Execution transfer requires a clean repository.");
  git(["merge-base", "--is-ancestor", contract.acceptedPreparation.commit, head]);
  return { branch, head, tree };
}

export function assertContract() {
  if (contract.status !== "founder-authorised-execution-enabled") throw new Error("R5 execution contract is not enabled.");
  if (contract.executionAuthority.maximumTransfers !== 1 || contract.executionAuthority.maximumAuthorities !== 1 || contract.executionAuthority.maximumAttempts !== 1 || contract.executionAuthority.retryAfterConsumedAuthorityPermitted !== false) throw new Error("R5 single-use limits differ.");
  if (contract.acceptedPreparation.preparationContractSha256 !== sha256(resolve(repositoryRoot, "scripts", "sprint-30-5", "stage-4-r5", "Oracle.Stage4R5Contract.json"))) throw new Error("Accepted R5 preparation contract differs.");
  if (contract.requiredJourneys.length !== 10 || contract.requiredLifecycle.length !== 20) throw new Error("R5 acceptance inventory differs.");
}

export function parseArguments(values) {
  const result = new Map();
  for (let index = 0; index < values.length; index += 2) {
    if (!values[index]?.startsWith("--") || values[index + 1] === undefined) throw new Error("Arguments must be --name value pairs.");
    result.set(values[index].slice(2), values[index + 1]);
  }
  return result;
}

export function codePointCompare(left, right) { return left < right ? -1 : left > right ? 1 : 0; }
