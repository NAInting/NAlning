import { http, HttpResponse } from "msw";

import {
  advanceAppealState,
  getAdminCompliance,
  getAdminPreflight,
  getAppealQueue
} from "@/features/admin/api";
import {
  createAppeal,
  createConsent,
  getConsentStatus,
  getMyAppeals,
  withdrawConsent
} from "@/features/guardian/api";
import { createStudentAgentSession, getStudentMastery, getStudentProfile } from "@/features/student/api";
import { createIntervention, getTeacherDailyReport } from "@/features/teacher/api";

export const handlers = [
  http.get("/api/v1/students/:studentToken/mastery", async ({ params }) => {
    const result = await getStudentMastery(String(params.studentToken));
    return HttpResponse.json(result);
  }),
  http.post("/api/v1/student-agent/sessions", async ({ request }) => {
    const body = (await request.json()) as { message: string };
    const result = await createStudentAgentSession(body.message);
    return HttpResponse.json(result);
  }),
  http.get("/api/v1/students/:studentToken/my-profile", async ({ params }) => {
    const result = await getStudentProfile(String(params.studentToken));
    return HttpResponse.json(result);
  }),
  http.post("/api/v1/teacher-agent/reports/daily", async () => {
    const result = await getTeacherDailyReport();
    return HttpResponse.json(result);
  }),
  http.post("/api/v1/interventions", async ({ request }) => {
    const body = (await request.json()) as {
      intervention_level: string;
      trigger_type: string;
      action_taken: string;
      verification_due_at: string;
    };
    const result = await createIntervention(body);
    return HttpResponse.json(result, { status: 201 });
  }),
  http.get("/api/v1/consents/:guardianId/status", async ({ params }) => {
    const result = await getConsentStatus(String(params.guardianId));
    return HttpResponse.json(result);
  }),
  http.post("/api/v1/consents", async ({ request }) => {
    const body = (await request.json()) as { guardian_id: string; consent_type: string };
    const result = await createConsent(body.guardian_id, body.consent_type);
    return HttpResponse.json(result, { status: 201 });
  }),
  http.post("/api/v1/consents/:consentId/withdraw", async ({ params, request }) => {
    const body = (await request.json()) as { guardian_id: string; consent_type: string };
    const result = await withdrawConsent(
      body.guardian_id,
      String(params.consentId),
      body.consent_type
    );
    if (!result) {
      return HttpResponse.json({ error: "consent_not_found_or_unauthorized" }, { status: 404 });
    }
    return HttpResponse.json(result);
  }),
  http.get("/mock/admin/preflight-summary", async () => {
    const result = await getAdminPreflight();
    return HttpResponse.json(result);
  }),
  http.get("/mock/admin/compliance-overview", async () => {
    const result = await getAdminCompliance();
    return HttpResponse.json(result);
  }),
  http.get("/api/v1/guardians/:guardianId/appeals", async ({ params }) => {
    const result = await getMyAppeals(String(params.guardianId));
    if (!result) {
      return HttpResponse.json({ error: "guardian_not_found" }, { status: 404 });
    }
    return HttpResponse.json(result);
  }),
  http.post("/api/v1/appeals", async ({ request }) => {
    const body = (await request.json()) as {
      guardian_id: string;
      student_token: string;
      target_type: "ai_scoring" | "agent_behavior" | "teacher_intervention";
      target_ref: string;
      reason: string;
    };
    const result = await createAppeal(body);
    if (!result) {
      return HttpResponse.json(
        { error: "invalid_input_or_unauthorized_binding" },
        { status: 400 }
      );
    }
    return HttpResponse.json(result, { status: 201 });
  }),
  http.get("/api/v1/admin/appeals/queue", async ({ request }) => {
    const adminId = request.headers.get("x-admin-id") ?? "";
    const result = await getAppealQueue(adminId);
    if (!result) {
      return HttpResponse.json({ error: "admin_id_missing" }, { status: 401 });
    }
    return HttpResponse.json(result);
  }),
  http.post("/api/v1/admin/appeals/:appealId/advance", async ({ params, request }) => {
    const body = (await request.json()) as {
      admin_id: string;
      next_status: "under_review" | "resolved" | "escalated";
      resolution_note?: string;
      manual_review_confirmed?: boolean;
    };
    const result = await advanceAppealState({
      admin_id: body.admin_id,
      appeal_id: String(params.appealId),
      next_status: body.next_status,
      resolution_note: body.resolution_note,
      manual_review_confirmed: body.manual_review_confirmed
    });
    if (!result) {
      return HttpResponse.json(
        { error: "illegal_transition_or_missing_fields" },
        { status: 422 }
      );
    }
    return HttpResponse.json(result);
  })
];
