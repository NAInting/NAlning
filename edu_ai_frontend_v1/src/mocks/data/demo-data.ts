export const demoIds = {
  tenantId: "tenant_xsd_001",
  schoolId: "school_xsd_hs_001",
  classId: "G10-C1",
  courseMath: "math_g10_2026s1",
  courseEnglish: "english_g10_2026s1",
  courseAi: "ai_lit_g10_2026s1",
  teacherMath: "teacher_math_001",
  studentPrimary: "stu_tok_9f3a",
  studentSecondary: "stu_tok_2b71",
  studentEnglish: "stu_tok_4c52",
  studentAiRisk: "stu_tok_7d88",
  guardianPrimary: "guardian_pk_001",
  reportDaily: "rpt_01K300",
  interventionOpen: "int_01K400",
  sessionMain: "sess_01K100"
} as const;

export const studentMasteryByToken = {
  [demoIds.studentPrimary]: {
    student_token: demoIds.studentPrimary,
    course_id: demoIds.courseMath,
    generated_at: "2026-04-12T10:05:00+08:00",
    knowledge_map: [
      {
        knowledge_tag: "quadratic_function",
        mastery_level: 76.5,
        evidence_count: 9,
        last_event_at: "2026-04-12T09:42:00+08:00",
        snapshot_at: "2026-04-12T10:00:00+08:00",
        snapshot_source: "daily_aggregation"
      },
      {
        knowledge_tag: "graph_translation",
        mastery_level: 58.0,
        evidence_count: 4,
        last_event_at: "2026-04-12T09:42:00+08:00",
        snapshot_at: "2026-04-12T10:00:00+08:00",
        snapshot_source: "teacher_followup_projection"
      },
      {
        knowledge_tag: "reflection_quality",
        mastery_level: 69.0,
        evidence_count: 3,
        last_event_at: "2026-04-12T10:00:00+08:00",
        snapshot_at: "2026-04-12T10:00:00+08:00",
        snapshot_source: "student_reflection_projection"
      }
    ],
    no_ai_baseline: {
      latest_completed_at: "2026-04-11T15:30:00+08:00",
      gap_score: 21.0,
      notes: "No-AI 口头复盘仍落后于有引导的完成表现，建议先做短时独立复述。"
    },
    last_7d_changes: [
      {
        knowledge_tag: "quadratic_function",
        delta: 8.5,
        from_snapshot_at: "2026-04-05T10:00:00+08:00",
        to_snapshot_at: "2026-04-12T10:00:00+08:00"
      },
      {
        knowledge_tag: "reflection_quality",
        delta: 4.0,
        from_snapshot_at: "2026-04-05T10:00:00+08:00",
        to_snapshot_at: "2026-04-12T10:00:00+08:00"
      }
    ]
  }
} as const;

export const studentProfileByToken = {
  [demoIds.studentPrimary]: {
    student_token: demoIds.studentPrimary,
    mastery_summary: studentMasteryByToken[demoIds.studentPrimary].knowledge_map,
    recent_process_summaries: [
      {
        summary_id: "sum_demo_001",
        window_type: "daily",
        window_end: "2026-04-12T10:00:00+08:00",
        summary_text: "程序步骤更顺了，但在图像平移和式子对应关系上仍容易混淆。",
        ai_dependency_score: 28.0,
        no_ai_gap_score: 21.0
      }
    ],
    has_active_emotion_signal: false,
    current_intervention: {
      status: "open",
      current_level: "L2",
      verification_due_at: "2026-04-14T17:00:00+08:00"
    },
    retention_notice: [
      {
        layer: "process",
        rule: "process_180d",
        note: "过程层摘要最多保留 180 天。"
      },
      {
        layer: "mastery",
        rule: "mastery_academic_term",
        note: "掌握度记录在当前学期内可见。"
      }
    ],
    excluded_internal_fields: [
      "teacher_reasoning_chain",
      "peer_comparison_data",
      "restricted_privacy_case_details"
    ]
  }
} as const;

