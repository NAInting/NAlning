<template>
  <div class="audit-chain">
    <div v-for="item in chain" :key="item.audit_id" class="audit-item">
      <strong>{{ item.audit_id }}</strong>
      <p class="helper-text">prev: {{ item.hash_prev ?? "hash_seed_000" }}</p>
      <p class="helper-text">current: {{ item.hash_current }}</p>
    </div>
    <div class="audit-item">
      <strong>最近一次隐私层访问</strong>
      <p class="helper-text">case: {{ latestPrivacyReview.case_id }}</p>
      <p class="helper-text">operator: {{ latestPrivacyReview.operator_id }}</p>
      <p class="helper-text">action: {{ latestPrivacyReview.action_type }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AdminAuditPreview } from "@/types/demo";

defineProps<{
  chain: AdminAuditPreview["chain"];
  latestPrivacyReview: AdminAuditPreview["latestPrivacyReview"];
}>();
</script>
