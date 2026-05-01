export type DemoPageId = "P01" | "P02" | "P03" | "P04" | "P05" | "P06" | "P07";

export type DemoAiState =
  | "disabled"
  | "enabled_after_student_mark"
  | "enabled_after_two_anchors"
  | "enabled_after_student_claim"
  | "misconception_actor_only"
  | "structure_feedback_only"
  | "disabled_for_first_draft";

export interface DemoTextAnchor {
  id: string;
  label: string;
  purpose: string;
}

export interface DemoPage {
  pageId: DemoPageId;
  title: string;
  ui: string;
  studentAction: string;
  aiState: DemoAiState;
  evidence: readonly string[];
  teacherSignals: readonly string[];
  privacy: readonly string[];
  allowedAiPrompts?: readonly string[];
  forbiddenAiActions?: readonly string[];
  aiRoles?: readonly string[];
  misconceptions?: readonly string[];
}

export interface DemoCourse {
  demoCourseId: string;
  sourceLessonId: string;
  mode: "mock_only_frontend_prototype";
  writebackAllowed: false;
  realProviderAllowed: false;
  realStudentDataAllowed: false;
  identity: {
    subject: string;
    grade: string;
    topic: string;
    durationMinutes: number;
    bigQuestion: string;
  };
  authorizedTextAnchorPolicy: {
    fullTextEmbedded: false;
    textbookScanEmbedded: false;
    allowedInDemo: readonly string[];
    forbiddenInDemo: readonly string[];
    anchors: readonly DemoTextAnchor[];
  };
  learningGoals: readonly string[];
  pages: readonly DemoPage[];
  teacherPreview: {
    safeSignalsOnly: true;
    classSummary: {
      firstResponseCompletionRate: number;
      imageryCardCompletionRate: number;
      noAiExitCompletionRate: number;
      commonMisconceptions: readonly { type: string; count: number }[];
    };
    suggestedTeacherActions: readonly string[];
    forbiddenFields: readonly string[];
  };
  demoHighlights: readonly string[];
}

