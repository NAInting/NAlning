import { adminAuditPreview, adminCompliance, adminPreflight } from "@/mocks/data/demo-data";
import type { AdminAuditPreview, AdminComplianceSummary, AdminPreflightSummary } from "@/types/demo";

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
