<template>
  <div>
    <SectionHeader eyebrow="Admin / Phase C" title="管理员审计" meta="查看 hash chain 连续性与最近一次隐私层访问">
      <template #aside>
        <StatusPill text="受限页面" tone="warning" />
      </template>
    </SectionHeader>

    <LoadingBlock v-if="auditQuery.isPending.value" />
    <ErrorBanner v-else-if="auditQuery.isError.value" message="审计预览加载失败。" />

    <Panel v-else-if="auditQuery.data.value">
      <AuditChainCard
        :chain="auditQuery.data.value.chain"
        :latest-privacy-review="auditQuery.data.value.latestPrivacyReview"
      />
    </Panel>
  </div>
</template>

<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";

import { getAdminAuditPreview } from "@/features/admin/api";
import AuditChainCard from "@/features/admin/components/AuditChainCard.vue";
import ErrorBanner from "@/shared/ui/ErrorBanner.vue";
import LoadingBlock from "@/shared/ui/LoadingBlock.vue";
import Panel from "@/shared/ui/Panel.vue";
import SectionHeader from "@/shared/ui/SectionHeader.vue";
import StatusPill from "@/shared/ui/StatusPill.vue";

const auditQuery = useQuery({
  queryKey: ["admin-audit-preview"],
  queryFn: () => getAdminAuditPreview()
});
</script>
