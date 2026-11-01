import Link from 'next/link';
import { generateSEO } from '@/lib/utils/seo';
import { FEATURES } from '@/components/kumo/content';

export const metadata = generateSEO({
  title: 'Funcionalidades',
  description: 'CRM, criador de sites, agendamento, projetos, contratos, automações, IA, e-mail marketing e cobranças no Kumo One.',
  path: '/funcionalidades',
});

export default function FuncionalidadesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-4xl font-extrabold tracking-tight">Funcionalidades</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
        Tudo funciona dentro do mesmo painel e compartilha o mesmo cadastro de clientes. Quando um recurso depende de uma conta
        externa, indicamos abaixo.
      </p>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {FEATURES.map((f) => (
          <article key={f.title} className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold">{f.title}</h2>
            <p className="mt-2 text-muted-foreground">{f.text}</p>
            {f.requires && (
              <p className="mt-3 rounded-md bg-yellow-400/15 px-3 py-2 text-sm text-foreground">
                <strong>Observação:</strong> {f.requires}
              </p>
            )}
          </article>
        ))}
      </div>
      <section className="mt-14 rounded-2xl border border-border bg-card p-8">
        <h2 className="text-2xl font-bold">Segurança e administração</h2>
        <ul className="mt-4 grid gap-3 text-muted-foreground md:grid-cols-2">
          <li>• Cada empresa acessa somente os próprios dados.</li>
          <li>• Papéis de usuário: proprietário, administrador, membro e leitor.</li>
          <li>• Convite de colaboradores por e-mail.</li>
          <li>• Recuperação de senha e autenticação em dois fatores.</li>
          <li>• Registro de auditoria das operações relevantes.</li>
          <li>• Chaves de API guardadas criptografadas, somente no servidor.</li>
        </ul>
      </section>
      <div className="mt-12 flex flex-col gap-3 sm:flex-row">
        <Link href="/portal/signup" className="rounded-md bg-yellow-400 px-6 py-3 text-center font-semibold text-black hover:bg-yellow-300">Criar conta</Link>
        <Link href="/precos" className="rounded-md border border-border px-6 py-3 text-center font-semibold hover:bg-accent">Ver preços</Link>
      </div>
    </div>
  );
}
