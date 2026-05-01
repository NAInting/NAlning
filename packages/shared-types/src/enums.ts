/**
 * 用户角色。
 */
export enum UserRole {
  STUDENT = "student",
  TEACHER = "teacher",
  GUARDIAN = "guardian",
  ADMIN = "admin",
  SYSTEM = "system"
}

/**
 * 用户关系类型。
 */
export enum RelationType {
  TEACHER_OF_STUDENT = "teacher_of_student",
  GUARDIAN_OF_STUDENT = "guardian_of_student",
  CLASSMATE = "classmate",
  HOMEROOM_TEACHER = "homeroom_teacher",
  SUBJECT_TEACHER = "subject_teacher"
}

/**
 * 学科枚举。
 */
export enum Subject {
  CHINESE = "chinese",
  MATH = "math",
  ENGLISH = "english",
  PHYSICS = "physics",
  CHEMISTRY = "chemistry",
  BIOLOGY = "biology",
  HISTORY = "history",
  GEOGRAPHY = "geography",
  POLITICS = "politics",
  CROSS_DISCIPLINARY = "cross_disciplinary"
}

/**
 * 年级枚举。
 */
export enum Grade {
  G1 = "g1",
  G2 = "g2",
  G3 = "g3",
  G4 = "g4",
  G5 = "g5",
  G6 = "g6",
  G7 = "g7",
  G8 = "g8",
  G9 = "g9",
  G10 = "g10",
  G11 = "g11",
  G12 = "g12"
}

/**
 * Agent 运行模式。
 */
export enum AgentMode {
  MENTOR = "mentor",
  TUTOR = "tutor",
  PEER = "peer",
  CHALLENGER = "challenger",
  COMPANION = "companion"
}

/**
 * 隐私等级。
 */
export enum PrivacyLevel {
  PUBLIC = "public",
  CLASS_INTERNAL = "class_internal",
  TEACHER_ONLY = "teacher_only",
  STUDENT_PRIVATE = "student_private",
  CAMPUS_LOCAL_ONLY = "campus_local_only"
}

/**
 * 掌握度等级。
 */
export enum MasteryLevel {
  NOT_STARTED = "not_started",
  EMERGING = "emerging",
  DEVELOPING = "developing",
  PROFICIENT = "proficient",
  MASTERED = "mastered"
}

/**
 * 学习事件类型。
 */
export enum LearningEventType {
  CONVERSATION_TURN = "conversation_turn",
  EXERCISE_ATTEMPT = "exercise_attempt",
  UNIT_STARTED = "unit_started",
  UNIT_COMPLETED = "unit_completed",
  NODE_MASTERED = "node_mastered",
  HELP_REQUESTED = "help_requested",
  INTERVENTION_RECEIVED = "intervention_received",
  SELF_REFLECTION = "self_reflection"
}

/**
 * 情绪类别。
 */
export enum EmotionCategory {
  NEUTRAL = "neutral",
  POSITIVE = "positive",
  FRUSTRATED = "frustrated",
  ANXIOUS = "anxious",
  SAD = "sad",
  ANGRY = "angry",
  CRITICAL = "critical"
}

/**
 * 申诉状态。
 */
export enum AppealState {
  SUBMITTED = "submitted",
  UNDER_REVIEW = "under_review",
  RESOLVED = "resolved",
  ESCALATED = "escalated",
  REJECTED = "rejected",
  WITHDRAWN = "withdrawn"
}

/**
 * 申诉类型。
 */
export enum AppealType {
  AI_SCORE_DISPUTE = "ai_score_dispute",
  TEACHER_DECISION = "teacher_decision",
  DATA_USAGE_DISPUTE = "data_usage_dispute",
  PRIVACY_VIOLATION = "privacy_violation",
  CONTENT_ERROR = "content_error",
  OTHER = "other"
}

/**
 * 同意书类型。
 */
