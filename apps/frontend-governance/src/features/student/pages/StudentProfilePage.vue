<template>
  <div>
    <SectionHeader
      eyebrow="Student / Phase B"
      title="学生透明性"
      meta="你能看到系统记住了什么，也能看到系统默认不返回什么。"
    >
      <template #aside>
        <div class="button-row">
          <RouterLink class="button-secondary" to="/student/home">返回首页</RouterLink>
          <StatusPill text="透明性页面" />
        </div>
      </template>
    </SectionHeader>

    <LoadingBlock v-if="profileQuery.isPending.value" />
    <ErrorBanner v-else-if="profileQuery.isError.value" message="学生透明性数据加载失败。" />
    <EmptyState
      v-else-if="!profileQuery.data.value"
      message="当前还没有可展示的透明性档案。请先在陪学页或首页产生一次学习记录。"
    />

    <div v-else class="stack">
      <div class="grid-2">
        <Panel>
          <TransparencyBlock
            :process-summaries="profile.recent_process_summaries"
            :has-active-emotion-signal="profile.has_active_emotion_signal"
            :current-intervention="profile.current_intervention"
            :retention-notice="profile.retention_notice"
            :excluded-internal-fields="profile.excluded_internal_fields"
          />
        </Panel>

        <Panel>
          <h3>当前可见掌握摘要</h3>
          <MasteryList :items="profile.mastery_summary" />
        </Panel>
      </div>

      <Panel>
        <div class="split-row">
          <div>
            <h3>透明性操作</h3>
            <p class="helper-text">
              以下操作仅影响你的档案，不影响课堂评分。点击后会进入人工复核流程，不会即时生效。
            </p>
          </div>
          <StatusPill text="需人工确认" tone="warning" />
        </div>

        <div class="button-row">
          <button class="button-secondary" type="button" @click="requestAction('withdraw_companion')">
            撤回陪学同意
          </button>
          <button class="button-secondary" type="button" @click="requestAction('export_summary')">
            导出我的摘要
          </button>
          <button class="button-secondary" type="button" @click="requestAction('review_case')">
            申请复核
          </button>
        </div>

        <p v-if="actionFeedback" class="helper-text">{{ actionFeedback }}</p>
      </Panel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { RouterLink } from "vue-router";

import { getStudentProfile } from "@/features/student/api";
import MasteryList from "@/features/student/components/MasteryList.vue";
import TransparencyBlock from "@/features/student/components/TransparencyBlock.vue";
import EmptyState from "@/shared/ui/EmptyState.vue";
import ErrorBanner from "@/shared/ui/ErrorBanner.vue";
import LoadingBlock from "@/shared/ui/LoadingBlock.vue";
import Panel from "@/shared/ui/Panel.vue";
import SectionHeader from "@/shared/ui/SectionHeader.vue";
import StatusPill from "@/shared/ui/StatusPill.vue";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();

const profileQuery = useQuery({
  queryKey: ["student-profile", auth.studentToken],
  queryFn: () => getStudentProfile(auth.studentToken)
});

const profile = computed(() => profileQuery.data.value!);

const actionFeedback = ref("");

const actionNotes: Record<string, string> = {
  withdraw_companion:
    "已记录撤回陪学同意的申请，家长与教师会在 48 小时内人工确认；期间陪学仍走默认校内路径。",
  export_summary:
    "已发起导出请求，将以加密包形式发往你登记的家长邮箱。处理窗口约 24 小时，无 AI 依赖评分原文。",
  review_case:
    "已登记一次人工复核请求，合规员会在 72 小时内回复。复核期间不会中断当前学习任务。"
};

function requestAction(kind: keyof typeof actionNotes) {
  actionFeedback.value = actionNotes[kind];
}
</script>
