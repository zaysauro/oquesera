// Feature-domain SKU catalog — the single source of truth for what we sell
// as per-domain SaaS modules in the portal.
//
// Pricing model (ADR-worthy summary):
// - Each sellable feature domain is one `services` row (category = domain key,
//   slug = `module-<key>`, billingCycle = monthly). Seeded by
//   scripts/seed-domain-modules.ts; price is *data* (services.price /
//   Stripe Price), so product can reprice without a deploy. The numbers here
//   are seed defaults + display fallbacks only.
// - "Everything" bundle is one `services` row with category 'bundle' —
//   `hasServiceAccess()` already treats 'bundle' as granting every category.
//   Bundle price is deliberately ~40% below the sum of the parts.
// - Domains split into two cost classes:
//     flat    — no marginal 3rd-party cost (CRM, projects, surveys, bookings,
//               publishing). Sold as a flat monthly fee.
//     metered — real per-unit COGS behind them (AI tokens → Anthropic/OpenAI,
//               email sends → Resend, e-sign envelopes → Dropbox Sign,
//               hosting GB → Railway/Vercel). Sold as flat fee + included
//               monthly allowance + overage. AI-token meters settle against
//               the existing ai_credit ledger; infra meters settle through
//               usage_meter_events → metered Stripe subscription items.
// - clients.billingMode ('agency' | 'saas' | 'byok') decides how a client
//   relates to this catalog:
//     agency — legacy managed clients; module gating is bypassed entirely.
//     saas   — prepays module subscriptions; usage past the included
//              allowance is billed (pay-as-you-go credits or metered items).
//     byok   — supplies their own 3rd-party API keys (byokProviders below);
//              meters with `waivedForByok` are not billed because the COGS
//              lands on the client's own keys. Hosting is never waived —
//              the infra is ours regardless of whose API keys run on it.

export type BillingMode = 'agency' | 'saas' | 'byok';

export const BILLING_MODES: BillingMode[] = ['agency', 'saas', 'byok'];

export interface DomainMeter {
  /** usage_meter_events.resource / metered_subscription_items.resource value */
  resource: string;
  label: string;
  /** display unit, e.g. 'emails', 'tokens', 'GB' */
  unit: string;
  /** included per month with the single-module subscription */
  includedPerMonth: number;
  /** included per month on the Everything bundle */
  bundleIncludedPerMonth: number;
  /** overage price in cents per `overageUnitSize` units */
  overageRateCents: number;
  overageUnitSize: number;
  /** true when BYOK clients carry this cost on their own provider key */
  waivedForByok: boolean;
}

export interface FeatureDomain {
  /** stable key — doubles as services.category (must match layout/API gates) */
  key: string;
  /** services.slug for the seeded module SKU */
  slug: string;
  name: string;
  /** marketing one-liner shown on pricing cards and upsells */
  tagline: string;
  /** Material icon name */
  icon: string;
  /** seed default + display fallback; live price = services.price */
  monthlyPriceCents: number;
  /** Stripe IDs for THIS deployment's Stripe account. Kumo One ships none:
   * scripts/billing/sync-stripe-products.ts creates the products/prices in
   * whatever account STRIPE_SECRET_KEY points at (test or live) and writes the
   * IDs onto the `services` rows. Repricing: new Stripe Price + services row. */
  stripeProductId?: string;
  stripePriceId?: string;
  /** marketing bullets for the pricing card */
  features: string[];
  meters: DomainMeter[];
  /** AI credits granted per cycle (services.includedAiCredits) */
  includedAiCredits: number;
  /** client_api_keys.provider values a BYOK client must connect to use this */
  byokProviders: string[];
  /** related domain keys to cross-promote inside this domain's UI */
  promotesTo: string[];
  /** top-level portal nav hrefs gated by this domain (prefix match) */
  navHrefs: string[];
}

export const AI_TOKENS_METER: Omit<DomainMeter, 'includedPerMonth' | 'bundleIncludedPerMonth'> = {
  resource: 'ai_tokens',
  label: 'Uso de IA',
  unit: 'tokens',
  overageRateCents: 100, // $1.00 per 100k tokens past the included grant
  overageUnitSize: 100_000,
  waivedForByok: true,
};

