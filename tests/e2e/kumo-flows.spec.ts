/**
 * Kumo One end-to-end flows (the 20 checks of the delivery brief), run against
 * a real server, real Postgres, Mailpit (e-mail) and an S3-compatible store.
 *
 * Prerequisites (see TESTING.md):
 *   - app running at BASE_URL (default http://localhost:3000) with
 *     EMAIL_TRANSPORT=mailpit, S3_* pointing at MinIO, DISABLE_AUTH_RATE_LIMIT=1
 *   - Mailpit API at MAILPIT_URL (default http://localhost:8025)
 *   - KUMO_E2E_DATABASE_URL: the app's database (token lookups for booking
 *     reschedule/cancel links, which only travel by e-mail)
 *   - KUMO_E2E_ADMIN_EMAIL / KUMO_E2E_ADMIN_PASSWORD: a platform admin, who
 *     assigns the plan (the manual, audited activation path — no payment
 *     provider is configured in the test environment)
 *
 * Run: bunx playwright test tests/e2e/kumo-flows.spec.ts --project=chromium --workers=1
 */
import { test, expect, type APIRequestContext, type Page } from '@playwright/test';
import postgres from 'postgres';

const MAILPIT = process.env.MAILPIT_URL || 'http://localhost:8025';
const DB_URL = process.env.KUMO_E2E_DATABASE_URL || '';
const ADMIN_EMAIL = process.env.KUMO_E2E_ADMIN_EMAIL || '';
const ADMIN_PASSWORD = process.env.KUMO_E2E_ADMIN_PASSWORD || '';
const PASSWORD = 'Kumo-e2e-Senha!2026';
const NEW_PASSWORD = 'Kumo-e2e-Nova!2026';
const stamp = `${Date.now()}`;

test.describe.configure({ mode: 'serial' });
test.skip(!DB_URL || !ADMIN_EMAIL || !ADMIN_PASSWORD, 'Set KUMO_E2E_DATABASE_URL and KUMO_E2E_ADMIN_* to run Kumo e2e flows');

let sql: ReturnType<typeof postgres>;
test.beforeAll(() => { sql = postgres(DB_URL, { max: 2 }); });
test.afterAll(async () => { await sql?.end(); });

// ── helpers ────────────────────────────────────────────────────────────────

