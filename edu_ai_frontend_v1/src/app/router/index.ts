import { createRouter, createWebHistory } from "vue-router";

import StudentHomePage from "@/features/student/pages/StudentHomePage.vue";
import StudentAgentPage from "@/features/student/pages/StudentAgentPage.vue";
import StudentProfilePage from "@/features/student/pages/StudentProfilePage.vue";
import TeacherDashboardPage from "@/features/teacher/pages/TeacherDashboardPage.vue";
import TeacherStudentDetailPage from "@/features/teacher/pages/TeacherStudentDetailPage.vue";
import TeacherInterventionCreatePage from "@/features/teacher/pages/TeacherInterventionCreatePage.vue";
import GuardianSummaryPage from "@/features/guardian/pages/GuardianSummaryPage.vue";
import GuardianConsentsPage from "@/features/guardian/pages/GuardianConsentsPage.vue";
import GuardianAppealsPage from "@/features/guardian/pages/GuardianAppealsPage.vue";
import AdminCompliancePage from "@/features/admin/pages/AdminCompliancePage.vue";
import AdminAuditPage from "@/features/admin/pages/AdminAuditPage.vue";
import AdminPreflightPage from "@/features/admin/pages/AdminPreflightPage.vue";
import AdminAppealsPage from "@/features/admin/pages/AdminAppealsPage.vue";
import { useAuthStore } from "@/stores/auth";

const routes = [
  { path: "/", redirect: "/student/home" },
  { path: "/student/home", component: StudentHomePage, meta: { role: "student", title: "学生首页" } },
  { path: "/student/agent", component: StudentAgentPage, meta: { role: "student", title: "学生陪学" } },
  { path: "/student/profile", component: StudentProfilePage, meta: { role: "student", title: "学生透明性" } },
  { path: "/teacher/dashboard", component: TeacherDashboardPage, meta: { role: "teacher", title: "教师总览" } },
  { path: "/teacher/students/:studentToken", component: TeacherStudentDetailPage, meta: { role: "teacher", title: "学生详情" } },
  { path: "/teacher/interventions/new", component: TeacherInterventionCreatePage, meta: { role: "teacher", title: "干预录入" } },
  { path: "/guardian/summary", component: GuardianSummaryPage, meta: { role: "guardian", title: "家长摘要" } },
  { path: "/guardian/consents", component: GuardianConsentsPage, meta: { role: "guardian", title: "家长同意" } },
  { path: "/guardian/appeals", component: GuardianAppealsPage, meta: { role: "guardian", title: "家长申诉" } },
  { path: "/admin/compliance", component: AdminCompliancePage, meta: { role: "admin", title: "管理员合规" } },
  { path: "/admin/audit", component: AdminAuditPage, meta: { role: "admin", title: "管理员审计" } },
  { path: "/admin/preflight", component: AdminPreflightPage, meta: { role: "admin", title: "管理员预检" } },
  { path: "/admin/appeals", component: AdminAppealsPage, meta: { role: "admin", title: "申诉队列" } }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  const requiredRole = to.meta.role as string | undefined;

  if (requiredRole && requiredRole !== auth.role) {
    return auth.homePath;
  }

  return true;
});

export default router;
