import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { clientWebsites, siteBranding } from '@/lib/db/schema';
import { authorizePortal, isAuthError } from '@/lib/portal-auth';
import { parseSiteIdParam } from '@/lib/api/parse-params';
import { revalidateSiteChrome } from '@/lib/sites/site-cache';

/**
 * Public contact details shown in a website's footer (site_branding
 * contact_* columns). Separate from the branding PUT, which replaces the
 * whole row, so editing contacts can never reset colors and vice versa.
 */
async function loadSite(siteIdParam: string, action: 'read' | 'write') {
  const authResult = await authorizePortal({ action, requireService: 'websites' });
  if (isAuthError(authResult)) return { error: authResult.response };
  const parsed = parseSiteIdParam(siteIdParam);
  if (!parsed.ok) return { error: parsed.response };
  const [site] = await db
    .select({ id: clientWebsites.id })
    .from(clientWebsites)
    .where(and(eq(clientWebsites.id, parsed.value), eq(clientWebsites.clientId, authResult.client.id)))
    .limit(1);
  if (!site) return { error: NextResponse.json({ success: false, message: 'Site não encontrado.' }, { status: 404 }) };
  return { site };
}

const FIELDS = { contactEmail: 255, contactPhone: 50, contactWhatsapp: 50, contactAddress: 1000 } as const;

export async function GET(_req: Request, { params }: { params: Promise<{ siteId: string }> }) {
  const r = await loadSite((await params).siteId, 'read');
  if ('error' in r) return r.error;
  const [row] = await db
    .select({
      contactEmail: siteBranding.contactEmail,
      contactPhone: siteBranding.contactPhone,
      contactWhatsapp: siteBranding.contactWhatsapp,
      contactAddress: siteBranding.contactAddress,
    })
    .from(siteBranding)
    .where(eq(siteBranding.websiteId, r.site.id))
    .limit(1);
  return NextResponse.json({ success: true, data: row ?? { contactEmail: null, contactPhone: null, contactWhatsapp: null, contactAddress: null } });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ siteId: string }> }) {
  const r = await loadSite((await params).siteId, 'write');
  if ('error' in r) return r.error;
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ success: false, message: 'JSON inválido.' }, { status: 400 });

  const values: Partial<Record<keyof typeof FIELDS, string | null>> = {};
  for (const [key, max] of Object.entries(FIELDS) as [keyof typeof FIELDS, number][]) {
    if (!(key in body)) continue;
    const v = body[key];
    if (v !== null && typeof v !== 'string') {
      return NextResponse.json({ success: false, message: `Campo inválido: ${key}` }, { status: 400 });
    }
    const t = typeof v === 'string' ? v.trim() : '';
    if (t.length > max) return NextResponse.json({ success: false, message: `Campo muito longo: ${key}` }, { status: 400 });
    values[key] = t || null;
  }
  if (values.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contactEmail)) {
    return NextResponse.json({ success: false, message: 'E-mail inválido.' }, { status: 400 });
  }

  await db
    .insert(siteBranding)
    .values({ websiteId: r.site.id, ...values })
    .onConflictDoUpdate({ target: siteBranding.websiteId, set: { ...values, updatedAt: new Date() } });
  revalidateSiteChrome(r.site.id);
  return NextResponse.json({ success: true });
}
