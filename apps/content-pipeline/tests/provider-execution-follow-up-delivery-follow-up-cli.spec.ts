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

describe("provider execution follow-up delivery follow-up cli", () => {
  async function seedProviderExecutionFollowUpDeliveryChain(tempDir: string): Promise<{
    requestPath: string;
    decisionPath: string;
    attemptPath: string;
    sourceReceiptPath: string;
    sourceReconciliationPath: string;
    followUpPath: string;
    planPath: string;
    followUpReceiptPath: string;
    followUpReconciliationPath: string;
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
    const followUpReceiptPath = join(
      tempDir,
      "review-provider-execution-follow-up-receipt.json"
    );
    const followUpReconciliationPath = join(
      tempDir,
      "review-provider-execution-follow-up-reconciliation.json"
    );

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

    const renderFollowUpReceiptExitCode = await runContentPipelineCli(
      [
        "render-review-provider-execution-follow-up-receipt",
        requestPath,
        decisionPath,
        attemptPath,
        sourceReceiptPath,
        sourceReconciliationPath,
        followUpPath,
        planPath,
        "--out",
        followUpReceiptPath,
      ],
      io
    );
    if (renderFollowUpReceiptExitCode !== 0) {
      throw new Error("Failed to seed provider execution follow-up receipt.");
    }

    const renderFollowUpReconciliationExitCode = await runContentPipelineCli(
      [
        "render-review-provider-execution-follow-up-reconciliation",
        requestPath,
        decisionPath,
        attemptPath,
        sourceReceiptPath,
        sourceReconciliationPath,
        followUpPath,
        planPath,
        followUpReceiptPath,
        "--out",
        followUpReconciliationPath,
      ],
      io
    );
    if (renderFollowUpReconciliationExitCode !== 0) {
      throw new Error("Failed to seed provider execution follow-up reconciliation.");
    }

    return {
      requestPath,
      decisionPath,
      attemptPath,
      sourceReceiptPath,
      sourceReconciliationPath,
      followUpPath,
      planPath,
      followUpReceiptPath,
      followUpReconciliationPath,
    };
  }

  async function seedProviderExecutionFollowUpDeliveryFollowUpChain(
    tempDir: string
  ): Promise<{
    requestPath: string;
    decisionPath: string;
    attemptPath: string;
    sourceReceiptPath: string;
    sourceReconciliationPath: string;
    followUpPath: string;
    planPath: string;
    followUpReceiptPath: string;
    followUpReconciliationPath: string;
    followUpDeliveryFollowUpPath: string;
  }> {
    const seeded = await seedProviderExecutionFollowUpDeliveryChain(tempDir);
    const followUpDeliveryFollowUpPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up.json"
    );
    const { io } = createMemoryIo();
    const renderExitCode = await runContentPipelineCli(
      [
        "render-review-provider-execution-follow-up-delivery-follow-up",
        seeded.requestPath,
        seeded.decisionPath,
        seeded.attemptPath,
        seeded.sourceReceiptPath,
        seeded.sourceReconciliationPath,
        seeded.followUpPath,
        seeded.planPath,
        seeded.followUpReceiptPath,
        seeded.followUpReconciliationPath,
        "--out",
        followUpDeliveryFollowUpPath,
      ],
      io
    );
    if (renderExitCode !== 0) {
      throw new Error("Failed to seed provider execution follow-up delivery follow-up.");
    }

    return {
      ...seeded,
      followUpDeliveryFollowUpPath,
    };
  }

  async function seedProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpChain(
    tempDir: string
  ): Promise<{
    requestPath: string;
    decisionPath: string;
    attemptPath: string;
    sourceReceiptPath: string;
    sourceReconciliationPath: string;
    followUpPath: string;
    planPath: string;
    followUpReceiptPath: string;
    followUpReconciliationPath: string;
    followUpDeliveryFollowUpPath: string;
    deliveryFollowUpPlanPath: string;
    deliveryFollowUpReceiptPath: string;
    deliveryFollowUpReconciliationPath: string;
    deliveryFollowUpDeliveryFollowUpPath: string;
  }> {
    const seeded = await seedProviderExecutionFollowUpDeliveryFollowUpChain(tempDir);
    const deliveryFollowUpPlanPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-plan.json"
    );
    const deliveryFollowUpReceiptPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-receipt.json"
    );
    const deliveryFollowUpReconciliationPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-reconciliation.json"
    );
    const deliveryFollowUpDeliveryFollowUpPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up.json"
    );
    const { io } = createMemoryIo();

    let exitCode = await runContentPipelineCli(
      [
        "render-review-provider-execution-follow-up-delivery-follow-up-plan",
        seeded.requestPath,
        seeded.decisionPath,
        seeded.attemptPath,
        seeded.sourceReceiptPath,
        seeded.sourceReconciliationPath,
        seeded.followUpPath,
        seeded.planPath,
        seeded.followUpReceiptPath,
        seeded.followUpReconciliationPath,
        seeded.followUpDeliveryFollowUpPath,
        "--out",
        deliveryFollowUpPlanPath,
      ],
      io
    );
    if (exitCode !== 0) {
      throw new Error("Failed to seed provider execution follow-up delivery follow-up plan.");
    }

    exitCode = await runContentPipelineCli(
      [
        "render-review-provider-execution-follow-up-delivery-follow-up-receipt",
        seeded.requestPath,
        seeded.decisionPath,
        seeded.attemptPath,
        seeded.sourceReceiptPath,
        seeded.sourceReconciliationPath,
        seeded.followUpPath,
        seeded.planPath,
        seeded.followUpReceiptPath,
        seeded.followUpReconciliationPath,
        seeded.followUpDeliveryFollowUpPath,
        deliveryFollowUpPlanPath,
        "--out",
        deliveryFollowUpReceiptPath,
      ],
      io
    );
    if (exitCode !== 0) {
      throw new Error("Failed to seed provider execution follow-up delivery follow-up receipt.");
    }

    exitCode = await runContentPipelineCli(
      [
        "render-review-provider-execution-follow-up-delivery-follow-up-reconciliation",
        seeded.requestPath,
        seeded.decisionPath,
        seeded.attemptPath,
        seeded.sourceReceiptPath,
        seeded.sourceReconciliationPath,
        seeded.followUpPath,
        seeded.planPath,
        seeded.followUpReceiptPath,
        seeded.followUpReconciliationPath,
        seeded.followUpDeliveryFollowUpPath,
        deliveryFollowUpPlanPath,
        deliveryFollowUpReceiptPath,
        "--out",
        deliveryFollowUpReconciliationPath,
      ],
      io
    );
    if (exitCode !== 0) {
      throw new Error("Failed to seed provider execution follow-up delivery follow-up reconciliation.");
    }

    exitCode = await runContentPipelineCli(
      [
        "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up",
        seeded.requestPath,
        seeded.decisionPath,
        seeded.attemptPath,
        seeded.sourceReceiptPath,
        seeded.sourceReconciliationPath,
        seeded.followUpPath,
        seeded.planPath,
        seeded.followUpReceiptPath,
        seeded.followUpReconciliationPath,
        seeded.followUpDeliveryFollowUpPath,
        deliveryFollowUpPlanPath,
        deliveryFollowUpReceiptPath,
        deliveryFollowUpReconciliationPath,
        "--out",
        deliveryFollowUpDeliveryFollowUpPath,
      ],
      io
    );
    if (exitCode !== 0) {
      throw new Error("Failed to seed provider execution follow-up delivery follow-up delivery follow-up.");
    }

    return {
      ...seeded,
      deliveryFollowUpPlanPath,
      deliveryFollowUpReceiptPath,
      deliveryFollowUpReconciliationPath,
      deliveryFollowUpDeliveryFollowUpPath,
    };
  }

  async function seedProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpExecutorChain(
    tempDir: string
  ): Promise<{
    requestPath: string;
    decisionPath: string;
    attemptPath: string;
    sourceReceiptPath: string;
    sourceReconciliationPath: string;
    followUpPath: string;
    planPath: string;
    followUpReceiptPath: string;
    followUpReconciliationPath: string;
    followUpDeliveryFollowUpPath: string;
    deliveryFollowUpPlanPath: string;
    deliveryFollowUpReceiptPath: string;
    deliveryFollowUpReconciliationPath: string;
    deliveryFollowUpDeliveryFollowUpPath: string;
    deliveryFollowUpDeliveryFollowUpPlanPath: string;
    deliveryFollowUpDeliveryFollowUpReceiptPath: string;
    deliveryFollowUpDeliveryFollowUpReconciliationPath: string;
  }> {
    const seeded =
      await seedProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpChain(
        tempDir
      );
    const deliveryFollowUpDeliveryFollowUpPlanPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-plan.json"
    );
    const deliveryFollowUpDeliveryFollowUpReceiptPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-receipt.json"
    );
    const deliveryFollowUpDeliveryFollowUpReconciliationPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-reconciliation.json"
    );
    const { io } = createMemoryIo();

    let exitCode = await runContentPipelineCli(
      [
        "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-plan",
        seeded.requestPath,
        seeded.decisionPath,
        seeded.attemptPath,
        seeded.sourceReceiptPath,
        seeded.sourceReconciliationPath,
        seeded.followUpPath,
        seeded.planPath,
        seeded.followUpReceiptPath,
        seeded.followUpReconciliationPath,
        seeded.followUpDeliveryFollowUpPath,
        seeded.deliveryFollowUpPlanPath,
        seeded.deliveryFollowUpReceiptPath,
        seeded.deliveryFollowUpReconciliationPath,
        seeded.deliveryFollowUpDeliveryFollowUpPath,
        "--out",
        deliveryFollowUpDeliveryFollowUpPlanPath,
      ],
      io
    );
    if (exitCode !== 0) {
      throw new Error("Failed to seed provider execution follow-up delivery follow-up delivery follow-up plan.");
    }

    exitCode = await runContentPipelineCli(
      [
        "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-receipt",
        seeded.requestPath,
        seeded.decisionPath,
        seeded.attemptPath,
        seeded.sourceReceiptPath,
        seeded.sourceReconciliationPath,
        seeded.followUpPath,
        seeded.planPath,
        seeded.followUpReceiptPath,
        seeded.followUpReconciliationPath,
        seeded.followUpDeliveryFollowUpPath,
        seeded.deliveryFollowUpPlanPath,
        seeded.deliveryFollowUpReceiptPath,
        seeded.deliveryFollowUpReconciliationPath,
        seeded.deliveryFollowUpDeliveryFollowUpPath,
        deliveryFollowUpDeliveryFollowUpPlanPath,
        "--out",
        deliveryFollowUpDeliveryFollowUpReceiptPath,
      ],
      io
    );
    if (exitCode !== 0) {
      throw new Error("Failed to seed provider execution follow-up delivery follow-up delivery follow-up receipt.");
    }

    exitCode = await runContentPipelineCli(
      [
        "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-reconciliation",
        seeded.requestPath,
        seeded.decisionPath,
        seeded.attemptPath,
        seeded.sourceReceiptPath,
        seeded.sourceReconciliationPath,
        seeded.followUpPath,
        seeded.planPath,
        seeded.followUpReceiptPath,
        seeded.followUpReconciliationPath,
        seeded.followUpDeliveryFollowUpPath,
        seeded.deliveryFollowUpPlanPath,
        seeded.deliveryFollowUpReceiptPath,
        seeded.deliveryFollowUpReconciliationPath,
        seeded.deliveryFollowUpDeliveryFollowUpPath,
        deliveryFollowUpDeliveryFollowUpPlanPath,
        deliveryFollowUpDeliveryFollowUpReceiptPath,
        "--out",
        deliveryFollowUpDeliveryFollowUpReconciliationPath,
      ],
      io
    );
    if (exitCode !== 0) {
      throw new Error("Failed to seed provider execution follow-up delivery follow-up delivery follow-up reconciliation.");
    }

    return {
      ...seeded,
      deliveryFollowUpDeliveryFollowUpPlanPath,
      deliveryFollowUpDeliveryFollowUpReceiptPath,
      deliveryFollowUpDeliveryFollowUpReconciliationPath,
    };
  }

  it("renders and validates a provider execution follow-up delivery follow-up from a validated chain", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const followUpPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up.json"
    );
    const { stdout, stderr, io } = createMemoryIo();

    try {
      const seeded = await seedProviderExecutionFollowUpDeliveryChain(tempDir);

      const renderExitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up",
          seeded.requestPath,
          seeded.decisionPath,
          seeded.attemptPath,
          seeded.sourceReceiptPath,
          seeded.sourceReconciliationPath,
          seeded.followUpPath,
          seeded.planPath,
          seeded.followUpReceiptPath,
          seeded.followUpReconciliationPath,
          "--out",
          followUpPath,
        ],
        io
      );
      const renderSummary = JSON.parse(stdout[0] ?? "{}");
      const followUp = JSON.parse(await readFile(followUpPath, "utf8"));

      expect(renderExitCode).toBe(0);
      expect(stderr).toEqual([]);
      expect(renderSummary).toMatchObject({
        ok: true,
        command: "render-review-provider-execution-follow-up-delivery-follow-up",
        follow_up_state: "manual_follow_up_item_delivered",
        follow_up_action: "none",
        follow_up_delivery_chain_closed: true,
        output_path: followUpPath,
      });
      expect(followUp).toMatchObject({
        schema_version:
          "content-pipeline-review-provider-execution-follow-up-delivery-follow-up/v0.1",
        follow_up_state: "manual_follow_up_item_delivered",
        follow_up_action: "none",
        active_follow_up_item: {
          human_queue: "manual_triage_queue",
          should_remain_open: true,
        },
      });

      stdout.length = 0;
      const validateExitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up",
          seeded.requestPath,
          seeded.decisionPath,
          seeded.attemptPath,
          seeded.sourceReceiptPath,
          seeded.sourceReconciliationPath,
          seeded.followUpPath,
          seeded.planPath,
          seeded.followUpReceiptPath,
          seeded.followUpReconciliationPath,
          followUpPath,
        ],
        io
      );
      const validateSummary = JSON.parse(stdout[0] ?? "{}");

      expect(validateExitCode).toBe(0);
      expect(validateSummary).toMatchObject({
        ok: true,
        command: "validate-review-provider-execution-follow-up-delivery-follow-up",
        issue_count: 0,
      });
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("fails rendering when the source follow-up reconciliation chain is tampered", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const followUpPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up.json"
    );
    const { stdout, stderr, io } = createMemoryIo();

    try {
      const seeded = await seedProviderExecutionFollowUpDeliveryChain(tempDir);
      const tamperedReconciliation = JSON.parse(
        await readFile(seeded.followUpReconciliationPath, "utf8")
      );
      tamperedReconciliation.recommended_follow_up = "manual_receipt_triage";
      await writeFile(
        seeded.followUpReconciliationPath,
        `${JSON.stringify(tamperedReconciliation, null, 2)}\n`,
        "utf8"
      );

      const exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up",
          seeded.requestPath,
          seeded.decisionPath,
          seeded.attemptPath,
          seeded.sourceReceiptPath,
          seeded.sourceReconciliationPath,
          seeded.followUpPath,
          seeded.planPath,
          seeded.followUpReceiptPath,
          seeded.followUpReconciliationPath,
          "--out",
          followUpPath,
        ],
        io
      );

      expect(exitCode).toBe(1);
      expect(stdout).toEqual([]);
      expect(stderr.join("\n")).toContain(
        "Cannot render provider execution follow-up delivery follow-up from an invalid post-delivery follow-up chain."
      );
      expect(stderr.join("\n")).toContain(
        "source_follow_up_reconciliation_contract_mismatch"
      );
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("renders and validates the provider execution follow-up delivery follow-up executor chain", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const planPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-plan.json"
    );
    const receiptPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-receipt.json"
    );
    const reconciliationPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-reconciliation.json"
    );
    const { stdout, stderr, io } = createMemoryIo();

    try {
      const seeded = await seedProviderExecutionFollowUpDeliveryFollowUpChain(tempDir);

      const renderPlanExitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-plan",
          seeded.requestPath,
          seeded.decisionPath,
          seeded.attemptPath,
          seeded.sourceReceiptPath,
          seeded.sourceReconciliationPath,
          seeded.followUpPath,
          seeded.planPath,
          seeded.followUpReceiptPath,
          seeded.followUpReconciliationPath,
          seeded.followUpDeliveryFollowUpPath,
          "--out",
          planPath,
        ],
        io
      );
      const renderPlanSummary = JSON.parse(stdout[0] ?? "{}");
      const plan = JSON.parse(await readFile(planPath, "utf8"));

      expect(renderPlanExitCode).toBe(0);
      expect(renderPlanSummary).toMatchObject({
        ok: true,
        command: "render-review-provider-execution-follow-up-delivery-follow-up-plan",
        follow_up_state: "manual_follow_up_item_delivered",
        delivery_action: "none",
        output_path: planPath,
      });
      expect(plan).toMatchObject({
        schema_version:
          "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-plan/v0.1",
        final_follow_up_queue: "manual_triage_queue",
      });

      stdout.length = 0;
      const renderReceiptExitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-receipt",
          seeded.requestPath,
          seeded.decisionPath,
          seeded.attemptPath,
          seeded.sourceReceiptPath,
          seeded.sourceReconciliationPath,
          seeded.followUpPath,
          seeded.planPath,
          seeded.followUpReceiptPath,
          seeded.followUpReconciliationPath,
          seeded.followUpDeliveryFollowUpPath,
          planPath,
          "--out",
          receiptPath,
        ],
        io
      );
      const renderReceiptSummary = JSON.parse(stdout[0] ?? "{}");
      const receipt = JSON.parse(await readFile(receiptPath, "utf8"));

      expect(renderReceiptExitCode).toBe(0);
      expect(renderReceiptSummary).toMatchObject({
        ok: true,
        command: "render-review-provider-execution-follow-up-delivery-follow-up-receipt",
        overall_status: "applied",
        output_path: receiptPath,
      });
      expect(receipt).toMatchObject({
        schema_version:
          "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-receipt/v0.1",
        final_follow_up_queue: "manual_triage_queue",
      });

      stdout.length = 0;
      const renderReconciliationExitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-reconciliation",
          seeded.requestPath,
          seeded.decisionPath,
          seeded.attemptPath,
          seeded.sourceReceiptPath,
          seeded.sourceReconciliationPath,
          seeded.followUpPath,
          seeded.planPath,
          seeded.followUpReceiptPath,
          seeded.followUpReconciliationPath,
          seeded.followUpDeliveryFollowUpPath,
          planPath,
          receiptPath,
          "--out",
          reconciliationPath,
        ],
        io
      );
      const renderReconciliationSummary = JSON.parse(stdout[0] ?? "{}");
      const reconciliation = JSON.parse(await readFile(reconciliationPath, "utf8"));

      expect(renderReconciliationExitCode).toBe(0);
      expect(renderReconciliationSummary).toMatchObject({
        ok: true,
        command:
          "render-review-provider-execution-follow-up-delivery-follow-up-reconciliation",
        reconciliation_status: "closed",
        recommended_follow_up: "none",
        output_path: reconciliationPath,
      });
      expect(reconciliation).toMatchObject({
        schema_version:
          "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-reconciliation/v0.1",
        final_follow_up_queue: "manual_triage_queue",
      });

      stdout.length = 0;
      const validatePlanExitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-plan",
          seeded.requestPath,
          seeded.decisionPath,
          seeded.attemptPath,
          seeded.sourceReceiptPath,
          seeded.sourceReconciliationPath,
          seeded.followUpPath,
          seeded.planPath,
          seeded.followUpReceiptPath,
          seeded.followUpReconciliationPath,
          seeded.followUpDeliveryFollowUpPath,
          planPath,
        ],
        io
      );
      const validatePlanSummary = JSON.parse(stdout[0] ?? "{}");
      expect(validatePlanExitCode).toBe(0);
      expect(validatePlanSummary).toMatchObject({
        ok: true,
        command: "validate-review-provider-execution-follow-up-delivery-follow-up-plan",
        issue_count: 0,
      });

      stdout.length = 0;
      const validateReceiptExitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-receipt",
          seeded.requestPath,
          seeded.decisionPath,
          seeded.attemptPath,
          seeded.sourceReceiptPath,
          seeded.sourceReconciliationPath,
          seeded.followUpPath,
          seeded.planPath,
          seeded.followUpReceiptPath,
          seeded.followUpReconciliationPath,
          seeded.followUpDeliveryFollowUpPath,
          planPath,
          receiptPath,
        ],
        io
      );
      const validateReceiptSummary = JSON.parse(stdout[0] ?? "{}");
      expect(validateReceiptExitCode).toBe(0);
      expect(validateReceiptSummary).toMatchObject({
        ok: true,
        command:
          "validate-review-provider-execution-follow-up-delivery-follow-up-receipt",
        issue_count: 0,
      });

      stdout.length = 0;
      const validateReconciliationExitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-reconciliation",
          seeded.requestPath,
          seeded.decisionPath,
          seeded.attemptPath,
          seeded.sourceReceiptPath,
          seeded.sourceReconciliationPath,
          seeded.followUpPath,
          seeded.planPath,
          seeded.followUpReceiptPath,
          seeded.followUpReconciliationPath,
          seeded.followUpDeliveryFollowUpPath,
          planPath,
          receiptPath,
          reconciliationPath,
        ],
        io
      );
      const validateReconciliationSummary = JSON.parse(stdout[0] ?? "{}");
      expect(validateReconciliationExitCode).toBe(0);
      expect(validateReconciliationSummary).toMatchObject({
        ok: true,
        command:
          "validate-review-provider-execution-follow-up-delivery-follow-up-reconciliation",
        issue_count: 0,
      });
      expect(stderr).toEqual([]);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("renders and validates provider execution follow-up delivery follow-up post-delivery routing", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "content-pipeline-provider-follow-up-delivery-follow-up-post-"));
    try {
      const seeded = await seedProviderExecutionFollowUpDeliveryFollowUpChain(tempDir);
      const planPath = join(
        tempDir,
        "review-provider-execution-follow-up-delivery-follow-up-plan.json"
      );
      const receiptPath = join(
        tempDir,
        "review-provider-execution-follow-up-delivery-follow-up-receipt.json"
      );
      const reconciliationPath = join(
        tempDir,
        "review-provider-execution-follow-up-delivery-follow-up-reconciliation.json"
      );
      const postDeliveryPath = join(
        tempDir,
        "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up.json"
      );
      const { stdout, stderr, io } = createMemoryIo();

      let exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-plan",
          seeded.requestPath,
          seeded.decisionPath,
          seeded.attemptPath,
          seeded.sourceReceiptPath,
          seeded.sourceReconciliationPath,
          seeded.followUpPath,
          seeded.planPath,
          seeded.followUpReceiptPath,
          seeded.followUpReconciliationPath,
          seeded.followUpDeliveryFollowUpPath,
          "--out",
          planPath,
        ],
        io
      );
      expect(exitCode).toBe(0);

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-receipt",
          seeded.requestPath,
          seeded.decisionPath,
          seeded.attemptPath,
          seeded.sourceReceiptPath,
          seeded.sourceReconciliationPath,
          seeded.followUpPath,
          seeded.planPath,
          seeded.followUpReceiptPath,
          seeded.followUpReconciliationPath,
          seeded.followUpDeliveryFollowUpPath,
          planPath,
          "--out",
          receiptPath,
        ],
        io
      );
      expect(exitCode).toBe(0);

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-reconciliation",
          seeded.requestPath,
          seeded.decisionPath,
          seeded.attemptPath,
          seeded.sourceReceiptPath,
          seeded.sourceReconciliationPath,
          seeded.followUpPath,
          seeded.planPath,
          seeded.followUpReceiptPath,
          seeded.followUpReconciliationPath,
          seeded.followUpDeliveryFollowUpPath,
          planPath,
          receiptPath,
          "--out",
          reconciliationPath,
        ],
        io
      );
      expect(exitCode).toBe(0);

      stdout.length = 0;
      const renderExitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up",
          seeded.requestPath,
          seeded.decisionPath,
          seeded.attemptPath,
          seeded.sourceReceiptPath,
          seeded.sourceReconciliationPath,
          seeded.followUpPath,
          seeded.planPath,
          seeded.followUpReceiptPath,
          seeded.followUpReconciliationPath,
          seeded.followUpDeliveryFollowUpPath,
          planPath,
          receiptPath,
          reconciliationPath,
          "--out",
          postDeliveryPath,
        ],
        io
      );
      const renderSummary = JSON.parse(stdout[0] ?? "{}");
      const postDelivery = JSON.parse(await readFile(postDeliveryPath, "utf8"));

      expect(renderExitCode).toBe(0);
      expect(renderSummary).toMatchObject({
        ok: true,
        command:
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up",
        follow_up_state: "manual_follow_up_item_delivered",
        follow_up_action: "none",
        output_path: postDeliveryPath,
      });
      expect(postDelivery).toMatchObject({
        schema_version:
          "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up/v0.1",
        follow_up_state: "manual_follow_up_item_delivered",
        active_follow_up_item: {
          human_queue: "manual_triage_queue",
          should_remain_open: true,
        },
      });

      stdout.length = 0;
      const validateExitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up",
          seeded.requestPath,
          seeded.decisionPath,
          seeded.attemptPath,
          seeded.sourceReceiptPath,
          seeded.sourceReconciliationPath,
          seeded.followUpPath,
          seeded.planPath,
          seeded.followUpReceiptPath,
          seeded.followUpReconciliationPath,
          seeded.followUpDeliveryFollowUpPath,
          planPath,
          receiptPath,
          reconciliationPath,
          postDeliveryPath,
        ],
        io
      );
      const validateSummary = JSON.parse(stdout[0] ?? "{}");
      expect(validateExitCode).toBe(0);
      expect(validateSummary).toMatchObject({
        ok: true,
        command:
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up",
        issue_count: 0,
      });
      expect(stderr).toEqual([]);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("renders and validates the provider execution follow-up delivery follow-up delivery follow-up executor chain", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "content-pipeline-provider-follow-up-delivery-follow-up-delivery-follow-up-executor-"));
    const planPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-plan.json"
    );
    const receiptPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-receipt.json"
    );
    const reconciliationPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-reconciliation.json"
    );
    const { stdout, stderr, io } = createMemoryIo();

    try {
      const seeded =
        await seedProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpChain(
          tempDir
        );

      let exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-plan",
          seeded.requestPath,
          seeded.decisionPath,
          seeded.attemptPath,
          seeded.sourceReceiptPath,
          seeded.sourceReconciliationPath,
          seeded.followUpPath,
          seeded.planPath,
          seeded.followUpReceiptPath,
          seeded.followUpReconciliationPath,
          seeded.followUpDeliveryFollowUpPath,
          seeded.deliveryFollowUpPlanPath,
          seeded.deliveryFollowUpReceiptPath,
          seeded.deliveryFollowUpReconciliationPath,
          seeded.deliveryFollowUpDeliveryFollowUpPath,
          "--out",
          planPath,
        ],
        io
      );
      const renderPlanSummary = JSON.parse(stdout[0] ?? "{}");
      const plan = JSON.parse(await readFile(planPath, "utf8"));

      expect(exitCode).toBe(0);
      expect(renderPlanSummary).toMatchObject({
        ok: true,
        command:
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-plan",
        follow_up_state: "manual_follow_up_item_delivered",
        delivery_action: "none",
        output_path: planPath,
      });
      expect(plan).toMatchObject({
        schema_version:
          "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-plan/v0.1",
        final_follow_up_queue: "manual_triage_queue",
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-receipt",
          seeded.requestPath,
          seeded.decisionPath,
          seeded.attemptPath,
          seeded.sourceReceiptPath,
          seeded.sourceReconciliationPath,
          seeded.followUpPath,
          seeded.planPath,
          seeded.followUpReceiptPath,
          seeded.followUpReconciliationPath,
          seeded.followUpDeliveryFollowUpPath,
          seeded.deliveryFollowUpPlanPath,
          seeded.deliveryFollowUpReceiptPath,
          seeded.deliveryFollowUpReconciliationPath,
          seeded.deliveryFollowUpDeliveryFollowUpPath,
          planPath,
          "--out",
          receiptPath,
        ],
        io
      );
      const renderReceiptSummary = JSON.parse(stdout[0] ?? "{}");
      const receipt = JSON.parse(await readFile(receiptPath, "utf8"));

      expect(exitCode).toBe(0);
      expect(renderReceiptSummary).toMatchObject({
        ok: true,
        command:
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-receipt",
        overall_status: "applied",
        output_path: receiptPath,
      });
      expect(receipt).toMatchObject({
        schema_version:
          "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-receipt/v0.1",
        final_follow_up_queue: "manual_triage_queue",
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-reconciliation",
          seeded.requestPath,
          seeded.decisionPath,
          seeded.attemptPath,
          seeded.sourceReceiptPath,
          seeded.sourceReconciliationPath,
          seeded.followUpPath,
          seeded.planPath,
          seeded.followUpReceiptPath,
          seeded.followUpReconciliationPath,
          seeded.followUpDeliveryFollowUpPath,
          seeded.deliveryFollowUpPlanPath,
          seeded.deliveryFollowUpReceiptPath,
          seeded.deliveryFollowUpReconciliationPath,
          seeded.deliveryFollowUpDeliveryFollowUpPath,
          planPath,
          receiptPath,
          "--out",
          reconciliationPath,
        ],
        io
      );
      const renderReconciliationSummary = JSON.parse(stdout[0] ?? "{}");
      const reconciliation = JSON.parse(await readFile(reconciliationPath, "utf8"));

      expect(exitCode).toBe(0);
      expect(renderReconciliationSummary).toMatchObject({
        ok: true,
        command:
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-reconciliation",
        reconciliation_status: "closed",
        recommended_follow_up: "none",
        output_path: reconciliationPath,
      });
      expect(reconciliation).toMatchObject({
        schema_version:
          "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-reconciliation/v0.1",
        final_follow_up_queue: "manual_triage_queue",
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-plan",
          seeded.requestPath,
          seeded.decisionPath,
          seeded.attemptPath,
          seeded.sourceReceiptPath,
          seeded.sourceReconciliationPath,
          seeded.followUpPath,
          seeded.planPath,
          seeded.followUpReceiptPath,
          seeded.followUpReconciliationPath,
          seeded.followUpDeliveryFollowUpPath,
          seeded.deliveryFollowUpPlanPath,
          seeded.deliveryFollowUpReceiptPath,
          seeded.deliveryFollowUpReconciliationPath,
          seeded.deliveryFollowUpDeliveryFollowUpPath,
          planPath,
        ],
        io
      );
      const validatePlanSummary = JSON.parse(stdout[0] ?? "{}");
      expect(exitCode).toBe(0);
      expect(validatePlanSummary).toMatchObject({
        ok: true,
        command:
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-plan",
        issue_count: 0,
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-receipt",
          seeded.requestPath,
          seeded.decisionPath,
          seeded.attemptPath,
          seeded.sourceReceiptPath,
          seeded.sourceReconciliationPath,
          seeded.followUpPath,
          seeded.planPath,
          seeded.followUpReceiptPath,
          seeded.followUpReconciliationPath,
          seeded.followUpDeliveryFollowUpPath,
          seeded.deliveryFollowUpPlanPath,
          seeded.deliveryFollowUpReceiptPath,
          seeded.deliveryFollowUpReconciliationPath,
          seeded.deliveryFollowUpDeliveryFollowUpPath,
          planPath,
          receiptPath,
        ],
        io
      );
      const validateReceiptSummary = JSON.parse(stdout[0] ?? "{}");
      expect(exitCode).toBe(0);
      expect(validateReceiptSummary).toMatchObject({
        ok: true,
        command:
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-receipt",
        issue_count: 0,
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-reconciliation",
          seeded.requestPath,
          seeded.decisionPath,
          seeded.attemptPath,
          seeded.sourceReceiptPath,
          seeded.sourceReconciliationPath,
          seeded.followUpPath,
          seeded.planPath,
          seeded.followUpReceiptPath,
          seeded.followUpReconciliationPath,
          seeded.followUpDeliveryFollowUpPath,
          seeded.deliveryFollowUpPlanPath,
          seeded.deliveryFollowUpReceiptPath,
          seeded.deliveryFollowUpReconciliationPath,
          seeded.deliveryFollowUpDeliveryFollowUpPath,
          planPath,
          receiptPath,
          reconciliationPath,
        ],
        io
      );
      const validateReconciliationSummary = JSON.parse(stdout[0] ?? "{}");
      expect(exitCode).toBe(0);
      expect(validateReconciliationSummary).toMatchObject({
        ok: true,
        command:
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-reconciliation",
        issue_count: 0,
      });
      expect(stderr).toEqual([]);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("renders and validates provider execution follow-up delivery follow-up delivery follow-up post-delivery routing", async () => {
    const tempDir = await mkdtemp(
      join(
        tmpdir(),
        "content-pipeline-provider-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-"
      )
    );
    const deliveryFollowUpPath = join(
      tempDir,
      "review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up.json"
    );
    const { stdout, stderr, io } = createMemoryIo();

    try {
      const seeded =
        await seedProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpExecutorChain(
          tempDir
        );

      let exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
          seeded.requestPath,
          seeded.decisionPath,
          seeded.attemptPath,
          seeded.sourceReceiptPath,
          seeded.sourceReconciliationPath,
          seeded.followUpPath,
          seeded.planPath,
          seeded.followUpReceiptPath,
          seeded.followUpReconciliationPath,
          seeded.followUpDeliveryFollowUpPath,
          seeded.deliveryFollowUpPlanPath,
          seeded.deliveryFollowUpReceiptPath,
          seeded.deliveryFollowUpReconciliationPath,
          seeded.deliveryFollowUpDeliveryFollowUpPath,
          seeded.deliveryFollowUpDeliveryFollowUpPlanPath,
          seeded.deliveryFollowUpDeliveryFollowUpReceiptPath,
          seeded.deliveryFollowUpDeliveryFollowUpReconciliationPath,
          "--out",
          deliveryFollowUpPath,
        ],
        io
      );
      const renderSummary = JSON.parse(stdout[0] ?? "{}");
      const deliveryFollowUp = JSON.parse(
        await readFile(deliveryFollowUpPath, "utf8")
      );

      expect(exitCode).toBe(0);
      expect(renderSummary).toMatchObject({
        ok: true,
        command:
          "render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
        follow_up_state: "manual_follow_up_item_delivered",
        follow_up_action: "none",
        output_path: deliveryFollowUpPath,
      });
      expect(deliveryFollowUp).toMatchObject({
        schema_version:
          "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up/v0.1",
        follow_up_state: "manual_follow_up_item_delivered",
        active_follow_up_item: {
          human_queue: "manual_triage_queue",
          should_remain_open: true,
        },
      });

      stdout.length = 0;
      exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
          seeded.requestPath,
          seeded.decisionPath,
          seeded.attemptPath,
          seeded.sourceReceiptPath,
          seeded.sourceReconciliationPath,
          seeded.followUpPath,
          seeded.planPath,
          seeded.followUpReceiptPath,
          seeded.followUpReconciliationPath,
          seeded.followUpDeliveryFollowUpPath,
          seeded.deliveryFollowUpPlanPath,
          seeded.deliveryFollowUpReceiptPath,
          seeded.deliveryFollowUpReconciliationPath,
          seeded.deliveryFollowUpDeliveryFollowUpPath,
          seeded.deliveryFollowUpDeliveryFollowUpPlanPath,
          seeded.deliveryFollowUpDeliveryFollowUpReceiptPath,
          seeded.deliveryFollowUpDeliveryFollowUpReconciliationPath,
          deliveryFollowUpPath,
        ],
        io
      );
      const validateSummary = JSON.parse(stdout[0] ?? "{}");
      expect(exitCode).toBe(0);
      expect(validateSummary).toMatchObject({
        ok: true,
        command:
          "validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up",
        issue_count: 0,
      });
      expect(stderr).toEqual([]);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });
});
