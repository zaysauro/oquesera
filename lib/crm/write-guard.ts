import { authorizePortal, isAuthError } from '@/lib/portal-auth';

/**
 * Kumo One: role gate for CRM mutations. The CRM routes resolve the tenant
 * with getPortalClient() and check the CRM entitlement, but did not check the
 * caller's role, so a read-only `viewer` could create, edit or delete CRM
 * records. Every mutating CRM handler calls this first; it returns the error
 * response to send, or null when the caller may write.
 */
export async function crmWriteGuard(): Promise<Response | null> {
  const auth = await authorizePortal({ action: 'write', requireService: 'crm' });
  return isAuthError(auth) ? auth.response : null;
}
