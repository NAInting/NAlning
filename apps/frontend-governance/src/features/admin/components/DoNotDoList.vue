<template>
  <div class="stack">
    <strong>默认不做清单</strong>
    <SignalList :items="items" />
  </div>
</template>

<script setup lang="ts">
import SignalList from "@/shared/ui/SignalList.vue";

defineProps<{
  items: readonly string[];
}>();
</script>
