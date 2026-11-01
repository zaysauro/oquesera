import 'server-only';
import { logAudit } from '@/lib/brain/audit';

/**
 * Tenant-scoped audit trail for Kumo One operations (site publication,
 * template application, manual billing records…). Reuses the per-client
 * audit table the platform already has (brain_audit_logs). Never throws:
 * an audit write failure is logged but must not undo the user's action.
 */
export async function auditEvent(args: {
  clientId: number;
  actorId?: number | null;
  action: string;
  entityType?: string;
  entityId?: number;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await logAudit({
      clientId: args.clientId,
      actorId: args.actorId ?? null,
      action: args.action,
      entityType: args.entityType,
      entityId: args.entityId,
      metadata: args.metadata,
    });
  } catch (err) {
    console.error('[kumo/audit] failed to record', args.action, err);
  }
}
