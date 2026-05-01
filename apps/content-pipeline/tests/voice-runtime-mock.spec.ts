import { describe, expect, it } from "vitest";

import {
  buildSyntheticVoiceTurnDraft,
  projectSyntheticVoiceTurnForTeacher,
  validateVoiceRuntimeExportRequest,
  validateVoiceRuntimeLatencyTargets,
  validateVoiceTeacherProjectionPrivacyInvariant,
  validateVoiceRuntimePrivacyInvariant
} from "../src";

const baseInput = {
  generatedAt: "2026-04-26T16:20:00.000Z",
  sessionId: "voice_session_math_g8_synthetic",
  studentToken: "stu_tok_synthetic_001",
  unitId: "math_g8_linear_function_intro",
  pageId: "page_slope_first_look",
  blockId: "block_slope_direction_prompt",
  targetKnowledgeNodeIds: ["lf_slope_meaning"]
};

describe("voice runtime mock", () => {
  it("builds a synthetic academic voice turn without real provider calls", () => {
    const turn = buildSyntheticVoiceTurnDraft({
      ...baseInput,
      scenario: "normal_math_question"
    });

    expect(turn).toMatchObject({
      privacy_class: "academic",
      route_selected: "student_safe_cloud",
      stt_provider_class: "synthetic_test",
      tts_provider_class: "synthetic_test",
      transcript_handling: "ephemeral",
      runtime_flags: {
        durable_learning_event_created: true,
        fallback_used: false
      }
    });
  });

  it("simulates barge-in without choosing a production voice transport", () => {
    const turn = buildSyntheticVoiceTurnDraft({
      ...baseInput,
      scenario: "barge_in"
    });

    expect(turn.runtime_flags.barge_in_detected).toBe(true);
    expect(turn.latency.barge_in_stop_ms).toBeLessThanOrEqual(300);
  });

  it("passes latency target validation for the normal synthetic academic turn", () => {
    const turn = buildSyntheticVoiceTurnDraft({
      ...baseInput,
      scenario: "normal_math_question"
    });

    const result = validateVoiceRuntimeLatencyTargets(turn);

    expect(result).toMatchObject({
      passed: true,
      error_count: 0,
      warning_count: 0
    });
  });

  it("warns when synthetic voice latency exceeds spike targets without blocking the turn", () => {
    const turn = buildSyntheticVoiceTurnDraft({
      ...baseInput,
      scenario: "barge_in"
    });
    const slowTurn = {
      ...turn,
      latency: {
        ...turn.latency,
        barge_in_stop_ms: 450,
        total_turn_ms: 4200
      }
    };

    const result = validateVoiceRuntimeLatencyTargets(slowTurn);

    expect(result).toMatchObject({
      passed: true,
      error_count: 0,
      warning_count: 2
    });
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "voice_barge_in_stop_ms_target_exceeded" }),
        expect.objectContaining({ code: "voice_total_turn_ms_target_exceeded" })
      ])
    );
  });

  it("routes synthetic sensitive emotion speech to campus local handling", () => {
    const turn = buildSyntheticVoiceTurnDraft({
      ...baseInput,
      scenario: "sensitive_emotion"
    });

    expect(turn).toMatchObject({
      privacy_class: "campus_local_only",
      route_selected: "campus_local",
      stt_provider_class: "campus_local",
      transcript_handling: "blocked"
    });
    expect(turn.runtime_flags.durable_learning_event_created).toBe(false);
  });

  it("routes synthetic family-risk speech to safe fallback when local handling is unavailable", () => {
    const turn = buildSyntheticVoiceTurnDraft({
      ...baseInput,
      scenario: "family_risk"
    });

    expect(turn).toMatchObject({
      privacy_class: "campus_local_only",
      route_selected: "safe_fallback",
      transcript_handling: "blocked",
      failure: {
        code: "campus_local_model_unavailable",
        retryable: false
      }
    });
  });

  it("projects only teacher-safe abstract signal for campus-local voice turns", () => {
    const turn = buildSyntheticVoiceTurnDraft({
      ...baseInput,
      scenario: "sensitive_emotion"
    });
    const projection = projectSyntheticVoiceTurnForTeacher(turn);

    expect(projection).toMatchObject({
      teacher_signal_type: "needs_human_workflow",
      raw_audio_available: false,
      raw_transcript_available: false
    });
    expect(projection.safe_summary).not.toMatch(/transcript|audio playback|raw/i);
  });

  it("passes teacher projection privacy invariant for synthetic campus-local abstract signals", () => {
    const turn = buildSyntheticVoiceTurnDraft({
      ...baseInput,
      scenario: "sensitive_emotion"
    });
    const projection = projectSyntheticVoiceTurnForTeacher(turn);

    const result = validateVoiceTeacherProjectionPrivacyInvariant(projection);

    expect(result).toMatchObject({
      passed: true,
      error_count: 0
    });
  });

  it("rejects teacher projection summaries that expose raw voice or transcript details", () => {
    const turn = buildSyntheticVoiceTurnDraft({
      ...baseInput,
      scenario: "normal_math_question"
    });
    const projection = projectSyntheticVoiceTurnForTeacher(turn);
    const forgedProjection = {
      ...projection,
      safe_summary: "Teacher can inspect the student's exact words from the raw transcript and audio playback."
    };

    const result = validateVoiceTeacherProjectionPrivacyInvariant(forgedProjection);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "voice_teacher_projection_raw_content_leak" }));
  });

  it("rejects human-workflow teacher projections that still evaluate oral quality", () => {
    const turn = buildSyntheticVoiceTurnDraft({
      ...baseInput,
      scenario: "sensitive_emotion"
    });
    const projection = projectSyntheticVoiceTurnForTeacher(turn);
    const forgedProjection = {
      ...projection,
      oral_explanation_quality_band: "developing"
    };

    const result = validateVoiceTeacherProjectionPrivacyInvariant(forgedProjection);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: "voice_human_workflow_projection_cannot_evaluate_oral_quality" })
    );
  });

  it("refuses teacher projection when a voice turn disables teacher projection", () => {
    const turn = buildSyntheticVoiceTurnDraft({
      ...baseInput,
      scenario: "normal_math_question"
    });
    const forgedTurn = {
      ...turn,
      runtime_flags: {
        ...turn.runtime_flags,
        teacher_projection_allowed: false
      }
    };

    expect(() => projectSyntheticVoiceTurnForTeacher(forgedTurn)).toThrow(
      "Teacher projection is not allowed for this voice turn."
    );
  });

  it("denies raw voice exports for student-sensitive synthetic cases", () => {
    const turn = buildSyntheticVoiceTurnDraft({
      ...baseInput,
      scenario: "raw_export_attempt"
    });

    const result = validateVoiceRuntimeExportRequest(turn, {
      view: "teacher",
      reason_code: "teacher_review_attempt",
      requested_fields: ["safe_summary", "raw_audio", "student_owned_transcript"]
    });

    expect(result.passed).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "raw_voice_export_denied" }),
        expect.objectContaining({ code: "student_owned_transcript_not_visible_to_adults" })
      ])
    );
  });

  it("denies student-owned transcript export to adults with camelCase field names", () => {
    const turn = buildSyntheticVoiceTurnDraft({
      ...baseInput,
      scenario: "normal_math_question"
    });

    const result = validateVoiceRuntimeExportRequest(turn, {
      view: "guardian",
      reason_code: "guardian_projection_attempt",
      requested_fields: ["safeSummary", "studentOwnedTranscript"]
    });

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: "student_owned_transcript_not_visible_to_adults" })
    );
  });

  it("denies guardian real-time voice projections until a guardian-safe summary contract exists", () => {
    const turn = buildSyntheticVoiceTurnDraft({
      ...baseInput,
      scenario: "normal_math_question"
    });

    const result = validateVoiceRuntimeExportRequest(turn, {
      view: "guardian",
      reason_code: "guardian_projection_attempt",
      requested_fields: ["safe_summary"]
    });

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: "guardian_realtime_voice_projection_denied" })
    );
  });

  it("denies raw voice export aliases and wildcard export fields", () => {
    const turn = buildSyntheticVoiceTurnDraft({
      ...baseInput,
      scenario: "raw_export_attempt"
    });

    const result = validateVoiceRuntimeExportRequest(turn, {
      view: "teacher",
      reason_code: "teacher_review_attempt",
      requested_fields: ["safe_summary", "Audio", "transcript", "*", "all"]
    });

    expect(result.passed).toBe(false);
    expect(result.issues.filter((issue) => issue.code === "raw_voice_export_denied")).toHaveLength(4);
  });

  it("denies raw voice export aliases with separators and spaces", () => {
    const turn = buildSyntheticVoiceTurnDraft({
      ...baseInput,
      scenario: "raw_export_attempt"
    });

    const result = validateVoiceRuntimeExportRequest(turn, {
      view: "teacher",
      reason_code: "teacher_review_attempt",
      requested_fields: ["raw-audio", "voice transcript", "full transcript", "student voice transcript"]
    });

    expect(result.passed).toBe(false);
    expect(result.issues.filter((issue) => issue.code === "raw_voice_export_denied")).toHaveLength(4);
  });

  it("denies raw voice export aliases in camelCase UI field names", () => {
    const turn = buildSyntheticVoiceTurnDraft({
      ...baseInput,
      scenario: "raw_export_attempt"
    });

    const result = validateVoiceRuntimeExportRequest(turn, {
      view: "teacher",
      reason_code: "teacher_review_attempt",
      requested_fields: ["rawAudio", "voiceTranscript", "audioPlaybackUrl", "studentVoiceTranscript"]
    });

    expect(result.passed).toBe(false);
    expect(result.issues.filter((issue) => issue.code === "raw_voice_export_denied")).toHaveLength(4);
  });

  it("denies raw voice export field names with unsafe prefixes or suffixes", () => {
    const turn = buildSyntheticVoiceTurnDraft({
      ...baseInput,
      scenario: "raw_export_attempt"
    });

    const result = validateVoiceRuntimeExportRequest(turn, {
      view: "teacher",
      reason_code: "teacher_review_attempt",
      requested_fields: ["studentRawAudio", "rawVoiceAudio", "teacherVoiceTranscriptField", "studentTranscriptText"]
    });

    expect(result.passed).toBe(false);
    expect(result.issues.filter((issue) => issue.code === "raw_voice_export_denied")).toHaveLength(4);
  });

  it("denies Chinese raw voice export field names", () => {
    const turn = buildSyntheticVoiceTurnDraft({
      ...baseInput,
      scenario: "raw_export_attempt"
    });

    const result = validateVoiceRuntimeExportRequest(turn, {
      view: "teacher",
      reason_code: "teacher_review_attempt",
      requested_fields: [
        "\u539f\u59cb\u97f3\u9891",
        "\u5b66\u751f\u8bed\u97f3\u8f6c\u5199",
        "\u9010\u5b57\u7a3f"
      ]
    });

    expect(result.passed).toBe(false);
    expect(result.issues.filter((issue) => issue.code === "raw_voice_export_denied")).toHaveLength(3);
  });

  it("requires a non-empty audit reason for voice export requests", () => {
    const turn = buildSyntheticVoiceTurnDraft({
      ...baseInput,
      scenario: "normal_math_question"
    });

    const result = validateVoiceRuntimeExportRequest(turn, {
      view: "teacher",
      reason_code: " ",
      requested_fields: ["safe_summary"]
    });

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "voice_export_reason_code_required" }));
  });

  it("denies audit reason codes that include raw transcript details", () => {
    const turn = buildSyntheticVoiceTurnDraft({
      ...baseInput,
      scenario: "normal_math_question"
    });

    const result = validateVoiceRuntimeExportRequest(turn, {
      view: "teacher",
      reason_code: "Teacher pasted the raw transcript where the student said the exact response.",
      requested_fields: ["safe_summary"]
    });

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "voice_export_reason_code_raw_content_leak" }));
  });

  it("blocks teacher export requests when teacher projection is disabled", () => {
    const turn = buildSyntheticVoiceTurnDraft({
      ...baseInput,
      scenario: "normal_math_question"
    });
    const forgedTurn = {
      ...turn,
      runtime_flags: {
        ...turn.runtime_flags,
        teacher_projection_allowed: false
      }
    };

    const result = validateVoiceRuntimeExportRequest(forgedTurn, {
      view: "teacher",
      reason_code: "teacher_signal_projection",
      requested_fields: ["safe_summary"]
    });

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "voice_teacher_projection_not_allowed" }));
  });

  it("adds an abstract warning for non-admin campus-local projections", () => {
    const turn = buildSyntheticVoiceTurnDraft({
      ...baseInput,
      scenario: "sensitive_emotion"
    });

    const result = validateVoiceRuntimeExportRequest(turn, {
      view: "teacher",
      reason_code: "teacher_signal_projection",
      requested_fields: ["safe_summary"]
    });

    expect(result).toMatchObject({
      passed: true,
      error_count: 0,
      warning_count: 1
    });
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: "campus_local_voice_projection_is_abstract_only" })
    );
  });

  it("degrades STT timeout to retry guidance and text fallback", () => {
    const turn = buildSyntheticVoiceTurnDraft({
      ...baseInput,
      scenario: "stt_timeout"
    });

    expect(turn.runtime_flags.fallback_used).toBe(true);
    expect(turn.runtime_flags.durable_learning_event_created).toBe(false);
    expect(turn.failure).toMatchObject({
      code: "stt_timeout",
      retryable: true
    });
  });

  it("does not create durable learning evidence when mic permission is denied", () => {
    const turn = buildSyntheticVoiceTurnDraft({
      ...baseInput,
      scenario: "mic_denied"
    });

    expect(turn.runtime_flags.fallback_used).toBe(true);
    expect(turn.runtime_flags.durable_learning_event_created).toBe(false);
    expect(turn.failure).toMatchObject({
      code: "mic_permission_denied",
      retryable: true
    });
  });

  it("keeps campus-local failure fallback from downgrading into cloud voice handling", () => {
    const turn = buildSyntheticVoiceTurnDraft({
      ...baseInput,
      scenario: "family_risk"
    });

    const result = validateVoiceRuntimePrivacyInvariant(turn);

    expect(result).toMatchObject({
      passed: true,
      error_count: 0
    });
  });

  it("rejects failed voice turns that do not explicitly mark fallback usage", () => {
    const turn = buildSyntheticVoiceTurnDraft({
      ...baseInput,
      scenario: "tts_timeout"
    });
    const forgedTurn = {
      ...turn,
      runtime_flags: {
        ...turn.runtime_flags,
        fallback_used: false
      }
    };

    const result = validateVoiceRuntimePrivacyInvariant(forgedTurn);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "voice_failure_without_fallback" }));
  });

  it("adds an explicit invariant issue when student-sensitive voice routes to approved cloud", () => {
    const turn = buildSyntheticVoiceTurnDraft({
      ...baseInput,
      scenario: "raw_export_attempt"
    });
    const forgedTurn = {
      ...turn,
      route_selected: "approved_cloud"
    };

    const result = validateVoiceRuntimePrivacyInvariant(forgedTurn);

    expect(result.passed).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "invalid_voice_turn" }),
        expect.objectContaining({ code: "student_sensitive_approved_cloud_route_denied" })
      ])
    );
  });

  it("rejects voice safe summaries that expose raw transcript or student quotes", () => {
    const turn = buildSyntheticVoiceTurnDraft({
      ...baseInput,
      scenario: "normal_math_question"
    });
    const forgedTurn = {
      ...turn,
      safe_summary: "Student said the exact response in the raw transcript; teacher can review the audio playback."
    };

    const result = validateVoiceRuntimePrivacyInvariant(forgedTurn);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "voice_safe_summary_raw_content_leak" }));
  });

  it("rejects Chinese voice safe summaries that expose raw audio or student verbatim text", () => {
    const turn = buildSyntheticVoiceTurnDraft({
      ...baseInput,
      scenario: "normal_math_question"
    });
    const forgedTurn = {
      ...turn,
      safe_summary: "教师可查看学生原话和原始音频回放。"
    };

    const result = validateVoiceRuntimePrivacyInvariant(forgedTurn);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "voice_safe_summary_raw_content_leak" }));
  });

  it("rejects UTF-8 Chinese voice safe summaries that expose raw audio or student verbatim text", () => {
    const turn = buildSyntheticVoiceTurnDraft({
      ...baseInput,
      scenario: "normal_math_question"
    });
    const forgedTurn = {
      ...turn,
      safe_summary: "教师可查看学生原话和原始音频回放。"
    };

    const result = validateVoiceRuntimePrivacyInvariant(forgedTurn);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "voice_safe_summary_raw_content_leak" }));
  });

  it("rejects actual UTF-8 Chinese voice safe summaries that expose raw audio or student verbatim text", () => {
    const turn = buildSyntheticVoiceTurnDraft({
      ...baseInput,
      scenario: "normal_math_question"
    });
    const forgedTurn = {
      ...turn,
      safe_summary:
        "\u6559\u5e08\u53ef\u67e5\u770b\u5b66\u751f\u539f\u8bdd\u548c\u539f\u59cb\u97f3\u9891\u56de\u653e\u3002"
    };

    const result = validateVoiceRuntimePrivacyInvariant(forgedTurn);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "voice_safe_summary_raw_content_leak" }));
  });

  it("rejects forged campus-local voice failures that retain transcript or route to cloud", () => {
    const turn = buildSyntheticVoiceTurnDraft({
      ...baseInput,
      scenario: "family_risk"
    });
    const forgedTurn = {
      ...turn,
      route_selected: "student_safe_cloud",
      transcript_handling: "ephemeral",
      stt_provider_class: "approved_cloud",
      runtime_flags: {
        ...turn.runtime_flags,
        durable_learning_event_created: true
      }
    };

    const result = validateVoiceRuntimePrivacyInvariant(forgedTurn);

    expect(result.passed).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "invalid_voice_turn" }),
        expect.objectContaining({ code: "voice_failure_privacy_downgrade_denied" }),
        expect.objectContaining({ code: "campus_local_transcript_retention_denied" }),
        expect.objectContaining({ code: "campus_local_cloud_voice_provider_denied" }),
        expect.objectContaining({ code: "campus_local_failure_learning_event_denied" })
      ])
    );
  });
});
