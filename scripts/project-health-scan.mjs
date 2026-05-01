import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";

const rootDir = process.cwd();
const includeDocs = process.argv.includes("--include-docs");
const includeHistory = process.argv.includes("--include-history");
const scanRoots = includeDocs
  ? ["apps", "packages", "docs", "content", "tests", "scripts"]
  : ["apps", "packages", "content", "tests", "scripts"];
const excludedDirs = new Set([
  ".git",
  ".turbo",
  ".vite",
  "coverage",
  "dist",
  "node_modules",
  "playwright-report",
  "test-results"
]);
const allowedExtensions = new Set([".ts", ".tsx", ".vue", ".js", ".mjs", ".json", ".md", ".yaml", ".yml"]);
const signalPatterns = [
  { label: "TODO", pattern: /\bTODO\b/i },
  { label: "FIXME", pattern: /\bFIXME\b/i },
  { label: "HACK", pattern: /\bHACK\b/i },
  { label: "XXX", pattern: /\bXXX\b/i },
  { label: "P0/P1/P2", pattern: /\bP[0-2](?:[-:\s]|$)/ },
  { label: "GAP", pattern: /(?:^|\s)(?:GAP|Gap)(?:[-\s:#(]|\d)|Residual Risk/ }
];

const maxResults = parseMaxResults(process.argv);
const stats = {
  files_scanned: 0,
  directories_skipped: 0,
  total_matches: 0
};
const matches = [];

for (const scanRoot of scanRoots) {
  await scanPath(join(rootDir, scanRoot));
}

console.log(
  JSON.stringify(
    {
      ok: true,
      note: "Informational scan only. Build outputs and dependencies are intentionally excluded.",
      include_docs: includeDocs,
      include_history: includeHistory,
      scan_roots: scanRoots,
      excluded_dirs: [...excludedDirs].sort(),
      patterns: signalPatterns.map(({ label }) => label),
      files_scanned: stats.files_scanned,
      directories_skipped: stats.directories_skipped,
      total_matches: stats.total_matches,
      matches_returned: matches.length,
      matches_by_label: countByLabel(matches),
      matches
    },
    null,
    2
  )
);

async function scanPath(path) {
  let entries;
  try {
    entries = await readdir(path, { withFileTypes: true });
  } catch (error) {
    if (error?.code === "ENOENT") {
      return;
    }
    throw error;
  }

  for (const entry of entries) {
    const childPath = join(path, entry.name);

    if (entry.isDirectory()) {
      if (excludedDirs.has(entry.name)) {
        stats.directories_skipped += 1;
        continue;
      }
      await scanPath(childPath);
      continue;
    }

    if (!entry.isFile() || !allowedExtensions.has(extname(entry.name))) {
      continue;
    }

    await scanFile(childPath);
  }
}

async function scanFile(filePath) {
  const text = await readFile(filePath, "utf8");
  const relativePath = normalizePath(relative(rootDir, filePath));
  if (shouldSkipFile(relativePath)) {
    return;
  }
  stats.files_scanned += 1;

  for (const [index, line] of text.split(/\r?\n/).entries()) {
    for (const { label, pattern } of signalPatterns) {
      if (!pattern.test(line)) {
        continue;
      }
      if (isKnownProductCopyNoise(label, line)) {
        continue;
      }

      stats.total_matches += 1;
      if (matches.length < maxResults) {
        matches.push({
          path: relativePath,
          line: index + 1,
          label,
          text: line.trim().slice(0, 220)
        });
      }
    }
  }
}

function parseMaxResults(argv) {
  const maxIndex = argv.indexOf("--max");
  if (maxIndex === -1) {
    return 80;
  }

  const parsed = Number.parseInt(argv[maxIndex + 1] ?? "", 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error("--max must be a non-negative integer");
  }
  return parsed;
}

function normalizePath(path) {
  return path.replaceAll("\\", "/");
}

function isKnownProductCopyNoise(label, line) {
  if (label === "P0/P1/P2" && /<StatusPill[^>]+P[0-2]\s+\u9875\u9762/.test(line)) {
    return true;
  }
  if (label === "GAP" && /No-AI gap|Gap \$\{|Gap \u8fd8\u504f\u9ad8/.test(line)) {
    return true;
  }
  return false;
}

function shouldSkipFile(relativePath) {
  if (relativePath === "scripts/project-health-scan.mjs") {
    return true;
  }
  if (includeHistory) {
    return false;
  }
  return /(?:^|\/)IMPLEMENTATION_REPORT\.md$/.test(relativePath)
    || /^docs\/PHASE_.*_(?:INDEPENDENT_REVIEW|SELF_REVIEW|STATUS_AND_NEXT_STEPS|REVIEW_FIXES)\.md$/.test(
      relativePath
    );
}

function countByLabel(items) {
  return items.reduce((counts, item) => {
    counts[item.label] = (counts[item.label] ?? 0) + 1;
    return counts;
  }, {});
}
