<template>
  <Panel>
    <p class="eyebrow">{{ label }}</p>
    <div class="metric-value">{{ value }}</div>
    <p v-if="note" class="metric-note">{{ note }}</p>
  </Panel>
</template>

<script setup lang="ts">
import Panel from "./Panel.vue";

defineProps<{
  label: string;
  value: string | number;
  note?: string;
}>();
</script>
