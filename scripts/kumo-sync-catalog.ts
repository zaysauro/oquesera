// Kumo One: write the commercial catalog (plans, modules, bundle) from
// lib/billing/domain-catalog.ts into the `services` table — names, copy, BRL
// prices, features and included AI credits. Unlike seed-domain-modules.ts /
// seed-tiers.ts (insert-only), this UPDATES existing rows, so a database
// seeded before the Kumo rebrand gets the Kumo plans too.
//
// Stripe IDs are never written here; scripts/billing/sync-stripe-products.ts
// owns them. A price change clears nothing on the Stripe side — run that
// script afterwards so a matching Stripe Price exists.
//
// Run: bun scripts/kumo-sync-catalog.ts   (uses DATABASE_URL from .env.local)

import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local', override: true });

async function main() {
  const { db } = await import('../lib/db');
  const { services } = await import('../lib/db/schema');
  const { eq } = await import('drizzle-orm');
  const { FEATURE_DOMAINS, BUNDLE, TIERS } = await import('../lib/billing/domain-catalog');

  const rows = [
    ...FEATURE_DOMAINS.map((d) => ({
      slug: d.slug, name: d.name, description: d.tagline, category: d.slug,
      price: d.monthlyPriceCents, features: d.features, includedAiCredits: d.includedAiCredits,
    })),
    {
      slug: BUNDLE.slug, name: BUNDLE.name, description: BUNDLE.tagline, category: BUNDLE.slug,
      price: BUNDLE.monthlyPriceCents, features: [] as string[], includedAiCredits: BUNDLE.includedAiCredits,
    },
    ...TIERS.map((t) => ({
      slug: t.slug, name: t.name, description: t.tagline, category: t.slug,
      price: t.monthlyPriceCents, features: t.features, includedAiCredits: t.includedAiCredits,
    })),
  ];

  for (const r of rows) {
    const [existing] = await db.select({ id: services.id }).from(services).where(eq(services.slug, r.slug)).limit(1);
    if (existing) {
      await db.update(services).set({
        name: r.name, description: r.description, price: r.price, features: r.features,
        includedAiCredits: r.includedAiCredits, billingCycle: 'monthly', updatedAt: new Date(),
      }).where(eq(services.id, existing.id));
      console.log(`  ~ ${r.slug} → ${r.name} (R$ ${(r.price / 100).toFixed(2)})`);
    } else {
      await db.insert(services).values({ ...r, billingCycle: 'monthly', active: true });
      console.log(`  + ${r.slug} → ${r.name} (R$ ${(r.price / 100).toFixed(2)})`);
    }
  }
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
