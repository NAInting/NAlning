<template>
  <div>
    <SectionHeader eyebrow="Teacher / Phase B B6" title="干预录入" meta="提交 L1-L5 干预，形成可追溯闭环">
      <template #aside>
        <StatusPill text="P0 页面" tone="warning" />
      </template>
    </SectionHeader>

    <div class="grid-2">
      <Panel>
        <h3>录入表单</h3>
        <InterventionForm
          :default-student-token="defaultStudentToken"
          :default-linked-report-id="defaultLinkedReportId"
          :default-intervention-level="defaultInterventionLevel"
          :default-trigger-type="defaultTriggerType"
          @submit="handleSubmit"
        />
      </Panel>

      <Panel>
        <p v-if="lastError" class="helper-text danger">{{ lastError }}</p>
        <InterventionPanel
          :title="result ? '已创建干预' : '等待提交'"
          :status="result?.status ?? 'draft'"
          :level="submittedLevel"
          :verification-due-at="result?.verification_due_at"
          :note="panelNote"
        />
      </Panel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";

import { createIntervention } from "@/features/teacher/api";
import InterventionForm from "@/features/teacher/components/InterventionForm.vue";
import InterventionPanel from "@/features/teacher/components/InterventionPanel.vue";
import Panel from "@/shared/ui/Panel.vue";
import SectionHeader from "@/shared/ui/SectionHeader.vue";
import StatusPill from "@/shared/ui/StatusPill.vue";
import { useAuthStore } from "@/stores/auth";
import type { InterventionCreateResponse } from "@/types/demo";

const auth = useAuthStore();
const route = useRoute();

const result = ref<InterventionCreateResponse | null>(null);
const lastError = ref<string | null>(null);
const submittedLevel = ref("L2");
const submittedReportId = ref("rpt_01K300");

const defaultStudentToken = computed(() => String(route.query.studentToken ?? auth.studentToken));
const defaultLinkedReportId = computed(() => String(route.query.reportId ?? "rpt_01K300"));
const defaultInterventionLevel = computed(() => String(route.query.level ?? "L2"));
const defaultTriggerType = computed(() => String(route.query.triggerType ?? "misconception"));

const panelNote = computed(() => {
  if (!result.value) {
    return `提交后会返回 verification_due_at，并保留日报关联 ${defaultLinkedReportId.value}。`;
  }

  return `请求 ${result.value.request_id} · linked_report_id ${submittedReportId.value}`;
});

async function handleSubmit(payload: {
  student_token: string;
  linked_report_id: string;
  intervention_level: string;
  trigger_type: string;
  action_taken: string;
  verification_due_at: string;
}) {
  lastError.value = null;
  submittedLevel.value = payload.intervention_level;
  submittedReportId.value = payload.linked_report_id;
  const response = await createIntervention(auth.teacherId, payload);
  if (!response) {
    lastError.value = "创建失败：请确认教师身份及学生归属关系。";
    return;
  }
  result.value = response;
}
</script>
