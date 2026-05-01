<template>
  <div class="heatmap">
    <div class="heat-row">
      <div class="heat-label">知识点</div>
      <div class="heat-cell-header">高风险</div>
      <div class="heat-cell-header">中风险</div>
      <div class="heat-cell-header">低风险</div>
      <div class="heat-cell-header">已解决</div>
    </div>
    <div v-for="item in rows" :key="item.tag" class="heat-row">
      <div class="heat-label">{{ prettyLabel(item.tag) }}</div>
      <div class="heat-cell heat-high">{{ item.breakdown.high_risk }}</div>
      <div class="heat-cell heat-medium">{{ item.breakdown.medium_risk }}</div>
      <div class="heat-cell heat-low">{{ item.breakdown.low_risk }}</div>
      <div class="heat-cell heat-resolved">{{ item.breakdown.resolved }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

import type { TeacherDailyReportResponse } from "@/types/demo";

const props = defineProps<{
  items: TeacherDailyReportResponse["knowledge_heat"];
}>();

const labelMap: Record<string, string> = {
  quadratic_function: "二次函数",
  graph_translation: "图像平移",
  reading_inference: "阅读推理"
};

const rows = computed(() =>
  props.items.map((item) => ({
    tag: item.tag,
    breakdown: item.risk_breakdown ?? {
      high_risk: item.risk_count,
      medium_risk: 0,
      low_risk: 0,
      resolved: 0
    }
  }))
);

function prettyLabel(tag: string) {
  return labelMap[tag] ?? tag;
}
</script>
