<script setup lang="ts">
import { AgentMode } from "@edu-ai/shared-types";
import { computed, ref } from "vue";

import RuntimeEventTimeline from "./RuntimeEventTimeline.vue";
import { buildStudentAgentTurn, type StudentAgentTurnResult } from "./student-agent-runtime";
import { buildStudentRuntimeProjectionDemo } from "./student-runtime-events";

type Mode = AgentMode.MENTOR | AgentMode.TUTOR;
type RouteSelected = StudentAgentTurnResult["route_selected"];

interface ChatMessage {
  id: string;
  speaker: "student" | "agent";
  text: string;
  route?: RouteSelected;
}

let messageSequence = 0;

const mode = ref<Mode>(AgentMode.MENTOR);
const routeSelected = ref<RouteSelected>("controlled_cloud");
const draft = ref("");
const runtimeEvents = buildStudentRuntimeProjectionDemo();
const messages = ref<ChatMessage[]>([
  {
    id: nextMessageId("agent"),
    speaker: "agent",
    text: "我们先不急着算答案。看这条一次函数图像，你觉得斜率 k 先告诉了我们什么？",
    route: "controlled_cloud"
  }
]);

const modeCopy = computed(() => {
  if (mode.value === AgentMode.MENTOR) {
    return {
      title: "导师模式",
      body: "先问一个关键问题，等你尝试后再给更明确的提示。"
    };
  }

  return {
    title: "答疑模式",
    body: "可以直接讲清概念，但不会替你生成可提交答案。"
  };
});

function sendMessage() {
  const text = draft.value.trim();
  if (!text) {
    return;
  }

  const result = buildStudentAgentTurn({
    message: text,
    requested_mode: mode.value,
    previous_student_turns: messages.value.filter((message) => message.speaker === "student").length,
    detected_at: new Date().toISOString()
  });
  const nextRoute = result.route_selected;

  routeSelected.value = nextRoute;
  messages.value.push({ id: nextMessageId("student"), speaker: "student", text, route: nextRoute });
  messages.value.push({
    id: nextMessageId("agent"),
    speaker: "agent",
    text: result.assistant_message,
    route: nextRoute
  });
  draft.value = "";
}

function nextMessageId(prefix: string): string {
  messageSequence += 1;
  return `${prefix}_${messageSequence}`;
}
</script>

<template>
  <main class="app-shell">
    <section class="hero-panel" aria-label="学生学伴首页">
      <div class="topbar">
        <span class="brand">Nova 学伴</span>
        <span class="route-pill" :class="routeSelected">
          {{ routeSelected === "campus_local" ? "校内本地处理" : "受控云路径" }}
        </span>
      </div>

      <div class="hero-copy">
        <p class="eyebrow">初二数学 · 一次函数</p>
        <h1>先把想法说出来，答案晚一点出现。</h1>
        <p>
          Nova 会陪你拆问题、记住学习线索，也会在需要边界时停下来。
        </p>
      </div>

      <div class="mode-switch" aria-label="对话模式选择">
        <button :class="{ active: mode === AgentMode.MENTOR }" @click="mode = AgentMode.MENTOR">导师</button>
        <button :class="{ active: mode === AgentMode.TUTOR }" @click="mode = AgentMode.TUTOR">答疑</button>
      </div>
    </section>

    <section class="workspace">
      <aside class="learning-context" aria-label="学习上下文">
        <div>
          <span class="label">当前知识点</span>
          <h2>斜率 k 的意义</h2>
          <p>掌握度 78%，但图像到表达式的转换还需要一次 No-AI 复盘。</p>
        </div>

        <div class="trace-card">
          <span class="label">模式规则</span>
          <strong>{{ modeCopy.title }}</strong>
          <p>{{ modeCopy.body }}</p>
        </div>

        <a class="no-ai-link" href="#no-ai">切到无 AI 区</a>

        <RuntimeEventTimeline :events="runtimeEvents" />
      </aside>

      <section class="chat-surface" aria-label="学生 Agent 对话">
        <div class="messages">
          <article
            v-for="message in messages"
            :key="message.id"
            class="message"
            :class="[message.speaker, message.route]"
          >
            <span>{{ message.speaker === "agent" ? "Nova" : "你" }}</span>
            <p>{{ message.text }}</p>
          </article>
        </div>

        <form class="composer" @submit.prevent="sendMessage">
          <textarea v-model="draft" rows="3" placeholder="把你现在卡住的一句话写下来..." />
          <button type="submit">发送</button>
        </form>
      </section>
    </section>
  </main>
</template>
