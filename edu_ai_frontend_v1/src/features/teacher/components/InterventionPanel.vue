<template>
  <div class="stack">
    <div class="split-row">
      <div>
        <strong>{{ title }}</strong>
        <p class="helper-text">当前人工干预闭环状态</p>
      </div>
      <StatusPill :text="status" :tone="status === 'open' ? 'warning' : 'success'" />
    </div>
    <p v-if="level">等级：{{ level }}</p>
    <p v-if="verificationDueAt">验证时间：{{ verificationDueAt }}</p>
    <p v-if="note">{{ note }}</p>
  </div>
</template>

<script setup lang="ts">
import StatusPill from "@/shared/ui/StatusPill.vue";

defineProps<{
  title: string;
  status: string;
  level?: string;
  verificationDueAt?: string;
  note?: string;
}>();
</script>
