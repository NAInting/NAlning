import { readdir } from "node:fs/promises";
import { relative, resolve } from "node:path";

import {
  analyzeSafeExecutionFollowUpModuleName,
  summarizeSafeExecutionFollowUpModules,
} from "./safe-execution-compaction";

const workingDirectory = process.cwd();
const args = process.argv.slice(2);
const includeModuleDetails = args.includes("--include-module-details");
const scanRootArg = args.find((arg) => !arg.startsWith("--")) ?? "src";
const scanRoot = resolve(workingDirectory, scanRootArg);
const moduleNames = (await collectTypeScriptModuleNames(scanRoot)).map((moduleName) =>
  normalizePath(relative(workingDirectory, moduleName))
);
const summary = summarizeSafeExecutionFollowUpModules(moduleNames);
const analyses = moduleNames
  .map((moduleName) => analyzeSafeExecutionFollowUpModuleName(moduleName))
  .filter((analysis) => analysis.is_provider_follow_up);

console.log(JSON.stringify(
  {
    ok: true,
    note: "Informational scan only. Existing N-depth contracts are not migrated or deleted by this command.",
    scan_root: normalizePath(relative(workingDirectory, scanRoot)) || ".",
    detail_mode: includeModuleDetails ? "include_module_details" : "summary_only",
    summary,
    ...(includeModuleDetails
      ? { modules_requiring_compaction: analyses.filter((analysis) => analysis.requires_compaction) }
      : {}),
  },
  null,
  2
));

async function collectTypeScriptModuleNames(directoryPath: string): Promise<string[]> {
  const moduleNames: string[] = [];
  const entries = await readdir(directoryPath, { withFileTypes: true });

  for (const entry of entries) {
    const childPath = resolve(directoryPath, entry.name);

    if (entry.isDirectory()) {
      moduleNames.push(...await collectTypeScriptModuleNames(childPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".ts")) {
      moduleNames.push(childPath);
    }
  }

  return moduleNames;
}

function normalizePath(path: string): string {
  return path.replace(/\\/g, "/");
}
