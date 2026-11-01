/**
 * Kumo One permission checks: a `viewer` member of a company can read but
 * cannot create CRM records, automations or publish the company website; a
 * `member` can create CRM records. Runs against the real test database.
 */
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }));
vi.mock('next/cache', () => ({
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
  unstable_cache: <T extends (...args: never[]) => unknown>(fn: T) => fn,
}));

import { auth } from '@/lib/auth';
const mockedAuth = auth as unknown as Mock;

import { callHandler } from '../../helpers/call-handler';
import { sessionFor, sessionForNewClientUser, grantService, type TenantCtx } from '../../helpers/session';
import { getTestSql, TEST_SCHEMA } from '../../helpers/test-db';

async function addMember(owner: TenantCtx, role: 'viewer' | 'member') {
  const sql = getTestSql();
  const email = `${role}-${Date.now()}-${Math.floor(Math.random() * 9999)}@test.local`;
  const [u] = await sql<{ id: number }[]>`
    INSERT INTO ${sql(TEST_SCHEMA)}.users (name, email, password, role, active)
    VALUES (${role}, ${email}, ${'x'}, 'client', true) RETURNING id`;
  await sql`
    INSERT INTO ${sql(TEST_SCHEMA)}.client_members (client_id, user_id, role)
    VALUES (${owner.client.id}, ${u.id}, ${role})`;
  // Make the owner's company the member's active company.
  await sql`UPDATE ${sql(TEST_SCHEMA)}.users SET default_client_id = ${owner.client.id} WHERE id = ${u.id}`.catch(() => {});
  return sessionFor({ id: u.id, role: 'client', email, name: role });
}

async function createContact() {
  const route = await import('@/app/api/portal/crm/contacts/route');
  return callHandler(route as unknown as Record<string, unknown>, 'POST', { body: { firstName: 'Ana', email: 'ana@exemplo.com' } });
}

describe('Kumo role permissions @kumo @tenancy', () => {
  let owner: TenantCtx;

  beforeEach(async () => {
    owner = await sessionForNewClientUser('kumo-roles');
    await Promise.all([grantService(owner.client.id, 'crm'), grantService(owner.client.id, 'websites')]);
  });

  it('viewer cannot create a CRM contact; member and owner can', async () => {
    mockedAuth.mockResolvedValue(await addMember(owner, 'viewer'));
    const denied = await createContact();
    expect(denied.status).toBe(403);

    mockedAuth.mockResolvedValue(await addMember(owner, 'member'));
    expect((await createContact()).status).toBe(201);

    mockedAuth.mockResolvedValue(owner.session);
    expect((await createContact()).status).toBe(201);

    const sql = getTestSql();
    const rows = await sql`SELECT id FROM ${sql(TEST_SCHEMA)}.crm_contacts WHERE client_id = ${owner.client.id}`;
    expect(rows.length).toBe(2);
  }, 60_000);

  it('viewer cannot create an automation or publish the website', async () => {
    mockedAuth.mockResolvedValue(owner.session);
    const sites = await import('@/app/api/portal/cms/websites/route');
    const created = await callHandler<{ data: { id: number } }>(sites as unknown as Record<string, unknown>, 'POST', {
      body: { name: 'Site Viewer', subdomain: `kumo-viewer-${Date.now()}-${Math.floor(Math.random() * 1e6)}`, template: 'comercio', templateInfo: { company: 'Loja' } },
    });
    expect(created.status).toBe(200);
    const siteId = (created.data as { data: { id: number } }).data.id;

    mockedAuth.mockResolvedValue(await addMember(owner, 'viewer'));
    const automations = await import('@/app/api/portal/automations/route');
    const a = await callHandler(automations as unknown as Record<string, unknown>, 'POST', {
      body: { name: 'x', trigger: { event: 'crm.contact.created' }, actions: [{ tool: 'create_support_ticket', params: { subject: 'x' } }] },
    });
    expect(a.status).toBe(403);

    const publish = await import('@/app/api/portal/cms/websites/[siteId]/publish/route');
    const p = await callHandler(publish as unknown as Record<string, unknown>, 'POST', {
      body: { publish: true },
      params: { siteId: String(siteId) },
    });
    expect(p.status).toBe(403);
  }, 60_000);
});
