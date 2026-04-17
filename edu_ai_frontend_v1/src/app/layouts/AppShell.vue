<template>
  <div class="layout-shell">
    <aside class="sidebar">
      <h1 class="brand-title">新时代 AI 教育</h1>
      <p class="brand-subtitle">前端 MVP 工程脚手架</p>

      <section class="nav-group">
        <h4>角色切换</h4>
        <RoleNav />
      </section>

      <section class="nav-group">
        <h4>当前角色页面</h4>
        <nav class="nav-list">
          <RouterLink
            v-for="item in visibleRoutes"
            :key="item.path"
            class="nav-link"
            :to="item.path"
          >
            {{ item.label }}
          </RouterLink>
        </nav>
      </section>
    </aside>

    <main class="main-area">
      <div class="page">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, RouterView } from "vue-router";
import { storeToRefs } from "pinia";

import RoleNav from "@/shared/ui/RoleNav.vue";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const { role } = storeToRefs(auth);

const routeMap = {
  student: [
    { path: "/student/home", label: "学生首页" },
    { path: "/student/agent", label: "学生陪学" },
    { path: "/student/profile", label: "学生透明性" },
    { path: "/student/scores", label: "AI 评分" }
  ],
  teacher: [
    { path: "/teacher/dashboard", label: "教师总览" },
    { path: `/teacher/students/${auth.studentToken}`, label: "学生详情" },
    { path: "/teacher/interventions/new", label: "干预录入" }
  ],
  guardian: [
    { path: "/guardian/summary", label: "家长摘要" },
    { path: "/guardian/consents", label: "家长同意" },
    { path: "/guardian/appeals", label: "家长申诉" }
  ],
  admin: [
    { path: "/admin/compliance", label: "管理员合规" },
    { path: "/admin/audit", label: "管理员审计" },
    { path: "/admin/preflight", label: "管理员预检" },
    { path: "/admin/appeals", label: "申诉队列" },
    { path: "/admin/scoring", label: "评分验收" }
  ]
} as const;

const visibleRoutes = computed(() => routeMap[role.value]);
</script>
