import type { Context, Next } from "hono";
import { randomUUID } from "node:crypto";

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    request_id: string;
    details?: unknown;
  };
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function requestIdMiddleware() {
  return async (context: Context, next: Next) => {
    const requestId = context.req.header("x-request-id") ?? randomUUID();
    context.set("request_id", requestId);
    context.header("x-request-id", requestId);
    await next();
  };
}

export function toErrorResponse(error: unknown, requestId: string): { status: number; body: ErrorResponse } {
  if (error instanceof ApiError) {
    const body: ErrorResponse = {
      error: {
        code: error.code,
        message: error.message,
        request_id: requestId
      }
    };
    if (error.details !== undefined) {
      body.error.details = error.details;
    }
    return { status: error.status, body };
  }

  return {
    status: 500,
    body: {
      error: {
        code: "internal_error",
        message: "Unexpected backend error",
        request_id: requestId
      }
    }
  };
}

export async function readJsonBody(context: Context): Promise<unknown> {
  try {
    return await context.req.json();
  } catch {
    throw new ApiError(400, "bad_request", "Malformed JSON body");
  }
}
