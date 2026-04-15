<template>
  <div class="checklist">
    <div v-for="item in items" :key="item.label" class="check-item">
      <div class="split-row">
        <strong>{{ item.label }}</strong>
        <span>{{ item.passed }}/{{ item.total }}</span>
      </div>
      <div class="bar-track">
        <div class="bar-fill" :style="{ width: `${(item.passed / item.total) * 100}%` }" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  items: readonly { label: string; passed: number; total: number }[];
}>();
</script>
