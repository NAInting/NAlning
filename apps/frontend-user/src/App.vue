<script setup lang="ts">
import { AgentMode } from "@edu-ai/shared-types";
import { computed, ref } from "vue";

import {
  canShowEvidenceAiPrompts,
  chineseL001DemoCourse,
  isNoAiDemoPage,
  misconceptionLabels,
  type DemoPage,
  type DemoPageId
} from "./chinese-l001-demo-course";
import RuntimeEventTimeline from "./RuntimeEventTimeline.vue";
import { buildStudentAgentTurn, type StudentAgentTurnResult } from "./student-agent-runtime";
import { buildStudentRuntimeProjectionDemo } from "./student-runtime-events";

type ReadingMarkType = "停顿" | "重音" | "放慢" | "语气上扬";
type ExitTaskMode = "oral_40s" | "draft_120";
type WhiteboardLayer = "imagery" | "middle" | "spirit";

interface EvidenceCardState {
  id: string;
  anchorId: string;
  seen: string;
  middleLayer: string;
  judgment: string;
}

interface WhiteboardCardState {
  id: string;
  title: string;
  layer: WhiteboardLayer;
}

const course = chineseL001DemoCourse;
const firstPage = course.pages[0];
if (!firstPage) {
  throw new Error("Chinese L001 demo course must include at least one page.");
}

const selectedPageId = ref<DemoPageId>(firstPage.pageId);
const firstResponse = ref("");
const readingMarkType = ref<ReadingMarkType>("停顿");
const readingAnchorId = ref("T2");
const evidenceCards = ref<EvidenceCardState[]>([
  { id: "card_1", anchorId: "T2", seen: "色彩很亮，画面不是萧瑟的", middleLayer: "色彩", judgment: "" },
  { id: "card_2", anchorId: "T3", seen: "", middleLayer: "动作", judgment: "" },
  { id: "card_3", anchorId: "T4", seen: "", middleLayer: "空间", judgment: "" }
]);
const studentClaim = ref("我看到的不是普通秋景，因为 T2 让我看到画面里有明亮的色彩和向外展开的力量。");
const aiTurnResult = ref<StudentAgentTurnResult | null>(null);
const selectedMisconception = ref<keyof typeof misconceptionLabels>("theme_without_evidence");
const misconceptionAnchorId = ref("T3");
const whiteboardCards = ref<WhiteboardCardState[]>([
  { id: "wb_1", title: "秋景意象组 A", layer: "imagery" },
  { id: "wb_2", title: "色彩明亮 / 空间开阔", layer: "middle" },
  { id: "wb_3", title: "昂扬、有力量的精神气象", layer: "spirit" }
]);
const exitTaskMode = ref<ExitTaskMode>("draft_120");
const exitCompleted = ref(false);
const revisionNote = ref("我补了一个文本锚点，并说明它和精神气象之间的关系。");

const runtimeEvents = buildStudentRuntimeProjectionDemo();

const selectedPage = computed<DemoPage>(() => {
  return course.pages.find((page) => page.pageId === selectedPageId.value) ?? firstPage;
});

const selectedPageIndex = computed(() => course.pages.findIndex((page) => page.pageId === selectedPageId.value));
const completedPageIds = computed(() => new Set(course.pages.filter((page) => isPageComplete(page.pageId)).map((page) => page.pageId)));
const completedCount = computed(() => completedPageIds.value.size);
const progressPercent = computed(() => Math.round((completedCount.value / course.pages.length) * 100));
const currentPageCompleted = computed(() => completedPageIds.value.has(selectedPage.value.pageId));
const noAiActive = computed(() => isNoAiDemoPage(selectedPage.value));
const completedEvidenceAnchorCount = computed(
  () => evidenceCards.value.filter((card) => card.anchorId && card.seen.trim().length > 0).length
);
const evidenceAiPromptsVisible = computed(() => canShowEvidenceAiPrompts(completedEvidenceAnchorCount.value));
const whiteboardLayers = computed(() => ({
  imagery: whiteboardCards.value.filter((card) => card.layer === "imagery"),
  middle: whiteboardCards.value.filter((card) => card.layer === "middle"),
  spirit: whiteboardCards.value.filter((card) => card.layer === "spirit")
}));
const teacherSafeRows = computed(() => [
  { label: "第一感受完成率", value: `${Math.round(course.teacherPreview.classSummary.firstResponseCompletionRate * 100)}%` },
  { label: "意象卡完成率", value: `${Math.round(course.teacherPreview.classSummary.imageryCardCompletionRate * 100)}%` },
  { label: "No-AI 出口完成率", value: `${Math.round(course.teacherPreview.classSummary.noAiExitCompletionRate * 100)}%` }
]);

