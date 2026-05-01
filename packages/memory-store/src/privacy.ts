import type { MemoryBucket, MemoryRequesterRole, QueryVectorInput, UpsertVectorInput, VectorRecord } from "./types";

export function assertWritableMemory(input: UpsertVectorInput): void {
  if (input.source_type === "content" && input.student_id) {
    throw new Error("Content embeddings must not bind to a student_id");
  }

  if (input.source_type === "content" && input.memory_bucket !== "academic") {
    throw new Error("Content embeddings must use academic memory bucket");
  }

  if (input.source_type !== "content" && !input.student_id) {
    throw new Error(`${input.source_type} embeddings require student_id`);
  }

  if (input.memory_bucket === "emotional") {
    if (input.privacy_level !== "campus_local_only" || input.deployment_scope !== "campus_local") {
      throw new Error("Emotional memory must be campus_local_only and campus_local");
    }
  }
}

export function canRequesterAccessBucket(role: MemoryRequesterRole, bucket: MemoryBucket): boolean {
  if (role === "teacher_agent") {
    return bucket === "academic";
  }

  if (role === "guardian_agent") {
    return false;
  }

  if (role === "student_agent") {
    return bucket === "academic" || bucket === "personal";
  }

  return true;
}

export function assertQueryableMemory(role: MemoryRequesterRole, bucket: MemoryBucket): void {
  if (!canRequesterAccessBucket(role, bucket)) {
    throw new Error(`${role} cannot query ${bucket} memory bucket`);
  }
}

export function assertSafeQuery(input: QueryVectorInput): void {
  if (input.memory_bucket) {
    assertQueryableMemory(input.requester_role, input.memory_bucket);
  }

  if (input.source_type && input.source_type !== "content" && !input.student_id && !isPrivilegedRole(input.requester_role)) {
    throw new Error(`${input.source_type} queries require student_id`);
  }
}

export function isRecordVisibleToQuery(
  record: VectorRecord,
  tenantId: string,
  studentId: string | undefined,
  requesterRole: MemoryRequesterRole,
  bucket: MemoryBucket | undefined
): boolean {
  if (record.tenant_id !== tenantId) {
    return false;
  }

  if (studentId && record.student_id !== studentId) {
    return false;
  }

  if (!studentId && record.student_id && !isPrivilegedRole(requesterRole)) {
    return false;
  }

  if (bucket && record.memory_bucket !== bucket) {
    return false;
  }

  return canRequesterAccessBucket(requesterRole, record.memory_bucket);
}

function isPrivilegedRole(role: MemoryRequesterRole): boolean {
  return role === "admin" || role === "system";
}
