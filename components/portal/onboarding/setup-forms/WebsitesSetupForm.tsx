'use client';

/**
 * Inline "create your first site" form for the onboarding quick-setup step —
 * the same essentials as /portal/websites/new (name + subdomain → POST
 * /api/portal/cms/websites), embedded so the user configures the module right
 * in the wizard instead of being bounced to another tab.
 */

import { PLATFORM_ROOT_DOMAIN } from '@/config/brand';
import { useState } from 'react';
import { slugify } from '@/lib/publishing/slug';
import { obPrimaryBtn } from '../ob-styles';

interface Props {
  /** Called with the new site id after a successful create. */
  onCreated: (siteId: number) => void;
}

export function WebsitesSetupForm({ onCreated }: Props) {
  const [name, setName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const effectiveSubdomain = subdomain || slugify(name, 63);

  async function handleCreate() {
    if (!name.trim()) {
      setError('Dê um nome ao site.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/portal/cms/websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), subdomain: effectiveSubdomain || null }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'Failed to create the site — try again.');
        return;
      }
      onCreated(data.data.id);
    } catch {
      setError('Algo deu errado — tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-[13px] border border-primary/30 bg-primary/[0.04] px-[15px] py-[13px] space-y-3">
      <div>
        <p className="text-[14px] font-semibold leading-snug">Dê nome ao seu primeiro site</p>
        <p className="text-[12.5px] text-muted-foreground mt-0.5">
          Criado aqui mesmo, sem sair da configuração. Você pode adicionar um domínio próprio depois.
        </p>
      </div>

      <div className="space-y-2.5">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && name.trim() && !saving) void handleCreate();
          }}
          placeholder="Nome do site — ex.: Padaria Bom Dia"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary"
          data-testid="ob-setup-site-name"
        />
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={subdomain}
            onChange={(e) => setSubdomain(slugify(e.target.value, 63))}
            placeholder={effectiveSubdomain || 'subdomain'}
            className="flex-1 min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Subdomínio"
          />
          <span className="text-[13px] text-muted-foreground whitespace-nowrap">.{PLATFORM_ROOT_DOMAIN}</span>
        </div>
      </div>

      {error && (
        <p className="text-[12.5px] text-destructive flex items-center gap-1.5" role="alert">
          <span className="material-icons text-[15px]">error_outline</span>
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleCreate}
        disabled={saving || !name.trim()}
        className={`w-full ${obPrimaryBtn}`}
        data-testid="ob-setup-site-create"
      >
        {saving ? (
          <span className="material-icons text-[18px] animate-spin">refresh</span>
        ) : (
          <span className="material-icons text-[18px]">add_circle</span>
        )}
        {saving ? 'Criando…' : 'Criar site'}
      </button>
    </div>
  );
}
