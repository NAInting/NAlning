import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const filePath = resolve(process.argv[2] ?? "content/units/math-g8-s1-linear-function-concept/knowledge-graph.seed.json");
const graph = JSON.parse(readFileSync(filePath, "utf8"));

const errors = [];
const uuidV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const forbiddenPrivacyKeys = new Set([
  "student_id",
  "student_token",
  "conversation_id",
  "turn_id",
  "source_turn_range",
  "emotion_baseline"
]);
const allowedSubjects = new Set(["math"]);
const allowedGrades = new Set(["g8"]);
const allowedUnitStatuses = new Set(["draft", "in_review", "approved", "published", "archived"]);
const allowedAssessmentTypes = new Set(["formative", "summative", "self_reflection", "peer_review"]);
const allowedScoringMethods = new Set(["rule_based", "ai_rubric", "hybrid", "teacher_manual"]);
const allowedPedagogies = new Set([
  "socratic_dialogue",
  "scenario_immersion",
  "problem_based",
  "project_based",
  "peer_teaching",
  "debate",
  "metacognitive_reflection",
  "direct_instruction",
  "spaced_repetition"
]);
const allowedActivityTypes = new Set(["dialogue", "exercise", "scenario", "project", "reflection"]);
const allowedCompletionTypes = new Set(["time_based", "mastery_based", "submission_based", "reflection_based"]);

requireString(graph.graph_id, "graph_id");
requireString(graph.subject, "subject");
requireString(graph.grade, "grade");
requireObject(graph.unit, "unit");
requireObject(graph.learning_path, "learning_path");
requireObject(graph.assessment, "assessment");
requireArray(graph.nodes, "nodes", 1);

validateNoForbiddenKeys(graph);
validateUnit(graph.unit);
validateAssessment(graph.assessment);
validateNodes(graph.nodes);
validateLearningPath(graph.learning_path, graph.nodes, graph.assessment.runtime_id);
validateGraphTopology(graph.nodes);
validateSetEquivalence(
  graph.unit.knowledge_node_aliases,
  graph.nodes.map((node) => node.alias),
  "unit.knowledge_node_aliases",
  "nodes.alias"
);
validateSetEquivalence(
  graph.assessment.target_aliases,
  graph.nodes.map((node) => node.alias),
  "assessment.target_aliases",
  "nodes.alias"
);

