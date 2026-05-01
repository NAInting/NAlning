import { Hono } from "hono";

import type { BackendVariables } from "../auth.js";
import { requireRole, requireStudentTokenAccess } from "../auth.js";
import { ApiError, readJsonBody } from "../errors.js";
import { auditLedger } from "../services/audit-ledger.js";
import { createConsent, getConsentStatus, getConsentStudentToken, isKnownStudentToken, withdrawConsent } from "../services/demo-repository.js";

export function createConsentRoutes(): Hono<{ Variables: BackendVariables }> {
  const app = new Hono<{ Variables: BackendVariables }>();

  app.get("/:studentToken/status", (context) => {
    const auth = context.get("auth");
    const studentToken = context.req.param("studentToken");
    requireRole(auth, ["guardian", "admin"]);
    requireStudentTokenAccess(auth, studentToken);
    try {
      return context.json(getConsentStatus(studentToken));
    } catch (error) {
      throw new ApiError(404, "not_found", error instanceof Error ? error.message : "Consent status not found");
    }
  });

  app.post("/", async (context) => {
    const auth = context.get("auth");
    requireRole(auth, ["guardian", "admin"]);
    const body = (await readJsonBody(context)) as Record<string, unknown>;
    if (typeof body.student_token !== "string" || body.student_token.length === 0) {
      throw new ApiError(400, "bad_request", "student_token is required");
    }
    if (!isKnownStudentToken(body.student_token)) {
      throw new ApiError(404, "not_found", "Student target not found");
    }
    requireStudentTokenAccess(auth, body.student_token);
    const response = createConsent(body);
    auditLedger.append({
      actor_id: auth.user_id,
      action_type: "consent_create",
      target_id: response.consent_id,
      reason_code: String(body.consent_type ?? "consent_lifecycle")
    });
    return context.json(response, 201);
  });

  app.post("/:consentId/withdraw", async (context) => {
    const auth = context.get("auth");
    requireRole(auth, ["guardian", "admin"]);
    const consentId = context.req.param("consentId");
    const studentToken = getConsentStudentToken(consentId);
    if (!studentToken) {
      throw new ApiError(404, "not_found", "Consent record not found");
    }
    requireStudentTokenAccess(auth, studentToken);
    const response = withdrawConsent(consentId);
    auditLedger.append({
      actor_id: auth.user_id,
      action_type: "consent_withdraw",
      target_id: response.consent_id,
      reason_code: "guardian_withdrawal"
    });
    return context.json(response);
  });

  return app;
}
