import { resolve } from "node:path";

import { describe, expect, it } from "vitest";
import { PrivacyLevel, UserRole } from "@edu-ai/shared-types";

import { loadUnitSpecFromFile, validateUnitSectionSemanticIntegrity, validateUnitSemanticIntegrity } from "../src";

const sampleUnitPath = resolve(process.cwd(), "../../content/units/math-g8-s1-linear-function-concept/unit.yaml");

describe("unit semantic validation", () => {
  it("passes the sample unit when every cross-section node reference is defined", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const result = validateUnitSemanticIntegrity(unit);

    expect(result).toMatchObject({
      passed: true,
      error_count: 0
    });
  });

  it("rejects dangling target node references across generated sections", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const invalidUnit = {
      ...unit,
      assessment: {
        ...unit.assessment,
        items: [
          {
            ...unit.assessment.items[0]!,
            target_nodes: ["missing_node"]
          }
        ]
      }
    };

    const result = validateUnitSemanticIntegrity(invalidUnit);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        severity: "error",
        code: "unknown_node_reference",
        path: "assessment.items[0].target_nodes[0]"
      })
    );
  });

  it("rejects duplicate ids and impossible quality pass states", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const invalidUnit = {
      ...unit,
      knowledge: {
        ...unit.knowledge,
        nodes: [
          unit.knowledge.nodes[0]!,
          {
            ...unit.knowledge.nodes[0]!,
            title: "Duplicate node"
          }
        ]
      },
      quality: {
        ...unit.quality,
        checklist_pass: true,
        issues: [
          {
            ...unit.quality.issues[0]!,
            severity: "blocking" as const,
            status: "open" as const
          }
        ]
      }
    };

    const result = validateUnitSemanticIntegrity(invalidUnit);

    expect(result.passed).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(["duplicate_id", "quality_pass_with_open_blockers"])
    );
  });

  it("rejects open high or blocking quality issues even when the checklist is not passed", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const invalidUnit = {
      ...unit,
      quality: {
        ...unit.quality,
        checklist_pass: false,
        issues: [
          {
            ...unit.quality.issues[0]!,
            issue_id: "minor_open_issue",
            severity: "medium" as const,
            status: "open" as const
          },
          {
            ...unit.quality.issues[0]!,
            issue_id: "blocking_open_issue",
            severity: "blocking" as const,
            status: "open" as const
          }
        ]
      }
    };

    const result = validateUnitSemanticIntegrity(invalidUnit);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        severity: "error",
        code: "open_quality_blocker",
        path: "quality.issues[1]"
      })
    );
  });

  it("rejects CCSS or Common Core references in section source traces", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const invalidUnit = {
      ...unit,
      knowledge: {
        ...unit.knowledge,
        meta: {
          ...unit.knowledge.meta,
          source_trace: [
            {
              ...unit.knowledge.meta.source_trace[0]!,
              source_id: "ccss_math_g8_functions",
              reference: "Common Core Grade 8 Functions"
            },
            ...unit.knowledge.meta.source_trace.slice(1)
          ]
        }
      }
    };

    const result = validateUnitSemanticIntegrity(invalidUnit);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        severity: "error",
        code: "forbidden_foreign_standard_source_trace",
        path: "knowledge.meta.source_trace[0]"
      })
    );
  });

  it("allows QA notes to mention CCSS when provenance source traces stay local", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const validUnit = {
      ...unit,
      quality: {
        ...unit.quality,
        reviewer_notes: [...unit.quality.reviewer_notes, "复核说明：未引入 CCSS 或 Common Core 来源。"]
      }
    };

    const result = validateUnitSemanticIntegrity(validUnit);

    expect(result.passed).toBe(true);
    expect(result.issues.map((issue) => issue.code)).not.toContain("forbidden_foreign_standard_source_trace");
  });

  it("rejects Chinese Common Core source trace labels", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const invalidUnit = {
      ...unit,
      pedagogy: {
        ...unit.pedagogy,
        meta: {
          ...unit.pedagogy.meta,
          source_trace: [
            {
              ...unit.pedagogy.meta.source_trace[0]!,
              source_id: "foreign_standard_alignment",
              reference: "美国共同核心州立标准 Grade 8 Functions"
            },
            ...unit.pedagogy.meta.source_trace.slice(1)
          ]
        }
      }
    };

    const result = validateUnitSemanticIntegrity(invalidUnit);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        severity: "error",
        code: "forbidden_foreign_standard_source_trace",
        path: "pedagogy.meta.source_trace[0]"
      })
    );
  });

  it("can validate only the section that an agent just patched", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const invalidUnit = {
      ...unit,
      knowledge: {
        ...unit.knowledge,
        edges: [
          {
            ...unit.knowledge.edges[0]!,
            to_node_id: "missing_node"
          }
        ]
      }
    };

    const result = validateUnitSectionSemanticIntegrity(invalidUnit, "knowledge");

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: "unknown_node_reference",
        path: "knowledge.edges[0].to_node_id"
      })
    );
  });

  it("rejects knowledge patches that strand existing downstream node references", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const invalidUnit = {
      ...unit,
      knowledge: {
        ...unit.knowledge,
        nodes: [
          {
            ...unit.knowledge.nodes[0]!,
            node_id: "lf_replacement_node"
          }
        ],
        edges: []
      }
    };

    const result = validateUnitSectionSemanticIntegrity(invalidUnit, "knowledge");

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: "unknown_node_reference",
        path: "pedagogy.learning_path[0]"
      })
    );
  });

  it("rejects runtime content blocks with dangling target node references", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const invalidUnit = {
      ...unit,
      runtime_content: {
        ...unit.runtime_content,
        pages: [
          {
            ...unit.runtime_content.pages[0]!,
            blocks: [
              {
                ...unit.runtime_content.pages[0]!.blocks[0]!,
                target_nodes: ["missing_node"]
              }
            ]
          }
        ]
      }
    };

    const result = validateUnitSemanticIntegrity(invalidUnit);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: "unknown_node_reference",
        path: "runtime_content.pages[0].blocks[0].target_nodes[0]"
      })
    );
  });

  it("rejects runtime content blocks that expose restricted visibility scopes", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const invalidUnit = {
      ...unit,
      runtime_content: {
        ...unit.runtime_content,
        pages: [
          {
            ...unit.runtime_content.pages[0]!,
            blocks: [
              {
                ...unit.runtime_content.pages[0]!.blocks[0]!,
                privacy_level: PrivacyLevel.TEACHER_ONLY,
                visibility_scope: {
                  visible_to_roles: [UserRole.TEACHER, UserRole.STUDENT]
                }
              }
            ]
          }
        ]
      }
    };

    const result = validateUnitSemanticIntegrity(invalidUnit);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: "teacher_only_block_visible_to_student_or_guardian",
        path: "runtime_content.pages[0].blocks[0].visibility_scope.visible_to_roles"
      })
    );
  });

  it("rejects executable runtime content blocks without an active sandbox", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const invalidUnit = {
      ...unit,
      runtime_content: {
        ...unit.runtime_content,
        pages: [
          {
            ...unit.runtime_content.pages[0]!,
            blocks: [
              {
                ...unit.runtime_content.pages[0]!.blocks[0]!,
                type: "interactive" as const,
                sandbox: {
                  required: false,
                  runtime: "none" as const,
                  allowed_capabilities: []
                }
              }
            ]
          }
        ]
      }
    };

    const result = validateUnitSemanticIntegrity(invalidUnit);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: "unsafe_runtime_block_sandbox",
        path: "runtime_content.pages[0].blocks[0].sandbox"
      })
    );
  });
});
