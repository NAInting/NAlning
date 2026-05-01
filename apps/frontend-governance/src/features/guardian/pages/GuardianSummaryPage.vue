<template>
  <div>
    <SectionHeader eyebrow="Guardian / Phase B" title="家长摘要" meta="只返回可见的派生摘要，不暴露教师内部判断链">
      <template #aside>
        <StatusPill text="家长可见" />
      </template>
    </SectionHeader>

    <LoadingBlock v-if="summaryQuery.isPending.value" />
    <ErrorBanner v-else-if="summaryQuery.isError.value" message="家长摘要加载失败。" />
    <EmptyState
      v-else-if="!summaryQuery.data.value"
      message="未找到与当前家长身份关联的学生摘要。请确认绑定关系或联系班主任人工核对。"
    />

    <div v-else class="grid-2">
      <Panel>
        <GuardianSummaryCard
          :student-name="summaryQuery.data.value.displayName"
          :signals="summaryQuery.data.value.progressSignals"
        />
      </Panel>

      <Panel>
        <h3>家庭支持建议</h3>
        <ActionBoard :items="supportActions" />
      </Panel>

      <Panel style="grid-column: 1 / -1;">
        <h3>可见 / 不可见边界</h3>
        <VisibilityBoundaryCard :sections="summaryQuery.data.value.visibilityBoundary" />
      </Panel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useQuery } from "@tanstack/vue-query";

import { getGuardianSummary } from "@/features/guardian/api";
import GuardianSummaryCard from "@/features/guardian/components/GuardianSummaryCard.vue";
import VisibilityBoundaryCard from "@/features/guardian/components/VisibilityBoundaryCard.vue";
import ActionBoard from "@/shared/ui/ActionBoard.vue";
import EmptyState from "@/shared/ui/EmptyState.vue";
import ErrorBanner from "@/shared/ui/ErrorBanner.vue";
import LoadingBlock from "@/shared/ui/LoadingBlock.vue";
import Panel from "@/shared/ui/Panel.vue";
import SectionHeader from "@/shared/ui/SectionHeader.vue";
import StatusPill from "@/shared/ui/StatusPill.vue";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();

const summaryQuery = useQuery({
  queryKey: ["guardian-summary", auth.guardianId],
  queryFn: () => getGuardianSummary(auth.guardianId)
});

const supportActions = computed(() =>
  (summaryQuery.data.value?.supportSuggestions ?? []).map((item, index) => ({
    title: `建议 ${index + 1}`,
    body: item
  }))
);
</script>
