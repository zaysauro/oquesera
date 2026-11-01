'use client';

import { Suspense, useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { ResendVerificationButton } from '@/components/portal/ResendVerificationButton';
import { isGoogleAuthEnabled, isSignupDisabled } from '@/lib/auth-providers';
import {
  AuthShell,
  AuthField,
  AuthDivider,
  authEyebrow,
  authHeading,
  authSubtext,
  authLabel,
  authInput,
  authPrimaryBtn,
  authGhostBtn,
} from '@/components/portal/AuthShell';

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
      <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}

function BackToSignIn() {
  return (
    <a href="/portal/login" className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
      <span className="material-icons text-sm">arrow_back</span>
      Voltar para o login
    </a>
  );
}

function SignupForm() {
  const searchParams = useSearchParams();

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [verificationSent, setVerificationSent] = useState(true);

  const verificationExpired = searchParams.get('error') === 'verification-expired';

  // Deep-link cart: persist ?modules= to localStorage so the onboarding wizard
  // can pick it up after the user signs in.
  useEffect(() => {
    const modules = searchParams.get('modules');
    if (modules) {
      try {
        localStorage.setItem('sd-signup-cart', modules);
      } catch {
        // localStorage unavailable (SSR, privacy mode) — silently ignore
      }
    }
  }, [searchParams]);

  async function handleGoogleSignIn() {
    await signIn('google', { callbackUrl: '/portal/onboarding' });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          ...(company ? { company } : {}),
        }),
      });
      const data = await res.json();

      if (data.success) {
        setSubmittedEmail(email);
        // The route reports whether the verification email actually went out.
        // When delivery failed (e.g. provider misconfigured), don't claim we
        // sent it — show the resend path instead.
        setVerificationSent(data.data?.verificationSent !== false);
        setSubmitted(true);
      } else {
        setError(data.message || 'Algo deu errado. Tente novamente.');
      }
    } catch {
      setError('Algo deu errado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  const errorIsExisting =
    error.toLowerCase().includes('already') ||
    error.toLowerCase().includes('exists') ||
    error.toLowerCase().includes('email in use');

  // ── Success: verification email sent ──
  if (submitted && verificationSent) {
    return (
      <AuthShell panelSubtitle="Um clique no e-mail e você entra.">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
          <span className="material-icons text-3xl text-primary">mark_email_read</span>
        </div>
        <h1 className={`${authHeading} mt-5`}>Confira seu e-mail.</h1>
        <p className={authSubtext}>
          Enviamos um link de confirmação para <strong className="text-foreground">{submittedEmail}</strong>. O link expira em 24&nbsp;horas.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">Não encontrou? Verifique a caixa de spam.</p>
        <BackToSignIn />
      </AuthShell>
    );
  }

  // ── Account created, but verification email could not be sent ──
  if (submitted && !verificationSent) {
    return (
      <AuthShell panelSubtitle="Quase lá — só falta confirmar o e-mail.">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10">
          <span className="material-icons text-3xl text-amber-600 dark:text-amber-400">mark_email_unread</span>
        </div>
        <h1 className={`${authHeading} mt-5`}>Conta criada.</h1>
        <p className={authSubtext}>
          Não conseguimos enviar o e-mail de confirmação para <strong className="text-foreground">{submittedEmail}</strong> agora. Reenvie abaixo para concluir a ativação da conta.
        </p>
        <div className="mt-5">
          <ResendVerificationButton prefillEmail={submittedEmail} />
        </div>
        <BackToSignIn />
      </AuthShell>
    );
  }

  // ── Signup form ──
  return (
    <AuthShell panelSubtitle="Crie a conta e reúna a gestão da empresa em um só lugar.">
      <div className={authEyebrow}>{'// Get started'}</div>
      <h1 className={authHeading}>Crie a conta da sua empresa.</h1>
      <p className={authSubtext}>Site, CRM, agenda e projetos em um só lugar. Crie a conta sem cartão de crédito.</p>

      <div className="mt-7">
        {/* Verification-expired banner */}
        {verificationExpired && (
          <div className="mb-4 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
            <div className="mb-2 flex items-center gap-2">
              <span className="material-icons text-base">warning_amber</span>
              Esse link de confirmação expirou.
            </div>
            <ResendVerificationButton prefillEmail={email} />
          </div>
        )}

        {/* API error */}
        {error && (
          <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            <div className="flex items-center gap-2">
              <span className="material-icons text-base">error_outline</span>
              <span>
                {errorIsExisting ? (
                  <>
                    {error}{' '}
                    <a href="/portal/login" className="font-medium underline">
                      Entrar.
                    </a>
                  </>
                ) : (
                  error
                )}
              </span>
            </div>
            {errorIsExisting && (
              <div className="mt-2">
                <ResendVerificationButton prefillEmail={email} />
              </div>
            )}
          </div>
        )}

        {/* Google OAuth — only shown when the provider is configured */}
        {isGoogleAuthEnabled && (
          <>
            <button type="button" onClick={handleGoogleSignIn} className={authGhostBtn}>
              <GoogleMark />
              Cadastrar com o Google
            </button>
            <AuthDivider />
          </>
        )}

        {/* Credentials form */}
        <form method="post" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={authLabel}>Nome completo</label>
              <AuthField icon="person_outline">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  autoFocus
                  className={authInput}
                  placeholder="Maria Silva"
                />
              </AuthField>
            </div>
            <div>
              <label className={authLabel}>
                Empresa <span className="font-normal text-muted-foreground">(opcional)</span>
              </label>
              <AuthField icon="business">
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  autoComplete="organization"
                  className={authInput}
                  placeholder="Minha Empresa Ltda"
                />
              </AuthField>
            </div>
          </div>

          <div>
            <label className={authLabel}>E-mail</label>
            <AuthField icon="mail_outline">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className={authInput}
                placeholder="voce@empresa.com.br"
              />
            </AuthField>
          </div>

          <div>
            <label className={authLabel}>Senha</label>
            <AuthField icon="lock_outline">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className={`${authInput} pr-11`}
                placeholder="Pelo menos 8 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground transition-colors hover:text-foreground"
                tabIndex={-1}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                <span className="material-icons text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </AuthField>
            {password.length > 0 && password.length < 8 ? (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
                <span className="material-icons text-sm">error_outline</span>
                A senha deve ter pelo menos 8 caracteres ({password.length}/8).
              </p>
            ) : (
              <p className="mt-1.5 text-xs text-muted-foreground">Mínimo de 8 caracteres</p>
            )}
          </div>

          <button type="submit" disabled={loading} className={authPrimaryBtn}>
            {loading ? (
              <>
                <span className="material-icons animate-spin text-base">refresh</span>
                Criando conta…
              </>
            ) : (
              <>
                Criar conta
                <span className="material-icons text-[19px] transition group-hover:translate-x-0.5">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          Ao criar a conta você concorda com os{' '}
          <a href="/termos" className="underline hover:text-foreground">Termos de uso</a> e a{' '}
          <a href="/privacidade" className="underline hover:text-foreground">Política de Privacidade</a>.
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          Já tem uma conta?{' '}
          <a href="/portal/login" className="font-bold text-foreground hover:text-primary">
            Entrar
          </a>
        </p>
      </div>
    </AuthShell>
  );
}

function SignupClosed() {
  return (
    <AuthShell panelSubtitle="Toda a gestão da sua empresa em uma plataforma.">
      <div className={authEyebrow}>{'// Managed hosting'}</div>
      <h1 className={authHeading}>Cadastro indisponível.</h1>
      <p className={authSubtext}>
        O cadastro automático está desativado nesta instalação. Fale com a equipe Kumo One para criar a conta da sua empresa.
      </p>

      <div className="mt-7 flex flex-col gap-3">
        <a href="/contact" className={authPrimaryBtn}>
          Fale com a equipe Kumo One
          <span className="material-icons text-lg">arrow_forward</span>
        </a>
        <BackToSignIn />
      </div>
    </AuthShell>
  );
}

export default function SignupPage() {
  if (isSignupDisabled) return <SignupClosed />;
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
