# @edu-ai/content-pipeline

Offline curriculum production pipeline for AI-native unit generation.

Phase 2.2+ current status:

- Defines six workflow roles: five production specialists plus one QA gate.
- Adds `assessment_designer` as the owner of the `assessment` section.
- Maps each agent to exactly one owned `AiNativeUnitSpec` section.
- Provides ownership validation so an agent cannot write another agent's section.
- Supports deterministic mock workflows, mock LLM workflows, and explicit review-only provider runs.
- Keeps source `unit.yaml` writeback disabled; reviewed candidates must be written to a separate output file.

Run:

```powershell
pnpm --filter @edu-ai/content-pipeline test
pnpm --filter @edu-ai/content-pipeline build
```