function selectPage(pageId: DemoPageId): void {
  selectedPageId.value = pageId;
}

function nextPage(): void {
  const next = course.pages[selectedPageIndex.value + 1];
  if (next) {
    selectedPageId.value = next.pageId;
  }
}

function previousPage(): void {
  const previous = course.pages[selectedPageIndex.value - 1];
  if (previous) {
    selectedPageId.value = previous.pageId;
  }
}

function runAiFollowUp(): void {
  aiTurnResult.value = buildStudentAgentTurn({
    message: studentClaim.value,
    requested_mode: AgentMode.MENTOR,
    previous_student_turns: 1,
    detected_at: "2026-05-01T10:00:00.000Z"
  });
}

function moveWhiteboardCard(cardId: string, layer: WhiteboardLayer): void {
  const card = whiteboardCards.value.find((item) => item.id === cardId);
  if (card) {
    card.layer = layer;
  }
}

function isPageComplete(pageId: DemoPageId): boolean {
  switch (pageId) {
    case "P01":
      return firstResponse.value.trim().length >= 10;
    case "P02":
      return Boolean(readingMarkType.value && readingAnchorId.value);
    case "P03":
      return completedEvidenceAnchorCount.value >= 2;
    case "P04":
      return studentClaim.value.trim().length >= 12;
    case "P05":
      return Boolean(selectedMisconception.value && misconceptionAnchorId.value);
    case "P06":
      return Object.values(whiteboardLayers.value).every((items) => items.length > 0);
    case "P07":
      return exitCompleted.value && revisionNote.value.trim().length > 0;
  }
}
</script>