export enum ConsentType {
  DATA_COLLECTION = "data_collection",
  AI_SERVICE_USAGE = "ai_service_usage",
  EMOTION_ANALYSIS = "emotion_analysis",
  THIRD_PARTY_MODEL = "third_party_model",
  PARENT_DASHBOARD = "parent_dashboard",
  RESEARCH_PARTICIPATION = "research_participation"
}

/**
 * Agent 间信号类型。
 */
export enum InterAgentSignalType {
  MASTERY_UPDATE = "mastery_update",
  ENGAGEMENT_CHANGE = "engagement_change",
  EMOTION_ANOMALY = "emotion_anomaly",
  HELP_REQUEST = "help_request",
  INTERVENTION_SUGGESTED = "intervention_suggested",
  MILESTONE_REACHED = "milestone_reached",
  RISK_ALERT = "risk_alert"
}

/**
 * 抽象干预原因代码。
 */
export enum InterventionReasonCode {
  CONCEPT_MISCONCEPTION = "concept_misconception",
  MASTERY_DECLINE = "mastery_decline",
  LOW_ENGAGEMENT = "low_engagement",
  HELP_REQUESTED = "help_requested",
  NO_AI_GAP = "no_ai_gap",
  EMOTION_ANOMALY_ABSTRACT = "emotion_anomaly_abstract"
}

/**
 * 抽象干预动作代码。
 */
export enum InterventionActionCode {
  SHORT_CHECK_IN = "short_check_in",
  TARGETED_REVIEW = "targeted_review",
  NO_AI_REFLECTION = "no_ai_reflection",
  SMALL_GROUP_RETEACH = "small_group_reteach",
  COUNSELOR_ESCALATION = "counselor_escalation",
  ADJUST_LEARNING_PATH = "adjust_learning_path"
}

/**
 * 里程碑展示代码。
 */
export enum MilestoneDisplayCode {
  UNIT_COMPLETED_GENERIC = "unit_completed_generic",
  MASTERY_THRESHOLD_GENERIC = "mastery_threshold_generic",
  CONSECUTIVE_DAYS_GENERIC = "consecutive_days_generic"
}

/**
 * 教学法类型。
 */
export enum PedagogyType {
  SOCRATIC_DIALOGUE = "socratic_dialogue",
  SCENARIO_IMMERSION = "scenario_immersion",
  PROBLEM_BASED = "problem_based",
  PROJECT_BASED = "project_based",
  PEER_TEACHING = "peer_teaching",
  DEBATE = "debate",
  METACOGNITIVE_REFLECTION = "metacognitive_reflection",
  DIRECT_INSTRUCTION = "direct_instruction",
  SPACED_REPETITION = "spaced_repetition"
}

/**
 * 认证提供方。
 */
export enum AuthProvider {
  PASSWORD = "password",
  SSO = "sso",
  WECHAT = "wechat"
}

/**
 * 账户状态。
 */
export enum UserStatus {
  ACTIVE = "active",
  SUSPENDED = "suspended",
  PENDING_VERIFICATION = "pending_verification",
  ARCHIVED = "archived"
}

/**
 * 教师权限级别。
 */
export enum TeacherPermissionLevel {
  BASIC = "basic",
  SENIOR = "senior",
  PRINCIPAL = "principal"
}

/**
 * 家长偏好风格。
 */
export enum ParentingStyleHint {
  AUTHORITATIVE = "authoritative",
  PERMISSIVE = "permissive",
  BALANCED = "balanced"
}

/**
 * 通知渠道。
 */
export enum NotificationChannel {
  APP = "app",
  WECHAT = "wechat",
  SMS = "sms",
  EMAIL = "email"
}

/**
 * 管理员作用域。
 */
export enum AdminScope {
  SCHOOL = "school",
  DISTRICT = "district",
  PLATFORM = "platform"
}

/**
 * 管理员权限。
 */
