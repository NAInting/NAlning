<template>
  <div class="priority-list">
    <div v-for="item in items" :key="item.student_token" class="priority-item">
      <div class="split-row">
        <div>
          <strong>{{ item.student_token }}</strong>
          <p class="helper-text">{{ item.blockers.join(" / ") }}</p>
        </div>
        <StatusPill
          :text="item.manual_review_required ? '需人工复核' : '可直接执行'"
          :tone="item.manual_review_required ? 'warning' : 'success'"
        />
      </div>
      <p>{{ item.recommended_action }}</p>
      <div class="button-row">
        <RouterLink class="button-secondary" :to="`/teacher/students/${item.student_token}`">
          查看详情
        </RouterLink>
        <RouterLink
          class="button-secondary"
          :to="buildInterventionLink(item.student_token, item.recommended_action)"
        >
          进入干预录入
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";

import StatusPill from "@/shared/ui/StatusPill.vue";
import type { TeacherDailyReportResponse } from "@/types/demo";

const props = defineProps<{
  items: TeacherDailyReportResponse["priority_students"];
  reportId?: string;
}>();

function buildInterventionLink(studentToken: string, action: string) {
  const inferredLevel = action.startsWith("L1")
    ? "L1"
    : action.startsWith("L2")
      ? "L2"
      : "L3";

  return {
    path: "/teacher/interventions/new",
    query: {
      studentToken,
      reportId: props.reportId ?? "rpt_01K300",
      level: inferredLevel,
      triggerType: "misconception"
    }
  };
}
</script>
