import { Hono } from "hono";
import { z } from "zod";

import type { BackendVariables } from "../auth.js";
import { issueDemoToken, type AuthRole } from "../auth.js";
import { ApiError, readJsonBody } from "../errors.js";

const LoginRequestSchema = z
  .object({
    role: z.enum(["student", "teacher", "guardian", "admin"])
  })
  .strict();

export function createAuthRoutes(): Hono<{ Variables: BackendVariables }> {
  const app = new Hono<{ Variables: BackendVariables }>();

  app.post("/login", async (context) => {
    const parsed = LoginRequestSchema.safeParse(await readJsonBody(context));
    if (!parsed.success) {
      throw new ApiError(400, "bad_request", "Invalid login request", parsed.error.flatten());
    }

    const role = parsed.data.role as AuthRole;
    const token = issueDemoToken(role);
    return context.json({
      access_token: token,
      token_type: "Bearer",
      role
    });
  });

  return app;
}
