<template>
  <div class="radar-list">
    <div v-for="item in scores" :key="item.axis" class="radar-item">
      <div class="split-row">
        <strong>{{ item.axis }}</strong>
        <span>{{ item.value.toFixed(1) }}</span>
      </div>
      <div class="bar-track">
        <div class="bar-fill" :style="{ width: `${item.value}%` }" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  scores: readonly { axis: string; value: number }[];
}>();
</script>
