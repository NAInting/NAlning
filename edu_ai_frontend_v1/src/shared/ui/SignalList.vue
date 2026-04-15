<template>
  <ul class="signal-list">
    <li v-for="item in items" :key="item">{{ item }}</li>
  </ul>
</template>

<script setup lang="ts">
defineProps<{
  items: readonly string[];
}>();
</script>
