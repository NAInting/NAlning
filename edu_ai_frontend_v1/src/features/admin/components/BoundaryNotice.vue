<template>
  <div class="stack">
    <strong>Campus / Cloud 边界</strong>
    <SignalList :items="items" />
  </div>
</template>

<script setup lang="ts">
import SignalList from "@/shared/ui/SignalList.vue";

defineProps<{
  items: readonly string[];
}>();
</script>
