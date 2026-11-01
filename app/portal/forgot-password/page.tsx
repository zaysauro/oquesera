'use client';

import { useState } from 'react';
import {
  AuthShell,
  AuthField,
  authEyebrow,
  authHeading,
  authSubtext,
  authLabel,
  authInput,
  authPrimaryBtn,
} from '@/components/portal/AuthShell';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/portal/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setSent(true);
      } else {
        setError(data.error || 'Algo deu errado.');
      }
    } catch {
      setError('Algo deu errado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <AuthShell panelSubtitle="Confira seu e-mail — o link expira em uma hora.">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
          <span className="material-icons text-3xl text-primary">mark_email_read</span>
        </div>
        <h1 className={`${authHeading} mt-5`}>Confira seu e-mail.</h1>
        <p className={authSubtext}>
          Se existir uma conta com <strong className="text-foreground">{email}</strong> , enviamos um link para redefinir a senha. Ele expira em 1 hora.
        </p>
        <a
          href="/portal/login"
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          <span className="material-icons text-sm">arrow_back</span>
          Voltar para o login
        </a>
      </AuthShell>
    );
  }

  return (
    <AuthShell panelSubtitle="Recuperação segura — o link funciona uma vez e expira em uma hora.">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
        <span className="material-icons text-3xl text-primary">lock_reset</span>
      </div>
      <div className={authEyebrow}>{'// Account recovery'}</div>
      <h1 className={authHeading}>Redefina sua senha.</h1>
      <p className={authSubtext}>Informe o e-mail da conta e enviaremos um link seguro para criar uma nova senha.</p>

      <div className="mt-7">
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            <span className="material-icons text-base">error_outline</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={authLabel}>E-mail</label>
            <AuthField icon="mail_outline">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
                className={authInput}
                placeholder="voce@empresa.com.br"
              />
            </AuthField>
          </div>
          <button type="submit" disabled={loading} className={authPrimaryBtn}>
            {loading ? (
              <>
                <span className="material-icons animate-spin text-base">refresh</span>
                Enviando…
              </>
            ) : (
              <>
                Enviar link
                <span className="material-icons text-[19px] transition group-hover:translate-x-0.5">send</span>
              </>
            )}
          </button>
        </form>

        <a
          href="/portal/login"
          className="mt-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <span className="material-icons text-sm">arrow_back</span>
          Voltar para o login
        </a>
      </div>
    </AuthShell>
  );
}
