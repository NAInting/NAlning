<template>
  <div>
    <SectionHeader
      eyebrow="Student / Phase A"
      title="学生首页"
      meta="掌握地图、No-AI 基线和最近 7 天变化都在这里。"
    >
      <template #aside>
        <StatusPill text="P0 页面" />
      </template>
    </SectionHeader>

    <LoadingBlock v-if="masteryQuery.isPending.value" />
    <ErrorBanner v-else-if="masteryQuery.isError.value" message="学生掌握度加载失败。" />
    <EmptyState
      v-else-if="!hasRenderableData"
      message="今天还没有可展示的掌握度数据，先完成一轮 No-AI 任务或回到陪学页生成新记录。"
    />

    <div v-else class="stack">
      <div class="grid-3">
        <MetricCard label="平均掌握度" :value="averageMastery" note="基于当前 3 个核心指标" />
        <MetricCard
          label="No-AI gap"
          :value="masteryData!.no_ai_baseline.gap_score.toFixed(1)"
          note="越低越接近独立完成"
        />
        <MetricCard label="7 天变化" :value="weeklyChange" note="来自 latest_7d_changes 聚合" />
      </div>

      <div class="grid-2">
        <Panel>
          <div class="split-row">
            <div>
              <h3>知识掌握地图</h3>
              <p class="helper-text">优先看涨幅最快和仍需复盘的知识点。</p>
            </div>
            <StatusPill :text="focusTag" tone="success" />
          </div>
          <MasteryList :items="masteryData!.knowledge_map" :deltas="masteryData!.last_7d_changes" />
        </Panel>

        <Panel>
          <NoAITaskCard :baseline="masteryData!.no_ai_baseline" />
        </Panel>
      </div>

      <Panel>
        <div class="split-row">
          <div>
            <h3>最近 7 天变化</h3>
            <p class="helper-text">先看哪一项在增长，再决定下一轮陪学和独立练习怎么配。</p>
          </div>
          <StatusPill :text="trendSummary" tone="success" />
        </div>

        <div class="trend-grid">
          <article v-for="item in trendCards" :key="item.tag" class="trend-card">
            <div class="split-row">
              <strong>{{ item.label }}</strong>
              <span class="trend-delta" :class="item.delta > 0 ? 'positive' : 'neutral'">
                {{ formatDelta(item.delta) }}
              </span>
            </div>
            <p class="helper-text">{{ item.note }}</p>
          </article>
        </div>
      </Panel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useQuery } from "@tanstack/vue-query";

import { getStudentMastery } from "@/features/student/api";
import MasteryList from "@/features/student/components/MasteryList.vue";
import NoAITaskCard from "@/features/student/components/NoAITaskCard.vue";
import EmptyState from "@/shared/ui/EmptyState.vue";
import ErrorBanner from "@/shared/ui/ErrorBanner.vue";
import LoadingBlock from "@/shared/ui/LoadingBlock.vue";
import MetricCard from "@/shared/ui/MetricCard.vue";
import Panel from "@/shared/ui/Panel.vue";
import SectionHeader from "@/shared/ui/SectionHeader.vue";
import StatusPill from "@/shared/ui/StatusPill.vue";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();

const labelMap: Record<string, string> = {
  quadratic_function: "二次函数",
  graph_translation: "图像平移",
  reflection_quality: "反思质量"
};

const masteryQuery = useQuery({
  queryKey: ["student-mastery", auth.studentToken],
  queryFn: () => getStudentMastery(auth.studentToken)
});

const masteryData = computed(() => masteryQuery.data.value);

const hasRenderableData = computed(
  () => !!masteryData.value?.no_ai_baseline && (masteryData.value?.knowledge_map?.length ?? 0) > 0
);

const averageMastery = computed(() => {
  const items = masteryData.value?.knowledge_map ?? [];
  if (!items.length) return "--";
  const total = items.reduce((sum, item) => sum + item.mastery_level, 0);
  return (total / items.length).toFixed(1);
});

const weeklyChange = computed(() => {
  const items = masteryData.value?.last_7d_changes ?? [];
  if (!items.length) return "0.0";
  const total = items.reduce((sum, item) => sum + item.delta, 0);
  return `${total >= 0 ? "+" : ""}${total.toFixed(1)}`;
});

const deltaMap = computed(() =>
  Object.fromEntries((masteryData.value?.last_7d_changes ?? []).map((item) => [item.knowledge_tag, item.delta]))
);

const focusTag = computed(() => {
  const items = masteryData.value?.knowledge_map ?? [];
  if (!items.length) return "等待数据";

  const weakest = [...items].sort((a, b) => a.mastery_level - b.mastery_level)[0];
  return `先看 ${labelMap[weakest.knowledge_tag] ?? weakest.knowledge_tag}`;
});

const trendCards = computed(() =>
  (masteryData.value?.knowledge_map ?? []).map((item) => {
    const delta = deltaMap.value[item.knowledge_tag] ?? 0;
    return {
      tag: item.knowledge_tag,
      label: labelMap[item.knowledge_tag] ?? item.knowledge_tag,
      delta,
      note:
        delta > 0
          ? "这一项在上升，可以继续用短问题加口头解释巩固。"
          : delta < 0
            ? "这一项最近有回落，下一轮先做 No-AI 复述确认卡点。"
            : "这一项本周还没有明显变化，建议先做最短独立任务再回来比对。"
    };
  })
);

const trendSummary = computed(() => {
  const total = trendCards.value.length;
  if (!total) return "等待趋势";
  const improvingCount = trendCards.value.filter((item) => item.delta > 0).length;
  return `${improvingCount}/${total} 项在上升`;
});

function formatDelta(value: number) {
  return value > 0 ? `+${value.toFixed(1)}` : value.toFixed(1);
}
</script>
