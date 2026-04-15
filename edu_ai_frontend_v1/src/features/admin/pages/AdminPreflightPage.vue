<template>
  <div>
    <SectionHeader eyebrow="Admin / Phase C" title="管理员预检" meta="在首校试点启动前确认 35 项检查全部通过">
      <template #aside>
        <StatusPill text="35 / 35 通过" tone="success" />
      </template>
    </SectionHeader>

    <LoadingBlock v-if="preflightQuery.isPending.value" />
    <ErrorBanner v-else-if="preflightQuery.isError.value" message="预检摘要加载失败。" />

    <div v-else-if="preflightQuery.data.value" class="stack">
      <div class="grid-3">
        <MetricCard label="通过项" :value="preflightQuery.data.value.acceptance_passed" />
        <MetricCard label="失败项" :value="preflightQuery.data.value.acceptance_failed" />
        <MetricCard label="总检查数" :value="preflightQuery.data.value.acceptance_total" />
      </div>

      <div class="grid-2">
        <Panel>
          <h3>必须满足的状态</h3>
          <SignalList :items="preflightQuery.data.value.must_have_states" />
        </Panel>

        <Panel>
          <h3>检查组概览</h3>
          <ChecklistCard :items="preflightQuery.data.value.check_groups" />
        </Panel>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";

import { getAdminPreflight } from "@/features/admin/api";
import ChecklistCard from "@/features/admin/components/ChecklistCard.vue";
import ErrorBanner from "@/shared/ui/ErrorBanner.vue";
import LoadingBlock from "@/shared/ui/LoadingBlock.vue";
import MetricCard from "@/shared/ui/MetricCard.vue";
import Panel from "@/shared/ui/Panel.vue";
import SectionHeader from "@/shared/ui/SectionHeader.vue";
import SignalList from "@/shared/ui/SignalList.vue";
import StatusPill from "@/shared/ui/StatusPill.vue";

const preflightQuery = useQuery({
  queryKey: ["admin-preflight"],
  queryFn: () => getAdminPreflight()
});
</script>
