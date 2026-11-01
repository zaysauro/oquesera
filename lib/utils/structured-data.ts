import { APP_CURRENCY } from '@/config/brand';
import { siteConfig } from '@/config/site';

/**
 * Generate JSON-LD structured data for SEO
 */

export interface OrganizationSchema {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url: string;
  logo?: string;
  description: string;
  sameAs?: string[];
  contactPoint?: {
    '@type': 'ContactPoint';
    contactType: string;
    email?: string;
  };
}

export interface WebsiteSchema {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  url: string;
  description: string;
  publisher: {
    '@type': 'Organization';
    name: string;
  };
}

export interface ArticleSchema {
  '@context': 'https://schema.org';
  '@type': 'Article';
  headline: string;
  description: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  author: {
    '@type': 'Organization' | 'Person';
    name: string;
  };
  publisher: {
    '@type': 'Organization';
    name: string;
    logo?: {
      '@type': 'ImageObject';
      url: string;
    };
  };
}

export interface ServiceSchema {
  '@context': 'https://schema.org';
  '@type': 'Service';
  name: string;
  description: string;
  provider: {
    '@type': 'Organization';
    name: string;
  };
  serviceType?: string;
  areaServed?: string;
}

export interface SoftwareApplicationSchema {
  '@context': 'https://schema.org';
  '@type': 'SoftwareApplication';
  name: string;
  url: string;
  applicationCategory: string;
  operatingSystem: string;
  description: string;
  license?: string;
  dateModified?: string;
  offers?: {
    '@type': 'Offer';
    priceCurrency: string;
    price: string;
    priceSpecification?: {
      '@type': 'UnitPriceSpecification';
      description: string;
    };
  };
  featureList?: string[];
}

export interface WebSiteWithSearchActionSchema {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  url: string;
  potentialAction?: {
    '@type': 'SearchAction';
    target: {
      '@type': 'EntryPoint';
      urlTemplate: string;
    };
    'query-input': string;
  };
}

export interface FAQSchema {
  '@context': 'https://schema.org';
  '@type': 'FAQPage';
  mainEntity: Array<{
    '@type': 'Question';
    name: string;
    acceptedAnswer: {
      '@type': 'Answer';
      text: string;
    };
  }>;
}

export function generateOrganizationSchema(): OrganizationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/brand/kumo-mark-512.png`,
    description: siteConfig.description,
    sameAs: [siteConfig.links.github],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
    },
  };
}

export function generateWebsiteSchema(): WebsiteSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
    },
  };
}

export function generateArticleSchema(
  title: string,
  description: string,
  publishedAt: string,
  image?: string,
  modifiedAt?: string
): ArticleSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    image,
    datePublished: publishedAt,
    dateModified: modifiedAt || publishedAt,
    author: {
      '@type': 'Organization',
      name: siteConfig.name,
    },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
    },
  };
}

export function generateServiceSchema(
  name: string,
  description: string,
  serviceType?: string
): ServiceSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    provider: {
      '@type': 'Organization',
      name: siteConfig.name,
    },
    serviceType,
  };
}

export function generateSoftwareApplicationSchema(): SoftwareApplicationSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: siteConfig.name,
    url: siteConfig.url,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description: siteConfig.description,
    offers: {
      '@type': 'Offer',
      priceCurrency: APP_CURRENCY,
      price: '49.90',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        description: 'Assinatura mensal a partir do plano Essencial. Veja a página de preços.',
      },
    },
    featureList: [
      'CRM com contatos, empresas, oportunidades e funil em Kanban',
      'Criador de sites com editor visual e modelos por segmento',
      'Agendamento online com página pública',
      'Gestão de projetos e tarefas',
      'Contratos e propostas com assinatura eletrônica simples',
      'Automações e assistente de IA',
    ],
  };
}

export function generateWebSiteWithSearchActionSchema(): WebSiteWithSearchActionSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/docs?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateFAQSchema(
  faqs: Array<{ question: string; answer: string }>
): FAQSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export interface BreadcrumbListSchema {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item?: string;
  }>;
}

export function generateBreadcrumbListSchema(
  crumbs: Array<{ name: string; item?: string }>
): BreadcrumbListSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      ...(crumb.item !== undefined ? { item: crumb.item } : {}),
    })),
  };
}

