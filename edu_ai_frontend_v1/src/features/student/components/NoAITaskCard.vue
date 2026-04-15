<template>
  <div class="stack">
    <div class="split-row">
      <div>
        <strong>No-AI 基线任务</strong>
        <p class="helper-text">最近一次完成：{{ baseline.latest_completed_at }}</p>
      </div>
      <StatusPill :text="statusText" :tone="statusTone" />
    </div>

    <p>{{ baseline.notes }}</p>

    <div class="notice-card" :class="taskState">
      <strong>{{ stateHeadline }}</strong>
      <p class="helper-text">{{ stateBody }}</p>
    </div>

    <div class="button-row">
      <button
        v-if="taskState === 'pending'"
        class="button-primary"
        type="button"
        @click="startTask"
      >
        开始 3 分钟口头复盘
      </button>
      <button
        v-else-if="taskState === 'in_progress'"
        class="button-primary"
        type="button"
        @click="completeTask"
      >
        标记已完成
      </button>
      <button v-else class="button-primary" type="button" @click="restartTask">
        再做一次
      </button>

      <button class="button-secondary" type="button" @click="openIndependentTask">
        查看独立任务清单
      </button>
    </div>

    <p v-if="actionFeedback" class="helper-text">{{ actionFeedback }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

import StatusPill from "@/shared/ui/StatusPill.vue";

const props = defineProps<{
  baseline: {
    latest_completed_at: string;
    gap_score: number;
    notes: string;
  };
}>();

const taskState = ref<"pending" | "in_progress" | "completed">("pending");
const actionFeedback = ref("");

const statusText = computed(() => {
  if (taskState.value === "completed") {
    return "已完成一轮";
  }

  if (taskState.value === "in_progress") {
    return "进行中";
  }

  return `Gap ${props.baseline.gap_score.toFixed(1)}`;
});

const statusTone = computed(() => {
  if (taskState.value === "completed") return "success";
  if (taskState.value === "in_progress") return "warning";
  return props.baseline.gap_score >= 20 ? "warning" : "success";
});

const stateHeadline = computed(() => {
  if (taskState.value === "completed") {
    return "这轮 No-AI 任务已结束";
  }

  if (taskState.value === "in_progress") {
    return "现在只做独立解释，不看提示";
  }

  return "建议先做最小独立任务，再回来看 AI 提示";
});

const stateBody = computed(() => {
  if (taskState.value === "completed") {
    return "下一步可以回到掌握度地图，对比这次独立完成和陪学后的差别。";
  }

  if (taskState.value === "in_progress") {
    return "尝试用自己的话复述 3 分钟，只解释一个关键点，不求一步讲全。";
  }

  return "Gap 还偏高时，先做短时独立复盘，能更快看出哪些知识是真掌握了。";
});

function startTask() {
  taskState.value = "in_progress";
  actionFeedback.value = "";
}

function completeTask() {
  taskState.value = "completed";
  actionFeedback.value = "";
}

function restartTask() {
  taskState.value = "pending";
  actionFeedback.value = "";
}

function openIndependentTask() {
  actionFeedback.value = "当前版本先在首页完成 No-AI 任务，Phase B 会拆成独立任务清单页。";
}
</script>
