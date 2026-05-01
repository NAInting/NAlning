import { expect, test, type APIRequestContext } from "@playwright/test";

async function login(request: APIRequestContext, role: string): Promise<string> {
  const response = await request.post("/api/v1/auth/login", {
    data: { role }
  });
  expect(response.ok()).toBe(true);
  const body = (await response.json()) as { access_token: string };
  return body.access_token;
}

test("backend login to protected student mastery flow", async ({ request }) => {
  const token = await login(request, "student");

  const response = await request.get("/api/v1/students/stu_tok_9f3a/mastery", {
    headers: { authorization: `Bearer ${token}` }
  });
  const body = (await response.json()) as { student_token: string; knowledge_map: unknown[] };

  expect(response.status()).toBe(200);
  expect(body.student_token).toBe("stu_tok_9f3a");
  expect(body.knowledge_map).toHaveLength(3);
});

test("backend teacher creates audited intervention", async ({ request }) => {
  const token = await login(request, "teacher");

  const response = await request.post("/api/v1/interventions", {
    headers: { authorization: `Bearer ${token}` },
    data: {
      teacher_id: "teacher_math_001",
      student_token: "stu_tok_9f3a",
      linked_report_id: "rpt_01K300",
      intervention_level: "L2",
      trigger_type: "misconception",
      action_taken: "15 minute group correction",
      verification_due_at: "2026-04-19T18:00:00+08:00"
    }
  });
  const body = (await response.json()) as { intervention_id: string; linked_report_id: string };

  expect(response.status()).toBe(201);
  expect(body.intervention_id).toBe("int_01K400");
  expect(body.linked_report_id).toBe("rpt_01K300");
});
