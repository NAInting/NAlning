<template>
  <div class="stack">
    <div v-for="item in items" :key="item.appeal_id" class="appeal-row">
      <div class="split-row">
        <div>
          <strong>{{ targetLabel(item.target_type) }}</strong>
          <p class="helper-text">target_ref：{{ item.target_ref }}</p>
        </div>
        <StatusPill :text="statusLabel(item.status)" :tone="statusTone(item.status)" />
      </div>
      <p>{{ item.reason }}</p>
      <p class="helper-text">
        提交：{{ item.submitted_at }} · 最近更新：{{ item.last_updated_at }}
      </p>
      <p v-if="item.manual_review_required" class="helper-text warning">
        ⚑ 涉及自动评分 / 自动建议，强制人工 review。
      </p>
      <p v-if="item.resolution_note" class="helper-text">
        管理员答复：{{ item.resolution_note }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import StatusPill from "@/shared/ui/StatusPill.vue";
import type { AppealItem, AppealStatus, AppealTargetType } from "@/types/demo";

defineProps<{
  items: readonly AppealItem[];
}>();

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
