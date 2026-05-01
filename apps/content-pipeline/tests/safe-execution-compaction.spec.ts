import { spawnSync } from "node:child_process";

import { describe, expect, it } from "vitest";

import {
  analyzeSafeExecutionFollowUpModuleName,
  summarizeSafeExecutionFollowUpModules,
} from "../src";

describe("safe execution compaction helper", () => {
  it("parses base provider follow-up contract modules", () => {
    expect(analyzeSafeExecutionFollowUpModuleName("provider-execution-follow-up.ts")).toMatchObject({
      normalized_module_name: "provider-execution-follow-up",
      is_provider_follow_up: true,
      depth: 1,
      artifact_kind: "contract",
      depth_encoding: "base",
      requires_compaction: false,
      issue_codes: [],
    });
  });

  it("parses delivery-chain depth and companion artifact kind", () => {
    const analysis = analyzeSafeExecutionFollowUpModuleName(
      "apps/content-pipeline/src/provider-execution-follow-up-delivery-follow-up-delivery-follow-up-plan.ts"
    );

    expect(analysis).toMatchObject({
      normalized_module_name: "provider-execution-follow-up-delivery-follow-up-delivery-follow-up-plan",
      is_provider_follow_up: true,
      depth: 3,
      artifact_kind: "plan",
      depth_encoding: "delivery_chain",
      requires_compaction: false,
      issue_codes: [],
    });
  });

  it("parses numeric-depth follow-up modules and marks excessive depth for compaction", () => {
    const analysis = analyzeSafeExecutionFollowUpModuleName("provider-execution-follow-up-n17-reconciliation.ts");

    expect(analysis).toMatchObject({
      depth: 17,
      artifact_kind: "reconciliation",
      depth_encoding: "numeric_depth",
      requires_compaction: true,
      issue_codes: ["depth_exceeds_compaction_threshold"],
    });
  });

  it("marks malformed mixed depth encodings for compaction instead of treating them as valid layers", () => {
    const analysis = analyzeSafeExecutionFollowUpModuleName(
      "provider-execution-follow-up-n11-delivery-follow-up-receipt.ts"
    );

    expect(analysis).toMatchObject({
      is_provider_follow_up: true,
      depth: 0,
      artifact_kind: "receipt",
      depth_encoding: "malformed",
      requires_compaction: true,
      issue_codes: ["mixed_depth_encodings"],
    });
  });

  it("summarizes follow-up modules without requiring a broad migration", () => {
    const summary = summarizeSafeExecutionFollowUpModules([
      "provider-execution-follow-up.ts",
      "provider-execution-follow-up-delivery-follow-up-plan.ts",
      "provider-execution-follow-up-n17.ts",
      "review-report.ts",
    ]);

    expect(summary).toEqual({
      total_modules: 4,
      provider_follow_up_modules: 3,
      max_depth: 17,
      modules_requiring_compaction: ["provider-execution-follow-up-n17"],
      malformed_modules: [],
    });
  });

  it("emits relative paths from the compaction scan command", () => {
    const command = process.platform === "win32" ? "cmd.exe" : "pnpm";
    const args = process.platform === "win32"
      ? ["/d", "/s", "/c", "pnpm --silent safe-execution:compaction-scan --include-module-details"]
      : ["--silent", "safe-execution:compaction-scan", "--include-module-details"];
    const result = spawnSync(command, args, {
      cwd: process.cwd(),
      encoding: "utf8",
    });

    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);

    const report = JSON.parse(result.stdout) as {
      scan_root: string;
      detail_mode: string;
      modules_requiring_compaction: { module_name: string }[];
    };
    const normalizedWorkspacePath = process.cwd().replace(/\\/g, "/");

    expect(JSON.stringify(report)).not.toContain(normalizedWorkspacePath);
    expect(report.scan_root).toBe("src");
    expect(report.detail_mode).toBe("include_module_details");
    expect(report.modules_requiring_compaction.length).toBeGreaterThan(0);
    report.modules_requiring_compaction.forEach((module) => {
      expect(module.module_name).toMatch(/^src\//);
      expect(module.module_name).not.toMatch(/^[A-Za-z]:/);
    });
  });

  it("keeps the default compaction scan output compact", () => {
    const command = process.platform === "win32" ? "cmd.exe" : "pnpm";
    const args = process.platform === "win32"
      ? ["/d", "/s", "/c", "pnpm --silent safe-execution:compaction-scan"]
      : ["--silent", "safe-execution:compaction-scan"];
    const result = spawnSync(command, args, {
      cwd: process.cwd(),
      encoding: "utf8",
    });

    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);

    const report = JSON.parse(result.stdout) as {
      detail_mode: string;
      modules_requiring_compaction?: unknown;
      summary: { modules_requiring_compaction: string[] };
    };

    expect(report.detail_mode).toBe("summary_only");
    expect(report.modules_requiring_compaction).toBeUndefined();
    expect(report.summary.modules_requiring_compaction.length).toBeGreaterThan(0);
  });
});
