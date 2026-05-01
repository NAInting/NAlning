export type SafeExecutionState =
  | "draft"
  | "source_validated"
  | "blocked"
  | "needs_human_decision"
  | "approved_no_spend"
  | "authorized_pending_execution"
  | "executed"
  | "reconciled"
  | "handoff_ready"
  | "manual_triage_required"
  | "repair_required"
  | "closed";

export type SafeExecutionTransition =
  | "validate_source"
  | "render_repair_request"
  | "render_human_decision"
  | "authorize_attempt"
  | "record_receipt"
  | "reconcile_result"
  | "route_follow_up"
  | "render_delivery_plan"
  | "record_delivery_receipt"
  | "close_or_repair";

export type SafeExecutionFailureBehavior = "fail_closed" | "manual_triage" | "repair_required";

export interface SafeExecutionTransitionSpec {
  transition: SafeExecutionTransition;
  from_states: SafeExecutionState[];
  to_state: SafeExecutionState;
  required_source_schema_versions: string[];
  provider_spend_allowed: boolean;
  requires_human_decision: boolean;
  writes_source_unit: boolean;
  output_schema_version: string;
  failure_behavior: SafeExecutionFailureBehavior;
  audit_safe_fields: string[];
}

export interface SafeExecutionSourceContext {
  current_state: SafeExecutionState;
  source_schema_version: string;
  source_valid: boolean;
  blocked: boolean;
  human_decision_grants_provider_spend: boolean;
  apply_approved: boolean;
  target_path?: string;
  contains_untrusted_downstream_metadata?: boolean;
  raw_log_field_names?: string[];
}

export type SafeExecutionInvariantSeverity = "error" | "warning";

export type SafeExecutionInvariantCode =
  | "empty_transition_source_states"
  | "empty_required_source_schema_versions"
  | "empty_output_schema_version"
  | "provider_spend_requires_human_decision"
  | "source_writeback_requires_human_decision"
  | "unknown_failure_behavior"
  | "unsafe_audit_field"
  | "transition_source_state_not_allowed"
  | "source_schema_version_not_allowed"
  | "invalid_source_contract"
  | "blocked_source_cannot_advance"
  | "provider_spend_without_human_decision"
  | "source_writeback_without_explicit_apply"
  | "source_writeback_target_path_not_allowed"
  | "untrusted_downstream_metadata_must_be_cleared"
  | "transition_artifact_schema_version_mismatch"
  | "transition_artifact_transition_mismatch"
  | "transition_artifact_source_state_not_allowed"
  | "transition_artifact_source_schema_version_not_allowed"
  | "transition_artifact_output_schema_version_mismatch"
  | "transition_artifact_to_state_mismatch"
  | "transition_artifact_success_with_issues"
  | "transition_artifact_failure_without_issues"
  | "transition_artifact_failure_with_to_state"
  | "transition_artifact_mints_provider_spend"
  | "transition_artifact_mints_source_writeback"
  | "transition_artifact_source_writeback_target_path_invalid"
  | "transition_artifact_audit_fields_not_allowed"
  | "transition_artifact_unknown_issue_code";

const KNOWN_SAFE_EXECUTION_INVARIANT_CODES = new Set<string>([
  "empty_transition_source_states",
  "empty_required_source_schema_versions",
  "empty_output_schema_version",
  "provider_spend_requires_human_decision",
  "source_writeback_requires_human_decision",
  "unknown_failure_behavior",
  "unsafe_audit_field",
  "transition_source_state_not_allowed",
  "source_schema_version_not_allowed",
  "invalid_source_contract",
  "blocked_source_cannot_advance",
  "provider_spend_without_human_decision",
  "source_writeback_without_explicit_apply",
  "source_writeback_target_path_not_allowed",
  "untrusted_downstream_metadata_must_be_cleared",
  "transition_artifact_schema_version_mismatch",
  "transition_artifact_transition_mismatch",
  "transition_artifact_source_state_not_allowed",
  "transition_artifact_source_schema_version_not_allowed",
  "transition_artifact_output_schema_version_mismatch",
  "transition_artifact_to_state_mismatch",
  "transition_artifact_success_with_issues",
  "transition_artifact_failure_without_issues",
  "transition_artifact_failure_with_to_state",
  "transition_artifact_mints_provider_spend",
  "transition_artifact_mints_source_writeback",
  "transition_artifact_source_writeback_target_path_invalid",
  "transition_artifact_audit_fields_not_allowed",
  "transition_artifact_unknown_issue_code",
] satisfies readonly SafeExecutionInvariantCode[]);

