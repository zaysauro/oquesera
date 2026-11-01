/**
 * Kumo One product identity and regional defaults.
 *
 * Edge-safe (no imports) so middleware, client components and server code can
 * all read it. Everything that says the product name, the platform domain,
 * the UI locale or the billing currency should come from here rather than a
 * string literal.
 */

export const BRAND_NAME = 'Kumo One';
export const BRAND_SHORT_NAME = 'Kumo';

/** UI locale for dates and numbers, and the <html lang>. */
export const APP_LOCALE = 'pt-BR';
/** Open Graph locale tag. */
export const OG_LOCALE = 'pt_BR';
/** ISO 4217 code used for display. Stripe takes the lowercase form. */
export const APP_CURRENCY = (process.env.NEXT_PUBLIC_APP_CURRENCY || 'BRL').toUpperCase();
export const STRIPE_CURRENCY = APP_CURRENCY.toLowerCase();
export const APP_TIMEZONE = process.env.NEXT_PUBLIC_APP_TIMEZONE || 'America/Sao_Paulo';

/**
 * Root domain that hosts tenant subdomains (`<sub>.<root>`). Unset in local
 * development, where `kumo.localhost` is used: browsers resolve every
 * `*.localhost` name to 127.0.0.1, so `acme.kumo.localhost:3000` reaches the
 * dev server with no DNS setup.
 */
export const PLATFORM_ROOT_DOMAIN = (process.env.NEXT_PUBLIC_PLATFORM_ROOT_DOMAIN || 'kumo.localhost')
  .trim()
  .toLowerCase()
  .replace(/^www\./, '');

export function platformSubdomainHost(subdomain: string): string {
  return `${subdomain}.${PLATFORM_ROOT_DOMAIN}`;
}

/** `acme` for `acme.<root>` (port ignored); null for the bare root, www, or any other host. */
export function extractPlatformSubdomain(host: string): string | null {
  const bare = host.split(':')[0].toLowerCase();
  if (bare === PLATFORM_ROOT_DOMAIN || bare === `www.${PLATFORM_ROOT_DOMAIN}`) return null;
  const suffix = `.${PLATFORM_ROOT_DOMAIN}`;
  if (!bare.endsWith(suffix)) return null;
  const sub = bare.slice(0, -suffix.length);
  return sub && !sub.includes('.') ? sub : null;
}

export function isPlatformHost(host: string): boolean {
  const bare = host.split(':')[0].toLowerCase();
  return bare === PLATFORM_ROOT_DOMAIN || bare.endsWith(`.${PLATFORM_ROOT_DOMAIN}`);
}

// NEXT_PUBLIC_ only: this is rendered by client components too, and a
// server-only fallback would make server and client HTML disagree.
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || '';

/** Domain for system sender/recipient addresses (noreply@, billing@ …). */
export const EMAIL_DOMAIN = (process.env.EMAIL_DOMAIN || PLATFORM_ROOT_DOMAIN).trim().toLowerCase();

/** Legal identity of the company operating this Kumo One instance (shown on /termos and /privacidade). */
export const OPERATOR_LEGAL_NAME = process.env.NEXT_PUBLIC_OPERATOR_LEGAL_NAME || '';
export const OPERATOR_CNPJ = process.env.NEXT_PUBLIC_OPERATOR_CNPJ || '';
export const DPO_EMAIL = process.env.NEXT_PUBLIC_DPO_EMAIL || SUPPORT_EMAIL;
