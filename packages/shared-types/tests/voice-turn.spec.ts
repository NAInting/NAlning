import { describe, expect, it } from "vitest";

import { VoiceTeacherProjectionSchema, VoiceTurnDraftSchema, type VoiceTeacherProjection, type VoiceTurnDraft } from "../src";

function buildVoiceTurn(overrides: Partial<VoiceTurnDraft> = {}): VoiceTurnDraft {
  return {
    voice_turn_id: "voice_turn_synthetic_001",
    session_id: "voice_session_synthetic_001",
    student_token: "stu_tok_synthetic_001",
    unit_id: "math_g8_linear_function_intro",
    page_id: "page_slope_first_look",
    block_id: "block_slope_direction_prompt",
    started_at: "2026-04-26T16:00:00.000Z",
    ended_at: "2026-04-26T16:00:03.200Z",
    input_mode: "voice",
    stt_provider_class: "synthetic_test",
    tts_provider_class: "synthetic_test",
    privacy_class: "academic",
    route_selected: "student_safe_cloud",
    transcript_handling: "ephemeral",
    safe_summary: "Student practiced explaining how slope affects line direction.",
    target_knowledge_node_ids: ["lf_slope_meaning"],
    latency: {
      vad_ms: 180,
      stt_final_ms: 900,
      privacy_classification_ms: 40,
      agent_first_token_ms: 700,
      tts_first_audio_ms: 650,
      total_turn_ms: 3200
    },
    runtime_flags: {
      barge_in_detected: false,
      fallback_used: false,
      durable_learning_event_created: true,
      teacher_projection_allowed: true
    },
    ...overrides
  };
}

function buildTeacherProjection(overrides: Partial<VoiceTeacherProjection> = {}): VoiceTeacherProjection {
  return {
    voice_turn_id: "voice_turn_synthetic_001",
    session_id: "voice_session_synthetic_001",
    student_token: "stu_tok_synthetic_001",
    unit_id: "math_g8_linear_function_intro",
    page_id: "page_slope_first_look",
    block_id: "block_slope_direction_prompt",
    target_knowledge_node_ids: ["lf_slope_meaning"],
    teacher_signal_type: "academic_signal",
    oral_explanation_quality_band: "developing",
    no_ai_oral_baseline_completed: false,
    safe_summary: "Student practiced an oral explanation of slope direction.",
    raw_audio_available: false,
    raw_transcript_available: false,
    ...overrides
  };
}

describe("voice turn schema", () => {
  it("accepts a synthetic academic voice turn without raw audio or transcript", () => {
    expect(VoiceTurnDraftSchema.safeParse(buildVoiceTurn()).success).toBe(true);
  });

  it("rejects campus-local voice turns that try to use cloud routing", () => {
    const result = VoiceTurnDraftSchema.safeParse(
      buildVoiceTurn({
        privacy_class: "campus_local_only",
        route_selected: "approved_cloud",
        stt_provider_class: "approved_cloud",
        transcript_handling: "ephemeral"
      })
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toEqual(
        expect.arrayContaining([
          "campus_local_only voice turns cannot route to cloud providers.",
          "campus_local_only voice turns cannot use approved_cloud STT/TTS providers.",
          "campus_local_only voice turns must block transcript retention by default."
        ])
      );
    }
  });

  it("rejects cloud routes for student-sensitive voice turns", () => {
    const result = VoiceTurnDraftSchema.safeParse(
      buildVoiceTurn({
        privacy_class: "student_sensitive",
        route_selected: "approved_cloud"
      })
    );

    expect(result.success).toBe(false);
  });

  it("rejects hidden raw transcript fields even when nested", () => {
    const result = VoiceTurnDraftSchema.safeParse({
      ...buildVoiceTurn(),
      debug: {
        raw_transcript: "student exact spoken words"
      }
    });

    expect(result.success).toBe(false);
  });

  it("accepts teacher projection only when raw audio and transcript are unavailable", () => {
    expect(VoiceTeacherProjectionSchema.safeParse(buildTeacherProjection()).success).toBe(true);
  });

  it("rejects teacher projection that exposes raw playback availability", () => {
    const result = VoiceTeacherProjectionSchema.safeParse({
      ...buildTeacherProjection(),
      raw_audio_available: true
    });

    expect(result.success).toBe(false);
  });
});
