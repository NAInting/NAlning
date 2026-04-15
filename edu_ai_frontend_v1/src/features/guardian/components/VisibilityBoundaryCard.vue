<template>
  <div class="boundary-grid">
    <div v-for="section in sections" :key="section.label" class="boundary-block">
      <h3>{{ section.label }}</h3>
      <SignalList :items="section.items" />
    </div>
  </div>
</template>

<script setup lang="ts">
import SignalList from "@/shared/ui/SignalList.vue";

defineProps<{
  sections: readonly { label: string; items: readonly string[] }[];
}>();
</script>