export enum AdminPermission {
  VIEW_AUDIT_LOGS = "view_audit_logs",
  HANDLE_APPEALS = "handle_appeals",
  MANAGE_USERS = "manage_users",
  MANAGE_CONSENT = "manage_consent",
  EXPORT_DATA = "export_data",
  CONFIGURE_PRIVACY = "configure_privacy"
}

/**
 * 学校类型。
 */
export enum SchoolType {
  PUBLIC = "public",
  PRIVATE = "private",
  INTERNATIONAL = "international"
}

/**
 * 数据驻留位置。
 */
export enum DataResidency {
  CN_MAINLAND = "cn_mainland",
  OTHER = "other"
}

/**
 * 监护关系类型。
 */
export enum GuardianRelationship {
  FATHER = "father",
  MOTHER = "mother",
  GRANDPARENT = "grandparent",
  LEGAL_GUARDIAN = "legal_guardian",
  OTHER = "other"
}

/**
 * 关系验证状态。
 */
export enum VerificationStatus {
  PENDING = "pending",
  VERIFIED = "verified",
  REJECTED = "rejected"
}

/**
 * 关系验证方式。
 */
export enum VerificationMethod {
  SCHOOL_CONFIRMATION = "school_confirmation",
  DOCUMENT_UPLOAD = "document_upload"
}

/**
 * 单元发布状态。
 */
export enum UnitStatus {
  DRAFT = "draft",
  IN_REVIEW = "in_review",
  APPROVED = "approved",
  PUBLISHED = "published",
  ARCHIVED = "archived"
}

/**
 * 对话节点类型。
 */
export enum DialogueNodeType {
  AGENT_UTTERANCE = "agent_utterance",
  STUDENT_RESPONSE_EXPECTED = "student_response_expected",
  BRANCH = "branch",
  ASSESSMENT_CHECKPOINT = "assessment_checkpoint"
}

/**
 * Agent 说话语气。
 */
export enum AgentTone {
  ENCOURAGING = "encouraging",
  NEUTRAL = "neutral",
  CHALLENGING = "challenging",
  CURIOUS = "curious"
}

/**
 * 对话变量类型。
 */
export enum DialogueVariableType {
  NUMBER = "number",
  STRING = "string",
  BOOLEAN = "boolean",
  LIST = "list"
}

/**
 * 评估类型。
 */
export enum AssessmentType {
  FORMATIVE = "formative",
  SUMMATIVE = "summative",
  SELF_REFLECTION = "self_reflection",
  PEER_REVIEW = "peer_review"
}

/**
 * 题目类型。
 */
export enum AssessmentItemType {
  MULTIPLE_CHOICE = "multiple_choice",
  SHORT_ANSWER = "short_answer",
  ESSAY = "essay",
  CONSTRUCTION = "construction",
  DIALOGUE_PERFORMANCE = "dialogue_performance"
}

/**
 * 评分方法。
 */
export enum ScoringMethod {
  RULE_BASED = "rule_based",
  AI_RUBRIC = "ai_rubric",
  HYBRID = "hybrid",
  TEACHER_MANUAL = "teacher_manual"
}

/**
 * 学习路径活动类型。
 */
export enum LearningActivityType {
  DIALOGUE = "dialogue",
  EXERCISE = "exercise",
  SCENARIO = "scenario",
  PROJECT = "project",
  REFLECTION = "reflection"
}

/**
 * 完成标准类型。
 */
export enum CompletionCriteriaType {
  TIME_BASED = "time_based",
  MASTERY_BASED = "mastery_based",
  SUBMISSION_BASED = "submission_based",
  REFLECTION_BASED = "reflection_based"
}

/**
 * 事件保留策略。
 */
export enum RetentionPolicy {
  PERMANENT = "permanent",
  ACADEMIC_YEAR = "academic_year",
  SEVEN_DAYS = "7_days",
  TWENTY_FOUR_HOURS = "24_hours"
}

/**
 * 求助处理结果。
 */
