<template>
  <div class="stack">
    <div class="split-row">
      <div>
        <strong>{{ studentName }}</strong>
        <p class="helper-text">这是家长端的派生学习摘要，不返回学生透明性全量数据。</p>
      </div>
      <StatusPill text="派生摘要" />
    </div>
    <SignalList :items="signals" />
  </div>
</template>

<script setup lang="ts">
import SignalList from "@/shared/ui/SignalList.vue";
import StatusPill from "@/shared/ui/StatusPill.vue";

defineProps<{
  studentName: string;
  signals: readonly string[];
}>();
</script>
