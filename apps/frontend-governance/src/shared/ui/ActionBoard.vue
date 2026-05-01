<template>
  <div class="action-board">
    <div v-for="item in items" :key="item.title" class="action-item">
      <strong>{{ item.title }}</strong>
      <p>{{ item.body }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  items: readonly { title: string; body: string }[];
}>();
</script>
