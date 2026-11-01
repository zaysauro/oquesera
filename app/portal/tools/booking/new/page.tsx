'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PortalPageHeader } from '@/components/portal/PortalPageHeader';
import { pBtnPrimary, pCardPad, pInput, pSelect } from '@/components/portal/portal-ui';

const durationOptions = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '60 minutes' },
  { value: 90, label: '90 minutes' },
  { value: 120, label: '120 minutes' },
];

export default function NewBookingPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(30);
  const [timezone, setTimezone] = useState(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/portal/tools/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          duration,
          timezone,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.message || 'Failed to create booking page');
        setLoading(false);
        return;
      }

      router.push(`/portal/tools/booking/${data.data.id}`);
    } catch {
      setError('Algo deu errado. Tente novamente.');
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/portal/tools/booking"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
      >
        <span className="material-icons text-lg">arrow_back</span>
        Voltar para páginas de agendamento
      </Link>
      <PortalPageHeader
        eyebrow="Booking"
        title="Criar página de agendamento"
        subtitle="Configure uma página para seus clientes agendarem horários"
      />

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
            <span className="material-icons">error</span>
            {error}
          </div>
        )}

        <div className={`${pCardPad} space-y-4`}>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex.: Corte de cabelo (30 min)"
              className={pInput}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Descrição
              <span className="font-normal text-muted-foreground ml-1">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descrição exibida para quem vai agendar"
              rows={3}
              className={`${pInput} resize-none`}
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="booking-duration" className="block text-sm font-medium text-foreground mb-1.5">Duração</label>
            <select
              id="booking-duration"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className={pSelect}
              disabled={loading}
            >
              {durationOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Fuso horário</label>
            <input
              type="text"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="America/Sao_Paulo"
              className={pInput}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Fuso horário IANA (ex.: America/Sao_Paulo)
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !title.trim()}
          className={`w-full ${pBtnPrimary}`}
        >
          {loading ? (
            <>
              <span className="material-icons animate-spin text-lg">autorenew</span>
              Creating...
            </>
          ) : (
            <>
              <span className="material-icons text-lg">add_circle</span>
              Criar página de agendamento
            </>
          )}
        </button>
      </form>
    </div>
  );
}
