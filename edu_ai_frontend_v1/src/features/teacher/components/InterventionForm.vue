<template>
  <form class="form-grid" @submit.prevent="submitForm">
    <label>
      学生 token
      <input v-model="form.student_token" />
    </label>
    <label>
      linked_report_id
      <input v-model="form.linked_report_id" />
    </label>
    <label>
      干预等级
      <select v-model="form.intervention_level">
        <option value="L1">L1</option>
        <option value="L2">L2</option>
        <option value="L3">L3</option>
        <option value="L4">L4</option>
        <option value="L5">L5</option>
      </select>
    </label>
    <label>
      触发类型
      <select v-model="form.trigger_type">
        <option value="misconception">misconception</option>
        <option value="ai_dependency">ai_dependency</option>
        <option value="ai_overreliance">ai_overreliance</option>
        <option value="no_ai_gap">no_ai_gap</option>
        <option value="emotion_signal">emotion_signal</option>
      </select>
    </label>
    <label>
      干预动作
      <textarea v-model="form.action_taken" rows="4" />
    </label>
    <label>
      验证时间
      <input v-model="form.verification_due_at" type="datetime-local" />
    </label>
    <div class="button-row">
      <button class="button-primary" type="submit">提交干预</button>
      <button class="button-secondary" type="button" @click="resetForm">重置</button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive } from "vue";

const props = withDefaults(
  defineProps<{
    defaultStudentToken: string;
    defaultLinkedReportId?: string;
    defaultInterventionLevel?: string;
    defaultTriggerType?: string;
    defaultActionTaken?: string;
  }>(),
  {
    defaultLinkedReportId: "rpt_01K300",
    defaultInterventionLevel: "L2",
    defaultTriggerType: "misconception",
    defaultActionTaken: "15 分钟小组纠错 + 1 次 No-AI 口头复盘"
  }
);

const emit = defineEmits<{
  submit: [payload: {
    student_token: string;
    linked_report_id: string;
    intervention_level: string;
    trigger_type: string;
    action_taken: string;
    verification_due_at: string;
  }];
}>();

const initialState = () => ({
  student_token: props.defaultStudentToken,
  linked_report_id: props.defaultLinkedReportId,
  intervention_level: props.defaultInterventionLevel,
  trigger_type: props.defaultTriggerType,
  action_taken: props.defaultActionTaken,
  verification_due_at: "2026-04-14T17:00"
});

const form = reactive(initialState());

function submitForm() {
  emit("submit", { ...form });
}

function resetForm() {
  Object.assign(form, initialState());
}
</script>
