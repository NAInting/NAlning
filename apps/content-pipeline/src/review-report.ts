import type { UnitReviewArtifact, UnitReviewDiffChange } from "./review-runner";

export function renderUnitReviewMarkdownReport(artifact: UnitReviewArtifact): string {
  const lines = [
    `# Unit Review Report: ${artifact.unit_id}`,
    "",
    `- Schema: \`${artifact.schema_version}\``,
    `- Mode: \`${artifact.mode}\``,
    `- Generated at: ${artifact.generated_at}`,
    `- Status: \`${artifact.status}\``,
    `- Writeback performed: \`${artifact.writeback_performed}\``,
    `- Approval: \`${artifact.approval?.status ?? "not_approved"}\``,
    ...(artifact.approval
      ? [
          `- Reviewer: \`${artifact.approval.reviewer_id}\``,
          `- Reviewed at: ${artifact.approval.reviewed_at}`
        ]
      : []),
    `- Candidate patches: ${artifact.candidate_patches.length}`,
    `- Semantic validation: \`${artifact.semantic_validation?.passed ?? "not_run"}\``,
    ...(artifact.semantic_validation
      ? [
          `- Semantic errors: ${artifact.semantic_validation.error_count}`,
          `- Semantic warnings: ${artifact.semantic_validation.warning_count}`
        ]
      : []),
    "",
    "## Workflow Runs",
    "",
    "| Agent | Status | Attempts | Sections |",
    "| --- | --- | ---: | --- |",
    ...artifact.workflow_runs.map((run) =>
      `| \`${run.role}\` | \`${run.status}\` | ${run.attempts} | ${run.patch_sections.map((section) => `\`${section}\``).join(", ") || "-"} |`
    ),
    ""
  ];

  if (artifact.rerun_context) {
    lines.push(
      "## Rerun Context",
      "",
      `- Rerun chain depth: ${artifact.rerun_context.rerun_chain_depth}`,
      `- Rerun root artifact generated at: ${artifact.rerun_context.rerun_root_artifact_generated_at}`,
      `- Source artifact generated at: ${artifact.rerun_context.source_artifact_generated_at}`,
      `- Source artifact status: \`${artifact.rerun_context.source_artifact_status}\``,
      `- Source retry decision: \`${artifact.rerun_context.source_retry_decision ?? "n/a"}\``,
      `- Source recommended rerun from: \`${artifact.rerun_context.source_recommended_rerun_from ?? "n/a"}\``,
      `- Scoped rerun start: \`${artifact.rerun_context.start_from_role}\``,
      `- Inherited prior roles: ${artifact.rerun_context.inherited_roles.map((role) => `\`${role}\``).join(", ") || "-"}`,
      ""
    );
  }

  for (const candidate of artifact.candidate_patches) {
    lines.push(
      `## Candidate Patch: ${candidate.role}`,
      "",
      `- Sections: ${candidate.patch_sections.map((section) => `\`${section}\``).join(", ") || "-"}`,
      `- Diff changes: ${candidate.diff.length}`,
      ""
    );

    if (candidate.diff.length === 0) {
      lines.push("_No field-level changes detected._", "");
      continue;
    }

    lines.push("| Path | Change |", "| --- | --- |");
    for (const change of candidate.diff) {
      lines.push(`| \`${change.path}\` | \`${change.change_type}\` |`);
    }

    lines.push("");
    for (const change of candidate.diff) {
      lines.push(renderDiffDetails(change), "");
    }
  }

  if (artifact.semantic_validation && !artifact.semantic_validation.passed) {
    lines.push("## Semantic Validation Issues", "", "| Severity | Code | Path | Message |", "| --- | --- | --- | --- |");
    for (const issue of artifact.semantic_validation.issues) {
      lines.push(
        `| \`${issue.severity}\` | \`${issue.code}\` | \`${issue.path}\` | ${escapeMarkdownTableCell(issue.message)} |`
      );
    }
    lines.push("");
  }

  if (artifact.repair_plan) {
    lines.push(
      "## Suggested Repair Plan",
      "",
      `- Derived from: \`${artifact.repair_plan.source}\``,
      `- Recommended rerun from: \`${artifact.repair_plan.recommended_rerun_from}\``,
      `- Recommended rerun roles: ${artifact.repair_plan.recommended_rerun_roles.map((role) => `\`${role}\``).join(", ") || "-"}`,
      "",
      "| Trigger | Root owner | Impacted owner | Rerun from | Reason |",
      "| --- | --- | --- | --- | --- |"
    );
    for (const recommendation of artifact.repair_plan.recommendations) {
      lines.push(
        `| \`${recommendation.trigger}\` | \`${recommendation.root_owner}\` | \`${recommendation.impacted_owner}\` | \`${recommendation.rerun_from}\` | ${escapeMarkdownTableCell(recommendation.reason)} |`
      );
    }
    lines.push("");
  }

  if (artifact.retry_policy) {
    lines.push(
      "## Retry Policy",
      "",
      `- Decision: \`${artifact.retry_policy.decision}\``,
      `- Reason: ${artifact.retry_policy.reason}`,
      `- Recommended rerun from: \`${artifact.retry_policy.recommended_rerun_from}\``,
      `- Recommended rerun roles: ${artifact.retry_policy.recommended_rerun_roles.map((role) => `\`${role}\``).join(", ") || "-"}`,
      `- Failed role: \`${artifact.retry_policy.failed_role ?? "n/a"}\``,
      `- Failure category: \`${artifact.retry_policy.failure_category ?? "n/a"}\``,
      `- Failed role attempts: ${artifact.retry_policy.failed_role_attempts ?? "n/a"}`,
      `- Prior rerun from: \`${artifact.retry_policy.prior_rerun_from ?? "n/a"}\``,
      ""
    );
  }

  if (artifact.orchestration_guidance) {
    lines.push(
      "## Orchestration Guidance",
      "",
      `- Action: \`${artifact.orchestration_guidance.action}\``,
      `- Reason: ${artifact.orchestration_guidance.reason}`,
      `- Requires provider execution: \`${artifact.orchestration_guidance.requires_provider_execution}\``,
      `- Requires human decision: \`${artifact.orchestration_guidance.requires_human_decision}\``,
      `- Human queue: \`${artifact.orchestration_guidance.human_queue}\``,
      `- Automation step: \`${artifact.orchestration_guidance.automation_step}\``,
      `- Provider execution allowed without human: \`${artifact.orchestration_guidance.provider_execution_allowed_without_human}\``,
      `- Primary human action: \`${artifact.orchestration_guidance.primary_human_action}\``,
      `- Inbox title: ${artifact.orchestration_guidance.inbox_title}`,
      `- Inbox summary: ${artifact.orchestration_guidance.inbox_summary}`,
      `- Recommended rerun from: \`${artifact.orchestration_guidance.recommended_rerun_from ?? "n/a"}\``,
      `- Rerun chain depth: ${artifact.orchestration_guidance.rerun_chain_depth}`,
      ""
    );
  }

  lines.push(
    "## Safety Notes",
    "",
    "- This report is generated from parsed candidate patches, not raw provider responses.",
    "- This report does not imply approval and does not write back to `unit.yaml`.",
    "- Apply requires a separate human-reviewed artifact flow.",
    ""
  );

  return `${lines.join("\n").trimEnd()}\n`;
}

function renderDiffDetails(change: UnitReviewDiffChange): string {
  const body = {
    ...(Object.prototype.hasOwnProperty.call(change, "before") ? { before: change.before } : {}),
    ...(Object.prototype.hasOwnProperty.call(change, "after") ? { after: change.after } : {})
  };

  return [
    `<details>`,
    `<summary><code>${escapeHtml(change.path)}</code> (${change.change_type})</summary>`,
    "",
    "```json",
    JSON.stringify(body, null, 2),
    "```",
    "",
    `</details>`
  ].join("\n");
}

function escapeMarkdownTableCell(value: string): string {
  return escapeHtml(value).replaceAll("|", "\\|");
}

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
