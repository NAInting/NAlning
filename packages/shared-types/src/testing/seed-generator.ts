import { randomUUID } from "node:crypto";

import {
  AccessAction,
  AdminPermission,
  AdminScope,
  AgentMode,
  AgentType,
  AppealResolutionOutcome,
  AppealState,
  AppealType,
  AssessmentItemType,
  AssessmentType,
  AuditOutcome,
  AuthProvider,
  CompletionCriteriaType,
  ConsentStatus,
  ConsentType,
  ConversationSpeaker,
  ConversationStatus,
  DataResidency,
  DifficultyProgression,
  DialogueNodeType,
  DialogueVariableType,
  EmotionCategory,
  Grade,
  GuardianRelationship,
  HelpResolution,
  HelpTopicCategory,
  InterAgentSignalType,
  InterventionSource,
  LearningActivityType,
  LearningEventType,
  MasteryLevel,
  MemoryPrivacyBucket,
  MilestoneType,
  NotificationChannel,
  ParentingStyleHint,
  PedagogyType,
  PrivacyLevel,
  AgentTone,
  RecommendedResponder,
  RelationType,
  RetentionPolicy,
  RiskCategory,
  ScoringMethod,
  SchoolType,
  SeverityLevel,
  SignalUrgency,
  SignatureMethod,
  Subject,
  TargetAgentType,
  TeacherPermissionLevel,
  TrendDirection,
  UnitStatus,
  UserRole,
  UserStatus,
  VerificationMethod,
  VerificationStatus,
  ViolationAction
} from "../enums";
import type { AccessScope } from "../governance/access-scope";
import type { Admin } from "../identity/admin";
import type { Class } from "../identity/class";
import type { Guardian } from "../identity/guardian";
import type { GuardianStudentBinding, TeacherStudentBinding } from "../identity/relationships";
import type { School } from "../identity/school";
import type { Student } from "../identity/student";
import type { Teacher } from "../identity/teacher";
import type { User } from "../identity/user";
import type { AgentProfile } from "../agent/agent-profile";
import type {
  EpisodicMemoryEntry,
  StudentMemorySnapshot,
  WorkingMemory
} from "../agent/agent-memory";
import type { Assessment } from "../content/assessment";
import type { DialogueScript } from "../content/dialogue-script";
import type { KnowledgeNode } from "../content/knowledge-node";
import type { LearningPath } from "../content/learning-path";
import type { Scenario } from "../content/scenario";
import type { Unit } from "../content/unit";
import type { EmotionBaseline } from "../communication/emotion-baseline";
import type { InterAgentSignal } from "../communication/inter-agent-signal";
import type { PrivacyFilterRule } from "../communication/privacy-filter-rule";
import type { AppealTicket } from "../governance/appeal";
import type { AuditLogEntry } from "../governance/audit-log";
import type { ConfidenceScore } from "../governance/confidence-score";
import type { ConsentRecord } from "../governance/consent";
import type { Conversation } from "../learning/conversation";
import type { LearningEvent } from "../learning/learning-event";
import type { MasteryHistory, MasteryRecord } from "../learning/mastery";

/**
 * 阶段 0.1 的连贯种子数据集。
 */
export interface SharedTypesSeedDataset {
  school: School;
  classes: Class[];
  users: User[];
  students: Student[];
  teachers: Teacher[];
  guardians: Guardian[];
  admins: Admin[];
  teacher_student_bindings: TeacherStudentBinding[];
  guardian_student_bindings: GuardianStudentBinding[];
  units: Unit[];
  knowledge_nodes: KnowledgeNode[];
  learning_paths: LearningPath[];
  scenarios: Scenario[];
  dialogue_scripts: DialogueScript[];
  assessments: Assessment[];
  learning_events: LearningEvent[];
  mastery_records: MasteryRecord[];
  mastery_history: MasteryHistory[];
  conversations: Conversation[];
  agent_profiles: AgentProfile[];
  working_memories: WorkingMemory[];
  episodic_memories: EpisodicMemoryEntry[];
  student_memory_snapshots: StudentMemorySnapshot[];
  emotion_baselines: EmotionBaseline[];
  consent_records: ConsentRecord[];
  audit_logs: AuditLogEntry[];
  appeal_tickets: AppealTicket[];
  confidence_scores: ConfidenceScore[];
  access_scopes: AccessScope[];
  inter_agent_signals: InterAgentSignal[];
  privacy_filter_rules: PrivacyFilterRule[];
}

function iso(dayOffset = 0, hour = 9, minute = 0) {
  const date = new Date(Date.UTC(2026, 3, 19 + dayOffset, hour - 8, minute, 0));
  return date.toISOString();
}

