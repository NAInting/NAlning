import { describe, expect, it } from "vitest";

import type {
  SafeExecutionSourceChainSpec,
  SafeExecutionSourceContext,
  SafeExecutionTransitionSpec,
} from "../src";
import {
  buildSafeExecutionTransitionArtifact,
  clearUntrustedDownstreamMetadataOnInvalidSource,
  deriveStableOperationKey,
  renderManualTriagePayload,
  shouldClearUntrustedDownstreamMetadata,
  validateSafeExecutionSourceChain,
  validateSafeExecutionTransition,
  validateSafeExecutionTransitionArtifact,
  validateSafeExecutionTransitionSpec,
} from "../src";

describe("safe execution contract", () => {
  const baseSpec: SafeExecutionTransitionSpec = {
    transition: "render_repair_request",
    from_states: ["blocked", "manual_triage_required"],
    to_state: "repair_required",
    required_source_schema_versions: ["content-pipeline-review-artifact/v0.1"],
    provider_spend_allowed: false,
    requires_human_decision: true,
    writes_source_unit: false,
    output_schema_version: "content-pipeline-repair-request/v0.1",
    failure_behavior: "repair_required",
    audit_safe_fields: ["unit_id", "artifact_status", "issue_codes"],
  };

  const baseSource: SafeExecutionSourceContext = {
    current_state: "blocked",
    source_schema_version: "content-pipeline-review-artifact/v0.1",
    source_valid: true,
    blocked: true,
    human_decision_grants_provider_spend: false,
    apply_approved: false,
  };

  const sourceChainSpec: SafeExecutionSourceChainSpec = {
    links: [
      {
        link_key: "review_artifact",
        accepted_schema_versions: ["content-pipeline-review-artifact/v0.1"],
        allowed_states: ["blocked"],
        allow_blocked: true,
        requires_valid_source: true,
        must_clear_untrusted_downstream_metadata: false,
      },
      {
        link_key: "repair_request",
        accepted_schema_versions: ["content-pipeline-repair-request/v0.1"],
        allowed_states: ["repair_required"],
        allow_blocked: false,
        requires_valid_source: true,
        must_clear_untrusted_downstream_metadata: true,
      },
    ],
  };

  it("accepts a no-spend repair transition from a blocked review artifact", () => {
    const result = validateSafeExecutionTransition(baseSource, baseSpec);

    expect(result).toMatchObject({
      ok: true,
      error_count: 0,
      warning_count: 0,
    });
  });

  it("accepts a valid safe execution source chain", () => {
    const result = validateSafeExecutionSourceChain(
      [
        {
          link_key: "review_artifact",
          schema_version: "content-pipeline-review-artifact/v0.1",
          state: "blocked",
          source_valid: true,
          blocked: true,
          audit_safe_fields: ["unit_id", "artifact_status"],
        },
        {
          link_key: "repair_request",
          schema_version: "content-pipeline-repair-request/v0.1",
          state: "repair_required",
          source_valid: true,
          blocked: false,
          contains_untrusted_downstream_metadata: true,
          untrusted_downstream_metadata_cleared: true,
          audit_safe_fields: ["unit_id", "issue_codes"],
        },
      ],
      sourceChainSpec
    );

    expect(result).toMatchObject({
      ok: true,
      error_count: 0,
      warning_count: 0,
    });
  });

  it("fails safe execution source chains closed when links drift from the expected contract", () => {
    const result = validateSafeExecutionSourceChain(
      [
        {
          link_key: "review_artifact",
          schema_version: "content-pipeline-review-artifact/v9.9",
          state: "executed",
          source_valid: false,
          blocked: true,
        },
        {
          link_key: "provider_receipt",
          schema_version: "content-pipeline-repair-request/v0.1",
          state: "repair_required",
          source_valid: true,
          blocked: true,
          contains_untrusted_downstream_metadata: true,
        },
      ],
      sourceChainSpec
    );

    expect(result.ok).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "source_chain_schema_version_not_allowed" }),
        expect.objectContaining({ code: "source_chain_state_not_allowed" }),
        expect.objectContaining({ code: "source_chain_invalid_link" }),
        expect.objectContaining({ code: "source_chain_link_key_mismatch" }),
        expect.objectContaining({ code: "source_chain_blocked_link_not_allowed" }),
        expect.objectContaining({ code: "source_chain_untrusted_metadata_not_cleared" }),
      ])
    );
  });

  it("rejects empty or truncated safe execution source chains", () => {
    const emptyResult = validateSafeExecutionSourceChain([], sourceChainSpec);
    const truncatedResult = validateSafeExecutionSourceChain(
      [
        {
          link_key: "review_artifact",
          schema_version: "content-pipeline-review-artifact/v0.1",
          state: "blocked",
          source_valid: true,
          blocked: true,
        },
      ],
      sourceChainSpec
    );

    expect(emptyResult.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "source_chain_empty" }),
        expect.objectContaining({ code: "source_chain_length_mismatch" }),
      ])
    );
    expect(truncatedResult.issues).toContainEqual(
      expect.objectContaining({ code: "source_chain_length_mismatch" })
    );
  });

  it("blocks unsafe audit fields inside safe execution source chains", () => {
    const result = validateSafeExecutionSourceChain(
      [
        {
          link_key: "review_artifact",
          schema_version: "content-pipeline-review-artifact/v0.1",
          state: "blocked",
          source_valid: true,
          blocked: true,
          audit_safe_fields: ["unit_id", "raw_model_output"],
        },
        {
          link_key: "repair_request",
          schema_version: "content-pipeline-repair-request/v0.1",
          state: "repair_required",
          source_valid: true,
          blocked: false,
          untrusted_downstream_metadata_cleared: true,
          audit_safe_fields: ["issue_codes", "\u5b66\u751f\u8bed\u97f3\u8f6c\u5199"],
        },
      ],
      sourceChainSpec
    );

    expect(result.ok).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "unsafe_audit_field", path: "source_chain.0.audit_safe_fields.1" }),
        expect.objectContaining({ code: "unsafe_audit_field", path: "source_chain.1.audit_safe_fields.1" }),
      ])
    );
  });

  it("builds a machine-readable transition artifact only after validation passes", () => {
    const artifact = buildSafeExecutionTransitionArtifact(baseSource, baseSpec);

    expect(artifact).toMatchObject({
      schema_version: "safe-execution-transition-artifact/v0.1",
      transition: "render_repair_request",
      from_state: "blocked",
      to_state: "repair_required",
      ok_to_advance: true,
      effective_provider_spend_allowed: false,
      effective_source_writeback_allowed: false,
      issue_codes: [],
      audit_safe_fields: ["unit_id", "artifact_status", "issue_codes"],
    });
  });

  it("accepts transition artifacts produced from a validated source and spec", () => {
    const artifact = buildSafeExecutionTransitionArtifact(baseSource, baseSpec);
    const result = validateSafeExecutionTransitionArtifact(artifact, baseSpec);

    expect(result).toMatchObject({
      ok: true,
      error_count: 0,
      warning_count: 0,
    });
  });

  it("rejects transition artifacts that carry unknown issue codes", () => {
    const artifact = buildSafeExecutionTransitionArtifact(
      {
        ...baseSource,
        source_valid: false,
      },
      baseSpec
    );
    const forgedArtifact = {
      ...artifact,
      issue_codes: ["invalid_source_contract", "made_up_follow_up_code" as any],
    };
    const result = validateSafeExecutionTransitionArtifact(forgedArtifact, baseSpec);

    expect(result.ok).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: "transition_artifact_unknown_issue_code",
        path: "issue_codes.1",
      })
    );
  });

  it("rejects failed transition artifacts that omit invariant issue codes", () => {
    const artifact = buildSafeExecutionTransitionArtifact(
      {
        ...baseSource,
        source_valid: false,
      },
      baseSpec
    );
    const forgedArtifact = {
      ...artifact,
      issue_codes: [],
    };
    const result = validateSafeExecutionTransitionArtifact(forgedArtifact, baseSpec);

    expect(result.ok).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: "transition_artifact_failure_without_issues",
        path: "issue_codes",
      })
    );
  });

  it("rejects transition artifacts that mint success despite invariant issues", () => {
    const artifact = buildSafeExecutionTransitionArtifact(
      {
        ...baseSource,
        source_valid: false,
      },
      baseSpec
    );
    const forgedArtifact = {
      ...artifact,
      ok_to_advance: true,
      to_state: "repair_required" as const,
    };
    const result = validateSafeExecutionTransitionArtifact(forgedArtifact, baseSpec);

    expect(result.ok).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "transition_artifact_success_with_issues" }),
      ])
    );
  });

  it("rejects transition artifacts that mint provider spend or source writeback", () => {
    const artifact = buildSafeExecutionTransitionArtifact(baseSource, baseSpec);
    const forgedArtifact = {
      ...artifact,
      effective_provider_spend_allowed: true,
      effective_source_writeback_allowed: true,
    };
    const result = validateSafeExecutionTransitionArtifact(forgedArtifact, baseSpec);

    expect(result.ok).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "transition_artifact_mints_provider_spend" }),
        expect.objectContaining({ code: "transition_artifact_mints_source_writeback" }),
      ])
    );
  });

  it("rejects transition artifacts that claim an unexpected next state or audit field", () => {
    const artifact = buildSafeExecutionTransitionArtifact(baseSource, baseSpec);
    const forgedArtifact = {
      ...artifact,
      to_state: "authorized_pending_execution" as const,
      audit_safe_fields: ["unit_id", "raw_model_output"],
    };
    const result = validateSafeExecutionTransitionArtifact(forgedArtifact, baseSpec);

    expect(result.ok).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "transition_artifact_to_state_mismatch" }),
        expect.objectContaining({ code: "transition_artifact_audit_fields_not_allowed" }),
        expect.objectContaining({ code: "unsafe_audit_field" }),
      ])
    );
  });

  it("fails transition artifacts closed without minting spend or source writeback permissions", () => {
    const artifact = buildSafeExecutionTransitionArtifact(
      {
        ...baseSource,
        source_valid: false,
        contains_untrusted_downstream_metadata: true,
        human_decision_grants_provider_spend: true,
        apply_approved: true,
        target_path: "content/units/math-g8-s1-linear-function-concept/unit.yaml",
      },
      {
        ...baseSpec,
        transition: "authorize_attempt",
        to_state: "authorized_pending_execution",
        provider_spend_allowed: true,
        writes_source_unit: true,
      }
    );

    expect(artifact).toMatchObject({
      to_state: null,
      ok_to_advance: false,
      effective_provider_spend_allowed: false,
      effective_source_writeback_allowed: false,
      audit_safe_fields: [],
    });
    expect(artifact.issue_codes).toEqual(
      expect.arrayContaining(["invalid_source_contract", "blocked_source_cannot_advance", "untrusted_downstream_metadata_must_be_cleared"])
    );
  });

  it("blocks transitions from states outside the declared source set", () => {
    const result = validateSafeExecutionTransition(
      {
        ...baseSource,
        current_state: "executed",
      },
      baseSpec
    );

    expect(result.ok).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: "transition_source_state_not_allowed" })
    );
  });

  it("blocks schema mismatches before building follow-up artifacts", () => {
    const result = validateSafeExecutionTransition(
      {
        ...baseSource,
        source_schema_version: "content-pipeline-review-artifact/v9.9",
      },
      baseSpec
    );

    expect(result.ok).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: "source_schema_version_not_allowed" })
    );
  });

  it("prevents blocked sources from jumping into execution or handoff states", () => {
    const result = validateSafeExecutionTransition(baseSource, {
      ...baseSpec,
      transition: "authorize_attempt",
      to_state: "authorized_pending_execution",
      provider_spend_allowed: true,
    });

    expect(result.ok).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "blocked_source_cannot_advance" }),
        expect.objectContaining({ code: "provider_spend_without_human_decision" }),
      ])
    );
  });

  it("requires human approval for provider spend in transition specs", () => {
    const result = validateSafeExecutionTransitionSpec({
      ...baseSpec,
      transition: "authorize_attempt",
      to_state: "authorized_pending_execution",
      provider_spend_allowed: true,
      requires_human_decision: false,
    });

    expect(result.ok).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: "provider_spend_requires_human_decision" })
    );
  });

  it("rejects transition specs with unknown failure behavior", () => {
    const result = validateSafeExecutionTransitionSpec({
      ...baseSpec,
      failure_behavior: "approve_anyway" as any,
    });

    expect(result.ok).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: "unknown_failure_behavior",
        path: "failure_behavior",
      })
    );
  });

  it("requires human approval for source writeback in transition specs", () => {
    const result = validateSafeExecutionTransitionSpec({
      ...baseSpec,
      transition: "close_or_repair",
      to_state: "closed",
      requires_human_decision: false,
      writes_source_unit: true,
    });

    expect(result.ok).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: "source_writeback_requires_human_decision" })
    );
  });

  it("requires explicit apply approval and a target path before source writeback", () => {
    const result = validateSafeExecutionTransition(
      {
        ...baseSource,
        current_state: "approved_no_spend",
        blocked: false,
      },
      {
        ...baseSpec,
        transition: "close_or_repair",
        from_states: ["approved_no_spend"],
        to_state: "closed",
        writes_source_unit: true,
      }
    );

    expect(result.ok).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: "source_writeback_without_explicit_apply" })
    );
  });

  it("allows explicit source writeback only when apply approval and target path are present", () => {
    const result = validateSafeExecutionTransition(
      {
        ...baseSource,
        current_state: "approved_no_spend",
        blocked: false,
        apply_approved: true,
        target_path: "content/units/math-g8-s1-linear-function-concept/unit.yaml",
      },
      {
        ...baseSpec,
        transition: "close_or_repair",
        from_states: ["approved_no_spend"],
        to_state: "closed",
        writes_source_unit: true,
      }
    );

    expect(result).toMatchObject({
      ok: true,
      error_count: 0,
    });
  });

  it("blocks source writeback target paths outside repository unit YAML files", () => {
    const writebackSpec: SafeExecutionTransitionSpec = {
      ...baseSpec,
      transition: "close_or_repair",
      from_states: ["approved_no_spend"],
      to_state: "closed",
      writes_source_unit: true,
    };

    for (const targetPath of [
      "C:\\Users\\User\\Desktop\\student-data\\unit.yaml",
      "../content/units/math-g8/unit.yaml",
      "docs/unit.yaml",
      "content/units/math-g8/unit.json",
    ]) {
      const result = validateSafeExecutionTransition(
        {
          ...baseSource,
          current_state: "approved_no_spend",
          blocked: false,
          apply_approved: true,
          target_path: targetPath,
        },
        writebackSpec
      );

      expect(result.ok).toBe(false);
      expect(result.issues).toContainEqual(
        expect.objectContaining({ code: "source_writeback_target_path_not_allowed" })
      );
    }
  });

  it("builds source writeback transition artifacts with an auditable target path", () => {
    const writebackSpec: SafeExecutionTransitionSpec = {
      ...baseSpec,
      transition: "close_or_repair",
      from_states: ["approved_no_spend"],
      to_state: "closed",
      writes_source_unit: true,
    };
    const artifact = buildSafeExecutionTransitionArtifact(
      {
        ...baseSource,
        current_state: "approved_no_spend",
        blocked: false,
        apply_approved: true,
        target_path: "content/units/math-g8-s1-linear-function-concept/unit.yaml",
      },
      writebackSpec
    );
    const result = validateSafeExecutionTransitionArtifact(artifact, writebackSpec);

    expect(artifact).toMatchObject({
      ok_to_advance: true,
      effective_source_writeback_allowed: true,
      source_writeback_target_path: "content/units/math-g8-s1-linear-function-concept/unit.yaml",
    });
    expect(result).toMatchObject({
      ok: true,
      error_count: 0,
    });
  });

  it("rejects source writeback artifacts without a valid auditable target path", () => {
    const writebackSpec: SafeExecutionTransitionSpec = {
      ...baseSpec,
      transition: "close_or_repair",
      from_states: ["approved_no_spend"],
      to_state: "closed",
      writes_source_unit: true,
    };
    const artifact = buildSafeExecutionTransitionArtifact(
      {
        ...baseSource,
        current_state: "approved_no_spend",
        blocked: false,
        apply_approved: true,
        target_path: "content/units/math-g8-s1-linear-function-concept/unit.yaml",
      },
      writebackSpec
    );
    const {
      source_writeback_target_path: _sourceWritebackTargetPath,
      ...artifactWithoutTargetPath
    } = artifact;

    for (const forgedArtifact of [
      artifactWithoutTargetPath,
      { ...artifact, source_writeback_target_path: "../content/units/unit.yaml" },
    ]) {
      const result = validateSafeExecutionTransitionArtifact(forgedArtifact, writebackSpec);

      expect(result.ok).toBe(false);
      expect(result.issues).toContainEqual(
        expect.objectContaining({ code: "transition_artifact_source_writeback_target_path_invalid" })
      );
    }
  });

  it("rejects transition artifacts that carry a source writeback target path without source writeback permission", () => {
    const artifact = {
      ...buildSafeExecutionTransitionArtifact(baseSource, baseSpec),
      source_writeback_target_path: "content/units/math-g8-s1-linear-function-concept/unit.yaml",
    };
    const result = validateSafeExecutionTransitionArtifact(artifact, baseSpec);

    expect(result.ok).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: "transition_artifact_source_writeback_target_path_invalid" })
    );
  });

  it("blocks unsafe audit and log fields", () => {
    const result = validateSafeExecutionTransition(
      {
        ...baseSource,
        raw_log_field_names: ["trace_id", "raw_model_output"],
      },
      {
        ...baseSpec,
        audit_safe_fields: ["unit_id", "hidden_reasoning"],
      }
    );

    expect(result.ok).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "unsafe_audit_field", path: "audit_safe_fields.1" }),
        expect.objectContaining({ code: "unsafe_audit_field", path: "raw_log_field_names.1" }),
      ])
    );
  });

  it("blocks unsafe audit and log field aliases with separators or compact casing", () => {
    const result = validateSafeExecutionTransition(
      {
        ...baseSource,
        raw_log_field_names: ["trace_id", "raw-model-output", "student memory"],
      },
      {
        ...baseSpec,
        audit_safe_fields: ["unit_id", "hidden reasoning", "rawProviderOutput"],
      }
    );

    expect(result.ok).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "unsafe_audit_field", path: "audit_safe_fields.1" }),
        expect.objectContaining({ code: "unsafe_audit_field", path: "audit_safe_fields.2" }),
        expect.objectContaining({ code: "unsafe_audit_field", path: "raw_log_field_names.1" }),
        expect.objectContaining({ code: "unsafe_audit_field", path: "raw_log_field_names.2" }),
      ])
    );
  });

  it("blocks unsafe audit and log field aliases with Chinese names", () => {
    const result = validateSafeExecutionTransition(
      {
        ...baseSource,
        raw_log_field_names: ["trace_id", "\u5b66\u751f\u8bed\u97f3\u8f6c\u5199", "\u5bb6\u5ead\u51b2\u7a81\u7ec6\u8282"],
      },
      {
        ...baseSpec,
        audit_safe_fields: ["unit_id", "\u6a21\u578b\u539f\u59cb\u8f93\u51fa", "\u5b66\u751f\u957f\u671f\u8bb0\u5fc6"],
      }
    );

    expect(result.ok).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "unsafe_audit_field", path: "audit_safe_fields.1" }),
        expect.objectContaining({ code: "unsafe_audit_field", path: "audit_safe_fields.2" }),
        expect.objectContaining({ code: "unsafe_audit_field", path: "raw_log_field_names.1" }),
        expect.objectContaining({ code: "unsafe_audit_field", path: "raw_log_field_names.2" }),
      ])
    );
  });

  it("marks untrusted downstream metadata for clearing when the source chain is invalid", () => {
    const invalidSource: SafeExecutionSourceContext = {
      ...baseSource,
      source_valid: false,
      contains_untrusted_downstream_metadata: true,
    };
    const result = validateSafeExecutionTransition(invalidSource, baseSpec);

    expect(shouldClearUntrustedDownstreamMetadata(invalidSource)).toBe(true);
    expect(result.ok).toBe(false);
    expect(result.warning_count).toBe(1);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "invalid_source_contract" }),
        expect.objectContaining({ code: "untrusted_downstream_metadata_must_be_cleared" }),
      ])
    );
  });

  it("clears only nominated untrusted downstream metadata when source validation fails", () => {
    const invalidSource: SafeExecutionSourceContext = {
      ...baseSource,
      source_valid: false,
      contains_untrusted_downstream_metadata: true,
    };
    const payload = {
      schema_version: "safe-follow-up-reconciliation/v0.1",
      source_contract_schema_version: "content-pipeline-review-artifact/v0.1",
      final_delivery_status: "delivered",
      final_follow_up_item_key: "possibly-forged-item",
      trusted_issue_codes: ["invalid_source_contract"],
    };

    const sanitized = clearUntrustedDownstreamMetadataOnInvalidSource(invalidSource, payload, [
      "final_delivery_status",
      "final_follow_up_item_key",
    ]);

    expect(sanitized).toEqual({
      schema_version: "safe-follow-up-reconciliation/v0.1",
      source_contract_schema_version: "content-pipeline-review-artifact/v0.1",
      final_delivery_status: null,
      final_follow_up_item_key: null,
      trusted_issue_codes: ["invalid_source_contract"],
    });
    expect(payload.final_delivery_status).toBe("delivered");
  });

  it("preserves downstream metadata when the source chain is valid", () => {
    const payload = {
      final_delivery_status: "delivered",
      final_follow_up_item_key: "trusted-item",
    };

    const sanitized = clearUntrustedDownstreamMetadataOnInvalidSource(baseSource, payload, [
      "final_delivery_status",
      "final_follow_up_item_key",
    ]);

    expect(sanitized).toEqual(payload);
  });

  it("derives deterministic sanitized operation keys for manual routing", () => {
    const key = deriveStableOperationKey({
      unit_id: "math/g8 linear function",
      transition: "route_follow_up",
      source_key: "artifact:2026-04-26 16:00",
      attempt: "attempt#1",
    });

    expect(key).toBe("safe-execution:math_g8_linear_function:route_follow_up:artifact_2026-04-26_16_00:attempt_1");
    expect(key).toBe(
      deriveStableOperationKey({
        unit_id: "math/g8 linear function",
        transition: "route_follow_up",
        source_key: "artifact:2026-04-26 16:00",
        attempt: "attempt#1",
      })
    );
  });

  it("renders deterministic manual triage payloads without spend or writeback permissions", () => {
    const source: SafeExecutionSourceContext = {
      ...baseSource,
      source_valid: false,
      contains_untrusted_downstream_metadata: true,
    };
    const issue = validateSafeExecutionTransition(source, baseSpec).issues.find(
      (item) => item.code === "invalid_source_contract"
    )!;

    const payload = renderManualTriagePayload({
      unit_id: "math/g8 linear function",
      source_key: "artifact:2026-04-26 16:00",
      source,
      spec: baseSpec,
      issue,
      attempt: "attempt#1",
    });

    expect(payload).toMatchObject({
      schema_version: "safe-execution-manual-triage/v0.1",
      operation_key:
        "safe-execution:math_g8_linear_function:render_repair_request:artifact_2026-04-26_16_00_invalid_source_contract_source_valid:attempt_1",
      transition: "render_repair_request",
      current_state: "blocked",
      source_schema_version: "content-pipeline-review-artifact/v0.1",
      source_valid: false,
      blocked: true,
      issue_code: "invalid_source_contract",
      issue_path: "source_valid",
      next_state: "manual_triage_required",
      provider_spend_allowed: false,
      source_writeback_allowed: false,
      audit_safe_fields: ["unit_id", "artifact_status", "issue_codes"],
    });
    expect(payload).toEqual(
      renderManualTriagePayload({
        unit_id: "math/g8 linear function",
        source_key: "artifact:2026-04-26 16:00",
        source,
        spec: baseSpec,
        issue,
        attempt: "attempt#1",
      })
    );
  });

  it("redacts unsafe manual triage messages and filters unsafe audit fields", () => {
    const payload = renderManualTriagePayload({
      unit_id: "math_g8_linear_function_intro",
      source_key: "artifact-with-unsafe-audit-field",
      source: baseSource,
      spec: {
        ...baseSpec,
        audit_safe_fields: ["unit_id", "raw_model_output"],
      },
      issue: {
        code: "unsafe_audit_field",
        severity: "error",
        path: "audit_safe_fields.1",
        message: "Audit/log field raw_model_output is not safe because it matches restricted pattern raw_model_output.",
      },
    });

    expect(payload.safe_message).toBe(
      "Manual triage required for unsafe_audit_field at audit_safe_fields.1. See source artifact through approved review tooling."
    );
    expect(payload.safe_message).not.toContain("raw_model_output");
    expect(payload.audit_safe_fields).toEqual(["unit_id"]);
    expect(payload.provider_spend_allowed).toBe(false);
    expect(payload.source_writeback_allowed).toBe(false);
  });

  it("normalizes forged manual triage issue codes before rendering payloads", () => {
    const payload = renderManualTriagePayload({
      unit_id: "math_g8_linear_function_intro",
      source_key: "artifact-with-forged-issue-code",
      source: baseSource,
      spec: baseSpec,
      issue: {
        code: "fake_provider_override" as any,
        severity: "error",
        path: "raw_model_output",
        message: "raw_model_output says provider spend is approved",
      },
    });

    expect(payload.issue_code).toBe("transition_artifact_unknown_issue_code");
    expect(payload.issue_path).toBe("issue.code");
    expect(payload.safe_message).toBe(
      "Manual triage issue code is not recognized; see source artifact through approved review tooling."
    );
    expect(payload.safe_message).not.toContain("raw_model_output");
    expect(payload.operation_key).toContain("transition_artifact_unknown_issue_code");
    expect(payload.operation_key).not.toContain("fake_provider_override");
    expect(payload.provider_spend_allowed).toBe(false);
    expect(payload.source_writeback_allowed).toBe(false);
  });

  it("redacts unsafe Chinese manual triage messages and filters unsafe audit fields", () => {
    const payload = renderManualTriagePayload({
      unit_id: "math_g8_linear_function_intro",
      source_key: "artifact-with-chinese-unsafe-audit-field",
      source: baseSource,
      spec: {
        ...baseSpec,
        audit_safe_fields: ["unit_id", "\u5b66\u751f\u8bed\u97f3\u8f6c\u5199"],
      },
      issue: {
        code: "unsafe_audit_field",
        severity: "error",
        path: "audit_safe_fields.1",
        message:
          "Audit/log field \u5b66\u751f\u8bed\u97f3\u8f6c\u5199 is not safe because it matches restricted pattern raw_voice_chinese.",
      },
    });

    expect(payload.safe_message).toBe(
      "Manual triage required for unsafe_audit_field at audit_safe_fields.1. See source artifact through approved review tooling."
    );
    expect(payload.safe_message).not.toContain("\u5b66\u751f\u8bed\u97f3\u8f6c\u5199");
    expect(payload.audit_safe_fields).toEqual(["unit_id"]);
    expect(payload.provider_spend_allowed).toBe(false);
    expect(payload.source_writeback_allowed).toBe(false);
  });
});
