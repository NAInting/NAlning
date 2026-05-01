<template>
  <div>
    <SectionHeader
      eyebrow="Guardian / Phase B B3"
      title="家长申诉"
      meta="对 AI 评分 / Agent 行为 / 教师干预提交申诉，由管理员人工受理"
    >
      <template #aside>
        <StatusPill v-if="items.length > 0" :text="`共 ${items.length} 条`" />
        <StatusPill v-else text="暂无申诉" tone="warning" />
      </template>
    </SectionHeader>

    <LoadingBlock v-if="appealsQuery.isPending.value" />
    <ErrorBanner v-else-if="appealsQuery.isError.value" message="申诉列表加载失败。" />
    <EmptyState
      v-else-if="!appealsQuery.data.value"
      message="未找到与当前家长身份关联的申诉记录。请确认绑定关系或联系管理员人工核对。"
    />

    <div v-else class="grid-2">
      <Panel>
        <h3>提交新申诉</h3>
        <AppealForm :student-token="studentToken" @submit="handleSubmit" />
        <p v-if="lastError" class="helper-text danger">{{ lastError }}</p>
        <p v-else-if="lastResponse" class="helper-text success">
          已提交：{{ lastResponse.appeal_id }}（{{ lastResponse.request_id }}）
        </p>
      </Panel>

      <Panel>
        <h3>我的申诉</h3>
        <EmptyState v-if="items.length === 0" message="暂无申诉，提交后将显示在此。" />
        <AppealTimeline v-else :items="items" />
      </Panel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useQuery } from "@tanstack/vue-query";

import { createAppeal, getMyAppeals } from "@/features/guardian/api";
import AppealForm from "@/features/guardian/components/AppealForm.vue";
import AppealTimeline from "@/features/guardian/components/AppealTimeline.vue";
import EmptyState from "@/shared/ui/EmptyState.vue";
import ErrorBanner from "@/shared/ui/ErrorBanner.vue";
import LoadingBlock from "@/shared/ui/LoadingBlock.vue";
import Panel from "@/shared/ui/Panel.vue";
import SectionHeader from "@/shared/ui/SectionHeader.vue";
import StatusPill from "@/shared/ui/StatusPill.vue";
import { useAuthStore } from "@/stores/auth";
import type { AppealItem, AppealTargetType, AppealWriteResponse } from "@/types/demo";

const auth = useAuthStore();

const appealsQuery = useQuery({
  queryKey: ["guardian-appeals", auth.guardianId],
  queryFn: () => getMyAppeals(auth.guardianId)
});

const items = ref<AppealItem[]>([]);
const lastResponse = ref<AppealWriteResponse | null>(null);
const lastError = ref<string | null>(null);

watch(
  () => appealsQuery.data.value,
  (value) => {
    items.value = value ? [...value.items] : [];
  },
  { immediate: true }
);

const studentToken = computed(() => appealsQuery.data.value?.items[0]?.student_token ?? auth.studentToken);

async function handleSubmit(payload: {
  target_type: AppealTargetType;
  target_ref: string;
  reason: string;
  student_token: string;
}) {
  lastError.value = null;
  const response = await createAppeal({
    guardian_id: auth.guardianId,
    student_token: payload.student_token,
    target_type: payload.target_type,
    target_ref: payload.target_ref,
    reason: payload.reason
  });
  if (!response) {
    lastError.value = "提交失败：请确认家长与学生的绑定关系。";
    return;
  }
  lastResponse.value = response;
  items.value = [
    {
      appeal_id: response.appeal_id,
      guardian_id: auth.guardianId,
      student_token: payload.student_token,
      target_type: payload.target_type,
      target_ref: payload.target_ref,
      reason: payload.reason,
      status: response.status,
      submitted_at: response.last_updated_at,
      last_updated_at: response.last_updated_at,
      manual_review_required: payload.target_type === "ai_scoring"
    },
    ...items.value
  ];
}
</script>
