import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

// Kumo One public pages. Tenant sites publish their own sitemap from
// app/sites/[domain].
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url;
  const now = new Date();
  return [
    { url: baseUrl, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/funcionalidades`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/precos`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${baseUrl}/sobre`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${baseUrl}/termos`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/privacidade`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
