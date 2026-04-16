import {
  appealsByGuardianId,
  guardianConsentStatusByGuardianId,
  guardianSummaryByGuardianId
} from "@/mocks/data/demo-data";
import { generateRequestId } from "@/shared/utils/requestId";
import type {
  AppealCreateInput,
  AppealListResponse,
  AppealWriteResponse,
  ConsentStatusResponse,
  ConsentWriteResponse,
  GuardianSummaryViewModel
} from "@/types/demo";

export async function getGuardianSummary(
  guardianId: string
): Promise<GuardianSummaryViewModel | undefined> {
  await Promise.resolve();
  if (!guardianId) {
    return undefined;
  }
  const match =
    guardianSummaryByGuardianId[guardianId as keyof typeof guardianSummaryByGuardianId];
  return match ? (match as GuardianSummaryViewModel) : undefined;
}

export async function getConsentStatus(
  guardianId: string
): Promise<ConsentStatusResponse | undefined> {
  await Promise.resolve();
  if (!guardianId) {
    return undefined;
  }
  const match =
    guardianConsentStatusByGuardianId[
      guardianId as keyof typeof guardianConsentStatusByGuardianId
    ];
  return match ? (match as ConsentStatusResponse) : undefined;
}

export async function createConsent(
  guardianId: string,
  consentType: string
): Promise<ConsentWriteResponse | undefined> {
  await Promise.resolve();
  if (!guardianId || !consentType) {
    return undefined;
  }
  const status =
    guardianConsentStatusByGuardianId[
      guardianId as keyof typeof guardianConsentStatusByGuardianId
    ];
  if (!status) {
    return undefined;
  }
  const owns = status.items.some((item) => item.consent_type === consentType);
  if (!owns) {
    return undefined;
  }
  const shortId = guardianId.split("_").pop() ?? "unknown";
  const now = new Date();
  const expires = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 183);
  return {
    consent_id: `consent_${shortId}_${consentType}_v1.1`,
    consent_type: consentType,
    status: "granted",
    version: "v1.1",
    effective_at: now.toISOString(),
    expires_at: expires.toISOString(),
    request_id: generateRequestId()
  };
}

export async function withdrawConsent(
  guardianId: string,
  consentId: string,
  consentType: string
): Promise<ConsentWriteResponse | undefined> {
  await Promise.resolve();
  if (!guardianId || !consentId || !consentType) {
    return undefined;
  }
  const status =
    guardianConsentStatusByGuardianId[
      guardianId as keyof typeof guardianConsentStatusByGuardianId
    ];
  if (!status) {
    return undefined;
  }
  const owns = status.items.some(
    (item) => item.consent_type === consentType
  );
  if (!owns) {
    return undefined;
  }
  const now = new Date();
  return {
    consent_id: consentId,
    consent_type: consentType,
    status: "withdrawn",
    version: "v1.0",
    effective_at: now.toISOString(),
    expires_at: now.toISOString(),
    request_id: generateRequestId()
  };
}

export async function getMyAppeals(
  guardianId: string
): Promise<AppealListResponse | undefined> {
  await Promise.resolve();
  if (!guardianId) {
    return undefined;
  }
  const match =
    appealsByGuardianId[guardianId as keyof typeof appealsByGuardianId];
  return match ? (match as AppealListResponse) : undefined;
}

export async function createAppeal(
  input: AppealCreateInput
): Promise<AppealWriteResponse | undefined> {
  await Promise.resolve();
  if (
    !input.guardian_id ||
    !input.student_token ||
    !input.target_ref.trim() ||
    !input.reason.trim()
  ) {
    return undefined;
  }
  const consent =
    guardianConsentStatusByGuardianId[
      input.guardian_id as keyof typeof guardianConsentStatusByGuardianId
    ];
  if (!consent || consent.student_token !== input.student_token) {
    return undefined;
  }
  const now = new Date().toISOString();
  const shortId = input.guardian_id.split("_").pop() ?? "unknown";
  return {
    appeal_id: `appeal_${shortId}_${Date.now().toString(36)}`,
    status: "submitted",
    last_updated_at: now,
    request_id: generateRequestId()
  };
}