const KNOWN_SAFE_EXECUTION_FAILURE_BEHAVIORS = new Set<string>([
  "fail_closed",
  "manual_triage",
  "repair_required",
] satisfies readonly SafeExecutionFailureBehavior[]);

export interface SafeExecutionInvariantIssue {
  code: SafeExecutionInvariantCode;
  severity: SafeExecutionInvariantSeverity;
  path: string;
  message: string;
}

export interface SafeExecutionInvariantResult {
  ok: boolean;
  error_count: number;
  warning_count: number;
  issues: SafeExecutionInvariantIssue[];
}

export interface SafeExecutionTransitionArtifact {
  schema_version: "safe-execution-transition-artifact/v0.1";
  transition: SafeExecutionTransition;
  from_state: SafeExecutionState;
  to_state: SafeExecutionState | null;
  source_schema_version: string;
  output_schema_version: string;
  ok_to_advance: boolean;
  effective_provider_spend_allowed: boolean;
  effective_source_writeback_allowed: boolean;
  source_writeback_target_path?: string;
  issue_codes: SafeExecutionInvariantCode[];
  audit_safe_fields: string[];
}

export interface SafeExecutionManualTriagePayload {
  schema_version: "safe-execution-manual-triage/v0.1";
  operation_key: string;
  transition: SafeExecutionTransition;
  current_state: SafeExecutionState;
  source_schema_version: string;
  source_valid: boolean;
  blocked: boolean;
  issue_code: SafeExecutionInvariantCode;
  issue_severity: SafeExecutionInvariantSeverity;
  issue_path: string;
  safe_message: string;
  next_state: "manual_triage_required";
  provider_spend_allowed: false;
  source_writeback_allowed: false;
  audit_safe_fields: string[];
}

export interface SafeExecutionManualTriageInput {
  unit_id: string;
  source_key: string;
  source: SafeExecutionSourceContext;
  spec: SafeExecutionTransitionSpec;
  issue: SafeExecutionInvariantIssue;
  attempt?: string;
}

const ADVANCEMENT_STATES = new Set<SafeExecutionState>([
  "approved_no_spend",
  "authorized_pending_execution",
  "executed",
  "reconciled",
  "handoff_ready",
  "closed",
]);

const UNSAFE_AUDIT_FIELD_PATTERNS = [
  "raw_prompt",
  "raw_model_output",
  "raw_provider_output",
  "raw_student_data",
  "raw_dialogue",
  "hidden_reasoning",
  "voice_audio",
  "voice_transcript",
  "student_memory",
  "emotion_detail",
  "family_detail",
];

const UNSAFE_AUDIT_FIELD_CHINESE_PATTERNS = [
  {
    label: "raw_prompt_chinese",
    pattern: /\u539f\u59cb\s*(\u63d0\u793a\u8bcd|\u63d0\u793a|\u6307\u4ee4)/,
  },
  {
    label: "raw_model_output_chinese",
    pattern: /\u6a21\u578b\s*(\u539f\u59cb\u8f93\u51fa|\u8f93\u51fa\u539f\u6587|\u56de\u7b54\u539f\u6587)/,
  },
  {
    label: "raw_student_data_chinese",
    pattern: /\u5b66\u751f\s*(\u539f\u8bdd|\u9010\u5b57|\u5b8c\u6574\u4f5c\u7b54|\u4f5c\u7b54\u539f\u6587|\u9690\u79c1\u6570\u636e)/,
  },
  {
    label: "raw_voice_chinese",
    pattern: /\u8bed\u97f3\s*(\u8f6c\u5199|\u8f6c\u5f55|\u56de\u653e|\u64ad\u653e|\u5f55\u97f3)|\u539f\u59cb\s*(\u97f3\u9891|\u8bed\u97f3)/,
  },
  {
    label: "student_memory_chinese",
    pattern: /\u5b66\u751f\s*(\u8bb0\u5fc6|\u753b\u50cf)|\u957f\u671f\u8bb0\u5fc6/,
  },
  {
    label: "emotion_or_family_detail_chinese",
    pattern: /\u60c5\u7eea\s*(\u539f\u6587|\u7ec6\u8282|\u5185\u5bb9)|\u5bb6\u5ead\s*(\u51b2\u7a81|\u7ec6\u8282|\u5185\u5bb9|\u60c5\u51b5)/,
  },
];

