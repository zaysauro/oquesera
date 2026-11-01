import { platformSubdomainHost } from '@/config/brand';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { clientWebsites } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getPortalClient } from '@/lib/portal-client';
import { authorizePortal, isAuthError } from '@/lib/portal-auth';
import { applySiteTemplate } from '@/lib/kumo/apply-site-template';
import { auditEvent } from '@/lib/kumo/audit';
import { isSiteTemplateKey } from '@/lib/kumo/site-templates';
import { generateUniqueSubdomain, validateSubdomain, isSubdomainAvailable } from '@/lib/subdomain';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  // Service access check
  const authResult = await authorizePortal({ action: 'read', requireService: 'websites' });
  if (isAuthError(authResult)) return authResult.response;

  const userId = parseInt(session.user.id, 10);
  const client = await getPortalClient(userId);
  if (!client) return NextResponse.json({ success: false, message: 'Client not found' }, { status: 404 });

  const data = await db
    .select()
    .from(clientWebsites)
    .where(eq(clientWebsites.clientId, client.id))
    .orderBy(clientWebsites.createdAt);

  return NextResponse.json({ success: true, data });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

  // Service access check
  const authResult2 = await authorizePortal({ action: 'write', requireService: 'websites' });
  if (isAuthError(authResult2)) return authResult2.response;

  const userId = parseInt(session.user.id, 10);
  const client = await getPortalClient(userId);
  if (!client) return NextResponse.json({ success: false, message: 'Client not found' }, { status: 404 });

  const body = await req.json();
  const { name, domain, description, subdomain: requestedSubdomain, template, templateInfo } = body;
  if (template !== undefined && template !== null && !isSiteTemplateKey(template)) {
    return NextResponse.json({ success: false, message: 'Modelo de site desconhecido.' }, { status: 400 });
  }

  if (!name) return NextResponse.json({ success: false, message: 'Website name is required' }, { status: 400 });

  // Generate or validate subdomain
  let subdomain: string;
  if (requestedSubdomain) {
    const error = validateSubdomain(requestedSubdomain);
    if (error) return NextResponse.json({ success: false, message: error }, { status: 400 });
    if (!(await isSubdomainAvailable(requestedSubdomain))) {
      return NextResponse.json({ success: false, message: 'That subdomain is already taken.' }, { status: 409 });
    }
    subdomain = requestedSubdomain;
  } else {
    const companyName = client.company || 'site';
    subdomain = await generateUniqueSubdomain(companyName, name);
  }

  const [site] = await db.insert(clientWebsites).values({
    clientId: client.id,
    name,
    domain: domain || null,
    description: description || null,
    subdomain,
    vercelDomain: platformSubdomainHost(subdomain),
    deploymentStatus: 'pending',
    active: true,
  }).returning();

  if (template) {
    const info = (templateInfo ?? {}) as Record<string, unknown>;
    const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : undefined) || undefined;
    try {
      await applySiteTemplate({
        websiteId: site.id,
        clientId: client.id,
        subdomain,
        template,
        info: {
          company: str(info.company, 120) || client.company || name,
          phone: str(info.phone, 40),
          whatsapp: str(info.whatsapp, 40),
          email: str(info.email, 200),
          address: str(info.address, 300),
          city: str(info.city, 120),
          bookingSlug: str(info.bookingSlug, 120),
        },
      });
    } catch (err) {
      // Don't leave an empty site behind when the template could not be applied.
      await db.delete(clientWebsites).where(eq(clientWebsites.id, site.id));
      console.error('[websites] template apply failed:', err);
      return NextResponse.json(
        { success: false, message: 'Não foi possível criar o site a partir do modelo. Tente novamente.' },
        { status: 500 },
      );
    }
    await auditEvent({
      clientId: client.id,
      actorId: userId,
      action: 'website.created_from_template',
      entityType: 'website',
      entityId: site.id,
      metadata: { template },
    });
  }

  return NextResponse.json({ success: true, data: site });
}
