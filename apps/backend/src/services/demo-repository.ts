export const demoIds = {
  studentToken: "stu_tok_9f3a",
  secondStudentToken: "stu_tok_2b71",
  teacherId: "teacher_math_001",
  guardianId: "guardian_pk_001",
  reportId: "rpt_01K300",
  interventionId: "int_01K400",
  consentId: "consent_demo_001",
  sessionId: "sess_01K100"
} as const;

export function getStudentMastery(studentToken: string) {
  ensureKnownStudent(studentToken);
  return {
    student_token: studentToken,
    course_id: "math_g10_2026s1",
    generated_at: "2026-04-12T18:00:00+08:00",
    knowledge_map: [
      {
        tag: "quadratic_function",
        mastery_score: 76.5,
        confidence: 0.82,
        evidence_count: 8,
        last_activated_at: "2026-04-12T09:42:00+08:00"
      },
      {
        tag: "graph_translation",
        mastery_score: 58,
        confidence: 0.74,
        evidence_count: 5,
        last_activated_at: "2026-04-12T09:48:00+08:00"
      },
      {
        tag: "reflection_quality",
        mastery_score: 69,
        confidence: 0.71,
        evidence_count: 3,
        last_activated_at: "2026-04-12T10:00:00+08:00"
      }
    ],
    no_ai_baseline: {
      latest_task_id: "no_ai_task_001",
      gap_score: 21,
      status: "needs_follow_up"
    },
    last_7d_changes: [
      { tag: "quadratic_function", delta: 8.5 },
      { tag: "graph_translation", delta: -1 },
      { tag: "reflection_quality", delta: 4 }
    ]
  };
}

export function createStudentAgentSession(body: unknown) {
  const content = typeof body === "object" && body !== null && "message" in body ? String(body.message) : "";
  const sensitive = ["焦虑", "难受", "害怕", "不想上学", "自伤", "家暴"].some((keyword) => content.includes(keyword));

  return {
    session_id: demoIds.sessionId,
    route_selected: sensitive ? "campus_local" : "controlled_cloud",
    assistant_message: sensitive
      ? "我会把这段对话留在校内本地处理。你可以先只说一点点，我们慢慢来。"
      : "你先说说顶点式里哪个部分对应图像的平移？",
    follow_up_suggestions: ["先画图像", "换一个例子", "切到无 AI 区"]
  };
}

export function getStudentProfile(studentToken: string) {
  const mastery = getStudentMastery(studentToken);
  return {
    student_token: studentToken,
    mastery_summary: mastery.knowledge_map,
    recent_process_summaries: [
      {
        summary_id: "sum_demo_001",
        window_type: "daily",
        key_blocker: "representation_confusion",
        ai_dependency_score: 42,
        no_ai_gap_score: 21
      }
    ],
    has_active_emotion_signal: false,
    current_intervention: {
      intervention_id: demoIds.interventionId,
      intervention_level: "L2",
      status: "open"
    },
    retention_notice: "学习过程摘要保留 180 天，情绪层信息原则上只在校内短期处理。",
    excluded_internal_fields: ["teacher_reasoning_chain", "peer_comparison_data", "restricted_privacy_case_details"]
  };
}

export function createTeacherDailyReport() {
  return {
    report_id: demoIds.reportId,
    generated_at: "2026-04-12T18:00:00+08:00",
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
      }
    ],
    priority_students: [
      {
        student_token: demoIds.studentToken,
        blocker: "representation_confusion",
        recommended_action: "L2 小组纠错 + No-AI 口头复盘"
      },
      {
        student_token: demoIds.secondStudentToken,
        blocker: "hint_overuse",
        recommended_action: "L1 课后 5 分钟确认"
      }
    ],
    recommended_group_actions: ["明天先做 8 分钟图像平移口头解释", "把顶点式和图像移动放在同一张板书里"]
  };
}

export function createIntervention(body: Record<string, unknown>) {
  return {
    intervention_id: demoIds.interventionId,
    status: "open",
    linked_report_id: String(body.linked_report_id ?? demoIds.reportId),
    verification_due_at: String(body.verification_due_at ?? "2026-04-19T18:00:00+08:00")
  };
}

export function getConsentStatus(studentToken: string) {
  ensureKnownStudent(studentToken);
  return {
    student_token: studentToken,
    items: [
      { consent_type: "student_agent", status: "granted", version: 1 },
      { consent_type: "teacher_agent_summary", status: "granted", version: 1 },
      { consent_type: "guardian_summary", status: "granted", version: 1 }
    ]
  };
}

export function createConsent(body: Record<string, unknown>) {
  return {
    consent_id: demoIds.consentId,
    status: "granted",
    version: Number(body.version ?? 1),
    effective_at: new Date().toISOString(),
    expires_at: "2027-04-12T00:00:00+08:00"
  };
}

export function withdrawConsent(consentId: string) {
  return {
    consent_id: consentId,
    status: "withdrawn",
    withdrawn_at: new Date().toISOString()
  };
}

export function getConsentStudentToken(consentId: string): string | undefined {
  return consentId === demoIds.consentId ? demoIds.studentToken : undefined;
}

export function isKnownStudentToken(studentToken: string): boolean {
  return studentToken === demoIds.studentToken || studentToken === demoIds.secondStudentToken;
}

function ensureKnownStudent(studentToken: string): void {
  if (!isKnownStudentToken(studentToken)) {
    throw new Error(`Unknown demo student token: ${studentToken}`);
  }
}
