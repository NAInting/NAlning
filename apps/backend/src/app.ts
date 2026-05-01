import { Hono } from "hono";
import { cors } from "hono/cors";

import { authMiddleware, type BackendVariables } from "./auth.js";
import { requestIdMiddleware, toErrorResponse } from "./errors.js";
import { openApiDocument } from "./openapi.js";
import { createAuditRoutes } from "./routes/audit.js";
import { createAuthRoutes } from "./routes/auth.js";
import { createConsentRoutes } from "./routes/consents.js";
import { createStudentAgentRoutes, createStudentRoutes } from "./routes/students.js";
import { createInterventionRoutes, createTeacherRoutes } from "./routes/teacher.js";

export function createBackendApp(): Hono<{ Variables: BackendVariables }> {
  const app = new Hono<{ Variables: BackendVariables }>();

  app.use("*", requestIdMiddleware());
  app.use("*", cors());

  app.get("/healthz", (context) =>
    context.json({
      status: "ok",
      service: "@edu-ai/backend",
      phase: "0.5"
    })
  );
  app.get("/openapi.json", (context) => context.json(openApiDocument));

  app.route("/api/v1/auth", createAuthRoutes());
  app.use("/api/v1/*", authMiddleware);
  app.get("/api/v1/auth/me", (context) => context.json(context.get("auth")));
  app.route("/api/v1/students", createStudentRoutes());
  app.route("/api/v1/student-agent", createStudentAgentRoutes());
  app.route("/api/v1/teacher-agent", createTeacherRoutes());
  app.route("/api/v1/interventions", createInterventionRoutes());
  app.route("/api/v1/consents", createConsentRoutes());
  app.route("/api/v1/audit", createAuditRoutes());

  app.notFound((context) =>
    context.json(
      {
        error: {
          code: "not_found",
          message: "Route not found",
          request_id: context.get("request_id")
        }
      },
      404
    )
  );

  app.onError((error, context) => {
    const response = toErrorResponse(error, context.get("request_id"));
    return context.json(response.body, response.status as 400 | 401 | 403 | 404 | 500);
  });

  return app;
}