if (errors.length > 0) {
  console.error(`Knowledge graph validation failed for ${filePath}`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Knowledge graph validation passed: ${filePath}`);

function validateUnit(unit) {
  requireUuid(unit.runtime_id, "unit.runtime_id");
  requireString(unit.title, "unit.title");
  requireString(unit.description, "unit.description");
  requireArray(unit.standard_alignments, "unit.standard_alignments", 1);
  requireArray(unit.prerequisite_unit_aliases, "unit.prerequisite_unit_aliases", 0);
  requireArray(unit.prerequisite_node_aliases, "unit.prerequisite_node_aliases", 0);
  requireArray(unit.knowledge_node_aliases, "unit.knowledge_node_aliases", 1);
  requireUuid(unit.learning_path_id, "unit.learning_path_id");
  requireArray(unit.scenario_ids, "unit.scenario_ids", 0);
  requireArray(unit.assessment_ids, "unit.assessment_ids", 1);
  requireObject(unit.production_metadata, "unit.production_metadata");
  requireString(unit.status, "unit.status");
  requireBoolean(unit.generated_by_agents, "unit.generated_by_agents");
  requireArray(unit.human_reviewers, "unit.human_reviewers", 0);

  if (!unit.assessment_ids.includes(graph.assessment?.runtime_id)) {
    errors.push("unit.assessment_ids must include assessment.runtime_id");
  }

  if (!allowedSubjects.has(graph.subject)) {
    errors.push(`graph.subject must be one of: ${[...allowedSubjects].join(", ")}`);
  }

  if (!allowedGrades.has(graph.grade)) {
    errors.push(`graph.grade must be one of: ${[...allowedGrades].join(", ")}`);
  }

  if (!allowedUnitStatuses.has(unit.status)) {
    errors.push(`unit.status must be one of: ${[...allowedUnitStatuses].join(", ")}`);
  }

  if (unit.duration_hours <= 0 || unit.duration_hours > 1000) {
    errors.push("unit.duration_hours must be positive and no more than 1000");
  }

  validateStandardAlignments(unit.standard_alignments, "unit.standard_alignments");
  validateProductionMetadata(unit.production_metadata);
}

function validateAssessment(assessment) {
  requireUuid(assessment.runtime_id, "assessment.runtime_id");
  requireString(assessment.title, "assessment.title");
  requireArray(assessment.target_aliases, "assessment.target_aliases", 1);
  requireString(assessment.type, "assessment.type");
  requireObject(assessment.scoring_strategy, "assessment.scoring_strategy");
  requireNumber(assessment.scoring_strategy.mastery_threshold, "assessment.scoring_strategy.mastery_threshold");
  requireBoolean(assessment.scoring_strategy.requires_human_review, "assessment.scoring_strategy.requires_human_review");
  requireString(assessment.scoring_strategy.method, "assessment.scoring_strategy.method");
  requireNumber(assessment.min_confidence_threshold, "assessment.min_confidence_threshold");
  requireString(assessment.mechanical_pass_rule, "assessment.mechanical_pass_rule");

  if (assessment.scoring_strategy.mastery_threshold < 0 || assessment.scoring_strategy.mastery_threshold > 1) {
    errors.push("assessment.scoring_strategy.mastery_threshold must be between 0 and 1");
  }

  if (assessment.min_confidence_threshold < 0.7) {
    errors.push("assessment.min_confidence_threshold must be at least 0.7 for Phase 1.3");
  }

  if (!allowedAssessmentTypes.has(assessment.type)) {
    errors.push(`assessment.type must be one of: ${[...allowedAssessmentTypes].join(", ")}`);
  }

  if (!allowedScoringMethods.has(assessment.scoring_strategy.method)) {
    errors.push(`assessment.scoring_strategy.method must be one of: ${[...allowedScoringMethods].join(", ")}`);
  }

  if (assessment.items_source !== "nodes.formative_probe") {
    errors.push("assessment.items_source must be nodes.formative_probe for Phase 1.3");
  }
}

function validateNodes(nodes) {
  const aliases = new Set();
  const runtimeIds = new Set();

  for (const [index, node] of nodes.entries()) {
    const path = `nodes[${index}]`;
    requireString(node.alias, `${path}.alias`);
    requireUuid(node.runtime_id, `${path}.runtime_id`);
    requireString(node.title, `${path}.title`);
    requireString(node.description, `${path}.description`);
    requireArray(node.prerequisites, `${path}.prerequisites`, 0);
    requireArray(node.related, `${path}.related`, 0);
    requireArray(node.mastery_criteria, `${path}.mastery_criteria`, 1);
    requireArray(node.standard_alignments, `${path}.standard_alignments`, 1);
    requireArray(node.common_misconceptions, `${path}.common_misconceptions`, 2);
    requireObject(node.formative_probe, `${path}.formative_probe`);
    requireString(node.mentor_prompt, `${path}.mentor_prompt`);

    if (node.difficulty < 1 || node.difficulty > 5 || !Number.isInteger(node.difficulty)) {
      errors.push(`${path}.difficulty must be an integer between 1 and 5`);
    }

    if (node.estimated_learning_minutes <= 0 || !Number.isInteger(node.estimated_learning_minutes)) {
      errors.push(`${path}.estimated_learning_minutes must be a positive integer`);
    }

    validateStandardAlignments(node.standard_alignments, `${path}.standard_alignments`);

    if (aliases.has(node.alias)) {
      errors.push(`duplicate node alias: ${node.alias}`);
    }
    aliases.add(node.alias);

    if (runtimeIds.has(node.runtime_id)) {
      errors.push(`duplicate node runtime_id: ${node.runtime_id}`);
    }
    runtimeIds.add(node.runtime_id);

    for (const [misconceptionIndex, misconception] of node.common_misconceptions.entries()) {
      requireString(misconception.description, `${path}.common_misconceptions[${misconceptionIndex}].description`);
      requireString(misconception.example, `${path}.common_misconceptions[${misconceptionIndex}].example`);
      requireString(misconception.correction_strategy, `${path}.common_misconceptions[${misconceptionIndex}].correction_strategy`);
    }

    requireUuid(node.formative_probe.item_id, `${path}.formative_probe.item_id`);
    requireString(node.formative_probe.question, `${path}.formative_probe.question`);
    requireString(node.formative_probe.expected_signal, `${path}.formative_probe.expected_signal`);
    requireArray(node.formative_probe.diagnostic_hints, `${path}.formative_probe.diagnostic_hints`, 1);
  }

  for (const alias of graph.unit.knowledge_node_aliases) {
    if (!aliases.has(alias)) {
      errors.push(`unit.knowledge_node_aliases references unknown alias: ${alias}`);
    }
  }

  for (const alias of graph.assessment.target_aliases) {
    if (!aliases.has(alias)) {
      errors.push(`assessment.target_aliases references unknown alias: ${alias}`);
    }
  }
}

function validateLearningPath(learningPath, nodes, assessmentId) {
  const aliases = new Set(nodes.map((node) => node.alias));
  requireUuid(learningPath.runtime_id, "learning_path.runtime_id");
  requireArray(learningPath.steps, "learning_path.steps", 1);

  let expectedOrder = 1;
  const stepIds = new Set();
  for (const [index, step] of learningPath.steps.entries()) {
    const path = `learning_path.steps[${index}]`;
    requireUuid(step.step_id, `${path}.step_id`);
    requireArray(step.target_aliases, `${path}.target_aliases`, 1);
    requireString(step.activity_type, `${path}.activity_type`);
    requireString(step.pedagogy, `${path}.pedagogy`);
    requireNumber(step.estimated_duration_minutes, `${path}.estimated_duration_minutes`);
    requireObject(step.completion_criteria, `${path}.completion_criteria`);
    requireString(step.completion_criteria.type, `${path}.completion_criteria.type`);

    if (stepIds.has(step.step_id)) {
      errors.push(`duplicate learning path step_id: ${step.step_id}`);
    }
    stepIds.add(step.step_id);

    if (step.order !== expectedOrder) {
      errors.push(`${path}.order must be ${expectedOrder}`);
    }
    expectedOrder += 1;

    for (const alias of step.target_aliases) {
      if (!aliases.has(alias)) {
        errors.push(`${path}.target_aliases references unknown alias: ${alias}`);
      }
    }

    if (step.assessment_id && step.assessment_id !== assessmentId) {
      errors.push(`${path}.assessment_id must match assessment.runtime_id`);
    }

    if (!allowedPedagogies.has(step.pedagogy)) {
      errors.push(`${path}.pedagogy must be one of: ${[...allowedPedagogies].join(", ")}`);
    }

    if (!allowedActivityTypes.has(step.activity_type)) {
      errors.push(`${path}.activity_type must be one of: ${[...allowedActivityTypes].join(", ")}`);
    }

    if (!allowedCompletionTypes.has(step.completion_criteria.type)) {
      errors.push(`${path}.completion_criteria.type must be one of: ${[...allowedCompletionTypes].join(", ")}`);
    }

    if (typeof step.completion_criteria.threshold === "number") {
      if (step.completion_criteria.threshold < 0 || step.completion_criteria.threshold > 1) {
        errors.push(`${path}.completion_criteria.threshold must be between 0 and 1`);
      }
    }
  }
}

function validateGraphTopology(nodes) {
  const aliases = new Set(nodes.map((node) => node.alias));
  const adjacency = new Map(nodes.map((node) => [node.alias, node.prerequisites ?? []]));
  const degree = new Map(nodes.map((node) => [node.alias, 0]));

  for (const node of nodes) {
    for (const prerequisite of node.prerequisites ?? []) {
      if (!aliases.has(prerequisite)) {
        errors.push(`${node.alias}.prerequisites references unknown alias: ${prerequisite}`);
        continue;
      }
      degree.set(node.alias, (degree.get(node.alias) ?? 0) + 1);
      degree.set(prerequisite, (degree.get(prerequisite) ?? 0) + 1);
    }

    for (const related of node.related ?? []) {
      if (!aliases.has(related)) {
        errors.push(`${node.alias}.related references unknown alias: ${related}`);
      }
    }
  }

  const visiting = new Set();
  const visited = new Set();

  for (const alias of aliases) {
    visit(alias, []);
  }

  for (const [alias, count] of degree.entries()) {
    if (count === 0) {
      errors.push(`node has no prerequisite edge participation: ${alias}`);
    }
  }

  function visit(alias, stack) {
    if (visited.has(alias)) {
      return;
    }
    if (visiting.has(alias)) {
      errors.push(`prerequisite cycle detected: ${[...stack, alias].join(" -> ")}`);
      return;
    }

    visiting.add(alias);
    for (const prerequisite of adjacency.get(alias) ?? []) {
      visit(prerequisite, [...stack, alias]);
    }
    visiting.delete(alias);
    visited.add(alias);
  }
}

function validateNoForbiddenKeys(value, path = "root") {
  if (!value || typeof value !== "object") {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => validateNoForbiddenKeys(item, `${path}[${index}]`));
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    if (forbiddenPrivacyKeys.has(key)) {
      errors.push(`forbidden privacy key ${key} at ${path}`);
    }
    validateNoForbiddenKeys(child, `${path}.${key}`);
  }
}

function requireObject(value, path) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    errors.push(`${path} must be an object`);
  }
}

function requireArray(value, path, minLength) {
  if (!Array.isArray(value)) {
    errors.push(`${path} must be an array`);
    return;
  }
  if (value.length < minLength) {
    errors.push(`${path} must contain at least ${minLength} item(s)`);
  }
}

function requireString(value, path) {
  if (typeof value !== "string" || value.trim().length === 0) {
    errors.push(`${path} must be a non-empty string`);
  }
}

function requireNumber(value, path) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    errors.push(`${path} must be a number`);
  }
}

function requireBoolean(value, path) {
  if (typeof value !== "boolean") {
    errors.push(`${path} must be a boolean`);
  }
}

function requireUuid(value, path) {
  requireString(value, path);
  if (typeof value === "string" && !uuidV4.test(value)) {
    errors.push(`${path} must be UUID v4`);
  }
}

function validateStandardAlignments(alignments, path) {
  for (const [index, alignment] of alignments.entries()) {
    requireString(alignment.standard_system, `${path}[${index}].standard_system`);
    requireString(alignment.standard_code, `${path}[${index}].standard_code`);
    requireString(alignment.description, `${path}[${index}].description`);
  }
}

function validateProductionMetadata(metadata) {
  const stringFields = [
    "curriculum_agent_version",
    "pedagogy_agent_version",
    "narrative_agent_version",
    "engineering_agent_version",
    "qa_agent_version"
  ];
  for (const field of stringFields) {
    requireString(metadata[field], `unit.production_metadata.${field}`);
  }
  requireNumber(metadata.iteration_count, "unit.production_metadata.iteration_count");
  requireNumber(metadata.total_cost_tokens, "unit.production_metadata.total_cost_tokens");
  requireNumber(metadata.total_cost_cny, "unit.production_metadata.total_cost_cny");
  requireBoolean(metadata.qa_pass, "unit.production_metadata.qa_pass");
  requireArray(metadata.qa_issues, "unit.production_metadata.qa_issues", 0);

  if (metadata.iteration_count < 0 || !Number.isInteger(metadata.iteration_count)) {
    errors.push("unit.production_metadata.iteration_count must be a non-negative integer");
  }
  if (metadata.total_cost_tokens < 0 || !Number.isInteger(metadata.total_cost_tokens)) {
    errors.push("unit.production_metadata.total_cost_tokens must be a non-negative integer");
  }
  if (metadata.total_cost_cny < 0) {
    errors.push("unit.production_metadata.total_cost_cny must be non-negative");
  }
}

function validateSetEquivalence(left, right, leftName, rightName) {
  const leftSet = new Set(left);
  const rightSet = new Set(right);
  for (const item of leftSet) {
    if (!rightSet.has(item)) {
      errors.push(`${leftName} contains ${item}, but ${rightName} does not`);
    }
  }
  for (const item of rightSet) {
    if (!leftSet.has(item)) {
      errors.push(`${rightName} contains ${item}, but ${leftName} does not`);
    }
  }
}
