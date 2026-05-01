# Voice Runtime Spike Spec

Version: 2026-04-26  
Status: Phase 1.7B draft spec  
Owner: student agent runtime / platform architecture / privacy governance  
Related docs:

- `docs/PROJECT_MASTER_PLAN_REBASE_2026-04-26.md`
- `docs/PROJECT_REBASE_EXISTING_WORK_AUDIT_2026-04-26.md`
- `docs/OPENMAIC_DEEP_DIVE_AND_INTEGRATION_PLAN_2026-04-26.md`
- `docs/UNIT_SPEC.md`
- `docs/EXTERNAL_STANDARDS_ADAPTER_SPEC.md`
- `packages/shared-types/src/learning/conversation.ts`
- `packages/shared-types/src/learning/learning-event.ts`
- `packages/shared-types/src/agent/agent-runtime-event.ts`
- `packages/llm-gateway`

---

## 1. Purpose

This spec defines the realtime voice companion spike for the student Agent.

The goal is not to add a microphone button to the current chat UI. The goal is to test whether the system can support a student speaking naturally with an AI learning companion while preserving:

1. Low enough latency to feel conversational.
2. Interruptibility / barge-in.
3. Privacy routing before model response.
4. No raw student audio persistence by default.
5. Safe projection into learning events and teacher summaries.
6. Degradation to text/no-AI tasks when voice fails.

This is a spike specification, not a production provider decision.

---

## 2. Strategic Position

OpenMAIC already shows that voice + multi-agent classroom + whiteboard can exist as a prototype. Therefore our advantage is not simply “voice input”.

Our voice advantage must be:

```text
long-term memory
  + realtime conversational voice
  + privacy router
  + student-owned transparency
  + teacher-safe signal projection
  + no-AI oral baseline
  + auditable learning events
```

Voice should make the AI companion feel alive, but it must not weaken student independence or privacy.

---

## 3. Non-Goals

This spike does not:

1. Pick LiveKit, Pipecat, WebRTC, or any vendor as production architecture.
2. Use real student voice data.
3. Store raw audio or full transcript by default.
4. Send emotional or family-risk speech to aggregator providers.
5. Let teachers or guardians replay student voice.
6. Change the core provider strategy.
7. Add a production voice service.
8. Import OpenMAIC code.
9. Introduce AGPL or unknown-license dependencies.
10. Replace text chat, no-AI tasks, or teacher-led classroom flow.

---

## 4. Spike Questions

The spike must answer:

1. Can a synthetic student voice turn complete with acceptable latency?
2. Can the student interrupt the AI while it is speaking?
3. Can the system classify privacy risk before sending content to the student Agent model?
4. Can sensitive content route to `campus_local_only` and avoid external providers?
5. Can a voice turn become a safe `ConversationTurn` / `LearningEvent` without raw audio?
6. Can teacher projection show learning signal without transcript leakage?
7. Can the UI degrade gracefully when mic/STT/TTS/provider/network fails?
8. Can cost, latency, provider, and privacy decisions be observed without logging raw content?

---

## 5. Target Spike Scope

### 5.1 Included

1. Synthetic or developer-owned audio input only.
2. One student Agent scenario: math G8 linear function concept.
3. One normal academic utterance.
4. One sensitive utterance that must route to `campus_local_only`.
5. One interruption / barge-in case.
6. One STT failure case.
7. One TTS failure case.
8. Event projection into safe learning logs.

### 5.2 Excluded

1. Real school pilot.
2. Real minors.
3. Persistent voice profiles.
4. Voice biometrics.
5. Emotion diagnosis.
6. Teacher playback.
7. Guardian playback.
8. Production provider billing optimization.

---

## 6. Candidate Architecture Options

This spec intentionally compares options without choosing production architecture.

| Option | Description | Best for | Risks |
| --- | --- | --- | --- |
| A. Browser native + gateway | Browser MediaRecorder/WebAudio + STT/TTS provider calls through backend/gateway | Fastest spike, minimal infra | Harder low-latency streaming and barge-in polish |
| B. Pipecat-style pipeline | Realtime conversational pipeline with VAD/STT/LLM/TTS stages | Voice-agent prototyping | New runtime complexity, provider coupling risk |
| C. LiveKit-style room | WebRTC room, audio tracks, server agent participant | Classroom/low-latency multi-party future | More infra, production ops burden |
| D. Campus local voice service | Local STT/TTS/model for sensitive speech | Privacy-first pilot path | Model quality and hardware constraints |