<template>
  <main class="course-app">
    <header class="course-top" aria-label="语文 L001 前端主演示">
      <div>
        <span class="brand">Nova 语文课</span>
        <p class="eyebrow">{{ course.identity.grade }} · {{ course.identity.subject }} · {{ course.identity.durationMinutes }} 分钟</p>
      </div>
      <div class="safety-strip" aria-label="演示安全状态">
        <span>Mock only</span>
        <span>不写回课程源</span>
        <span>不接真实 provider</span>
        <span>无真实学生数据</span>
      </div>
    </header>

    <section class="course-brief" aria-label="课程概要">
      <div class="brief-copy">
        <p class="eyebrow">主演示课程 · {{ course.sourceLessonId }}</p>
        <h1>{{ course.identity.topic }}</h1>
        <p class="big-question">{{ course.identity.bigQuestion }}</p>
      </div>
      <div class="progress-panel" aria-label="学习进度">
        <span>{{ completedCount }}/{{ course.pages.length }} steps</span>
        <strong>{{ progressPercent }}%</strong>
        <div class="progress-track"><i :style="{ width: `${progressPercent}%` }" /></div>
      </div>
    </section>

    <section class="workspace-grid">
      <nav class="page-rail" aria-label="课程页面导航">
        <button
          v-for="page in course.pages"
          :key="page.pageId"
          type="button"
          :class="{ active: page.pageId === selectedPage.pageId, complete: completedPageIds.has(page.pageId) }"
          @click="selectPage(page.pageId)"
        >
          <span>{{ page.pageId }}</span>
          <strong>{{ page.title }}</strong>
        </button>
      </nav>

      <section class="learning-stage" aria-label="学生学习工作台">
        <div class="stage-header">
          <div>
            <p class="eyebrow">{{ selectedPage.pageId }} · {{ selectedPage.ui }}</p>
            <h2>{{ selectedPage.title }}</h2>
            <p>{{ selectedPage.studentAction }}</p>
          </div>
          <span class="state-pill" :class="{ noai: noAiActive }">
            {{ noAiActive ? "No-AI 区" : "AI 后追问" }}
          </span>
        </div>

        <div v-if="selectedPage.pageId === 'P01'" class="interaction-stack">
          <label class="field-block">
            <span>30-50 字第一感受</span>
            <textarea
              v-model="firstResponse"
              rows="5"
              placeholder="先写自己的第一眼感受，不查资料、不问 AI。"
            />
          </label>
          <div class="boundary-note">教师看板只看到完成状态和聚合关键词，不显示这段原文。</div>
        </div>

        <div v-else-if="selectedPage.pageId === 'P02'" class="interaction-stack">
          <div class="choice-row" aria-label="诵读标注类型">
            <button
              v-for="mark in ['停顿', '重音', '放慢', '语气上扬']"
              :key="mark"
              type="button"
              :class="{ active: readingMarkType === mark }"
              @click="readingMarkType = mark as ReadingMarkType"
            >
              {{ mark }}
            </button>
          </div>
          <label class="field-block">
            <span>绑定文本锚点</span>
            <select v-model="readingAnchorId">
              <option v-for="anchor in course.authorizedTextAnchorPolicy.anchors" :key="anchor.id" :value="anchor.id">
                {{ anchor.id }} · {{ anchor.label }}
              </option>
            </select>
          </label>
          <div class="prompt-list">
            <span v-for="prompt in selectedPage.allowedAiPrompts" :key="prompt">{{ prompt }}</span>
          </div>
        </div>

        <div v-else-if="selectedPage.pageId === 'P03'" class="evidence-grid">
          <article v-for="card in evidenceCards" :key="card.id" class="evidence-card">
            <label>
              <span>证据锚点</span>
              <select v-model="card.anchorId">
                <option v-for="anchor in course.authorizedTextAnchorPolicy.anchors" :key="anchor.id" :value="anchor.id">
                  {{ anchor.id }} · {{ anchor.label }}
                </option>
              </select>
            </label>
            <label>
              <span>看到什么</span>
              <input v-model="card.seen" placeholder="只写你看见的画面或动作" />
            </label>
            <label>
              <span>动作/色彩/空间</span>
              <input v-model="card.middleLayer" placeholder="中间层" />
            </label>
            <label>
              <span>情绪/气象判断</span>
              <input v-model="card.judgment" placeholder="先别急着背主题" />
            </label>
          </article>
          <div class="ai-gate" :class="{ open: evidenceAiPromptsVisible }">
            <strong>{{ evidenceAiPromptsVisible ? "AI 追问已开放" : "先完成至少 2 个证据锚点" }}</strong>
            <p v-if="!evidenceAiPromptsVisible">这里体现“学生先写，AI 后追问”。</p>
            <div v-else class="prompt-list">
              <span v-for="prompt in selectedPage.allowedAiPrompts" :key="prompt">{{ prompt }}</span>
            </div>
          </div>
        </div>

        <div v-else-if="selectedPage.pageId === 'P04'" class="interaction-stack">
          <div class="role-row">
            <span v-for="role in selectedPage.aiRoles" :key="role">{{ role }}</span>
          </div>
          <label class="field-block">
            <span>学生先表达</span>
            <textarea v-model="studentClaim" rows="4" />
          </label>
          <button class="primary-action" type="button" @click="runAiFollowUp">生成一次安全追问</button>
          <div v-if="aiTurnResult" class="agent-reply" :class="aiTurnResult.route_selected">
            <strong>{{ aiTurnResult.route_selected === "campus_local" ? "校内本地处理" : "受控云路径" }}</strong>
            <p>{{ aiTurnResult.assistant_message }}</p>
          </div>
        </div>

        <div v-else-if="selectedPage.pageId === 'P05'" class="interaction-stack">
          <div class="misconception-grid">
            <button
              v-for="misconception in selectedPage.misconceptions"
              :key="misconception"
              type="button"
              :class="{ active: selectedMisconception === misconception }"
              @click="selectedMisconception = misconception as keyof typeof misconceptionLabels"
            >
              {{ misconceptionLabels[misconception as keyof typeof misconceptionLabels] }}
            </button>
          </div>
          <label class="field-block">
            <span>补一个证据锚点</span>
            <select v-model="misconceptionAnchorId">
              <option v-for="anchor in course.authorizedTextAnchorPolicy.anchors" :key="anchor.id" :value="anchor.id">
                {{ anchor.id }} · {{ anchor.label }}
              </option>
            </select>
          </label>
        </div>

        <div v-else-if="selectedPage.pageId === 'P06'" class="whiteboard">
          <section v-for="layer in ['imagery', 'middle', 'spirit']" :key="layer" class="whiteboard-column">
            <h3>{{ layer === "imagery" ? "意象" : layer === "middle" ? "动作/色彩/空间" : "情绪/精神气象" }}</h3>
            <article v-for="card in whiteboardLayers[layer as WhiteboardLayer]" :key="card.id" class="board-card">
              <strong>{{ card.title }}</strong>
              <div>
                <button type="button" @click="moveWhiteboardCard(card.id, 'imagery')">意象</button>
                <button type="button" @click="moveWhiteboardCard(card.id, 'middle')">中间层</button>
                <button type="button" @click="moveWhiteboardCard(card.id, 'spirit')">气象</button>
              </div>
            </article>
          </section>
        </div>

        <div v-else class="interaction-stack">
          <div class="choice-row" aria-label="出口任务类型">
            <button type="button" :class="{ active: exitTaskMode === 'oral_40s' }" @click="exitTaskMode = 'oral_40s'">
              40 秒口头解释
            </button>
            <button type="button" :class="{ active: exitTaskMode === 'draft_120' }" @click="exitTaskMode = 'draft_120'">
              120 字一稿
            </button>
          </div>
          <label class="check-line">
            <input v-model="exitCompleted" type="checkbox" />
            <span>已在关闭 AI 后完成第一稿或口头解释</span>
          </label>
          <label class="field-block">
            <span>修订说明</span>
            <textarea v-model="revisionNote" rows="4" placeholder="只记录修订理由，不保存原始语音或完整转写。" />
          </label>
        </div>

        <footer class="stage-actions">
          <button type="button" :disabled="selectedPageIndex <= 0" @click="previousPage">上一页</button>
          <span :class="{ done: currentPageCompleted }">{{ currentPageCompleted ? "本页证据已形成" : "本页仍需补证据" }}</span>
          <button type="button" :disabled="selectedPageIndex >= course.pages.length - 1" @click="nextPage">下一页</button>
        </footer>

        <RuntimeEventTimeline :events="runtimeEvents" />
      </section>

      <aside class="inspector" aria-label="安全边界与教师预览">
        <section>
          <p class="eyebrow">文本锚点</p>
          <ul class="anchor-list">
            <li v-for="anchor in course.authorizedTextAnchorPolicy.anchors" :key="anchor.id">
              <strong>{{ anchor.id }}</strong>
              <span>{{ anchor.label }}</span>
              <small>{{ anchor.purpose }}</small>
            </li>
          </ul>
        </section>

        <section>
          <p class="eyebrow">当前边界</p>
          <div class="boundary-list">
            <span v-for="item in selectedPage.privacy" :key="item">{{ item }}</span>
          </div>
          <div v-if="selectedPage.forbiddenAiActions" class="boundary-list warning">
            <span v-for="item in selectedPage.forbiddenAiActions" :key="item">{{ item }}</span>
          </div>
        </section>

        <section>
          <p class="eyebrow">教师安全预览</p>
          <div class="metric-row" v-for="row in teacherSafeRows" :key="row.label">
            <span>{{ row.label }}</span>
            <strong>{{ row.value }}</strong>
          </div>
          <ul class="action-list">
            <li v-for="action in course.teacherPreview.suggestedTeacherActions" :key="action">{{ action }}</li>
          </ul>
        </section>

        <section>
          <p class="eyebrow">禁止展示</p>
          <div class="forbidden-grid">
            <span v-for="field in course.teacherPreview.forbiddenFields" :key="field">{{ field }}</span>
          </div>
        </section>
      </aside>
    </section>
  </main>
</template>
