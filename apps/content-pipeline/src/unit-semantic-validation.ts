import { PrivacyLevel, UserRole, type AiNativeUnitSpec, type UnitSourceTrace } from "@edu-ai/shared-types";

import type { UnitSpecSection } from "./agent-specs";

export type UnitSemanticIssueSeverity = "error" | "warning";

export interface UnitSemanticIssue {
  severity: UnitSemanticIssueSeverity;
  code: string;
  path: string;
  message: string;
}

export interface UnitSemanticValidationResult {
  passed: boolean;
  error_count: number;
  warning_count: number;
  issues: UnitSemanticIssue[];
}

interface NodeReferenceGroup {
  path: string;
  node_ids: readonly string[];
}

export function validateUnitSemanticIntegrity(unit: AiNativeUnitSpec): UnitSemanticValidationResult {
  const issues: UnitSemanticIssue[] = [];

  for (const section of ["knowledge", "pedagogy", "narrative", "implementation", "assessment", "quality"] as const) {
    issues.push(...collectSectionSemanticIssues(unit, section));
  }
  issues.push(...collectRuntimeContentSemanticIssues(unit));

  return buildValidationResult(issues);
}

export function validateUnitSectionSemanticIntegrity(
  unit: AiNativeUnitSpec,
  section: UnitSpecSection
): UnitSemanticValidationResult {
  const issues = collectSectionSemanticIssues(unit, section);
  if (section === "knowledge") {
    // Knowledge node ids are the anchor for every later generated section. If a
    // knowledge patch strands existing downstream references, fail before
    // spending more model calls on agents that would read an impossible unit.
    issues.push(...collectKnowledgeDependentReferenceIssues(unit));
  }

  return buildValidationResult(issues);
}

function collectSectionSemanticIssues(unit: AiNativeUnitSpec, section: UnitSpecSection): UnitSemanticIssue[] {
  const issues: UnitSemanticIssue[] = [];
  const knownNodeIds = new Set(unit.knowledge.nodes.map((node) => node.node_id));
  collectForbiddenSourceTraceIssues(`${section}.meta.source_trace`, unit[section].meta.source_trace, issues);

  switch (section) {
    case "knowledge":
      collectDuplicateIds(unit.knowledge.nodes.map((node) => node.node_id), "knowledge.nodes[].node_id", issues);
      for (const [index, edge] of unit.knowledge.edges.entries()) {
        checkNodeReference(knownNodeIds, edge.from_node_id, `knowledge.edges[${index}].from_node_id`, issues);
        checkNodeReference(knownNodeIds, edge.to_node_id, `knowledge.edges[${index}].to_node_id`, issues);
      }
      break;

    case "pedagogy":
      collectDuplicateIds(
        unit.pedagogy.activities.map((activity) => activity.activity_id),
        "pedagogy.activities[].activity_id",
        issues
      );
      collectNodeReferenceGroups(
        knownNodeIds,
        [
          { path: "pedagogy.learning_path", node_ids: unit.pedagogy.learning_path },
          ...unit.pedagogy.activities.map((activity, index) => ({
            path: `pedagogy.activities[${index}].target_nodes`,
            node_ids: activity.target_nodes
          }))
        ],
        issues
      );
      break;

    case "narrative":
      collectDuplicateIds(
        unit.narrative.scenarios.map((scenario) => scenario.scenario_id),
        "narrative.scenarios[].scenario_id",
        issues
      );
      collectDuplicateIds(
        unit.narrative.characters.map((character) => character.character_id),
        "narrative.characters[].character_id",
        issues
      );
      collectDuplicateIds(
        unit.narrative.dialogue_scripts.map((script) => script.script_id),
        "narrative.dialogue_scripts[].script_id",
        issues
      );
      collectNodeReferenceGroups(
        knownNodeIds,
        [
          ...unit.narrative.scenarios.map((scenario, index) => ({
            path: `narrative.scenarios[${index}].target_nodes`,
            node_ids: scenario.target_nodes
          })),
          ...unit.narrative.dialogue_scripts.map((script, index) => ({
            path: `narrative.dialogue_scripts[${index}].target_nodes`,
            node_ids: script.target_nodes
          }))
        ],
        issues
      );
      break;

    case "implementation":
      collectDuplicateIds(
        unit.implementation.prompts.map((prompt) => prompt.prompt_id),
        "implementation.prompts[].prompt_id",
        issues
      );
      collectDuplicateIds(
        unit.implementation.data_hooks.map((hook) => hook.hook_id),
        "implementation.data_hooks[].hook_id",
        issues
      );
      collectNodeReferenceGroups(
        knownNodeIds,
        [
          ...unit.implementation.prompts.map((prompt, index) => ({
            path: `implementation.prompts[${index}].target_nodes`,
            node_ids: prompt.target_nodes
          })),
          ...unit.implementation.data_hooks.map((hook, index) => ({
            path: `implementation.data_hooks[${index}].target_nodes`,
            node_ids: hook.target_nodes
          }))
        ],
        issues
      );
      break;

    case "assessment":
      collectDuplicateIds(unit.assessment.items.map((item) => item.item_id), "assessment.items[].item_id", issues);
      collectNodeReferenceGroups(
        knownNodeIds,
        unit.assessment.items.map((item, index) => ({
          path: `assessment.items[${index}].target_nodes`,
          node_ids: item.target_nodes
        })),
        issues
      );
      break;

    case "quality":
      collectDuplicateIds(unit.quality.issues.map((issue) => issue.issue_id), "quality.issues[].issue_id", issues);
      {
        const openBlockingIssues = unit.quality.issues
          .map((issue, index) => ({ index, issue }))
          .filter(
            ({ issue }) => issue.status === "open" && (issue.severity === "blocking" || issue.severity === "high")
          );
        if (unit.quality.checklist_pass && openBlockingIssues.length > 0) {
          issues.push({
            severity: "error",
            code: "quality_pass_with_open_blockers",
            path: "quality.checklist_pass",
            message: "quality.checklist_pass cannot be true while high/blocking quality issues remain open."
          });
        }
        for (const { index, issue } of openBlockingIssues) {
          issues.push({
            severity: "error",
            code: "open_quality_blocker",
            path: `quality.issues[${index}]`,
            message: `Open ${issue.severity} quality issue "${issue.issue_id}" must be resolved or waived before promotion.`
          });
        }
      }
      break;
  }

  return issues;
}

