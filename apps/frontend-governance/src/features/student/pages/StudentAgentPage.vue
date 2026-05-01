<template>
  <div>
    <SectionHeader
      eyebrow="Student / Phase A"
      title="学生陪学"
      meta="先问再答；高敏会话会自动回落到校内路径。"
    >
      <template #aside>
        <StatusPill :text="routeText" :tone="sessionRoute === 'campus_local' ? 'warning' : 'success'" />
      </template>
    </SectionHeader>

    <div class="grid-2">
      <Panel>
        <div class="split-row">
          <div>
            <h3>陪学会话</h3>
            <p class="helper-text">先说你卡在哪一步，再决定要不要继续提示。</p>
          </div>
          <StatusPill :text="`${messages.length} 条消息`" tone="success" />
        </div>

        <AgentChatThread :messages="messages" />
        <p class="composer-note">
          {{ isSending ? "Student Agent 正在整理下一步…" : "你可以直接点下方推荐，也可以自己输入问题。" }}
        </p>
      </Panel>

      <div class="stack">
        <Panel>
          <div class="notice-card" :class="sessionRoute">
            <strong>{{ routeNotice.title }}</strong>
            <p class="helper-text">{{ routeNotice.body }}</p>
          </div>

          <form class="form-grid" @submit.prevent="handleSend()">
            <label>
              当前输入
              <textarea v-model="draft" rows="4" :disabled="isSending" />
            </label>
            <div class="button-row">
              <button class="button-primary" type="submit" :disabled="isSending">
                {{ isSending ? "处理中…" : "发送" }}
              </button>
              <button
                class="button-secondary"
                type="button"
                :disabled="isSending"
                @click="setDraft('我卡在图像平移这里了')"
              >
                填入教学场景
              </button>
              <button class="button-secondary" type="button" :disabled="isSending" @click="resetSession">
                重新开始
              </button>
            </div>
          </form>
        </Panel>

        <Panel>
          <h3>推荐下一步</h3>
          <SuggestionChips :items="suggestions" @pick="handleSend" />
          <div class="button-row" style="margin-top: 12px;">
            <RouterLink class="button-secondary" to="/student/home">切到无 AI 区</RouterLink>
          </div>
        </Panel>

        <Panel>
          <h3>会话记录</h3>
          <div class="history-list">
            <article v-for="item in sessionHistory" :key="item.id" class="history-item">
              <div class="split-row">
                <strong>{{ item.title }}</strong>
                <StatusPill :text="item.routeLabel" :tone="item.route === 'campus_local' ? 'warning' : 'success'" />
              </div>
              <p class="helper-text">{{ item.time }} · {{ item.note }}</p>
            </article>
          </div>
        </Panel>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { RouterLink } from "vue-router";

import { createStudentAgentSession } from "@/features/student/api";
import AgentChatThread from "@/features/student/components/AgentChatThread.vue";
import SuggestionChips from "@/features/student/components/SuggestionChips.vue";
import Panel from "@/shared/ui/Panel.vue";
import SectionHeader from "@/shared/ui/SectionHeader.vue";
import StatusPill from "@/shared/ui/StatusPill.vue";

type ChatMessage = {
  id: string;
  role: "user" | "agent";
  text: string;
};

type SessionHistoryItem = {
  id: string;
  title: string;
  note: string;
  time: string;
  route: "campus_local" | "controlled_cloud";
  routeLabel: string;
};

const defaultMessages: ChatMessage[] = [
  {
    id: "boot_agent",
    role: "agent",
    text: "我们先不直接给答案。你先告诉我，这道题里你最卡的那一步是什么？"
  }
];

const defaultSuggestions = ["先画一条最简单的抛物线", "先说说 a、h、k 各自代表什么"];

const draft = ref("我卡在图像平移这里了");
const isSending = ref(false);
const sessionRoute = ref<"campus_local" | "controlled_cloud">("controlled_cloud");
const suggestions = ref<string[]>([...defaultSuggestions]);
const messages = ref<ChatMessage[]>([...defaultMessages]);
const sessionHistory = ref<SessionHistoryItem[]>([createInitialHistoryItem()]);

const routeText = computed(() =>
  sessionRoute.value === "campus_local" ? "Campus Local" : "Controlled Cloud"
);

const routeNotice = computed(() =>
  sessionRoute.value === "campus_local"
    ? {
        title: "当前会话已切到校内高敏路径",
        body: "系统会优先保护这段会话，不展示额外推理链，也不会把高敏内容带到云侧。"
      }
    : {
        title: "当前会话处于常规陪学模式",
        body: "系统会继续用苏格拉底式追问帮助你定位卡点，不直接替你完成答案。"
      }
);

async function handleSend(nextMessage?: string) {
  const message = (nextMessage ?? draft.value).trim();
  if (!message || isSending.value) return;

  messages.value.push({
    id: `user_${messages.value.length}`,
    role: "user",
    text: message
  });

  isSending.value = true;

  try {
    const response = await createStudentAgentSession(message);
    sessionRoute.value = response.route_selected;
    suggestions.value = response.follow_up_suggestions;

    messages.value.push({
      id: `agent_${response.session_id}_${messages.value.length}`,
      role: "agent",
      text: response.assistant_message
    });

    sessionHistory.value.unshift({
      id: `${response.session_id}_${sessionHistory.value.length}`,
      title: response.route_selected === "campus_local" ? "高敏会话回落" : "常规陪学往返",
      note:
        response.route_selected === "campus_local"
          ? "检测到敏感表达，已改走校内高敏处理。"
          : "继续常规提示，不直接给答案。",
      time: formatNow(),
      route: response.route_selected,
      routeLabel: response.route_selected === "campus_local" ? "Campus Local" : "Controlled Cloud"
    });
  } finally {
    draft.value = "";
    isSending.value = false;
  }
}

function setDraft(value: string) {
  draft.value = value;
}

function resetSession() {
  draft.value = "我卡在图像平移这里了";
  sessionRoute.value = "controlled_cloud";
  suggestions.value = [...defaultSuggestions];
  messages.value = [...defaultMessages];
  sessionHistory.value = [createInitialHistoryItem()];
}

function createInitialHistoryItem(): SessionHistoryItem {
  return {
    id: "history_boot",
    title: "初始陪学会话",
    note: "先问再答，默认走常规陪学路径。",
    time: formatNow(),
    route: "controlled_cloud",
    routeLabel: "Controlled Cloud"
  };
}

function formatNow() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}
</script>
