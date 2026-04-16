import { http, HttpResponse } from "msw";

import { getAdminCompliance, getAdminPreflight } from "@/features/admin/api";
import { createConsent, getConsentStatus, withdrawConsent } from "@/features/guardian/api";
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
    const body = (await request.json()) as { consent_type: string };
    const result = await withdrawConsent(String(params.consentId), body.consent_type);
    return HttpResponse.json(result);
  }),
  http.get("/mock/admin/preflight-summary", async () => {
    const result = await getAdminPreflight();
    return HttpResponse.json(result);
  }),
  http.get("/mock/admin/compliance-overview", async () => {
    const result = await getAdminCompliance();
    return HttpResponse.json(result);
  })
];
