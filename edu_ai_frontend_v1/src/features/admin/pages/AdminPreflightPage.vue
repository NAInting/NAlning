<template>
  <div>
    <SectionHeader eyebrow="Admin / Phase B" title="管理员预检" meta="在首校试点启动前确认 35 项检查全部通过">
      <template #aside>
        <StatusPill v-if="preflightQuery.data.value" text="35 / 35 通过" tone="success" />
      </template>
    </SectionHeader>

    <LoadingBlock v-if="preflightQuery.isPending.value" />
    <ErrorBanner v-else-if="preflightQuery.isError.value" message="预检摘要加载失败。" />
    <EmptyState
      v-else-if="!preflightQuery.data.value"
      message="未找到与当前管理员身份关联的预检数据。请确认 admin_id 已配置。"
    />

    <div v-else class="stack">
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
import EmptyState from "@/shared/ui/EmptyState.vue";
import ErrorBanner from "@/shared/ui/ErrorBanner.vue";
import LoadingBlock from "@/shared/ui/LoadingBlock.vue";
import MetricCard from "@/shared/ui/MetricCard.vue";
import Panel from "@/shared/ui/Panel.vue";
import SectionHeader from "@/shared/ui/SectionHeader.vue";
import SignalList from "@/shared/ui/SignalList.vue";
import StatusPill from "@/shared/ui/StatusPill.vue";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();

const preflightQuery = useQuery({
  queryKey: ["admin-preflight", auth.adminId],
  queryFn: () => getAdminPreflight(auth.adminId)
});
</script>
