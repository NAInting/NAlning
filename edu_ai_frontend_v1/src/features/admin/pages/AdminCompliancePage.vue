<template>
  <div>
    <SectionHeader eyebrow="Admin / Phase B" title="管理员合规" meta="查看边界、同意覆盖率和默认不做清单">
      <template #aside>
        <StatusPill text="P1 页面" />
      </template>
    </SectionHeader>

    <LoadingBlock v-if="complianceQuery.isPending.value" />
    <ErrorBanner v-else-if="complianceQuery.isError.value" message="合规概览加载失败。" />
    <EmptyState
      v-else-if="!complianceQuery.data.value"
      message="未找到与当前管理员身份关联的合规数据。请确认 admin_id 已配置。"
    />

    <div v-else class="stack">
      <div class="grid-3">
        <MetricCard label="有效同意覆盖率" :value="`${complianceQuery.data.value.effective_consent_coverage_pct}%`" />
        <MetricCard label="验收通过率" :value="`${complianceQuery.data.value.acceptance_pass_rate_pct}%`" />
        <MetricCard label="受限访问次数" :value="complianceQuery.data.value.restricted_access_count" />
      </div>

      <div class="grid-2">
        <Panel>
          <BoundaryNotice :items="complianceQuery.data.value.boundary_summary" />
        </Panel>

        <Panel>
          <DoNotDoList :items="complianceQuery.data.value.do_not_do_items" />
        </Panel>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";

import { getAdminCompliance } from "@/features/admin/api";
import BoundaryNotice from "@/features/admin/components/BoundaryNotice.vue";
import DoNotDoList from "@/features/admin/components/DoNotDoList.vue";
import EmptyState from "@/shared/ui/EmptyState.vue";
import ErrorBanner from "@/shared/ui/ErrorBanner.vue";
import LoadingBlock from "@/shared/ui/LoadingBlock.vue";
import MetricCard from "@/shared/ui/MetricCard.vue";
import Panel from "@/shared/ui/Panel.vue";
import SectionHeader from "@/shared/ui/SectionHeader.vue";
import StatusPill from "@/shared/ui/StatusPill.vue";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();

const complianceQuery = useQuery({
  queryKey: ["admin-compliance", auth.adminId],
  queryFn: () => getAdminCompliance(auth.adminId)
});
</script>
