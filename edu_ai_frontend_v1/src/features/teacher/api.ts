import {
  teacherByTeacherId,
  teacherDailyReport,
  teacherStudentDetailByToken
} from "@/mocks/data/demo-data";
import { generateRequestId } from "@/shared/utils/requestId";
import type {
  InterventionCreateResponse,
  TeacherDailyReportResponse,
  TeacherStudentDetailViewModel
} from "@/types/demo";

function isKnownTeacher(teacherId: string): boolean {
  return teacherId in teacherByTeacherId;
}

function teacherOwnsStudent(teacherId: string, studentToken: string): boolean {
  const teacher = teacherByTeacherId[teacherId as keyof typeof teacherByTeacherId];
  if (!teacher) return false;
  return (teacher.student_tokens as readonly string[]).includes(studentToken);
}

export async function getTeacherDailyReport(
  teacherId: string
): Promise<TeacherDailyReportResponse | undefined> {
  await Promise.resolve();
  if (!teacherId || !isKnownTeacher(teacherId)) {
    return undefined;
  }
  return structuredClone(teacherDailyReport);
}

export async function createIntervention(
  teacherId: string,
  payload: {
    student_token: string;
    linked_report_id?: string;
    intervention_level: string;
    trigger_type: string;
    action_taken: string;
    verification_due_at: string;
  }
): Promise<InterventionCreateResponse | undefined> {
  await Promise.resolve();
  if (!teacherId || !isKnownTeacher(teacherId)) {
    return undefined;
  }
  if (!payload.student_token) {
    return undefined;
  }
  if (!teacherOwnsStudent(teacherId, payload.student_token)) {
    return undefined;
  }
  return {
    intervention_id: `int_${Date.now().toString(36)}`,
    status: "open",
    verification_due_at: payload.verification_due_at,
    request_id: generateRequestId()
  };
}

export async function getTeacherStudentDetail(
  teacherId: string,
  studentToken: string
): Promise<TeacherStudentDetailViewModel | undefined> {
  await Promise.resolve();
  if (!teacherId || !studentToken || !isKnownTeacher(teacherId)) {
    return undefined;
  }
  if (!teacherOwnsStudent(teacherId, studentToken)) {
    return undefined;
  }
  const match =
    teacherStudentDetailByToken[studentToken as keyof typeof teacherStudentDetailByToken];
  return match ? structuredClone(match as TeacherStudentDetailViewModel) : undefined;
}
