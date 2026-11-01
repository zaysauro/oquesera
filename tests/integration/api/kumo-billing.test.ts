/**
 * Kumo One billing safety: with no payment provider configured, self-serve
 * checkout must refuse instead of granting a paid plan for free — unless the
 * operator explicitly opts in with BILLING_ALLOW_UNPAID_ACTIVATION=true.
 */
import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from 'vitest';

vi.mock('@/lib/auth', () => ({ auth: vi.fn() }));

import { auth } from '@/lib/auth';
const mockedAuth = auth as unknown as Mock;

import { callHandler } from '../../helpers/call-handler';
import { sessionForNewClientUser, type TenantCtx } from '../../helpers/session';
import { getTestSql, TEST_SCHEMA } from '../../helpers/test-db';

async function checkout(slug: string) {
  const route = await import('@/app/api/portal/billing/modules/checkout/route');
  return callHandler<{ success: boolean; message?: string; data?: { bypassed?: boolean } }>(
    route as unknown as Record<string, unknown>,
    'POST',
    { body: { slug } },
  );
}

describe('Kumo checkout without a payment provider @kumo @billing', () => {
  let A: TenantCtx;
  const saved = { stripe: process.env.STRIPE_SECRET_KEY, allow: process.env.BILLING_ALLOW_UNPAID_ACTIVATION };

  beforeEach(async () => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.BILLING_ALLOW_UNPAID_ACTIVATION;
    A = await sessionForNewClientUser('kumo-billing');
    mockedAuth.mockResolvedValue(A.session);
    const sql = getTestSql();
    await sql`UPDATE ${sql(TEST_SCHEMA)}.clients SET billing_mode = 'saas' WHERE id = ${A.client.id}`;
    await sql`
      INSERT INTO ${sql(TEST_SCHEMA)}.services (name, slug, category, price, billing_cycle, active)
      VALUES ('Essencial', 'plan-starter', 'plan-starter', 4990, 'monthly', true)
      ON CONFLICT (slug) DO NOTHING`;
  });

  afterEach(() => {
    if (saved.stripe === undefined) delete process.env.STRIPE_SECRET_KEY; else process.env.STRIPE_SECRET_KEY = saved.stripe;
    if (saved.allow === undefined) delete process.env.BILLING_ALLOW_UNPAID_ACTIVATION; else process.env.BILLING_ALLOW_UNPAID_ACTIVATION = saved.allow;
  });

  async function activeServices() {
    const sql = getTestSql();
    return sql`SELECT id FROM ${sql(TEST_SCHEMA)}.client_services WHERE client_id = ${A.client.id} AND status = 'active'`;
  }

  it('refuses (503) and grants nothing by default', async () => {
    const res = await checkout('plan-starter');
    expect(res.status).toBe(503);
    expect(await activeServices()).toHaveLength(0);
  });

  it('grants locally only when the operator opts in', async () => {
    process.env.BILLING_ALLOW_UNPAID_ACTIVATION = 'true';
    const res = await checkout('plan-starter');
    expect(res.status).toBe(200);
    expect(res.data?.data?.bypassed).toBe(true);
    expect(await activeServices()).toHaveLength(1);
  });
});

describe('Kumo plan tiers grant their modules @kumo @billing @tenancy', () => {
  it('Essencial grants CRM and bookings but not e-mail marketing; Profissional grants e-mail', async () => {
    const { hasServiceAccess } = await import('@/lib/portal-auth');
    const C = await sessionForNewClientUser('kumo-tier');
    const sql = getTestSql();
    await sql`UPDATE ${sql(TEST_SCHEMA)}.clients SET billing_mode = 'saas' WHERE id = ${C.client.id}`;
    for (const [slug, price] of [['plan-starter', 4990], ['plan-growth', 9990]] as const) {
      await sql`
        INSERT INTO ${sql(TEST_SCHEMA)}.services (name, slug, category, price, billing_cycle, active)
        VALUES (${slug}, ${slug}, ${slug}, ${price}, 'monthly', true) ON CONFLICT (slug) DO NOTHING`;
    }
    const [starter] = await sql<{ id: number }[]>`SELECT id FROM ${sql(TEST_SCHEMA)}.services WHERE slug = 'plan-starter'`;
    await sql`INSERT INTO ${sql(TEST_SCHEMA)}.client_services (client_id, service_id, status) VALUES (${C.client.id}, ${starter.id}, 'active')`;
    expect(await hasServiceAccess(C.client.id, 'crm')).toBe(true);
    expect(await hasServiceAccess(C.client.id, 'booking')).toBe(true);
    expect(await hasServiceAccess(C.client.id, 'websites')).toBe(true);
    expect(await hasServiceAccess(C.client.id, 'email')).toBe(false);

    const [growth] = await sql<{ id: number }[]>`SELECT id FROM ${sql(TEST_SCHEMA)}.services WHERE slug = 'plan-growth'`;
    await sql`UPDATE ${sql(TEST_SCHEMA)}.client_services SET service_id = ${growth.id} WHERE client_id = ${C.client.id}`;
    expect(await hasServiceAccess(C.client.id, 'email')).toBe(true);
    expect(await hasServiceAccess(C.client.id, 'store')).toBe(false);
  });
});
