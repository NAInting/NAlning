import { createMiddleware } from "hono/factory";

import { ApiError } from "./errors.js";

export type AuthRole = "student" | "teacher" | "guardian" | "admin";

export interface AuthUser {
  user_id: string;
  role: AuthRole;
  student_token?: string;
  student_tokens?: readonly string[];
  teacher_id?: string;
  guardian_id?: string;
}

export interface BackendVariables {
  auth: AuthUser;
  request_id: string;
}

const demoUsers: Record<AuthRole, AuthUser> = {
  student: {
    user_id: "user_student_001",
    role: "student",
    student_token: "stu_tok_9f3a"
  },
  teacher: {
    user_id: "user_teacher_math_001",
    role: "teacher",
    teacher_id: "teacher_math_001",
    student_tokens: ["stu_tok_9f3a", "stu_tok_2b71"]
  },
  guardian: {
    user_id: "user_guardian_001",
    role: "guardian",
    guardian_id: "guardian_pk_001",
    student_tokens: ["stu_tok_9f3a"]
  },
  admin: {
    user_id: "user_admin_001",
    role: "admin"
  }
};

export const authMiddleware = createMiddleware<{ Variables: BackendVariables }>(async (context, next) => {
  const header = context.req.header("authorization");
  if (!header?.startsWith("Bearer ")) {
    throw new ApiError(401, "unauthorized", "Missing bearer token");
  }

  context.set("auth", decodeDemoToken(header.slice("Bearer ".length)));
  await next();
});

export function issueDemoToken(role: AuthRole): string {
  return Buffer.from(JSON.stringify(demoUsers[role]), "utf8").toString("base64url");
}

export function decodeDemoToken(token: string): AuthUser {
  try {
    const parsed = JSON.parse(Buffer.from(token, "base64url").toString("utf8")) as Partial<AuthUser>;
    if (!parsed.user_id || !parsed.role || !(parsed.role in demoUsers)) {
      throw new Error("Invalid demo token payload");
    }
    return parsed as AuthUser;
  } catch {
    throw new ApiError(401, "unauthorized", "Invalid bearer token");
  }
}

export function requireRole(user: AuthUser, roles: readonly AuthRole[]): void {
  if (!roles.includes(user.role)) {
    throw new ApiError(403, "forbidden", `Role ${user.role} cannot access this endpoint`);
  }
}

export function requireStudentTokenAccess(user: AuthUser, studentToken: string): void {
  if (user.role === "student" && user.student_token !== studentToken) {
    throw new ApiError(403, "forbidden", "Student cannot access another student's data");
  }

  if (user.role === "guardian" && !user.student_tokens?.includes(studentToken)) {
    throw new ApiError(403, "forbidden", "Guardian cannot access this student's data");
  }

  if (user.role === "teacher" && !user.student_tokens?.includes(studentToken)) {
    throw new ApiError(403, "forbidden", "Teacher cannot access this student's data");
  }
}

export function requireTeacherIdMatch(user: AuthUser, teacherId: string): void {
  if (user.role === "teacher" && user.teacher_id !== teacherId) {
    throw new ApiError(403, "forbidden", "Teacher cannot act as another teacher");
  }
}
