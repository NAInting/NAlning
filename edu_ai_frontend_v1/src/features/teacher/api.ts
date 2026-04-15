import {
  demoIds,
  teacherDailyReport,
  teacherStudentDetailByToken
} from "@/mocks/data/demo-data";
import type {
  InterventionCreateResponse,
  TeacherDailyReportResponse,
  TeacherStudentDetailViewModel
} from "@/types/demo";

export async function getTeacherDailyReport(): Promise<TeacherDailyReportResponse> {
  await Promise.resolve();
  return teacherDailyReport;
}

export async function createIntervention(payload: {
  student_token?: string;
  linked_report_id?: string;
  intervention_level: string;
  trigger_type: string;
  action_taken: string;
  verification_due_at: string;
}): Promise<InterventionCreateResponse> {
  await Promise.resolve();
  return {
    intervention_id: "int_01K400",
    status: "open",
    verification_due_at: payload.verification_due_at,
    request_id: "req_01K401"
  };
}

export async function getTeacherStudentDetail(
  studentToken?: string
): Promise<TeacherStudentDetailViewModel> {
  await Promise.resolve();
  const key = studentToken ?? demoIds.studentPrimary;
  const match =
    teacherStudentDetailByToken[key as keyof typeof teacherStudentDetailByToken] ??
    teacherStudentDetailByToken[demoIds.studentPrimary];
  return match as TeacherStudentDetailViewModel;
}