export const FEATURE_DOMAINS: FeatureDomain[] = [
  {
    key: 'websites',
    slug: 'module-websites',
    name: 'Sites e CMS',
    tagline: 'Crie, edite e publique sites com o editor visual.',
    icon: 'language',
    monthlyPriceCents: 2_490,
    features: [
      'CMS em blocos com editor visual',
      'Tipos de conteúdo e categorias personalizados',
      'Testes A/B integrados',
      'Biblioteca de mídia',
      'Hospedagem gerenciada e domínios',
    ],
    meters: [
      {
        resource: 'hosting_bandwidth_gb',
        label: 'Transferência',
        unit: 'GB',
        includedPerMonth: 100,
        bundleIncludedPerMonth: 500,
        overageRateCents: 5,
        overageUnitSize: 1,
        waivedForByok: false, // hosting infra is ours in every mode
      },
      {
        resource: 'hosting_storage_gb',
        label: 'Armazenamento',
        unit: 'GB',
        includedPerMonth: 10,
        bundleIncludedPerMonth: 50,
        overageRateCents: 10,
        overageUnitSize: 1,
        waivedForByok: false,
      },
    ],
    includedAiCredits: 0,
    byokProviders: [],
    promotesTo: ['store', 'email', 'brain'],
    navHrefs: ['/portal/websites', '/portal/media', '/portal/experiments'],
  },
  {
    key: 'crm',
    slug: 'module-crm',
    name: 'CRM e Vendas',
    tagline: 'Contatos, empresas, oportunidades e funis — todo o seu processo comercial.',
    icon: 'contacts',
    monthlyPriceCents: 2_490,
    features: [
      'Contatos, empresas e funis de oportunidades',
      'Campos personalizados e visões salvas',
      'Regras de pontuação de leads',
      'Linha do tempo de atividades',
    ],
    meters: [],
    includedAiCredits: 0,
    byokProviders: [],
    promotesTo: ['email', 'esign', 'brain'],
    navHrefs: ['/portal/crm'],
  },
  {
    key: 'brain',
    slug: 'module-brain',
    name: 'Cérebro da Empresa (IA)',
    tagline: 'O conhecimento da sua empresa, pesquisável e com IA.',
    icon: 'psychology',
    monthlyPriceCents: 3_990,
    features: [
      'Base de conhecimento com busca por IA (RAG)',
      'Reuniões, decisões e manuais',
      'Pessoas, organograma e mapa de competências',
      'Assistente de IA conectado aos seus dados',
      '500 mil tokens de IA incluídos por mês',
    ],
    meters: [
      { ...AI_TOKENS_METER, includedPerMonth: 500_000, bundleIncludedPerMonth: 2_000_000 },
    ],
    includedAiCredits: 500_000,
    byokProviders: ['anthropic', 'openai'],
    promotesTo: ['crm', 'automations', 'pitch-decks'],
    navHrefs: ['/portal/brain', '/portal/branding'],
  },
  {
    key: 'email',
    slug: 'module-email',
    name: 'E-mail Marketing',
    tagline: 'Campanhas, listas, segmentos e métricas.',
    icon: 'email',
    monthlyPriceCents: 2_490,
    features: [
      'Campanhas e modelos',
      'Listas, segmentos e gestão de inscritos',
      'Métricas de abertura e cliques',
      '10.000 envios incluídos por mês',
    ],
    meters: [
      {
        resource: 'email_send',
        label: 'Envios de e-mail',
        unit: 'emails',
        includedPerMonth: 10_000,
        bundleIncludedPerMonth: 25_000,
        overageRateCents: 100, // $1.00 per 1k extra sends
        overageUnitSize: 1_000,
        waivedForByok: true,
      },
    ],
    includedAiCredits: 0,
    byokProviders: ['resend'],
    promotesTo: ['crm', 'automations', 'surveys'],
    navHrefs: ['/portal/email'],
  },
  {
    key: 'projects',
    slug: 'module-projects',
    name: 'Projetos e Chamados',
    tagline: 'Quadros Kanban, tarefas e chamados de suporte em um só lugar.',
    icon: 'view_kanban',
    monthlyPriceCents: 1_990,
    features: [
      'Projetos Kanban com sprints',
      'Minhas tarefas de todas as origens',
      'Caixa de chamados de suporte',
      'Registro de horas e checklists',
    ],
    meters: [],
    includedAiCredits: 0,
    byokProviders: [],
    promotesTo: ['brain', 'automations'],
    navHrefs: ['/portal/projects', '/portal/my-tasks', '/portal/tickets'],
  },
  {
    key: 'surveys',
    slug: 'module-surveys',
    name: 'Pesquisas e Formulários',
    tagline: 'Pesquisas com a sua marca, lógica condicional e recomendações.',
    icon: 'poll',
    monthlyPriceCents: 1_490,
    features: [
      'Construtor de pesquisas com lógica condicional',
      'Modelos prontos',
      'Análise de respostas',
      'Fluxos de aprovação',
    ],
    meters: [],
    includedAiCredits: 0,
    byokProviders: [],
    promotesTo: ['email', 'crm'],
    navHrefs: ['/portal/surveys'],
  },
  {
    key: 'bookings',
    slug: 'module-bookings',
    name: 'Agendamentos',
    tagline: 'Páginas de agendamento para seus clientes marcarem horários sozinhos.',
    icon: 'event_available',
    monthlyPriceCents: 1_990,
    features: [
      'Páginas públicas de agendamento',
      'Sincronização de calendário',
      'Cancelamento e reagendamento',
    ],
    meters: [],
    includedAiCredits: 0,
    byokProviders: [],
    promotesTo: ['crm', 'email'],
    navHrefs: [],
  },
  {
    key: 'store',
    slug: 'module-store',
    name: 'Loja Virtual',
    tagline: 'Venda produtos no seu site — pedidos, descontos e entregas.',
    icon: 'shopping_cart',
    monthlyPriceCents: 2_990,
    features: [
      'Produtos, variações e estoque',
      'Pedidos, descontos e vales-presente',
      'Pagamentos via Stripe (requer conta Stripe)',
      'Impressão sob demanda',
    ],
    meters: [], // monetized via Stripe Connect platform fee, not a usage meter
    includedAiCredits: 0,
    byokProviders: [],
    promotesTo: ['websites', 'email'],
    navHrefs: [],
  },
  {
    key: 'esign',
    slug: 'module-esign',
    name: 'Contratos e Assinatura Eletrônica',
    tagline: 'Envie contratos para assinatura eletrônica simples sem sair do portal.',
    icon: 'draw',
    monthlyPriceCents: 2_490,
    features: [
      'Envio e acompanhamento de contratos',
      'Fluxos de aprovação',
      '20 envelopes incluídos por mês',
    ],
    meters: [
      {
        resource: 'esign_envelopes',
        label: 'Envelopes',
        unit: 'envelopes',
        includedPerMonth: 20,
        bundleIncludedPerMonth: 50,
        overageRateCents: 150, // $1.50 per extra envelope
        overageUnitSize: 1,
        waivedForByok: true,
      },
    ],
    includedAiCredits: 0,
    byokProviders: ['dropbox_sign'],
    promotesTo: ['crm', 'projects'],
    navHrefs: [],
  },
  {
    key: 'pitch-decks',
    slug: 'module-pitch-decks',
    name: 'Apresentações e Propostas',
    tagline: 'Apresentações e propostas comerciais geradas com IA.',
    icon: 'slideshow',
    monthlyPriceCents: 1_990,
    features: [
      'Geração de apresentações com IA',
      'Construtor de propostas',
      '100 mil tokens de IA incluídos por mês',
    ],
    meters: [
      { ...AI_TOKENS_METER, includedPerMonth: 100_000, bundleIncludedPerMonth: 0 /* pooled into bundle grant */ },
    ],
    includedAiCredits: 100_000,
    byokProviders: ['anthropic'],
    promotesTo: ['crm', 'brain'],
    navHrefs: ['/portal/tools/pitch-decks'],
  },
  {
    key: 'automations',
    slug: 'module-automations',
    name: 'Automações',
    tagline: 'Gatilhos, agendamentos e fluxos que fazem o trabalho repetitivo.',
    icon: 'bolt',
    monthlyPriceCents: 2_490,
    features: [
      'Gatilhos por evento e por horário',
      'Histórico de execuções e pré-visualização',
      '1.000 execuções incluídas por mês',
    ],
    meters: [
      {
        resource: 'automation_runs',
        label: 'Execuções de automação',
        unit: 'runs',
        includedPerMonth: 1_000,
        bundleIncludedPerMonth: 5_000,
        overageRateCents: 1,
        overageUnitSize: 1,
        waivedForByok: false, // compute is ours in every mode
      },
    ],
    includedAiCredits: 0,
    byokProviders: [],
    promotesTo: ['brain', 'email'],
    navHrefs: ['/portal/automations'],
  },
  {
    key: 'publishing',
    slug: 'module-publishing',
    name: 'Central de Publicação',
    tagline: 'Planeje, agende e publique conteúdo em vários canais.',
    icon: 'rocket_launch',
    monthlyPriceCents: 1_990,
    features: [
      'Calendário e quadro de conteúdo',
      'Agendamento multicanal',
      'Campanhas e permissões',
    ],
    meters: [],
    includedAiCredits: 0,
    byokProviders: [],
    promotesTo: ['email', 'websites'],
    navHrefs: ['/portal/publishing'],
  },
  {
    key: 'seo',
    slug: 'module-seo',
    // No Stripe IDs yet — pricing is provisional until crawl + AI costs are
    // measured (build-plan rule: measure provider cost before pricing). The
    // entitlement gate is live from day one; seed Stripe products at launch
    // via scripts/seed-domain-modules.ts like the other modules.
    name: 'SEO',
    tagline: 'Auditorias de site, dados do Search Console e correções priorizadas por IA.',
    icon: 'travel_explore',
    monthlyPriceCents: 2_990,
    features: [
      'Auditoria de site: rastreador próprio + 50 verificações técnicas',
      'Autoridade de links internos e páginas órfãs',
      'Desempenho no Google Search Console (requer integração)',
      'Recomendações de IA priorizadas',
      'Audit any domain — including sites we don\'t host',
    ],
    meters: [
      {
        resource: 'seo_crawled_urls',
        label: 'URLs rastreadas',
        unit: 'URLs',
        includedPerMonth: 10_000,
        bundleIncludedPerMonth: 50_000,
        overageRateCents: 50, // $0.50 per 1k extra crawled URLs
        overageUnitSize: 1_000,
        waivedForByok: false, // crawler infra is ours in every mode
      },
    ],
    includedAiCredits: 0, // recommendations meter through the shared AI-credits ledger
    byokProviders: [],
    promotesTo: ['websites', 'brain', 'email'],
    navHrefs: ['/portal/seo'],
  },
];

