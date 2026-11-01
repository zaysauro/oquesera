'use client';

// Inline "Reenviar verification email" action used on the signup error path and
// the verification-expired redirect path. Accepts an optional prefillEmail so
// the field is pre-populated when the user has already typed their address.

import { useState } from 'react';

interface Props {
  prefillEmail?: string;
}

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function ResendVerificationButton({ prefillEmail = '' }: Props) {
  const [inputEmail, setInputEmail] = useState(prefillEmail);
  const [status, setStatus] = useState<Status>('idle');

  async function handleResend() {
    const email = inputEmail.trim();
    if (!email) return;
    setStatus('sending');
    try {
      await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      // Always treat as success — the endpoint never reveals account existence.
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="flex items-center gap-1.5 text-green-700 dark:text-green-400 text-xs">
        <span className="material-icons text-sm">mark_email_read</span>
        Se esse endereço tiver uma confirmação pendente, um novo link está a caminho.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs opacity-80">
        Precisa de um novo link de confirmação? Informe seu e-mail e reenviaremos.
      </p>
      <div className="flex gap-2">
        <input
          type="email"
          value={inputEmail}
          onChange={(e) => setInputEmail(e.target.value)}
          placeholder="voce@empresa.com.br"
          className="flex-1 min-w-0 px-2 py-1 rounded border border-current/30 bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          type="button"
          onClick={handleResend}
          disabled={status === 'sending' || !inputEmail.trim()}
          className="shrink-0 px-3 py-1 rounded bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
        >
          {status === 'sending' ? (
            <>
              <span className="material-icons text-xs animate-spin">refresh</span>
              Enviando...
            </>
          ) : (
            <>
              <span className="material-icons text-xs">send</span>
              Reenviar
            </>
          )}
        </button>
      </div>
      {status === 'error' && (
        <p className="text-xs text-destructive">Algo deu errado — tente novamente.</p>
      )}
    </div>
  );
}
