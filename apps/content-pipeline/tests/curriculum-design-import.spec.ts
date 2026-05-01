import { describe, expect, it } from "vitest";

import { Grade, Subject, type CurriculumDesignImportDraft } from "@edu-ai/shared-types";

import { validateCurriculumDesignImportDraft } from "../src";

const sourceTrace = {
  source_id: "textbook_linear_function",
  source_type: "textbook" as const,
  reference: "用户提供的一次函数概念教材材料。"
};

function buildValidDraft(): CurriculumDesignImportDraft {
  return {
    schema_version: "edu-ai-curriculum-import-v0.1",
    import_id: "import_math_g8_linear_function_001",
    created_at: "2026-04-26T13:00:00.000Z",
    source_conversation: {
      author: "mixed",
      source_file: "课程设计/math_g8_linear_function_design.md",
      source_material_summary: "基于一次函数概念教材材料的 AI 原生课程设计。"
    },
    unit_overview: {
      unit_id_suggestion: "math_g8_linear_function_intro",
      subject: Subject.MATH,
      grade: Grade.G8,
      title: "一次函数的概念",
      duration_hours: 6,
      standard_alignment: [
        {
          standard_system: "义务教育数学课程标准（2022年版）",
          standard_code: "G8-FUNC-DRAFT",
          description: "函数相关条目，待学科顾问核对精确编号。",
          confidence: 0.82,
          needs_human_verification: false
        }
      ],
      ai_native_big_question: "为什么一条直线能表达变化关系？",
      knowledge_goals: ["理解 k 对一次函数图像方向和变化快慢的影响。"],
      capability_goals: ["能用图像、表格和语言解释变化率。"],
      student_experience_thesis: "学生先观察图像变化，再和 AI 导师讨论 k 的意义。",
      teacher_teaching_thesis: "老师控制概念边界，用无 AI 口头解释验证真实掌握。",
      no_ai_principles: ["关键解释必须由学生独立完成。"]
    },
    student_material: {
      pages: [
        {
          page_id: "page_slope_observe",
          page_title: "先看图像怎么变",
          page_type: "observation_discovery",
          learning_goal: "观察 k 的正负与图像方向。",
          student_experience: "拖动 k，先写预测，再看图像变化。",
          teacher_purpose: "暴露 k/b 混淆。",
          blocks: [
            {
              block_id: "block_predict_k",
              block_type: "student_prediction",
              target_knowledge_nodes: ["lf_slope_meaning"],
              student_action: "先预测 k 变大时图像如何变化。",
              ai_role: "苏格拉底导师",
              ai_prompt_draft: "你先猜，不急着套公式。你觉得 k 变大会发生什么？",
              voice_or_text: "either",
              no_ai_boundary: "预测必须先独立写出。",
              output_evidence: ["prediction_text"],
              teacher_visible_signal: ["是否能区分 k 和 b"],
              privacy_boundary: ["不展示原始对话全文给老师"],
              source_trace: [sourceTrace]
            },
            {
              block_id: "block_no_ai_explain",
              block_type: "no_ai_task",
              target_knowledge_nodes: ["lf_slope_meaning"],
              student_action: "不用 AI，用自己的话解释 k 的意义。",
              ai_role: "退出提示者",
              voice_or_text: "none",
              no_ai_boundary: "此块必须独立完成。",
              output_evidence: ["no_ai_written_explanation"],
              teacher_visible_signal: ["能否独立解释变化率"],
              privacy_boundary: ["仅展示教师安全摘要"],
              source_trace: [sourceTrace]
            }
          ]
        }
      ]
    },
    teacher_plan: {
      pre_class_setup: ["准备一次函数图像演示。"],
      opening_moves: ["先让学生猜 k 的作用。"],
      key_concept_explanations: ["k 表示变化率，b 表示截距。"],
      ai_interaction_plan: ["AI 先追问学生观察，再给短提示。"],
      peer_discussion_plan: ["两人互相解释图像方向。"],
      no_ai_verification_plan: ["学生独立写出 k 的意义。"],
      board_or_whiteboard_plan: ["在白板上拖动 k。"],
      teacher_observation_points: ["学生是否混淆 k 和 b。"],
      expected_heatmap_patterns: ["斜率意义可能出现中风险。"],
      intervention_ladder: [
        {
          level: "L2",
          trigger: "多数学生混淆 k 和 b。",
          teacher_action: "小组纠错。",
          verification: "无 AI 口头复盘。",
          close_condition: "能独立解释 k 的作用。"
        }
      ],
      after_class_tasks: ["完成一道迁移题。"],
      next_lesson_bridge: ["从变化率过渡到解析式。"]
    },
    classroom_script: {
      duration_min: 45,
      steps: [
        {
          step_id: "step_predict",
          start_min: 0,
          end_min: 8,
          phase: "scenario_wakeup",
          teacher_action: "提出校车费用情境。",
          student_action: "独立预测图像方向。",
          ai_action: "不直接解释公式，只提示观察。",
          evidence_created: ["prediction_text"],
          runtime_event_suggestions: [
            {
              event_type: "progress",
              domain: "academic",
              privacy_level: "academic",
              safe_summary: "学生完成一次图像方向预测。"
            }
          ]
        }
      ]
    },
    ai_interaction_scripts: [
      {
        script_id: "script_slope_mentor",
        role_type: "student_agent",
        target_knowledge_nodes: ["lf_slope_meaning"],
        role_positioning: "温暖但有边界的苏格拉底式数学学伴。",
        hard_no: ["不直接给可提交答案"],
        opening_move: "你先看图像，从左到右它是在上升还是下降？",
        follow_up_strategy: ["先追问观察", "三次卡住后给小提示"],
        hint_policy: "提示必须短，并要求学生复述。",
        no_ai_transition_rule: "关键解释进入无 AI 区完成。",
        source_trace_required: true
      }
    ],
    learning_tasks: [
      {
        task_id: "task_no_ai_k_explain",
        task_type: "no_ai_baseline_task",
        purpose: "验证学生是否能不依赖 AI 解释 k。",
        student_submission: ["written_explanation"],
        ai_allowed: false,
        target_knowledge_nodes: ["lf_slope_meaning"],
        evaluation_criteria: ["能说明 k 的正负影响方向。"],
        teacher_visible_signal: ["独立解释质量"],
        privacy_boundary: ["不展示完整原文，展示教师安全摘要。"]
      }
    ],
    capability_certifications: [
      {
        certification_id: "cert_no_ai_slope",
        certification_type: "no_ai_baseline",
        capability_goal: "无 AI 解释一次函数斜率意义。",
        evidence_required: ["written_explanation"],
        pass_criteria: ["能区分 k 与 b。"],
        human_review_required: true,
        target_knowledge_nodes: ["lf_slope_meaning"]
      }
    ],
    teacher_dashboard_signals: [
      {
        signal_id: "signal_k_b_confusion",
        signal_type: "misconception_cluster",
        source_evidence: ["prediction_text", "no_ai_written_explanation"],
        visible_summary: "部分学生可能混淆 k 和 b，需要教师做一次小组纠错。",
        blocked_raw_fields: ["raw_dialogue", "voice_audio", "voice_transcript"],
        suggested_intervention_level: "L2"
      }
    ],
    privacy_boundaries: [
      {
        boundary_id: "boundary_raw_dialogue",
        data_class: "raw_dialogue",
        student_visible: true,
        teacher_visible: false,
        guardian_visible: false,
        admin_audit_visible: true,
        retention_note: "学生自有视图未来可选；教师和家长默认不可见。",
        projection_rule: "教师只看安全摘要和误区聚类。"
      },
      {
        boundary_id: "boundary_voice_audio",
        data_class: "voice_audio",
        student_visible: false,
        teacher_visible: false,
        guardian_visible: false,
        admin_audit_visible: false,
        retention_note: "默认不存储原始语音。",
        projection_rule: "只生成安全学习摘要。"
      }
    ],
    runtime_contract: {
      unit_id: "math_g8_linear_function_intro",
      pages: [
        {
          page_id: "page_slope_observe",
          block_ids: ["block_predict_k", "block_no_ai_explain"],
          target_knowledge_nodes: ["lf_slope_meaning"]
        }
      ]
    },
    risks: [
      {
        risk_id: "risk_ai_gives_formula_too_early",
        risk: "AI 过早给公式解释。",
        mitigation: "必须先收集学生预测。"
      }
    ],
    source_trace: [sourceTrace]
  };
}

