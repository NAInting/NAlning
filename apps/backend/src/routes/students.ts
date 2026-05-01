import { Hono } from "hono";

import type { BackendVariables } from "../auth.js";
import { requireRole, requireStudentTokenAccess } from "../auth.js";
import { ApiError, readJsonBody } from "../errors.js";
import { auditLedger } from "../services/audit-ledger.js";
import { createStudentAgentSession, getStudentMastery, getStudentProfile } from "../services/demo-repository.js";

export function createStudentRoutes(): Hono<{ Variables: BackendVariables }> {
  const app = new Hono<{ Variables: BackendVariables }>();

  app.get("/:studentToken/mastery", (context) => {
    const auth = context.get("auth");
    const studentToken = context.req.param("studentToken");
    requireRole(auth, ["student", "teacher", "admin"]);
    requireStudentTokenAccess(auth, studentToken);
    try {
      return context.json(getStudentMastery(studentToken));
    } catch (error) {
      throw notFoundFrom(error);
    }
  });

  app.get("/:studentToken/my-profile", (context) => {
    const auth = context.get("auth");
    const studentToken = context.req.param("studentToken");
    requireRole(auth, ["student", "admin"]);
    requireStudentTokenAccess(auth, studentToken);
    try {
      return context.json(getStudentProfile(studentToken));
    } catch (error) {
      throw notFoundFrom(error);
    }
  });

  return app;
}

export function createStudentAgentRoutes(): Hono<{ Variables: BackendVariables }> {
  const app = new Hono<{ Variables: BackendVariables }>();

  app.post("/sessions", async (context) => {
    const auth = context.get("auth");
    requireRole(auth, ["student", "admin"]);
    const response = createStudentAgentSession(await readJsonBody(context));
    auditLedger.append({
      actor_id: auth.user_id,
      action_type: "student_agent_session_create",
      target_id: response.session_id,
      reason_code: response.route_selected
    });
    return context.json(response);
  });

  return app;
}

function notFoundFrom(error: unknown): ApiError {
  return new ApiError(404, "not_found", error instanceof Error ? error.message : "Student resource not found");
}
