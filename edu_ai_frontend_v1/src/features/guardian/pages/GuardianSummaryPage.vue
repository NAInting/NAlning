<template>
  <div>
    <SectionHeader eyebrow="Guardian / Phase B" title="家长摘要" meta="只返回可见的派生摘要，不暴露教师内部判断链">
      <template #aside>
        <StatusPill text="家长可见" />
      </template>
    </SectionHeader>

    <LoadingBlock v-if="summaryQuery.isPending.value" />
    <ErrorBanner v-else-if="summaryQuery.isError.value" message="家长摘要加载失败。" />

    <div v-else-if="summaryQuery.data.value" class="grid-2">
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
import ErrorBanner from "@/shared/ui/ErrorBanner.vue";
import LoadingBlock from "@/shared/ui/LoadingBlock.vue";
import Panel from "@/shared/ui/Panel.vue";
import SectionHeader from "@/shared/ui/SectionHeader.vue";
import StatusPill from "@/shared/ui/StatusPill.vue";

const summaryQuery = useQuery({
  queryKey: ["guardian-summary"],
  queryFn: () => getGuardianSummary()
});

const supportActions = computed(() =>
  (summaryQuery.data.value?.supportSuggestions ?? []).map((item, index) => ({
    title: `建议 ${index + 1}`,
    body: item
  }))
);
</script>