Default spike recommendation:

```text
Start with Option A as a no-commit spike.
Design contracts so Option B/C/D can replace transport later.
```

This is not a final provider/architecture decision.

---

## 7. Reference Voice Flow

```text
Student microphone
  -> consent / mic permission / visible recording indicator
  -> local VAD
  -> streaming or chunked STT
  -> transcript candidate
  -> privacy classifier
  -> route decision
      -> public/academic: approved provider through LLM Gateway
      -> student_sensitive: approved student route through LLM Gateway
      -> campus_local_only: campus/local model or safe fallback
  -> student Agent response
  -> TTS
  -> playback with barge-in
  -> safe VoiceTurn projection
  -> ConversationTurn / LearningEvent
  -> teacher-safe signal only
```

---

## 8. Privacy Routing

### 8.1 Privacy Classes

| Class | Examples | Route |
| --- | --- | --- |
| `public_content` | Asking about a public curriculum concept without personal info | Approved cloud provider allowed |
| `academic` | Student explains a math idea or asks for help | Approved student route through gateway |
| `student_sensitive` | Identifiable student learning history, long-term memory, profile context | Strict approved provider only |
| `campus_local_only` | Emotional distress, family conflict, self-harm, abuse, raw private content | Campus/local only or safe fallback |

Model preference can never override privacy class.

### 8.2 Sensitive Route Rule

If an utterance is classified as `campus_local_only`, the system must:

1. Stop external provider routing.
2. Avoid sending raw transcript to cloud providers or aggregator platforms.
3. Use campus local model when available.
4. If local model is unavailable, return a safe boundary response and trigger the appropriate human workflow.
5. Record only an abstract, non-raw safety signal.
6. Never expose raw content to teacher or guardian views.

### 8.3 Audio Retention

Default:

```text
raw audio retention: none
raw transcript retention: none by default
safe learning summary retention: allowed
student-owned transcript view: optional future consented feature
teacher transcript access: denied
guardian transcript access: denied
```

Any future audio retention requires a separate consent and retention spec.

---

## 9. VoiceTurn Projection

This spike should introduce the concept of a transient `VoiceTurn` without making it a durable source model yet.

### 9.1 Transient Shape

```ts
interface VoiceTurnDraft {
  voice_turn_id: string;
  session_id: string;
  student_token: string;
  unit_id?: string;
  page_id?: string;
  block_id?: string;
  started_at: string;
  ended_at?: string;
  input_mode: "voice";
  stt_provider_class: "browser" | "approved_cloud" | "campus_local" | "synthetic_test";
  tts_provider_class: "browser" | "approved_cloud" | "campus_local" | "synthetic_test";
  privacy_class: "public_content" | "academic" | "student_sensitive" | "campus_local_only";
  route_selected: "approved_cloud" | "student_safe_cloud" | "campus_local" | "safe_fallback";
  transcript_handling: "ephemeral" | "student_owned_only" | "blocked";
  safe_summary: string;
  target_knowledge_node_ids: string[];
  latency: {
    vad_ms?: number;
    stt_first_partial_ms?: number;
    stt_final_ms?: number;
    agent_first_token_ms?: number;
    tts_first_audio_ms?: number;
    total_turn_ms?: number;
  };
  failure?: {
    code: string;
    safe_message: string;
    retryable: boolean;
  };
}
```

### 9.2 Durable Projection

The durable projection should be:

1. `ConversationTurn` if safe and student-visible.
2. `LearningEvent` if it produces learning signal.
3. `AgentRuntimeEvent` if it records agent/runtime progress, tool, blocked, or error events.
4. `InterAgentSignal` only if teacher-safe abstraction is needed.

Raw audio is not a durable projection.

---

## 10. LearningEvent Mapping

### 10.1 Normal Academic Voice Turn