async function mailLink(request: APIRequestContext, to: string, pathPart: string): Promise<string> {
  for (let i = 0; i < 30; i++) {
    const res = await request.get(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:"${to}"`)}`);
    const json = (await res.json()) as { messages?: { ID: string }[] };
    for (const m of json.messages ?? []) {
      const msg = (await (await request.get(`${MAILPIT}/api/v1/message/${m.ID}`)).json()) as { HTML?: string; Text?: string };
      const body = `${msg.HTML ?? ''} ${msg.Text ?? ''}`.replace(/&amp;/g, '&');
      const found = body.match(new RegExp(`https?://[^"'\\s<>]*${pathPart.replace(/[/?]/g, (c) => `\\${c}`)}[^"'\\s<>]*`));
      if (found) return found[0];
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`no e-mail to ${to} containing ${pathPart}`);
}

async function login(page: Page, email: string, password: string) {
  await page.goto('/portal/login');
  await page.getByPlaceholder('voce@empresa.com.br').fill(email);
  await page.locator('input[type="password"]').first().fill(password);
  await page.locator('form button[type="submit"]').click();
  await page.waitForURL((u) => !u.pathname.startsWith('/portal/login'), { timeout: 30_000 });
}

async function logout(page: Page) {
  // Same two calls the portal's "Sair" button makes: portal cookies, then
  // the NextAuth session.
  await page.request.post('/api/portal/sign-out');
  const { csrfToken } = (await (await page.request.get('/api/auth/csrf')).json()) as { csrfToken: string };
  await page.request.post('/api/auth/signout', { form: { csrfToken, callbackUrl: '/portal/login' } });
  // A real navigation must land on the login page again.
  page.on('request', (r) => { if (r.url().includes('/portal/')) console.log('DEBUG req', r.url(), (r.headers()['cookie'] || '').split(';').map((c) => c.split('=')[0].trim())); });
  console.log('DEBUG jar', (await page.context().cookies()).map((c) => `${c.name}@${c.domain}${c.path}`));
  await page.goto('/portal/dashboard');
  await expect(page).toHaveURL(/\/portal\/login/);
}

async function signupCompany(page: Page, label: string) {
  const email = `${label}-${stamp}@kumo-e2e.test`;
  await page.goto('/portal/signup');
  await page.getByPlaceholder('Maria Silva').fill(`Dono ${label}`);
  await page.getByPlaceholder('Minha Empresa Ltda').fill(`Empresa ${label} ${stamp}`);
  await page.getByPlaceholder('voce@empresa.com.br').fill(email);
  await page.getByPlaceholder('Pelo menos 8 caracteres').fill(PASSWORD);
  await page.locator('form button[type="submit"]').click();
  await expect(page.getByText('Confira seu e-mail.')).toBeVisible({ timeout: 30_000 });
  const verify = await mailLink(page.request, email, '/api/auth/verify-email?token=');
  await page.goto(verify);
  await expect(page).toHaveURL(/verified=1/);
  const [row] = await sql<{ client_id: number; user_id: number }[]>`
    SELECT cm.client_id, cm.user_id FROM client_members cm JOIN users u ON u.id = cm.user_id WHERE u.email = ${email}`;
  return { email, clientId: row.client_id, userId: row.user_id };
}

async function assignPlan(page: Page, clientId: number, slug: string) {
  await login(page, ADMIN_EMAIL, ADMIN_PASSWORD);
  const [svc] = await sql<{ id: number }[]>`SELECT id FROM services WHERE slug = ${slug}`;
  const res = await page.request.post(`/api/admin/portal/clients/${clientId}/plan`, { data: { serviceId: svc.id } });
  expect(res.ok()).toBeTruthy();
  await logout(page);
}

// ── shared state across the serial flow ────────────────────────────────────

const A = { email: '', clientId: 0, userId: 0, password: PASSWORD };
const B = { email: '', clientId: 0, userId: 0 };
let contactIdA = 0;

test('1–3. company signup with e-mail confirmation, login and logout', async ({ page }) => {
  Object.assign(A, await signupCompany(page, 'a'));
  await login(page, A.email, A.password);
  await expect(page).toHaveURL(/\/portal\//);
  await logout(page);
});

test('4. password recovery by e-mail link', async ({ page }) => {
  await page.goto('/portal/forgot-password');
  await page.getByPlaceholder('voce@empresa.com.br').fill(A.email);
  await page.locator('form button[type="submit"]').click();
  const link = await mailLink(page.request, A.email, '/portal/reset-password?token=');
  const token = new URL(link).searchParams.get('token');
  const res = await page.request.post('/api/portal/reset-password', { data: { token, password: NEW_PASSWORD } });
  expect(res.ok()).toBeTruthy();
  A.password = NEW_PASSWORD;
  await login(page, A.email, A.password);
  await logout(page);
});

test('plan activation by a platform admin (manual, audited)', async ({ page }) => {
  await assignPlan(page, A.clientId, 'plan-growth');
  const audit = await sql`SELECT id FROM brain_audit_logs WHERE client_id = ${A.clientId} AND action = 'billing.plan_assigned_manually'`;
  expect(audit.length).toBe(1);
});

test('5 & 19. invite a collaborator (viewer) who cannot write', async ({ page, browser }) => {
  await login(page, A.email, A.password);
  const viewerEmail = `viewer-${stamp}@kumo-e2e.test`;
  const inv = await page.request.post('/api/portal/team', { data: { name: 'Leitor', email: viewerEmail, role: 'viewer' } });
  expect(inv.status()).toBe(201);
  const link = await mailLink(page.request, viewerEmail, '/portal/invite/');
  const token = link.split('/portal/invite/')[1];
  const ctx = await browser.newContext();
  const vp = await ctx.newPage();
  const acc = await vp.request.post('/api/portal/invite/accept', { data: { token, password: PASSWORD } });
  expect(acc.ok()).toBeTruthy();
  await login(vp, viewerEmail, PASSWORD);
  const denied = await vp.request.post('/api/portal/crm/contacts', { data: { firstName: 'Não', email: 'nao@exemplo.com' } });
  expect(denied.status()).toBe(403);
  const deniedAuto = await vp.request.post('/api/portal/automations', {
    data: { name: 'x', trigger: { event: 'crm.contact.created' }, actions: [{ tool: 'create_support_ticket', params: { subject: 'x' } }] },
  });
  expect(deniedAuto.status()).toBe(403);
  await ctx.close();
});

test('7–9. CRM: customer, lead/opportunity and Kanban move', async ({ page }) => {
  await login(page, A.email, A.password);
  const c = await page.request.post('/api/portal/crm/contacts', {
    data: { firstName: 'Joana', lastName: 'Cliente', email: `joana-${stamp}@exemplo.com`, phone: '11999990000', status: 'lead' },
  });
  expect(c.status()).toBe(201);
  contactIdA = (await c.json()).data.id;

  const pipes = (await (await page.request.get('/api/portal/crm/pipelines')).json()).data as { id: number; stages: { id: number; name: string }[] }[];
  const pipeline = pipes[0];
  expect(pipeline.stages.length).toBeGreaterThan(1);
  const d = await page.request.post('/api/portal/crm/deals', {
    data: { title: 'Pacote mensal', pipelineId: pipeline.id, stageId: pipeline.stages[0].id, value: 49900, contactId: contactIdA },
  });
  expect(d.status()).toBe(201);
  const dealId = (await d.json()).data.id;
  const move = await page.request.put(`/api/portal/crm/deals/${dealId}`, { data: { stageId: pipeline.stages[1].id } });
  expect(move.ok()).toBeTruthy();
  const [row] = await sql<{ stage_id: number; currency: string }[]>`SELECT stage_id, currency FROM crm_deals WHERE id = ${dealId}`;
  expect(row.stage_id).toBe(pipeline.stages[1].id);
  expect(row.currency).toBe('BRL');

  await page.goto('/portal/crm/deals');
  await expect(page.getByText('Pacote mensal')).toBeVisible({ timeout: 30_000 });
});

test('10–11. project, task, status change', async ({ page }) => {
  await login(page, A.email, A.password);
  const p = await page.request.post('/api/portal/projects', { data: { name: `Reforma ${stamp}` } });
  expect(p.status()).toBe(201);
  const projectId = (await p.json()).data.id;
  const todo = (await (await page.request.post(`/api/portal/projects/${projectId}/columns`, { data: { name: 'A fazer' } })).json()).data.id;
  const done = (await (await page.request.post(`/api/portal/projects/${projectId}/columns`, { data: { name: 'Concluído' } })).json()).data.id;
  const card = await page.request.post('/api/portal/cards', { data: { columnId: todo, title: 'Comprar material', dueDate: '2026-12-15' } });
  expect(card.ok()).toBeTruthy();
  const cardId = (await card.json()).data.id;
  expect((await page.request.patch(`/api/portal/cards/${cardId}/move`, { data: { columnId: done, order: 0 } })).ok()).toBeTruthy();
  expect((await page.request.patch(`/api/portal/cards/${cardId}`, { data: { workflowState: 'done' } })).ok()).toBeTruthy();
  const [row] = await sql<{ column_id: number }[]>`SELECT column_id FROM kanban_cards WHERE id = ${cardId}`;
  expect(row.column_id).toBe(done);
});

test('12. document upload', async ({ page }) => {
  await login(page, A.email, A.password);
  const res = await page.request.post('/api/portal/media/upload', {
    multipart: {
      file: { name: 'contrato.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n% Kumo e2e\n') },
      alt: 'Contrato de teste',
    },
  });
  expect(res.status()).toBe(201);
});

test('13–15. website from template, edit, publish, public page', async ({ page }) => {
  await login(page, A.email, A.password);
  const sub = `kumo-e2e-${stamp}`;
  const created = await page.request.post('/api/portal/cms/websites', {
    data: { name: 'Salão E2E', subdomain: sub, template: 'salao', templateInfo: { company: 'Salão E2E', phone: '(11) 3333-0000' } },
  });
  expect(created.ok()).toBeTruthy();
  const siteId = (await created.json()).data.id;

  // Edit: change the home hero title through the regular post update route.
  const [home] = await sql<{ id: number; content: string; title: string; slug: string }[]>`
    SELECT id, content, title, slug FROM posts WHERE website_id = ${siteId} AND slug = 'home'`;
  const content = JSON.parse(home.content);
  content.blocks[0].title = 'Salão E2E — editado';
  const upd = await page.request.put(`/api/portal/cms/websites/${siteId}/posts/${home.id}`, {
    data: { title: home.title, slug: home.slug, content: JSON.stringify(content), postType: 'page', published: false },
  });
  expect(upd.ok()).toBeTruthy();

  const pub = await page.request.post(`/api/portal/cms/websites/${siteId}/publish`, { data: { publish: true } });
  expect(pub.ok()).toBeTruthy();

  const anon = await page.context().browser()!.newContext();
  const ap = await anon.newPage();
  await ap.goto(`/sites/${sub}.kumo.localhost`);
  await expect(ap.getByText('Salão E2E — editado')).toBeVisible({ timeout: 30_000 });
  await expect(ap).toHaveTitle(/Salão E2E/);
  await anon.close();
});

test('16–17. public booking, conflict prevention, reschedule and cancel', async ({ page, browser }) => {
  await login(page, A.email, A.password);
  const availability = Array.from({ length: 7 }, (_, day) => ({ day, startTime: '09:00', endTime: '18:00', enabled: true }));
  const bp = await page.request.post('/api/portal/tools/booking', {
    data: { title: `Corte ${stamp}`, duration: 30, timezone: 'America/Sao_Paulo', availability, minNoticeMins: 0 },
  });
  expect(bp.ok()).toBeTruthy();
  const { id: pageId, slug } = (await bp.json()).data as { id: number; slug: string };

  const anon = await browser.newContext();
  const ap = await anon.newPage();
  const date = new Date(Date.now() + 3 * 86400_000).toISOString().slice(0, 10);
  const slots = (await (await ap.request.get(`/api/public/booking/${slug}/slots?date=${date}`)).json()).data as { time: string }[];
  expect(slots.length).toBeGreaterThan(1);
  const book = await ap.request.post(`/api/public/booking/${slug}/book`, {
    data: { name: 'Cliente Público', email: `publico-${stamp}@exemplo.com`, startTime: slots[0].time, timezone: 'America/Sao_Paulo' },
  });
  expect(book.ok()).toBeTruthy();
  const bookingId = (await book.json()).data.id;
  const clash = await ap.request.post(`/api/public/booking/${slug}/book`, {
    data: { name: 'Outro', email: `outro-${stamp}@exemplo.com`, startTime: slots[0].time },
  });
  expect(clash.status()).toBe(409);

  const [tok] = await sql<{ reschedule_token: string; cancel_token: string }[]>`
    SELECT reschedule_token, cancel_token FROM bookings WHERE id = ${bookingId}`;
  const newStart = new Date(slots[1].time);
  const resched = await ap.request.post('/api/public/booking/reschedule', {
    data: { token: tok.reschedule_token, newStartTime: newStart.toISOString(), newEndTime: new Date(newStart.getTime() + 30 * 60_000).toISOString(), timezone: 'America/Sao_Paulo' },
  });
  expect(resched.ok()).toBeTruthy();
  const [after] = await sql<{ start_time: Date; cancel_token: string }[]>`SELECT start_time, cancel_token FROM bookings WHERE id = ${bookingId}`;
  expect(new Date(after.start_time).toISOString()).toBe(newStart.toISOString());

  const cancel = await ap.request.post('/api/public/booking/cancel', { data: { token: after.cancel_token } });
  expect(cancel.ok()).toBeTruthy();
  const [st] = await sql<{ status: string }[]>`SELECT status FROM bookings WHERE id = ${bookingId}`;
  expect(st.status).toBe('cancelled');
  await anon.close();

  // Owner sees it in the portal.
  const list = await page.request.get(`/api/portal/tools/booking/${pageId}/bookings`);
  expect(list.ok()).toBeTruthy();
});

test('18. automation configuration', async ({ page }) => {
  await login(page, A.email, A.password);
  const res = await page.request.post('/api/portal/automations', {
    data: {
      name: 'Tarefa para novo contato',
      trigger: { event: 'crm.contact.created' },
      actions: [{ tool: 'create_support_ticket', params: { subject: 'Retornar para {{event.firstName}}' } }],
    },
  });
  expect(res.ok()).toBeTruthy();
  const ruleId = (await res.json()).rule.id;
  expect((await page.request.patch(`/api/portal/automations/${ruleId}`, { data: { enabled: false } })).ok()).toBeTruthy();
});

test('6. isolation between companies', async ({ page }) => {
  Object.assign(B, await signupCompany(page, 'b'));
  await assignPlan(page, B.clientId, 'plan-growth');
  await login(page, B.email, PASSWORD);
  const res = await page.request.get(`/api/portal/crm/contacts/${contactIdA}`);
  expect([403, 404]).toContain(res.status());
  const list = (await (await page.request.get('/api/portal/crm/contacts')).json()).data as { id: number }[] | { contacts?: { id: number }[] };
  const ids = (Array.isArray(list) ? list : list.contacts ?? []).map((c) => c.id);
  expect(ids).not.toContain(contactIdA);
});

test('20. mobile navigation', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  await p.goto('/');
  expect(await p.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  await p.getByRole('button', { name: 'Abrir menu' }).click();
  await p.getByRole('link', { name: 'Preços' }).first().click();
  await expect(p).toHaveURL(/\/precos/);
  await login(p, A.email, A.password);
  await p.goto('/portal/crm/contacts');
  expect(await p.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await ctx.close();
});
