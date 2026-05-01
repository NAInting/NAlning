<template>
  <div class="stack">
    <div class="split-row">
      <div>
        <strong>系统记住了什么</strong>
        <p class="helper-text">学生可见摘要，不返回教师内部判断链。</p>
      </div>
      <StatusPill
        :text="hasActiveEmotionSignal ? '存在活跃情绪信号' : '无活跃情绪信号'"
        :tone="hasActiveEmotionSignal ? 'warning' : 'success'"
      />
    </div>

    <div class="boundary-grid">
      <div class="boundary-block">
        <h3>过程层摘要</h3>
        <div v-for="item in processSummaries" :key="item.summary_id" class="process-card">
          <strong>{{ item.window_type }} / {{ item.window_end }}</strong>
          <p>{{ item.summary_text }}</p>
          <p class="helper-text">
            AI 依赖 {{ item.ai_dependency_score.toFixed(1) }} · No-AI gap
            {{ item.no_ai_gap_score.toFixed(1) }}
          </p>
        </div>
      </div>

      <div class="boundary-block">
        <h3>当前干预状态</h3>
        <p>状态：{{ currentIntervention.status }}</p>
        <p>等级：{{ currentIntervention.current_level }}</p>
        <p>验证时间：{{ currentIntervention.verification_due_at }}</p>
      </div>
    </div>

    <div class="boundary-grid">
      <div class="boundary-block">
        <h3>保留规则</h3>
        <ul class="signal-list">
          <li v-for="item in retentionNotice" :key="item.layer">
            {{ item.layer }} · {{ item.rule }} · {{ item.note }}
          </li>
        </ul>
      </div>

      <div class="boundary-block">
        <h3>默认不返回的字段</h3>
        <ul class="signal-list">
          <li v-for="item in excludedInternalFields" :key="item">{{ item }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import StatusPill from "@/shared/ui/StatusPill.vue";
import type { StudentProfileResponse } from "@/types/demo";

defineProps<{
  processSummaries: StudentProfileResponse["recent_process_summaries"];
  hasActiveEmotionSignal: boolean;
  currentIntervention: StudentProfileResponse["current_intervention"];
  retentionNotice: StudentProfileResponse["retention_notice"];
  excludedInternalFields: readonly string[];
}>();
</script>