export const teacherDailyReport = {
  report_id: demoIds.reportDaily,
  course_id: demoIds.courseMath,
  teacher_id: demoIds.teacherMath,
  window: "daily",
  knowledge_heat: [
    {
      tag: "quadratic_function",
      risk_count: 12,
      risk_breakdown: { high_risk: 12, medium_risk: 8, low_risk: 4, resolved: 1 }
    },
    {
      tag: "graph_translation",
      risk_count: 8,
      risk_breakdown: { high_risk: 8, medium_risk: 6, low_risk: 2, resolved: 0 }
    },
    {
      tag: "reading_inference",
      risk_count: 3,
      risk_breakdown: { high_risk: 3, medium_risk: 4, low_risk: 2, resolved: 0 }
    }
  ],
  priority_students: [
    {
      student_token: demoIds.studentPrimary,
      blockers: ["representation_confusion"],
      recommended_action: "L2 light reminder + 1 no-AI oral check",
      manual_review_required: false
    },
    {
      student_token: demoIds.studentSecondary,
      blockers: ["repeat_hint_pattern"],
      recommended_action: "L1 recap + 1 short independent retry",
      manual_review_required: false
    }
  ],
  recommended_group_actions: [
    "15 分钟小组复教：二次函数图像与表达式的对应关系"
  ],
  generated_at: "2026-04-12T18:00:00+08:00"
} as const;

export const teacherStudentDetailByToken = {
  [demoIds.studentPrimary]: {
    studentToken: demoIds.studentPrimary,
    displayName: "张一",
    radarScores: [
      { axis: "知识掌握", value: 76.5 },
      { axis: "程序流畅", value: 72.0 },
      { axis: "表征理解", value: 58.0 },
      { axis: "无 AI 独立性", value: 55.0 },
      { axis: "反思质量", value: 69.0 }
    ],
    blockers: ["representation_confusion"],
    recentProcessSummaries: [
      {
        summaryId: "sum_demo_001",
        summaryText: "学生在程序步骤上更顺了，但图像平移和式子关系仍会混淆。",
        aiDependencyScore: 28.0,
        noAiGapScore: 21.0
      }
    ],
    noAiRecommendation: "下次上课前先做 1 次 3 分钟口头解释，不给任何公式提示。",
    currentIntervention: {
      status: "open",
      current_level: "L2",
      linked_report_id: demoIds.reportDaily,
      trigger_type: "misconception",
      verification_due_at: "2026-04-14T17:00:00+08:00",
      note: "已对齐日报 rpt_01K300 中的 representation_confusion 项。"
    },
    sourceReportId: demoIds.reportDaily,
    recommendedInterventionLevel: "L2",
    recommendedTriggerType: "misconception"
  },
  [demoIds.studentSecondary]: {
    studentToken: demoIds.studentSecondary,
    displayName: "李二",
    radarScores: [
      { axis: "知识掌握", value: 63.0 },
      { axis: "程序流畅", value: 58.5 },
      { axis: "表征理解", value: 66.0 },
      { axis: "无 AI 独立性", value: 70.0 },
      { axis: "反思质量", value: 61.5 }
    ],
    blockers: ["repeat_hint_pattern"],
    recentProcessSummaries: [
      {
        summaryId: "sum_demo_002",
        summaryText: "学生独立做题时节奏稳定，但遇到第一步卡顿就连追多次提示。",
        aiDependencyScore: 41.0,
        noAiGapScore: 12.0
      }
    ],
    noAiRecommendation: "下一节课先给 1 个最短独立复述任务，再回看陪学提示频次。",
    currentIntervention: undefined,
    sourceReportId: demoIds.reportDaily,
    recommendedInterventionLevel: "L1",
    recommendedTriggerType: "ai_overreliance"
  }
} as const;

