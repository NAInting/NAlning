<template>
  <div class="appeal-row">
    <div class="split-row">
      <div>
        <strong>{{ targetLabel(item.target_type) }}</strong>
        <p class="helper-text">{{ item.appeal_id }} · target_ref：{{ item.target_ref }}</p>
      </div>
      <StatusPill :text="statusLabel(item.status)" :tone="statusTone(item.status)" />
    </div>

    <p>{{ item.reason }}</p>
    <p class="helper-text">
      家长：{{ item.guardian_id }} · 学生：{{ item.student_token }}
    </p>
    <p class="helper-text">
      提交：{{ item.submitted_at }} · 最近更新：{{ item.last_updated_at }}
    </p>
    <p v-if="item.manual_review_required" class="helper-text warning">
      ⚑ 涉及自动评分 / 自动建议 — resolve 必须勾选「人工 review 已确认」。
    </p>

    <div v-if="item.status === 'submitted'" class="button-row">
      <button class="button-primary" type="button" @click="advance('under_review')">受理</button>
    </div>

    <div v-else-if="item.status === 'under_review'" class="stack">
      <div class="field-row">
        <label>答复说明（resolve 必填）</label>
        <textarea v-model.trim="resolutionNote" rows="2" placeholder="给家长的人工答复" />
      </div>
      <label v-if="item.manual_review_required" class="checkbox-row">
        <input v-model="manualReviewConfirmed" type="checkbox" />
        我已人工 review，确认可以闭环
      </label>
      <p v-if="errorText" class="helper-text danger">{{ errorText }}</p>
      <div class="button-row">
        <button class="button-primary" type="button" @click="onResolve">答复并关闭</button>
        <button class="button-secondary" type="button" @click="advance('escalated')">升级</button>
      </div>
    </div>

    <p v-else class="helper-text">该申诉已闭环，不可再推进。</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

import StatusPill from "@/shared/ui/StatusPill.vue";
import type { AppealItem, AppealStatus, AppealTargetType } from "@/types/demo";

const props = defineProps<{
  item: AppealItem;
}>();

const emit = defineEmits<{
  advance: [
    payload: {
      appeal_id: string;
      next_status: Exclude<AppealStatus, "submitted">;
      resolution_note?: string;
      manual_review_confirmed?: boolean;
    }
  ];
}>();

const resolutionNote = ref("");
const manualReviewConfirmed = ref(false);
const errorText = ref<string | null>(null);

function advance(next: Exclude<AppealStatus, "submitted">) {
  errorText.value = null;
  emit("advance", { appeal_id: props.item.appeal_id, next_status: next });
}

function onResolve() {
  if (!resolutionNote.value) {
    errorText.value = "答复说明不能为空。";
    return;
  }
  if (props.item.manual_review_required && !manualReviewConfirmed.value) {
    errorText.value = "该申诉强制人工 review，请先勾选确认。";
    return;
  }
  errorText.value = null;
  emit("advance", {
    appeal_id: props.item.appeal_id,
    next_status: "resolved",
    resolution_note: resolutionNote.value,
    manual_review_confirmed: manualReviewConfirmed.value
  });
}

function targetLabel(type: AppealTargetType): string {
  switch (type) {
    case "ai_scoring":
      return "AI 评分";
    case "agent_behavior":
      return "Agent 行为";
    case "teacher_intervention":
      return "教师干预";
    default:
      return type;
  }
}

function statusLabel(status: AppealStatus): string {
  switch (status) {
    case "submitted":
      return "待受理";
    case "under_review":
      return "处理中";
    case "resolved":
      return "已答复";
    case "escalated":
      return "已升级";
    default:
      return status;
  }
}

function statusTone(status: AppealStatus): "success" | "warning" | "danger" | undefined {
  switch (status) {
    case "submitted":
      return "warning";
    case "under_review":
      return undefined;
    case "resolved":
      return "success";
    case "escalated":
      return "danger";
    default:
      return undefined;
  }
}
</script>
