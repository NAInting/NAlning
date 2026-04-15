<template>
  <span class="status-pill" :class="tone">{{ text }}</span>
</template>

<script setup lang="ts">
defineProps<{
  text: string;
  tone?: "success" | "warning" | "danger";
}>();
</script>
