<template>
  <div>
    <SectionHeader eyebrow="Guardian / Phase B" title="家长同意" meta="查看、生成新版本、撤回当前版本">
      <template #aside>
        <StatusPill v-if="items.length > 0" :text="`${grantedCount} / ${items.length} 有效`" />
        <StatusPill v-else text="暂无同意记录" tone="warning" />
      </template>
    </SectionHeader>

    <LoadingBlock v-if="consentQuery.isPending.value" />
    <ErrorBanner v-else-if="consentQuery.isError.value" message="同意状态加载失败。" />
    <EmptyState
      v-else-if="!consentQuery.data.value"
      message="未找到与当前家长身份关联的同意记录。请确认绑定关系或联系班主任人工核对。"
    />

    <div v-else class="grid-2">
      <Panel>
        <h3>同意状态</h3>
        <ConsentGrid :items="items" @grant="handleGrant" @withdraw="handleWithdraw" />
      </Panel>

      <Panel>
        <h3>最近一次动作</h3>
        <div v-if="lastResponse" class="stack">
          <p><strong>{{ lastResponse.consent_id }}</strong></p>
          <p>类型：{{ lastResponse.consent_type }}</p>
          <p>状态：{{ lastResponse.status }}</p>
          <p>版本：{{ lastResponse.version }}</p>
          <p>请求：{{ lastResponse.request_id }}</p>
        </div>
        <EmptyState v-else message="还没有新的同意动作。" />
      </Panel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useQuery } from "@tanstack/vue-query";

import { createConsent, getConsentStatus, withdrawConsent } from "@/features/guardian/api";
import ConsentGrid from "@/features/guardian/components/ConsentGrid.vue";
import EmptyState from "@/shared/ui/EmptyState.vue";
import ErrorBanner from "@/shared/ui/ErrorBanner.vue";
import LoadingBlock from "@/shared/ui/LoadingBlock.vue";
import Panel from "@/shared/ui/Panel.vue";
import SectionHeader from "@/shared/ui/SectionHeader.vue";
import StatusPill from "@/shared/ui/StatusPill.vue";
import { useAuthStore } from "@/stores/auth";
import type { ConsentItem, ConsentWriteResponse } from "@/types/demo";

const auth = useAuthStore();

const consentQuery = useQuery({
  queryKey: ["guardian-consents", auth.guardianId],
  queryFn: () => getConsentStatus(auth.guardianId)
});

const items = ref<ConsentItem[]>([]);
const lastResponse = ref<ConsentWriteResponse | null>(null);

watch(
  () => consentQuery.data.value,
  (value) => {
    items.value = value ? [...value.items] : [];
  },
  { immediate: true }
);

const grantedCount = computed(() => items.value.filter((item) => item.status === "granted").length);

async function handleGrant(consentType: string) {
  const response = await createConsent(auth.guardianId, consentType);
  lastResponse.value = response;
  items.value = items.value.map((item) =>
    item.consent_type === consentType
      ? {
          ...item,
          consent_id: response.consent_id,
          version: response.version,
          status: response.status,
          effective_at: response.effective_at,
          expires_at: response.expires_at
        }
      : item
  );
}

async function handleWithdraw(consentId: string) {
  const target = items.value.find((item) => item.consent_id === consentId);
  if (!target) {
    return;
  }
  const response = await withdrawConsent(consentId, target.consent_type);
  lastResponse.value = response;
  items.value = items.value.map((item) =>
    item.consent_id === consentId
      ? {
          ...item,
          status: response.status,
          version: response.version
        }
      : item
  );
}
</script>