function collectForbiddenSourceTraceIssues(
  pathPrefix: string,
  sourceTrace: readonly UnitSourceTrace[],
  issues: UnitSemanticIssue[]
): void {
  const forbiddenPatterns = [
    { label: "CCSS", pattern: /ccss/i },
    { label: "Common Core", pattern: /common[-_\s]*core/i },
    { label: "Common Core State Standards", pattern: /core\s+state\s+standards/i },
    { label: "美国共同核心", pattern: /美国共同核心/ },
    { label: "共同核心州立标准", pattern: /共同核心州立标准/ }
  ];

  sourceTrace.forEach((source, index) => {
    const sourceText = [source.source_id, source.reference].join("\n");
    const matchedPattern = forbiddenPatterns.find(({ pattern }) => pattern.test(sourceText));
    if (!matchedPattern) {
      return;
    }

    issues.push({
      severity: "error",
      code: "forbidden_foreign_standard_source_trace",
      path: `${pathPrefix}[${index}]`,
      message: `Source trace references ${matchedPattern.label}. China K-12 curriculum units must not substitute unapproved foreign standards.`
    });
  });
}

function collectRuntimeContentSemanticIssues(unit: AiNativeUnitSpec): UnitSemanticIssue[] {
  const issues: UnitSemanticIssue[] = [];
  const knownNodeIds = new Set(unit.knowledge.nodes.map((node) => node.node_id));

  collectForbiddenSourceTraceIssues("runtime_content.meta.source_trace", unit.runtime_content.meta.source_trace, issues);
  collectDuplicateIds(
    unit.runtime_content.pages.map((page) => page.page_id),
    "runtime_content.pages[].page_id",
    issues
  );

  const blockIds: string[] = [];
  for (const [pageIndex, page] of unit.runtime_content.pages.entries()) {
    collectNodeReferenceGroups(
      knownNodeIds,
      [
        {
          path: `runtime_content.pages[${pageIndex}].target_nodes`,
          node_ids: page.target_nodes
        }
      ],
      issues
    );

    for (const [blockIndex, block] of page.blocks.entries()) {
      blockIds.push(block.block_id);
      const blockPath = `runtime_content.pages[${pageIndex}].blocks[${blockIndex}]`;
      collectNodeReferenceGroups(
        knownNodeIds,
        [
          {
            path: `${blockPath}.target_nodes`,
            node_ids: block.target_nodes
          }
        ],
        issues
      );
      collectForbiddenSourceTraceIssues(`${blockPath}.source_trace`, block.source_trace, issues);
      collectBlockVisibilityIssues(block.privacy_level, block.visibility_scope.visible_to_roles, blockPath, issues);
      collectBlockSandboxIssues(block.type, block.sandbox.required, block.sandbox.runtime, blockPath, issues);
    }
  }

  collectDuplicateIds(blockIds, "runtime_content.pages[].blocks[].block_id", issues);
  return issues;
}