export function validateSafeExecutionTransitionSpec(
  spec: SafeExecutionTransitionSpec
): SafeExecutionInvariantResult {
  const issues: SafeExecutionInvariantIssue[] = [];

  if (spec.from_states.length === 0) {
    issues.push(errorIssue(
      "empty_transition_source_states",
      "from_states",
      "Safe execution transition must declare at least one allowed source state."
    ));
  }

  if (spec.required_source_schema_versions.length === 0) {
    issues.push(errorIssue(
      "empty_required_source_schema_versions",
      "required_source_schema_versions",
      "Safe execution transition must declare accepted source schema versions."
    ));
  }

  if (spec.output_schema_version.trim().length === 0) {
    issues.push(errorIssue(
      "empty_output_schema_version",
      "output_schema_version",
      "Safe execution transition must declare an output schema version."
    ));
  }

  if (spec.provider_spend_allowed && !spec.requires_human_decision) {
    issues.push(errorIssue(
      "provider_spend_requires_human_decision",
      "requires_human_decision",
      "Provider spend can only be represented by transitions that require an explicit human decision."
    ));
  }

  if (spec.writes_source_unit && !spec.requires_human_decision) {
    issues.push(errorIssue(
      "source_writeback_requires_human_decision",
      "requires_human_decision",
      "Source unit writeback can only be represented by transitions that require an explicit human decision."
    ));
  }

  if (!KNOWN_SAFE_EXECUTION_FAILURE_BEHAVIORS.has(spec.failure_behavior)) {
    issues.push(errorIssue(
      "unknown_failure_behavior",
      "failure_behavior",
      "Safe execution transition must declare a known failure_behavior."
    ));
  }

  issues.push(...findUnsafeAuditFieldIssues(spec.audit_safe_fields, "audit_safe_fields"));

  return buildResult(issues);
}

export function validateSafeExecutionTransition(
  source: SafeExecutionSourceContext,
  spec: SafeExecutionTransitionSpec
): SafeExecutionInvariantResult {
  const issues: SafeExecutionInvariantIssue[] = [
    ...validateSafeExecutionTransitionSpec(spec).issues,
  ];

  if (!spec.from_states.includes(source.current_state)) {
    issues.push(errorIssue(
      "transition_source_state_not_allowed",
      "current_state",
      `Transition ${spec.transition} does not allow source state ${source.current_state}.`
    ));
  }

  if (!spec.required_source_schema_versions.includes(source.source_schema_version)) {
    issues.push(errorIssue(
      "source_schema_version_not_allowed",
      "source_schema_version",
      `Source schema version ${source.source_schema_version} is not accepted by transition ${spec.transition}.`
    ));
  }

  if (!source.source_valid) {
    issues.push(errorIssue(
      "invalid_source_contract",
      "source_valid",
      "Safe execution transition cannot advance from an invalid source contract."
    ));
  }

  if (source.blocked && ADVANCEMENT_STATES.has(spec.to_state)) {
    issues.push(errorIssue(
      "blocked_source_cannot_advance",
      "blocked",
      `Blocked source cannot advance directly to ${spec.to_state}.`
    ));
  }

  if (spec.provider_spend_allowed && !source.human_decision_grants_provider_spend) {
    issues.push(errorIssue(
      "provider_spend_without_human_decision",
      "human_decision_grants_provider_spend",
      "Provider spend is forbidden unless an explicit human or budget decision grants it."
    ));
  }

  if (spec.writes_source_unit && (!source.apply_approved || !hasTargetPath(source))) {
    issues.push(errorIssue(
      "source_writeback_without_explicit_apply",
      "apply_approved",
      "Source unit writeback requires explicit apply approval and a concrete target path."
    ));
  }

  if (spec.writes_source_unit && hasTargetPath(source) && !isAllowedSourceUnitTargetPath(source.target_path!)) {
    issues.push(errorIssue(
      "source_writeback_target_path_not_allowed",
      "target_path",
      "Source unit writeback target_path must be a repository-relative YAML file under content/units/."
    ));
  }

  if (shouldClearUntrustedDownstreamMetadata(source)) {
    issues.push({
      code: "untrusted_downstream_metadata_must_be_cleared",
      severity: "warning",
      path: "contains_untrusted_downstream_metadata",
      message:
        "Invalid source chains must clear untrusted downstream metadata before a follow-up artifact can be trusted.",
    });
  }

  issues.push(...findUnsafeAuditFieldIssues(source.raw_log_field_names ?? [], "raw_log_field_names"));

  return buildResult(issues);
}

