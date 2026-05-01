<template>
  <div class="mastery-item">
    <div class="split-row">
      <strong>{{ dimensionLabel(dimension.dimension) }}</strong>
      <StatusPill
        :text="`置信 ${(dimension.confidence * 100).toFixed(0)}%`"
        :tone="dimension.confidence >= 0.8 ? 'success' : undefined"
      />
    </div>
    <div class="bar-track">
      <div class="bar-fill" :style="{ width: `${dimension.value}%` }" />
    </div>
    <div class="split-row" style="margin-top: 6px">
      <span class="helper-text">{{ dimension.value.toFixed(1) }} 分</span>
      <span class="helper-text">证据：{{ dimension.evidence_ref }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import StatusPill from "@/shared/ui/StatusPill.vue";
import type { ScoreDimension } from "@/types/demo";

defineProps<{
  dimension: ScoreDimension;
}>();

const labelMap: Record<string, string> = {
  knowledge_mastery: "知识掌握",
  process_fluency: "程序流畅",
  representation: "表征理解",
  ai_independence: "AI 独立性",
  reflection_quality: "反思质量"
};

function dimensionLabel(key: string): string {
  return labelMap[key] ?? key;
}
</script>
