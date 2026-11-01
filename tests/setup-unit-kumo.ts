import { vi } from 'vitest';

// Unit tests of CRM route handlers stub getPortalClient() and the DB; the
// role guard added by Kumo One (lib/crm/write-guard.ts) would otherwise reach
// the real auth layer. It is exercised against a real database in
// tests/integration/api/kumo-roles.test.ts.
vi.mock('@/lib/crm/write-guard', () => ({ crmWriteGuard: vi.fn(async () => null) }));
