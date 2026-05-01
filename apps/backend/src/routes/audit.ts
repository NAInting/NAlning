import { Hono } from "hono";

import type { BackendVariables } from "../auth.js";
import { requireRole } from "../auth.js";
import { readJsonBody } from "../errors.js";
import { auditLedger } from "../services/audit-ledger.js";

export function createAuditRoutes(): Hono<{ Variables: BackendVariables }> {
  const app = new Hono<{ Variables: BackendVariables }>();

  app.post("/export-requests", async (context) => {
    const auth = context.get("auth");
    requireRole(auth, ["admin"]);
    const body = (await readJsonBody(context)) as Record<string, unknown>;
    const entry = auditLedger.append({
      actor_id: auth.user_id,
      action_type: "audit_export_request",
      target_id: String(body.request_scope ?? "audit_scope"),
      reason_code: String(body.reason_code ?? "compliance_review")
    });

    return context.json(
      {
        request_id: `req_${entry.audit_id}`,
        status: "accepted",
        audit_id: entry.audit_id
      },
      202
    );
  });

  return app;
}
