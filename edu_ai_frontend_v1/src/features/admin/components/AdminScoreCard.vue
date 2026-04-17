<template>
  <article class="appeal-row">
    <div class="split-row">
      <div>
        <strong>{{ score.score_id }}</strong>
        <p class="helper-text">学生 {{ score.student_token }} · {{ score.course_id }}</p>
      </div>
      <StatusPill :text="statusLabel(score.status)" :tone="statusTone(score.status)" />
    </div>

    <div class="split-row">
      <span>综合评分 <strong>{{ score.composite_score.toFixed(1) }}</strong></span>
      <span>置信度 <strong>{{ (score.composite_confidence * 100).toFixed(0) }}%</strong></span>
      <span class="helper-text">{{ formatDate(score.generated_at) }}</span>
    </div>

    <div v-if="score.added_to_record" class="helper-text success">
      已入档 · {{ formatDate(score.added_to_record_at!) }}
    </div>

    <div v-else-if="canAccept" class="button-row">
      <button
        class="button-primary"
        :disabled="accepting"
        @click="$emit('accept', score.score_id)"
      >
        {{ accepting ? "入档中…" : "接纳入档" }}
      </button>
    </div>

    <div v-else class="helper-text warning">
      {{ rejectReason }}
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";

import StatusPill from "@/shared/ui/StatusPill.vue";
import type { ScoreStatus, StudentScoreRecord } from "@/types/demo";

const props = defineProps<{
  score: StudentScoreRecord;
  accepting?: boolean;
}>();

defineEmits<{
  accept: [scoreId: string];
}>();

const canAccept = computed(() => {
  const s = props.score;
  return (
    (s.status === "released" || s.status === "corrected") &&
    s.composite_confidence >= 0.7 &&
    !s.added_to_record
  );
});

const rejectReason = computed(() => {
  const s = props.score;
  if (s.status === "draft") return "草稿状态，不可入档";
  if (s.status === "disputed") return "申诉中，不可入档";
  if (s.composite_confidence < 0.7) return "置信度不足 0.7，不可入档";
  return "";
});

function statusLabel(status: ScoreStatus): string {
  switch (status) {
    case "draft": return "草稿";
    case "released": return "已发布";
    case "disputed": return "申诉中";
    case "corrected": return "已修正";
    default: return status;
  }
}

function statusTone(status: ScoreStatus): "success" | "warning" | "danger" | undefined {
  switch (status) {
    case "released": return "success";
    case "corrected": return "success";
    case "disputed": return "warning";
    case "draft": return undefined;
    default: return undefined;
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}
</script>