function userId(prefix: string, index: number) {
  return `${prefix}_${index}`;
}

/**
 * 生成 1 校、2 班、20 学生、5 教师、30 家长的测试数据。
 */
export function buildSeedDataset(): SharedTypesSeedDataset {
  const schoolId = randomUUID();
  const adminUserId = randomUUID();
  const adminId = randomUUID();
  const classIds = [randomUUID(), randomUUID()];

  const teacherSubjects = [Subject.MATH, Subject.CHINESE, Subject.ENGLISH, Subject.PHYSICS, Subject.BIOLOGY];
  const teacherUsers: User[] = [];
  const teachers: Teacher[] = [];

  for (let index = 0; index < 5; index += 1) {
    const user_id = randomUUID();
    teacherUsers.push({
      id: user_id,
      created_at: iso(),
      updated_at: iso(),
      version: 1,
      role: UserRole.TEACHER,
      display_name: `教师${index + 1}`,
      email: `teacher${index + 1}@school.local`,
      locale: "zh-CN",
      timezone: "Asia/Shanghai",
      auth_provider: AuthProvider.PASSWORD,
      status: UserStatus.ACTIVE
    });
    teachers.push({
      id: randomUUID(),
      created_at: iso(),
      updated_at: iso(),
      version: 1,
      user_id,
      school_id: schoolId,
      subjects_taught: [teacherSubjects[index] ?? Subject.MATH],
      classes_taught: [...classIds],
      ...(index < 2 ? { homeroom_class_id: classIds[index]! } : {}),
      teaching_years: 5 + index,
      certification: `cert-${index + 1}`,
      permission_level:
        index === 0
          ? TeacherPermissionLevel.PRINCIPAL
          : index < 3
            ? TeacherPermissionLevel.SENIOR
            : TeacherPermissionLevel.BASIC
    });
  }

  const studentUsers: User[] = [];
  const students: Student[] = [];

  for (let index = 0; index < 20; index += 1) {
    const user_id = randomUUID();
    studentUsers.push({
      id: user_id,
      created_at: iso(),
      updated_at: iso(),
      version: 1,
      role: UserRole.STUDENT,
      display_name: `学生${index + 1}`,
      locale: "zh-CN",
      timezone: "Asia/Shanghai",
      auth_provider: AuthProvider.SSO,
      status: UserStatus.ACTIVE
    });
    students.push({
      id: randomUUID(),
      created_at: iso(),
      updated_at: iso(),
      version: 1,
      user_id,
      school_id: schoolId,
      class_ids: [index < 10 ? classIds[0]! : classIds[1]!],
      grade: Grade.G8,
      enrolled_subjects: [Subject.MATH, Subject.CHINESE, Subject.ENGLISH],
      learning_style_tags: index % 2 === 0 ? ["visual", "step_by_step"] : ["verbal"],
      student_number: `G8-${String(index + 1).padStart(2, "0")}`,
      memory_enabled: true,
      visibility_scope: {
        visible_to_roles: [UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN],
        visible_to_relations: [RelationType.GUARDIAN_OF_STUDENT],
        excluded_fields_by_role: {
          guardian: ["learning_style_tags"]
        }
      }
    });
  }

  const guardianUsers: User[] = [];
  const guardians: Guardian[] = [];
  const guardianBindings: GuardianStudentBinding[] = [];

  for (let index = 0; index < 30; index += 1) {
    const user_id = randomUUID();
    guardianUsers.push({
      id: user_id,
      created_at: iso(),
      updated_at: iso(),
      version: 1,
      role: UserRole.GUARDIAN,
      display_name: `家长${index + 1}`,
      locale: "zh-CN",
      timezone: "Asia/Shanghai",
      auth_provider: AuthProvider.WECHAT,
      status: UserStatus.ACTIVE
    });
    const guardianId = randomUUID();
    guardians.push({
      id: guardianId,
      created_at: iso(),
      updated_at: iso(),
      version: 1,
      user_id,
      notification_preferences: {
        weekly_report: true,
        emergency_only: index % 3 === 0,
        preferred_channel: NotificationChannel.WECHAT,
        quiet_hours: { start: "21:00", end: "07:00" }
      },
      parenting_style_hint: ParentingStyleHint.BALANCED
    });
    guardianBindings.push({
      id: randomUUID(),
      created_at: iso(),
      updated_at: iso(),
      version: 1,
      guardian_id: guardianId,
      student_id: students[index % students.length]!.id,
      relationship:
        index % 3 === 0
          ? GuardianRelationship.FATHER
          : index % 3 === 1
            ? GuardianRelationship.MOTHER
            : GuardianRelationship.LEGAL_GUARDIAN,
      can_view_reports: true,
      can_handle_appeals: index % 2 === 0,
      can_give_consent: index < 20,
      verification_status: VerificationStatus.VERIFIED,
      verification_method: VerificationMethod.SCHOOL_CONFIRMATION
    });
  }

  const adminUser: User = {
    id: adminUserId,
    created_at: iso(),
    updated_at: iso(),
    version: 1,
    role: UserRole.ADMIN,
    display_name: "平台管理员",
    email: "admin@school.local",
    locale: "zh-CN",
    timezone: "Asia/Shanghai",
    auth_provider: AuthProvider.PASSWORD,
    status: UserStatus.ACTIVE
  };

  const admin: Admin = {
    id: adminId,
    created_at: iso(),
    updated_at: iso(),
    version: 1,
    user_id: adminUserId,
    admin_scope: AdminScope.SCHOOL,
    school_id: schoolId,
    permissions: [
      AdminPermission.VIEW_AUDIT_LOGS,
      AdminPermission.HANDLE_APPEALS,
      AdminPermission.MANAGE_USERS,
      AdminPermission.MANAGE_CONSENT,
      AdminPermission.EXPORT_DATA,
      AdminPermission.CONFIGURE_PRIVACY
    ]
  };

  const school: School = {
    id: schoolId,
    created_at: iso(),
    updated_at: iso(),
    version: 1,
    name: "新时代实验学校",
    type: SchoolType.PRIVATE,
    address: "深圳市南山区未来大道 88 号",
    contact_email: "contact@school.local",
    data_residency: DataResidency.CN_MAINLAND,
    privacy_policy_version: "2026.04",
    enabled_features: ["student_agent", "teacher_agent", "governance_console"],
    grade_range: {
      start: Grade.G7,
      end: Grade.G12
    }
  };

  const classes: Class[] = classIds.map((id, index) => ({
    id,
    created_at: iso(),
    updated_at: iso(),
    version: 1,
    school_id: schoolId,
    name: `初二(${index + 1})班`,
    grade: Grade.G8,
    academic_year: "2026-2027",
    homeroom_teacher_id: teachers[index]!.id,
    subject_teachers: teachers.map((teacher, teacherIndex) => ({
      subject: teacherSubjects[teacherIndex] ?? Subject.MATH,
      teacher_id: teacher.id
    })),
    student_ids: students
      .filter((_, studentIndex) => (index === 0 ? studentIndex < 10 : studentIndex >= 10))
      .map((student) => student.id),
    is_pilot_class: index === 0,
    ...(index === 0 ? { pilot_cohort_id: randomUUID() } : {})
  }));

  const teacherStudentBindings: TeacherStudentBinding[] = students.flatMap((student, index) => {
    const subjectTeacher = teachers[index % teachers.length]!;
    return [
      {
        id: randomUUID(),
        created_at: iso(),
        updated_at: iso(),
        version: 1,
        teacher_id: subjectTeacher.id,
        student_id: student.id,
        relation_type: RelationType.SUBJECT_TEACHER,
        subjects: subjectTeacher.subjects_taught,
        class_id: student.class_ids[0]!,
        active_from: iso(-30)
      }
    ];
  });

  const primaryUnitId = randomUUID();
  const knowledgeNodes: KnowledgeNode[] = [0, 1, 2].map((offset) => ({
    id: randomUUID(),
    created_at: iso(),
    updated_at: iso(),
    version: 1,
    subject: Subject.MATH,
    grade: Grade.G8,
    title: ["一次函数定义", "斜率理解", "图像平移"][offset]!,
    description: "面向初二数学的一次函数单元知识节点。",
    parent_node_ids: [],
    prerequisite_node_ids: [],
    related_node_ids: [],
    mastery_criteria: "学生能解释概念并完成至少一道对应问题。",
    difficulty: (offset + 1) as 1 | 2 | 3,
    estimated_learning_minutes: 40,
    common_misconceptions: [
      {
        description: "把图像平移理解成系数变化。",
        example: "将 h 的变化误读成斜率变化。",
        correction_strategy: "先回到图像，再映射到表达式。"
      }
    ],
    standard_alignments: [
      {
        standard_system: "义务教育课程标准2022",
        standard_code: `MATH-G8-${offset + 1}`,
        description: "函数概念与图像理解。"
      }
    ],
    unit_ids: [primaryUnitId]
  }));

  const learningPathId = randomUUID();
  const assessmentId = randomUUID();
  const scenarioId = randomUUID();
  const dialogueScriptId = randomUUID();

  const unit: Unit = {
    id: primaryUnitId,
    created_at: iso(),
    updated_at: iso(),
    version: 1,
    subject: Subject.MATH,
    grade: Grade.G8,
    title: "一次函数导入",
    description: "围绕一次函数的概念、图像和平移设计的 AI 原生单元。",
    duration_hours: 6,
    standard_alignments: [
      {
        standard_system: "义务教育课程标准2022",
        standard_code: "MATH-G8-UNIT-1",
        description: "理解一次函数概念与图像。"
      }
    ],
    prerequisite_unit_ids: [],
    prerequisite_node_ids: [],
    knowledge_node_ids: knowledgeNodes.map((node) => node.id),
    learning_path_id: learningPathId,
    scenario_ids: [scenarioId],
    assessment_ids: [assessmentId],
    production_metadata: {
      curriculum_agent_version: "curriculum@1.0.0",
      pedagogy_agent_version: "pedagogy@1.0.0",
      narrative_agent_version: "narrative@1.0.0",
      engineering_agent_version: "engineering@1.0.0",
      qa_agent_version: "qa@1.0.0",
      iteration_count: 2,
      total_cost_tokens: 120000,
      total_cost_cny: 48.6,
      qa_pass: true,
      qa_issues: []
    },
    status: UnitStatus.APPROVED,
    published_version: "v1.0.0",
    generated_by_agents: true,
    human_reviewers: teachers.slice(0, 2).map((teacher) => teacher.id)
  };

  const learningPath: LearningPath = {
    id: learningPathId,
    created_at: iso(),
    updated_at: iso(),
    version: 1,
    unit_id: primaryUnitId,
    steps: [
      {
        step_id: randomUUID(),
        order: 1,
        target_node_ids: [knowledgeNodes[0]!.id],
        pedagogy: PedagogyType.SCENARIO_IMMERSION,
        activity_type: LearningActivityType.SCENARIO,
        estimated_duration_minutes: 30,
        scenario_id: scenarioId,
        completion_criteria: {
          type: CompletionCriteriaType.TIME_BASED,
          min_duration_minutes: 20
        }
      },
      {
        step_id: randomUUID(),
        order: 2,
        target_node_ids: [knowledgeNodes[1]!.id, knowledgeNodes[2]!.id],
        pedagogy: PedagogyType.SOCRATIC_DIALOGUE,
        activity_type: LearningActivityType.DIALOGUE,
        estimated_duration_minutes: 40,
        dialogue_script_id: dialogueScriptId,
        assessment_id: assessmentId,
        completion_criteria: {
          type: CompletionCriteriaType.MASTERY_BASED,
          threshold: 0.7
        }
      }
    ],
    is_personalized: false
  };

  const scenario: Scenario = {
    id: scenarioId,
    created_at: iso(),
    updated_at: iso(),
    version: 1,
    title: "校园坡道设计",
    description: "让学生通过设计坡道理解一次函数和图像关系。",
    setting: "学校新楼坡道改造项目",
    student_role: "负责给出坡道图像建议的学生顾问",
    goal: "用一次函数描述坡道变化趋势。",
    characters: [
      {
        character_id: randomUUID(),
        name: "周老师",
        role_in_scenario: "mentor",
        personality: "冷静、耐心、追问式引导",
        knowledge_scope: "懂函数和图像，不直接给答案。",
        prompt_template: "使用苏格拉底式追问帮助学生理解函数。"
      }
    ],
    target_node_ids: knowledgeNodes.map((node) => node.id),
    pedagogy: PedagogyType.SCENARIO_IMMERSION,
    initial_context: "你需要帮助学校判断不同坡道方案的变化趋势。",
    props: [
      {
        prop_id: randomUUID(),
        name: "坡道草图",
        description: "展示不同坡道高度和水平距离的图稿。",
        interaction_hint: "先观察图像，再尝试建立代数表达。"
      }
    ],
    branches: [
      {
        trigger_condition: "student_identifies_slope",
        outcome_description: "进入图像解释支线。"
      }
    ]
  };

  const dialogueScript: DialogueScript = {
    id: dialogueScriptId,
    created_at: iso(),
    updated_at: iso(),
    version: 1,
    title: "一次函数陪学脚本",
    mode: AgentMode.MENTOR,
    target_node_ids: knowledgeNodes.map((node) => node.id),
    nodes: [
      {
        node_id: randomUUID(),
        type: DialogueNodeType.AGENT_UTTERANCE,
        agent_template: "你先说说图像里，哪一部分表示平移？",
        agent_tone: AgentTone.CURIOUS
      }
    ],
    edges: [],
    start_node_id: randomUUID(),
    variables: [
      {
        name: "student_confidence",
        type: DialogueVariableType.NUMBER,
        initial_value: 0.4,
        description: "记录学生当前信心水平。"
      }
    ]
  };

  const assessment: Assessment = {
    id: assessmentId,
    created_at: iso(),
    updated_at: iso(),
    version: 1,
    title: "一次函数形成性评估",
    target_node_ids: knowledgeNodes.map((node) => node.id),
    type: AssessmentType.FORMATIVE,
    items: [
      {
        item_id: randomUUID(),
        question: "解释图像平移对表达式中 h 的影响。",
        type: AssessmentItemType.SHORT_ANSWER,
        target_node_id: knowledgeNodes[2]!.id,
        difficulty: 3,
        rubric: [
          {
            dimension: "概念解释",
            levels: [
              { level: 1, description: "只提到平移", points: 1 },
              { level: 2, description: "能对应到 h 的变化", points: 2 }
            ]
          }
        ],
        diagnostic_hints: [
          {
            misconception_id: randomUUID(),
            hint: "如果把 h 看成斜率，就说明仍在混淆图像位置和倾斜程度。"
          }
        ]
      }
    ],
    scoring_strategy: {
      method: ScoringMethod.HYBRID,
      mastery_threshold: 0.7,
      requires_human_review: false
    },
    min_confidence_threshold: 0.6
  };

  const primaryStudent = students[0]!;
  const primaryTeacher = teachers[0]!;
  const primaryGuardian = guardians[0]!;
  const studentPrivateVisibility = {
    visible_to_roles: [UserRole.STUDENT, UserRole.ADMIN],
    excluded_fields_by_role: {
      teacher: ["turns", "content", "detected_emotion"],
      guardian: ["turns", "content", "detected_emotion"]
    }
  };
  const academicRecordVisibility = {
    visible_to_roles: [UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN],
    visible_to_relations: [RelationType.GUARDIAN_OF_STUDENT],
    excluded_fields_by_role: {
      guardian: ["ai_generated", "evidence_count", "trigger_event_id"]
    }
  };
  const academicMemoryVisibility = {
    visible_to_roles: [UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN],
    excluded_fields_by_role: {
      teacher: ["source_conversation_id", "source_turn_range"],
      guardian: ["summary", "source_conversation_id", "source_turn_range"]
    }
  };
  const emotionBaselineVisibility = {
    visible_to_roles: [UserRole.ADMIN],
    excluded_fields_by_role: {
      teacher: ["baseline_distribution", "sample_window_start", "sample_window_end"],
      guardian: ["baseline_distribution", "sample_window_start", "sample_window_end"]
    }
  };

  const conversation: Conversation = {
    id: randomUUID(),
    created_at: iso(),
    updated_at: iso(),
    version: 1,
    student_id: primaryStudent.id,
    agent_id: randomUUID(),
    mode: AgentMode.MENTOR,
    topic: "一次函数图像平移",
    unit_id: unit.id,
    knowledge_node_ids: knowledgeNodes.map((node) => node.id),
    turns: [
      {
        turn_id: randomUUID(),
        order: 1,
        speaker: ConversationSpeaker.AGENT,
        content: "你先说说图像里哪一部分在移动。",
        model_version: "gateway/claude@3.0",
        prompt_version: "student_dialogue@1.0",
        detected_intent: "probe_understanding",
        detected_knowledge_nodes: [knowledgeNodes[2]!.id],
        created_at: iso()
      },
      {
        turn_id: randomUUID(),
        order: 2,
        speaker: ConversationSpeaker.STUDENT,
        content: "我感觉 h 变了，但不确定是不是斜率也在变。",
        detected_intent: "uncertainty",
        detected_emotion: EmotionCategory.FRUSTRATED,
        detected_knowledge_nodes: [knowledgeNodes[2]!.id],
        created_at: iso()
      }
    ],
    turn_count: 2,
    privacy_level: PrivacyLevel.STUDENT_PRIVATE,
    visibility_scope: studentPrivateVisibility,
    was_routed_to_local_model: false,
    status: ConversationStatus.ENDED,
    started_at: iso(),
    ended_at: iso(),
    accessed_by: [
      {
        user_id: primaryStudent.user_id,
        accessed_at: iso(),
        reason: "self_review"
      }
    ]
  };

  const learningEvents: LearningEvent[] = [
    {
      id: randomUUID(),
      created_at: iso(),
      updated_at: iso(),
      version: 1,
      student_id: primaryStudent.id,
      event_type: LearningEventType.CONVERSATION_TURN,
      unit_id: unit.id,
      knowledge_node_ids: [knowledgeNodes[2]!.id],
      session_id: conversation.id,
      payload: {
        conversation_id: conversation.id,
        turn_index: 2,
        agent_mode: AgentMode.MENTOR,
        duration_seconds: 120
      },
      occurred_at: iso(),
      privacy_level: PrivacyLevel.STUDENT_PRIVATE,
      visibility_scope: {
        visible_to_roles: [UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN],
        excluded_fields_by_role: {
          teacher: ["payload.content"]
        }
      },
      retention_policy: RetentionPolicy.ACADEMIC_YEAR
    },
    {
      id: randomUUID(),
      created_at: iso(),
      updated_at: iso(),
      version: 1,
      student_id: primaryStudent.id,
      event_type: LearningEventType.EXERCISE_ATTEMPT,
      unit_id: unit.id,
      knowledge_node_ids: [knowledgeNodes[1]!.id],
      session_id: conversation.id,
      payload: {
        assessment_id: assessment.id,
        item_id: assessment.items[0]!.item_id,
        student_answer: "h 变化表示图像位置改变。",
        is_correct: true,
        time_spent_seconds: 95,
        hints_used: 1
      },
      occurred_at: iso(),
      privacy_level: PrivacyLevel.TEACHER_ONLY,
      visibility_scope: {
        visible_to_roles: [UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN]
      },
      retention_policy: RetentionPolicy.ACADEMIC_YEAR
    }
  ];

  const masteryRecord: MasteryRecord = {
    id: randomUUID(),
    created_at: iso(),
    updated_at: iso(),
    version: 1,
    student_id: primaryStudent.id,
    knowledge_node_id: knowledgeNodes[2]!.id,
    current_mastery: 0.76,
    current_level: MasteryLevel.PROFICIENT,
    confidence: 0.82,
    evidence_count: 5,
    last_evidence_at: iso(),
    last_activated_at: iso(),
    decay_factor: 0.12,
    next_review_recommended_at: iso(7),
    is_visible_to_student: true,
    is_acceptable_to_record: true,
    visibility_scope: academicRecordVisibility,
    ai_generated: {
      value: 0.76,
      confidence: 0.82,
      model_version: "gateway/claude@3.0",
      prompt_version: "mastery_assessment@1.0",
      generated_at: iso(),
      human_reviewed: false
    }
  };

  const masteryHistory: MasteryHistory = {
    id: randomUUID(),
    created_at: iso(),
    updated_at: iso(),
    version: 1,
    student_id: primaryStudent.id,
    knowledge_node_id: knowledgeNodes[2]!.id,
    snapshot_at: iso(),
    mastery_value: 0.76,
    trigger_event_id: learningEvents[0]!.id,
    change_reason: "完成一次函数图像平移反思对话后提升。",
    visibility_scope: academicRecordVisibility
  };

  const emotionBaseline: EmotionBaseline = {
    id: randomUUID(),
    created_at: iso(-14),
    updated_at: iso(),
    version: 1,
    student_id: primaryStudent.id,
    baseline_distribution: {
      [EmotionCategory.NEUTRAL]: 0.6,
      [EmotionCategory.POSITIVE]: 0.15,
      [EmotionCategory.FRUSTRATED]: 0.1,
      [EmotionCategory.ANXIOUS]: 0.05,
      [EmotionCategory.SAD]: 0.04,
      [EmotionCategory.ANGRY]: 0.03,
      [EmotionCategory.CRITICAL]: 0.03
    },
    sample_window_start: iso(-30),
    sample_window_end: iso(),
    sample_count: 64,
    deviation_threshold: 0.2,
    storage_location: PrivacyLevel.CAMPUS_LOCAL_ONLY,
    visibility_scope: emotionBaselineVisibility,
    last_updated_at: iso()
  };

  const episodicMemory: EpisodicMemoryEntry = {
    id: randomUUID(),
    created_at: iso(),
    updated_at: iso(),
    version: 1,
    agent_id: conversation.agent_id,
    student_id: primaryStudent.id,
    summary: "学生在图像平移与一次函数表达式映射上还有混淆，但能接受追问。",
    topic: "一次函数图像平移",
    related_node_ids: [knowledgeNodes[2]!.id],
    embedding_id: randomUUID(),
    privacy_bucket: MemoryPrivacyBucket.ACADEMIC,
    source_conversation_id: conversation.id,
    source_turn_range: { start: 1, end: 2 },
    importance_score: 0.72,
    visibility_scope: academicMemoryVisibility,
    retention_until: iso(180),
    deleted_by_student: false
  };

  const memorySnapshot: StudentMemorySnapshot = {
    id: randomUUID(),
    created_at: iso(),
    updated_at: iso(),
    version: 1,
    student_id: primaryStudent.id,
    agent_id: conversation.agent_id,
    knowledge_profile: {
      mastered_node_count: 8,
      developing_node_count: 3,
      struggling_node_ids: [knowledgeNodes[2]!.id],
      strong_subject_tags: ["二次函数"],
      weak_subject_tags: ["图像平移"]
    },
    learning_style_profile: {
      preferred_pedagogies: [PedagogyType.SOCRATIC_DIALOGUE, PedagogyType.SCENARIO_IMMERSION],
      typical_focus_duration_minutes: 18,
      peak_active_hours: [19, 20],
      preferred_difficulty_progression: DifficultyProgression.GRADUAL
    },
    interest_profile: {
      frequently_asked_topics: ["函数图像", "物理中的速度图像"],
      voluntary_deep_dives: ["函数与现实场景"],
      low_engagement_areas: ["机械刷题"]
    },
    emotion_baseline: emotionBaseline,
    snapshot_version: 1,
    change_summary: "图像类知识节点表现稳定上升。",
    is_viewable_by_student: true,
    visibility_scope: academicMemoryVisibility
  };

  const agentProfiles: AgentProfile[] = [
    {
      id: conversation.agent_id,
      created_at: iso(),
      updated_at: iso(),
      version: 1,
      agent_type: AgentType.STUDENT_AGENT,
      owner_id: primaryStudent.id,
      persona_version: "student_agent@1.0",
      display_name: "学伴 Nova",
      enabled_modes: [AgentMode.MENTOR, AgentMode.TUTOR, AgentMode.COMPANION],
      memory_enabled: true,
      memory_retention_days: 180,
      privacy_settings: {
        allow_emotion_detection: true,
        allow_cloud_processing: true,
        allow_sharing_with_teacher: true,
        allow_sharing_with_guardian: false
      }
    },
    {
      id: randomUUID(),
      created_at: iso(),
      updated_at: iso(),
      version: 1,
      agent_type: AgentType.TEACHER_AGENT,
      owner_id: primaryTeacher.id,
      persona_version: "teacher_agent@1.0",
      enabled_modes: [AgentMode.MENTOR],
      memory_enabled: false,
      memory_retention_days: 30,
      privacy_settings: {
        allow_emotion_detection: false,
        allow_cloud_processing: true,
        allow_sharing_with_teacher: false,
        allow_sharing_with_guardian: false
      }
    },
    {
      id: randomUUID(),
      created_at: iso(),
      updated_at: iso(),
      version: 1,
      agent_type: AgentType.GUARDIAN_AGENT,
      owner_id: primaryGuardian.id,
      persona_version: "guardian_agent@1.0",
      enabled_modes: [AgentMode.COMPANION],
      memory_enabled: false,
      memory_retention_days: 30,
      privacy_settings: {
        allow_emotion_detection: false,
        allow_cloud_processing: true,
        allow_sharing_with_teacher: false,
        allow_sharing_with_guardian: false
      }
    }
  ];

  const workingMemory: WorkingMemory = {
    agent_id: conversation.agent_id,
    conversation_id: conversation.id,
    recent_turns: conversation.turns,
    context_window_size: 20,
    updated_at: iso()
  };

  const consentRecords: ConsentRecord[] = [
    {
      id: randomUUID(),
      created_at: iso(),
      updated_at: iso(),
      version: 1,
      subject_user_id: primaryStudent.user_id,
      consenter_user_id: primaryGuardian.user_id,
      consent_type: ConsentType.AI_SERVICE_USAGE,
      policy_version: "2026.04",
      policy_text_hash: "hash-policy-ai-service-202604",
      status: ConsentStatus.GRANTED,
      granted_at: iso(),
      scope: {
        data_categories: ["learning_events", "mastery_records"],
        purposes: ["student_agent", "teacher_daily_report"],
        retention_period_days: 180,
        third_parties_allowed: []
      },
      signature_method: SignatureMethod.CLICK_THROUGH,
      ip_address: "10.0.0.12",
      device_fingerprint: "device-fp-guardian-001"
    }
  ];

  const auditLog: AuditLogEntry = {
    id: randomUUID(),
    timestamp: iso(),
    actor_user_id: adminUserId,
    actor_role: UserRole.ADMIN,
    actor_ip: "10.0.0.2",
    action: "view_student_data",
    resource_type: "student_memory_snapshot",
    resource_id: memorySnapshot.id,
    outcome: AuditOutcome.SUCCESS,
    current_entry_hash: "hash_entry_001"
  };

  const appealTicket: AppealTicket = {
    id: randomUUID(),
    created_at: iso(),
    updated_at: iso(),
    version: 1,
    submitter_user_id: primaryGuardian.user_id,
    submitter_role: UserRole.GUARDIAN,
    appeal_type: AppealType.AI_SCORE_DISPUTE,
    target_resource_type: "mastery_record",
    target_resource_id: masteryRecord.id,
    title: "希望复核图像平移掌握度",
    description: "家长认为学生已能解释图像平移，希望复核 AI 评分依据。",
    evidence_refs: [learningEvents[0]!.id, conversation.id],
    state: AppealState.UNDER_REVIEW,
    state_history: [
      {
        from_state: AppealState.SUBMITTED,
        to_state: AppealState.UNDER_REVIEW,
        transitioned_at: iso(),
        transitioned_by_user_id: adminUserId,
        reason: "已由校内管理员受理。"
      }
    ],
    assigned_to_user_id: adminUserId,
    resolution: {
      outcome: AppealResolutionOutcome.PARTIALLY_UPHELD,
      remedy: "允许教师补充一轮人工评价。",
      affected_records_updated: [masteryRecord.id],
      reviewer_notes: "AI 证据充足，但仍允许老师补充判断。"
    },
    submitted_at: iso(),
    sla_deadline: iso(7)
  };

  const confidenceScore: ConfidenceScore = {
    composite_confidence: 0.82,
    dimensions: {
      data_sufficiency: 0.8,
      signal_consistency: 0.85,
      model_certainty: 0.83,
      temporal_stability: 0.8
    },
    visibility_threshold: 0.6,
    recording_threshold: 0.7,
    intervention_threshold: 0.75,
    evidence_count: 5,
    calculation_method: "hybrid_mastery_v1",
    calculated_at: iso()
  };

  const accessScopes: AccessScope[] = [
    {
      role: UserRole.TEACHER,
      resource_type: "student_memory_snapshot",
      allowed_actions: [AccessAction.READ],
      allowed_fields: ["knowledge_profile", "learning_style_profile"],
      excluded_fields: ["emotion_baseline"],
      scope_constraints: {
        bound_students_only: true,
        own_class_only: true
      }
    }
  ];

  const interAgentSignal: InterAgentSignal = {
    id: randomUUID(),
    created_at: iso(),
    updated_at: iso(),
    version: 1,
    source_agent_id: conversation.agent_id,
    source_agent_type: "student_agent",
    source_student_id: primaryStudent.id,
    target_agent_type: TargetAgentType.TEACHER_AGENT,
    target_agent_id: agentProfiles[1]!.id,
    signal_type: InterAgentSignalType.MASTERY_UPDATE,
    payload: {
      student_id: primaryStudent.id,
      knowledge_node_id: knowledgeNodes[2]!.id,
      previous_mastery: 0.62,
      current_mastery: 0.76,
      confidence: 0.82,
      evidence_count: 5,
      trend: TrendDirection.IMPROVING
    },
    privacy_filter_passed: true,
    privacy_filter_version: "privacy_filter@1.0",
    urgency: SignalUrgency.MEDIUM,
    delivered_at: iso(),
    acknowledged_at: iso(),
    audit_log_id: auditLog.id
  };

  const privacyFilterRule: PrivacyFilterRule = {
    id: randomUUID(),
    created_at: iso(),
    updated_at: iso(),
    version: 1,
    rule_name: "block_raw_conversation_content",
    rule_version: "1.0.0",
    applies_to_signal_types: [
      InterAgentSignalType.MASTERY_UPDATE,
      InterAgentSignalType.ENGAGEMENT_CHANGE,
      InterAgentSignalType.EMOTION_ANOMALY
    ],
    forbidden_fields: [
      "content",
      "conversation_text",
      "student_response",
      "rationale_summary",
      "suggested_actions",
      "description"
    ],
    forbidden_patterns: ["原话", "全文", "逐字"],
    required_fields: ["student_id"],
    hash_fields: ["student_id"],
    redact_fields: [],
    on_violation: ViolationAction.BLOCK,
    is_active: true
  };

  return {
    school,
    classes,
    users: [adminUser, ...teacherUsers, ...studentUsers, ...guardianUsers],
    students,
    teachers,
    guardians,
    admins: [admin],
    teacher_student_bindings: teacherStudentBindings,
    guardian_student_bindings: guardianBindings,
    units: [unit],
    knowledge_nodes: knowledgeNodes,
    learning_paths: [learningPath],
    scenarios: [scenario],
    dialogue_scripts: [dialogueScript],
    assessments: [assessment],
    learning_events: learningEvents,
    mastery_records: [masteryRecord],
    mastery_history: [masteryHistory],
    conversations: [conversation],
    agent_profiles: agentProfiles,
    working_memories: [workingMemory],
    episodic_memories: [episodicMemory],
    student_memory_snapshots: [memorySnapshot],
    emotion_baselines: [emotionBaseline],
    consent_records: consentRecords,
    audit_logs: [auditLog],
    appeal_tickets: [appealTicket],
    confidence_scores: [confidenceScore],
    access_scopes: accessScopes,
    inter_agent_signals: [interAgentSignal],
    privacy_filter_rules: [privacyFilterRule]
  };
}
