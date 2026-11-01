import Link from 'next/link';
import { KumoLogo } from '@/components/kumo/KumoLogo';
import { SUPPORT_EMAIL } from '@/config/brand';

/** Public marketing footer (Kumo One), including the open-source attribution the Apache-2.0 base asks us to keep visible. */
export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <KumoLogo size={28} className="text-foreground" />
          <p className="text-sm text-muted-foreground">
            CRM, sites, agenda, projetos, documentos e automações para pequenas empresas brasileiras.
          </p>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold text-foreground">Produto</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/funcionalidades" className="hover:text-foreground">Funcionalidades</Link></li>
            <li><Link href="/precos" className="hover:text-foreground">Preços</Link></li>
            <li><Link href="/#segmentos" className="hover:text-foreground">Para quem é</Link></li>
            <li><Link href="/#perguntas" className="hover:text-foreground">Perguntas frequentes</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold text-foreground">Empresa</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/sobre" className="hover:text-foreground">Sobre o Kumo One</Link></li>
            <li><Link href="/termos" className="hover:text-foreground">Termos de uso</Link></li>
            <li><Link href="/privacidade" className="hover:text-foreground">Privacidade e LGPD</Link></li>
            {SUPPORT_EMAIL && (
              <li><a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-foreground">{SUPPORT_EMAIL}</a></li>
            )}
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold text-foreground">Acesso</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/portal/login" className="hover:text-foreground">Entrar</Link></li>
            <li><Link href="/portal/signup" className="hover:text-foreground">Criar conta</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Kumo One. Todos os direitos reservados.</p>
          <p>
            Construído sobre o projeto open source{' '}
            <a href="https://github.com/SimplerDevelopment/SimplerDevelopment" className="underline hover:text-foreground" rel="noopener">
              SimplerDevelopment
            </a>{' '}
            (Apache-2.0). Veja os avisos de terceiros no repositório.
          </p>
        </div>
      </div>
    </footer>
  );
}
