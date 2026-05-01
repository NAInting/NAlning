<template>
  <div>
    <SectionHeader eyebrow="Teacher / Phase B B6" :title="headerTitle" meta="个体成长雷达、过程层摘要与 No-AI 建议">
      <template #aside>
        <div class="button-row">
          <RouterLink class="button-secondary" to="/teacher/dashboard">返回日报</RouterLink>
          <StatusPill text="P1 页面" />
        </div>
      </template>
    </SectionHeader>

    <LoadingBlock v-if="detailQuery.isPending.value" />
    <ErrorBanner v-else-if="detailQuery.isError.value" message="学生详情加载失败。" />
    <EmptyState
      v-else-if="!detailQuery.data.value"
      message="当前 token 暂无可展示的学生详情，请回日报页重新选择。"
    />

    <div v-else class="stack">
      <div class="grid-2">
        <Panel>
          <h3>成长雷达</h3>
          <RadarProfileCard :scores="detail.radarScores" />
        </Panel>

        <Panel>
          <template v-if="detail.currentIntervention">
            <InterventionPanel
              title="当前干预状态"
              :status="detail.currentIntervention.status"
              :level="detail.currentIntervention.current_level"
              :verification-due-at="detail.currentIntervention.verification_due_at"
              :note="detail.currentIntervention.note"
            />
            <p v-if="detail.currentIntervention.linked_report_id" class="helper-text">
              来源日报：{{ detail.currentIntervention.linked_report_id }}
            </p>
          </template>
          <template v-else>
            <div class="stack">
              <strong>暂无进行中干预</strong>
              <p class="helper-text">该学生当前没有打开的干预记录，可根据下方建议直接发起新一轮。</p>
            </div>
          </template>
        </Panel>
      </div>

      <div class="grid-2">
        <Panel>
          <h3>当前 blockers</h3>
          <SignalList :items="detail.blockers" />
        </Panel>

        <Panel>
          <h3>No-AI 建议</h3>
          <p>{{ detail.noAiRecommendation }}</p>
        </Panel>
      </div>

      <Panel>
        <h3>过程层摘要</h3>
        <div class="stack">
          <div
            v-for="item in detail.recentProcessSummaries"
            :key="item.summaryId"
            class="process-card"
          >
            <strong>{{ item.summaryId }}</strong>
            <p>{{ item.summaryText }}</p>
            <p class="helper-text">
              AI 依赖 {{ item.aiDependencyScore.toFixed(1) }} · No-AI gap {{ item.noAiGapScore.toFixed(1) }}
            </p>
          </div>
        </div>
      </Panel>

      <Panel>
        <div class="split-row">
          <div>
            <h3>发起新一轮干预</h3>
            <p class="helper-text">
              将按当前建议 {{ suggestedLevel }} · {{ suggestedTriggerLabel }} 预填录入表单，
              来源日报 {{ suggestedReportId }}。
            </p>
          </div>
          <StatusPill :text="suggestedLevel" tone="warning" />
        </div>
        <div class="button-row">
          <RouterLink class="button-primary" :to="interventionCreateLink">
            进入干预录入
          </RouterLink>
          <RouterLink class="button-secondary" to="/teacher/dashboard">
            返回日报
          </RouterLink>
        </div>
      </Panel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { RouterLink, useRoute } from "vue-router";

import { getTeacherStudentDetail } from "@/features/teacher/api";
import InterventionPanel from "@/features/teacher/components/InterventionPanel.vue";
import RadarProfileCard from "@/features/teacher/components/RadarProfileCard.vue";
import EmptyState from "@/shared/ui/EmptyState.vue";
import ErrorBanner from "@/shared/ui/ErrorBanner.vue";
import LoadingBlock from "@/shared/ui/LoadingBlock.vue";
import Panel from "@/shared/ui/Panel.vue";
import SectionHeader from "@/shared/ui/SectionHeader.vue";
import SignalList from "@/shared/ui/SignalList.vue";
import StatusPill from "@/shared/ui/StatusPill.vue";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const route = useRoute();
const studentToken = computed(() => String(route.params.studentToken ?? "stu_tok_9f3a"));

const detailQuery = useQuery({
  queryKey: ["teacher-student-detail", auth.teacherId, studentToken],
  queryFn: () => getTeacherStudentDetail(auth.teacherId, studentToken.value)
});

const detail = computed(() => detailQuery.data.value!);

const headerTitle = computed(() =>
  detailQuery.data.value ? `${detailQuery.data.value.displayName} · 学生详情` : "学生详情"
);

const suggestedLevel = computed(
  () => detail.value?.recommendedInterventionLevel ?? "L2"
);

const suggestedReportId = computed(
  () => detail.value?.sourceReportId ?? "rpt_01K300"
);

const triggerLabelMap: Record<string, string> = {
  misconception: "知识误解",
  ai_overreliance: "AI 依赖过度",
  emotion_signal: "情绪信号"
};

const suggestedTriggerLabel = computed(() => {
  const key = detail.value?.recommendedTriggerType ?? "misconception";
  return triggerLabelMap[key] ?? key;
});

const interventionCreateLink = computed(() => ({
  path: "/teacher/interventions/new",
  query: {
    studentToken: studentToken.value,
    reportId: suggestedReportId.value,
    level: suggestedLevel.value,
    triggerType: detail.value?.recommendedTriggerType ?? "misconception"
  }
}));
</script>
