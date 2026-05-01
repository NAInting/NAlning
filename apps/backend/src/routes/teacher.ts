import { Hono } from "hono";

import type { BackendVariables } from "../auth.js";
import { requireRole, requireStudentTokenAccess, requireTeacherIdMatch } from "../auth.js";
import { ApiError, readJsonBody } from "../errors.js";
import { auditLedger } from "../services/audit-ledger.js";
import { createIntervention, createTeacherDailyReport, demoIds, isKnownStudentToken } from "../services/demo-repository.js";

export function createTeacherRoutes(): Hono<{ Variables: BackendVariables }> {
  const app = new Hono<{ Variables: BackendVariables }>();

  app.post("/reports/daily", async (context) => {
    const auth = context.get("auth");
    requireRole(auth, ["teacher", "admin"]);
    await readJsonBody(context);
    const response = createTeacherDailyReport();
    auditLedger.append({
      actor_id: auth.user_id,
      action_type: "teacher_daily_report_generate",
      target_id: response.report_id,
      reason_code: "daily_report"
    });
    return context.json(response);
  });

  return app;
}

export function createInterventionRoutes(): Hono<{ Variables: BackendVariables }> {
  const app = new Hono<{ Variables: BackendVariables }>();

  app.post("/", async (context) => {
    const auth = context.get("auth");
    requireRole(auth, ["teacher", "admin"]);
    const body = (await readJsonBody(context)) as Record<string, unknown>;
    const teacherId = expectString(body.teacher_id, "teacher_id");
    const studentToken = expectString(body.student_token, "student_token");
    const linkedReportId = expectString(body.linked_report_id, "linked_report_id");
    requireTeacherIdMatch(auth, teacherId);
    requireStudentTokenAccess(auth, studentToken);
    if (!isKnownStudentToken(studentToken)) {
      throw new ApiError(404, "not_found", "Student target not found");
    }
    if (linkedReportId !== demoIds.reportId) {
      throw new ApiError(404, "not_found", "Linked report not found");
    }
    const response = createIntervention(body);
    auditLedger.append({
      actor_id: auth.user_id,
      action_type: "intervention_create",
      target_id: response.intervention_id,
      reason_code: String(body.trigger_type ?? "teacher_action")
    });
    return context.json(response, 201);
  });

  return app;
}

function expectString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new ApiError(400, "bad_request", `${field} is required`);
  }

  return value;
}
