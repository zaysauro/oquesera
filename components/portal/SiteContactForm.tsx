'use client';

import { useEffect, useState } from 'react';
import { pCard, pInput } from '@/components/portal/portal-ui';

type Contact = { contactEmail: string; contactPhone: string; contactWhatsapp: string; contactAddress: string };
const EMPTY: Contact = { contactEmail: '', contactPhone: '', contactWhatsapp: '', contactAddress: '' };

/** Kumo One: edit the contact details shown in the site footer. */
export default function SiteContactForm({ siteId }: { siteId: number }) {
  const [values, setValues] = useState<Contact>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch(`/api/portal/websites/${siteId}/contact`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          const d = j.data;
          setValues({ contactEmail: d.contactEmail ?? '', contactPhone: d.contactPhone ?? '', contactWhatsapp: d.contactWhatsapp ?? '', contactAddress: d.contactAddress ?? '' });
        }
      })
      .finally(() => setLoading(false));
  }, [siteId]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    const res = await fetch(`/api/portal/websites/${siteId}/contact`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    const j = await res.json().catch(() => ({}));
    setStatus(res.ok && j.success ? { ok: true, text: 'Contatos salvos.' } : { ok: false, text: j.message || 'Não foi possível salvar.' });
  }

  const input = (key: keyof Contact, label: string, type = 'text') => (
    <div>
      <label htmlFor={`contact-${key}`} className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
      <input id={`contact-${key}`} type={type} value={values[key]} disabled={loading}
        onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))} className={`${pInput} w-full`} />
    </div>
  );

  return (
    <form onSubmit={save} className={`${pCard} space-y-4 p-5`} aria-labelledby="contact-title">
      <div>
        <h2 id="contact-title" className="font-semibold text-foreground">Informações de contato</h2>
        <p className="text-sm text-muted-foreground">Exibidas no rodapé de todas as páginas do site.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {input('contactPhone', 'Telefone', 'tel')}
        {input('contactWhatsapp', 'WhatsApp', 'tel')}
        {input('contactEmail', 'E-mail', 'email')}
      </div>
      <div>
        <label htmlFor="contact-address" className="mb-1.5 block text-sm font-medium text-foreground">Endereço (uma linha por item)</label>
        <textarea id="contact-address" rows={3} value={values.contactAddress} disabled={loading}
          onChange={(e) => setValues((v) => ({ ...v, contactAddress: e.target.value }))} className={`${pInput} w-full`} />
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">Salvar contatos</button>
        {status && <span role="status" className={`text-sm ${status.ok ? 'text-green-600' : 'text-destructive'}`}>{status.text}</span>}
      </div>
    </form>
  );
}
