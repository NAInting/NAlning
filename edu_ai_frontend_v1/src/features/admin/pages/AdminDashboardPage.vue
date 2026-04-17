<template>
  <div>
    <SectionHeader
      eyebrow="Admin / Phase B B5"
      title="管理员仪表盘"
      meta="全局概览：合规、申诉、评分、预检一目了然"
    >
      <template #aside>
        <StatusPill v-if="allLoaded" text="数据就绪" tone="success" />
        <StatusPill v-else text="加载中…" />
      </template>
    </SectionHeader>

    <LoadingBlock v-if="anyPending" />
    <ErrorBanner v-else-if="anyError" message="仪表盘部分数据加载失败，请检查管理员身份配置。" />
    <EmptyState
      v-else-if="allEmpty"
      message="未找到与当前管理员身份关联的数据。请确认 admin_id 已配置。"
    />

    <div v-else class="stack">
      <div class="grid-2">
        <Panel v-if="compliance">
          <h3>合规概览</h3>
          <div class="grid-3" style="margin-top: var(--space-3)">
            <MetricCard label="同意覆盖率" :value="`${compliance.effective_consent_coverage_pct}%`" />
            <MetricCard label="验收通过率" :value="`${compliance.acceptance_pass_rate_pct}%`" />
            <MetricCard label="受限访问" :value="compliance.restricted_access_count" />
          </div>
        </Panel>

        <Panel v-if="preflight">
          <h3>预检状态</h3>
          <div class="grid-3" style="margin-top: var(--space-3)">
            <MetricCard label="通过" :value="preflight.acceptance_passed" />
            <MetricCard label="失败" :value="preflight.acceptance_failed" />
            <MetricCard label="总计" :value="preflight.acceptance_total" />
          </div>
        </Panel>
      </div>

      <div class="grid-2">
        <Panel v-if="appealItems">
          <div class="split-row">
            <h3>申诉队列</h3>
            <StatusPill :text="`待处理 ${pendingAppealCount}`" :tone="pendingAppealCount > 0 ? 'warning' : 'success'" />
          </div>
          <div class="mastery-list" style="margin-top: var(--space-3)">
            <div v-for="item in appealItems.slice(0, 3)" :key="item.appeal_id" class="mastery-item">
              <div class="split-row">
                <strong>{{ item.appeal_id }}</strong>
                <StatusPill :text="appealStatusLabel(item.status)" :tone="appealStatusTone(item.status)" />
              </div>
              <p class="helper-text">{{ item.reason.slice(0, 60) }}{{ item.reason.length > 60 ? "…" : "" }}</p>
            </div>
          </div>
        </Panel>

        <Panel v-if="scoringItems">
          <div class="split-row">
            <h3>评分验收</h3>
            <StatusPill :text="`已入档 ${addedToRecordCount}/${scoringItems.length}`" />
          </div>
          <div class="mastery-list" style="margin-top: var(--space-3)">
            <div v-for="score in scoringItems.slice(0, 3)" :key="score.score_id" class="mastery-item">
              <div class="split-row">
                <span>{{ score.student_token }}</span>
                <strong>{{ score.composite_score.toFixed(1) }}</strong>
              </div>
              <div class="split-row">
                <span class="helper-text">置信 {{ (score.composite_confidence * 100).toFixed(0) }}%</span>
                <span v-if="score.added_to_record" class="helper-text success">已入档</span>
                <span v-else class="helper-text">待入档</span>
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useQuery } from "@tanstack/vue-query";

import {
  getAdminCompliance,
  getAdminPreflight,
  getAdminScoringOverview,
  getAppealQueue
} from "@/features/admin/api";
import EmptyState from "@/shared/ui/EmptyState.vue";
import ErrorBanner from "@/shared/ui/ErrorBanner.vue";
import LoadingBlock from "@/shared/ui/LoadingBlock.vue";
import MetricCard from "@/shared/ui/MetricCard.vue";
import Panel from "@/shared/ui/Panel.vue";
import SectionHeader from "@/shared/ui/SectionHeader.vue";
import StatusPill from "@/shared/ui/StatusPill.vue";
import { useAuthStore } from "@/stores/auth";
import type { AppealStatus } from "@/types/demo";

const auth = useAuthStore();

const complianceQuery = useQuery({
  queryKey: ["admin-compliance", auth.adminId],
  queryFn: () => getAdminCompliance(auth.adminId)
});
const preflightQuery = useQuery({
  queryKey: ["admin-preflight", auth.adminId],
  queryFn: () => getAdminPreflight(auth.adminId)
});
const appealQuery = useQuery({
  queryKey: ["admin-appeal-queue", auth.adminId],
  queryFn: () => getAppealQueue(auth.adminId)
});
const scoringQuery = useQuery({
  queryKey: ["admin-scoring-overview", auth.adminId],
  queryFn: () => getAdminScoringOverview(auth.adminId)
});

const compliance = computed(() => complianceQuery.data.value);
const preflight = computed(() => preflightQuery.data.value);
const appealItems = computed(() => appealQuery.data.value?.items ?? null);
const scoringItems = computed(() => scoringQuery.data.value?.items ?? null);

const anyPending = computed(() =>
  complianceQuery.isPending.value || preflightQuery.isPending.value ||
  appealQuery.isPending.value || scoringQuery.isPending.value
);
const anyError = computed(() =>
  complianceQuery.isError.value || preflightQuery.isError.value ||
  appealQuery.isError.value || scoringQuery.isError.value
);
const allLoaded = computed(() =>
  !anyPending.value && !anyError.value &&
  !!(compliance.value || preflight.value || appealItems.value || scoringItems.value)
);
const allEmpty = computed(() =>
  !anyPending.value && !anyError.value &&
  !compliance.value && !preflight.value && !appealItems.value && !scoringItems.value
);

const pendingAppealCount = computed(() =>
  (appealItems.value ?? []).filter((it) => it.status === "submitted" || it.status === "under_review").length
);
const addedToRecordCount = computed(() =>
  (scoringItems.value ?? []).filter((s) => s.added_to_record).length
);

function appealStatusLabel(status: AppealStatus): string {
  switch (status) {
    case "submitted": return "待受理";
    case "under_review": return "处理中";
    case "resolved": return "已答复";
    case "escalated": return "已升级";
    default: return status;
  }
}

function appealStatusTone(status: AppealStatus): "success" | "warning" | "danger" | undefined {
  switch (status) {
    case "submitted": return "warning";
    case "under_review": return undefined;
    case "resolved": return "success";
    case "escalated": return "danger";
    default: return undefined;
  }
}
</script>
