import { inArray } from 'drizzle-orm';
import { db } from '@/lib/db';
import { services } from '@/lib/db/schema';
import { TIERS, getDomainByKey, tierDomainKeys } from '@/lib/billing/domain-catalog';

export interface PublicPlan {
  key: string;
  slug: string;
  name: string;
  tagline: string;
  priceCents: number;
  features: string[];
  modules: string[];
  highlighted: boolean;
}

/**
 * Plans shown on the public site. Prices and copy come from the `services`
 * rows (what an admin edits and what checkout charges), falling back to the
 * catalog seed in lib/billing/domain-catalog.ts when the row is missing or the
 * database is unreachable — the marketing page must render either way.
 */
export async function getPublicPlans(): Promise<PublicPlan[]> {
  let rows: { slug: string; name: string; description: string | null; price: number; features: string[] | null; active: boolean }[] = [];
  try {
    rows = await db
      .select({
        slug: services.slug,
        name: services.name,
        description: services.description,
        price: services.price,
        features: services.features,
        active: services.active,
      })
      .from(services)
      .where(inArray(services.slug, TIERS.map((t) => t.slug)));
  } catch (err) {
    console.error('[kumo/plans] falling back to catalog prices:', err);
  }
  const bySlug = new Map(rows.map((r) => [r.slug, r]));

  return TIERS.filter((t) => bySlug.get(t.slug)?.active !== false).map((t) => {
    const row = bySlug.get(t.slug);
    return {
      key: t.key,
      slug: t.slug,
      name: row?.name ?? t.name,
      tagline: row?.description ?? t.tagline,
      priceCents: row?.price ?? t.monthlyPriceCents,
      features: row?.features?.length ? row.features : t.features,
      modules: tierDomainKeys(t).map((k) => getDomainByKey(k)?.name ?? k),
      highlighted: t.key === 'growth',
    };
  });
}