// ── Bundle ────────────────────────────────────────────────────────────────────

export const BUNDLE_SLUG = 'module-bundle-complete';

export interface BundleDef {
  slug: string;
  name: string;
  tagline: string;
  icon: string;
  monthlyPriceCents: number;
  includedAiCredits: number;
  stripeProductId?: string;
  stripePriceId?: string;
}

/** Sum of every individual module's monthly price, in cents. */
export function sumOfModulePricesCents(): number {
  return FEATURE_DOMAINS.reduce((sum, d) => sum + d.monthlyPriceCents, 0);
}

export const BUNDLE: BundleDef = {
  slug: BUNDLE_SLUG,
  name: 'Kumo Completo',
  tagline: 'Todos os módulos em uma única assinatura.',
  icon: 'all_inclusive',
  monthlyPriceCents: 19_990, // same price as the Empresarial plan
  includedAiCredits: 2_000_000,
};

// ── Volume discount (à-la-carte bulk pricing) ────────────────────────────────
//
// The à-la-carte model rewards breadth: the more individual modules a client
// subscribes to, the larger the percentage off the WHOLE module subscription.
//
// The discount is NOT a Stripe coupon — it's baked into the per-module line
// item amounts the subscription is built from (see lib/billing/subscription-items.ts
// and computeAccountBilling below). Each module is charged at
// round(price × (1 − discount/100)); the post-discount subtotal is "M", which
// also drives the per-seat cap. This keeps invoices showing exact per-line
// amounts and lets the seat charge stay undiscounted (see the seat model below).
//
// The bundle ("SimplerDev Complete") is NOT volume-discounted — its flat price
// already bakes in a ~39% discount. Tier SKUs (legacy) are likewise excluded.

