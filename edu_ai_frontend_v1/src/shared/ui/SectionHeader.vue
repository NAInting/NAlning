<template>
  <header class="section-header">
    <div>
      <p class="eyebrow">{{ eyebrow }}</p>
      <h1>{{ title }}</h1>
      <p v-if="meta" class="section-meta">{{ meta }}</p>
    </div>
    <slot name="aside" />
  </header>
</template>

<script setup lang="ts">
defineProps<{
  eyebrow: string;
  title: string;
  meta?: string;
}>();
</script>