export const chineseL001DemoCourse = {
  demoCourseId: "cn_l001_qinyuanchun_changsha_frontend_demo",
  sourceLessonId: "L001",
  mode: "mock_only_frontend_prototype",
  writebackAllowed: false,
  realProviderAllowed: false,
  realStudentDataAllowed: false,
  identity: {
    subject: "语文",
    grade: "高一上",
    topic: "《沁园春·长沙》诵读、意象与情感基调",
    durationMinutes: 45,
    bigQuestion: "为什么这首词中的秋景不是静止风景，而能呈现一种昂扬的精神气象？"
  },
  authorizedTextAnchorPolicy: {
    fullTextEmbedded: false,
    textbookScanEmbedded: false,
    allowedInDemo: [
      "title",
      "section_anchor_id",
      "line_or_position_label",
      "short_evidence_placeholder",
      "student_owned_annotation_summary"
    ],
    forbiddenInDemo: [
      "full_poem_text",
      "long_textbook_excerpt",
      "textbook_exercise_original",
      "teacher_guide_excerpt",
      "generated_standard_appreciation_paragraph"
    ],
    anchors: [
      { id: "T1", label: "标题与开篇位置", purpose: "建立文本入口" },
      { id: "T2", label: "秋景意象组 A", purpose: "圈画视觉/色彩意象" },
      { id: "T3", label: "秋景意象组 B", purpose: "圈画动作/空间意象" },
      { id: "T4", label: "发问/转折位置", purpose: "推动从景物到精神气象" },
      { id: "T5", label: "青年回忆位置", purpose: "进入时代感与表达任务" }
    ]
  },
  learningGoals: [
    "通过诵读标注说明停顿、重音、语速或语气变化与情感基调之间的关系。",
    "从合法教材文本中圈画至少 3 个意象，并说明选择理由。",
    "建立“意象 - 动作/色彩/空间 - 情绪/气象”的三层理解链。",
    "识别只背主题、只列景物、用背景替代文本、AI 代写赏析等误区。",
    "在 No-AI 区完成 40 秒口头解释或 120 字一稿。"
  ],
  pages: [
    {
      pageId: "P01",
      title: "No-AI 第一感受",
      ui: "short_response_card",
      studentAction: "不查资料、不问 AI，写 30-50 字第一感受。",
      aiState: "disabled",
      evidence: ["first_response_completed", "question_present"],
      teacherSignals: ["completion_rate", "safe_keyword_summary"],
      privacy: ["no_raw_student_text_to_teacher"]
    },
    {
      pageId: "P02",
      title: "诵读标注",
      ui: "reading_mark_selector",
      studentAction: "选择停顿、重音、语速或语气变化，并绑定一个文本锚点。",
      aiState: "enabled_after_student_mark",
      allowedAiPrompts: ["你为什么在这里停顿或加重？", "这个朗读处理能回到哪个文本锚点？"],
      forbiddenAiActions: ["voice_quality_label", "full_text_completion", "center_thesis"],
      evidence: ["reading_mark_present", "evidence_anchor_present"],
      teacherSignals: ["reading_mark_completion", "evidence_anchor_present"],
      privacy: ["no_raw_audio", "no_full_transcript", "no_refusal_to_mic_reason"]
    },
    {
      pageId: "P03",
      title: "意象证据卡",
      ui: "three_evidence_cards",
      studentAction: "填写 3 张意象卡：锚点、看到什么、动作/色彩/空间、情绪或气象判断。",
      aiState: "enabled_after_two_anchors",
      allowedAiPrompts: [
        "你选它不只是因为它是景物，对吗？它有什么动作感、色彩感或空间感？",
        "能不能先不用抽象主题词，只说清你看见了什么？"
      ],
      evidence: ["imagery_count", "middle_layer_present", "judgment_present"],
      teacherSignals: ["imagery_count", "middle_layer_missing", "evidence_chain_level"],
      privacy: ["no_long_textbook_excerpt"]
    },
    {
      pageId: "P04",
      title: "AI 角色追问",
      ui: "role_dialogue_panel",
      studentAction: "先写“我看到的不是普通秋景，因为 [证据锚点] 让我看到……”再进入 AI 追问。",
      aiRoles: ["青年时代观察者", "文本证据追问者"],
      aiState: "enabled_after_student_claim",
      forbiddenAiActions: ["simulate_author_private_mind", "write_submittable_answer", "provide_center_thesis"],
      evidence: ["student_first_expression_present", "ai_question_after_student_expression"],
      teacherSignals: ["role_boundary_respected", "evidence_chain_status"],
      privacy: ["no_raw_ai_dialogue_to_teacher"]
    },
    {
      pageId: "P05",
      title: "误区同学",
      ui: "misconception_branch_cards",
      studentAction: "判断误区同学的回答哪里不对，并补一个证据锚点。",
      misconceptions: [
        "scenery_list_only",
        "theme_without_evidence",
        "background_replaces_text",
        "voice_condition_evaluation",
        "ai_generated_appreciation"
      ],
      aiState: "misconception_actor_only",
      evidence: ["misconception_type", "missing_link_identified"],
      teacherSignals: ["misconception_distribution", "teacher_next_action"],
      privacy: ["no_mock_answer_as_final"]
    },
    {
      pageId: "P06",
      title: "三层白板",
      ui: "three_layer_whiteboard",
      studentAction: "把意象卡拖入“意象 -> 动作/色彩/空间 -> 情绪/精神气象”。",
      aiState: "structure_feedback_only",
      evidence: ["chain_integrity_level", "strengthened_link_type"],
      teacherSignals: ["chain_integrity_distribution", "missing_middle_layer_count"],
      privacy: ["no_private_annotation_original"]
    },
    {
      pageId: "P07",
      title: "No-AI 出口任务",
      ui: "exit_task_card",
      studentAction: "关闭 AI，完成 40 秒口头解释或 120 字一稿。",
      aiState: "disabled_for_first_draft",
      evidence: ["no_ai_exit_completed", "revision_reason_present"],
      teacherSignals: ["no_ai_expression_level", "no_ai_redo_required"],
      privacy: ["no_raw_audio", "no_full_transcript", "no_full_draft_to_teacher"]
    }
  ],
  teacherPreview: {
    safeSignalsOnly: true,
    classSummary: {
      firstResponseCompletionRate: 0.92,
      imageryCardCompletionRate: 0.81,
      noAiExitCompletionRate: 0.76,
      commonMisconceptions: [
        { type: "theme_without_evidence", count: 9 },
        { type: "scenery_list_only", count: 7 },
        { type: "background_replaces_text", count: 4 }
      ]
    },
    suggestedTeacherActions: [
      "先补证据锚点，再允许进入 AI 追问。",
      "对缺中间层的学生追问动作、色彩或空间关系。",
      "对依赖 AI 的学生安排 No-AI 40 秒口头重做。"
    ],
    forbiddenFields: [
      "raw_student_text",
      "raw_audio",
      "full_transcript",
      "raw_ai_dialogue",
      "private_association_original",
      "emotion_original",
      "family_experience",
      "copied_textbook_body"
    ]
  },
  demoHighlights: [
    "课程入口直接进入可运行学习体验，不是静态课件。",
    "学生先写、先圈、先读，AI 只能后追问。",
    "教师端只看安全学习信号和课堂动作建议。",
    "No-AI 出口任务证明学生离开 AI 也能表达。",
    "文本版权用锚点和占位处理，不内置完整课文。"
  ]
} as const satisfies DemoCourse;

