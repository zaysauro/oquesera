import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { clientWebsites } from '@/lib/db/schema';
import { authorizePortal, isAuthError } from '@/lib/portal-auth';
import { parseSiteIdParam } from '@/lib/api/parse-params';
import { publishSite } from '@/lib/kumo/apply-site-template';
import { auditEvent } from '@/lib/kumo/audit';

/**
 * Publish or unpublish a whole website in one step: every page's published
 * flag plus the site's public access gate. Publishing is an outward-facing
 * action, so it requires the `write` role on the websites module and is
 * recorded in the tenant audit log.
 *
 * Body: { publish: boolean }
 */
export async function POST(req: Request, { params }: { params: Promise<{ siteId: string }> }) {
  const authResult = await authorizePortal({ action: 'write', requireService: 'websites' });
  if (isAuthError(authResult)) return authResult.response;
  const { client, userId } = authResult;

  const parsed = parseSiteIdParam((await params).siteId);
  if (!parsed.ok) return parsed.response;

  // Tenant isolation: the site must belong to the caller's active company.
  const [site] = await db
    .select({ id: clientWebsites.id, name: clientWebsites.name })
    .from(clientWebsites)
    .where(and(eq(clientWebsites.id, parsed.value), eq(clientWebsites.clientId, client.id)))
    .limit(1);
  if (!site) return NextResponse.json({ success: false, message: 'Site não encontrado.' }, { status: 404 });

  let body: { publish?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: 'JSON inválido.' }, { status: 400 });
  }
  if (typeof body.publish !== 'boolean') {
    return NextResponse.json({ success: false, message: 'Informe publish: true ou false.' }, { status: 400 });
  }

  const pages = await publishSite(site.id, body.publish);
  await db
    .update(clientWebsites)
    .set({ publicAccess: body.publish, updatedAt: new Date() })
    .where(eq(clientWebsites.id, site.id));

  await auditEvent({
    clientId: client.id,
    actorId: userId,
    action: body.publish ? 'website.published' : 'website.unpublished',
    entityType: 'website',
    entityId: site.id,
    metadata: { pages },
  });

  return NextResponse.json({ success: true, data: { pages, publicAccess: body.publish } });
}
