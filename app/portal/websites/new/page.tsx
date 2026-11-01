'use client';

import { PLATFORM_ROOT_DOMAIN } from '@/config/brand';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { slugify } from '@/lib/publishing/slug';
import { pBtnPrimary, pBtnGhost, pCard, pInput } from '@/components/portal/portal-ui';
import { SITE_TEMPLATES } from '@/lib/kumo/site-templates';

const BLANK = 'em-branco';

interface BookingPageOption { slug: string; title: string }

export default function PortalCmsNewPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [template, setTemplate] = useState<string>('');
  const [form, setForm] = useState({ name: '', domain: '', description: '', subdomain: '' });
  const [info, setInfo] = useState({ company: '', phone: '', whatsapp: '', email: '', address: '', city: '', bookingSlug: '' });
  const [bookingPages, setBookingPages] = useState<BookingPageOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/portal/tools/booking')
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => { if (json?.success) setBookingPages(json.data || []); })
      .catch(() => {});
  }, []);

  const effectiveSubdomain = form.subdomain || slugify(form.name, 63);
  const usesTemplate = template && template !== BLANK;

  const handleCreate = async () => {
    if (!form.name) { setError('Informe o nome do site.'); return; }
    setSaving(true); setError('');
    const res = await fetch('/api/portal/cms/websites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        domain: form.domain || null,
        description: form.description || null,
        subdomain: effectiveSubdomain || null,
        ...(usesTemplate ? { template, templateInfo: { ...info, company: info.company || form.name } } : {}),
      }),
    });
    const data = await res.json().catch(() => ({ success: false }));
    if (!data.success) { setSaving(false); setError(data.message || 'Não foi possível criar o site.'); return; }
    router.push(`/portal/websites/${data.data.id}?created=1`);
  };

  const field = (key: keyof typeof info, label: string, placeholder: string, type = 'text') => (
    <div>
      <label htmlFor={`info-${key}`} className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      <input
        id={`info-${key}`}
        type={type}
        value={info[key]}
        onChange={(e) => setInfo((i) => ({ ...i, [key]: e.target.value }))}
        placeholder={placeholder}
        className={`${pInput} w-full`}
      />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/portal/websites" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <span className="material-icons text-base">arrow_back</span>
        Voltar para Sites
      </Link>

      <div className="flex items-center gap-2" aria-label="Etapas">
        {([1, 2, 3] as const).map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {step > s ? <span className="material-icons text-sm">check</span> : s}
            </div>
            {s < 3 && <div className={`h-px w-8 ${step > s ? 'bg-primary' : 'bg-border'}`} />}
          </div>
        ))}
        <div className="ml-2 text-xs text-muted-foreground">
          {step === 1 && 'Escolha o modelo'}
          {step === 2 && 'Dados da empresa'}
          {step === 3 && 'Endereço do site'}
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h1 className="text-xl font-display font-extrabold tracking-[-0.02em] text-foreground">Escolha um modelo inicial</h1>
            <p className="text-muted-foreground text-sm mt-1">O modelo cria as páginas Início, Serviços, Sobre e Contato com textos de exemplo, cores e um formulário de contato. Tudo pode ser editado depois.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {SITE_TEMPLATES.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => { setTemplate(t.key); setStep(2); }}
                className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all hover:border-primary/60 ${template === t.key ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}
              >
                <div className="flex shrink-0 overflow-hidden rounded-lg" aria-hidden="true">
                  {t.colors.map((c) => <span key={c} className="h-9 w-3" style={{ background: c }} />)}
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                </div>
              </button>
            ))}
            <button
              type="button"
              onClick={() => { setTemplate(BLANK); setStep(3); }}
              className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all hover:border-primary/60 ${template === BLANK ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}
            >
              <span className="material-icons text-muted-foreground">add</span>
              <div>
                <p className="font-medium text-foreground text-sm">Em branco</p>
                <p className="text-xs text-muted-foreground mt-0.5">Comece sem páginas e monte tudo no editor.</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div>
            <h1 className="text-xl font-display font-extrabold tracking-[-0.02em] text-foreground">Dados da empresa</h1>
            <p className="text-muted-foreground text-sm mt-1">Usados nos textos, no rodapé e na página de contato. Deixe em branco o que não quiser exibir.</p>
          </div>
          <div className={`${pCard} p-5 grid gap-4 sm:grid-cols-2`}>
            <div className="sm:col-span-2">
              <label htmlFor="site-name" className="block text-sm font-medium text-foreground mb-1.5">Nome da empresa no site *</label>
              <input
                id="site-name"
                autoFocus
                value={form.name}
                onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setInfo((i) => ({ ...i, company: e.target.value })); }}
                placeholder="Ex.: Barbearia do Centro"
                className={`${pInput} w-full`}
              />
            </div>
            {field('phone', 'Telefone', '(11) 3333-4444', 'tel')}
            {field('whatsapp', 'WhatsApp', '(11) 99999-8888', 'tel')}
            {field('email', 'E-mail de contato', 'contato@empresa.com.br', 'email')}
            {field('city', 'Cidade / UF', 'São Paulo — SP')}
            <div className="sm:col-span-2">{field('address', 'Endereço', 'Rua Exemplo, 123 — Bairro')}</div>
            {bookingPages.length > 0 && (
              <div className="sm:col-span-2">
                <label htmlFor="info-booking" className="block text-sm font-medium text-foreground mb-1.5">Página de agendamento <span className="text-muted-foreground font-normal">(opcional)</span></label>
                <select
                  id="info-booking"
                  value={info.bookingSlug}
                  onChange={(e) => setInfo((i) => ({ ...i, bookingSlug: e.target.value }))}
                  className={`${pInput} w-full`}
                >
                  <option value="">Botões apontam para a página de contato</option>
                  {bookingPages.map((p) => <option key={p.slug} value={p.slug}>{p.title}</option>)}
                </select>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(1)} className={pBtnGhost}>Voltar</button>
            <button type="button" onClick={() => (form.name ? (setError(''), setStep(3)) : setError('Informe o nome da empresa.'))} className={pBtnPrimary}>Continuar</button>
          </div>
          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <div>
            <h1 className="text-xl font-display font-extrabold tracking-[-0.02em] text-foreground">Endereço do site</h1>
            <p className="text-muted-foreground text-sm mt-1">O site fica disponível em um subdomínio de {PLATFORM_ROOT_DOMAIN}. Você pode adicionar um domínio próprio depois.</p>
          </div>
          <div className={`${pCard} p-5 space-y-4`}>
            {template === BLANK && (
              <div>
                <label htmlFor="site-name-blank" className="block text-sm font-medium text-foreground mb-1.5">Nome do site *</label>
                <input id="site-name-blank" autoFocus value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ex.: Site da empresa" className={`${pInput} w-full`} />
              </div>
            )}
            <div>
              <label htmlFor="site-sub" className="block text-sm font-medium text-foreground mb-1.5">Subdomínio</label>
              <div className="flex items-center gap-2">
                <input
                  id="site-sub"
                  value={effectiveSubdomain}
                  onChange={(e) => setForm((f) => ({ ...f, subdomain: slugify(e.target.value, 63) }))}
                  className={`${pInput} w-full font-mono`}
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">.{PLATFORM_ROOT_DOMAIN}</span>
              </div>
            </div>
            <div>
              <label htmlFor="site-domain" className="block text-sm font-medium text-foreground mb-1.5">Domínio próprio <span className="text-muted-foreground font-normal">(opcional)</span></label>
              <input
                id="site-domain"
                value={form.domain}
                onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value.replace(/^https?:\/\//, '') }))}
                placeholder="www.suaempresa.com.br"
                className={`${pInput} w-full font-mono`}
              />
              <p className="text-xs text-muted-foreground mt-1">Depois de criar, aponte o DNS do domínio conforme as instruções nas configurações do site.</p>
            </div>
            {effectiveSubdomain && (
              <p className="text-xs text-muted-foreground">Endereço: <span className="text-foreground font-mono">{effectiveSubdomain}.{PLATFORM_ROOT_DOMAIN}</span></p>
            )}
          </div>
          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(template === BLANK ? 1 : 2)} className={pBtnGhost}>Voltar</button>
            <button type="button" onClick={handleCreate} disabled={saving || !form.name} className={pBtnPrimary}>
              {saving ? 'Criando…' : usesTemplate ? 'Criar site com o modelo' : 'Criar site'}
            </button>
          </div>
          {usesTemplate && <p className="text-xs text-muted-foreground">As páginas são criadas como rascunho. Revise na pré-visualização e publique quando estiver pronto.</p>}
        </div>
      )}
    </div>
  );
}
