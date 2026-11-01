import Link from 'next/link';
import { generateSEO } from '@/lib/utils/seo';

export const metadata = generateSEO({ title: 'Sobre', description: 'Conheça o Kumo One, a plataforma de gestão para pequenas empresas brasileiras.', path: '/sobre' });

export default function SobrePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-extrabold tracking-tight">Sobre o Kumo One</h1>
      <div className="mt-8 space-y-5 text-lg text-muted-foreground">
        <p>
          <strong className="text-foreground">Kumo</strong> significa &quot;nuvem&quot; em japonês. O Kumo One nasceu para colocar na nuvem,
          em um só lugar, as ferramentas que uma pequena empresa usa todos os dias: cadastro de clientes, vendas, site, agenda, tarefas,
          documentos e automações.
        </p>
        <p>
          Em vez de assinar cinco serviços que não conversam entre si, você mantém um único cadastro de clientes que aparece no funil de
          vendas, na agenda, nos contratos e nos projetos.
        </p>
        <p>
          O produto é construído sobre software de código aberto maduro — em especial o projeto SimplerDevelopment, distribuído sob a
          licença Apache-2.0 — e adaptado ao mercado brasileiro: interface em português, valores em reais e modelos de site para
          segmentos locais. Respeitamos as licenças e os créditos dos autores originais.
        </p>
        <h2 className="pt-4 text-2xl font-bold text-foreground">Nossos compromissos</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>Não anunciar funcionalidades que ainda não existem.</li>
          <li>Separar os dados de cada empresa no servidor, não apenas na tela.</li>
          <li>Tratar dados pessoais conforme a LGPD.</li>
          <li>Deixar claro quando um recurso depende de serviço externo.</li>
        </ul>
      </div>
      <Link href="/portal/signup" className="mt-10 inline-block rounded-md bg-yellow-400 px-6 py-3 font-semibold text-black hover:bg-yellow-300">Criar conta</Link>
    </div>
  );
}
