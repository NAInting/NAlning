export const openApiDocument = {
  openapi: "3.1.0",
  info: {
    title: "Edu AI Platform Backend",
    version: "0.5.0",
    description: "Phase 0.5 minimal backend skeleton API."
  },
  servers: [
    {
      url: "http://localhost:8787"
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer"
      }
    }
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/healthz": { get: { security: [], responses: { "200": { description: "Backend health" } } } },
    "/openapi.json": { get: { security: [], responses: { "200": { description: "OpenAPI document" } } } },
    "/api/v1/auth/login": { post: { security: [], responses: { "200": { description: "Demo bearer token" } } } },
    "/api/v1/auth/me": { get: { responses: { "200": { description: "Current auth user" } } } },
    "/api/v1/students/{studentToken}/mastery": { get: { responses: { "200": { description: "Student mastery" } } } },
    "/api/v1/student-agent/sessions": { post: { responses: { "200": { description: "Student Agent session" } } } },
    "/api/v1/students/{studentToken}/my-profile": { get: { responses: { "200": { description: "Student profile" } } } },
    "/api/v1/teacher-agent/reports/daily": { post: { responses: { "200": { description: "Teacher daily report" } } } },
    "/api/v1/interventions": { post: { responses: { "201": { description: "Teacher intervention created" } } } },
    "/api/v1/audit/export-requests": { post: { responses: { "202": { description: "Audit export accepted" } } } },
    "/api/v1/consents/{studentToken}/status": { get: { responses: { "200": { description: "Consent status" } } } },
    "/api/v1/consents": { post: { responses: { "201": { description: "Consent created" } } } },
    "/api/v1/consents/{consentId}/withdraw": { post: { responses: { "200": { description: "Consent withdrawn" } } } }
  }
} as const;