export interface VolumeTier {
  /** minimum number of individual modules to unlock this discount */
  minModules: number;
  /** percentage off the whole à-la-carte module subscription */
  percentOff: number;
}

/** Discount thresholds, highest first so volumeTierFor() returns the best match. */
// Invariant (OBQA-016): the top tier is pinned so ALL-modules à-la-carte never
// exceeds BUNDLE.monthlyPriceCents (15,900¢) — the bundle price is the ceiling
// on any module bill. With 13 modules (29,000¢ seed sum, 'seo' added
// 2026-08-12) break-even is 45.17%, so 46 is the minimal integer percent:
// 29,000 × 0.54 = 15,660¢ ≤ 15,900¢. The 12-module tier keeps its original 40%
// so existing 12-module subscribers' prices don't move. Locked by a guard test
// in tests/unit/billing-recompute-subscription.test.ts. If module or bundle
// seed prices change, re-check this tier.
export const VOLUME_TIERS: VolumeTier[] = [
  { minModules: 13, percentOff: 46 },
  { minModules: 12, percentOff: 40 },
  { minModules: 8, percentOff: 20 },
  { minModules: 4, percentOff: 10 },
];

/** Best volume discount unlocked at a given module count (null below the first threshold). */
export function volumeTierFor(moduleCount: number): VolumeTier | null {
  return VOLUME_TIERS.find((t) => moduleCount >= t.minModules) ?? null;
}

