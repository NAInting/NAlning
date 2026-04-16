import {
  guardianConsentStatusByGuardianId,
  guardianSummaryByGuardianId
} from "@/mocks/data/demo-data";
import type {
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
): Promise<ConsentWriteResponse> {
  await Promise.resolve();
  const shortId = guardianId.split("_").pop() ?? "unknown";
  return {
    consent_id: `consent_${shortId}_${consentType}_v1.1`,
    consent_type: consentType,
    status: "granted",
    version: "v1.1",
    effective_at: "2026-04-14T09:00:00+08:00",
    expires_at: "2026-10-14T09:00:00+08:00",
    request_id: "req_01K601"
  };
}

export async function withdrawConsent(
  consentId: string,
  consentType: string
): Promise<ConsentWriteResponse> {
  await Promise.resolve();
  return {
    consent_id: consentId,
    consent_type: consentType,
    status: "withdrawn",
    version: "v1.0",
    effective_at: "2026-04-15T00:00:00+08:00",
    expires_at: "2026-10-12T08:00:00+08:00",
    request_id: "req_01K603"
  };
}
