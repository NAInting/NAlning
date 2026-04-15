<template>
  <div>
    <SectionHeader eyebrow="Student / Phase B" title="学生透明性" meta="学生看得见系统保留了什么，也看得见系统不返回什么">
      <template #aside>
        <StatusPill text="透明性页面" />
      </template>
    </SectionHeader>

    <LoadingBlock v-if="profileQuery.isPending.value" />
    <ErrorBanner v-else-if="profileQuery.isError.value" message="学生透明性数据加载失败。" />

    <div v-else-if="profileQuery.data.value" class="grid-2">
      <Panel>
        <TransparencyBlock
          :process-summaries="profileQuery.data.value.recent_process_summaries"
          :has-active-emotion-signal="profileQuery.data.value.has_active_emotion_signal"
          :current-intervention="profileQuery.data.value.current_intervention"
          :retention-notice="profileQuery.data.value.retention_notice"
          :excluded-internal-fields="profileQuery.data.value.excluded_internal_fields"
        />
      </Panel>

      <Panel>
        <h3>当前可见掌握摘要</h3>
        <MasteryList :items="profileQuery.data.value.mastery_summary" />
      </Panel>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";

import { getStudentProfile } from "@/features/student/api";
import MasteryList from "@/features/student/components/MasteryList.vue";
import TransparencyBlock from "@/features/student/components/TransparencyBlock.vue";
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
</script>