| Voice signal | Durable event |
| --- | --- |
| Student explains a concept | `LearningEvent` with `conversation_turn` or future `oral_explanation` |
| Student completes no-AI oral task | future `no_ai_oral_baseline` / current safe reflection/progress event |
| Student asks for hint | `help_request` |
| Student revises explanation | `reflection` |

### 10.2 Sensitive Voice Turn

| Voice signal | Durable event |
| --- | --- |
| Emotional distress | No raw learning event; optional abstract safety workflow event |
| Family conflict | No raw export; campus-local human workflow only |
| Self-harm or abuse risk | High-risk human workflow, no teacher raw content |

If current enums are insufficient, the spike must document the gap instead of forcing unsafe payloads into existing event types.

---

## 11. Latency Targets

These are spike targets, not production SLOs.

| Metric | Target | Notes |
| --- | --- | --- |
| VAD end-of-speech detection | `< 300ms` | After student stops speaking |
| STT first partial | `< 800ms` | If streaming STT is available |
| STT final transcript | `< 1800ms` | For short utterance |
| Privacy classification | `< 150ms` | Local rule/model preferred |
| Agent first token | `< 1200ms` | Simple academic prompt |
| TTS first audio | `< 1200ms` | If streaming TTS is available |
| Barge-in stop playback | `< 300ms` | Student interruption |
| Total perceived turn | `< 3500ms` | Short academic exchange |

If Option A cannot meet targets, the spike should record which stage is the bottleneck before considering Option B/C.

---

## 12. Failure And Degradation

| Failure | Student-facing behavior | Logging/audit | Fallback |
| --- | --- | --- | --- |
| Mic permission denied | Explain how to continue by text | No raw content | Text mode |
| VAD failure | Ask student to tap-to-send or type | Runtime error event | Text mode |
| STT timeout | Safe retry prompt | Provider failure metadata only | Retry once, then text |
| Privacy classifier uncertain | Fail closed | Blocked runtime event | campus/local or safe fallback |
| External provider timeout | Safe delay message | Provider/cost/latency metadata | Bounded retry, same privacy class |
| TTS timeout | Show text response | Provider failure metadata | Text response |
| Network loss | Switch to offline/no-AI task | Runtime error event | No-AI task |
| Sensitive high-risk content | Calm boundary + human workflow | Abstract safety signal only | campus-local workflow |

Fallback never lowers privacy class.

---

## 13. Student UI Requirements

The voice UI must include:

1. Explicit mic permission request.
2. Always-visible recording/listening indicator.
3. Mute/stop button.
4. Clear route label when content stays local, e.g. `本地处理`.
5. Barge-in support when AI is speaking.
6. Text fallback.
7. No-AI task fallback.
8. Student-facing notice: what is stored, what is not stored.
9. Short post-turn learning trace, not full raw transcript by default.

The UI must not imply that teachers can listen to student voice.

---

## 14. Teacher And Guardian Projection

### 14.1 Teacher Projection

Allowed:

1. Knowledge node practiced.
2. Safe mastery signal.
3. Oral explanation quality band.
4. AI-dependence risk signal.
5. Suggested intervention level.
6. Whether a no-AI oral baseline was completed.

Denied:

1. Audio playback.
2. Raw transcript.
3. Emotional text.
4. Family/personal content.
5. Model reasoning.

### 14.2 Guardian Projection

Allowed:

1. Weekly supportive summary.
2. Stage-level learning progress.
3. Suggested family support action.

Denied:

1. Audio playback.
2. Raw transcript.
3. Emotion detail.
4. Real-time monitoring.
5. Comparison with peers.

---

## 15. Provider And Gateway Rules

1. All LLM calls must go through `packages/llm-gateway`.
2. Voice STT/TTS provider calls should use a voice gateway or backend adapter, not direct frontend API keys.
3. Frontend must never hold provider secrets.
4. Every provider call records purpose, privacy class, route, latency, and cost where applicable.
5. Aggregator-style providers are allowed only for `public_content` unless explicitly approved and de-identified.
6. `campus_local_only` cannot fall back to cloud or aggregator providers.
7. Prompt IDs and versions must be logged as metadata, not raw prompts.
8. Raw student audio/transcript must not enter generic logs.

---

