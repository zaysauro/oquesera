import { generateSEO } from '@/lib/utils/seo';
import { getPublicPlans } from '@/lib/kumo/plans';
import { PlanCards } from '@/components/kumo/PlanCards';
import { FEATURE_DOMAINS, TIERS, tierDomainKeys } from '@/lib/billing/domain-catalog';

export const metadata = generateSEO({
  title: 'Preços',
  description: 'Planos Essencial, Profissional e Empresarial do Kumo One, com preços mensais em reais.',
  path: '/precos',
});

export const dynamic = 'force-dynamic';

export default async function PrecosPage() {
  const plans = await getPublicPlans();
  const grants = TIERS.map((t) => new Set(tierDomainKeys(t)));
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-4xl font-extrabold tracking-tight">Preços</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">Assinatura mensal por empresa, em reais, sem taxa de adesão e sem fidelidade.</p>
      <div className="mt-10">
        <PlanCards plans={plans} showModules />
      </div>

      <h2 className="mt-16 text-2xl font-bold">Comparativo de módulos</h2>
      <div className="mt-6 overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-muted">
            <tr>
              <th scope="col" className="p-3 text-left font-semibold">Módulo</th>
              {TIERS.map((t, i) => (
                <th key={t.slug} scope="col" className="p-3 text-center font-semibold">{plans[i]?.name ?? t.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FEATURE_DOMAINS.map((d) => (
              <tr key={d.key} className="border-t border-border">
                <th scope="row" className="p-3 text-left font-normal">{d.name}</th>
                {grants.map((g, i) => (
                  <td key={i} className="p-3 text-center">
                    {g.has(d.key) ? <span aria-label="Incluído" className="font-bold text-yellow-600 dark:text-yellow-400">✓</span> : <span aria-label="Não incluído" className="text-muted-foreground">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="mt-12 space-y-3 text-sm text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground">Observações</h2>
        <p>Recursos de IA consomem tokens do provedor configurado. O volume incluído em cada plano é uma franquia mensal; o uso acima dela é cobrado conforme a tabela exibida no painel.</p>
        <p>Pagamentos on-line são processados pelo Stripe (cartão). Pix e boleto ainda não estão disponíveis.</p>
        <p>Valores sem impostos destacados. A emissão de nota fiscal depende do cadastro fiscal da empresa operadora do Kumo One.</p>
      </section>
    </div>
  );
}
