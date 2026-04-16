import {
  adminAuditPreview,
  adminCompliance,
  adminPreflight,
  appealQueueForAdmin
} from "@/mocks/data/demo-data";
import { generateRequestId } from "@/shared/utils/requestId";
import type {
  AdminAuditPreview,
  AdminComplianceSummary,
  AdminPreflightSummary,
  AppealAdvanceInput,
  AppealQueueResponse,
  AppealStatus,
  AppealWriteResponse
} from "@/types/demo";

export async function getAdminPreflight(): Promise<AdminPreflightSummary> {
  await Promise.resolve();
  return adminPreflight;
}

export async function getAdminCompliance(): Promise<AdminComplianceSummary> {
  await Promise.resolve();
  return adminCompliance;
}

export async function getAdminAuditPreview(): Promise<AdminAuditPreview> {
  await Promise.resolve();
  return adminAuditPreview;
}

export async function getAppealQueue(
  adminId: string
): Promise<AppealQueueResponse | undefined> {
  await Promise.resolve();
  if (!adminId) {
    return undefined;
  }
  return appealQueueForAdmin as AppealQueueResponse;
}

const ALLOWED_TRANSITIONS: Record<AppealStatus, ReadonlyArray<AppealStatus>> = {
  submitted: ["under_review"],
  under_review: ["resolved", "escalated"],
  resolved: [],
  escalated: []
};

export async function advanceAppealState(
  input: AppealAdvanceInput
): Promise<AppealWriteResponse | undefined> {
  await Promise.resolve();
  if (!input.admin_id || !input.appeal_id || !input.next_status) {
    return undefined;
  }
  const current = appealQueueForAdmin.items.find(
    (it) => it.appeal_id === input.appeal_id
  );
  if (!current) {
    return undefined;
  }
  if (!ALLOWED_TRANSITIONS[current.status as AppealStatus].includes(input.next_status)) {
    return undefined;
  }
  if (input.next_status === "resolved") {
    if (!input.resolution_note?.trim()) {
      return undefined;
    }
    if (current.manual_review_required && !input.manual_review_confirmed) {
      return undefined;
    }
  }
  return {
    appeal_id: input.appeal_id,
    status: input.next_status,
    last_updated_at: new Date().toISOString(),
    request_id: generateRequestId()
  };
}