## 16. Spike Test Matrix

### 16.1 Synthetic Test Cases

| Case | Input | Expected |
| --- | --- | --- |
| normal_math_question | Synthetic voice asks about slope direction | academic route, safe learning event |
| oral_explanation | Synthetic voice explains `k` in own words | oral quality safe summary |
| barge_in | Student interrupts AI mid-answer | playback stops and new turn begins |
| mic_denied | Browser denies mic | text fallback |
| stt_timeout | STT stage times out | retry once then text fallback |
| tts_timeout | TTS fails | text response shown |
| sensitive_emotion | Synthetic sensitive utterance | campus_local_only / safe fallback |
| family_risk | Synthetic family-risk phrase | blocked cloud route, human workflow signal |
| raw_export_attempt | Attempt to export transcript | fail closed |
| teacher_view | Teacher dashboard consumes projection | no raw transcript/audio |

### 16.2 Acceptance Criteria

The spike passes when:

1. At least one normal synthetic voice turn completes end-to-end.
2. At least one sensitive synthetic utterance blocks cloud routing.
3. Barge-in behavior is demonstrated or accurately simulated.
4. Voice turn produces safe learning event/projection.
5. Teacher projection contains no raw transcript/audio.
6. Failure cases degrade to text/no-AI without privacy downgrade.
7. No real student data is used.

---

## 17. Observability

The spike should collect:

1. Trace ID.
2. Session ID.
3. Stage latencies.
4. Route selected.
5. Privacy class.
6. Provider class, not necessarily provider name if sensitive.
7. Error code.
8. Retry count.
9. Whether fallback occurred.
10. Whether a durable learning event was created.

The spike must not log:

1. Raw audio.
2. Full transcript.
3. Raw prompt.
4. Raw model output.
5. Emotional text.
6. Family details.

---

## 18. Security And Abuse Cases

Before any real pilot, voice runtime must handle:

1. Student attempts to make AI reveal stored memory.
2. Student asks AI to tell teacher private content.
3. Student says high-risk emotional content.
4. Student shares family conflict.
5. Student tries prompt injection by voice.
6. Student asks for homework answer.
7. Student tries to impersonate teacher/guardian.
8. Teacher tries to access raw transcript.
9. Guardian tries to access real-time monitoring.
10. Provider route misconfiguration attempts to send sensitive content to cloud.

Spike phase should document expected behavior for all ten, but implementation may start with synthetic cases.

---

## 19. Future Implementation Files

Potential later files:

```text
packages/shared-types/src/voice/voice-turn.ts
packages/shared-types/src/voice/voice-route.ts
packages/shared-types/tests/voice-runtime.spec.ts
packages/llm-gateway/src/voice-routing-policy.ts
apps/frontend-user/src/features/student/voice/
apps/backend/src/routes/student-voice-session.ts
apps/backend/src/services/voice-runtime/
```

This spec does not require adding these files now.

---

## 20. Decision Gates

The following require explicit user/human approval:

1. Choosing LiveKit/Pipecat/WebRTC production architecture.
2. Calling a real STT/TTS/model provider.
3. Using real student voice.
4. Storing audio.
5. Storing full transcript.
6. Letting teachers/guardians access transcript or playback.
7. Routing `student_sensitive` or `campus_local_only` content to an aggregator.
8. Introducing an external voice SDK with unclear license.
9. Using voice biometrics or speaker identification.

---

## 21. Completion Criteria For This Spec

This spec is complete when it defines:

1. Spike questions and scope.
2. Candidate architecture options without premature commitment.
3. Reference VAD/STT/privacy-router/Agent/TTS flow.
4. Privacy routing and audio retention policy.
5. `VoiceTurnDraft` transient shape.
6. LearningEvent projection rules.
7. Latency targets.
8. Failure/degradation behavior.
9. Student UI requirements.
10. Teacher/guardian projection boundaries.
11. Provider/gateway rules.
12. Synthetic test matrix.
13. Observability requirements.
14. Decision gates.

---

## 22. Lock Recommendation

This document is safe to use as the Phase 1.7B entry spec.

The next implementation step should be a synthetic-only prototype or shared-types schema draft, not production provider integration.

