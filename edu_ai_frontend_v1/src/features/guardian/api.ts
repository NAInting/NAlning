import {
  guardianConsentStatusByGuardianId,
  guardianSummaryByGuardianId
} from "@/mocks/data/demo-data";
import type {
  ConsentStatusResponse,
  ConsentWriteResponse,
  GuardianSummaryViewModel
} from "@/types/demo";

function generateRequestId(): string {
  const random =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 10)
      : Math.random().toString(36).slice(2, 12);
  return `req_${random}`;
}

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
