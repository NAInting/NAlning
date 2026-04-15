<template>
  <div class="consent-list">
    <div v-for="item in items" :key="item.consent_id" class="consent-item">
      <div class="split-row">
        <div>
          <strong>{{ item.consent_type }}</strong>
          <p class="helper-text">{{ item.version }}</p>
        </div>
        <StatusPill :text="item.status" :tone="item.status === 'withdrawn' ? 'danger' : 'success'" />
      </div>
      <p class="helper-text">生效：{{ item.effective_at }} · 失效：{{ item.expires_at }}</p>
      <div class="button-row">
        <button class="button-secondary" type="button" @click="$emit('grant', item.consent_type)">生成新版本</button>
        <button class="button-secondary" type="button" @click="$emit('withdraw', item.consent_id)">撤回当前版本</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import StatusPill from "@/shared/ui/StatusPill.vue";
import type { ConsentItem } from "@/types/demo";

defineProps<{
  items: ConsentItem[];
}>();

defineEmits<{
  grant: [consentType: string];
  withdraw: [consentId: string];
}>();
</script>