/** The next (higher) threshold above the current count, for "add N more to save" nudges. */
export function nextVolumeTier(moduleCount: number): VolumeTier | null {
  // Walk thresholds ascending and return the first one still above the count.
  for (let i = VOLUME_TIERS.length - 1; i >= 0; i--) {
    if (VOLUME_TIERS[i].minModules > moduleCount) return VOLUME_TIERS[i];
  }
  return null;
}

/** Apply the unlocked volume discount to a module subtotal (cents). */
export function applyVolumeDiscount(
  subtotalCents: number,
  moduleCount: number,
): { discountPercent: number; discountCents: number; totalCents: number } {
  const tier = volumeTierFor(moduleCount);
  const discountPercent = tier?.percentOff ?? 0;
  const discountCents = Math.round((subtotalCents * discountPercent) / 100);
  return { discountPercent, discountCents, totalCents: subtotalCents - discountCents };
}

/** A single module's charged amount after the volume discount (cents). */
export function discountedModuleCents(fullCents: number, discountPercent: number): number {
  return Math.round(fullCents * (1 - discountPercent / 100));
}

// ── Per-seat pricing ─────────────────────────────────────────────────────────
//
// On top of the à-la-carte modules, an account is billed per accepted seat.
// The first seat (the owner) is included; each additional accepted team member
// adds a seat charge equal to the module subtotal — capped at SEAT_PRICE_CAP.
//
//   monthly total = M + (seats − INCLUDED_SEATS) × min(M, SEAT_PRICE_CAP)
//
// where M = the post-volume-discount module subtotal. The seat charge is NOT
// itself volume-discounted (M is already net). "Accepted" seats only: an
// invited-but-not-yet-accepted user does not bill until they accept.
// Implemented as an explicit "Additional seats" Stripe line item priced at
// min(M, SEAT_PRICE_CAP) with quantity = additional seats.

