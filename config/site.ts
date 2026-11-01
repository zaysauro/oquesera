import { BRAND_NAME, PLATFORM_ROOT_DOMAIN } from './brand';

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || `https://${PLATFORM_ROOT_DOMAIN}`).replace(/\/$/, '');

export const siteConfig = {
  name: BRAND_NAME,
  description:
    'Kumo One reúne CRM, criador de sites, agendamentos, projetos, documentos, automações e IA em uma única plataforma para pequenas empresas brasileiras.',
  url: appUrl,
  ogImage: `${appUrl}/og.jpg`,
  links: {
    // Upstream project this product is built on (Apache-2.0).
    github: 'https://github.com/zaysauro/oquesera',
  },
  keywords: [
    'CRM para pequenas empresas',
    'criador de sites',
    'agendamento online',
    'gestão de projetos',
    'automação empresarial',
    'software de gestão',
    'SaaS brasileiro',
    'assistente de IA para empresas',
  ],
};

export type SiteConfig = typeof siteConfig;
