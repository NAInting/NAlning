import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { runContentPipelineCli } from "../src/cli";
import { createOpenAiCompatibleReviewGateway, loadUnitSpecFromFile, serializeUnitSpecToYaml } from "../src";
import { loadUnknownNodeReviewArtifact } from "./fixtures";

const sampleUnitPath = resolve(process.cwd(), "../../content/units/math-g8-s1-linear-function-concept/unit.yaml");

function createMemoryIo(): { stdout: string[]; stderr: string[]; io: { stdout: (message: string) => void; stderr: (message: string) => void } } {
  const stdout: string[] = [];
  const stderr: string[] = [];
  return {
    stdout,
    stderr,
    io: {
      stdout: (message: string) => stdout.push(message),
      stderr: (message: string) => stderr.push(message)
    }
  };
}

describe("content pipeline cli", () => {
  it("validates a unit yaml and prints stable JSON", async () => {
    const { stdout, stderr, io } = createMemoryIo();
    const exitCode = await runContentPipelineCli(["validate-unit", sampleUnitPath], io);

    expect(exitCode).toBe(0);
    expect(stderr).toEqual([]);
    expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
      ok: true,
      command: "validate-unit",
      unit_id: "math_g8_linear_function_intro",
      knowledge_nodes: 1,
      semantic_validation: {
        passed: true,
        error_count: 0
      }
    });
  });

  it("returns a non-zero exit code when a unit has dangling semantic references", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const invalidUnitPath = join(tempDir, "invalid-unit.yaml");
    const sourceUnit = await loadUnitSpecFromFile(sampleUnitPath);
    const invalidUnit = {
      ...sourceUnit,
      assessment: {
        ...sourceUnit.assessment,
        items: [
          {
            ...sourceUnit.assessment.items[0]!,
            target_nodes: ["missing_node"]
          }
        ]
      }
    };
    const { stdout, stderr, io } = createMemoryIo();

    try {
      await writeFile(invalidUnitPath, serializeUnitSpecToYaml(invalidUnit), "utf8");

      const exitCode = await runContentPipelineCli(["validate-unit", invalidUnitPath], io);
      const output = JSON.parse(stdout[0] ?? "{}");

      expect(exitCode).toBe(1);
      expect(stderr).toEqual([]);
      expect(output).toMatchObject({
        ok: false,
        command: "validate-unit",
        semantic_validation: {
          passed: false,
          error_count: 1
        }
      });
      expect(output.semantic_validation.issues[0]).toMatchObject({
        code: "unknown_node_reference",
        path: "assessment.items[0].target_nodes[0]"
      });
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("runs a mock workflow and writes log entries", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const logPath = join(tempDir, "workflow-log.json");
    const { stdout, stderr, io } = createMemoryIo();

    try {
      const exitCode = await runContentPipelineCli(["run-workflow-smoke", sampleUnitPath, "--log", logPath], io);
      const logs = JSON.parse(await readFile(logPath, "utf8"));

      expect(exitCode).toBe(0);
      expect(stderr).toEqual([]);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        command: "run-workflow-smoke",
        unit_id: "math_g8_linear_function_intro",
        completed_agents: [
          "subject_expert",
          "pedagogy_designer",
          "narrative_designer",
          "engineering_agent",
          "assessment_designer",
          "qa_agent"
        ],
        log_path: logPath
      });
      expect(logs).toHaveLength(6);
      expect(JSON.stringify(logs)).not.toContain("校车路线费用");
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("runs an LLM mock workflow and writes sanitized invocation logs", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const logPath = join(tempDir, "invocation-log.json");
    const { stdout, stderr, io } = createMemoryIo();

    try {
      const exitCode = await runContentPipelineCli(["run-llm-mock", sampleUnitPath, "--log", logPath], io);
      const logs = JSON.parse(await readFile(logPath, "utf8"));

      expect(exitCode).toBe(0);
      expect(stderr).toEqual([]);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        command: "run-llm-mock",
        unit_id: "math_g8_linear_function_intro",
        completed_agents: [
          "subject_expert",
          "pedagogy_designer",
          "narrative_designer",
          "engineering_agent",
          "assessment_designer",
          "qa_agent"
        ],
        invocation_count: 6,
        log_path: logPath
      });
      expect(logs).toHaveLength(6);
      expect(JSON.stringify(logs)).not.toContain("mock response");
      expect(JSON.stringify(logs)).not.toContain("校车路线费用");
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("returns a non-zero exit code for unknown commands", async () => {
    const { stdout, stderr, io } = createMemoryIo();
    const exitCode = await runContentPipelineCli(["unknown"], io);

    expect(exitCode).toBe(1);
    expect(stdout).toEqual([]);
    expect(stderr.join("\n")).toContain("Usage:");
  });

  it("requires an explicit review artifact path for LLM review mode", async () => {
    const { stdout, stderr, io } = createMemoryIo();
    const exitCode = await runContentPipelineCli(["run-llm-review", sampleUnitPath], io);

    expect(exitCode).toBe(1);
    expect(stdout).toEqual([]);
    expect(stderr.join("\n")).toContain("Review mode never writes unit.yaml");
  });

  it("supports scoped rerun review mode from a prior blocked artifact", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const reviewPath = join(tempDir, "rerun-review-artifact.json");
    const priorArtifactPath = join(tempDir, "blocked-review-artifact.json");
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const sections = ["assessment", "quality"] as const;
    let callIndex = 0;
    const gateway = createOpenAiCompatibleReviewGateway({
      api_key: "test-key",
      model: "content-review-model",
      base_url: "https://llm.example/v1",
      fetch_impl: async () => {
        const section = sections[callIndex] ?? "quality";
        const patch = unit[section];
        callIndex += 1;

        return {
          ok: true,
          status: 200,
          statusText: "OK",
          async json() {
            return {
              choices: [
                {
                  message: {
                    content: JSON.stringify({
                      section,
                      patch
                    })
                  }
                }
              ],
              usage: {
                prompt_tokens: 10,
                completion_tokens: 5,
                total_tokens: 15
              }
            };
          }
        };
      }
    });
    const { stdout, stderr, io } = createMemoryIo();

    try {
      await writeFile(
        priorArtifactPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-artifact/v0.1",
            mode: "llm_review_no_writeback",
            generated_at: "2026-04-23T07:00:00.000Z",
            unit_id: unit.metadata.unit_id,
            status: "blocked",
            writeback_performed: false,
            repair_plan: {
              source: "invocation_failure",
              recommended_rerun_from: "assessment_designer",
              recommended_rerun_roles: ["assessment_designer", "qa_agent"],
              recommendations: [
                {
                  trigger: "schema_validation at assessment_designer",
                  root_owner: "assessment_designer",
                  impacted_owner: "assessment_designer",
                  rerun_from: "assessment_designer",
                  rerun_roles: ["assessment_designer", "qa_agent"],
                  reason: "Assessment section must be regenerated from its owner."
                }
              ]
            },
            retry_policy: {
              decision: "allow_scoped_rerun",
              reason: "This is the first blocked artifact for the current scope, so a review-only scoped rerun is safe to try.",
              recommended_rerun_from: "assessment_designer",
              recommended_rerun_roles: ["assessment_designer", "qa_agent"]
            },
            workflow_runs: [],
            invocation_logs: [],
            candidate_patches: [
              {
                role: "subject_expert",
                patch_sections: ["knowledge"],
                patch: { knowledge: unit.knowledge },
                diff: []
              },
              {
                role: "pedagogy_designer",
                patch_sections: ["pedagogy"],
                patch: { pedagogy: unit.pedagogy },
                diff: []
              },
              {
                role: "narrative_designer",
                patch_sections: ["narrative"],
                patch: { narrative: unit.narrative },
                diff: []
              },
              {
                role: "engineering_agent",
                patch_sections: ["implementation"],
                patch: { implementation: unit.implementation },
                diff: []
              }
            ]
          },
          null,
          2
        )}\n`,
        "utf8"
      );

      const exitCode = await runContentPipelineCli(
        ["run-llm-review", sampleUnitPath, "--review", reviewPath, "--from-artifact", priorArtifactPath],
        io,
        {
          review_gateway: gateway,
          review_now: () => new Date("2026-04-23T08:45:00.000Z")
        }
      );
      const artifact = JSON.parse(await readFile(reviewPath, "utf8"));
      const summary = JSON.parse(stdout[0] ?? "{}");

      expect(exitCode).toBe(0);
      expect(callIndex).toBe(2);
      expect(stderr).toEqual([]);
      expect(summary).toMatchObject({
        ok: true,
        command: "run-llm-review",
        status: "ready_for_human_review",
        orchestration_action: "notify_human_for_approval",
        orchestration_requires_provider_execution: false,
        orchestration_requires_human_decision: true,
        orchestration_human_queue: "approval_queue",
        orchestration_automation_step: "open_inbox_item",
        orchestration_provider_execution_allowed_without_human: false,
        orchestration_primary_human_action: "approve_review_artifact",
        orchestration_inbox_title: "[Approval] math_g8_linear_function_intro",
        runtime_event_count: 4,
        runtime_admin_audit_projection_count: 4,
        runtime_student_projection_count: 0,
        runtime_teacher_projection_count: 0,
        runtime_guardian_projection_count: 0,
        scoped_rerun_from: "assessment_designer",
        rerun_chain_depth: 1,
        rerun_root_artifact_generated_at: "2026-04-23T07:00:00.000Z",
        rerun_source_retry_decision: "allow_scoped_rerun"
      });
      expect(artifact.rerun_context).toMatchObject({
        start_from_role: "assessment_designer",
        inherited_roles: ["subject_expert", "pedagogy_designer", "narrative_designer", "engineering_agent"],
        rerun_chain_depth: 1,
        rerun_root_artifact_generated_at: "2026-04-23T07:00:00.000Z",
        source_retry_decision: "allow_scoped_rerun",
        source_recommended_rerun_from: "assessment_designer"
      });
      expect(artifact.candidate_patches.map((patch: { role: string }) => patch.role)).toEqual([
        "assessment_designer",
        "qa_agent"
      ]);
      expect(artifact.runtime_projection_summary).toEqual({
        total_events: 4,
        student_projection_count: 0,
        teacher_projection_count: 0,
        guardian_projection_count: 0,
        admin_audit_projection_count: 4
      });
      expect(artifact.runtime_admin_audit_projection).toHaveLength(4);
      expect(JSON.stringify(artifact.runtime_admin_audit_projection)).not.toContain("raw_output");
      expect(JSON.stringify(artifact.runtime_admin_audit_projection)).not.toContain("student_message");
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("rejects scoped rerun review mode when the prior artifact retry policy requires manual review", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const reviewPath = join(tempDir, "rerun-review-artifact.json");
    const priorArtifactPath = join(tempDir, "blocked-review-artifact.json");
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const { stdout, stderr, io } = createMemoryIo();

    try {
      await writeFile(
        priorArtifactPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-artifact/v0.1",
            mode: "llm_review_no_writeback",
            generated_at: "2026-04-23T07:00:00.000Z",
            unit_id: unit.metadata.unit_id,
            status: "blocked",
            writeback_performed: false,
            repair_plan: {
              source: "invocation_failure",
              recommended_rerun_from: "qa_agent",
              recommended_rerun_roles: ["qa_agent"],
              recommendations: [
                {
                  trigger: "model_unavailable at qa_agent",
                  root_owner: "qa_agent",
                  impacted_owner: "qa_agent",
                  rerun_from: "qa_agent",
                  rerun_roles: ["qa_agent"],
                  reason: "Provider failed during qa_agent."
                }
              ]
            },
            retry_policy: {
              decision: "manual_review_required",
              reason: "Provider instability persisted after a rerun.",
              recommended_rerun_from: "qa_agent",
              recommended_rerun_roles: ["qa_agent"],
              prior_rerun_from: "qa_agent"
            },
            workflow_runs: [],
            invocation_logs: [],
            candidate_patches: []
          },
          null,
          2
        )}\n`,
        "utf8"
      );

      const exitCode = await runContentPipelineCli(
        ["run-llm-review", sampleUnitPath, "--review", reviewPath, "--from-artifact", priorArtifactPath],
        io
      );

      expect(exitCode).toBe(1);
      expect(stdout).toEqual([]);
      expect(stderr.join("\n")).toContain("Scoped rerun blocked by retry policy");
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("renders a markdown report from a review artifact", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const artifactPath = join(tempDir, "review-artifact.json");
    const reportPath = join(tempDir, "review-report.md");
    const { stdout, stderr, io } = createMemoryIo();

    try {
      await writeFile(
        artifactPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-artifact/v0.1",
            mode: "llm_review_no_writeback",
            generated_at: "2026-04-23T08:00:00.000Z",
            unit_id: "math_g8_linear_function_intro",
            status: "ready_for_human_review",
            writeback_performed: false,
            workflow_runs: [],
            invocation_logs: [],
            candidate_patches: [
              {
                role: "subject_expert",
                patch_sections: ["knowledge"],
                patch: {},
                diff: [
                  {
                    path: "knowledge.global_misconceptions[0]",
                    change_type: "added",
                    after: "新增审阅误区"
                  }
                ]
              }
            ]
          },
          null,
          2
        )}\n`,
        "utf8"
      );

      const exitCode = await runContentPipelineCli(["render-review-report", artifactPath, "--out", reportPath], io);
      const report = await readFile(reportPath, "utf8");

      expect(exitCode).toBe(0);
      expect(stderr).toEqual([]);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        command: "render-review-report",
        report_path: reportPath
      });
      expect(report).toContain("# Unit Review Report: math_g8_linear_function_intro");
      expect(report).toContain("knowledge.global_misconceptions[0]");
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("renders and validates a no-spend repair request from an unknown-node blocked artifact", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const artifactPath = join(tempDir, "review-artifact.json");
    const requestPath = join(tempDir, "review-repair-request.json");
    const { stdout, stderr, io } = createMemoryIo();

    try {
      await writeFile(artifactPath, `${JSON.stringify(loadUnknownNodeReviewArtifact(), null, 2)}\n`, "utf8");

      const renderExitCode = await runContentPipelineCli(
        ["render-review-repair-request", artifactPath, "--out", requestPath],
        io
      );
      const renderSummary = JSON.parse(stdout[0] ?? "{}");
      const request = JSON.parse(await readFile(requestPath, "utf8"));

      expect(renderExitCode).toBe(0);
      expect(stderr).toEqual([]);
      expect(renderSummary).toMatchObject({
        ok: true,
        command: "render-review-repair-request",
        repair_action: "prepare_role_scoped_repair",
        repair_strategy: "preserve_core_node_id",
        requested_start_role: "subject_expert",
        requested_role_count: 6,
        output_path: requestPath
      });
      expect(request).toMatchObject({
        schema_version: "content-pipeline-review-repair-request/v0.1",
        repair_strategy: "preserve_core_node_id",
        review_mode: "llm_review_no_writeback",
        output_contract: "review_artifact_only",
        execution_boundary: {
          requires_provider_execution: false,
          requires_source_writeback: false,
          blocked_artifact_approval_allowed: false
        }
      });

      stdout.length = 0;
      const validateExitCode = await runContentPipelineCli(
        ["validate-review-repair-request", artifactPath, requestPath],
        io
      );
      const validateSummary = JSON.parse(stdout[0] ?? "{}");

      expect(validateExitCode).toBe(0);
      expect(stderr).toEqual([]);
      expect(validateSummary).toMatchObject({
        ok: true,
        command: "validate-review-repair-request",
        issue_count: 0
      });
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("fails repair request validation closed when the request JSON contains an unknown field", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const artifactPath = join(tempDir, "review-artifact.json");
    const requestPath = join(tempDir, "review-repair-request.json");
    const { stdout, stderr, io } = createMemoryIo();

    try {
      await writeFile(artifactPath, `${JSON.stringify(loadUnknownNodeReviewArtifact(), null, 2)}\n`, "utf8");
      const renderExitCode = await runContentPipelineCli(
        ["render-review-repair-request", artifactPath, "--out", requestPath],
        io
      );
      expect(renderExitCode).toBe(0);

      const request = JSON.parse(await readFile(requestPath, "utf8"));
      request.approve_blocked_artifact = true;
      await writeFile(requestPath, `${JSON.stringify(request, null, 2)}\n`, "utf8");

      stdout.length = 0;
      const validateExitCode = await runContentPipelineCli(
        ["validate-review-repair-request", artifactPath, requestPath],
        io
      );
      const validateSummary = JSON.parse(stdout[0] ?? "{}");

      expect(validateExitCode).toBe(1);
      expect(stderr).toEqual([]);
      expect(validateSummary).toMatchObject({
        ok: false,
        command: "validate-review-repair-request"
      });
      expect(validateSummary.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            stage: "repair_request",
            code: "unknown_request_field"
          })
        ])
      );
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("renders an inbox handoff with a no-spend repair request summary for unknown-node artifacts", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const artifactPath = join(tempDir, "review-artifact.json");
    const handoffPath = join(tempDir, "review-inbox-item.json");
    const { stdout, stderr, io } = createMemoryIo();

    try {
      await writeFile(artifactPath, `${JSON.stringify(loadUnknownNodeReviewArtifact(), null, 2)}\n`, "utf8");

      const exitCode = await runContentPipelineCli(["render-review-inbox-item", artifactPath, "--out", handoffPath], io);
      const handoff = JSON.parse(await readFile(handoffPath, "utf8"));

      expect(exitCode).toBe(0);
      expect(stderr).toEqual([]);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        command: "render-review-inbox-item",
        human_queue: "rerun_decision_queue",
        primary_human_action: "decide_scoped_rerun",
        output_path: handoffPath
      });
      expect(handoff).toMatchObject({
        human_queue: "rerun_decision_queue",
        metadata: {
          repair_request: {
            repair_action: "prepare_role_scoped_repair",
            repair_strategy: "preserve_core_node_id",
            requested_start_role: "subject_expert",
            requested_role_count: 6,
            requires_provider_execution: false,
            requires_source_writeback: false,
            blocked_artifact_approval_allowed: false
          }
        }
      });
      expect(handoff.labels).toEqual(
        expect.arrayContaining([
          "repair_request:preserve_core_node_id",
          "repair_action:prepare_role_scoped_repair"
        ])
      );
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("renders a provider execution request from a blocked rerun artifact", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const artifactPath = join(tempDir, "review-artifact.json");
    const requestPath = join(tempDir, "review-provider-execution-request.json");
    const { stdout, stderr, io } = createMemoryIo();

    try {
      await writeFile(
        artifactPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-artifact/v0.1",
            mode: "llm_review_no_writeback",
            generated_at: "2026-04-23T18:00:00.000Z",
            unit_id: "math_g8_linear_function_intro",
            status: "blocked",
            writeback_performed: false,
            repair_plan: {
              source: "invocation_failure",
              recommended_rerun_from: "assessment_designer",
              recommended_rerun_roles: ["assessment_designer", "qa_agent"],
              recommendations: [
                {
                  trigger: "schema_validation at assessment_designer",
                  root_owner: "assessment_designer",
                  impacted_owner: "assessment_designer",
                  rerun_from: "assessment_designer",
                  rerun_roles: ["assessment_designer", "qa_agent"],
                  reason: "Assessment section must be regenerated from its owner."
                }
              ]
            },
            retry_policy: {
              decision: "allow_scoped_rerun",
              reason: "First blocked artifact in current scope.",
              recommended_rerun_from: "assessment_designer",
              recommended_rerun_roles: ["assessment_designer", "qa_agent"]
            },
            orchestration_guidance: {
              action: "prepare_scoped_rerun",
              reason:
                "A review-only scoped rerun is structurally allowed, but it still requires an explicit decision before spending provider execution.",
              requires_provider_execution: true,
              requires_human_decision: true,
              human_queue: "rerun_decision_queue",
              automation_step: "open_inbox_item",
              provider_execution_allowed_without_human: false,
              primary_human_action: "decide_scoped_rerun",
              inbox_title: "[Rerun Decision] math_g8_linear_function_intro",
              inbox_summary:
                "Blocked artifact can attempt a review-only scoped rerun from assessment_designer, but provider execution still requires an explicit human decision.",
              recommended_rerun_from: "assessment_designer",
              rerun_chain_depth: 0
            },
            workflow_runs: [],
            invocation_logs: [],
            candidate_patches: []
          },
          null,
          2
        )}\n`,
        "utf8"
      );

      const exitCode = await runContentPipelineCli(
        ["render-review-provider-execution-request", artifactPath, "--out", requestPath],
        io
      );
      const summary = JSON.parse(stdout[0] ?? "{}");
      const request = JSON.parse(await readFile(requestPath, "utf8"));

      expect(exitCode).toBe(0);
      expect(stderr).toEqual([]);
      expect(summary).toMatchObject({
        ok: true,
        command: "render-review-provider-execution-request",
        execution_action: "run_scoped_review_rerun",
        requested_start_role: "assessment_designer",
        requested_role_count: 2,
        output_path: requestPath
      });
      expect(request).toMatchObject({
        schema_version: "content-pipeline-review-provider-execution-request/v0.1",
        execution_action: "run_scoped_review_rerun",
        requested_roles: ["assessment_designer", "qa_agent"],
        estimated_provider_call_count: 2
      });
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("refuses to render a provider execution request from a manual-triage artifact", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const artifactPath = join(tempDir, "review-artifact.json");
    const requestPath = join(tempDir, "review-provider-execution-request.json");
    const { stdout, stderr, io } = createMemoryIo();

    try {
      await writeFile(
        artifactPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-artifact/v0.1",
            mode: "llm_review_no_writeback",
            generated_at: "2026-04-23T18:00:00.000Z",
            unit_id: "math_g8_linear_function_intro",
            status: "blocked",
            writeback_performed: false,
            repair_plan: {
              source: "invocation_failure",
              recommended_rerun_from: "assessment_designer",
              recommended_rerun_roles: ["assessment_designer", "qa_agent"],
              recommendations: []
            },
            retry_policy: {
              decision: "manual_review_required",
              reason: "Provider instability persisted after rerun.",
              recommended_rerun_from: "assessment_designer",
              recommended_rerun_roles: ["assessment_designer", "qa_agent"],
              prior_rerun_from: "assessment_designer"
            },
            orchestration_guidance: {
              action: "manual_triage_required",
              reason: "The retry policy already requires manual review, so automation should stop and route the artifact to human triage.",
              requires_provider_execution: false,
              requires_human_decision: true,
              human_queue: "manual_triage_queue",
              automation_step: "open_inbox_item",
              provider_execution_allowed_without_human: false,
              primary_human_action: "perform_manual_triage",
              inbox_title: "[Manual Triage] math_g8_linear_function_intro",
              inbox_summary:
                "Retry policy already requires manual review. Route this blocked artifact to human triage instead of attempting another automated rerun.",
              recommended_rerun_from: "assessment_designer",
              rerun_chain_depth: 1
            },
            workflow_runs: [],
            invocation_logs: [],
            candidate_patches: []
          },
          null,
          2
        )}\n`,
        "utf8"
      );

      const exitCode = await runContentPipelineCli(
        ["render-review-provider-execution-request", artifactPath, "--out", requestPath],
        io
      );

      expect(exitCode).toBe(1);
      expect(stdout).toEqual([]);
      expect(stderr.join("\n")).toContain(
        "Cannot render provider execution request from an invalid review artifact source."
      );
      expect(stderr.join("\n")).toContain("orchestration_action_not_provider_request");
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("refuses to render a provider execution request when recommended_rerun_from is not a real workflow role", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const artifactPath = join(tempDir, "review-artifact.json");
    const requestPath = join(tempDir, "review-provider-execution-request.json");
    const { stdout, stderr, io } = createMemoryIo();

    try {
      await writeFile(
        artifactPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-artifact/v0.1",
            mode: "llm_review_no_writeback",
            generated_at: "2026-04-23T18:00:00.000Z",
            unit_id: "math_g8_linear_function_intro",
            status: "blocked",
            writeback_performed: false,
            repair_plan: {
              source: "invocation_failure",
              recommended_rerun_from: "assessment_designer",
              recommended_rerun_roles: ["assessment_designer", "qa_agent"],
              recommendations: []
            },
            retry_policy: {
              decision: "allow_scoped_rerun",
              reason: "First blocked artifact in current scope.",
              recommended_rerun_from: "bogus_role",
              recommended_rerun_roles: ["assessment_designer", "qa_agent"]
            },
            orchestration_guidance: {
              action: "prepare_scoped_rerun",
              reason:
                "A review-only scoped rerun is structurally allowed, but it still requires an explicit decision before spending provider execution.",
              requires_provider_execution: true,
              requires_human_decision: true,
              human_queue: "rerun_decision_queue",
              automation_step: "open_inbox_item",
              provider_execution_allowed_without_human: false,
              primary_human_action: "decide_scoped_rerun",
              inbox_title: "[Rerun Decision] math_g8_linear_function_intro",
              inbox_summary:
                "Blocked artifact can attempt a review-only scoped rerun from assessment_designer, but provider execution still requires an explicit human decision.",
              recommended_rerun_from: "assessment_designer",
              rerun_chain_depth: 0
            },
            workflow_runs: [],
            invocation_logs: [],
            candidate_patches: []
          },
          null,
          2
        )}\n`,
        "utf8"
      );

      const exitCode = await runContentPipelineCli(
        ["render-review-provider-execution-request", artifactPath, "--out", requestPath],
        io
      );

      expect(exitCode).toBe(1);
      expect(stdout).toEqual([]);
      expect(stderr.join("\n")).toContain("Cannot render provider execution request from an invalid review artifact source.");
      expect(stderr.join("\n")).toContain("invalid_recommended_rerun_from");
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("validates a provider execution request against its source artifact", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const artifactPath = join(tempDir, "review-artifact.json");
    const requestPath = join(tempDir, "review-provider-execution-request.json");
    const { stdout, stderr, io } = createMemoryIo();

    try {
      await writeFile(
        artifactPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-artifact/v0.1",
            mode: "llm_review_no_writeback",
            generated_at: "2026-04-23T18:00:00.000Z",
            unit_id: "math_g8_linear_function_intro",
            status: "blocked",
            writeback_performed: false,
            repair_plan: {
              source: "invocation_failure",
              recommended_rerun_from: "assessment_designer",
              recommended_rerun_roles: ["assessment_designer", "qa_agent"],
              recommendations: []
            },
            retry_policy: {
              decision: "allow_scoped_rerun",
              reason: "First blocked artifact in current scope.",
              recommended_rerun_from: "assessment_designer",
              recommended_rerun_roles: ["assessment_designer", "qa_agent"]
            },
            orchestration_guidance: {
              action: "prepare_scoped_rerun",
              reason:
                "A review-only scoped rerun is structurally allowed, but it still requires an explicit decision before spending provider execution.",
              requires_provider_execution: true,
              requires_human_decision: true,
              human_queue: "rerun_decision_queue",
              automation_step: "open_inbox_item",
              provider_execution_allowed_without_human: false,
              primary_human_action: "decide_scoped_rerun",
              inbox_title: "[Rerun Decision] math_g8_linear_function_intro",
              inbox_summary:
                "Blocked artifact can attempt a review-only scoped rerun from assessment_designer, but provider execution still requires an explicit human decision.",
              recommended_rerun_from: "assessment_designer",
              rerun_chain_depth: 0
            },
            workflow_runs: [],
            invocation_logs: [],
            candidate_patches: []
          },
          null,
          2
        )}\n`,
        "utf8"
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
            estimated_provider_call_count: 1,
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
              rerun_from: "assessment_designer"
            },
            gating_requirements: {
              requires_explicit_human_approval: true,
              requires_budget_policy_check: true,
              requires_real_provider_credentials: true
            },
            decision_boundary: {
              requires_provider_execution: true,
              requires_human_decision: true,
              provider_execution_allowed_without_human: false
            }
          },
          null,
          2
        )}\n`,
        "utf8"
      );

      const exitCode = await runContentPipelineCli(
        ["validate-review-provider-execution-request", artifactPath, requestPath],
        io
      );
      const summary = JSON.parse(stdout[0] ?? "{}");

      expect(exitCode).toBe(1);
      expect(stderr).toEqual([]);
      expect(summary).toMatchObject({
        ok: false,
        command: "validate-review-provider-execution-request"
      });
      expect(summary.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            stage: "provider_execution_request",
            code: "estimated_provider_call_count_mismatch"
          })
        ])
      );
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("fails provider execution request validation closed when the source artifact contract is invalid", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const artifactPath = join(tempDir, "review-artifact.json");
    const requestPath = join(tempDir, "review-provider-execution-request.json");
    const { stdout, stderr, io } = createMemoryIo();

    try {
      await writeFile(
        artifactPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-artifact/v0.1",
            mode: "llm_review_no_writeback",
            generated_at: "2026-04-23T18:00:00.000Z",
            unit_id: "math_g8_linear_function_intro",
            status: "blocked",
            writeback_performed: false,
            repair_plan: {
              source: "invocation_failure",
              recommended_rerun_from: "assessment_designer",
              recommended_rerun_roles: ["assessment_designer", "qa_agent"],
              recommendations: []
            },
            retry_policy: {
              decision: "allow_scoped_rerun",
              reason: "First blocked artifact in current scope.",
              recommended_rerun_from: "bogus_role",
              recommended_rerun_roles: ["assessment_designer", "qa_agent"]
            },
            orchestration_guidance: {
              action: "prepare_scoped_rerun",
              reason:
                "A review-only scoped rerun is structurally allowed, but it still requires an explicit decision before spending provider execution.",
              requires_provider_execution: true,
              requires_human_decision: true,
              human_queue: "rerun_decision_queue",
              automation_step: "open_inbox_item",
              provider_execution_allowed_without_human: false,
              primary_human_action: "decide_scoped_rerun",
              inbox_title: "[Rerun Decision] math_g8_linear_function_intro",
              inbox_summary:
                "Blocked artifact can attempt a review-only scoped rerun from assessment_designer, but provider execution still requires an explicit human decision.",
              recommended_rerun_from: "assessment_designer",
              rerun_chain_depth: 0
            },
            workflow_runs: [],
            invocation_logs: [],
            candidate_patches: []
          },
          null,
          2
        )}\n`,
        "utf8"
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
              rerun_from: "assessment_designer"
            },
            gating_requirements: {
              requires_explicit_human_approval: true,
              requires_budget_policy_check: true,
              requires_real_provider_credentials: true
            },
            decision_boundary: {
              requires_provider_execution: true,
              requires_human_decision: true,
              provider_execution_allowed_without_human: false
            }
          },
          null,
          2
        )}\n`,
        "utf8"
      );

      const exitCode = await runContentPipelineCli(
        ["validate-review-provider-execution-request", artifactPath, requestPath],
        io
      );
      const summary = JSON.parse(stdout[0] ?? "{}");

      expect(exitCode).toBe(1);
      expect(stderr).toEqual([]);
      expect(summary).toMatchObject({
        ok: false,
        command: "validate-review-provider-execution-request"
      });
      expect(summary.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            stage: "provider_execution_request_source",
            code: "invalid_recommended_rerun_from"
          })
        ])
      );
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("records a provider execution decision from a validated provider execution request", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const requestPath = join(tempDir, "review-provider-execution-request.json");
    const decisionPath = join(tempDir, "review-provider-execution-decision.json");
    const { stdout, stderr, io } = createMemoryIo();

    try {
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
              rerun_from: "assessment_designer"
            },
            gating_requirements: {
              requires_explicit_human_approval: true,
              requires_budget_policy_check: true,
              requires_real_provider_credentials: true
            },
            decision_boundary: {
              requires_provider_execution: true,
              requires_human_decision: true,
              provider_execution_allowed_without_human: false
            }
          },
          null,
          2
        )}\n`,
        "utf8"
      );

      const exitCode = await runContentPipelineCli(
        [
          "decide-review-provider-execution-request",
          requestPath,
          "--reviewer",
          "ops_lead_001",
          "--decision",
          "approve",
          "--budget-check",
          "passed",
          "--budget-reference",
          "budget-policy-2026-04-24",
          "--out",
          decisionPath
        ],
        io
      );
      const summary = JSON.parse(stdout[0] ?? "{}");
      const decision = JSON.parse(await readFile(decisionPath, "utf8"));

      expect(exitCode).toBe(0);
      expect(stderr).toEqual([]);
      expect(summary).toMatchObject({
        ok: true,
        command: "decide-review-provider-execution-request",
        unit_id: "math_g8_linear_function_intro",
        decision_status: "approved",
        execution_permission: "granted",
        budget_check_status: "passed",
        reviewer_id: "ops_lead_001",
        output_path: decisionPath
      });
      expect(decision).toMatchObject({
        schema_version: "content-pipeline-review-provider-execution-decision/v0.1",
        decision_status: "approved",
        execution_permission: "granted",
        budget_check_status: "passed",
        budget_reference: "budget-policy-2026-04-24"
      });
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("fails provider execution decision validation when approval contradicts budget policy", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const requestPath = join(tempDir, "review-provider-execution-request.json");
    const decisionPath = join(tempDir, "review-provider-execution-decision.json");
    const { stdout, stderr, io } = createMemoryIo();

    try {
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
              rerun_from: "assessment_designer"
            },
            gating_requirements: {
              requires_explicit_human_approval: true,
              requires_budget_policy_check: true,
              requires_real_provider_credentials: true
            },
            decision_boundary: {
              requires_provider_execution: true,
              requires_human_decision: true,
              provider_execution_allowed_without_human: false
            }
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
            execution_permission: "denied",
            reviewer_id: "ops_lead_001",
            reviewed_at: "2026-04-24T00:05:00.000Z",
            budget_check_status: "failed"
          },
          null,
          2
        )}\n`,
        "utf8"
      );

      const exitCode = await runContentPipelineCli(
        ["validate-review-provider-execution-decision", requestPath, decisionPath],
        io
      );
      const summary = JSON.parse(stdout[0] ?? "{}");

      expect(exitCode).toBe(1);
      expect(stderr).toEqual([]);
      expect(summary).toMatchObject({
        ok: false,
        command: "validate-review-provider-execution-decision"
      });
      expect(summary.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            stage: "provider_execution_decision",
            code: "approval_requires_budget_pass"
          })
        ])
      );
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("rejects whitespace-only reviewer ids when recording provider execution decisions", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const requestPath = join(tempDir, "review-provider-execution-request.json");
    const decisionPath = join(tempDir, "review-provider-execution-decision.json");
    const { stdout, stderr, io } = createMemoryIo();

    try {
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
              rerun_from: "assessment_designer"
            },
            gating_requirements: {
              requires_explicit_human_approval: true,
              requires_budget_policy_check: true,
              requires_real_provider_credentials: true
            },
            decision_boundary: {
              requires_provider_execution: true,
              requires_human_decision: true,
              provider_execution_allowed_without_human: false
            }
          },
          null,
          2
        )}\n`,
        "utf8"
      );

      const exitCode = await runContentPipelineCli(
        [
          "decide-review-provider-execution-request",
          requestPath,
          "--reviewer",
          "   ",
          "--decision",
          "approve",
          "--budget-check",
          "passed",
          "--out",
          decisionPath
        ],
        io
      );

      expect(exitCode).toBe(1);
      expect(stdout).toEqual([]);
      expect(stderr).toEqual(expect.arrayContaining(["Missing --reviewer <reviewer-id>."]));
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("reports structured issues for malformed provider execution decision JSON", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const requestPath = join(tempDir, "review-provider-execution-request.json");
    const decisionPath = join(tempDir, "review-provider-execution-decision.json");
    const { stdout, stderr, io } = createMemoryIo();

    try {
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
              rerun_from: "assessment_designer"
            },
            gating_requirements: {
              requires_explicit_human_approval: true,
              requires_budget_policy_check: true,
              requires_real_provider_credentials: true
            },
            decision_boundary: {
              requires_provider_execution: true,
              requires_human_decision: true,
              provider_execution_allowed_without_human: false
            }
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
            reviewer_id: null,
            reviewed_at: null,
            budget_check_status: "passed"
          },
          null,
          2
        )}\n`,
        "utf8"
      );

      const exitCode = await runContentPipelineCli(
        ["validate-review-provider-execution-decision", requestPath, decisionPath],
        io
      );
      const summary = JSON.parse(stdout[0] ?? "{}");

      expect(exitCode).toBe(1);
      expect(stderr).toEqual([]);
      expect(summary).toMatchObject({
        ok: false,
        command: "validate-review-provider-execution-decision"
      });
      expect(summary.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            stage: "provider_execution_decision",
            code: "missing_reviewer_id"
          }),
          expect.objectContaining({
            stage: "provider_execution_decision",
            code: "invalid_reviewed_at"
          })
        ])
      );
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("records an authorized provider execution attempt from an approved decision", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const requestPath = join(tempDir, "review-provider-execution-request.json");
    const decisionPath = join(tempDir, "review-provider-execution-decision.json");
    const attemptPath = join(tempDir, "review-provider-execution-attempt.json");
    const { stdout, stderr, io } = createMemoryIo();

    try {
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
              rerun_from: "assessment_designer"
            },
            gating_requirements: {
              requires_explicit_human_approval: true,
              requires_budget_policy_check: true,
              requires_real_provider_credentials: true
            },
            decision_boundary: {
              requires_provider_execution: true,
              requires_human_decision: true,
              provider_execution_allowed_without_human: false
            }
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
            budget_reference: "budget-policy-2026-04-24"
          },
          null,
          2
        )}\n`,
        "utf8"
      );

      const exitCode = await runContentPipelineCli(
        [
          "record-review-provider-execution-attempt",
          requestPath,
          decisionPath,
          "--recorded-by",
          "automation_worker_001",
          "--recorded-at",
          "2026-04-24T00:10:00.000Z",
          "--attempt-notes",
          "Prepared but not yet executed.",
          "--out",
          attemptPath
        ],
        io
      );
      const summary = JSON.parse(stdout[0] ?? "{}");
      const attempt = JSON.parse(await readFile(attemptPath, "utf8"));

      expect(exitCode).toBe(0);
      expect(stderr).toEqual([]);
      expect(summary).toMatchObject({
        ok: true,
        command: "record-review-provider-execution-attempt",
        unit_id: "math_g8_linear_function_intro",
        attempt_status: "authorized_pending_execution",
        requested_start_role: "assessment_designer",
        output_path: attemptPath
      });
      expect(attempt).toMatchObject({
        schema_version: "content-pipeline-review-provider-execution-attempt/v0.1",
        execution_mode: "real_provider_review_rerun",
        attempt_status: "authorized_pending_execution",
        provider_execution_allowed: true,
        recorded_by: "automation_worker_001"
      });
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("fails provider execution attempt validation when source decision is not executable", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const requestPath = join(tempDir, "review-provider-execution-request.json");
    const decisionPath = join(tempDir, "review-provider-execution-decision.json");
    const attemptPath = join(tempDir, "review-provider-execution-attempt.json");
    const { stdout, stderr, io } = createMemoryIo();

    try {
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
              rerun_from: "assessment_designer"
            },
            gating_requirements: {
              requires_explicit_human_approval: true,
              requires_budget_policy_check: true,
              requires_real_provider_credentials: true
            },
            decision_boundary: {
              requires_provider_execution: true,
              requires_human_decision: true,
              provider_execution_allowed_without_human: false
            }
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
            decision_status: "rejected",
            execution_permission: "denied",
            reviewer_id: "ops_lead_001",
            reviewed_at: "2026-04-24T00:05:00.000Z",
            budget_check_status: "failed"
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
              rerun_from: "assessment_designer"
            },
            approved_by: "ops_lead_001",
            approved_at: "2026-04-24T00:05:00.000Z",
            budget_check_status: "passed",
            recorded_by: "automation_worker_001",
            recorded_at: "2026-04-24T00:10:00.000Z"
          },
          null,
          2
        )}\n`,
        "utf8"
      );

      const exitCode = await runContentPipelineCli(
        ["validate-review-provider-execution-attempt", requestPath, decisionPath, attemptPath],
        io
      );
      const summary = JSON.parse(stdout[0] ?? "{}");

      expect(exitCode).toBe(1);
      expect(stderr).toEqual([]);
      expect(summary).toMatchObject({
        ok: false,
        command: "validate-review-provider-execution-attempt"
      });
      expect(summary.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            stage: "provider_execution_attempt_source",
            code: "decision_not_approved"
          })
        ])
      );
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("records an artifact-backed provider execution receipt from an authorized attempt", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const requestPath = join(tempDir, "review-provider-execution-request.json");
    const decisionPath = join(tempDir, "review-provider-execution-decision.json");
    const attemptPath = join(tempDir, "review-provider-execution-attempt.json");
    const receiptPath = join(tempDir, "review-provider-execution-receipt.json");
    const { stdout, stderr, io } = createMemoryIo();

    try {
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
              rerun_from: "assessment_designer"
            },
            gating_requirements: {
              requires_explicit_human_approval: true,
              requires_budget_policy_check: true,
              requires_real_provider_credentials: true
            },
            decision_boundary: {
              requires_provider_execution: true,
              requires_human_decision: true,
              provider_execution_allowed_without_human: false
            }
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
            budget_check_status: "passed"
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
              rerun_from: "assessment_designer"
            },
            approved_by: "ops_lead_001",
            approved_at: "2026-04-24T00:05:00.000Z",
            budget_check_status: "passed",
            recorded_by: "automation_worker_001",
            recorded_at: "2026-04-24T00:10:00.000Z"
          },
          null,
          2
        )}\n`,
        "utf8"
      );

      const exitCode = await runContentPipelineCli(
        [
          "record-review-provider-execution-receipt",
          requestPath,
          decisionPath,
          attemptPath,
          "--executed-by",
          "review_runner_001",
          "--receipt-status",
          "artifact_recorded",
          "--actual-provider-call-count",
          "2",
          "--result-artifact-generated-at",
          "2026-04-24T00:20:30.000Z",
          "--result-artifact-status",
          "blocked",
          "--out",
          receiptPath
        ],
        io
      );
      const summary = JSON.parse(stdout[0] ?? "{}");
      const receipt = JSON.parse(await readFile(receiptPath, "utf8"));

      expect(exitCode).toBe(0);
      expect(stderr).toEqual([]);
      expect(summary).toMatchObject({
        ok: true,
        command: "record-review-provider-execution-receipt",
        unit_id: "math_g8_linear_function_intro",
        receipt_status: "artifact_recorded",
        actual_provider_call_count: 2,
        output_path: receiptPath
      });
      expect(receipt).toMatchObject({
        schema_version: "content-pipeline-review-provider-execution-receipt/v0.1",
        receipt_status: "artifact_recorded",
        result_artifact_schema_version: "content-pipeline-review-artifact/v0.1",
        result_artifact_status: "blocked"
      });
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("fails provider execution receipt validation when artifact/failure fields conflict", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const requestPath = join(tempDir, "review-provider-execution-request.json");
    const decisionPath = join(tempDir, "review-provider-execution-decision.json");
    const attemptPath = join(tempDir, "review-provider-execution-attempt.json");
    const receiptPath = join(tempDir, "review-provider-execution-receipt.json");
    const { stdout, stderr, io } = createMemoryIo();

    try {
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
              rerun_from: "assessment_designer"
            },
            gating_requirements: {
              requires_explicit_human_approval: true,
              requires_budget_policy_check: true,
              requires_real_provider_credentials: true
            },
            decision_boundary: {
              requires_provider_execution: true,
              requires_human_decision: true,
              provider_execution_allowed_without_human: false
            }
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
            budget_check_status: "passed"
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
              rerun_from: "assessment_designer"
            },
            approved_by: "ops_lead_001",
            approved_at: "2026-04-24T00:05:00.000Z",
            budget_check_status: "passed",
            recorded_by: "automation_worker_001",
            recorded_at: "2026-04-24T00:10:00.000Z"
          },
          null,
          2
        )}\n`,
        "utf8"
      );
      await writeFile(
        receiptPath,
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
            receipt_status: "artifact_recorded",
            executed_by: "review_runner_001",
            executed_at: "2026-04-24T00:20:00.000Z",
            actual_provider_call_count: 2,
            result_artifact_schema_version: "content-pipeline-review-artifact/v0.1",
            result_artifact_generated_at: "2026-04-24T00:20:30.000Z",
            result_artifact_status: "ready_for_human_review",
            failure_code: "should_not_be_here"
          },
          null,
          2
        )}\n`,
        "utf8"
      );

      const exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-receipt",
          requestPath,
          decisionPath,
          attemptPath,
          receiptPath
        ],
        io
      );
      const summary = JSON.parse(stdout[0] ?? "{}");

      expect(exitCode).toBe(1);
      expect(stderr).toEqual([]);
      expect(summary).toMatchObject({
        ok: false,
        command: "validate-review-provider-execution-receipt"
      });
      expect(summary.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            stage: "provider_execution_receipt",
            code: "artifact_result_contract_mismatch"
          })
        ])
      );
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("renders a provider execution reconciliation from a trusted execution receipt", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const requestPath = join(tempDir, "review-provider-execution-request.json");
    const decisionPath = join(tempDir, "review-provider-execution-decision.json");
    const attemptPath = join(tempDir, "review-provider-execution-attempt.json");
    const receiptPath = join(tempDir, "review-provider-execution-receipt.json");
    const reconciliationPath = join(
      tempDir,
      "review-provider-execution-reconciliation.json"
    );
    const { stdout, stderr, io } = createMemoryIo();

    try {
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
              rerun_from: "assessment_designer"
            },
            gating_requirements: {
              requires_explicit_human_approval: true,
              requires_budget_policy_check: true,
              requires_real_provider_credentials: true
            },
            decision_boundary: {
              requires_provider_execution: true,
              requires_human_decision: true,
              provider_execution_allowed_without_human: false
            }
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
            budget_check_status: "passed"
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
              rerun_from: "assessment_designer"
            },
            approved_by: "ops_lead_001",
            approved_at: "2026-04-24T00:05:00.000Z",
            budget_check_status: "passed",
            recorded_by: "automation_worker_001",
            recorded_at: "2026-04-24T00:10:00.000Z"
          },
          null,
          2
        )}\n`,
        "utf8"
      );
      await writeFile(
        receiptPath,
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
            receipt_status: "artifact_recorded",
            executed_by: "review_runner_001",
            executed_at: "2026-04-24T00:20:00.000Z",
            actual_provider_call_count: 2,
            result_artifact_schema_version: "content-pipeline-review-artifact/v0.1",
            result_artifact_generated_at: "2026-04-24T00:20:30.000Z",
            result_artifact_status: "blocked"
          },
          null,
          2
        )}\n`,
        "utf8"
      );

      const exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-reconciliation",
          requestPath,
          decisionPath,
          attemptPath,
          receiptPath,
          "--out",
          reconciliationPath
        ],
        io
      );
      const summary = JSON.parse(stdout[0] ?? "{}");
      const reconciliation = JSON.parse(await readFile(reconciliationPath, "utf8"));

      expect(exitCode).toBe(0);
      expect(stderr).toEqual([]);
      expect(summary).toMatchObject({
        ok: true,
        command: "render-review-provider-execution-reconciliation",
        reconciliation_status: "closed",
        recommended_follow_up: "review_result_artifact",
        execution_outcome: "artifact_recorded",
        output_path: reconciliationPath
      });
      expect(reconciliation).toMatchObject({
        schema_version: "content-pipeline-review-provider-execution-reconciliation/v0.1",
        reconciliation_status: "closed",
        recommended_follow_up: "review_result_artifact",
        execution_outcome: "artifact_recorded",
        result_artifact_available: true,
        result_artifact_status: "blocked",
        actual_provider_call_count: 2
      });
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("fails provider execution reconciliation validation when the result summary is tampered", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const requestPath = join(tempDir, "review-provider-execution-request.json");
    const decisionPath = join(tempDir, "review-provider-execution-decision.json");
    const attemptPath = join(tempDir, "review-provider-execution-attempt.json");
    const receiptPath = join(tempDir, "review-provider-execution-receipt.json");
    const reconciliationPath = join(
      tempDir,
      "review-provider-execution-reconciliation.json"
    );
    const { stdout, stderr, io } = createMemoryIo();

    try {
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
              rerun_from: "assessment_designer"
            },
            gating_requirements: {
              requires_explicit_human_approval: true,
              requires_budget_policy_check: true,
              requires_real_provider_credentials: true
            },
            decision_boundary: {
              requires_provider_execution: true,
              requires_human_decision: true,
              provider_execution_allowed_without_human: false
            }
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
            budget_check_status: "passed"
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
              rerun_from: "assessment_designer"
            },
            approved_by: "ops_lead_001",
            approved_at: "2026-04-24T00:05:00.000Z",
            budget_check_status: "passed",
            recorded_by: "automation_worker_001",
            recorded_at: "2026-04-24T00:10:00.000Z"
          },
          null,
          2
        )}\n`,
        "utf8"
      );
      await writeFile(
        receiptPath,
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
            receipt_status: "artifact_recorded",
            executed_by: "review_runner_001",
            executed_at: "2026-04-24T00:20:00.000Z",
            actual_provider_call_count: 2,
            result_artifact_schema_version: "content-pipeline-review-artifact/v0.1",
            result_artifact_generated_at: "2026-04-24T00:20:30.000Z",
            result_artifact_status: "ready_for_human_review"
          },
          null,
          2
        )}\n`,
        "utf8"
      );
      await writeFile(
        reconciliationPath,
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
            execution_outcome: "artifact_recorded",
            result_artifact_available: false,
            result_artifact_generated_at: "2026-04-24T00:20:30.000Z",
            result_artifact_status: "ready_for_human_review",
            actual_provider_call_count: 2,
            executed_by: "review_runner_001",
            executed_at: "2026-04-24T00:20:00.000Z",
            failure_code: null
          },
          null,
          2
        )}\n`,
        "utf8"
      );

      const exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-reconciliation",
          requestPath,
          decisionPath,
          attemptPath,
          receiptPath,
          reconciliationPath
        ],
        io
      );
      const summary = JSON.parse(stdout[0] ?? "{}");

      expect(exitCode).toBe(1);
      expect(stderr).toEqual([]);
      expect(summary).toMatchObject({
        ok: false,
        command: "validate-review-provider-execution-reconciliation"
      });
      expect(summary.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: "reconciliation_status_mismatch"
          }),
          expect.objectContaining({
            code: "recommended_follow_up_mismatch"
          }),
          expect.objectContaining({
            code: "result_artifact_state_mismatch"
          })
        ])
      );
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("renders a provider execution follow-up from a trusted reconciliation", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const requestPath = join(tempDir, "review-provider-execution-request.json");
    const decisionPath = join(tempDir, "review-provider-execution-decision.json");
    const attemptPath = join(tempDir, "review-provider-execution-attempt.json");
    const receiptPath = join(tempDir, "review-provider-execution-receipt.json");
    const reconciliationPath = join(
      tempDir,
      "review-provider-execution-reconciliation.json"
    );
    const followUpPath = join(tempDir, "review-provider-execution-follow-up.json");
    const { stdout, stderr, io } = createMemoryIo();

    try {
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
              rerun_from: "assessment_designer"
            },
            gating_requirements: {
              requires_explicit_human_approval: true,
              requires_budget_policy_check: true,
              requires_real_provider_credentials: true
            },
            decision_boundary: {
              requires_provider_execution: true,
              requires_human_decision: true,
              provider_execution_allowed_without_human: false
            }
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
            budget_check_status: "passed"
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
              rerun_from: "assessment_designer"
            },
            approved_by: "ops_lead_001",
            approved_at: "2026-04-24T00:05:00.000Z",
            budget_check_status: "passed",
            recorded_by: "automation_worker_001",
            recorded_at: "2026-04-24T00:10:00.000Z"
          },
          null,
          2
        )}\n`,
        "utf8"
      );
      await writeFile(
        receiptPath,
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
            receipt_status: "artifact_recorded",
            executed_by: "review_runner_001",
            executed_at: "2026-04-24T00:20:00.000Z",
            actual_provider_call_count: 2,
            result_artifact_schema_version: "content-pipeline-review-artifact/v0.1",
            result_artifact_generated_at: "2026-04-24T00:20:30.000Z",
            result_artifact_status: "ready_for_human_review"
          },
          null,
          2
        )}\n`,
        "utf8"
      );
      await writeFile(
        reconciliationPath,
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
            reconciliation_status: "closed",
            recommended_follow_up: "review_result_artifact",
            execution_outcome: "artifact_recorded",
            result_artifact_available: true,
            result_artifact_generated_at: "2026-04-24T00:20:30.000Z",
            result_artifact_status: "ready_for_human_review",
            actual_provider_call_count: 2,
            executed_by: "review_runner_001",
            executed_at: "2026-04-24T00:20:00.000Z",
            failure_code: null
          },
          null,
          2
        )}\n`,
        "utf8"
      );

      const exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up",
          requestPath,
          decisionPath,
          attemptPath,
          receiptPath,
          reconciliationPath,
          "--out",
          followUpPath
        ],
        io
      );
      const summary = JSON.parse(stdout[0] ?? "{}");
      const followUp = JSON.parse(await readFile(followUpPath, "utf8"));

      expect(exitCode).toBe(0);
      expect(stderr).toEqual([]);
      expect(summary).toMatchObject({
        ok: true,
        command: "render-review-provider-execution-follow-up",
        follow_up_state: "result_artifact_review_required",
        follow_up_action: "defer_to_result_artifact_contract",
        provider_execution_chain_closed: true,
        output_path: followUpPath
      });
      expect(followUp).toMatchObject({
        schema_version: "content-pipeline-review-provider-execution-follow-up/v0.1",
        automation_step: "none",
        result_artifact_handoff: {
          expected_schema_version: "content-pipeline-review-artifact/v0.1",
          generated_at: "2026-04-24T00:20:30.000Z",
          status: "ready_for_human_review"
        },
        follow_up_item: null
      });
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("fails provider execution follow-up validation when the routed action is tampered", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const requestPath = join(tempDir, "review-provider-execution-request.json");
    const decisionPath = join(tempDir, "review-provider-execution-decision.json");
    const attemptPath = join(tempDir, "review-provider-execution-attempt.json");
    const receiptPath = join(tempDir, "review-provider-execution-receipt.json");
    const reconciliationPath = join(
      tempDir,
      "review-provider-execution-reconciliation.json"
    );
    const followUpPath = join(tempDir, "review-provider-execution-follow-up.json");
    const { stdout, stderr, io } = createMemoryIo();

    try {
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
              rerun_from: "assessment_designer"
            },
            gating_requirements: {
              requires_explicit_human_approval: true,
              requires_budget_policy_check: true,
              requires_real_provider_credentials: true
            },
            decision_boundary: {
              requires_provider_execution: true,
              requires_human_decision: true,
              provider_execution_allowed_without_human: false
            }
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
            budget_check_status: "passed"
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
              rerun_from: "assessment_designer"
            },
            approved_by: "ops_lead_001",
            approved_at: "2026-04-24T00:05:00.000Z",
            budget_check_status: "passed",
            recorded_by: "automation_worker_001",
            recorded_at: "2026-04-24T00:10:00.000Z"
          },
          null,
          2
        )}\n`,
        "utf8"
      );
      await writeFile(
        receiptPath,
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
            failure_code: "provider_timeout"
          },
          null,
          2
        )}\n`,
        "utf8"
      );
      await writeFile(
        reconciliationPath,
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
            failure_code: "provider_timeout"
          },
          null,
          2
        )}\n`,
        "utf8"
      );
      await writeFile(
        followUpPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-provider-execution-follow-up/v0.1",
            source_request_schema_version: "content-pipeline-review-provider-execution-request/v0.1",
            source_decision_schema_version: "content-pipeline-review-provider-execution-decision/v0.1",
            source_attempt_schema_version: "content-pipeline-review-provider-execution-attempt/v0.1",
            source_receipt_schema_version: "content-pipeline-review-provider-execution-receipt/v0.1",
            source_reconciliation_schema_version: "content-pipeline-review-provider-execution-reconciliation/v0.1",
            request_key:
              "content-pipeline:provider-execution-request:run_scoped_review_rerun:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            chain_key:
              "content-pipeline:provider-execution-chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            attempt_key:
              "content-pipeline:provider-execution-attempt:run_scoped_review_rerun:math_g8_linear_function_intro:2026-04-24T00:10:00.000Z",
            unit_id: "math_g8_linear_function_intro",
            source_reconciliation_status: "action_required",
            source_recommended_follow_up: "manual_execution_triage",
            source_execution_outcome: "execution_failed",
            follow_up_state: "execution_triage_required",
            follow_up_action: "open_manual_execution_triage_item",
            provider_execution_chain_closed: false,
            result_artifact_handoff: null,
            automation_step: "none",
            decision_boundary: {
              requires_provider_execution: false,
              requires_human_decision: true,
              provider_execution_allowed_without_human: false
            },
            follow_up_item: {
              item_key:
                "content-pipeline:manual_triage_queue:math_g8_linear_function_intro:provider-execution:content-pipeline:provider-execution-attempt:run_scoped_review_rerun:math_g8_linear_function_intro:2026-04-24T00:10:00.000Z",
              human_queue: "manual_triage_queue",
              title: "[Provider Execution Triage] math_g8_linear_function_intro",
              summary:
                "Authorized provider rerun for attempt content-pipeline:provider-execution-attempt:run_scoped_review_rerun:math_g8_linear_function_intro:2026-04-24T00:10:00.000Z failed with provider_timeout after 1 provider calls. Manual execution triage is required before any next rerun or artifact routing.",
              primary_human_action: "perform_manual_triage",
              automation_step: "open_inbox_item",
              labels: [
                "content_pipeline_review",
                "provider_execution_follow_up",
                "queue:manual_triage_queue",
                "follow_up_state:execution_triage_required",
                "execution_outcome:execution_failed",
                "failure_code:provider_timeout"
              ]
            }
          },
          null,
          2
        )}\n`,
        "utf8"
      );

      const exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up",
          requestPath,
          decisionPath,
          attemptPath,
          receiptPath,
          reconciliationPath,
          followUpPath
        ],
        io
      );
      const summary = JSON.parse(stdout[0] ?? "{}");

      expect(exitCode).toBe(1);
      expect(stderr).toEqual([]);
      expect(summary).toMatchObject({
        ok: false,
        command: "validate-review-provider-execution-follow-up"
      });
      expect(summary.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: "automation_step_mismatch"
          })
        ])
      );
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("renders a provider execution follow-up delivery plan from a trusted follow-up contract", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const requestPath = join(tempDir, "review-provider-execution-request.json");
    const decisionPath = join(tempDir, "review-provider-execution-decision.json");
    const attemptPath = join(tempDir, "review-provider-execution-attempt.json");
    const receiptPath = join(tempDir, "review-provider-execution-receipt.json");
    const reconciliationPath = join(
      tempDir,
      "review-provider-execution-reconciliation.json"
    );
    const followUpPath = join(tempDir, "review-provider-execution-follow-up.json");
    const planPath = join(tempDir, "review-provider-execution-follow-up-plan.json");
    const { stdout, stderr, io } = createMemoryIo();

    try {
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
              rerun_from: "assessment_designer"
            },
            gating_requirements: {
              requires_explicit_human_approval: true,
              requires_budget_policy_check: true,
              requires_real_provider_credentials: true
            },
            decision_boundary: {
              requires_provider_execution: true,
              requires_human_decision: true,
              provider_execution_allowed_without_human: false
            }
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
            budget_check_status: "passed"
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
              rerun_from: "assessment_designer"
            },
            approved_by: "ops_lead_001",
            approved_at: "2026-04-24T00:05:00.000Z",
            budget_check_status: "passed",
            recorded_by: "automation_worker_001",
            recorded_at: "2026-04-24T00:10:00.000Z"
          },
          null,
          2
        )}\n`,
        "utf8"
      );
      await writeFile(
        receiptPath,
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
            failure_code: "provider_timeout"
          },
          null,
          2
        )}\n`,
        "utf8"
      );
      await writeFile(
        reconciliationPath,
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
            failure_code: "provider_timeout"
          },
          null,
          2
        )}\n`,
        "utf8"
      );

      const renderFollowUpExitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up",
          requestPath,
          decisionPath,
          attemptPath,
          receiptPath,
          reconciliationPath,
          "--out",
          followUpPath
        ],
        io
      );
      expect(renderFollowUpExitCode).toBe(0);

      stdout.length = 0;

      const exitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-plan",
          requestPath,
          decisionPath,
          attemptPath,
          receiptPath,
          reconciliationPath,
          followUpPath,
          "--out",
          planPath
        ],
        io
      );
      const summary = JSON.parse(stdout[0] ?? "{}");
      const plan = JSON.parse(await readFile(planPath, "utf8"));

      expect(exitCode).toBe(0);
      expect(stderr).toEqual([]);
      expect(summary).toMatchObject({
        ok: true,
        command: "render-review-provider-execution-follow-up-plan",
        delivery_action: "create_follow_up_inbox_item",
        output_path: planPath
      });
      expect(plan).toMatchObject({
        schema_version: "content-pipeline-review-provider-execution-follow-up-plan/v0.1",
        follow_up_state: "execution_triage_required",
        follow_up_action: "open_manual_execution_triage_item",
        final_follow_up_queue: "manual_triage_queue",
        upsert: {
          human_queue: "manual_triage_queue",
          title: "[Provider Execution Triage] math_g8_linear_function_intro"
        }
      });
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("fails provider execution follow-up plan validation when the final follow-up target is tampered", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const requestPath = join(tempDir, "review-provider-execution-request.json");
    const decisionPath = join(tempDir, "review-provider-execution-decision.json");
    const attemptPath = join(tempDir, "review-provider-execution-attempt.json");
    const receiptPath = join(tempDir, "review-provider-execution-receipt.json");
    const reconciliationPath = join(
      tempDir,
      "review-provider-execution-reconciliation.json"
    );
    const followUpPath = join(tempDir, "review-provider-execution-follow-up.json");
    const planPath = join(tempDir, "review-provider-execution-follow-up-plan.json");
    const { stdout, stderr, io } = createMemoryIo();

    try {
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
              rerun_from: "assessment_designer"
            },
            gating_requirements: {
              requires_explicit_human_approval: true,
              requires_budget_policy_check: true,
              requires_real_provider_credentials: true
            },
            decision_boundary: {
              requires_provider_execution: true,
              requires_human_decision: true,
              provider_execution_allowed_without_human: false
            }
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
            budget_check_status: "passed"
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
              rerun_from: "assessment_designer"
            },
            approved_by: "ops_lead_001",
            approved_at: "2026-04-24T00:05:00.000Z",
            budget_check_status: "passed",
            recorded_by: "automation_worker_001",
            recorded_at: "2026-04-24T00:10:00.000Z"
          },
          null,
          2
        )}\n`,
        "utf8"
      );
      await writeFile(
        receiptPath,
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
            failure_code: "provider_timeout"
          },
          null,
          2
        )}\n`,
        "utf8"
      );
      await writeFile(
        reconciliationPath,
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
            failure_code: "provider_timeout"
          },
          null,
          2
        )}\n`,
        "utf8"
      );

      const renderFollowUpExitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up",
          requestPath,
          decisionPath,
          attemptPath,
          receiptPath,
          reconciliationPath,
          "--out",
          followUpPath
        ],
        io
      );
      expect(renderFollowUpExitCode).toBe(0);

      const renderPlanExitCode = await runContentPipelineCli(
        [
          "render-review-provider-execution-follow-up-plan",
          requestPath,
          decisionPath,
          attemptPath,
          receiptPath,
          reconciliationPath,
          followUpPath,
          "--out",
          planPath
        ],
        io
      );
      expect(renderPlanExitCode).toBe(0);

      const plan = JSON.parse(await readFile(planPath, "utf8"));
      plan.final_follow_up_item_key = "wrong-item-key";
      await writeFile(planPath, `${JSON.stringify(plan, null, 2)}\n`, "utf8");
      stdout.length = 0;

      const exitCode = await runContentPipelineCli(
        [
          "validate-review-provider-execution-follow-up-plan",
          requestPath,
          decisionPath,
          attemptPath,
          receiptPath,
          reconciliationPath,
          followUpPath,
          planPath
        ],
        io
      );
      const summary = JSON.parse(stdout[0] ?? "{}");

      expect(exitCode).toBe(1);
      expect(stderr).toEqual([]);
      expect(summary).toMatchObject({
        ok: false,
        command: "validate-review-provider-execution-follow-up-plan"
      });
      expect(summary.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: "final_follow_up_state_mismatch"
          })
        ])
      );
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("renders a stable inbox handoff from a review artifact", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const artifactPath = join(tempDir, "review-artifact.json");
    const handoffPath = join(tempDir, "review-inbox-item.json");
    const { stdout, stderr, io } = createMemoryIo();

    try {
      await writeFile(
        artifactPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-artifact/v0.1",
            mode: "llm_review_no_writeback",
            generated_at: "2026-04-23T18:00:00.000Z",
            unit_id: "math_g8_linear_function_intro",
            status: "blocked",
            writeback_performed: false,
            repair_plan: {
              source: "invocation_failure",
              recommended_rerun_from: "qa_agent",
              recommended_rerun_roles: ["qa_agent"],
              recommendations: [
                {
                  trigger: "model_unavailable at qa_agent",
                  root_owner: "qa_agent",
                  impacted_owner: "qa_agent",
                  rerun_from: "qa_agent",
                  rerun_roles: ["qa_agent"],
                  reason: "Provider failed during qa_agent."
                }
              ]
            },
            retry_policy: {
              decision: "allow_scoped_rerun",
              reason: "First blocked artifact for this scope.",
              recommended_rerun_from: "qa_agent",
              recommended_rerun_roles: ["qa_agent"]
            },
            rerun_context: {
              source_artifact_generated_at: "2026-04-23T17:45:00.000Z",
              source_artifact_status: "blocked",
              start_from_role: "qa_agent",
              inherited_roles: [
                "subject_expert",
                "pedagogy_designer",
                "narrative_designer",
                "engineering_agent",
                "assessment_designer"
              ],
              rerun_chain_depth: 1,
              rerun_root_artifact_generated_at: "2026-04-23T17:45:00.000Z",
              source_retry_decision: "allow_scoped_rerun",
              source_recommended_rerun_from: "qa_agent"
            },
            workflow_runs: [],
            invocation_logs: [],
            candidate_patches: []
          },
          null,
          2
        )}\n`,
        "utf8"
      );

      const exitCode = await runContentPipelineCli(["render-review-inbox-item", artifactPath, "--out", handoffPath], io);
      const handoff = JSON.parse(await readFile(handoffPath, "utf8"));

      expect(exitCode).toBe(0);
      expect(stderr).toEqual([]);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        command: "render-review-inbox-item",
        unit_id: "math_g8_linear_function_intro",
        human_queue: "rerun_decision_queue",
        primary_human_action: "decide_scoped_rerun",
        delivery_action: "replace_predecessor_inbox_item",
        predecessor_item_key:
          "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T17:45:00.000Z",
        output_path: handoffPath
      });
      expect(handoff).toMatchObject({
        schema_version: "content-pipeline-review-inbox-item/v0.1",
        chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T17:45:00.000Z",
        predecessor_item_key:
          "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T17:45:00.000Z",
        delivery_action: "replace_predecessor_inbox_item",
        human_queue: "rerun_decision_queue",
        title: "[Rerun Decision] math_g8_linear_function_intro",
        primary_human_action: "decide_scoped_rerun",
        metadata: {
          orchestration_action: "prepare_scoped_rerun",
          recommended_rerun_from: "qa_agent",
          retry_decision: "allow_scoped_rerun",
          repair_plan_source: "invocation_failure"
        }
      });
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("renders an executor-ready inbox delivery plan from a review artifact", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const artifactPath = join(tempDir, "review-artifact.json");
    const deliveryPlanPath = join(tempDir, "review-inbox-delivery-plan.json");
    const { stdout, stderr, io } = createMemoryIo();

    try {
      await writeFile(
        artifactPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-artifact/v0.1",
            mode: "llm_review_no_writeback",
            generated_at: "2026-04-23T18:10:00.000Z",
            unit_id: "math_g8_linear_function_intro",
            status: "blocked",
            writeback_performed: false,
            repair_plan: {
              source: "invocation_failure",
              recommended_rerun_from: "qa_agent",
              recommended_rerun_roles: ["qa_agent"],
              recommendations: [
                {
                  trigger: "model_unavailable at qa_agent",
                  root_owner: "qa_agent",
                  impacted_owner: "qa_agent",
                  rerun_from: "qa_agent",
                  rerun_roles: ["qa_agent"],
                  reason: "Provider failed during qa_agent."
                }
              ]
            },
            retry_policy: {
              decision: "allow_scoped_rerun",
              reason: "First blocked artifact for this scope.",
              recommended_rerun_from: "qa_agent",
              recommended_rerun_roles: ["qa_agent"]
            },
            rerun_context: {
              source_artifact_generated_at: "2026-04-23T17:45:00.000Z",
              source_artifact_status: "blocked",
              start_from_role: "qa_agent",
              inherited_roles: [
                "subject_expert",
                "pedagogy_designer",
                "narrative_designer",
                "engineering_agent",
                "assessment_designer"
              ],
              rerun_chain_depth: 1,
              rerun_root_artifact_generated_at: "2026-04-23T17:45:00.000Z",
              source_retry_decision: "allow_scoped_rerun",
              source_recommended_rerun_from: "qa_agent"
            },
            workflow_runs: [],
            invocation_logs: [],
            candidate_patches: []
          },
          null,
          2
        )}\n`,
        "utf8"
      );

      const exitCode = await runContentPipelineCli(
        ["render-review-inbox-delivery-plan", artifactPath, "--out", deliveryPlanPath],
        io
      );
      const deliveryPlan = JSON.parse(await readFile(deliveryPlanPath, "utf8"));

      expect(exitCode).toBe(0);
      expect(stderr).toEqual([]);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        command: "render-review-inbox-delivery-plan",
        unit_id: "math_g8_linear_function_intro",
        delivery_action: "replace_predecessor_inbox_item",
        upsert_operation_key:
          "content-pipeline:delivery:upsert:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
        close_count: 1,
        final_active_item_key:
          "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
        output_path: deliveryPlanPath
      });
      expect(deliveryPlan).toMatchObject({
        schema_version: "content-pipeline-review-inbox-delivery-plan/v0.2",
        delivery_action: "replace_predecessor_inbox_item",
        upsert: {
          operation_key:
            "content-pipeline:delivery:upsert:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z"
        },
        final_active_queue: "rerun_decision_queue",
        close: [
          {
            operation_key:
              "content-pipeline:delivery:close:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T17:45:00.000Z:superseded_by:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
            item_key:
              "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T17:45:00.000Z",
            reason: "superseded_by_new_artifact"
          }
        ]
      });
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("validates an inbox delivery plan file and returns non-zero for invalid plans", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const planPath = join(tempDir, "review-inbox-delivery-plan.json");
    const { stdout, stderr, io } = createMemoryIo();

    try {
      await writeFile(
        planPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-inbox-delivery-plan/v0.2",
            chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            source_item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            delivery_action: "create_inbox_item",
            final_active_item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            final_active_queue: "approval_queue",
            upsert: {
              operation_key:
                "content-pipeline:delivery:upsert:content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
              item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
              human_queue: "approval_queue",
              title: "[Approval] math_g8_linear_function_intro",
              summary: "Ready for approval.",
              primary_human_action: "approve_review_artifact",
              automation_step: "open_inbox_item",
              labels: ["content_pipeline_review"]
            },
            close: [
              {
                operation_key:
                  "content-pipeline:delivery:close:content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T17:45:00.000Z:superseded_by:content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
                item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T17:45:00.000Z",
                reason: "superseded_by_new_artifact"
              }
            ],
            decision_boundary: {
              requires_provider_execution: false,
              requires_human_decision: true,
              provider_execution_allowed_without_human: false
            }
          },
          null,
          2
        )}\n`,
        "utf8"
      );

      const exitCode = await runContentPipelineCli(["validate-review-inbox-delivery-plan", planPath], io);

      expect(exitCode).toBe(1);
      expect(stderr).toEqual([]);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: false,
        command: "validate-review-inbox-delivery-plan",
        issue_count: 1,
        issues: [
          {
            code: "create_plan_should_not_close_items"
          }
        ]
      });
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("renders an inbox delivery receipt from a delivery plan", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const planPath = join(tempDir, "review-inbox-delivery-plan.json");
    const receiptPath = join(tempDir, "review-inbox-delivery-receipt.json");
    const { stdout, stderr, io } = createMemoryIo();

    try {
      await writeFile(
        planPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-inbox-delivery-plan/v0.2",
            chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            source_item_key: "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
            delivery_action: "replace_predecessor_inbox_item",
            final_active_item_key:
              "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
            final_active_queue: "rerun_decision_queue",
            upsert: {
              operation_key:
                "content-pipeline:delivery:upsert:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
              item_key:
                "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
              human_queue: "rerun_decision_queue",
              title: "[Rerun Decision] math_g8_linear_function_intro",
              summary: "Blocked artifact can attempt a scoped rerun.",
              primary_human_action: "decide_scoped_rerun",
              automation_step: "open_inbox_item",
              labels: ["content_pipeline_review"]
            },
            close: [
              {
                operation_key:
                  "content-pipeline:delivery:close:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T17:45:00.000Z:superseded_by:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
                item_key:
                  "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T17:45:00.000Z",
                reason: "superseded_by_new_artifact"
              }
            ],
            decision_boundary: {
              requires_provider_execution: true,
              requires_human_decision: true,
              provider_execution_allowed_without_human: false
            }
          },
          null,
          2
        )}\n`,
        "utf8"
      );

      const exitCode = await runContentPipelineCli(
        [
          "render-review-inbox-delivery-receipt",
          planPath,
          "--out",
          receiptPath,
          "--executed-at",
          "2026-04-23T18:20:00.000Z",
          "--close-status",
          "failed"
        ],
        io
      );
      const receipt = JSON.parse(await readFile(receiptPath, "utf8"));

      expect(exitCode).toBe(0);
      expect(stderr).toEqual([]);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        command: "render-review-inbox-delivery-receipt",
        overall_status: "partially_applied",
        failed_operation_count: 1,
        output_path: receiptPath
      });
      expect(receipt).toMatchObject({
        schema_version: "content-pipeline-review-inbox-delivery-receipt/v0.1",
        overall_status: "partially_applied",
        final_active_item_key:
          "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
        operations: [
          {
            operation_type: "upsert",
            status: "applied"
          },
          {
            operation_type: "close",
            status: "failed"
          }
        ]
      });
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("validates an inbox delivery receipt against its source plan", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const planPath = join(tempDir, "review-inbox-delivery-plan.json");
    const receiptPath = join(tempDir, "review-inbox-delivery-receipt.json");
    const { stdout, stderr, io } = createMemoryIo();

    try {
      await writeFile(
        planPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-inbox-delivery-plan/v0.2",
            chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            source_item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            delivery_action: "create_inbox_item",
            final_active_item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            final_active_queue: "approval_queue",
            upsert: {
              operation_key:
                "content-pipeline:delivery:upsert:content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
              item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
              human_queue: "approval_queue",
              title: "[Approval] math_g8_linear_function_intro",
              summary: "Ready for approval.",
              primary_human_action: "approve_review_artifact",
              automation_step: "open_inbox_item",
              labels: ["content_pipeline_review"]
            },
            close: [],
            decision_boundary: {
              requires_provider_execution: false,
              requires_human_decision: true,
              provider_execution_allowed_without_human: false
            }
          },
          null,
          2
        )}\n`,
        "utf8"
      );
      await writeFile(
        receiptPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-inbox-delivery-receipt/v0.1",
            source_plan_schema_version: "content-pipeline-review-inbox-delivery-plan/v0.2",
            chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            source_item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            delivery_action: "create_inbox_item",
            executed_at: "2026-04-23T18:20:00.000Z",
            overall_status: "applied",
            final_active_item_key: null,
            final_active_queue: null,
            operations: [
              {
                operation_key:
                  "content-pipeline:delivery:upsert:content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
                operation_type: "upsert",
                target_item_key:
                  "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
                status: "applied"
              }
            ]
          },
          null,
          2
        )}\n`,
        "utf8"
      );

      const exitCode = await runContentPipelineCli(
        ["validate-review-inbox-delivery-receipt", planPath, receiptPath],
        io
      );

      expect(exitCode).toBe(1);
      expect(stderr).toEqual([]);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: false,
        command: "validate-review-inbox-delivery-receipt",
        issue_count: 1,
        issues: [
          {
            code: "final_active_state_mismatch"
          }
        ]
      });
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("renders an inbox delivery reconciliation from plan and receipt", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const planPath = join(tempDir, "review-inbox-delivery-plan.json");
    const receiptPath = join(tempDir, "review-inbox-delivery-receipt.json");
    const reconciliationPath = join(tempDir, "review-inbox-delivery-reconciliation.json");
    const { stdout, stderr, io } = createMemoryIo();

    try {
      await writeFile(
        planPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-inbox-delivery-plan/v0.2",
            chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            source_item_key: "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
            delivery_action: "replace_predecessor_inbox_item",
            final_active_item_key:
              "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
            final_active_queue: "rerun_decision_queue",
            upsert: {
              operation_key:
                "content-pipeline:delivery:upsert:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
              item_key:
                "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
              human_queue: "rerun_decision_queue",
              title: "[Rerun Decision] math_g8_linear_function_intro",
              summary: "Blocked artifact can attempt a scoped rerun.",
              primary_human_action: "decide_scoped_rerun",
              automation_step: "open_inbox_item",
              labels: ["content_pipeline_review"]
            },
            close: [
              {
                operation_key:
                  "content-pipeline:delivery:close:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T17:45:00.000Z:superseded_by:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
                item_key:
                  "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T17:45:00.000Z",
                reason: "superseded_by_new_artifact"
              }
            ],
            decision_boundary: {
              requires_provider_execution: true,
              requires_human_decision: true,
              provider_execution_allowed_without_human: false
            }
          },
          null,
          2
        )}\n`,
        "utf8"
      );
      await writeFile(
        receiptPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-inbox-delivery-receipt/v0.1",
            source_plan_schema_version: "content-pipeline-review-inbox-delivery-plan/v0.2",
            chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            source_item_key: "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
            delivery_action: "replace_predecessor_inbox_item",
            executed_at: "2026-04-23T18:20:00.000Z",
            overall_status: "partially_applied",
            final_active_item_key:
              "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
            final_active_queue: "rerun_decision_queue",
            operations: [
              {
                operation_key:
                  "content-pipeline:delivery:upsert:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
                operation_type: "upsert",
                target_item_key:
                  "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
                status: "applied"
              },
              {
                operation_key:
                  "content-pipeline:delivery:close:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T17:45:00.000Z:superseded_by:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
                operation_type: "close",
                target_item_key:
                  "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T17:45:00.000Z",
                status: "failed"
              }
            ]
          },
          null,
          2
        )}\n`,
        "utf8"
      );

      const exitCode = await runContentPipelineCli(
        ["render-review-inbox-delivery-reconciliation", planPath, receiptPath, "--out", reconciliationPath],
        io
      );
      const reconciliation = JSON.parse(await readFile(reconciliationPath, "utf8"));

      expect(exitCode).toBe(0);
      expect(stderr).toEqual([]);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: true,
        command: "render-review-inbox-delivery-reconciliation",
        reconciliation_status: "action_required",
        recommended_follow_up: "manual_cleanup_predecessor",
        unresolved_operation_count: 1,
        output_path: reconciliationPath
      });
      expect(reconciliation).toMatchObject({
        schema_version: "content-pipeline-review-inbox-delivery-reconciliation/v0.1",
        receipt_validation_ok: true,
        delivery_status: "partially_applied",
        recommended_follow_up: "manual_cleanup_predecessor"
      });
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("validates a reconciliation against its source plan and receipt", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const planPath = join(tempDir, "review-inbox-delivery-plan.json");
    const receiptPath = join(tempDir, "review-inbox-delivery-receipt.json");
    const reconciliationPath = join(tempDir, "review-inbox-delivery-reconciliation.json");
    const { stdout, stderr, io } = createMemoryIo();

    try {
      await writeFile(
        planPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-inbox-delivery-plan/v0.2",
            chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            source_item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            delivery_action: "create_inbox_item",
            final_active_item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            final_active_queue: "approval_queue",
            upsert: {
              operation_key:
                "content-pipeline:delivery:upsert:content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
              item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
              human_queue: "approval_queue",
              title: "[Approval] math_g8_linear_function_intro",
              summary: "Ready for approval.",
              primary_human_action: "approve_review_artifact",
              automation_step: "open_inbox_item",
              labels: ["content_pipeline_review"]
            },
            close: [],
            decision_boundary: {
              requires_provider_execution: false,
              requires_human_decision: true,
              provider_execution_allowed_without_human: false
            }
          },
          null,
          2
        )}\n`,
        "utf8"
      );
      await writeFile(
        receiptPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-inbox-delivery-receipt/v0.1",
            source_plan_schema_version: "content-pipeline-review-inbox-delivery-plan/v0.2",
            chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            source_item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            delivery_action: "create_inbox_item",
            executed_at: "2026-04-23T18:20:00.000Z",
            overall_status: "applied",
            final_active_item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            final_active_queue: "approval_queue",
            operations: [
              {
                operation_key:
                  "content-pipeline:delivery:upsert:content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
                operation_type: "upsert",
                target_item_key:
                  "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
                status: "applied"
              }
            ]
          },
          null,
          2
        )}\n`,
        "utf8"
      );
      await writeFile(
        reconciliationPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-inbox-delivery-reconciliation/v0.1",
            source_plan_schema_version: "content-pipeline-review-inbox-delivery-plan/v0.2",
            source_receipt_schema_version: "content-pipeline-review-inbox-delivery-receipt/v0.1",
            chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            source_item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            receipt_validation_ok: true,
            receipt_validation_issue_codes: [],
            reconciliation_status: "closed",
            recommended_follow_up: "manual_repair_delivery",
            delivery_status: "applied",
            final_active_item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            final_active_queue: "approval_queue",
            unresolved_operations: []
          },
          null,
          2
        )}\n`,
        "utf8"
      );

      const exitCode = await runContentPipelineCli(
        ["validate-review-inbox-delivery-reconciliation", planPath, receiptPath, reconciliationPath],
        io
      );

      expect(exitCode).toBe(1);
      expect(stderr).toEqual([]);
      expect(JSON.parse(stdout[0] ?? "{}")).toMatchObject({
        ok: false,
        command: "validate-review-inbox-delivery-reconciliation",
        issue_count: 1,
        issues: [
          {
            code: "recommended_follow_up_mismatch"
          }
        ]
      });
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("renders an inbox delivery follow-up contract from a plan and reconciliation", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const planPath = join(tempDir, "review-inbox-delivery-plan.json");
    const reconciliationPath = join(tempDir, "review-inbox-delivery-reconciliation.json");
    const followUpPath = join(tempDir, "review-inbox-delivery-follow-up.json");
    const { stdout, stderr, io } = createMemoryIo();

    try {
      await writeFile(
        planPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-inbox-delivery-plan/v0.2",
            chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            source_item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            delivery_action: "create_inbox_item",
            final_active_item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            final_active_queue: "approval_queue",
            upsert: {
              operation_key:
                "content-pipeline:delivery:upsert:content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
              item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
              human_queue: "approval_queue",
              title: "[Approval] math_g8_linear_function_intro",
              summary: "Ready for approval.",
              primary_human_action: "approve_review_artifact",
              automation_step: "open_inbox_item",
              labels: ["content_pipeline_review"]
            },
            close: [],
            decision_boundary: {
              requires_provider_execution: false,
              requires_human_decision: true,
              provider_execution_allowed_without_human: false
            }
          },
          null,
          2
        )}\n`,
        "utf8"
      );
      await writeFile(
        reconciliationPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-inbox-delivery-reconciliation/v0.1",
            source_plan_schema_version: "content-pipeline-review-inbox-delivery-plan/v0.2",
            source_receipt_schema_version: "content-pipeline-review-inbox-delivery-receipt/v0.1",
            chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            source_item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            receipt_validation_ok: true,
            receipt_validation_issue_codes: [],
            reconciliation_status: "closed",
            recommended_follow_up: "none",
            delivery_status: "applied",
            final_active_item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            final_active_queue: "approval_queue",
            unresolved_operations: []
          },
          null,
          2
        )}\n`,
        "utf8"
      );

      const exitCode = await runContentPipelineCli(
        ["render-review-inbox-delivery-follow-up", planPath, reconciliationPath, "--out", followUpPath],
        io
      );
      const summary = JSON.parse(stdout[0] ?? "{}");
      const followUp = JSON.parse(await readFile(followUpPath, "utf8"));

      expect(exitCode).toBe(0);
      expect(stderr).toEqual([]);
      expect(summary).toMatchObject({
        ok: true,
        command: "render-review-inbox-delivery-follow-up",
        follow_up_state: "delivery_closed",
        follow_up_action: "none",
        delivery_chain_closed: true,
        output_path: followUpPath
      });
      expect(followUp).toMatchObject({
        schema_version: "content-pipeline-review-inbox-delivery-follow-up/v0.1",
        follow_up_state: "delivery_closed",
        follow_up_action: "none",
        delivery_chain_closed: true
      });
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("validates an inbox delivery follow-up contract against its source plan and reconciliation", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const planPath = join(tempDir, "review-inbox-delivery-plan.json");
    const reconciliationPath = join(tempDir, "review-inbox-delivery-reconciliation.json");
    const followUpPath = join(tempDir, "review-inbox-delivery-follow-up.json");
    const { stdout, stderr, io } = createMemoryIo();

    try {
      await writeFile(
        planPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-inbox-delivery-plan/v0.2",
            chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
            source_item_key:
              "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
            delivery_action: "replace_predecessor_inbox_item",
            final_active_item_key:
              "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
            final_active_queue: "rerun_decision_queue",
            upsert: {
              operation_key:
                "content-pipeline:delivery:upsert:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
              item_key:
                "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
              human_queue: "rerun_decision_queue",
              title: "[Rerun Decision] math_g8_linear_function_intro",
              summary: "Blocked artifact can attempt a scoped rerun.",
              primary_human_action: "decide_scoped_rerun",
              automation_step: "open_inbox_item",
              labels: ["content_pipeline_review"]
            },
            close: [
              {
                operation_key:
                  "content-pipeline:delivery:close:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T17:45:00.000Z:superseded_by:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
                item_key:
                  "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T17:45:00.000Z",
                reason: "superseded_by_new_artifact"
              }
            ],
            decision_boundary: {
              requires_provider_execution: false,
              requires_human_decision: true,
              provider_execution_allowed_without_human: false
            }
          },
          null,
          2
        )}\n`,
        "utf8"
      );
      await writeFile(
        reconciliationPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-inbox-delivery-reconciliation/v0.1",
            source_plan_schema_version: "content-pipeline-review-inbox-delivery-plan/v0.2",
            source_receipt_schema_version: "content-pipeline-review-inbox-delivery-receipt/v0.1",
            chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
            source_item_key:
              "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
            receipt_validation_ok: true,
            receipt_validation_issue_codes: [],
            reconciliation_status: "action_required",
            recommended_follow_up: "manual_cleanup_predecessor",
            delivery_status: "partially_applied",
            final_active_item_key:
              "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
            final_active_queue: "rerun_decision_queue",
            unresolved_operations: [
              {
                operation_key:
                  "content-pipeline:delivery:close:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T17:45:00.000Z:superseded_by:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
                operation_type: "close",
                target_item_key:
                  "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T17:45:00.000Z",
                status: "failed"
              }
            ]
          },
          null,
          2
        )}\n`,
        "utf8"
      );
      await writeFile(
        followUpPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-inbox-delivery-follow-up/v0.1",
            source_plan_schema_version: "content-pipeline-review-inbox-delivery-plan/v0.2",
            source_reconciliation_schema_version: "content-pipeline-review-inbox-delivery-reconciliation/v0.1",
            chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
            source_item_key:
              "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
            source_reconciliation_status: "action_required",
            source_recommended_follow_up: "manual_cleanup_predecessor",
            follow_up_state: "cleanup_predecessor_required",
            follow_up_action: "open_manual_cleanup_follow_up_item",
            delivery_chain_closed: false,
            active_item: {
              item_key:
                "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
              human_queue: "rerun_decision_queue",
              should_remain_open: true
            },
            automation_step: "open_inbox_item",
            decision_boundary: {
              requires_provider_execution: false,
              requires_human_decision: true,
              provider_execution_allowed_without_human: false
            },
            follow_up_item: {
              item_key:
                "content-pipeline:delivery-follow-up:cleanup_predecessor_required:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
              human_queue: "manual_triage_queue",
              title: "[Delivery Cleanup] math_g8_linear_function_intro",
              summary:
                "Current active inbox item is content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z in rerun_decision_queue. The replacement delivery left a predecessor item open, so manual cleanup is required for the superseded inbox item.",
              primary_human_action: "perform_manual_triage",
              automation_step: "open_inbox_item",
              labels: [
                "content_pipeline_delivery_follow_up",
                "chain:content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
                "source_item:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
                "state:cleanup_predecessor_required",
                "action:open_manual_cleanup_follow_up_item",
                "active_queue:rerun_decision_queue"
              ]
            }
          },
          null,
          2
        )}\n`,
        "utf8"
      );

      const exitCode = await runContentPipelineCli(
        ["validate-review-inbox-delivery-follow-up", planPath, reconciliationPath, followUpPath],
        io
      );
      const summary = JSON.parse(stdout[0] ?? "{}");

      expect(exitCode).toBe(0);
      expect(stderr).toEqual([]);
      expect(summary).toMatchObject({
        ok: true,
        command: "validate-review-inbox-delivery-follow-up",
        issue_count: 0
      });
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("refuses to render an inbox delivery follow-up contract from an invalid reconciliation", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const planPath = join(tempDir, "review-inbox-delivery-plan.json");
    const reconciliationPath = join(tempDir, "review-inbox-delivery-reconciliation.json");
    const followUpPath = join(tempDir, "review-inbox-delivery-follow-up.json");
    const { stdout, stderr, io } = createMemoryIo();

    try {
      await writeFile(
        planPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-inbox-delivery-plan/v0.2",
            chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            source_item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            delivery_action: "create_inbox_item",
            final_active_item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            final_active_queue: "approval_queue",
            upsert: {
              operation_key:
                "content-pipeline:delivery:upsert:content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
              item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
              human_queue: "approval_queue",
              title: "[Approval] math_g8_linear_function_intro",
              summary: "Ready for approval.",
              primary_human_action: "approve_review_artifact",
              automation_step: "open_inbox_item",
              labels: ["content_pipeline_review"]
            },
            close: [],
            decision_boundary: {
              requires_provider_execution: false,
              requires_human_decision: true,
              provider_execution_allowed_without_human: false
            }
          },
          null,
          2
        )}\n`,
        "utf8"
      );
      await writeFile(
        reconciliationPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-inbox-delivery-reconciliation/v0.1",
            source_plan_schema_version: "content-pipeline-review-inbox-delivery-plan/v0.2",
            source_receipt_schema_version: "content-pipeline-review-inbox-delivery-receipt/v0.1",
            chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            source_item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            receipt_validation_ok: true,
            receipt_validation_issue_codes: [],
            reconciliation_status: "closed",
            recommended_follow_up: "manual_repair_delivery",
            delivery_status: "applied",
            final_active_item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            final_active_queue: "approval_queue",
            unresolved_operations: []
          },
          null,
          2
        )}\n`,
        "utf8"
      );

      const exitCode = await runContentPipelineCli(
        ["render-review-inbox-delivery-follow-up", planPath, reconciliationPath, "--out", followUpPath],
        io
      );

      expect(exitCode).toBe(1);
      expect(stdout).toEqual([]);
      expect(stderr.join("\n")).toContain("Cannot render inbox delivery follow-up from an invalid reconciliation contract.");
      expect(stderr.join("\n")).toContain("recommended_follow_up_mismatch");
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("renders an executor-ready follow-up delivery plan from a follow-up contract", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const followUpPath = join(tempDir, "review-inbox-delivery-follow-up.json");
    const followUpPlanPath = join(tempDir, "review-inbox-delivery-follow-up-plan.json");
    const { stdout, stderr, io } = createMemoryIo();

    try {
      await writeFile(
        followUpPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-inbox-delivery-follow-up/v0.1",
            source_plan_schema_version: "content-pipeline-review-inbox-delivery-plan/v0.2",
            source_reconciliation_schema_version: "content-pipeline-review-inbox-delivery-reconciliation/v0.1",
            chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
            source_item_key:
              "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
            source_reconciliation_status: "action_required",
            source_recommended_follow_up: "manual_cleanup_predecessor",
            follow_up_state: "cleanup_predecessor_required",
            follow_up_action: "open_manual_cleanup_follow_up_item",
            delivery_chain_closed: false,
            active_item: {
              item_key:
                "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
              human_queue: "rerun_decision_queue",
              should_remain_open: true
            },
            automation_step: "open_inbox_item",
            decision_boundary: {
              requires_provider_execution: false,
              requires_human_decision: true,
              provider_execution_allowed_without_human: false
            },
            follow_up_item: {
              item_key:
                "content-pipeline:delivery-follow-up:cleanup_predecessor_required:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
              human_queue: "manual_triage_queue",
              title: "[Delivery Cleanup] math_g8_linear_function_intro",
              summary:
                "Current active inbox item is content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z in rerun_decision_queue. The replacement delivery left a predecessor item open, so manual cleanup is required for the superseded inbox item.",
              primary_human_action: "perform_manual_triage",
              automation_step: "open_inbox_item",
              labels: [
                "content_pipeline_delivery_follow_up",
                "chain:content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
                "source_item:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
                "state:cleanup_predecessor_required",
                "action:open_manual_cleanup_follow_up_item",
                "active_queue:rerun_decision_queue"
              ]
            }
          },
          null,
          2
        )}\n`,
        "utf8"
      );

      const exitCode = await runContentPipelineCli(
        ["render-review-inbox-delivery-follow-up-plan", followUpPath, "--out", followUpPlanPath],
        io
      );
      const summary = JSON.parse(stdout[0] ?? "{}");
      const plan = JSON.parse(await readFile(followUpPlanPath, "utf8"));

      expect(exitCode).toBe(0);
      expect(stderr).toEqual([]);
      expect(summary).toMatchObject({
        ok: true,
        command: "render-review-inbox-delivery-follow-up-plan",
        delivery_action: "create_follow_up_inbox_item",
        final_follow_up_item_key:
          "content-pipeline:delivery-follow-up:cleanup_predecessor_required:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
        preserved_active_item_key:
          "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
        output_path: followUpPlanPath
      });
      expect(plan).toMatchObject({
        schema_version: "content-pipeline-review-inbox-delivery-follow-up-plan/v0.1",
        delivery_action: "create_follow_up_inbox_item",
        upsert: {
          operation_key:
            "content-pipeline:follow-up-delivery:upsert:content-pipeline:delivery-follow-up:cleanup_predecessor_required:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z"
        }
      });
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("refuses to render a follow-up delivery plan from an invalid follow-up contract", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const followUpPath = join(tempDir, "review-inbox-delivery-follow-up.json");
    const followUpPlanPath = join(tempDir, "review-inbox-delivery-follow-up-plan.json");
    const { stdout, stderr, io } = createMemoryIo();

    try {
      await writeFile(
        followUpPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-inbox-delivery-follow-up/v0.1",
            source_plan_schema_version: "content-pipeline-review-inbox-delivery-plan/v0.2",
            source_reconciliation_schema_version: "content-pipeline-review-inbox-delivery-reconciliation/v0.1",
            chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            source_item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            source_reconciliation_status: "closed",
            source_recommended_follow_up: "none",
            follow_up_state: "delivery_closed",
            follow_up_action: "open_manual_repair_follow_up_item",
            delivery_chain_closed: true,
            active_item: {
              item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
              human_queue: "approval_queue",
              should_remain_open: true
            },
            automation_step: "open_inbox_item",
            decision_boundary: {
              requires_provider_execution: false,
              requires_human_decision: true,
              provider_execution_allowed_without_human: false
            },
            follow_up_item: null
          },
          null,
          2
        )}\n`,
        "utf8"
      );

      const exitCode = await runContentPipelineCli(
        ["render-review-inbox-delivery-follow-up-plan", followUpPath, "--out", followUpPlanPath],
        io
      );

      expect(exitCode).toBe(1);
      expect(stdout).toEqual([]);
      expect(stderr.join("\n")).toContain(
        "Cannot render inbox delivery follow-up plan from an invalid follow-up contract."
      );
      expect(stderr.join("\n")).toContain("follow_up_action_mismatch");
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("refuses to render a receipt-triage follow-up delivery plan when the follow-up still claims an active item", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const followUpPath = join(tempDir, "review-inbox-delivery-follow-up.json");
    const followUpPlanPath = join(tempDir, "review-inbox-delivery-follow-up-plan.json");
    const { stdout, stderr, io } = createMemoryIo();

    try {
      await writeFile(
        followUpPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-inbox-delivery-follow-up/v0.1",
            source_plan_schema_version: "content-pipeline-review-inbox-delivery-plan/v0.2",
            source_reconciliation_schema_version: "content-pipeline-review-inbox-delivery-reconciliation/v0.1",
            chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            source_item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            source_reconciliation_status: "action_required",
            source_recommended_follow_up: "manual_receipt_triage",
            follow_up_state: "receipt_triage_required",
            follow_up_action: "open_manual_receipt_triage_item",
            delivery_chain_closed: false,
            active_item: {
              item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
              human_queue: "approval_queue",
              should_remain_open: false
            },
            automation_step: "open_inbox_item",
            decision_boundary: {
              requires_provider_execution: false,
              requires_human_decision: true,
              provider_execution_allowed_without_human: false
            },
            follow_up_item: {
              item_key:
                "content-pipeline:delivery-follow-up:receipt_triage_required:content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
              human_queue: "manual_triage_queue",
              title: "[Receipt Triage] math_g8_linear_function_intro",
              summary:
                "Current active inbox item is content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z in approval_queue. The delivery receipt did not validate against its source plan/reconciliation, so manual receipt triage is required before any further automation.",
              primary_human_action: "perform_manual_triage",
              automation_step: "open_inbox_item",
              labels: [
                "content_pipeline_delivery_follow_up",
                "chain:content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
                "source_item:content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
                "state:receipt_triage_required",
                "action:open_manual_receipt_triage_item",
                "active_queue:approval_queue"
              ]
            }
          },
          null,
          2
        )}\n`,
        "utf8"
      );

      const exitCode = await runContentPipelineCli(
        ["render-review-inbox-delivery-follow-up-plan", followUpPath, "--out", followUpPlanPath],
        io
      );

      expect(exitCode).toBe(1);
      expect(stdout).toEqual([]);
      expect(stderr.join("\n")).toContain(
        "Cannot render inbox delivery follow-up plan from an invalid follow-up contract."
      );
      expect(stderr.join("\n")).toContain("active_item_contract_mismatch");
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("validates a follow-up delivery plan against its source follow-up contract", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const followUpPath = join(tempDir, "review-inbox-delivery-follow-up.json");
    const followUpPlanPath = join(tempDir, "review-inbox-delivery-follow-up-plan.json");
    const { stdout, stderr, io } = createMemoryIo();

    try {
      await writeFile(
        followUpPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-inbox-delivery-follow-up/v0.1",
            source_plan_schema_version: "content-pipeline-review-inbox-delivery-plan/v0.2",
            source_reconciliation_schema_version: "content-pipeline-review-inbox-delivery-reconciliation/v0.1",
            chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            source_item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            source_reconciliation_status: "closed",
            source_recommended_follow_up: "none",
            follow_up_state: "delivery_closed",
            follow_up_action: "none",
            delivery_chain_closed: true,
            active_item: {
              item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
              human_queue: "approval_queue",
              should_remain_open: true
            },
            automation_step: "none",
            decision_boundary: {
              requires_provider_execution: false,
              requires_human_decision: false,
              provider_execution_allowed_without_human: false
            },
            follow_up_item: null
          },
          null,
          2
        )}\n`,
        "utf8"
      );
      await writeFile(
        followUpPlanPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-inbox-delivery-follow-up-plan/v0.1",
            source_follow_up_schema_version: "content-pipeline-review-inbox-delivery-follow-up/v0.1",
            chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            source_item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            follow_up_state: "delivery_closed",
            follow_up_action: "none",
            preserved_active_item: {
              item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
              human_queue: "approval_queue",
              should_remain_open: true
            },
            delivery_action: "none",
            final_follow_up_item_key: null,
            final_follow_up_queue: null,
            upsert: null,
            decision_boundary: {
              requires_provider_execution: false,
              requires_human_decision: false,
              provider_execution_allowed_without_human: false
            }
          },
          null,
          2
        )}\n`,
        "utf8"
      );

      const exitCode = await runContentPipelineCli(
        ["validate-review-inbox-delivery-follow-up-plan", followUpPath, followUpPlanPath],
        io
      );
      const summary = JSON.parse(stdout[0] ?? "{}");

      expect(exitCode).toBe(0);
      expect(stderr).toEqual([]);
      expect(summary).toMatchObject({
        ok: true,
        command: "validate-review-inbox-delivery-follow-up-plan",
        issue_count: 0
      });
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("renders a follow-up delivery receipt from a validated follow-up and follow-up delivery plan", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const followUpPath = join(tempDir, "review-inbox-delivery-follow-up.json");
    const followUpPlanPath = join(tempDir, "review-inbox-delivery-follow-up-plan.json");
    const receiptPath = join(tempDir, "review-inbox-delivery-follow-up-receipt.json");
    const { stdout, stderr, io } = createMemoryIo();

    try {
      await writeFile(
        followUpPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-inbox-delivery-follow-up/v0.1",
            source_plan_schema_version: "content-pipeline-review-inbox-delivery-plan/v0.2",
            source_reconciliation_schema_version: "content-pipeline-review-inbox-delivery-reconciliation/v0.1",
            chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
            source_item_key:
              "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
            source_reconciliation_status: "action_required",
            source_recommended_follow_up: "manual_cleanup_predecessor",
            follow_up_state: "cleanup_predecessor_required",
            follow_up_action: "open_manual_cleanup_follow_up_item",
            delivery_chain_closed: false,
            active_item: {
              item_key:
                "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
              human_queue: "rerun_decision_queue",
              should_remain_open: true
            },
            automation_step: "open_inbox_item",
            decision_boundary: {
              requires_provider_execution: false,
              requires_human_decision: true,
              provider_execution_allowed_without_human: false
            },
            follow_up_item: {
              item_key:
                "content-pipeline:delivery-follow-up:cleanup_predecessor_required:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
              human_queue: "manual_triage_queue",
              title: "[Delivery Cleanup] math_g8_linear_function_intro",
              summary:
                "Current active inbox item is content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z in rerun_decision_queue. The replacement delivery left a predecessor item open, so manual cleanup is required for the superseded inbox item.",
              primary_human_action: "perform_manual_triage",
              automation_step: "open_inbox_item",
              labels: [
                "content_pipeline_delivery_follow_up",
                "chain:content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
                "source_item:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
                "state:cleanup_predecessor_required",
                "action:open_manual_cleanup_follow_up_item",
                "active_queue:rerun_decision_queue"
              ]
            }
          },
          null,
          2
        )}\n`,
        "utf8"
      );
      await writeFile(
        followUpPlanPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-inbox-delivery-follow-up-plan/v0.1",
            source_follow_up_schema_version: "content-pipeline-review-inbox-delivery-follow-up/v0.1",
            chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
            source_item_key:
              "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
            follow_up_state: "cleanup_predecessor_required",
            follow_up_action: "open_manual_cleanup_follow_up_item",
            preserved_active_item: {
              item_key:
                "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
              human_queue: "rerun_decision_queue",
              should_remain_open: true
            },
            delivery_action: "create_follow_up_inbox_item",
            final_follow_up_item_key:
              "content-pipeline:delivery-follow-up:cleanup_predecessor_required:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
            final_follow_up_queue: "manual_triage_queue",
            upsert: {
              operation_key:
                "content-pipeline:follow-up-delivery:upsert:content-pipeline:delivery-follow-up:cleanup_predecessor_required:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
              item_key:
                "content-pipeline:delivery-follow-up:cleanup_predecessor_required:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
              human_queue: "manual_triage_queue",
              title: "[Delivery Cleanup] math_g8_linear_function_intro",
              summary:
                "Current active inbox item is content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z in rerun_decision_queue. The replacement delivery left a predecessor item open, so manual cleanup is required for the superseded inbox item.",
              primary_human_action: "perform_manual_triage",
              automation_step: "open_inbox_item",
              labels: [
                "content_pipeline_delivery_follow_up",
                "chain:content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
                "source_item:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
                "state:cleanup_predecessor_required",
                "action:open_manual_cleanup_follow_up_item",
                "active_queue:rerun_decision_queue"
              ]
            },
            decision_boundary: {
              requires_provider_execution: false,
              requires_human_decision: true,
              provider_execution_allowed_without_human: false
            }
          },
          null,
          2
        )}\n`,
        "utf8"
      );

      const exitCode = await runContentPipelineCli(
        [
          "render-review-inbox-delivery-follow-up-receipt",
          followUpPath,
          followUpPlanPath,
          "--executed-at",
          "2026-04-23T18:25:00.000Z",
          "--out",
          receiptPath
        ],
        io
      );
      const summary = JSON.parse(stdout[0] ?? "{}");
      const receipt = JSON.parse(await readFile(receiptPath, "utf8"));

      expect(exitCode).toBe(0);
      expect(stderr).toEqual([]);
      expect(summary).toMatchObject({
        ok: true,
        command: "render-review-inbox-delivery-follow-up-receipt",
        overall_status: "applied",
        operation_count: 1,
        failed_operation_count: 0,
        output_path: receiptPath
      });
      expect(receipt).toMatchObject({
        schema_version: "content-pipeline-review-inbox-delivery-follow-up-receipt/v0.1",
        final_follow_up_item_key:
          "content-pipeline:delivery-follow-up:cleanup_predecessor_required:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
        final_follow_up_queue: "manual_triage_queue"
      });
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("validates a follow-up delivery receipt against its source follow-up and follow-up plan", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const followUpPath = join(tempDir, "review-inbox-delivery-follow-up.json");
    const followUpPlanPath = join(tempDir, "review-inbox-delivery-follow-up-plan.json");
    const receiptPath = join(tempDir, "review-inbox-delivery-follow-up-receipt.json");
    const { stdout, stderr, io } = createMemoryIo();

    try {
      await writeFile(
        followUpPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-inbox-delivery-follow-up/v0.1",
            source_plan_schema_version: "content-pipeline-review-inbox-delivery-plan/v0.2",
            source_reconciliation_schema_version: "content-pipeline-review-inbox-delivery-reconciliation/v0.1",
            chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            source_item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            source_reconciliation_status: "closed",
            source_recommended_follow_up: "none",
            follow_up_state: "delivery_closed",
            follow_up_action: "none",
            delivery_chain_closed: true,
            active_item: {
              item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
              human_queue: "approval_queue",
              should_remain_open: true
            },
            automation_step: "none",
            decision_boundary: {
              requires_provider_execution: false,
              requires_human_decision: false,
              provider_execution_allowed_without_human: false
            },
            follow_up_item: null
          },
          null,
          2
        )}\n`,
        "utf8"
      );
      await writeFile(
        followUpPlanPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-inbox-delivery-follow-up-plan/v0.1",
            source_follow_up_schema_version: "content-pipeline-review-inbox-delivery-follow-up/v0.1",
            chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            source_item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            follow_up_state: "delivery_closed",
            follow_up_action: "none",
            preserved_active_item: {
              item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
              human_queue: "approval_queue",
              should_remain_open: true
            },
            delivery_action: "none",
            final_follow_up_item_key: null,
            final_follow_up_queue: null,
            upsert: null,
            decision_boundary: {
              requires_provider_execution: false,
              requires_human_decision: false,
              provider_execution_allowed_without_human: false
            }
          },
          null,
          2
        )}\n`,
        "utf8"
      );
      await writeFile(
        receiptPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-inbox-delivery-follow-up-receipt/v0.1",
            source_follow_up_plan_schema_version: "content-pipeline-review-inbox-delivery-follow-up-plan/v0.1",
            chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            source_item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            follow_up_state: "delivery_closed",
            follow_up_action: "none",
            delivery_action: "none",
            executed_at: "2026-04-23T18:25:00.000Z",
            overall_status: "applied",
            preserved_active_item: {
              item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
              human_queue: "approval_queue",
              should_remain_open: true
            },
            final_follow_up_item_key: null,
            final_follow_up_queue: null,
            operations: []
          },
          null,
          2
        )}\n`,
        "utf8"
      );

      const exitCode = await runContentPipelineCli(
        ["validate-review-inbox-delivery-follow-up-receipt", followUpPath, followUpPlanPath, receiptPath],
        io
      );
      const summary = JSON.parse(stdout[0] ?? "{}");

      expect(exitCode).toBe(0);
      expect(stderr).toEqual([]);
      expect(summary).toMatchObject({
        ok: true,
        command: "validate-review-inbox-delivery-follow-up-receipt",
        issue_count: 0
      });
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("refuses to render a follow-up delivery receipt from an invalid follow-up contract", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const followUpPath = join(tempDir, "review-inbox-delivery-follow-up.json");
    const followUpPlanPath = join(tempDir, "review-inbox-delivery-follow-up-plan.json");
    const receiptPath = join(tempDir, "review-inbox-delivery-follow-up-receipt.json");
    const { stdout, stderr, io } = createMemoryIo();

    try {
      await writeFile(
        followUpPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-inbox-delivery-follow-up/v0.1",
            source_plan_schema_version: "content-pipeline-review-inbox-delivery-plan/v0.2",
            source_reconciliation_schema_version: "content-pipeline-review-inbox-delivery-reconciliation/v0.1",
            chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            source_item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            source_reconciliation_status: "closed",
            source_recommended_follow_up: "none",
            follow_up_state: "delivery_closed",
            follow_up_action: "none",
            delivery_chain_closed: true,
            active_item: {
              item_key: null,
              human_queue: null,
              should_remain_open: false
            },
            automation_step: "none",
            decision_boundary: {
              requires_provider_execution: false,
              requires_human_decision: false,
              provider_execution_allowed_without_human: false
            },
            follow_up_item: null
          },
          null,
          2
        )}\n`,
        "utf8"
      );
      await writeFile(
        followUpPlanPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-inbox-delivery-follow-up-plan/v0.1",
            source_follow_up_schema_version: "content-pipeline-review-inbox-delivery-follow-up/v0.1",
            chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            source_item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            follow_up_state: "delivery_closed",
            follow_up_action: "none",
            preserved_active_item: {
              item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
              human_queue: "approval_queue",
              should_remain_open: true
            },
            delivery_action: "none",
            final_follow_up_item_key: null,
            final_follow_up_queue: null,
            upsert: null,
            decision_boundary: {
              requires_provider_execution: false,
              requires_human_decision: false,
              provider_execution_allowed_without_human: false
            }
          },
          null,
          2
        )}\n`,
        "utf8"
      );

      const exitCode = await runContentPipelineCli(
        ["render-review-inbox-delivery-follow-up-receipt", followUpPath, followUpPlanPath, "--out", receiptPath],
        io
      );

      expect(exitCode).toBe(1);
      expect(stdout).toEqual([]);
      expect(stderr.join("\n")).toContain(
        "Cannot render inbox delivery follow-up receipt from an invalid follow-up contract."
      );
      expect(stderr.join("\n")).toContain("active_item_contract_mismatch");
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("fails follow-up delivery receipt validation when the plan diverges from its validated follow-up source", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const followUpPath = join(tempDir, "review-inbox-delivery-follow-up.json");
    const followUpPlanPath = join(tempDir, "review-inbox-delivery-follow-up-plan.json");
    const receiptPath = join(tempDir, "review-inbox-delivery-follow-up-receipt.json");
    const { stdout, stderr, io } = createMemoryIo();

    try {
      await writeFile(
        followUpPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-inbox-delivery-follow-up/v0.1",
            source_plan_schema_version: "content-pipeline-review-inbox-delivery-plan/v0.2",
            source_reconciliation_schema_version: "content-pipeline-review-inbox-delivery-reconciliation/v0.1",
            chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            source_item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            source_reconciliation_status: "closed",
            source_recommended_follow_up: "none",
            follow_up_state: "delivery_closed",
            follow_up_action: "none",
            delivery_chain_closed: true,
            active_item: {
              item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
              human_queue: "approval_queue",
              should_remain_open: true
            },
            automation_step: "none",
            decision_boundary: {
              requires_provider_execution: false,
              requires_human_decision: false,
              provider_execution_allowed_without_human: false
            },
            follow_up_item: null
          },
          null,
          2
        )}\n`,
        "utf8"
      );
      await writeFile(
        followUpPlanPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-inbox-delivery-follow-up-plan/v0.1",
            source_follow_up_schema_version: "content-pipeline-review-inbox-delivery-follow-up/v0.1",
            chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            source_item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            follow_up_state: "delivery_closed",
            follow_up_action: "none",
            preserved_active_item: {
              item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
              human_queue: "approval_queue",
              should_remain_open: true
            },
            delivery_action: "create_follow_up_inbox_item",
            final_follow_up_item_key: "content-pipeline:unexpected-follow-up-item",
            final_follow_up_queue: "manual_triage_queue",
            upsert: {
              operation_key: "content-pipeline:follow-up-delivery:upsert:content-pipeline:unexpected-follow-up-item",
              item_key: "content-pipeline:unexpected-follow-up-item",
              human_queue: "manual_triage_queue",
              title: "[Unexpected] math_g8_linear_function_intro",
              summary: "This should not exist for a closed follow-up chain.",
              primary_human_action: "perform_manual_triage",
              automation_step: "open_inbox_item",
              labels: ["content_pipeline_delivery_follow_up"]
            },
            decision_boundary: {
              requires_provider_execution: false,
              requires_human_decision: false,
              provider_execution_allowed_without_human: false
            }
          },
          null,
          2
        )}\n`,
        "utf8"
      );
      await writeFile(
        receiptPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-inbox-delivery-follow-up-receipt/v0.1",
            source_follow_up_plan_schema_version: "content-pipeline-review-inbox-delivery-follow-up-plan/v0.1",
            chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            source_item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            follow_up_state: "delivery_closed",
            follow_up_action: "none",
            delivery_action: "create_follow_up_inbox_item",
            executed_at: "2026-04-23T18:25:00.000Z",
            overall_status: "applied",
            preserved_active_item: {
              item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
              human_queue: "approval_queue",
              should_remain_open: true
            },
            final_follow_up_item_key: "content-pipeline:unexpected-follow-up-item",
            final_follow_up_queue: "manual_triage_queue",
            operations: [
              {
                operation_key: "content-pipeline:follow-up-delivery:upsert:content-pipeline:unexpected-follow-up-item",
                operation_type: "upsert",
                target_item_key: "content-pipeline:unexpected-follow-up-item",
                status: "applied"
              }
            ]
          },
          null,
          2
        )}\n`,
        "utf8"
      );

      const exitCode = await runContentPipelineCli(
        ["validate-review-inbox-delivery-follow-up-receipt", followUpPath, followUpPlanPath, receiptPath],
        io
      );
      const summary = JSON.parse(stdout[0] ?? "{}");

      expect(exitCode).toBe(1);
      expect(stderr).toEqual([]);
      expect(summary).toMatchObject({
        ok: false,
        command: "validate-review-inbox-delivery-follow-up-receipt"
      });
      expect(summary.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            stage: "follow_up_plan",
            code: "delivery_action_mismatch"
          })
        ])
      );
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("renders a follow-up delivery reconciliation from validated follow-up, plan, and receipt", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const followUpPath = join(tempDir, "review-inbox-delivery-follow-up.json");
    const followUpPlanPath = join(tempDir, "review-inbox-delivery-follow-up-plan.json");
    const receiptPath = join(tempDir, "review-inbox-delivery-follow-up-receipt.json");
    const reconciliationPath = join(tempDir, "review-inbox-delivery-follow-up-reconciliation.json");
    const { stdout, stderr, io } = createMemoryIo();

    try {
      await writeFile(
        followUpPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-inbox-delivery-follow-up/v0.1",
            source_plan_schema_version: "content-pipeline-review-inbox-delivery-plan/v0.2",
            source_reconciliation_schema_version: "content-pipeline-review-inbox-delivery-reconciliation/v0.1",
            chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            source_item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            source_reconciliation_status: "closed",
            source_recommended_follow_up: "none",
            follow_up_state: "delivery_closed",
            follow_up_action: "none",
            delivery_chain_closed: true,
            active_item: {
              item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
              human_queue: "approval_queue",
              should_remain_open: true
            },
            automation_step: "none",
            decision_boundary: {
              requires_provider_execution: false,
              requires_human_decision: false,
              provider_execution_allowed_without_human: false
            },
            follow_up_item: null
          },
          null,
          2
        )}\n`,
        "utf8"
      );
      await writeFile(
        followUpPlanPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-inbox-delivery-follow-up-plan/v0.1",
            source_follow_up_schema_version: "content-pipeline-review-inbox-delivery-follow-up/v0.1",
            chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            source_item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            follow_up_state: "delivery_closed",
            follow_up_action: "none",
            preserved_active_item: {
              item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
              human_queue: "approval_queue",
              should_remain_open: true
            },
            delivery_action: "none",
            final_follow_up_item_key: null,
            final_follow_up_queue: null,
            upsert: null,
            decision_boundary: {
              requires_provider_execution: false,
              requires_human_decision: false,
              provider_execution_allowed_without_human: false
            }
          },
          null,
          2
        )}\n`,
        "utf8"
      );
      await writeFile(
        receiptPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-inbox-delivery-follow-up-receipt/v0.1",
            source_follow_up_plan_schema_version: "content-pipeline-review-inbox-delivery-follow-up-plan/v0.1",
            chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            source_item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            follow_up_state: "delivery_closed",
            follow_up_action: "none",
            delivery_action: "none",
            executed_at: "2026-04-23T18:25:00.000Z",
            overall_status: "applied",
            preserved_active_item: {
              item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
              human_queue: "approval_queue",
              should_remain_open: true
            },
            final_follow_up_item_key: null,
            final_follow_up_queue: null,
            operations: []
          },
          null,
          2
        )}\n`,
        "utf8"
      );

      const exitCode = await runContentPipelineCli(
        [
          "render-review-inbox-delivery-follow-up-reconciliation",
          followUpPath,
          followUpPlanPath,
          receiptPath,
          "--out",
          reconciliationPath
        ],
        io
      );
      const summary = JSON.parse(stdout[0] ?? "{}");
      const reconciliation = JSON.parse(await readFile(reconciliationPath, "utf8"));

      expect(exitCode).toBe(0);
      expect(stderr).toEqual([]);
      expect(summary).toMatchObject({
        ok: true,
        command: "render-review-inbox-delivery-follow-up-reconciliation",
        reconciliation_status: "closed",
        recommended_follow_up: "none",
        unresolved_operation_count: 0,
        output_path: reconciliationPath
      });
      expect(reconciliation).toMatchObject({
        schema_version: "content-pipeline-review-inbox-delivery-follow-up-reconciliation/v0.1",
        receipt_validation_ok: true,
        reconciliation_status: "closed",
        recommended_follow_up: "none"
      });
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("validates a follow-up delivery reconciliation against its source chain", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const followUpPath = join(tempDir, "review-inbox-delivery-follow-up.json");
    const followUpPlanPath = join(tempDir, "review-inbox-delivery-follow-up-plan.json");
    const receiptPath = join(tempDir, "review-inbox-delivery-follow-up-receipt.json");
    const reconciliationPath = join(tempDir, "review-inbox-delivery-follow-up-reconciliation.json");
    const { stdout, stderr, io } = createMemoryIo();

    try {
      await writeFile(
        followUpPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-inbox-delivery-follow-up/v0.1",
            source_plan_schema_version: "content-pipeline-review-inbox-delivery-plan/v0.2",
            source_reconciliation_schema_version: "content-pipeline-review-inbox-delivery-reconciliation/v0.1",
            chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            source_item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            source_reconciliation_status: "closed",
            source_recommended_follow_up: "none",
            follow_up_state: "delivery_closed",
            follow_up_action: "none",
            delivery_chain_closed: true,
            active_item: {
              item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
              human_queue: "approval_queue",
              should_remain_open: true
            },
            automation_step: "none",
            decision_boundary: {
              requires_provider_execution: false,
              requires_human_decision: false,
              provider_execution_allowed_without_human: false
            },
            follow_up_item: null
          },
          null,
          2
        )}\n`,
        "utf8"
      );
      await writeFile(
        followUpPlanPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-inbox-delivery-follow-up-plan/v0.1",
            source_follow_up_schema_version: "content-pipeline-review-inbox-delivery-follow-up/v0.1",
            chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            source_item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            follow_up_state: "delivery_closed",
            follow_up_action: "none",
            preserved_active_item: {
              item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
              human_queue: "approval_queue",
              should_remain_open: true
            },
            delivery_action: "none",
            final_follow_up_item_key: null,
            final_follow_up_queue: null,
            upsert: null,
            decision_boundary: {
              requires_provider_execution: false,
              requires_human_decision: false,
              provider_execution_allowed_without_human: false
            }
          },
          null,
          2
        )}\n`,
        "utf8"
      );
      await writeFile(
        receiptPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-inbox-delivery-follow-up-receipt/v0.1",
            source_follow_up_plan_schema_version: "content-pipeline-review-inbox-delivery-follow-up-plan/v0.1",
            chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            source_item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            follow_up_state: "delivery_closed",
            follow_up_action: "none",
            delivery_action: "none",
            executed_at: "2026-04-23T18:25:00.000Z",
            overall_status: "applied",
            preserved_active_item: {
              item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
              human_queue: "approval_queue",
              should_remain_open: true
            },
            final_follow_up_item_key: null,
            final_follow_up_queue: null,
            operations: []
          },
          null,
          2
        )}\n`,
        "utf8"
      );
      await writeFile(
        reconciliationPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-inbox-delivery-follow-up-reconciliation/v0.1",
            source_follow_up_plan_schema_version: "content-pipeline-review-inbox-delivery-follow-up-plan/v0.1",
            source_follow_up_receipt_schema_version: "content-pipeline-review-inbox-delivery-follow-up-receipt/v0.1",
            chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            source_item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
            follow_up_state: "delivery_closed",
            follow_up_action: "none",
            receipt_validation_ok: true,
            receipt_validation_issue_codes: [],
            reconciliation_status: "closed",
            recommended_follow_up: "manual_repair_follow_up_delivery",
            delivery_status: "applied",
            preserved_active_item: {
              item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
              human_queue: "approval_queue",
              should_remain_open: true
            },
            final_follow_up_item_key: null,
            final_follow_up_queue: null,
            unresolved_operations: []
          },
          null,
          2
        )}\n`,
        "utf8"
      );

      const exitCode = await runContentPipelineCli(
        [
          "validate-review-inbox-delivery-follow-up-reconciliation",
          followUpPath,
          followUpPlanPath,
          receiptPath,
          reconciliationPath
        ],
        io
      );
      const summary = JSON.parse(stdout[0] ?? "{}");

      expect(exitCode).toBe(1);
      expect(stderr).toEqual([]);
      expect(summary).toMatchObject({
        ok: false,
        command: "validate-review-inbox-delivery-follow-up-reconciliation"
      });
      expect(summary.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            stage: "follow_up_reconciliation",
            code: "recommended_follow_up_mismatch"
          })
        ])
      );
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("applies a reviewed artifact to a new candidate yaml without overwriting the source", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const artifactPath = join(tempDir, "review-artifact.json");
    const approvedArtifactPath = join(tempDir, "approved-review-artifact.json");
    const outputPath = join(tempDir, "candidate-unit.yaml");
    const sourceUnit = await loadUnitSpecFromFile(sampleUnitPath);
    const nextMisconception = "新增审阅误区：把截距误解为固定总价";
    const { stdout, stderr, io } = createMemoryIo();

    try {
      await writeFile(
        artifactPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-artifact/v0.1",
            mode: "llm_review_no_writeback",
            generated_at: "2026-04-23T08:00:00.000Z",
            unit_id: sourceUnit.metadata.unit_id,
            status: "ready_for_human_review",
            writeback_performed: false,
            workflow_runs: [],
            invocation_logs: [],
            candidate_patches: [
              {
                role: "subject_expert",
                patch_sections: ["knowledge"],
                patch: {
                  knowledge: {
                    ...sourceUnit.knowledge,
                    global_misconceptions: [...sourceUnit.knowledge.global_misconceptions, nextMisconception]
                  }
                },
                diff: [
                  {
                    path: `knowledge.global_misconceptions[${sourceUnit.knowledge.global_misconceptions.length}]`,
                    change_type: "added",
                    after: nextMisconception
                  }
                ]
              }
            ]
          },
          null,
          2
        )}\n`,
        "utf8"
      );

      const approveExitCode = await runContentPipelineCli(
        ["approve-review-artifact", artifactPath, "--reviewer", "teacher_math_001", "--out", approvedArtifactPath],
        io
      );
      const approvedArtifact = JSON.parse(await readFile(approvedArtifactPath, "utf8"));

      expect(approveExitCode).toBe(0);
      expect(approvedArtifact.approval).toMatchObject({
        status: "approved",
        reviewer_id: "teacher_math_001"
      });

      const exitCode = await runContentPipelineCli(
        ["apply-reviewed-patch", sampleUnitPath, approvedArtifactPath, "--confirm-reviewed", "--out", outputPath],
        io
      );
      const candidateUnit = await loadUnitSpecFromFile(outputPath);
      const originalUnit = await loadUnitSpecFromFile(sampleUnitPath);

      expect(exitCode).toBe(0);
      expect(stderr).toEqual([]);
      expect(JSON.parse(stdout[1] ?? "{}")).toMatchObject({
        ok: true,
        command: "apply-reviewed-patch",
        source_overwritten: false,
        output_path: outputPath
      });
      expect(candidateUnit.knowledge.global_misconceptions).toContain(nextMisconception);
      expect(originalUnit.knowledge.global_misconceptions).not.toContain(nextMisconception);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("rejects applying a ready artifact before approval metadata is present", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const artifactPath = join(tempDir, "review-artifact.json");
    const outputPath = join(tempDir, "candidate-unit.yaml");
    const sourceUnit = await loadUnitSpecFromFile(sampleUnitPath);
    const { stdout, stderr, io } = createMemoryIo();

    try {
      await writeFile(
        artifactPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-artifact/v0.1",
            mode: "llm_review_no_writeback",
            generated_at: "2026-04-23T08:00:00.000Z",
            unit_id: sourceUnit.metadata.unit_id,
            status: "ready_for_human_review",
            writeback_performed: false,
            workflow_runs: [],
            invocation_logs: [],
            candidate_patches: []
          },
          null,
          2
        )}\n`,
        "utf8"
      );

      const exitCode = await runContentPipelineCli(
        ["apply-reviewed-patch", sampleUnitPath, artifactPath, "--confirm-reviewed", "--out", outputPath],
        io
      );

      expect(exitCode).toBe(1);
      expect(stdout).toEqual([]);
      expect(stderr.join("\n")).toContain("approval.status = approved");
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("rejects applying an approved artifact when the candidate unit has dangling semantic references", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "edu-ai-content-pipeline-"));
    const artifactPath = join(tempDir, "review-artifact.json");
    const approvedArtifactPath = join(tempDir, "approved-review-artifact.json");
    const outputPath = join(tempDir, "candidate-unit.yaml");
    const sourceUnit = await loadUnitSpecFromFile(sampleUnitPath);
    const { stdout, stderr, io } = createMemoryIo();

    try {
      await writeFile(
        artifactPath,
        `${JSON.stringify(
          {
            schema_version: "content-pipeline-review-artifact/v0.1",
            mode: "llm_review_no_writeback",
            generated_at: "2026-04-23T08:00:00.000Z",
            unit_id: sourceUnit.metadata.unit_id,
            status: "ready_for_human_review",
            writeback_performed: false,
            workflow_runs: [],
            invocation_logs: [],
            candidate_patches: [
              {
                role: "subject_expert",
                patch_sections: ["knowledge"],
                patch: {
                  knowledge: {
                    ...sourceUnit.knowledge,
                    nodes: [
                      {
                        ...sourceUnit.knowledge.nodes[0]!,
                        node_id: "lf_replacement_node"
                      }
                    ]
                  }
                },
                diff: [
                  {
                    path: "knowledge.nodes[0].node_id",
                    change_type: "changed",
                    before: sourceUnit.knowledge.nodes[0]?.node_id,
                    after: "lf_replacement_node"
                  }
                ]
              }
            ]
          },
          null,
          2
        )}\n`,
        "utf8"
      );

      const approveExitCode = await runContentPipelineCli(
        ["approve-review-artifact", artifactPath, "--reviewer", "teacher_math_001", "--out", approvedArtifactPath],
        io
      );
      const applyExitCode = await runContentPipelineCli(
        ["apply-reviewed-patch", sampleUnitPath, approvedArtifactPath, "--confirm-reviewed", "--out", outputPath],
        io
      );

      expect(approveExitCode).toBe(0);
      expect(applyExitCode).toBe(1);
      expect(stdout).toHaveLength(1);
      expect(stderr.join("\n")).toContain("Candidate unit failed semantic validation");
      expect(stderr.join("\n")).toContain("unknown_node_reference");
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });
});
