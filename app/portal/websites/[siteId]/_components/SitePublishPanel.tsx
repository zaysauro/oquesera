'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  siteId: number;
  /** Host the public renderer resolves (custom domain or <sub>.<root>). */
  host: string;
  publicAccess: boolean;
  pageCount: number;
  publishedCount: number;
  /** True when the platform root domain is configured, so https://<host> works. */
  hasPublicDomain: boolean;
}

/**
 * Kumo One: one place to preview and publish a whole site. Publishing flips
 * every page live and opens public access (POST …/publish, audited server-side).
 */
export default function SitePublishPanel({ siteId, host, publicAccess, pageCount, publishedCount, hasPublicDomain }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const live = publicAccess && publishedCount > 0;
  const appPath = `/sites/${host}`;
  const publicUrl = hasPublicDomain ? `https://${host}` : appPath;

  async function toggle(publish: boolean) {
    if (!publish && !window.confirm('Despublicar o site? Ele deixará de ficar acessível ao público.')) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/portal/cms/websites/${siteId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publish }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) setError(json.message || 'Não foi possível concluir a operação.');
      else router.refresh();
    } catch {
      setError('Erro de rede. Tente novamente.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-5" aria-labelledby="publish-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="publish-title" className="flex items-center gap-2 font-semibold text-foreground">
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${live ? 'bg-green-500' : 'bg-yellow-500'}`} aria-hidden="true" />
            {live ? 'Site publicado' : 'Site em rascunho'}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {publishedCount} de {pageCount} página(s) publicada(s).{' '}
            {live ? (
              <>Endereço: <a href={publicUrl} target="_blank" rel="noopener" className="font-mono text-foreground underline">{hasPublicDomain ? host : publicUrl}</a></>
            ) : (
              'Revise na pré-visualização antes de publicar.'
            )}
          </p>
          {error && <p className="mt-2 text-sm text-destructive" role="alert">{error}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`${appPath}?_preview=true`} target="_blank" rel="noopener" className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">
            Pré-visualizar
          </a>
          {pageCount > 0 && (
            <button type="button" disabled={busy} onClick={() => toggle(true)} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
              {busy ? 'Salvando…' : live ? 'Publicar alterações' : 'Publicar site'}
            </button>
          )}
          {live && (
            <button type="button" disabled={busy} onClick={() => toggle(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              Despublicar
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
