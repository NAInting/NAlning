# Phase 1.6 Privacy and Emotion Routing Spec

Version: 2026-04-22  
Status: Implemented minimal runtime package

## 1. Phase Goal

Phase 1.6 turns the Student Agent privacy and emotion routing rules into a testable runtime package.

Core requirements:

- Detect emotional and safety keywords.
- Force campus-local routing for local-only/yellow/red cases.
- Pause academic progression for yellow/red cases.
- Build only abstract inter-agent signals.
- Never send raw student wording, raw dialogue, or reversible conversation locators to Teacher Agent.

## 2. Implementation Location

Phase 1.6 activates the existing planned package:

```text
packages/privacy-filter/
```

This package is intentionally independent because Phase 4 requires all inter-agent communication to pass through a privacy filter.

## 3. Risk Levels

| Level | Meaning | Route | Signal |
|---|---|---|---|
| `green` | ordinary academic message | controlled cloud | none |
| `local_only` | mild frustration or sensitive local handling | campus local | none |
| `yellow` | emotional anomaly requiring adult awareness | campus local | abstract `emotion_anomaly` |
| `red` | safety risk | campus local | abstract `risk_alert` |

## 4. Signal Privacy Rules

Signals must not contain:

- `content`
- `conversation_text`
- `conversation_excerpt`
- `raw_text`
- `full_transcript`
- `transcript`
- `student_answer`
- `student_response`
- `agent_response`
- `rationale_summary`
- `source_turn_range`
- `conversation_id`
- `turn_id`
- `message_id`
- `keyword_hit`

Allowed yellow signal shape:

```ts
{
  signal_type: "emotion_anomaly",
  payload: {
    student_id,
    severity,
    suggested_action,
    detected_at
  }
}
```

Allowed red signal shape:

```ts
{
  signal_type: "risk_alert",
  payload: {
    student_id,
    risk_category: "safety",
    severity: "critical",
    requires_immediate_action: true,
    escalation_path: ["school_safety_protocol"]
  }
}
```

## 5. Non-Goals

This phase does not decide:

- The real school staff member who receives red alerts.
- The full counselor workflow.
- Legal emergency procedures.
- Long-term emotion baseline modeling.
- Teacher dashboard rendering.

Those require school-specific operational decisions and belong to pilot preparation or later governance runtime work.

## 6. Completion Criteria

Phase 1.6 can lock when:

- `@edu-ai/privacy-filter` is a real workspace package.
- Ordinary academic messages stay on controlled cloud.
- Mild frustration routes campus-local without inter-agent signal.
- Yellow language emits only abstract emotion anomaly signal.
- Red language emits only abstract critical risk alert.
- Signal validator rejects raw conversation fields.
- Root CI passes.

