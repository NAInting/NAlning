import {
  adminAuditPreview,
  adminByAdminId,
  adminCompliance,
  adminPreflight,
  appealQueueForAdmin,
  studentScoresByToken
} from "@/mocks/data/demo-data";
import { generateRequestId } from "@/shared/utils/requestId";
import type {
  AdminAuditPreview,
  AdminComplianceSummary,
  AdminPreflightSummary,
  AdminScoringOverview,
  AppealAdvanceInput,
  AppealItem,
  AppealQueueResponse,
  AppealStatus,
  AppealWriteResponse,
  ScoreAcceptResponse,
  StudentScoreRecord
} from "@/types/demo";

export async function getAdminPreflight(
  adminId: string
): Promise<AdminPreflightSummary | undefined> {
  await Promise.resolve();
  if (!adminId || !isKnownAdmin(adminId)) {
    return undefined;
  }
  return adminPreflight;
}

export async function getAdminCompliance(
  adminId: string
): Promise<AdminComplianceSummary | undefined> {
  await Promise.resolve();
  if (!adminId || !isKnownAdmin(adminId)) {
    return undefined;
  }
  return adminCompliance;
}

export async function getAdminAuditPreview(
  adminId: string
): Promise<AdminAuditPreview | undefined> {
  await Promise.resolve();
  if (!adminId || !isKnownAdmin(adminId)) {
    return undefined;
  }
  return adminAuditPreview;
}

function isKnownAdmin(adminId: string): boolean {
  return adminId in adminByAdminId;
}

const mutableAppealQueue: AppealItem[] = appealQueueForAdmin.items.map((item) => ({ ...item }));

export async function getAppealQueue(
  adminId: string
): Promise<AppealQueueResponse | undefined> {
  await Promise.resolve();
  if (!adminId || !isKnownAdmin(adminId)) {
    return undefined;
  }
  return {
    generated_at: appealQueueForAdmin.generated_at,
    items: mutableAppealQueue.map((item) => ({ ...item }))
  };
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
  if (!isKnownAdmin(input.admin_id)) {
    return undefined;
  }
  const current = mutableAppealQueue.find(
    (it) => it.appeal_id === input.appeal_id
  );
  if (!current) {
    return undefined;
  }
  if (!ALLOWED_TRANSITIONS[current.status].includes(input.next_status)) {
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
  current.status = input.next_status;
  current.last_updated_at = new Date().toISOString();
  if (input.resolution_note) {
    current.resolution_note = input.resolution_note;
  }
  return {
    appeal_id: input.appeal_id,
    status: input.next_status,
    last_updated_at: current.last_updated_at,
    request_id: generateRequestId()
  };
}

const allScores: StudentScoreRecord[] = Object.values(studentScoresByToken).flatMap(
  (entry) => entry.items.map((item) => ({ ...item, dimensions: [...item.dimensions] }))
);

export async function getAdminScoringOverview(
  adminId: string
): Promise<AdminScoringOverview | undefined> {
  await Promise.resolve();
  if (!adminId || !isKnownAdmin(adminId)) {
    return undefined;
  }
  return {
    generated_at: new Date().toISOString(),
    total_scores: allScores.length,
    released_count: allScores.filter((s) => s.status === "released" || s.status === "corrected").length,
    added_to_record_count: allScores.filter((s) => s.added_to_record).length,
    items: allScores.map((s) => ({ ...s }))
  };
}

const ACCEPT_CONFIDENCE_THRESHOLD = 0.7;

export async function acceptScoreToRecord(
  adminId: string,
  scoreId: string
): Promise<ScoreAcceptResponse | undefined> {
  await Promise.resolve();
  if (!adminId || !scoreId || !isKnownAdmin(adminId)) {
    return undefined;
  }
  const score = allScores.find((s) => s.score_id === scoreId);
  if (!score) {
    return undefined;
  }
  if (score.status !== "released" && score.status !== "corrected") {
    return undefined;
  }
  if (score.composite_confidence < ACCEPT_CONFIDENCE_THRESHOLD) {
    return undefined;
  }
  if (score.added_to_record) {
    return undefined;
  }
  const now = new Date().toISOString();
  score.added_to_record = true;
  score.added_to_record_at = now;
  score.added_to_record_by = adminId;
  return {
    score_id: scoreId,
    added_to_record: true,
    added_to_record_at: now,
    request_id: generateRequestId()
  };
}
