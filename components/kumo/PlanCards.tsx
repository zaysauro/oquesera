import Link from 'next/link';
import { formatMoney } from '@/lib/utils/money';
import type { PublicPlan } from '@/lib/kumo/plans';

export function PlanCards({ plans, showModules = false }: { plans: PublicPlan[]; showModules?: boolean }) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map((p) => (
        <div
          key={p.slug}
          className={`flex flex-col rounded-2xl border p-6 ${
            p.highlighted ? 'border-yellow-400 bg-card shadow-lg ring-2 ring-yellow-400' : 'border-border bg-card'
          }`}
        >
          {p.highlighted && (
            <span className="mb-3 w-fit rounded-full bg-yellow-400 px-3 py-1 text-xs font-semibold text-black">Mais completo para crescer</span>
          )}
          <h3 className="text-xl font-bold text-foreground">{p.name}</h3>
          <p className="mt-1 min-h-[3rem] text-sm text-muted-foreground">{p.tagline}</p>
          <p className="mt-4">
            <span className="text-4xl font-extrabold tracking-tight text-foreground">{formatMoney(p.priceCents)}</span>
            <span className="text-sm text-muted-foreground">/mês</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Valor mensal por empresa. A primeira assinatura tem 14 dias de teste (cartão obrigatório).</p>
          <ul className="mt-6 flex-1 space-y-2 text-sm">
            {p.features.map((f) => (
              <li key={f} className="flex gap-2 text-foreground">
                <span aria-hidden="true" className="mt-0.5 text-yellow-500">✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
          {showModules && (
            <p className="mt-4 text-xs text-muted-foreground">
              <strong className="text-foreground">Módulos:</strong> {p.modules.join(', ')}.
            </p>
          )}
          <Link
            href={`/portal/signup?plano=${p.key}`}
            className={`mt-6 rounded-md px-4 py-2.5 text-center text-sm font-semibold ${
              p.highlighted ? 'bg-yellow-400 text-black hover:bg-yellow-300' : 'bg-foreground text-background hover:opacity-90'
            }`}
          >
            Começar com o {p.name}
          </Link>
        </div>
      ))}
    </div>
  );
}
