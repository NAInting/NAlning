<template>
  <div class="mastery-list">
    <div v-for="item in items" :key="item.knowledge_tag" class="mastery-item">
      <div class="split-row">
        <div>
          <strong>{{ prettyLabel(item.knowledge_tag) }}</strong>
          <p class="helper-text">证据 {{ item.evidence_count }} 次</p>
        </div>
        <div class="text-right">
          <strong>{{ item.mastery_level.toFixed(1) }}</strong>
          <p class="helper-text" v-if="deltaMap[item.knowledge_tag] !== undefined">
            7 天 {{ formatDelta(deltaMap[item.knowledge_tag]) }}
          </p>
        </div>
      </div>
      <div class="bar-track">
        <div class="bar-fill" :style="{ width: `${item.mastery_level}%` }" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

import type { Last7dChange, MasteryItem } from "@/types/demo";

const props = defineProps<{
  items: readonly MasteryItem[];
  deltas?: readonly Last7dChange[];
}>();

const labelMap: Record<string, string> = {
  quadratic_function: "二次函数",
  graph_translation: "图像平移",
  reflection_quality: "反思质量",
  reading_inference: "阅读推理"
};

const deltaMap = computed(() =>
  Object.fromEntries((props.deltas ?? []).map((item) => [item.knowledge_tag, item.delta]))
);

function prettyLabel(tag: string) {
  return labelMap[tag] ?? tag;
}

function formatDelta(value: number) {
  return value > 0 ? `+${value.toFixed(1)}` : value.toFixed(1);
}
</script>
