import 'server-only';

import { randomBytes } from 'crypto';
import { and, eq, inArray } from 'drizzle-orm';
import { db } from '@/lib/db';
import { posts, siteBranding, siteNavigation, surveys } from '@/lib/db/schema';
import type { SurveyFieldDef } from '@/lib/db/schema/surveys';
import { revalidateSiteAll } from '@/lib/sites/site-cache';
import { buildSiteTemplate, type SiteTemplateInfo, type SiteTemplateKey } from './site-templates';

function field(id: string, type: SurveyFieldDef['type'], label: string, required: boolean, order: number, placeholder = ''): SurveyFieldDef {
  return { id, type, label, placeholder, helpText: '', required, options: [], order };
}

/**
 * Seed a freshly created website from a Kumo One template: branding + contact
 * details, a contact form (a survey whose responses land in the portal), the
 * pages as UNPUBLISHED drafts, and the navigation menu. The owner reviews in
 * preview and publishes with publishSite(); nothing goes public here.
 *
 * Runs in one transaction so a failure leaves no half-built site. Refuses to
 * run on a site that already has pages, so it can never overwrite content.
 */
export async function applySiteTemplate(opts: {
  websiteId: number;
  clientId: number;
  subdomain: string;
  template: SiteTemplateKey;
  info: SiteTemplateInfo;
}): Promise<{ pageIds: number[]; surveySlug: string }> {
  const { websiteId, clientId, subdomain, template, info } = opts;
  const surveySlug = `contato-${subdomain}-${randomBytes(3).toString('hex')}`.slice(0, 120);
  const built = buildSiteTemplate(template, info, surveySlug);

  const result = await db.transaction(async (tx) => {
    const existing = await tx.select({ id: posts.id }).from(posts).where(eq(posts.websiteId, websiteId)).limit(1);
    if (existing.length > 0) throw new Error('Este site já tem páginas; o modelo só pode ser aplicado a um site novo.');

    await tx.insert(surveys).values({
      clientId,
      title: built.contactForm.title,
      slug: surveySlug,
      description: built.contactForm.description,
      fields: [
        field('nome', 'text', 'Nome', true, 0),
        field('email', 'email', 'E-mail', true, 1),
        field('telefone', 'phone', 'Telefone / WhatsApp', false, 2),
        field('mensagem', 'textarea', built.contactForm.messageLabel, true, 3),
      ],
      thankYouTitle: 'Mensagem enviada!',
      thankYouMessage: 'Obrigado pelo contato. Retornaremos em breve.',
      color: built.branding.primaryColor,
      status: 'active',
      linkedType: 'website',
      linkedId: websiteId,
    });

    const brandingValues = {
      ...built.branding,
      logoText: info.company,
      contactEmail: info.email || null,
      contactPhone: info.phone || null,
      contactWhatsapp: info.whatsapp || null,
      contactAddress: [info.address, info.city].filter(Boolean).join('\n') || null,
      updatedAt: new Date(),
    };
    await tx
      .insert(siteBranding)
      .values({ websiteId, ...brandingValues })
      .onConflictDoUpdate({ target: siteBranding.websiteId, set: brandingValues });

    const inserted = await tx
      .insert(posts)
      .values(
        built.pages.map((p) => ({
          websiteId,
          title: p.title,
          slug: p.slug,
          postType: 'page',
          content: JSON.stringify({ blocks: p.blocks, version: '1.0' }),
          seoTitle: p.seoTitle,
          seoDescription: p.seoDescription,
          excerpt: p.seoDescription,
          published: false,
        })),
      )
      .returning({ id: posts.id });

    await tx.insert(siteNavigation).values(
      built.nav.map((n, i) => ({
        websiteId,
        label: n.label,
        href: n.href,
        sortOrder: i,
        isButton: !!n.isButton,
      })),
    );

    return { pageIds: inserted.map((r) => r.id), surveySlug };
  });

  revalidateSiteAll(websiteId);
  return result;
}

/** Publish (or unpublish) every page of a site and open/close public access. */
export async function publishSite(websiteId: number, publish: boolean, pageIds?: number[]): Promise<number> {
  const where = pageIds?.length
    ? and(eq(posts.websiteId, websiteId), inArray(posts.id, pageIds))
    : and(eq(posts.websiteId, websiteId), eq(posts.postType, 'page'));
  const updated = await db
    .update(posts)
    .set({ published: publish, publishedAt: publish ? new Date() : null, updatedAt: new Date() })
    .where(where)
    .returning({ id: posts.id });
  revalidateSiteAll(websiteId);
  return updated.length;
}
