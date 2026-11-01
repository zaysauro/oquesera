import { PLATFORM_ROOT_DOMAIN } from '@/config/brand';
import { db } from '@/lib/db';
import { clientWebsites, posts } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getPortalClient } from '@/lib/portal-client';
import { PortalPageHeader } from '@/components/portal/PortalPageHeader';
import { pBtnPrimary } from '@/components/portal/portal-ui';
import DomainGetStarted from '@/components/portal/onboarding/DomainGetStarted';

export default async function PortalCmsPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/portal/login');

  const userId = parseInt(session.user.id, 10);
  const client = await getPortalClient(userId);
  if (!client) redirect('/portal/dashboard');

  const { created } = await searchParams;

  const websites = await db
    .select()
    .from(clientWebsites)
    .where(eq(clientWebsites.clientId, client.id))
    .orderBy(clientWebsites.createdAt);

  const postCounts = websites.length > 0
    ? await db
        .select({ websiteId: posts.websiteId, count: sql<number>`count(*)::int` })
        .from(posts)
        .where(sql`${posts.websiteId} = ANY(ARRAY[${sql.raw(websites.map(w => w.id).join(','))}]::int[])`)
        .groupBy(posts.websiteId)
    : [];

  const countMap = Object.fromEntries(postCounts.map(r => [r.websiteId, r.count]));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PortalPageHeader
        eyebrow="Sites"
        title="Websites"
        subtitle="Gerencie as páginas e o conteúdo dos seus sites."
        actions={
          <Link
            href="/portal/websites/new"
            className={pBtnPrimary}
          >
            <span className="material-icons text-base">add</span>
            Novo site
          </Link>
        }
      />

      <DomainGetStarted domainKey="websites" />

      {created === '1' && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300">
          <span className="material-icons text-green-600">check_circle</span>
          <div>
            <p className="font-medium text-sm">Site criado!</p>
            <p className="text-xs mt-0.5">Comece criando a primeira página.</p>
          </div>
        </div>
      )}

      {websites.length === 0 ? (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <span className="material-icons text-3xl text-primary">web</span>
            </div>
            <h2 className="font-display font-extrabold tracking-[-0.01em] text-foreground mb-1">Crie seu primeiro site</h2>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              Crie um site e edite as páginas com o editor visual em blocos — sem programação.
            </p>
            <Link
              href="/portal/websites/new"
              className={pBtnPrimary}
            >
              <span className="material-icons text-base">add</span>
              Criar site
            </Link>
          </div>

          <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-2xl">
            <span className="material-icons text-muted-foreground">support_agent</span>
            <div className="flex-1 text-sm">
              <p className="font-medium text-foreground">Prefere ajuda com a configuração?</p>
              <p className="text-muted-foreground text-xs mt-0.5">Abra um chamado e nossa equipe ajuda você.</p>
            </div>
            <Link
              href="/portal/tickets/new"
              className="text-sm text-primary hover:underline shrink-0 flex items-center gap-1"
            >
              Pedir ajuda
              <span className="material-icons text-sm">arrow_forward</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {websites.map(site => {
              const total = countMap[site.id] || 0;
              return (
                <Link
                  key={site.id}
                  href={`/portal/websites/${site.id}`}
                  // Disable viewport prefetch on the websites list — each site
                  // detail route is a heavy RSC payload and prefetching every
                  // tile saturates the server.
                  prefetch={false}
                  className="group min-w-0 bg-card border border-border rounded-2xl p-5 hover:border-primary/50 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="material-icons text-primary text-lg">language</span>
                      </div>
                      <div className="min-w-0">
                        <h2 className="font-display font-extrabold tracking-[-0.01em] text-foreground group-hover:text-primary transition-colors truncate">
                          {site.name}
                        </h2>
                        {site.subdomain ? (
                          <p className="text-xs font-mono text-muted-foreground mt-0.5 truncate">{site.subdomain}.{PLATFORM_ROOT_DOMAIN}</p>
                        ) : site.domain ? (
                          <p className="text-xs font-mono text-muted-foreground mt-0.5 truncate">{site.domain}</p>
                        ) : (
                          <p className="text-xs text-muted-foreground mt-0.5">Sem domínio</p>
                        )}
                      </div>
                    </div>
                    {(() => {
                      const ds = site.deploymentStatus;
                      if (ds === 'active') return (
                        <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          <span className="material-icons text-xs">check_circle</span>No ar
                        </span>
                      );
                      if (ds === 'provisioning') return (
                        <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          <span className="material-icons text-xs animate-spin">settings</span>Configurando
                        </span>
                      );
                      if (ds === 'failed') return (
                        <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          <span className="material-icons text-xs">error</span>Falhou
                        </span>
                      );
                      return (
                        <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          <span className="material-icons text-xs">pending</span>Pendentes
                        </span>
                      );
                    })()}
                  </div>

                  {site.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{site.description}</p>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground border-t border-border pt-3">
                    <div className="flex items-center gap-1">
                      <span className="material-icons text-sm">article</span>
                      <span>{total} {total === 1 ? 'page' : 'pages'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Aberta</span>
                      <span className="material-icons text-sm">arrow_forward</span>
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* Add another */}
            <Link
              href="/portal/websites/new"
              className="group border-2 border-dashed border-border rounded-2xl p-5 flex flex-col items-center justify-center text-center hover:border-primary/40 hover:bg-primary/3 transition-all min-h-36"
            >
              <span className="material-icons text-2xl text-muted-foreground group-hover:text-primary transition-colors mb-1">add_circle_outline</span>
              <p className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">Adicionar outro site</p>
            </Link>
          </div>

          <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-2xl">
            <span className="material-icons text-muted-foreground">support_agent</span>
            <div className="flex-1 text-sm">
              <p className="font-medium text-foreground">Precisa de ajuda com o site?</p>
              <p className="text-muted-foreground text-xs mt-0.5">Nossa equipe ajuda com configuração, DNS ou conteúdo.</p>
            </div>
            <Link
              href="/portal/tickets/new"
              className="text-sm text-primary hover:underline shrink-0 flex items-center gap-1"
            >
              Abrir chamado
              <span className="material-icons text-sm">arrow_forward</span>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
