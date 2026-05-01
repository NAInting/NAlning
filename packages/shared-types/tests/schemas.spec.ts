import { describe, expect, it } from "vitest";

import {
  AccessScopeSchema,
  AdminSchema,
  AgentModeSchema,
  AgentProfileSchema,
  AppealTicketSchema,
  AssessmentSchema,
  AuditLogEntrySchema,
  ClassSchema,
  ConfidenceScoreSchema,
  ConsentRecordSchema,
  ConversationSchema,
  DialogueScriptSchema,
  EmotionBaselineSchema,
  EpisodicMemoryEntrySchema,
  GuardianSchema,
  GuardianStudentBindingSchema,
  InterAgentSignalSchema,
  KnowledgeNodeSchema,
  LearningEventSchema,
  LearningPathSchema,
  MasteryHistorySchema,
  MasteryRecordSchema,
  PrivacyFilterRuleSchema,
  ScenarioSchema,
  SchoolSchema,
  StudentMemorySnapshotSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
  TeacherStudentBindingSchema,
  UnitSchema,
  UserSchema,
  WorkingMemorySchema
} from "../src";
import { buildSeedDataset } from "../src/testing/seed-generator";

const dataset = buildSeedDataset();

const schemaCases = [
  { name: "UserSchema", schema: UserSchema, valid: dataset.users[0], invalid: [{ ...dataset.users[0], id: "bad-id" }, { ...dataset.users[0], created_at: "bad-date" }] },
  { name: "StudentSchema", schema: StudentSchema, valid: dataset.students[0], invalid: [{ ...dataset.students[0], user_id: "bad-id" }, { ...dataset.students[0], visibility_scope: { visible_to_roles: [] } }] },
  { name: "TeacherSchema", schema: TeacherSchema, valid: dataset.teachers[0], invalid: [{ ...dataset.teachers[0], permission_level: "broken" }, { ...dataset.teachers[0], classes_taught: [] }] },
  { name: "GuardianSchema", schema: GuardianSchema, valid: dataset.guardians[0], invalid: [{ ...dataset.guardians[0], notification_preferences: { ...dataset.guardians[0]!.notification_preferences, preferred_channel: "fax" } }, { ...dataset.guardians[0], user_id: "oops" }] },
  { name: "AdminSchema", schema: AdminSchema, valid: dataset.admins[0], invalid: [{ ...dataset.admins[0], admin_scope: "school", school_id: undefined }, { ...dataset.admins[0], permissions: [] }] },
  { name: "SchoolSchema", schema: SchoolSchema, valid: dataset.school, invalid: [{ ...dataset.school, contact_email: "bad" }, { ...dataset.school, grade_range: { start: "g1", end: "broken" } }] },
  { name: "ClassSchema", schema: ClassSchema, valid: dataset.classes[0], invalid: [{ ...dataset.classes[0], homeroom_teacher_id: "broken" }, { ...dataset.classes[0], grade: "bad" }] },
  { name: "TeacherStudentBindingSchema", schema: TeacherStudentBindingSchema, valid: dataset.teacher_student_bindings[0], invalid: [{ ...dataset.teacher_student_bindings[0], class_id: "bad" }, { ...dataset.teacher_student_bindings[0], active_from: "bad" }] },
  { name: "GuardianStudentBindingSchema", schema: GuardianStudentBindingSchema, valid: dataset.guardian_student_bindings[0], invalid: [{ ...dataset.guardian_student_bindings[0], relationship: "aunt" }, { ...dataset.guardian_student_bindings[0], verification_status: "x" }] },
  { name: "UnitSchema", schema: UnitSchema, valid: dataset.units[0], invalid: [{ ...dataset.units[0], status: "broken" }, { ...dataset.units[0], knowledge_node_ids: [] }] },
  { name: "KnowledgeNodeSchema", schema: KnowledgeNodeSchema, valid: dataset.knowledge_nodes[0], invalid: [{ ...dataset.knowledge_nodes[0], difficulty: 7 }, { ...dataset.knowledge_nodes[0], mastery_criteria: "" }] },
  { name: "LearningPathSchema", schema: LearningPathSchema, valid: dataset.learning_paths[0], invalid: [{ ...dataset.learning_paths[0], unit_id: "bad" }, { ...dataset.learning_paths[0], steps: [] }] },
  { name: "ScenarioSchema", schema: ScenarioSchema, valid: dataset.scenarios[0], invalid: [{ ...dataset.scenarios[0], pedagogy: "bad" }, { ...dataset.scenarios[0], characters: [] }] },
  { name: "DialogueScriptSchema", schema: DialogueScriptSchema, valid: dataset.dialogue_scripts[0], invalid: [{ ...dataset.dialogue_scripts[0], mode: "bad" }, { ...dataset.dialogue_scripts[0], title: "" }] },
  { name: "AssessmentSchema", schema: AssessmentSchema, valid: dataset.assessments[0], invalid: [{ ...dataset.assessments[0], min_confidence_threshold: 1.2 }, { ...dataset.assessments[0], items: [] }] },
  { name: "ConversationSchema", schema: ConversationSchema, valid: dataset.conversations[0], invalid: [{ ...dataset.conversations[0], status: "bad" }, { ...dataset.conversations[0], turns: [{ ...dataset.conversations[0]!.turns[0], turn_id: "oops" }] }] },
  { name: "LearningEventSchema", schema: LearningEventSchema, valid: dataset.learning_events[0], invalid: [{ ...dataset.learning_events[0], retention_policy: "forever" }, { ...dataset.learning_events[0], session_id: "oops" }] },
  { name: "MasteryRecordSchema", schema: MasteryRecordSchema, valid: dataset.mastery_records[0], invalid: [{ ...dataset.mastery_records[0], current_mastery: 1.5 }, { ...dataset.mastery_records[0], ai_generated: { ...dataset.mastery_records[0]!.ai_generated, confidence: 1.4 } }] },
  { name: "MasteryHistorySchema", schema: MasteryHistorySchema, valid: dataset.mastery_history[0], invalid: [{ ...dataset.mastery_history[0], mastery_value: -1 }, { ...dataset.mastery_history[0], trigger_event_id: "oops" }] },
  { name: "AgentProfileSchema", schema: AgentProfileSchema, valid: dataset.agent_profiles[0], invalid: [{ ...dataset.agent_profiles[0], enabled_modes: [] }, { ...dataset.agent_profiles[0], memory_retention_days: -1 }] },
  { name: "WorkingMemorySchema", schema: WorkingMemorySchema, valid: dataset.working_memories[0], invalid: [{ ...dataset.working_memories[0], context_window_size: 0 }, { ...dataset.working_memories[0], updated_at: "oops" }] },
  { name: "EpisodicMemoryEntrySchema", schema: EpisodicMemoryEntrySchema, valid: dataset.episodic_memories[0], invalid: [{ ...dataset.episodic_memories[0], privacy_bucket: "shared" }, { ...dataset.episodic_memories[0], importance_score: 2 }] },
  { name: "StudentMemorySnapshotSchema", schema: StudentMemorySnapshotSchema, valid: dataset.student_memory_snapshots[0], invalid: [{ ...dataset.student_memory_snapshots[0], snapshot_version: 0 }, { ...dataset.student_memory_snapshots[0], emotion_baseline: { ...dataset.student_memory_snapshots[0]!.emotion_baseline, storage_location: "public" } }] },
  { name: "EmotionBaselineSchema", schema: EmotionBaselineSchema, valid: dataset.emotion_baselines[0], invalid: [{ ...dataset.emotion_baselines[0], storage_location: "public" }, { ...dataset.emotion_baselines[0], deviation_threshold: 2 }] },
  { name: "ConsentRecordSchema", schema: ConsentRecordSchema, valid: dataset.consent_records[0], invalid: [{ ...dataset.consent_records[0], status: "approved" }, { ...dataset.consent_records[0], policy_text_hash: "" }] },
  { name: "AuditLogEntrySchema", schema: AuditLogEntrySchema, valid: dataset.audit_logs[0], invalid: [{ ...dataset.audit_logs[0], outcome: "bad" }, { ...dataset.audit_logs[0], actor_user_id: "oops" }] },
  { name: "AppealTicketSchema", schema: AppealTicketSchema, valid: dataset.appeal_tickets[0], invalid: [{ ...dataset.appeal_tickets[0], state: "done" }, { ...dataset.appeal_tickets[0], state_history: [] }] },
  { name: "ConfidenceScoreSchema", schema: ConfidenceScoreSchema, valid: dataset.confidence_scores[0], invalid: [{ ...dataset.confidence_scores[0], composite_confidence: 2 }, { ...dataset.confidence_scores[0], dimensions: { ...dataset.confidence_scores[0]!.dimensions, data_sufficiency: -1 } }] },
  { name: "AccessScopeSchema", schema: AccessScopeSchema, valid: dataset.access_scopes[0], invalid: [{ ...dataset.access_scopes[0], allowed_actions: [] }, { ...dataset.access_scopes[0], role: "owner" }] },
  { name: "InterAgentSignalSchema", schema: InterAgentSignalSchema, valid: dataset.inter_agent_signals[0], invalid: [{ ...dataset.inter_agent_signals[0], payload: { ...(dataset.inter_agent_signals[0]!.payload as object), content: "原始对话" } }, { ...dataset.inter_agent_signals[0], urgency: "urgent" }] },
  { name: "PrivacyFilterRuleSchema", schema: PrivacyFilterRuleSchema, valid: dataset.privacy_filter_rules[0], invalid: [{ ...dataset.privacy_filter_rules[0], on_violation: "ignore" }, { ...dataset.privacy_filter_rules[0], applies_to_signal_types: [] }] },
  { name: "SubjectSchema", schema: SubjectSchema, valid: "math", invalid: ["algebra", 123] },
  { name: "AgentModeSchema", schema: AgentModeSchema, valid: "mentor", invalid: ["coach", 123] }
] as const;

describe("schema self tests", () => {
  for (const testCase of schemaCases) {
    it(`${testCase.name} accepts a valid sample`, async () => {
      const schema = typeof testCase.schema === "function" ? await testCase.schema : testCase.schema;
      expect(() => schema.parse(testCase.valid)).not.toThrow();
    });

    it(`${testCase.name} rejects invalid sample #1`, async () => {
      const schema = typeof testCase.schema === "function" ? await testCase.schema : testCase.schema;
      expect(() => schema.parse(testCase.invalid[0])).toThrow();
    });

    it(`${testCase.name} rejects invalid sample #2`, async () => {
      const schema = typeof testCase.schema === "function" ? await testCase.schema : testCase.schema;
      expect(() => schema.parse(testCase.invalid[1])).toThrow();
    });
  }
});