export function buildSafeExecutionTransitionArtifact(
  source: SafeExecutionSourceContext,
  spec: SafeExecutionTransitionSpec
): SafeExecutionTransitionArtifact {
  const validation = validateSafeExecutionTransition(source, spec);
  const okToAdvance = validation.ok;
  const effectiveSourceWritebackAllowed =
    okToAdvance && spec.writes_source_unit && source.apply_approved && hasTargetPath(source);

  return {
    schema_version: "safe-execution-transition-artifact/v0.1",
    transition: spec.transition,
    from_state: source.current_state,
    to_state: okToAdvance ? spec.to_state : null,
    source_schema_version: source.source_schema_version,
    output_schema_version: spec.output_schema_version,
    ok_to_advance: okToAdvance,
    effective_provider_spend_allowed: okToAdvance && spec.provider_spend_allowed && source.human_decision_grants_provider_spend,
    effective_source_writeback_allowed: effectiveSourceWritebackAllowed,
    ...(effectiveSourceWritebackAllowed ? { source_writeback_target_path: source.target_path } : {}),
    issue_codes: validation.issues.map((issue) => issue.code),
    audit_safe_fields: okToAdvance ? [...spec.audit_safe_fields] : [],
  };
}

export function validateSafeExecutionTransitionArtifact(
  artifact: SafeExecutionTransitionArtifact,
  spec: SafeExecutionTransitionSpec
): SafeExecutionInvariantResult {
  const issues: SafeExecutionInvariantIssue[] = [
    ...validateSafeExecutionTransitionSpec(spec).issues,
  ];

  if (artifact.schema_version !== "safe-execution-transition-artifact/v0.1") {
    issues.push(errorIssue(
      "transition_artifact_schema_version_mismatch",
      "schema_version",
      "Safe execution transition artifact has an unsupported schema version."
    ));
  }

  if (artifact.transition !== spec.transition) {
    issues.push(errorIssue(
      "transition_artifact_transition_mismatch",
      "transition",
      `Transition artifact ${artifact.transition} does not match expected transition ${spec.transition}.`
    ));
  }

  if (!spec.from_states.includes(artifact.from_state)) {
    issues.push(errorIssue(
      "transition_artifact_source_state_not_allowed",
      "from_state",
      `Transition artifact source state ${artifact.from_state} is not allowed by transition ${spec.transition}.`
    ));
  }

  if (!spec.required_source_schema_versions.includes(artifact.source_schema_version)) {
    issues.push(errorIssue(
      "transition_artifact_source_schema_version_not_allowed",
      "source_schema_version",
      `Transition artifact source schema version ${artifact.source_schema_version} is not accepted by transition ${spec.transition}.`
    ));
  }

  if (artifact.output_schema_version !== spec.output_schema_version) {
    issues.push(errorIssue(
      "transition_artifact_output_schema_version_mismatch",
      "output_schema_version",
      `Transition artifact output schema version ${artifact.output_schema_version} does not match expected ${spec.output_schema_version}.`
    ));
  }

  artifact.issue_codes.forEach((code, index) => {
    if (!KNOWN_SAFE_EXECUTION_INVARIANT_CODES.has(code)) {
      issues.push(errorIssue(
        "transition_artifact_unknown_issue_code",
        `issue_codes.${index}`,
        `Transition artifact issue code ${code} is not a known safe execution invariant code.`
      ));
    }
  });

  if (artifact.ok_to_advance) {
    if (artifact.to_state !== spec.to_state) {
      issues.push(errorIssue(
        "transition_artifact_to_state_mismatch",
        "to_state",
        `Successful transition artifact must advance to ${spec.to_state}.`
      ));
    }

    if (artifact.issue_codes.length > 0) {
      issues.push(errorIssue(
        "transition_artifact_success_with_issues",
        "issue_codes",
        "Successful transition artifact cannot carry invariant issue codes."
      ));
    }
  } else {
    if (artifact.issue_codes.length === 0) {
      issues.push(errorIssue(
        "transition_artifact_failure_without_issues",
        "issue_codes",
        "Failed transition artifact must carry at least one invariant issue code."
      ));
    }

    if (artifact.to_state !== null) {
      issues.push(errorIssue(
        "transition_artifact_failure_with_to_state",
        "to_state",
        "Failed transition artifact cannot mint a next state."
      ));
    }
  }

  if (artifact.effective_provider_spend_allowed && (!artifact.ok_to_advance || !spec.provider_spend_allowed)) {
    issues.push(errorIssue(
      "transition_artifact_mints_provider_spend",
      "effective_provider_spend_allowed",
      "Transition artifact cannot mint provider spend beyond the validated transition spec."
    ));
  }

  if (artifact.effective_source_writeback_allowed && (!artifact.ok_to_advance || !spec.writes_source_unit)) {
    issues.push(errorIssue(
      "transition_artifact_mints_source_writeback",
      "effective_source_writeback_allowed",
      "Transition artifact cannot mint source writeback beyond the validated transition spec."
    ));
  }

  if (artifact.effective_source_writeback_allowed) {
    if (
      typeof artifact.source_writeback_target_path !== "string" ||
      !isAllowedSourceUnitTargetPath(artifact.source_writeback_target_path)
    ) {
      issues.push(errorIssue(
        "transition_artifact_source_writeback_target_path_invalid",
        "source_writeback_target_path",
        "Transition artifact source writeback requires an auditable repository-relative YAML target under content/units/."
      ));
    }
  } else if (artifact.source_writeback_target_path) {
    issues.push(errorIssue(
      "transition_artifact_source_writeback_target_path_invalid",
      "source_writeback_target_path",
      "Transition artifact cannot carry a source writeback target path when source writeback is not effectively allowed."
    ));
  }

  artifact.audit_safe_fields.forEach((field, index) => {
    if (!artifact.ok_to_advance || !spec.audit_safe_fields.includes(field)) {
      issues.push(errorIssue(
        "transition_artifact_audit_fields_not_allowed",
        `audit_safe_fields.${index}`,
        `Transition artifact audit field ${field} is not allowed by the validated transition spec.`
      ));
    }
  });
  issues.push(...findUnsafeAuditFieldIssues(artifact.audit_safe_fields, "audit_safe_fields"));

  return buildResult(issues);
}