export const teacherStudentDetail = teacherStudentDetailByToken[demoIds.studentPrimary];

export const guardianConsentStatus = {
  student_token: demoIds.studentPrimary,
  items: [
    {
      consent_id: "consent_guardian_001_student_agent_v1",
      consent_type: "student_agent",
      version: "v1.0",
      status: "granted",
      effective_at: "2026-04-12T08:00:00+08:00",
      expires_at: "2026-10-12T08:00:00+08:00"
    },
    {
      consent_id: "consent_guardian_001_teacher_agent_summary_v1",
      consent_type: "teacher_agent_summary",
      version: "v1.0",
      status: "granted",
      effective_at: "2026-04-12T08:00:00+08:00",
      expires_at: "2026-10-12T08:00:00+08:00"
    },
    {
      consent_id: "consent_guardian_001_guardian_summary_v1",
      consent_type: "guardian_summary",
      version: "v1.0",
      status: "granted",
      effective_at: "2026-04-12T08:00:00+08:00",
      expires_at: "2026-10-12T08:00:00+08:00"
    }
  ]
} as const;

export const guardianSummary = {
  studentToken: demoIds.studentPrimary,
  displayName: "张一",
  progressSignals: [
    "二次函数主知识点一周提升 +8.5。",
    "已经能解释 a、h、k 的含义，但表征切换还不稳定。"
  ],
  supportSuggestions: [
    "先问 1 个问题，不要连续追问。",
    "优先听孩子口头解释，不做排名比较。"
  ],
  visibilityBoundary: [
    {
      label: "可以看到",
      items: ["阶段性学习摘要", "三类同意状态", "家庭支持建议"]
    },
    {
      label: "默认看不到",
      items: ["教师内部判断链", "同学对比数据", "隐私层详情"]
    }
  ]
} as const;

export const adminPreflight = {
  pilot_id: "pilot_xsd_001",
  school_id: demoIds.schoolId,
  generated_at: "2026-04-14T09:30:00+08:00",
  acceptance_total: 35,
  acceptance_passed: 35,
  acceptance_failed: 0,
  must_have_states: [
    "首校主数据齐全",
    "四层记忆可演示",
    "教师日报链路存在",
    "干预闭环链路存在",
    "三类同意有效",
    "Student Agent 双模路由已配置",
    "隐私层 restricted 案例存在",
    "时间语义自洽"
  ],
  check_groups: [
    { label: "主数据", passed: 9, total: 9 },
    { label: "seed 覆盖", passed: 13, total: 13 },
    { label: "视图与同意", passed: 3, total: 3 },
    { label: "链路与 ID", passed: 7, total: 7 },
    { label: "时间语义", passed: 1, total: 1 },
    { label: "合规用户", passed: 1, total: 1 },
    { label: "审计链连续性", passed: 1, total: 1 }
  ]
} as const;

export const adminCompliance = {
  generated_at: "2026-04-14T09:30:00+08:00",
  effective_consent_coverage_pct: 100,
  acceptance_pass_rate_pct: 100,
  restricted_access_count: 1,
  boundary_summary: [
    "Student Agent 高敏会话走 campus_local。",
    "Teacher Agent 只读取必要摘要。",
    "管理员可查看 hash chain 与受限访问记录。"
  ],
  do_not_do_items: [
    "不做课堂视频情绪打分",
    "不做跨校学生排名",
    "不把 Agent 建议当自动处分",
    "不默认长期保留情绪层全文"
  ]
} as const;

export const adminAuditPreview = {
  chain: [
    { audit_id: "audit_demo_001", hash_current: "hash_demo_001" },
    { audit_id: "audit_demo_002", hash_prev: "hash_demo_001", hash_current: "hash_demo_002" }
  ],
  latestPrivacyReview: {
    case_id: "privacy_demo_001",
    operator_id: "user_compliance_001",
    action_type: "privacy_case_access"
  }
} as const;
