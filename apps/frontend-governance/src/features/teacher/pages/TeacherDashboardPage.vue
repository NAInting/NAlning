<template>
  <div>
    <SectionHeader eyebrow="Teacher / Phase B" title="教师总览" meta="知识点热力、优先学生与建议动作">
      <template #aside>
        <StatusPill text="只展示必要摘要" />
      </template>
    </SectionHeader>

    <LoadingBlock v-if="reportQuery.isPending.value" />
    <ErrorBanner v-else-if="reportQuery.isError.value" message="教师日报加载失败。" />
    <EmptyState
      v-else-if="!reportQuery.data.value"
      message="未找到与当前教师身份关联的日报数据。请确认 teacher_id 已配置。"
    />

    <div v-else class="stack">
      <div class="grid-2">
        <Panel>
          <h3>班级知识点热力图</h3>
          <HeatmapGrid :items="reportQuery.data.value.knowledge_heat" />
        </Panel>

        <Panel>
          <div class="split-row">
            <h3>优先学生</h3>
            <StatusPill text="建议先处理这 2 人" tone="warning" />
          </div>
          <PriorityStudentList
            :items="reportQuery.data.value.priority_students"
            :report-id="reportQuery.data.value.report_id"
          />
        </Panel>
      </div>

      <div class="grid-2">
        <Panel>
          <h3>班级动作板</h3>
          <ActionBoard :items="groupActions" />
        </Panel>

        <Panel>
          <h3>边界提醒</h3>
          <SignalList
            :items="[
              '默认不显示情绪层 signal_type 全文',
              '只显示 teacher_agent_summary 范围内的必要摘要',
              '高敏信息只能升级到 mentor / compliance'
            ]"
          />
        </Panel>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useQuery } from "@tanstack/vue-query";

import { getTeacherDailyReport } from "@/features/teacher/api";
import HeatmapGrid from "@/features/teacher/components/HeatmapGrid.vue";
import PriorityStudentList from "@/features/teacher/components/PriorityStudentList.vue";
import ActionBoard from "@/shared/ui/ActionBoard.vue";
import EmptyState from "@/shared/ui/EmptyState.vue";
import ErrorBanner from "@/shared/ui/ErrorBanner.vue";
import LoadingBlock from "@/shared/ui/LoadingBlock.vue";
import Panel from "@/shared/ui/Panel.vue";
import SectionHeader from "@/shared/ui/SectionHeader.vue";
import SignalList from "@/shared/ui/SignalList.vue";
import StatusPill from "@/shared/ui/StatusPill.vue";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();

const reportQuery = useQuery({
  queryKey: ["teacher-daily-report", auth.teacherId],
  queryFn: () => getTeacherDailyReport(auth.teacherId)
});

const groupActions = computed(() =>
  (reportQuery.data.value?.recommended_group_actions ?? []).map((item, index) => ({
    title: `动作 ${index + 1}`,
    body: item
  }))
);
</script>
