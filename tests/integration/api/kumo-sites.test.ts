/**
 * Kumo One website builder: template creation, one-step publish and footer
 * contact details.
 *
 * Tenancy contract: a website (and its pages, menu, contact form and contact
 * details) belongs to one client. Tenant B gets 404 on every Kumo route that
 * targets tenant A's site, and nothing of A's changes when B tries.
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
import { twoTenants, grantService, type TenantCtx } from '../../helpers/session';
import { getTestSql, TEST_SCHEMA } from '../../helpers/test-db';

type Envelope<T = Record<string, unknown>> = { success: boolean; data: T; message?: string };

async function asTenant(ctx: TenantCtx | null) {
  mockedAuth.mockResolvedValue(ctx?.session ?? null);
}

async function createTemplateSite(subdomain: string, template = 'barbearia') {
  const route = await import('@/app/api/portal/cms/websites/route');
  return callHandler<Envelope<{ id: number }>>(route as unknown as Record<string, unknown>, 'POST', {
    body: {
      name: 'Barbearia Teste',
      subdomain,
      template,
      templateInfo: { company: 'Barbearia Teste', phone: '(11) 3333-4444', email: 'contato@teste.com.br', city: 'Campinas — SP' },
    },
  });
}

async function publish(siteId: number, publish: boolean) {
  const route = await import('@/app/api/portal/cms/websites/[siteId]/publish/route');
  return callHandler<Envelope<{ pages: number; publicAccess: boolean }>>(
    route as unknown as Record<string, unknown>,
    'POST',
    { body: { publish }, params: { siteId: String(siteId) } },
  );
}

async function contact(method: 'GET' | 'PATCH', siteId: number, body?: Record<string, unknown>) {
  const route = await import('@/app/api/portal/websites/[siteId]/contact/route');
  return callHandler<Envelope>(route as unknown as Record<string, unknown>, method, {
    body,
    params: { siteId: String(siteId) },
  });
}

describe('Kumo website templates, publish and contact @kumo @tenancy', () => {
  let A: TenantCtx;
  let B: TenantCtx;

  beforeEach(async () => {
    ({ A, B } = await twoTenants());
    await Promise.all([grantService(A.client.id, 'websites'), grantService(B.client.id, 'websites')]);
  });

  it('creates a site from a template with draft pages, menu, contact form and contact details', async () => {
    await asTenant(A);
    const sub = `kumo-a-${Date.now()}`;
    const res = await createTemplateSite(sub);
    expect(res.status).toBe(200);
    const siteId = (res.data as Envelope<{ id: number }>).data.id;

    const sql = getTestSql();
    const pages = await sql<{ slug: string; published: boolean; post_type: string; seo_title: string | null }[]>`
      SELECT slug, published, post_type, seo_title FROM ${sql(TEST_SCHEMA)}.posts WHERE website_id = ${siteId} ORDER BY slug`;
    expect(pages.map((p) => p.slug)).toEqual(['contato', 'home', 'servicos', 'sobre']);
    expect(pages.every((p) => p.post_type === 'page' && p.published === false && !!p.seo_title)).toBe(true);

    const nav = await sql`SELECT label FROM ${sql(TEST_SCHEMA)}.site_navigation WHERE website_id = ${siteId}`;
    expect(nav.length).toBe(5);

    const [survey] = await sql<{ client_id: number; status: string; linked_id: number }[]>`
      SELECT client_id, status, linked_id FROM ${sql(TEST_SCHEMA)}.surveys WHERE linked_type = 'website' AND linked_id = ${siteId}`;
    expect(survey).toMatchObject({ client_id: A.client.id, status: 'active', linked_id: siteId });

    const [branding] = await sql<{ contact_phone: string; contact_email: string }[]>`
      SELECT contact_phone, contact_email FROM ${sql(TEST_SCHEMA)}.site_branding WHERE website_id = ${siteId}`;
    expect(branding).toMatchObject({ contact_phone: '(11) 3333-4444', contact_email: 'contato@teste.com.br' });
  });

  it('rejects an unknown template without creating a site', async () => {
    await asTenant(A);
    const sub = `kumo-bad-${Date.now()}`;
    const res = await createTemplateSite(sub, 'nao-existe');
    expect(res.status).toBe(400);
    const sql = getTestSql();
    const rows = await sql`SELECT id FROM ${sql(TEST_SCHEMA)}.client_websites WHERE subdomain = ${sub}`;
    expect(rows.length).toBe(0);
  });

  it('publishes every page and opens public access, and records an audit entry', async () => {
    await asTenant(A);
    const siteId = ((await createTemplateSite(`kumo-pub-${Date.now()}`)).data as Envelope<{ id: number }>).data.id;

    const res = await publish(siteId, true);
    expect(res.status).toBe(200);
    expect((res.data as Envelope<{ pages: number }>).data.pages).toBe(4);

    const sql = getTestSql();
    const [site] = await sql<{ public_access: boolean }[]>`
      SELECT public_access FROM ${sql(TEST_SCHEMA)}.client_websites WHERE id = ${siteId}`;
    expect(site.public_access).toBe(true);
    const published = await sql`SELECT id FROM ${sql(TEST_SCHEMA)}.posts WHERE website_id = ${siteId} AND published = true`;
    expect(published.length).toBe(4);
    const audit = await sql`
      SELECT action FROM ${sql(TEST_SCHEMA)}.brain_audit_logs WHERE client_id = ${A.client.id} AND action = 'website.published'`;
    expect(audit.length).toBe(1);

    const off = await publish(siteId, false);
    expect(off.status).toBe(200);
    const [after] = await sql<{ public_access: boolean }[]>`
      SELECT public_access FROM ${sql(TEST_SCHEMA)}.client_websites WHERE id = ${siteId}`;
    expect(after.public_access).toBe(false);
  });

  it("returns 404 to tenant B for publish and contact on tenant A's site, and changes nothing", async () => {
    await asTenant(A);
    const siteId = ((await createTemplateSite(`kumo-iso-${Date.now()}`)).data as Envelope<{ id: number }>).data.id;

    await asTenant(B);
    expect((await publish(siteId, true)).status).toBe(404);
    expect((await contact('GET', siteId)).status).toBe(404);
    expect((await contact('PATCH', siteId, { contactPhone: '(00) 0000-0000' })).status).toBe(404);

    const sql = getTestSql();
    const published = await sql`SELECT id FROM ${sql(TEST_SCHEMA)}.posts WHERE website_id = ${siteId} AND published = true`;
    expect(published.length).toBe(0);
    const [branding] = await sql<{ contact_phone: string }[]>`
      SELECT contact_phone FROM ${sql(TEST_SCHEMA)}.site_branding WHERE website_id = ${siteId}`;
    expect(branding.contact_phone).toBe('(11) 3333-4444');
  });

  it('lets the owner edit contacts without touching colors, and validates e-mail', async () => {
    await asTenant(A);
    const siteId = ((await createTemplateSite(`kumo-ct-${Date.now()}`)).data as Envelope<{ id: number }>).data.id;

    expect((await contact('PATCH', siteId, { contactEmail: 'invalido' })).status).toBe(400);
    const ok = await contact('PATCH', siteId, { contactWhatsapp: '(11) 98888-7777', contactAddress: 'Rua A, 1\nCentro' });
    expect(ok.status).toBe(200);

    const got = await contact('GET', siteId);
    expect((got.data as Envelope).data).toMatchObject({
      contactWhatsapp: '(11) 98888-7777',
      contactAddress: 'Rua A, 1\nCentro',
      contactPhone: '(11) 3333-4444',
    });
    const sql = getTestSql();
    const [b] = await sql<{ primary_color: string }[]>`
      SELECT primary_color FROM ${sql(TEST_SCHEMA)}.site_branding WHERE website_id = ${siteId}`;
    expect(b.primary_color).toBe('#111111'); // barbearia template color untouched
  });
});
