import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { runContentPipelineCli } from "../src/cli";

function createMemoryIo(): {
  stdout: string[];
  stderr: string[];
  io: { stdout: (message: string) => void; stderr: (message: string) => void };
} {
  const stdout: string[] = [];
  const stderr: string[] = [];
  return {
    stdout,
    stderr,
    io: {
      stdout: (message: string) => stdout.push(message),
      stderr: (message: string) => stderr.push(message),
    },
  };
}

describe("provider execution follow-up cli", () => {
  async function seedProviderExecutionFollowUpChain(tempDir: string): Promise<{
    requestPath: string;
    decisionPath: string;
    attemptPath: string;
    sourceReceiptPath: string;
    sourceReconciliationPath: string;
    followUpPath: string;
    planPath: string;
  }> {
    const requestPath = join(tempDir, "review-provider-execution-request.json");
    const decisionPath = join(tempDir, "review-provider-execution-decision.json");
    const attemptPath = join(tempDir, "review-provider-execution-attempt.json");
    const sourceReceiptPath = join(tempDir, "review-provider-execution-receipt.json");
    const sourceReconciliationPath = join(
      tempDir,
      "review-provider-execution-reconciliation.json"
    );
    const followUpPath = join(tempDir, "review-provider-execution-follow-up.json");
    const planPath = join(tempDir, "review-provider-execution-follow-up-plan.json");

    await writeFile(
      requestPath,
      `${JSON.stringify(
        {
          schema_version: "content-pipeline-review-provider-execution-request/v0.1",
          request_key:
            "content-pipeline:provider-execution-request:run_scoped_review_rerun:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
          chain_key:
            "content-pipeline:provider-execution-chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
          source_artifact_schema_version: "content-pipeline-review-artifact/v0.1",
          source_artifact_generated_at: "2026-04-23T18:00:00.000Z",
          source_artifact_status: "blocked",
          unit_id: "math_g8_linear_function_intro",
          execution_action: "run_scoped_review_rerun",
          requested_start_role: "assessment_designer",
          requested_roles: ["assessment_designer", "qa_agent"],
          estimated_provider_call_count: 2,
          review_mode: "llm_review_no_writeback",
          output_contract: "review_artifact_only",
          reason:
            "A review-only scoped rerun is structurally allowed, but it still requires an explicit decision before spending provider execution.",
          rerun_chain_depth: 0,
          rerun_root_artifact_generated_at: "2026-04-23T18:00:00.000Z",
          source_retry_decision: "allow_scoped_rerun",
          source_recommended_rerun_from: "assessment_designer",
          human_queue: "rerun_decision_queue",
          primary_human_action: "decide_scoped_rerun",
          inbox_title: "[Rerun Decision] math_g8_linear_function_intro",
          inbox_summary:
            "Blocked artifact can attempt a review-only scoped rerun from assessment_designer, but provider execution still requires an explicit human decision.",
          execution_command: {
            command: "run-llm-review",
            from_artifact_generated_at: "2026-04-23T18:00:00.000Z",
            rerun_from: "assessment_designer",
          },
          gating_requirements: {
            requires_explicit_human_approval: true,
            requires_budget_policy_check: true,
            requires_real_provider_credentials: true,
          },
          decision_boundary: {
            requires_provider_execution: true,
            requires_human_decision: true,
            provider_execution_allowed_without_human: false,
          },
        },
        null,
        2
      )}\n`,
      "utf8"
    );
    await writeFile(
      decisionPath,
      `${JSON.stringify(
        {
          schema_version: "content-pipeline-review-provider-execution-decision/v0.1",
          source_request_schema_version: "content-pipeline-review-provider-execution-request/v0.1",
          request_key:
            "content-pipeline:provider-execution-request:run_scoped_review_rerun:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
          chain_key:
            "content-pipeline:provider-execution-chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
          unit_id: "math_g8_linear_function_intro",
          execution_action: "run_scoped_review_rerun",
          requested_start_role: "assessment_designer",
          requested_roles: ["assessment_designer", "qa_agent"],
          estimated_provider_call_count: 2,
          human_queue: "rerun_decision_queue",
          primary_human_action: "decide_scoped_rerun",
          decision_status: "approved",
          execution_permission: "granted",
          reviewer_id: "ops_lead_001",
          reviewed_at: "2026-04-24T00:05:00.000Z",
          budget_check_status: "passed",
        },
        null,
        2
      )}\n`,
      "utf8"
    );
    await writeFile(
      attemptPath,
      `${JSON.stringify(
        {
          schema_version: "content-pipeline-review-provider-execution-attempt/v0.1",
          source_request_schema_version: "content-pipeline-review-provider-execution-request/v0.1",
          source_decision_schema_version: "content-pipeline-review-provider-execution-decision/v0.1",
          attempt_key:
            "content-pipeline:provider-execution-attempt:run_scoped_review_rerun:math_g8_linear_function_intro:2026-04-24T00:10:00.000Z",
          request_key:
            "content-pipeline:provider-execution-request:run_scoped_review_rerun:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
          chain_key:
            "content-pipeline:provider-execution-chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
          unit_id: "math_g8_linear_function_intro",
          execution_action: "run_scoped_review_rerun",
          requested_start_role: "assessment_designer",
          requested_roles: ["assessment_designer", "qa_agent"],
          estimated_provider_call_count: 2,
          review_mode: "llm_review_no_writeback",
          output_contract: "review_artifact_only",
          execution_mode: "real_provider_review_rerun",
          attempt_status: "authorized_pending_execution",
          provider_execution_allowed: true,
          execution_command: {
            command: "run-llm-review",
            from_artifact_generated_at: "2026-04-23T18:00:00.000Z",
            rerun_from: "assessment_designer",
          },
          approved_by: "ops_lead_001",
          approved_at: "2026-04-24T00:05:00.000Z",
          budget_check_status: "passed",
          recorded_by: "automation_worker_001",
          recorded_at: "2026-04-24T00:10:00.000Z",
        },
        null,
        2
      )}\n`,
      "utf8"
    );
    await writeFile(
      sourceReceiptPath,
      `${JSON.stringify(
        {
          schema_version: "content-pipeline-review-provider-execution-receipt/v0.1",
          source_request_schema_version: "content-pipeline-review-provider-execution-request/v0.1",
          source_decision_schema_version: "content-pipeline-review-provider-execution-decision/v0.1",
          source_attempt_schema_version: "content-pipeline-review-provider-execution-attempt/v0.1",
          attempt_key:
            "content-pipeline:provider-execution-attempt:run_scoped_review_rerun:math_g8_linear_function_intro:2026-04-24T00:10:00.000Z",
          request_key:
            "content-pipeline:provider-execution-request:run_scoped_review_rerun:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
          chain_key:
            "content-pipeline:provider-execution-chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
          unit_id: "math_g8_linear_function_intro",
          execution_action: "run_scoped_review_rerun",
          requested_start_role: "assessment_designer",
          requested_roles: ["assessment_designer", "qa_agent"],
          estimated_provider_call_count: 2,
          review_mode: "llm_review_no_writeback",
          output_contract: "review_artifact_only",
          execution_mode: "real_provider_review_rerun",
          attempt_status_at_execution: "authorized_pending_execution",
          receipt_status: "execution_failed",
          executed_by: "review_runner_001",
          executed_at: "2026-04-24T00:20:00.000Z",
          actual_provider_call_count: 1,
          result_artifact_schema_version: null,
          result_artifact_generated_at: null,
          result_artifact_status: null,
          failure_code: "provider_timeout",
        },
        null,
        2
      )}\n`,
      "utf8"
    );
    await writeFile(
      sourceReconciliationPath,
      `${JSON.stringify(
        {
          schema_version: "content-pipeline-review-provider-execution-reconciliation/v0.1",
          source_request_schema_version: "content-pipeline-review-provider-execution-request/v0.1",
          source_decision_schema_version: "content-pipeline-review-provider-execution-decision/v0.1",
          source_attempt_schema_version: "content-pipeline-review-provider-execution-attempt/v0.1",
          source_receipt_schema_version: "content-pipeline-review-provider-execution-receipt/v0.1",
          request_key:
            "content-pipeline:provider-execution-request:run_scoped_review_rerun:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
          chain_key:
            "content-pipeline:provider-execution-chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
          attempt_key:
            "content-pipeline:provider-execution-attempt:run_scoped_review_rerun:math_g8_linear_function_intro:2026-04-24T00:10:00.000Z",
          unit_id: "math_g8_linear_function_intro",
          receipt_validation_ok: true,
          receipt_validation_issue_codes: [],
          reconciliation_status: "action_required",
          recommended_follow_up: "manual_execution_triage",
          execution_outcome: "execution_failed",
          result_artifact_available: false,
          result_artifact_generated_at: null,
          result_artifact_status: null,
          actual_provider_call_count: 1,
          executed_by: "review_runner_001",
          executed_at: "2026-04-24T00:20:00.000Z",
          failure_code: "provider_timeout",
        },
        null,
        2
      )}\n`,
      "utf8"
    );

    const { io } = createMemoryIo();
    const renderFollowUpExitCode = await runContentPipelineCli(
      [
        "render-review-provider-execution-follow-up",
        requestPath,
        decisionPath,
        attemptPath,
        sourceReceiptPath,
        sourceReconciliationPath,
        "--out",
        followUpPath,
      ],
      io
    );
    if (renderFollowUpExitCode !== 0) {
      throw new Error("Failed to seed provider execution follow-up.");
    }

    const renderPlanExitCode = await runContentPipelineCli(
      [
        "render-review-provider-execution-follow-up-plan",
        requestPath,
        decisionPath,
        attemptPath,
        sourceReceiptPath,
        sourceReconciliationPath,
        followUpPath,
        "--out",
        planPath,
      ],
      io
    );
    if (renderPlanExitCode !== 0) {
      throw new Error("Failed to seed provider execution follow-up plan.");
    }

    return {
      requestPath,
      decisionPath,
      attemptPath,
      sourceReceiptPath,
      sourceReconciliationPath,
      followUpPath,
      planPath,
    };
  }

  it("renders a provider execution follow-up receipt from a validated source chain", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const receiptPath = join(tempDir, "review-provider-execution-follow-up-receipt.json");
    const { stdout, stderr, io } = createMemoryIo();

    try {
      const seeded = await seedProviderExecutionFollowUpChain(tempDir);

      const exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-receipt",
          seeded.requestPath,
          seeded.decisionPath,
          seeded.attemptPath,
          seeded.sourceReceiptPath,
          seeded.sourceReconciliationPath,
          seeded.followUpPath,
          seeded.planPath,
          "--out",
          receiptPath,
        ],
        io
      );
      const summary = JSON.parse(stdout[0] ?? "{}");
      const receipt = JSON.parse(await readFile(receiptPath, "utf8"));

      expect(exitCode).toBe(0);
      expect(stderr).toEqual([]);
      expect(summary).toMatchObject({
        ok: true,
        command: "render-review-provider-execution-follow-up-receipt",
        overall_status: "applied",
        failed_operation_count: 0,
        output_path: receiptPath,
      });
      expect(receipt).toMatchObject({
        schema_version: "content-pipeline-review-provider-execution-follow-up-receipt/v0.1",
        follow_up_state: "execution_triage_required",
        follow_up_action: "open_manual_execution_triage_item",
        final_follow_up_queue: "manual_triage_queue",
        operations: [
          expect.objectContaining({
            operation_type: "upsert",
            target_item_key: expect.stringContaining("provider-execution"),
          }),
        ],
      });
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("fails provider execution follow-up receipt validation when the final follow-up target is tampered", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const receiptPath = join(tempDir, "review-provider-execution-follow-up-receipt.json");
    const { stdout, stderr, io } = createMemoryIo();

    try {
      const seeded = await seedProviderExecutionFollowUpChain(tempDir);

      const renderExitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-receipt",
          seeded.requestPath,
          seeded.decisionPath,
          seeded.attemptPath,
          seeded.sourceReceiptPath,
          seeded.sourceReconciliationPath,
          seeded.followUpPath,
          seeded.planPath,
          "--out",
          receiptPath,
        ],
        io
      );
      expect(renderExitCode).toBe(0);

      const receipt = JSON.parse(await readFile(receiptPath, "utf8"));
      receipt.final_follow_up_item_key = "wrong-item-key";
      await writeFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
      stdout.length = 0;

      const exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-receipt",
          seeded.requestPath,
          seeded.decisionPath,
          seeded.attemptPath,
          seeded.sourceReceiptPath,
          seeded.sourceReconciliationPath,
          seeded.followUpPath,
          seeded.planPath,
          receiptPath,
        ],
        io
      );
      const summary = JSON.parse(stdout[0] ?? "{}");

      expect(exitCode).toBe(1);
      expect(stderr).toEqual([]);
      expect(summary).toMatchObject({
        ok: false,
        command: "validate-review-provider-execution-follow-up-receipt",
      });
      expect(summary.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: "final_follow_up_state_mismatch",
          }),
        ])
      );
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("renders and validates a provider execution follow-up reconciliation from a validated delivery chain", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const receiptPath = join(tempDir, "review-provider-execution-follow-up-receipt.json");
    const reconciliationPath = join(
      tempDir,
      "review-provider-execution-follow-up-reconciliation.json"
    );
    const { stdout, stderr, io } = createMemoryIo();

    try {
      const seeded = await seedProviderExecutionFollowUpChain(tempDir);

      const renderReceiptExitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-receipt",
          seeded.requestPath,
          seeded.decisionPath,
          seeded.attemptPath,
          seeded.sourceReceiptPath,
          seeded.sourceReconciliationPath,
          seeded.followUpPath,
          seeded.planPath,
          "--out",
          receiptPath,
        ],
        io
      );
      expect(renderReceiptExitCode).toBe(0);
      stdout.length = 0;

      const renderExitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-reconciliation",
          seeded.requestPath,
          seeded.decisionPath,
          seeded.attemptPath,
          seeded.sourceReceiptPath,
          seeded.sourceReconciliationPath,
          seeded.followUpPath,
          seeded.planPath,
          receiptPath,
          "--out",
          reconciliationPath,
        ],
        io
      );
      const summary = JSON.parse(stdout[0] ?? "{}");
      const reconciliation = JSON.parse(await readFile(reconciliationPath, "utf8"));

      expect(renderExitCode).toBe(0);
      expect(stderr).toEqual([]);
      expect(summary).toMatchObject({
        ok: true,
        command: "render-review-provider-execution-follow-up-reconciliation",
        reconciliation_status: "closed",
        recommended_follow_up: "none",
        unresolved_operation_count: 0,
        output_path: reconciliationPath,
      });
      expect(reconciliation).toMatchObject({
        schema_version: "content-pipeline-review-provider-execution-follow-up-reconciliation/v0.1",
        receipt_validation_ok: true,
        reconciliation_status: "closed",
        recommended_follow_up: "none",
      });

      stdout.length = 0;
      const validateExitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-reconciliation",
          seeded.requestPath,
          seeded.decisionPath,
          seeded.attemptPath,
          seeded.sourceReceiptPath,
          seeded.sourceReconciliationPath,
          seeded.followUpPath,
          seeded.planPath,
          receiptPath,
          reconciliationPath,
        ],
        io
      );
      const validateSummary = JSON.parse(stdout[0] ?? "{}");

      expect(validateExitCode).toBe(0);
      expect(validateSummary).toMatchObject({
        ok: true,
        command: "validate-review-provider-execution-follow-up-reconciliation",
        issue_count: 0,
      });
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });
});