/** Per-additional-seat price cap, in cents ($30). */
export const SEAT_PRICE_CAP_CENTS = 3_000;

/** Seats included in the base (the owner). */
export const INCLUDED_SEATS = 1;

/**
 * The "Additional seats" SKU — one persistent Stripe Product the seat line item
 * is priced against (the amount is dynamic per account, so the Price is created
 * inline via price_data; only the Product is stable). Provisioned once by
 * scripts/billing/create-seat-product.ts; paste the live id here.
 */
export const SEAT_SKU = {
  slug: 'platform-seat',
  name: 'Usuários adicionais',
  /** Live Stripe Product id — set after running create-seat-product.ts. */
  stripeProductId: undefined as string | undefined,
};

export interface AccountBilling {
  /** volume discount % applied to the modules */
  discountPercent: number;
  /** each module's charged (post-discount) amount, in input order */
  discountedModuleCents: number[];
  /** M — post-discount module subtotal (sum of discountedModuleCents) */
  moduleSubtotalCents: number;
  /** charge per additional seat = min(M, SEAT_PRICE_CAP_CENTS) */
  seatUnitCents: number;
  /** billable seats beyond the included one */
  additionalSeats: number;
  /** seatUnitCents × additionalSeats */
  seatTotalCents: number;
  /** moduleSubtotalCents + seatTotalCents */
  totalCents: number;
}

/**
 * The full account bill from a set of à-la-carte module prices (full, pre-discount)
 * and an accepted-seat count. Single source of truth for both display and the
 * Stripe line items. The bundle path does not use this (flat bundle price).
 */
export function computeAccountBilling(
  modulePricesCents: number[],
  seatCount: number,
): AccountBilling {
  const discountPercent = volumeTierFor(modulePricesCents.length)?.percentOff ?? 0;
  const discounted = modulePricesCents.map((c) => discountedModuleCents(c, discountPercent));
  const moduleSubtotalCents = discounted.reduce((s, c) => s + c, 0);
  const seatUnitCents = Math.min(moduleSubtotalCents, SEAT_PRICE_CAP_CENTS);
  const additionalSeats = Math.max(0, seatCount - INCLUDED_SEATS);
  const seatTotalCents = seatUnitCents * additionalSeats;
  return {
    discountPercent,
    discountedModuleCents: discounted,
    moduleSubtotalCents,
    seatUnitCents,
    additionalSeats,
    seatTotalCents,
    totalCents: moduleSubtotalCents + seatTotalCents,
  };
}

// ── Plan tiers (the public 3-tier pricing — curated bundles over the modules) ──
//
// The self-serve pricing page sells THREE per-seat tiers; the 12 modules above
// remain the underlying machinery (and stay available for agency/custom deals).
// A tier is one `services` row (slug + category = tier.slug, e.g. 'plan-growth')
// that grants tier.domains. BYOK metering-waiver is honored ONLY on a
// byokEligible tier (Scale) — the "BYOK inversion": marked-up metered AI on the
// lower tiers is the profit center; BYOK (spend-at-cost) is a Scale unlock.
//
// Prices are illustrative seed/display defaults — live price = services.price.
// Stripe IDs are created per-environment by scripts/billing/sync-stripe-products.ts.

export type TierKey = 'starter' | 'growth' | 'scale';

export interface TierDef {
  key: TierKey;
  /** services.slug AND services.category for this tier's SKU */
  slug: string;
  name: string;
  tagline: string;
  /** per-seat monthly price (seed/display default; live = services.price) */
  monthlyPriceCents: number;
  /** domain keys granted; 'all' = every module */
  domains: string[] | 'all';
  /** AI tokens granted per cycle (services.includedAiCredits) */
  includedAiCredits: number;
  /** BYOK metering-waiver is honored only on a byokEligible tier */
  byokEligible: boolean;
  features: string[];
  stripeProductId?: string;
  stripePriceId?: string;
}