export const misconceptionLabels = {
  scenery_list_only: "只罗列景物，没有解释",
  theme_without_evidence: "只背主题，没有证据",
  background_replaces_text: "用背景资料替代文本分析",
  voice_condition_evaluation: "把朗读评价变成嗓音评价",
  ai_generated_appreciation: "让 AI 直接生成可提交赏析段"
} as const;

export const noAiPageIds = new Set<DemoPageId>(["P01", "P07"]);

export function isNoAiDemoPage(page: Pick<DemoPage, "pageId" | "aiState">): boolean {
  return noAiPageIds.has(page.pageId) || page.aiState === "disabled" || page.aiState === "disabled_for_first_draft";
}

export function canShowEvidenceAiPrompts(completedAnchorCount: number): boolean {
  return completedAnchorCount >= 2;
}

export function findDemoCoursePrivacyLeaks(course: DemoCourse = chineseL001DemoCourse): string[] {
  const issues: string[] = [];
  if (course.writebackAllowed) {
    issues.push("writebackAllowed must remain false");
  }
  if (course.realProviderAllowed) {
    issues.push("realProviderAllowed must remain false");
  }
  if (course.realStudentDataAllowed) {
    issues.push("realStudentDataAllowed must remain false");
  }
  if (course.authorizedTextAnchorPolicy.fullTextEmbedded) {
    issues.push("full text must not be embedded");
  }
  if (course.authorizedTextAnchorPolicy.textbookScanEmbedded) {
    issues.push("textbook scans must not be embedded");
  }

  const teacherVisiblePayload = JSON.stringify({
    classSummary: course.teacherPreview.classSummary,
    suggestedTeacherActions: course.teacherPreview.suggestedTeacherActions,
    pageTeacherSignals: course.pages.map((page) => page.teacherSignals)
  });

  for (const forbiddenField of course.teacherPreview.forbiddenFields) {
    if (teacherVisiblePayload.includes(forbiddenField)) {
      issues.push(`teacher-visible payload exposes forbidden field ${forbiddenField}`);
    }
  }

  return issues;
}
