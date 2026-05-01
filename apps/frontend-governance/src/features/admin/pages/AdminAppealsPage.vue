<template>
  <div>
    <SectionHeader
      eyebrow="Admin / Phase B B3"
      title="申诉受理队列"
      meta="人工受理家长申诉，state machine：submitted → under_review → resolved/escalated"
    >
      <template #aside>
        <StatusPill v-if="items.length > 0" :text="`待处理 ${pendingCount}`" />
        <StatusPill v-else text="队列为空" tone="warning" />
      </template>
    </SectionHeader>

    <LoadingBlock v-if="queueQuery.isPending.value" />
    <ErrorBanner v-else-if="queueQuery.isError.value" message="申诉队列加载失败。" />
    <EmptyState
      v-else-if="!queueQuery.data.value"
      message="未找到与当前管理员身份关联的申诉队列。请确认 admin_id 已配置。"
    />

    <div v-else class="stack">
      <p v-if="lastError" class="helper-text danger">{{ lastError }}</p>
      <p v-else-if="lastResponse" class="helper-text success">
        已推进 {{ lastResponse.appeal_id }} → {{ statusLabel(lastResponse.status) }}（{{ lastResponse.request_id }}）
      </p>

      <EmptyState v-if="items.length === 0" message="队列为空，没有待受理的申诉。" />
      <AppealQueueCard
        v-for="item in items"
        :key="item.appeal_id"
        :item="item"
        @advance="handleAdvance"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useQuery } from "@tanstack/vue-query";

import { advanceAppealState, getAppealQueue } from "@/features/admin/api";
import AppealQueueCard from "@/features/admin/components/AppealQueueCard.vue";
import EmptyState from "@/shared/ui/EmptyState.vue";
import ErrorBanner from "@/shared/ui/ErrorBanner.vue";
import LoadingBlock from "@/shared/ui/LoadingBlock.vue";
import SectionHeader from "@/shared/ui/SectionHeader.vue";
import StatusPill from "@/shared/ui/StatusPill.vue";
import { useAuthStore } from "@/stores/auth";
import type { AppealItem, AppealStatus, AppealWriteResponse } from "@/types/demo";

const auth = useAuthStore();

const queueQuery = useQuery({
  queryKey: ["admin-appeal-queue", auth.adminId],
  queryFn: () => getAppealQueue(auth.adminId)
});

const items = ref<AppealItem[]>([]);
const lastResponse = ref<AppealWriteResponse | null>(null);
const lastError = ref<string | null>(null);

watch(
  () => queueQuery.data.value,
  (value) => {
    items.value = value ? [...value.items] : [];
  },
  { immediate: true }
);

const pendingCount = computed(
  () => items.value.filter((it) => it.status === "submitted" || it.status === "under_review").length
);

async function handleAdvance(payload: {
  appeal_id: string;
  next_status: Exclude<AppealStatus, "submitted">;
  resolution_note?: string;
  manual_review_confirmed?: boolean;
}) {
  lastError.value = null;
  const response = await advanceAppealState({
    admin_id: auth.adminId,
    appeal_id: payload.appeal_id,
    next_status: payload.next_status,
    resolution_note: payload.resolution_note,
    manual_review_confirmed: payload.manual_review_confirmed
  });
  if (!response) {
    lastError.value = "推进失败：状态转换非法，或 resolve 缺少答复说明 / 人工 review 确认。";
    return;
  }
  lastResponse.value = response;
  items.value = items.value.map((it) =>
    it.appeal_id === payload.appeal_id
      ? {
          ...it,
          status: response.status,
          last_updated_at: response.last_updated_at,
          resolution_note: payload.resolution_note ?? it.resolution_note
        }
      : it
  );
}

function statusLabel(status: AppealStatus): string {
  switch (status) {
    case "submitted":
      return "待受理";
    case "under_review":
      return "处理中";
    case "resolved":
      return "已答复";
    case "escalated":
      return "已升级";
    default:
      return status;
  }
}
</script>
