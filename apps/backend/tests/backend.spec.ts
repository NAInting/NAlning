import { describe, expect, it } from "vitest";

import { createBackendApp } from "../src/app.js";
import { auditLedger } from "../src/services/audit-ledger.js";

async function login(role: "student" | "teacher" | "guardian" | "admin"): Promise<string> {
  const app = createBackendApp();
  const response = await app.request("/api/v1/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ role })
  });
  const body = (await response.json()) as { access_token: string };
  return body.access_token;
}

describe("backend skeleton", () => {
  it("serves health and OpenAPI documents", async () => {
    const app = createBackendApp();

    const health = await app.request("/healthz");
    const openapi = await app.request("/openapi.json");
    const openapiBody = (await openapi.json()) as { paths: Record<string, unknown> };

    expect(health.status).toBe(200);
    expect(openapi.status).toBe(200);
    expect(openapiBody.paths["/api/v1/students/{studentToken}/mastery"]).toBeDefined();
  });

  it("runs login to authenticated student mastery flow", async () => {
    const app = createBackendApp();
    const token = await login("student");

    const response = await app.request("/api/v1/students/stu_tok_9f3a/mastery", {
      headers: { authorization: `Bearer ${token}` }
    });
    const body = (await response.json()) as { student_token: string; knowledge_map: readonly unknown[] };

    expect(response.status).toBe(200);
    expect(body.student_token).toBe("stu_tok_9f3a");
    expect(body.knowledge_map).toHaveLength(3);
  });

  it("rejects protected routes without bearer token", async () => {
    const app = createBackendApp();

    const mastery = await app.request("/api/v1/students/stu_tok_9f3a/mastery");
    const me = await app.request("/api/v1/auth/me");
    const body = (await mastery.json()) as { error: { code: string } };

    expect(mastery.status).toBe(401);
    expect(me.status).toBe(401);
    expect(body.error.code).toBe("unauthorized");
  });

  it("returns bad_request for malformed JSON bodies", async () => {
    const app = createBackendApp();

    const response = await app.request("/api/v1/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{bad json"
    });
    const body = (await response.json()) as { error: { code: string } };

    expect(response.status).toBe(400);
    expect(body.error.code).toBe("bad_request");
  });

  it("prevents student and guardian cross-student access", async () => {
    const app = createBackendApp();
    const studentToken = await login("student");
    const guardianToken = await login("guardian");

    const studentResponse = await app.request("/api/v1/students/stu_tok_2b71/mastery", {
      headers: { authorization: `Bearer ${studentToken}` }
    });
    const guardianResponse = await app.request("/api/v1/consents/stu_tok_2b71/status", {
      headers: { authorization: `Bearer ${guardianToken}` }
    });

    expect(studentResponse.status).toBe(403);
    expect(guardianResponse.status).toBe(403);
  });

  it("creates a teacher intervention and writes an audit entry", async () => {
    const app = createBackendApp();
    const token = await login("teacher");
    const auditCountBefore = auditLedger.list().length;

    const response = await app.request("/api/v1/interventions", {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        teacher_id: "teacher_math_001",
        student_token: "stu_tok_9f3a",
        linked_report_id: "rpt_01K300",
        intervention_level: "L2",
        trigger_type: "misconception",
        action_taken: "15 minute group correction",
        verification_due_at: "2026-04-19T18:00:00+08:00"
      })
    });
    const body = (await response.json()) as { intervention_id: string; linked_report_id: string };

    expect(response.status).toBe(201);
    expect(body.intervention_id).toBe("int_01K400");
    expect(body.linked_report_id).toBe("rpt_01K300");
    expect(auditLedger.list()).toHaveLength(auditCountBefore + 1);
    expect(auditLedger.list().at(-1)?.action_type).toBe("intervention_create");
  });

  it("rejects unbound teacher intervention writes", async () => {
    const app = createBackendApp();
    const token = await login("teacher");

    const response = await app.request("/api/v1/interventions", {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        teacher_id: "teacher_other",
        student_token: "stu_tok_9f3a",
        linked_report_id: "rpt_01K300",
        intervention_level: "L2",
        trigger_type: "misconception",
        action_taken: "invalid teacher",
        verification_due_at: "2026-04-19T18:00:00+08:00"
      })
    });

    expect(response.status).toBe(403);
  });

  it("audits Student Agent sessions and teacher daily report generation", async () => {
    const app = createBackendApp();
    const studentToken = await login("student");
    const teacherToken = await login("teacher");
    const auditCountBefore = auditLedger.list().length;

    const session = await app.request("/api/v1/student-agent/sessions", {
      method: "POST",
      headers: {
        authorization: `Bearer ${studentToken}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({ message: "我有点焦虑，想慢慢说" })
    });
    const report = await app.request("/api/v1/teacher-agent/reports/daily", {
      method: "POST",
      headers: {
        authorization: `Bearer ${teacherToken}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({ teacher_id: "teacher_math_001", class_id: "class_math_001" })
    });

    expect(session.status).toBe(200);
    expect(report.status).toBe(200);
    expect(auditLedger.list()).toHaveLength(auditCountBefore + 2);
    expect(auditLedger.list().slice(-2).map((entry) => entry.action_type)).toEqual([
      "student_agent_session_create",
      "teacher_daily_report_generate"
    ]);
  });

  it("lets guardian manage consent lifecycle", async () => {
    const app = createBackendApp();
    const token = await login("guardian");

    const status = await app.request("/api/v1/consents/stu_tok_9f3a/status", {
      headers: { authorization: `Bearer ${token}` }
    });
    const created = await app.request("/api/v1/consents", {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({ student_token: "stu_tok_9f3a", consent_type: "student_agent", version: 2 })
    });
    const withdrawn = await app.request("/api/v1/consents/consent_demo_001/withdraw", {
      method: "POST",
      headers: { authorization: `Bearer ${token}` }
    });
    const withdrawnBody = (await withdrawn.json()) as { status: string };

    expect(status.status).toBe(200);
    expect(created.status).toBe(201);
    expect(withdrawn.status).toBe(200);
    expect(withdrawnBody.status).toBe("withdrawn");
  });

  it("rejects unbound consent writes and unknown consent withdrawal", async () => {
    const app = createBackendApp();
    const token = await login("guardian");

    const missingStudent = await app.request("/api/v1/consents", {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({ consent_type: "student_agent", version: 2 })
    });
    const unknownWithdraw = await app.request("/api/v1/consents/consent_unknown/withdraw", {
      method: "POST",
      headers: { authorization: `Bearer ${token}` }
    });

    expect(missingStudent.status).toBe(400);
    expect(unknownWithdraw.status).toBe(404);
  });
});