export function renderManualTriagePayload(input: SafeExecutionManualTriageInput): SafeExecutionManualTriagePayload {
  const issue = normalizeManualTriageIssue(input.issue);
  const operationKeyParts = {
    unit_id: input.unit_id,
    transition: input.spec.transition,
    source_key: `${input.source_key}:${issue.code}:${issue.path}`,
    ...(input.attempt ? { attempt: input.attempt } : {}),
  };

  return {
    schema_version: "safe-execution-manual-triage/v0.1",
    operation_key: deriveStableOperationKey(operationKeyParts),
    transition: input.spec.transition,
    current_state: input.source.current_state,
    source_schema_version: input.source.source_schema_version,
    source_valid: input.source.source_valid,
    blocked: input.source.blocked,
    issue_code: issue.code,
    issue_severity: issue.severity,
    issue_path: issue.path,
    safe_message: toSafeManualTriageMessage(issue),
    next_state: "manual_triage_required",
    provider_spend_allowed: false,
    source_writeback_allowed: false,
    audit_safe_fields: input.spec.audit_safe_fields.filter((field) => !isUnsafeAuditField(field)),
  };
}

export function shouldClearUntrustedDownstreamMetadata(source: SafeExecutionSourceContext): boolean {
  return !source.source_valid && source.contains_untrusted_downstream_metadata === true;
}

export function clearUntrustedDownstreamMetadataOnInvalidSource<TPayload extends Record<string, unknown>>(
  source: SafeExecutionSourceContext,
  payload: TPayload,
  fieldsToClear: readonly (keyof TPayload)[]
): TPayload {
  const sanitized: Record<string, unknown> = { ...payload };

  if (!shouldClearUntrustedDownstreamMetadata(source)) {
    return sanitized as TPayload;
  }

  fieldsToClear.forEach((field) => {
    sanitized[String(field)] = null;
  });

  return sanitized as TPayload;
}

