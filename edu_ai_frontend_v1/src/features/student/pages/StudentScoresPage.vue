<template>
  <div>
    <SectionHeader
      eyebrow="Student / Phase B B4"
      title="AI 评分透明"
      meta="查看 AI 对你的多维评分、置信度和证据引用。置信度低于 70% 的评分不展示。"
    >
      <template #aside>
        <StatusPill v-if="visibleCount > 0" :text="`${visibleCount} 条可见评分`" />
        <StatusPill v-else text="暂无评分" tone="warning" />
      </template>
    </SectionHeader>

    <LoadingBlock v-if="scoresQuery.isPending.value" />
    <ErrorBanner v-else-if="scoresQuery.isError.value" message="评分数据加载失败。" />
    <EmptyState
      v-else-if="!scoresQuery.data.value"
      message="未找到与当前学生身份关联的评分记录。请确认 student_token 是否正确。"
    />

    <div v-else class="stack">
      <EmptyState v-if="visibleCount === 0" message="当前没有置信度足够高的评分可以展示。继续学习后会生成新的评分。" />

      <Panel v-for="record in scoresQuery.data.value.items" :key="record.score_id">
        <div class="split-row">
          <div>
            <h3 style="margin: 0">{{ record.score_id }}</h3>
            <p class="helper-text">{{ record.course_id }} · {{ formatDate(record.generated_at) }}</p>
          </div>
          <div class="text-right">
            <div class="metric-value" style="margin: 0; font-size: var(--font-size-h2)">
              {{ record.composite_score.toFixed(1) }}
            </div>
            <StatusPill
              :text="`置信 ${(record.composite_confidence * 100).toFixed(0)}%`"
              :tone="record.composite_confidence >= 0.8 ? 'success' : undefined"
            />
          </div>
        </div>

        <div class="mastery-list" style="margin-top: var(--space-4)">
          <ScoreDimensionBar
            v-for="dim in record.dimensions"
            :key="dim.dimension"
            :dimension="dim"
          />
        </div>

        <div v-if="record.diagnostics.length > 0" style="margin-top: var(--space-4)">
          <h4 style="margin: 0 0 8px">诊断意见</h4>
          <ul class="signal-list">
            <li v-for="(diag, i) in record.diagnostics" :key="i">{{ diag }}</li>
          </ul>
        </div>

        <p v-if="record.added_to_record" class="helper-text success" style="margin-top: var(--space-3)">
          此评分已入档（{{ formatDate(record.added_to_record_at!) }}）
        </p>
      </Panel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useQuery } from "@tanstack/vue-query";

import { getStudentScores } from "@/features/student/api";
import ScoreDimensionBar from "@/features/student/components/ScoreDimensionBar.vue";
import EmptyState from "@/shared/ui/EmptyState.vue";
import ErrorBanner from "@/shared/ui/ErrorBanner.vue";
import LoadingBlock from "@/shared/ui/LoadingBlock.vue";
import Panel from "@/shared/ui/Panel.vue";
import SectionHeader from "@/shared/ui/SectionHeader.vue";
import StatusPill from "@/shared/ui/StatusPill.vue";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();

const scoresQuery = useQuery({
  queryKey: ["student-scores", auth.studentToken],
  queryFn: () => getStudentScores(auth.studentToken)
});

const visibleCount = computed(() => scoresQuery.data.value?.items.length ?? 0);

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}
</script>
