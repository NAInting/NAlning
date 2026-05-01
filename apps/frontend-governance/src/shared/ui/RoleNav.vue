<template>
  <div class="role-grid">
    <button
      v-for="item in items"
      :key="item.role"
      class="role-button"
      :data-active="item.role === currentRole"
      @click="activate(item.role, item.path)"
    >
      {{ item.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";

import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const auth = useAuthStore();
const { role: currentRole } = storeToRefs(auth);

const items = [
  { role: "student", label: "学生", path: "/student/home" },
  { role: "teacher", label: "教师", path: "/teacher/dashboard" },
  { role: "guardian", label: "家长", path: "/guardian/summary" },
  { role: "admin", label: "管理员", path: "/admin/preflight" }
] as const;

function activate(role: "student" | "teacher" | "guardian" | "admin", path: string) {
  auth.switchRole(role);
  router.push(path);
}
</script>