export function deriveStableOperationKey(parts: {
  unit_id: string;
  transition: SafeExecutionTransition;
  source_key: string;
  attempt?: string;
}): string {
  return [
    "safe-execution",
    sanitizeKeyPart(parts.unit_id),
    sanitizeKeyPart(parts.transition),
    sanitizeKeyPart(parts.source_key),
    sanitizeKeyPart(parts.attempt ?? "none"),
  ].join(":");
}

function findUnsafeAuditFieldIssues(fields: string[], path: string): SafeExecutionInvariantIssue[] {
  return fields.flatMap((field, index) => {
    const matchedPattern = findUnsafeAuditFieldPattern(field);

    if (!matchedPattern) {
      return [];
    }

    return [errorIssue(
      "unsafe_audit_field",
      `${path}.${index}`,
      `Audit/log field ${field} is not safe because it matches restricted pattern ${matchedPattern}.`
    )];
  });
}

function toSafeManualTriageMessage(issue: SafeExecutionInvariantIssue): string {
  if (isUnsafeAuditField(issue.message)) {
    return `Manual triage required for ${issue.code} at ${issue.path}. See source artifact through approved review tooling.`;
  }

  return issue.message;
}

function normalizeManualTriageIssue(issue: SafeExecutionInvariantIssue): SafeExecutionInvariantIssue {
  if (KNOWN_SAFE_EXECUTION_INVARIANT_CODES.has(issue.code)) {
    return issue;
  }

  return errorIssue(
    "transition_artifact_unknown_issue_code",
    "issue.code",
    "Manual triage issue code is not recognized; see source artifact through approved review tooling."
  );
}

function isUnsafeAuditField(field: string): boolean {
  return findUnsafeAuditFieldPattern(field) !== undefined;
}

function findUnsafeAuditFieldPattern(field: string): string | undefined {
  const matchedChinesePattern = UNSAFE_AUDIT_FIELD_CHINESE_PATTERNS.find((item) => item.pattern.test(field));
  if (matchedChinesePattern) {
    return matchedChinesePattern.label;
  }

  const normalizedField = field.toLowerCase();
  const snakeField = normalizedField.replace(/[^a-z0-9]+/g, "_");
  const compactField = normalizedField.replace(/[^a-z0-9]+/g, "");
  return UNSAFE_AUDIT_FIELD_PATTERNS.find((pattern) => {
    const compactPattern = pattern.replace(/_/g, "");
    return normalizedField.includes(pattern) || snakeField.includes(pattern) || compactField.includes(compactPattern);
  });
}

function hasTargetPath(source: SafeExecutionSourceContext): boolean {
  return typeof source.target_path === "string" && source.target_path.trim().length > 0;
}

function isAllowedSourceUnitTargetPath(targetPath: string): boolean {
  const normalizedPath = targetPath.trim().replace(/\\/g, "/");
  const hasScheme = /^[A-Za-z][A-Za-z0-9+.-]*:/.test(targetPath);
  const escapesRepositoryRoot = normalizedPath.startsWith("/") || normalizedPath.split("/").includes("..");
  return (
    !hasScheme &&
    !escapesRepositoryRoot &&
    normalizedPath.startsWith("content/units/") &&
    (normalizedPath.endsWith(".yaml") || normalizedPath.endsWith(".yml"))
  );
}

function buildResult(issues: SafeExecutionInvariantIssue[]): SafeExecutionInvariantResult {
  const errorCount = issues.filter((issue) => issue.severity === "error").length;
  const warningCount = issues.filter((issue) => issue.severity === "warning").length;

  return {
    ok: errorCount === 0,
    error_count: errorCount,
    warning_count: warningCount,
    issues,
  };
}

function errorIssue(
  code: SafeExecutionInvariantCode,
  path: string,
  message: string
): SafeExecutionInvariantIssue {
  return {
    code,
    severity: "error",
    path,
    message,
  };
}

function sanitizeKeyPart(value: string): string {
  const sanitized = value.replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^_+|_+$/g, "");
  return sanitized.length > 0 ? sanitized : "unknown";
}
