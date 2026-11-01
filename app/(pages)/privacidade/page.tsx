import { generateSEO } from '@/lib/utils/seo';
import { LegalPage, operatorLabel } from '@/components/kumo/LegalPage';
import { DPO_EMAIL } from '@/config/brand';

export const metadata = generateSEO({ title: 'Privacidade e LGPD', description: 'Como o Kumo One trata dados pessoais.', path: '/privacidade' });

export default function PrivacidadePage() {
  return (
    <LegalPage title="Política de Privacidade" updated="1º de novembro de 2026">
      <p>Esta política explica como {operatorLabel()} trata dados pessoais no Kumo One, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).</p>
      <h2>1. Papéis</h2>
      <ul>
        <li>Para os dados de cadastro e cobrança da sua conta, o Kumo One é controlador.</li>
        <li>Para os dados que sua empresa insere (clientes, contatos, agendamentos, documentos), sua empresa é a controladora e o Kumo One atua como operador, tratando-os apenas para prestar o serviço.</li>
      </ul>
      <h2>2. Dados tratados</h2>
      <ul>
        <li>Cadastro: nome, e-mail, empresa, senha (armazenada com hash).</li>
        <li>Uso: registros de acesso, endereço IP e ações relevantes (auditoria e segurança).</li>
        <li>Cobrança: dados processados pelo provedor de pagamentos; o Kumo One não armazena números de cartão.</li>
      </ul>
      <h2>3. Finalidades e bases legais</h2>
      <p>Execução do contrato (prestação do serviço), cumprimento de obrigação legal, legítimo interesse (segurança e prevenção a fraudes) e consentimento quando exigido (comunicações de marketing).</p>
      <h2>4. Compartilhamento</h2>
      <p>Compartilhamos dados somente com fornecedores necessários à operação, como hospedagem, banco de dados, envio de e-mail, pagamentos e, quando você usa recursos de IA, o provedor de IA configurado. Alguns fornecedores podem processar dados fora do Brasil, com as salvaguardas previstas na LGPD.</p>
      <h2>5. Segurança</h2>
      <p>Isolamento de dados entre empresas, conexões criptografadas, senhas com hash, chaves de integração criptografadas e controle de acesso por papéis.</p>
      <h2>6. Retenção</h2>
      <p>Mantemos os dados enquanto a conta estiver ativa e pelo prazo necessário para cumprir obrigações legais. Contas não confirmadas são removidas automaticamente após 7 dias.</p>
      <h2>7. Seus direitos</h2>
      <p>Você pode solicitar confirmação, acesso, correção, portabilidade, anonimização ou exclusão de dados, além de informações sobre compartilhamento{DPO_EMAIL ? <> pelo e-mail <a className="underline" href={`mailto:${DPO_EMAIL}`}>{DPO_EMAIL}</a></> : ' pelo canal de suporte do painel'}.</p>
      <h2>8. Cookies</h2>
      <p>Usamos cookies essenciais para autenticação e preferências (como o tema claro ou escuro). Ferramentas de análise só são ativadas quando configuradas pelo operador.</p>
    </LegalPage>
  );
}
