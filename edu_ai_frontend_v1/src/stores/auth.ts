import { computed, ref } from "vue";
import { defineStore } from "pinia";

type RoleKey = "student" | "teacher" | "guardian" | "admin";

const roleHomeMap: Record<RoleKey, string> = {
  student: "/student/home",
  teacher: "/teacher/dashboard",
  guardian: "/guardian/summary",
  admin: "/admin/dashboard"
};

export const useAuthStore = defineStore("auth", () => {
  const role = ref<RoleKey>("student");
  const studentToken = ref("stu_tok_9f3a");
  const teacherId = ref("teacher_math_001");
  const guardianId = ref("guardian_pk_001");
  const adminId = ref("admin_compliance_001");

  const homePath = computed(() => roleHomeMap[role.value]);

  function switchRole(nextRole: RoleKey) {
    role.value = nextRole;
  }

  return {
    role,
    studentToken,
    teacherId,
    guardianId,
    adminId,
    homePath,
    switchRole
  };
});