describe("curriculum design import validation", () => {
  it("passes a structured curriculum draft that keeps source writeback gated", () => {
    const result = validateCurriculumDesignImportDraft(buildValidDraft());

    expect(result.passed).toBe(true);
    expect(result.validation_summary).toEqual({
      shape_gate: "passed",
      curriculum_gate: "passed",
      pedagogy_gate: "passed",
      runtime_gate: "passed",
      governance_gate: "passed"
    });
  });

  it("blocks foreign standard substitution", () => {
    const draft = buildValidDraft();
    draft.unit_overview.standard_alignment[0] = {
      standard_system: "Common Core State Standards",
      standard_code: "CCSS.MATH.CONTENT.8.F.A.3",
      description: "Common Core functions standard.",
      confidence: 0.95,
      needs_human_verification: false
    };

    const result = validateCurriculumDesignImportDraft(draft);

    expect(result.passed).toBe(false);
    expect(result.validation_summary.curriculum_gate).toBe("blocked");
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "foreign_standard_substitution" }));
  });

  it("blocks curriculum drafts that lack no-AI capability evidence", () => {
    const draft = buildValidDraft();
    draft.student_material.pages[0]!.blocks = draft.student_material.pages[0]!.blocks.filter(
      (block) => block.block_type !== "no_ai_task"
    );
    draft.learning_tasks[0] = {
      ...draft.learning_tasks[0]!,
      task_type: "practice_task",
      ai_allowed: true
    };
    draft.capability_certifications[0] = {
      ...draft.capability_certifications[0]!,
      certification_type: "process_evidence"
    };

    const result = validateCurriculumDesignImportDraft(draft);

    expect(result.passed).toBe(false);
    expect(result.validation_summary.pedagogy_gate).toBe("blocked");
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "missing_no_ai_baseline" }));
  });

  it("blocks teacher dashboard signals that expose raw content", () => {
    const draft = buildValidDraft();
    draft.teacher_dashboard_signals[0] = {
      ...draft.teacher_dashboard_signals[0]!,
      visible_summary: "老师可查看学生完整对话原文来判断问题。"
    };

    const result = validateCurriculumDesignImportDraft(draft);

    expect(result.passed).toBe(false);
    expect(result.validation_summary.governance_gate).toBe("blocked");
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "teacher_signal_raw_content_leak" }));
  });

  it("blocks voice audio boundaries that become visible to teachers or guardians", () => {
    const draft = buildValidDraft();
    draft.privacy_boundaries[1] = {
      ...draft.privacy_boundaries[1]!,
      teacher_visible: true
    };

    const result = validateCurriculumDesignImportDraft(draft);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: "raw_or_sensitive_boundary_visible_to_teacher_or_guardian" })
    );
  });

  it("blocks runtime contracts that reference missing student blocks", () => {
    const draft = buildValidDraft();
    draft.runtime_contract.pages[0]!.block_ids.push("missing_block");

    const result = validateCurriculumDesignImportDraft(draft);

    expect(result.passed).toBe(false);
    expect(result.validation_summary.runtime_gate).toBe("blocked");
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "runtime_block_reference_missing" }));
  });
});
