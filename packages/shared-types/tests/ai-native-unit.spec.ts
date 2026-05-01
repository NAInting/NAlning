import { describe, expect, it } from "vitest";

import {
  AgentMode,
  AiNativeUnitSpecSchema,
  AssessmentItemType,
  Grade,
  PedagogyType,
  PrivacyLevel,
  Subject,
  UserRole,
  type AiNativeUnitSpec,
  type GeneratedSectionMeta,
  type UnitSourceTrace
} from "../src";

const sourceTrace: UnitSourceTrace = {
  source_id: "math-standard-2022-function",
  source_type: "curriculum_standard",
  reference: "义务教育数学课程标准（2022年版）函数相关条目，待学科顾问精确核对。",
  retrieved_at: "2026-04-22T08:00:00.000Z"
};

function meta(authorAgent: GeneratedSectionMeta["author_agent"]): GeneratedSectionMeta {
  return {
    author_agent: authorAgent,
    confidence_score: 0.78,
    source_trace: [sourceTrace]
  };
}

const sampleUnit: AiNativeUnitSpec = {
  schema_version: "ai-native-unit-v0.1",
  metadata: {
    unit_id: "math_g8_linear_function_intro",
    subject: Subject.MATH,
    grade: Grade.G8,
    title: "一次函数的概念",
    duration_hours: 6,
    standard_alignment: [
      {
        standard_system: "义务教育数学课程标准（2022年版）",
        standard_code: "G8-FUNC-DRAFT",
        description: "理解一次函数的概念、表示和简单应用；待学科顾问核对精确条目。"
      }
    ],
    prerequisites: ["variables", "equations_intro"]
  },
  knowledge: {
    meta: meta("subject_expert"),
    nodes: [
      {
        node_id: "lf_slope_meaning",
        title: "斜率 k 的意义",
        mastery_criteria: ["能解释 k 的正负和大小对图像的影响"],
        misconceptions: ["把 k 当作图像与 y 轴的交点"],
        difficulty: 3
      }
    ],
    edges: [],
    global_misconceptions: ["把 k 和 b 的作用交换"]
  },
  pedagogy: {
    meta: meta("pedagogy_designer"),
    learning_path: ["lf_slope_meaning"],
    activities: [
      {
        activity_id: "act_socratic_slope",
        type: PedagogyType.SOCRATIC_DIALOGUE,
        target_nodes: ["lf_slope_meaning"],
        duration_min: 30,
        rationale: "斜率意义适合通过图像观察和追问建立。"
      }
    ],
    cognitive_load_estimate: "medium",
    differentiation_notes: ["对表征转换薄弱学生先给图像格点。"]
  },
  narrative: {
    meta: meta("narrative_designer"),
    scenarios: [
      {
        scenario_id: "scenario_bus_line",
        title: "校车路线费用",
        target_nodes: ["lf_slope_meaning"],
        setup: "用校车行驶距离和费用变化解释固定变化率。"
      }
    ],
    characters: [
      {
        character_id: "nova",
        name: "Nova",
        role: "温暖但有边界的 AI 学伴",
        voice_notes: "先追问学生想法，再给短提示。"
      }
    ],
    dialogue_scripts: [
      {
        script_id: "dlg_slope_mentor",
        mode: AgentMode.MENTOR,
        target_nodes: ["lf_slope_meaning"],
        opening_move: "你先不看公式，只看图像从左到右是上升还是下降？",
        boundary_notes: ["不直接给可提交答案。"]
      }
    ],
    gamification: ["用三次观察解锁一张学习痕迹卡。"]
  },
  implementation: {
    meta: meta("engineering_agent"),
    components: ["StudentAgentChat", "KnowledgeNodeContext", "LearningTraceCard"],
    prompts: [
      {
        prompt_id: "prompt_slope_mentor_v1",
        purpose: "student_dialogue",
        version: "v1",
        target_nodes: ["lf_slope_meaning"]
      }
    ],
    data_hooks: [
      {
        hook_id: "hook_slope_attempt",
        event_type: "learning_event.conversation_turn",
        target_nodes: ["lf_slope_meaning"],
        privacy_note: "只记录学习信号，不记录情绪原文。"
      }
    ]
  },
  runtime_content: {
    meta: meta("engineering_agent"),
    default_visible_to_roles: [UserRole.STUDENT],
    pages: [
      {
        page_id: "page_slope_first_look",
        title: "先看斜率的方向",
        order: 0,
        target_nodes: ["lf_slope_meaning"],
        blocks: [
          {
            block_id: "block_slope_direction_prompt",
            type: "callout",
            status: "ready",
            title: "先观察，不急着套公式",
            order: 0,
            target_nodes: ["lf_slope_meaning"],
            visibility_scope: {
              visible_to_roles: [UserRole.STUDENT]
            },
            privacy_level: PrivacyLevel.PUBLIC,
            confidence_score: 0.76,
            source_trace: [
              {
                ...sourceTrace,
                source_id: "block-slope-direction-prompt",
                source_type: "agent_output",
                reference: "Engineering agent runtime-content sample for slope direction.",
                snippet: "你先不看公式，只看图像从左到右是上升还是下降？"
              }
            ],
            sandbox: {
              required: false,
              runtime: "static",
              allowed_capabilities: []
            },
            payload: {
              body: "你先不看公式，只看图像从左到右是上升还是下降？"
            }
          }
        ]
      }
    ]
  },
  assessment: {
    meta: meta("subject_expert"),
    items: [
      {
        item_id: "item_slope_direction",
        type: AssessmentItemType.SHORT_ANSWER,
        target_nodes: ["lf_slope_meaning"],
        prompt: "说明 y = -2x + 5 的图像大致向哪个方向倾斜。",
        expected_signal: "能说出从左上到右下，并解释 x 增加时 y 减少。",
        requires_human_review: true
      }
    ],
    min_confidence_threshold: 0.7
  },
  quality: {
    meta: meta("qa_agent"),
    checklist_pass: false,
    issues: [
      {
        issue_id: "issue_standard_alignment_pending",
        severity: "medium",
        owner_agent: "subject_expert",
        description: "课标条目仍为 draft，需要学科顾问核对。",
        status: "open"
      }
    ],
    reviewer_notes: ["样例用于 schema 校验，不代表学科定稿。"]
  }
};

describe("AI-native unit spec schema", () => {
  it("accepts the phase 2.1 sample unit", () => {
    expect(AiNativeUnitSpecSchema.safeParse(sampleUnit).success).toBe(true);
  });

  it("rejects generated sections without source trace", () => {
    const invalid = structuredClone(sampleUnit);
    invalid.knowledge.meta.source_trace = [];

    expect(AiNativeUnitSpecSchema.safeParse(invalid).success).toBe(false);
  });

  it("rejects unit ids that are not stable machine ids", () => {
    const invalid = structuredClone(sampleUnit);
    invalid.metadata.unit_id = "一次函数";

    expect(AiNativeUnitSpecSchema.safeParse(invalid).success).toBe(false);
  });

  it("rejects runtime blocks without source trace", () => {
    const invalid = structuredClone(sampleUnit);
    invalid.runtime_content.pages[0]!.blocks[0]!.source_trace = [];

    expect(AiNativeUnitSpecSchema.safeParse(invalid).success).toBe(false);
  });
});