// Kumo One plans. `key`/`slug` keep the upstream values because entitlements,
// subscriptions and admin tooling key off them; only the commercial surface
// (name, copy, BRL price, module set) is Kumo's. Prices are the seed default
// for `services.price` — the live price is whatever that row holds.
export const TIERS: TierDef[] = [
  {
    key: 'starter',
    slug: 'plan-starter',
    name: 'Essencial',
    tagline: 'Site, CRM, agenda e projetos para começar a organizar o negócio.',
    monthlyPriceCents: 4_990,
    domains: ['websites', 'crm', 'projects', 'bookings'],
    includedAiCredits: 100_000,
    byokEligible: false,
    features: [
      'Criador de sites com modelos prontos',
      'CRM com funil de vendas em Kanban',
      'Agendamento online com página pública',
      'Projetos, tarefas e chamados',
      '100 mil tokens de IA por mês',
    ],
  },
  {
    key: 'growth',
    slug: 'plan-growth',
    name: 'Profissional',
    tagline: 'Automações, e-mail marketing, contratos e o assistente de IA.',
    monthlyPriceCents: 9_990,
    domains: ['websites', 'crm', 'projects', 'bookings', 'brain', 'email', 'automations', 'surveys', 'esign', 'pitch-decks'],
    includedAiCredits: 1_000_000,
    byokEligible: false,
    features: [
      'Tudo do Essencial',
      'Cérebro da Empresa: base de conhecimento e assistente de IA',
      'E-mail marketing, automações e pesquisas',
      'Contratos com assinatura eletrônica simples e propostas',
      '1 milhão de tokens de IA por mês',
    ],
  },
  {
    key: 'scale',
    slug: 'plan-scale',
    name: 'Empresarial',
    tagline: 'Todos os módulos, sua própria chave de IA e marca própria.',
    monthlyPriceCents: 19_990,
    domains: 'all',
    includedAiCredits: 3_000_000,
    byokEligible: true,
    features: [
      'Todos os módulos, incluindo loja virtual, SEO e central de publicação',
      '3 milhões de tokens de IA por mês',
      'Use sua própria chave de IA (BYOK) sem margem sobre os tokens',
      'Marca própria (white-label) e governança',
    ],
  },
];

const TIER_BY_CATEGORY = new Map(TIERS.map((t) => [t.slug, t]));

/** The tier whose SKU category matches, if the category is a tier. */
export function getTierByCategory(category: string): TierDef | undefined {
  return TIER_BY_CATEGORY.get(category);
}

/** Resolve a tier's granted domain keys ('all' → every module). */
export function tierDomainKeys(tier: TierDef): string[] {
  return tier.domains === 'all' ? FEATURE_DOMAINS.map((d) => d.key) : tier.domains;
}

// ── Lookups ───────────────────────────────────────────────────────────────────

const BY_KEY = new Map(FEATURE_DOMAINS.map((d) => [d.key, d]));

export function getDomainByKey(key: string): FeatureDomain | undefined {
  return BY_KEY.get(key);
}

/** Domain whose navHrefs prefix-match the given portal pathname, if any. */
export function getDomainForPath(pathname: string): FeatureDomain | undefined {
  return FEATURE_DOMAINS.find((d) =>
    d.navHrefs.some((href) => pathname === href || pathname.startsWith(`${href}/`)),
  );
}

/** All BYOK providers required across a set of subscribed domain keys. */
export function requiredByokProviders(domainKeys: Iterable<string>): string[] {
  const out = new Set<string>();
  for (const key of domainKeys) {
    for (const p of BY_KEY.get(key)?.byokProviders ?? []) out.add(p);
  }
  return [...out];
}

/** Every BYOK provider any domain can require (used for the full checklist). */
export function allByokProviders(): string[] {
  return requiredByokProviders(FEATURE_DOMAINS.map((d) => d.key));
}

/** Human labels for client_api_keys.provider values. */
export const BYOK_PROVIDER_LABELS: Record<string, string> = {
  anthropic: 'Anthropic (Claude)',
  openai: 'OpenAI',
  resend: 'Resend (email delivery)',
  dropbox_sign: 'Dropbox Sign (e-signatures)',
};