export enum HelpResolution {
  RESOLVED = "resolved",
  ESCALATED_TO_TEACHER = "escalated_to_teacher",
  PENDING = "pending"
}

/**
 * 干预来源。
 */
export enum InterventionSource {
  TEACHER = "teacher",
  SYSTEM = "system"
}

/**
 * 会话说话人。
 */
export enum ConversationSpeaker {
  STUDENT = "student",
  AGENT = "agent"
}

/**
 * 会话状态。
 */
export enum ConversationStatus {
  ACTIVE = "active",
  PAUSED = "paused",
  ENDED = "ended",
  ARCHIVED = "archived"
}

/**
 * Agent 类型。
 */
export enum AgentType {
  STUDENT_AGENT = "student_agent",
  TEACHER_AGENT = "teacher_agent",
  GUARDIAN_AGENT = "guardian_agent",
  CONTENT_PIPELINE_AGENT = "content_pipeline_agent"
}

/**
 * 情节记忆隐私桶。
 */
export enum MemoryPrivacyBucket {
  ACADEMIC = "academic",
  EMOTIONAL = "emotional",
  PERSONAL = "personal"
}

/**
 * 学习难度推进偏好。
 */
export enum DifficultyProgression {
  GRADUAL = "gradual",
  CHALLENGING = "challenging",
  MIXED = "mixed"
}

/**
 * 同意书状态。
 */
export enum ConsentStatus {
  GRANTED = "granted",
  REVOKED = "revoked",
  EXPIRED = "expired",
  PENDING = "pending"
}

/**
 * 签名方式。
 */
export enum SignatureMethod {
  CLICK_THROUGH = "click_through",
  WET_SIGNATURE = "wet_signature",
  DIGITAL_SIGNATURE = "digital_signature"
}

/**
 * 审计结果。
 */
export enum AuditOutcome {
  SUCCESS = "success",
  DENIED = "denied",
  ERROR = "error"
}

/**
 * 申诉处理结果。
 */
export enum AppealResolutionOutcome {
  UPHELD = "upheld",
  PARTIALLY_UPHELD = "partially_upheld",
  REJECTED = "rejected"
}

/**
 * 访问动作。
 */
export enum AccessAction {
  READ = "read",
  WRITE = "write",
  DELETE = "delete",
  EXPORT = "export"
}

/**
 * 目标 Agent 类型。
 */
export enum TargetAgentType {
  TEACHER_AGENT = "teacher_agent",
  GUARDIAN_AGENT = "guardian_agent"
}

/**
 * 信号紧急程度。
 */
export enum SignalUrgency {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical"
}

/**
 * 趋势方向。
 */
export enum TrendDirection {
  IMPROVING = "improving",
  STABLE = "stable",
  DECLINING = "declining"
}

/**
 * 严重度枚举。
 */
export enum SeverityLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
  MILD = "mild",
  MODERATE = "moderate",
  SEVERE = "severe"
}

/**
 * 求助主题类别。
 */
export enum HelpTopicCategory {
  ACADEMIC = "academic",
  SOCIAL = "social",
  EMOTIONAL = "emotional"
}

/**
 * 建议响应人。
 */
export enum RecommendedResponder {
  SUBJECT_TEACHER = "subject_teacher",
  HOMEROOM = "homeroom",
  COUNSELOR = "counselor"
}

/**
 * 里程碑类型。
 */
export enum MilestoneType {
  UNIT_COMPLETED = "unit_completed",
  MASTERY_THRESHOLD = "mastery_threshold",
  CONSECUTIVE_DAYS = "consecutive_days"
}

/**
 * 风险类别。
 */
export enum RiskCategory {
  ACADEMIC = "academic",
  WELLBEING = "wellbeing",
  SAFETY = "safety"
}

/**
 * 隐私规则违规处理动作。
 */
export enum ViolationAction {
  BLOCK = "block",
  REDACT_AND_PASS = "redact_and_pass",
  ALERT_ADMIN = "alert_admin"
}
