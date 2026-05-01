<template>
  <div>
    <SectionHeader eyebrow="Admin / Phase B" title="管理员审计" meta="查看 hash chain 连续性与最近一次隐私层访问">
      <template #aside>
        <StatusPill text="受限页面" tone="warning" />
      </template>
    </SectionHeader>

    <LoadingBlock v-if="auditQuery.isPending.value" />
    <ErrorBanner v-else-if="auditQuery.isError.value" message="审计预览加载失败。" />
    <EmptyState
      v-else-if="!auditQuery.data.value"
      message="未找到与当前管理员身份关联的审计数据。请确认 admin_id 已配置。"
    />

    <Panel v-else>
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
import EmptyState from "@/shared/ui/EmptyState.vue";
import ErrorBanner from "@/shared/ui/ErrorBanner.vue";
import LoadingBlock from "@/shared/ui/LoadingBlock.vue";
import Panel from "@/shared/ui/Panel.vue";
import SectionHeader from "@/shared/ui/SectionHeader.vue";
import StatusPill from "@/shared/ui/StatusPill.vue";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();

const auditQuery = useQuery({
  queryKey: ["admin-audit-preview", auth.adminId],
  queryFn: () => getAdminAuditPreview(auth.adminId)
});
</script>
