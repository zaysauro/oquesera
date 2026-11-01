'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { KumoLogo } from '@/components/kumo/KumoLogo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const LINKS = [
  { href: '/funcionalidades', label: 'Funcionalidades' },
  { href: '/#segmentos', label: 'Para quem' },
  { href: '/precos', label: 'Preços' },
  { href: '/#perguntas', label: 'Perguntas' },
  { href: '/sobre', label: 'Sobre' },
];

/** Public marketing header (Kumo One). The portal and admin render their own chrome. */
export function Navigation() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4" aria-label="Principal">
        <Link href="/" className="text-foreground" aria-label="Kumo One — início">
          <KumoLogo size={30} />
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition-colors hover:text-foreground ${
                pathname === l.href ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Link href="/portal/login" className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent">
            Entrar
          </Link>
          <Link
            href="/portal/signup"
            className="rounded-md bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-300"
          >
            Criar conta
          </Link>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-md p-2 text-foreground hover:bg-accent"
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div id="menu-mobile" className="border-t border-border bg-background px-4 pb-4 md:hidden">
          <ul className="flex flex-col py-2">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={() => setOpen(false)} className="block py-3 text-base font-medium text-foreground">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <Link href="/portal/login" className="flex-1 rounded-md border border-border px-4 py-2.5 text-center text-sm font-medium text-foreground">
              Entrar
            </Link>
            <Link href="/portal/signup" className="flex-1 rounded-md bg-yellow-400 px-4 py-2.5 text-center text-sm font-semibold text-black">
              Criar conta
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
