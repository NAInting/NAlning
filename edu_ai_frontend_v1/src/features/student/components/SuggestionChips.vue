<template>
  <div class="chips">
    <button
      v-for="item in items"
      :key="item"
      class="chip"
      type="button"
      @click="$emit('pick', item)"
    >
      {{ item }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  items: readonly string[];
}>();

defineEmits<{
  pick: [value: string];
}>();
</script>
