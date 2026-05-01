# Agent Protocol

This document is the canonical entry point for agent runtime and inter-agent communication protocols.

Status: active index. Detailed runtime specs still live in dedicated phase documents until each phase is locked.

## Current source documents

- `docs/SCHEMA.md`
- `docs/AGENT_PERSONA.md`
- `docs/PHASE_1_1_AGENT_PERSONA_SPEC.md`
- `docs/PHASE_1_2_MEMORY_RUNTIME_SPEC.md`
- `packages/shared-types/src/communication/inter-agent-signal.ts`
- `学生Agent_教师Agent_四层记忆架构白皮书_2026-04-12.md`

## Locked principles

1. Student Agent raw conversations must not be sent to Teacher Agent or Guardian Agent.
2. Cross-agent communication must use structured `InterAgentSignal` payloads.
3. Emotion-related routing and baselines are campus-local only.
4. Student Agent mode design starts from `mentor` and `tutor`; `companion` is only a light support tone in Phase 1, not a psychological service.
5. Prompt implementations must bind to a `persona_version` and cite the relevant persona document.
6. Teacher-facing evidence references must be non-reversible. They may point to sanitized signal IDs, aggregate summaries, or audit records, but must not expose raw conversation IDs, turn ranges, message IDs, keyword hits, or other locators that let a teacher reconstruct student dialogue.

## Teacher-facing signal boundary

Teacher Agent may consume:

- mastery and engagement trends;
- abstract help requests;
- abstract emotion anomaly severity and suggested response code;
- intervention reason/action codes;
- non-reversible evidence references.

Teacher Agent must not consume:

- raw student-Agent conversation text;
- emotion expression text or keyword matches;
- student personal-life details;
- Student Agent hidden reasoning;
- reversible pointers to the raw conversation store.

Future phase 1 and phase 4 work should consolidate Student Agent memory runtime, Teacher Agent signal handling, privacy-filter requirements, and structured signal payload rules here.

## Memory runtime boundary

Phase 1.2 defines Student Agent memory runtime in `docs/PHASE_1_2_MEMORY_RUNTIME_SPEC.md`.

Locked memory principles:

1. Working Memory is session context only and must not become a long-term label.
2. Episodic Memory must be bucketed into academic / emotional / personal before storage.
3. Semantic Memory must be versioned, student-viewable, and confidence gated.
4. Student deletion requests must remove ordinary memories from personalization and recall.
5. Teacher-facing evidence references must remain non-reversible even when internal audit records retain deeper traceability.
