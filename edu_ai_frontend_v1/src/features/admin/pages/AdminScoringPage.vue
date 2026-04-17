<template>
  <div>
    <SectionHeader
      eyebrow="Admin / Phase B B4"
      title="评分验收"
      meta="审查 AI 评分，将符合条件的评分接纳入正式记录。status ∈ {released, corrected} + 置信度 ≥ 0.7 方可入档。"
    >
      <template #aside>
        <StatusPill v-if="items.length > 0" :text="`已入档 ${addedCount}/${items.length}`" />
      </template>
    </SectionHeader>

    <LoadingBlock v-if="overviewQuery.isPending.value" />
    <ErrorBanner v-else-if="overviewQuery.isError.value" message="评分概览加载失败。" />
    <EmptyState
      v-else-if="!overviewQuery.data.value"
      message="未找到与当前管理员身份关联的评分数据。请确认 admin_id 已配置。"
    />

    <div v-else class="stack">
      <div class="grid-3">
        <MetricCard label="总评分数" :value="items.length" />
        <MetricCard label="已发布" :value="releasedCount" note="released + corrected" />
        <MetricCard label="已入档" :value="addedCount" />
      </div>

      <p v-if="lastError" class="helper-text danger">{{ lastError }}</p>
      <p v-else-if="lastResponse" class="helper-text success">
        已入档 {{ lastResponse.score_id }}（{{ lastResponse.request_id }}）
      </p>

      <EmptyState v-if="items.length === 0" message="没有评分记录。" />
      <AdminScoreCard
        v-for="score in items"
        :key="score.score_id"
        :score="score"
        :accepting="acceptingId === score.score_id"
        @accept="handleAccept"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useQuery } from "@tanstack/vue-query";

import { acceptScoreToRecord, getAdminScoringOverview } from "@/features/admin/api";
import AdminScoreCard from "@/features/admin/components/AdminScoreCard.vue";
import EmptyState from "@/shared/ui/EmptyState.vue";
import ErrorBanner from "@/shared/ui/ErrorBanner.vue";
import LoadingBlock from "@/shared/ui/LoadingBlock.vue";
import MetricCard from "@/shared/ui/MetricCard.vue";
import SectionHeader from "@/shared/ui/SectionHeader.vue";
import StatusPill from "@/shared/ui/StatusPill.vue";
import { useAuthStore } from "@/stores/auth";
import type { ScoreAcceptResponse, StudentScoreRecord } from "@/types/demo";

const auth = useAuthStore();

const overviewQuery = useQuery({
  queryKey: ["admin-scoring-overview", auth.adminId],
  queryFn: () => getAdminScoringOverview(auth.adminId)
});

const items = ref<StudentScoreRecord[]>([]);
const addedCount = computed(() => items.value.filter((s) => s.added_to_record).length);
const releasedCount = computed(() => items.value.filter((s) => s.status === "released" || s.status === "corrected").length);
const acceptingId = ref<string | null>(null);
const lastResponse = ref<ScoreAcceptResponse | null>(null);
const lastError = ref<string | null>(null);

watch(
  () => overviewQuery.data.value,
  (value) => {
    items.value = value ? [...value.items] : [];
  },
  { immediate: true }
);

async function handleAccept(scoreId: string) {
  lastError.value = null;
  acceptingId.value = scoreId;
  const response = await acceptScoreToRecord(auth.adminId, scoreId);
  acceptingId.value = null;
  if (!response) {
    lastError.value = "入档失败：评分状态不符合条件，或已入档（重复 409）。";
    return;
  }
  lastResponse.value = response;
  items.value = items.value.map((it) =>
    it.score_id === scoreId
      ? { ...it, added_to_record: true, added_to_record_at: response.added_to_record_at, added_to_record_by: auth.adminId }
      : it
  );
}
</script>