function collectBlockVisibilityIssues(
  privacyLevel: PrivacyLevel,
  visibleToRoles: readonly UserRole[],
  path: string,
  issues: UnitSemanticIssue[]
): void {
  const roleSet = new Set(visibleToRoles);
  if (privacyLevel === PrivacyLevel.STUDENT_PRIVATE) {
    const invalidRoles = visibleToRoles.filter((role) => role !== UserRole.STUDENT && role !== UserRole.SYSTEM);
    if (invalidRoles.length > 0) {
      issues.push({
        severity: "error",
        code: "student_private_block_visible_to_non_student",
        path: `${path}.visibility_scope.visible_to_roles`,
        message: `Student-private runtime block cannot be visible to: ${invalidRoles.join(", ")}.`
      });
    }
  }

  if (privacyLevel === PrivacyLevel.TEACHER_ONLY && (roleSet.has(UserRole.STUDENT) || roleSet.has(UserRole.GUARDIAN))) {
    issues.push({
      severity: "error",
      code: "teacher_only_block_visible_to_student_or_guardian",
      path: `${path}.visibility_scope.visible_to_roles`,
      message: "Teacher-only runtime block cannot be visible to student or guardian roles."
    });
  }
}

function collectBlockSandboxIssues(
  blockType: string,
  sandboxRequired: boolean,
  sandboxRuntime: string,
  path: string,
  issues: UnitSemanticIssue[]
): void {
  if (!["interactive", "animation", "code"].includes(blockType)) {
    return;
  }

  if (!sandboxRequired || sandboxRuntime === "none") {
    issues.push({
      severity: "error",
      code: "unsafe_runtime_block_sandbox",
      path: `${path}.sandbox`,
      message: `${blockType} runtime blocks must declare an active sandbox before publication.`
    });
  }
}

function collectNodeReferenceGroups(
  knownNodeIds: ReadonlySet<string>,
  referenceGroups: readonly NodeReferenceGroup[],
  issues: UnitSemanticIssue[]
): void {
  for (const group of referenceGroups) {
    group.node_ids.forEach((nodeId, index) => {
      checkNodeReference(knownNodeIds, nodeId, `${group.path}[${index}]`, issues);
    });
  }
}

function collectKnowledgeDependentReferenceIssues(unit: AiNativeUnitSpec): UnitSemanticIssue[] {
  const issues: UnitSemanticIssue[] = [];
  const knownNodeIds = new Set(unit.knowledge.nodes.map((node) => node.node_id));
  collectNodeReferenceGroups(knownNodeIds, buildDownstreamNodeReferenceGroups(unit), issues);
  return issues;
}

function buildDownstreamNodeReferenceGroups(unit: AiNativeUnitSpec): NodeReferenceGroup[] {
  return [
    { path: "pedagogy.learning_path", node_ids: unit.pedagogy.learning_path },
    ...unit.pedagogy.activities.map((activity, index) => ({
      path: `pedagogy.activities[${index}].target_nodes`,
      node_ids: activity.target_nodes
    })),
    ...unit.narrative.scenarios.map((scenario, index) => ({
      path: `narrative.scenarios[${index}].target_nodes`,
      node_ids: scenario.target_nodes
    })),
    ...unit.narrative.dialogue_scripts.map((script, index) => ({
      path: `narrative.dialogue_scripts[${index}].target_nodes`,
      node_ids: script.target_nodes
    })),
    ...unit.implementation.prompts.map((prompt, index) => ({
      path: `implementation.prompts[${index}].target_nodes`,
      node_ids: prompt.target_nodes
    })),
    ...unit.implementation.data_hooks.map((hook, index) => ({
      path: `implementation.data_hooks[${index}].target_nodes`,
      node_ids: hook.target_nodes
    })),
    ...unit.assessment.items.map((item, index) => ({
      path: `assessment.items[${index}].target_nodes`,
      node_ids: item.target_nodes
    }))
  ];
}

function buildValidationResult(issues: UnitSemanticIssue[]): UnitSemanticValidationResult {
  const errorCount = issues.filter((issue) => issue.severity === "error").length;
  const warningCount = issues.filter((issue) => issue.severity === "warning").length;

  return {
    passed: errorCount === 0,
    error_count: errorCount,
    warning_count: warningCount,
    issues
  };
}

function checkNodeReference(
  knownNodeIds: ReadonlySet<string>,
  nodeId: string,
  path: string,
  issues: UnitSemanticIssue[]
): void {
  if (knownNodeIds.has(nodeId)) {
    return;
  }

  issues.push({
    severity: "error",
    code: "unknown_node_reference",
    path,
    message: `Referenced knowledge node "${nodeId}" is not defined in knowledge.nodes[].node_id.`
  });
}

function collectDuplicateIds(ids: readonly string[], path: string, issues: UnitSemanticIssue[]): void {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const id of ids) {
    if (seen.has(id)) {
      duplicates.add(id);
      continue;
    }
    seen.add(id);
  }

  for (const duplicate of duplicates) {
    issues.push({
      severity: "error",
      code: "duplicate_id",
      path,
      message: `Duplicate id "${duplicate}" found at ${path}.`
    });
  }
}
