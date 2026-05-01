export interface AuditEntry {
  audit_id: string;
  actor_id: string;
  action_type: string;
  target_id?: string;
  reason_code?: string;
  created_at: string;
  hash_prev: string;
  hash_current: string;
}

export class AuditLedger {
  private readonly entries: AuditEntry[] = [];

  append(input: Omit<AuditEntry, "audit_id" | "created_at" | "hash_prev" | "hash_current">): AuditEntry {
    const previous = this.entries.at(-1);
    const audit_id = `audit_${String(this.entries.length + 1).padStart(4, "0")}`;
    const hash_prev = previous?.hash_current ?? "hash_seed_000";
    const hash_current = `hash_${audit_id}`;
    const entry: AuditEntry = {
      ...input,
      audit_id,
      created_at: new Date().toISOString(),
      hash_prev,
      hash_current
    };
    this.entries.push(entry);
    return entry;
  }

  list(): readonly AuditEntry[] {
    return this.entries;
  }
}

export const auditLedger = new AuditLedger();
