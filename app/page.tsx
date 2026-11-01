import Link from 'next/link';
import { generateSEO } from '@/lib/utils/seo';
import { getPublicPlans } from '@/lib/kumo/plans';
import { PlanCards } from '@/components/kumo/PlanCards';
import { FEATURES, SEGMENTS, FAQ } from '@/components/kumo/content';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateSoftwareApplicationSchema } from '@/lib/utils/structured-data';

export const metadata = generateSEO({
  title: 'Gestão completa para pequenas empresas',
  description:
    'CRM, criador de sites, agendamento online, projetos, contratos, automações e IA em uma única plataforma, em português e com preços em reais.',
  path: '/',
});

// Plan prices are read from the database (admin-editable), so render per request.
export const dynamic = 'force-dynamic';

const PROBLEMS = [
  { title: 'Clientes espalhados', text: 'Contatos no WhatsApp, planilhas e cadernos. Oportunidades se perdem no meio do caminho.' },
  { title: 'Agenda bagunçada', text: 'Horários marcados por mensagem, conflitos e clientes que esquecem o compromisso.' },
  { title: 'Ferramentas demais', text: 'Um sistema para o site, outro para a agenda, outro para tarefas — e nenhum conversa com o outro.' },
];

const STEPS = [
  { n: '1', title: 'Crie a conta da empresa', text: 'Cadastro com e-mail e senha. Você confirma o e-mail e já entra no painel.' },
  { n: '2', title: 'Escolha um modelo de site', text: 'Selecione o modelo do seu segmento, ajuste textos, cores e contatos e publique.' },
  { n: '3', title: 'Organize clientes e agenda', text: 'Importe seus contatos, configure serviços e horários e convide sua equipe.' },
];

export default async function HomePage() {
  const plans = await getPublicPlans();
  return (
    <>
      <StructuredData data={[generateSoftwareApplicationSchema()]} />

      <section className="border-b border-border bg-background">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="mb-4 inline-block rounded-full bg-yellow-400/20 px-3 py-1 text-xs font-semibold text-foreground">
              Feito para pequenas empresas brasileiras
            </p>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl">
              Clientes, site, agenda e projetos <span className="bg-yellow-400 px-1 text-black">em um só lugar</span>.
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              O Kumo One reúne CRM, criador de sites, agendamento online, gestão de tarefas, contratos, automações e assistente de IA
              — em português e com preços em reais.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/portal/signup" className="rounded-md bg-yellow-400 px-6 py-3 text-center font-semibold text-black hover:bg-yellow-300">
                Criar conta da empresa
              </Link>
              <Link href="/funcionalidades" className="rounded-md border border-border px-6 py-3 text-center font-semibold text-foreground hover:bg-accent">
                Ver funcionalidades
              </Link>
            </div>
          </div>
          <div aria-hidden="true" className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-neutral-300 dark:bg-neutral-700" />
              <span className="h-3 w-3 rounded-full bg-neutral-300 dark:bg-neutral-700" />
              <span className="h-3 w-3 rounded-full bg-yellow-400" />
              <span className="ml-2 text-xs text-muted-foreground">Funil de vendas</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs">
              {[
                { col: 'Novo', cards: ['Orçamento de reforma', 'Pacote de corte + barba'] },
                { col: 'Em negociação', cards: ['Site para clínica'] },
                { col: 'Ganho', cards: ['Contrato mensal', 'Ensaio fotográfico'] },
              ].map((c) => (
                <div key={c.col} className="rounded-lg bg-muted p-2">
                  <p className="mb-2 font-semibold text-foreground">{c.col}</p>
                  {c.cards.map((card) => (
                    <div key={card} className="mb-2 rounded-md border border-border bg-card p-2 text-foreground">{card}</div>
                  ))}
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">Ilustração da interface com dados fictícios.</p>
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Os problemas que o Kumo One resolve</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {PROBLEMS.map((p) => (
              <div key={p.title} className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-semibold text-foreground">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Tudo o que a sua empresa usa no dia a dia</h2>
          <p className="mt-2 text-muted-foreground">Módulos integrados: um cliente cadastrado no CRM é o mesmo que agenda um horário e assina um contrato.</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.slice(0, 6).map((f) => (
              <div key={f.title} className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
              </div>
            ))}
          </div>
          <Link href="/funcionalidades" className="mt-8 inline-block font-semibold text-foreground underline decoration-yellow-400 decoration-2 underline-offset-4">
            Ver todas as funcionalidades
          </Link>
        </div>
      </section>

      <section id="segmentos" className="scroll-mt-20 bg-background">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Para quem é</h2>
          <p className="mt-2 text-muted-foreground">Cada segmento tem um modelo de site pronto para editar e publicar.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SEGMENTS.map((s) => (
              <div key={s.title} className="rounded-xl border border-border bg-card p-5">
                <h3 className="font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-neutral-950 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-bold tracking-tight">Benefícios</h2>
          <ul className="mt-8 grid gap-6 md:grid-cols-2">
            {[
              'Um único cadastro de clientes para vendas, agenda, contratos e projetos.',
              'Seu site no ar sem contratar desenvolvedor, com SEO básico e celular.',
              'Clientes marcam horário sozinhos, sem conflitos na agenda.',
              'Cada empresa vê apenas os próprios dados, com permissões por usuário.',
              'IA que trabalha com os dados da sua empresa, usando o provedor que você escolher.',
              'Interface em português, valores em reais, modo claro e escuro.',
            ].map((b) => (
              <li key={b} className="flex gap-3">
                <span aria-hidden="true" className="mt-1 h-3 w-3 flex-none rounded-sm bg-yellow-400" />
                <span className="text-neutral-200">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="planos" className="scroll-mt-20 bg-background">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Planos</h2>
          <p className="mt-2 mb-8 text-muted-foreground">Preços mensais em reais. Sem taxa de adesão.</p>
          <PlanCards plans={plans} />
          <Link href="/precos" className="mt-6 inline-block text-sm font-semibold text-foreground underline decoration-yellow-400 decoration-2 underline-offset-4">
            Comparar planos em detalhe
          </Link>
        </div>
      </section>

      <section className="border-y border-border bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Como começar</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="rounded-xl border border-border bg-card p-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-400 font-bold text-black">{s.n}</span>
                <h3 className="mt-4 font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="perguntas" className="scroll-mt-20 bg-background">
        <div className="mx-auto max-w-3xl px-4 py-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Perguntas frequentes</h2>
          <div className="mt-8 divide-y divide-border rounded-xl border border-border bg-card">
            {FAQ.map((f) => (
              <details key={f.q} className="group p-5">
                <summary className="cursor-pointer list-none font-semibold text-foreground">
                  <span className="mr-2 text-yellow-500 group-open:hidden">+</span>
                  <span className="mr-2 hidden text-yellow-500 group-open:inline">−</span>
                  {f.q}
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-yellow-400">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 py-14 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-black">Comece a organizar sua empresa hoje.</h2>
            <p className="mt-2 text-black/80">Crie a conta, escolha um modelo de site e cadastre seus primeiros clientes.</p>
          </div>
          <Link href="/portal/signup" className="rounded-md bg-black px-6 py-3 font-semibold text-white hover:bg-neutral-800">
            Criar conta
          </Link>
        </div>
      </section>
    </>
  );
}
