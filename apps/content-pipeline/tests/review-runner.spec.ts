import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  createContentPipelineReviewGatewayFromEnv,
  createOpenAiCompatibleReviewGateway,
  loadUnitSpecFromFile,
  runLlmReviewUnitWorkflow,
  type UnitReviewArtifact
} from "../src";

const sampleUnitPath = resolve(process.cwd(), "../../content/units/math-g8-s1-linear-function-concept/unit.yaml");

describe("LLM review workflow", () => {
  it("writes parsed candidate patches to a review artifact without writing back unit yaml", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const sections = ["knowledge", "pedagogy", "narrative", "implementation", "assessment", "quality"] as const;
    let callIndex = 0;
    const gateway = createOpenAiCompatibleReviewGateway({
      api_key: "test-key",
      model: "content-review-model",
      base_url: "https://llm.example/v1",
      fetch_impl: async () => {
        const section = sections[callIndex] ?? "quality";
        const patch =
          section === "knowledge"
            ? {
                ...unit.knowledge,
                global_misconceptions: [...unit.knowledge.global_misconceptions, "新增审阅误区：把函数值当作固定费用"]
              }
            : unit[section];
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
                      patch,
                      raw_notes: "RAW_MODEL_RESPONSE_SHOULD_NOT_APPEAR"
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

    const artifact = await runLlmReviewUnitWorkflow(unit, {
      gateway,
      now: () => new Date("2026-04-23T08:00:00.000Z")
    });

    expect(artifact).toMatchObject({
      schema_version: "content-pipeline-review-artifact/v0.1",
      mode: "llm_review_no_writeback",
      generated_at: "2026-04-23T08:00:00.000Z",
      unit_id: "math_g8_linear_function_intro",
      status: "ready_for_human_review",
      writeback_performed: false,
      orchestration_guidance: {
        action: "notify_human_for_approval",
        requires_provider_execution: false,
        requires_human_decision: true,
        human_queue: "approval_queue",
        automation_step: "open_inbox_item",
        provider_execution_allowed_without_human: false,
        primary_human_action: "approve_review_artifact",
        inbox_title: "[Approval] math_g8_linear_function_intro"
      },
      semantic_validation: {
        passed: true,
        error_count: 0
      }
    });
    expect(callIndex).toBe(6);
    expect(artifact.candidate_patches).toHaveLength(6);
    expect(artifact.candidate_patches[0]?.diff).toContainEqual({
      path: `knowledge.global_misconceptions[${unit.knowledge.global_misconceptions.length}]`,
      change_type: "added",
      after: "新增审阅误区：把函数值当作固定费用"
    });
    expect(artifact.workflow_runs.every((run) => run.status === "passed")).toBe(true);
    expect(JSON.stringify(artifact.invocation_logs)).not.toContain("RAW_MODEL_RESPONSE_SHOULD_NOT_APPEAR");
    expect(JSON.stringify(artifact.candidate_patches)).not.toContain("RAW_MODEL_RESPONSE_SHOULD_NOT_APPEAR");
    expect(artifact.runtime_projection_summary).toEqual({
      total_events: 12,
      student_projection_count: 0,
      teacher_projection_count: 0,
      guardian_projection_count: 0,
      admin_audit_projection_count: 12
    });
    expect(artifact.runtime_admin_audit_projection).toHaveLength(12);
    expect(artifact.runtime_admin_audit_projection?.[0]).toMatchObject({
      event_type: "stage_start",
      domain: "content",
      occurred_at: "2026-04-23T08:00:00.000Z",
      payload: {
        progress: {
          label: "subject_expert"
        }
      }
    });
    expect(artifact.runtime_admin_audit_projection?.[1]?.internal_metadata).toMatchObject({
      provider_id: expect.any(String),
      model_id: "content-review-model",
      input_tokens: 10,
      output_tokens: 5
    });
    expect(JSON.stringify(artifact.runtime_admin_audit_projection)).not.toContain(
      "RAW_MODEL_RESPONSE_SHOULD_NOT_APPEAR"
    );
  });

  it("stops review runs early when a knowledge patch strands downstream node references", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const sections = ["knowledge", "pedagogy", "narrative", "implementation", "assessment", "quality"] as const;
    let callIndex = 0;
    const gateway = createOpenAiCompatibleReviewGateway({
      api_key: "test-key",
      model: "content-review-model",
      base_url: "https://llm.example/v1",
      fetch_impl: async () => {
        const section = sections[callIndex] ?? "quality";
        const patch =
          section === "knowledge"
            ? {
                ...unit.knowledge,
                nodes: [
                  {
                    ...unit.knowledge.nodes[0]!,
                    node_id: "lf_replacement_node"
                  }
                ],
                edges: []
              }
            : unit[section];
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

    const artifact = await runLlmReviewUnitWorkflow(unit, {
      gateway,
      now: () => new Date("2026-04-23T08:00:00.000Z")
    });

    expect(artifact.status).toBe("blocked");
    expect(callIndex).toBe(1);
    expect(artifact.candidate_patches).toHaveLength(0);
    expect(artifact.semantic_validation).toBeUndefined();
    expect(artifact.workflow_runs[0]).toMatchObject({
      role: "subject_expert",
      status: "failed"
    });
    expect(artifact.repair_plan).toMatchObject({
      source: "invocation_failure",
      recommended_rerun_from: "subject_expert"
    });
    expect(artifact.retry_policy).toMatchObject({
      decision: "allow_scoped_rerun",
      recommended_rerun_from: "subject_expert"
    });
    expect(artifact.orchestration_guidance).toMatchObject({
      action: "prepare_scoped_rerun",
      requires_provider_execution: true,
      recommended_rerun_from: "subject_expert",
      human_queue: "rerun_decision_queue",
      automation_step: "open_inbox_item",
      primary_human_action: "decide_scoped_rerun",
      inbox_title: "[Rerun Decision] math_g8_linear_function_intro"
    });
    expect(artifact.invocation_logs[0]).toMatchObject({
      role: "subject_expert",
      status: "failed_retryable",
      failure: {
        category: "schema_validation",
        retryable: true
      }
    });
    expect(artifact.runtime_projection_summary).toEqual({
      total_events: 2,
      student_projection_count: 0,
      teacher_projection_count: 0,
      guardian_projection_count: 0,
      admin_audit_projection_count: 2
    });
    expect(artifact.runtime_admin_audit_projection?.map((event) => event.event_type)).toEqual([
      "stage_start",
      "error"
    ]);
    expect(artifact.runtime_admin_audit_projection?.[1]?.payload.error).toEqual({
      error_code: "schema_validation",
      safe_message: "subject_expert failed attempt 1; see sanitized invocation log for triage category.",
      retryable: true
    });
  });

  it("blocks review artifacts when the QA patch leaves an open blocking issue", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const sections = ["knowledge", "pedagogy", "narrative", "implementation", "assessment", "quality"] as const;
    let callIndex = 0;
    const gateway = createOpenAiCompatibleReviewGateway({
      api_key: "test-key",
      model: "content-review-model",
      base_url: "https://llm.example/v1",
      fetch_impl: async () => {
        const section = sections[callIndex] ?? "quality";
        const patch =
          section === "quality"
            ? {
                ...unit.quality,
                checklist_pass: false,
                issues: [
                  {
                    ...unit.quality.issues[0]!,
                    issue_id: "unverified_curriculum_alignment",
                    severity: "blocking" as const,
                    status: "open" as const
                  }
                ]
              }
            : unit[section];
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

    const artifact = await runLlmReviewUnitWorkflow(unit, {
      gateway,
      now: () => new Date("2026-04-23T08:00:00.000Z")
    });

    expect(artifact.status).toBe("blocked");
    expect(callIndex).toBe(6);
    expect(artifact.candidate_patches).toHaveLength(5);
    expect(artifact.repair_plan).toMatchObject({
      source: "invocation_failure",
      recommended_rerun_from: "qa_agent"
    });
    expect(artifact.retry_policy).toMatchObject({
      decision: "allow_scoped_rerun",
      recommended_rerun_from: "qa_agent"
    });
    expect(artifact.orchestration_guidance).toMatchObject({
      action: "prepare_scoped_rerun",
      requires_provider_execution: true,
      recommended_rerun_from: "qa_agent",
      human_queue: "rerun_decision_queue",
      automation_step: "open_inbox_item",
      primary_human_action: "decide_scoped_rerun",
      inbox_title: "[Rerun Decision] math_g8_linear_function_intro"
    });
    expect(artifact.workflow_runs[5]).toMatchObject({
      role: "qa_agent",
      status: "failed"
    });
    expect(artifact.invocation_logs[5]).toMatchObject({
      role: "qa_agent",
      status: "failed_retryable",
      failure: {
        category: "schema_validation",
        retryable: true
      }
    });
  });

  it("supports scoped rerun from a prior blocked artifact recommendation", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const sections = ["assessment", "quality"] as const;
    let callIndex = 0;
    const priorArtifact: UnitReviewArtifact = {
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
    };
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

    const artifact = await runLlmReviewUnitWorkflow(unit, {
      gateway,
      now: () => new Date("2026-04-23T08:30:00.000Z"),
      rerun: {
        from_artifact: priorArtifact
      }
    });

    expect(callIndex).toBe(2);
    expect(artifact.status).toBe("ready_for_human_review");
    expect(artifact.rerun_context).toMatchObject({
      start_from_role: "assessment_designer",
      inherited_roles: ["subject_expert", "pedagogy_designer", "narrative_designer", "engineering_agent"],
      rerun_chain_depth: 1,
      rerun_root_artifact_generated_at: "2026-04-23T07:00:00.000Z",
      source_retry_decision: "allow_scoped_rerun",
      source_recommended_rerun_from: "assessment_designer"
    });
    expect(artifact.orchestration_guidance).toMatchObject({
      action: "notify_human_for_approval",
      requires_provider_execution: false,
      human_queue: "approval_queue",
      automation_step: "open_inbox_item",
      primary_human_action: "approve_review_artifact",
      rerun_chain_depth: 1
    });
    expect(artifact.candidate_patches).toHaveLength(2);
    expect(artifact.candidate_patches.map((patch) => patch.role)).toEqual(["assessment_designer", "qa_agent"]);
    expect(artifact.runtime_projection_summary).toEqual({
      total_events: 4,
      student_projection_count: 0,
      teacher_projection_count: 0,
      guardian_projection_count: 0,
      admin_audit_projection_count: 4
    });
    expect(artifact.runtime_admin_audit_projection?.map((event) => event.event_type)).toEqual([
      "stage_start",
      "stage_end",
      "stage_start",
      "stage_end"
    ]);
  });

  it("requires explicit provider credentials for env-created review gateways", () => {
    expect(() => createContentPipelineReviewGatewayFromEnv({})).toThrow(
      "Missing CONTENT_PIPELINE_OPENAI_API_KEY or CONTENT_PIPELINE_OPENAI_MODEL"
    );
  });

  it("accepts zhipu OpenAI-compatible review provider configuration", () => {
    expect(() =>
      createContentPipelineReviewGatewayFromEnv({
        CONTENT_PIPELINE_REVIEW_PROVIDER: "zhipu-openai-compatible",
        CONTENT_PIPELINE_ZHIPU_API_KEY: "test-zhipu-key",
        CONTENT_PIPELINE_ZHIPU_MODEL: "glm-5.1"
      })
    ).not.toThrow();
  });

  it("requires zhipu-specific credentials for zhipu review provider", () => {
    expect(() =>
      createContentPipelineReviewGatewayFromEnv({
        CONTENT_PIPELINE_REVIEW_PROVIDER: "zhipu-openai-compatible"
      })
    ).toThrow("Missing CONTENT_PIPELINE_ZHIPU_API_KEY or CONTENT_PIPELINE_ZHIPU_MODEL");
  });

  it("accepts aggregator OpenAI-compatible review provider configuration", () => {
    expect(() =>
      createContentPipelineReviewGatewayFromEnv({
        CONTENT_PIPELINE_REVIEW_PROVIDER: "aggregator-openai-compatible",
        CONTENT_PIPELINE_AGGREGATOR_API_KEY: "test-aggregator-key",
        CONTENT_PIPELINE_AGGREGATOR_MODEL: "provider/model-name",
        CONTENT_PIPELINE_AGGREGATOR_BASE_URL: "https://aggregator.example/v1"
      })
    ).not.toThrow();
  });

  it("requires aggregator-specific credentials and base URL for aggregator review provider", () => {
    expect(() =>
      createContentPipelineReviewGatewayFromEnv({
        CONTENT_PIPELINE_REVIEW_PROVIDER: "aggregator-openai-compatible",
        CONTENT_PIPELINE_AGGREGATOR_API_KEY: "test-aggregator-key",
        CONTENT_PIPELINE_AGGREGATOR_MODEL: "provider/model-name"
      })
    ).toThrow(
      "Missing CONTENT_PIPELINE_AGGREGATOR_API_KEY, CONTENT_PIPELINE_AGGREGATOR_MODEL, or CONTENT_PIPELINE_AGGREGATOR_BASE_URL"
    );
  });

  it("rejects invalid review provider timeout configuration", () => {
    expect(() =>
      createContentPipelineReviewGatewayFromEnv({
        CONTENT_PIPELINE_REVIEW_PROVIDER: "zhipu-openai-compatible",
        CONTENT_PIPELINE_ZHIPU_API_KEY: "test-zhipu-key",
        CONTENT_PIPELINE_ZHIPU_MODEL: "glm-5.1",
        CONTENT_PIPELINE_REVIEW_TIMEOUT_MS: "0"
      })
    ).toThrow("CONTENT_PIPELINE_REVIEW_TIMEOUT_MS must be a positive integer");
  });
});
