<template>
  <div class="error-banner">{{ message }}</div>
</template>

<script setup lang="ts">
defineProps<{
  message: string;
}>();
</script>
