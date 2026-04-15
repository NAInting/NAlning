import { guardianConsentStatus, guardianSummary } from "@/mocks/data/demo-data";
import type {
  ConsentStatusResponse,
  ConsentWriteResponse,
  GuardianSummaryViewModel
} from "@/types/demo";

export async function getGuardianSummary(): Promise<GuardianSummaryViewModel> {
  await Promise.resolve();
  return guardianSummary;
}

export async function getConsentStatus(): Promise<ConsentStatusResponse> {
  await Promise.resolve();
  return guardianConsentStatus;
}

export async function createConsent(): Promise<ConsentWriteResponse> {
  await Promise.resolve();
  return {
    consent_id: "consent_guardian_001_guardian_summary_v1_1",
    status: "granted",
    version: "v1.1",
    effective_at: "2026-04-14T09:00:00+08:00",
    expires_at: "2026-10-14T09:00:00+08:00",
    request_id: "req_01K601"
  };
}

export async function withdrawConsent(consentId: string): Promise<ConsentWriteResponse> {
  await Promise.resolve();
  return {
    consent_id: consentId,
    status: "withdrawn",
    version: "v1.0",
    effective_at: "2026-04-15T00:00:00+08:00",
    expires_at: "2026-10-12T08:00:00+08:00",
    request_id: "req_01K603"
  };
}
