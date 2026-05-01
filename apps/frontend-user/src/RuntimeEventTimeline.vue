<script setup lang="ts">
import type { AgentRuntimeEventProjection } from "@edu-ai/shared-types";
import { computed } from "vue";

import { formatRuntimeProjectionTimeline } from "./student-runtime-events";

const props = defineProps<{
  events: readonly AgentRuntimeEventProjection[];
}>();

const items = computed(() => formatRuntimeProjectionTimeline(props.events));
</script>

<template>
  <section class="runtime-timeline" aria-label="Nova 本轮运行轨迹">
    <div class="runtime-heading">
      <span class="label">运行轨迹</span>
      <strong>只展示你能看到的步骤</strong>
    </div>

    <p v-if="items.length === 0" class="runtime-empty">这一轮还没有可展示的运行事件。</p>

    <ol v-else class="runtime-list">
      <li v-for="item in items" :key="item.id" class="runtime-item" :class="item.event_type">
        <span class="runtime-badge">{{ item.badge }}</span>
        <div>
          <strong>{{ item.title }}</strong>
          <p>{{ item.body }}</p>
          <small v-if="item.progress_label">{{ item.progress_label }}</small>
          <small v-if="item.source_reference">{{ item.source_reference }}</small>
        </div>
      </li>
    </ol>
  </section>
</template>
