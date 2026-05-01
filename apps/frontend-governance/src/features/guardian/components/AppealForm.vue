<template>
  <form class="stack" @submit.prevent="onSubmit">
    <div class="field-row">
      <label>申诉对象</label>
      <select v-model="form.target_type" required>
        <option value="ai_scoring">AI 评分</option>
        <option value="agent_behavior">Agent 行为</option>
        <option value="teacher_intervention">教师干预</option>
      </select>
    </div>

    <div class="field-row">
      <label>目标 ID</label>
      <input
        v-model.trim="form.target_ref"
        placeholder="如 sum_demo_001 / int_01K400 / sess_01K100"
        required
      />
    </div>

    <div class="field-row">
      <label>申诉理由</label>
      <textarea
        v-model.trim="form.reason"
        rows="3"
        placeholder="说明你认为不合适的原因，将由管理员人工 review"
        required
      />
    </div>

    <p v-if="lastError" class="helper-text danger">{{ lastError }}</p>

    <div class="button-row">
      <button class="button-primary" type="submit" :disabled="submitting">
        {{ submitting ? "提交中…" : "提交申诉" }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";

import type { AppealTargetType } from "@/types/demo";

const props = defineProps<{
  studentToken: string;
}>();

const emit = defineEmits<{
  submit: [
    payload: {
      target_type: AppealTargetType;
      target_ref: string;
      reason: string;
      student_token: string;
    }
  ];
}>();

const form = reactive<{
  target_type: AppealTargetType;
  target_ref: string;
  reason: string;
}>({
  target_type: "ai_scoring",
  target_ref: "",
  reason: ""
});

const submitting = ref(false);
const lastError = ref<string | null>(null);

async function onSubmit() {
  if (!form.reason || !form.target_ref) {
    lastError.value = "请填写目标 ID 和申诉理由。";
    return;
  }
  if (!props.studentToken) {
    lastError.value = "未绑定学生 token，无法提交。";
    return;
  }
  lastError.value = null;
  submitting.value = true;
  try {
    emit("submit", {
      target_type: form.target_type,
      target_ref: form.target_ref,
      reason: form.reason,
      student_token: props.studentToken
    });
    form.target_ref = "";
    form.reason = "";
  } finally {
    submitting.value = false;
  }
}
</script>
