import { generateSEO } from '@/lib/utils/seo';
import { LegalPage, operatorLabel } from '@/components/kumo/LegalPage';
import { SUPPORT_EMAIL } from '@/config/brand';

export const metadata = generateSEO({ title: 'Termos de uso', description: 'Termos de uso da plataforma Kumo One.', path: '/termos' });

export default function TermosPage() {
  return (
    <LegalPage title="Termos de uso" updated="1º de novembro de 2026">
      <p>Estes termos regem o uso da plataforma Kumo One, oferecida por {operatorLabel()} (&quot;Kumo One&quot;). Ao criar uma conta você concorda com eles.</p>
      <h2>1. O serviço</h2>
      <p>O Kumo One é um software on-line de gestão empresarial com CRM, criação de sites, agendamentos, projetos, documentos, automações e recursos de inteligência artificial. Os módulos disponíveis dependem do plano contratado.</p>
      <h2>2. Conta e acesso</h2>
      <ul>
        <li>Você é responsável pelas informações cadastradas e pela guarda das credenciais de acesso.</li>
        <li>O titular da conta da empresa define quem acessa os dados e com quais permissões.</li>
        <li>É proibido usar a plataforma para atividades ilícitas, envio de spam ou violação de direitos de terceiros.</li>
      </ul>
      <h2>3. Planos, pagamento e cancelamento</h2>
      <ul>
        <li>As assinaturas são mensais, cobradas antecipadamente, em reais.</li>
        <li>Recursos medidos (como uso de IA acima da franquia) podem gerar cobrança adicional, exibida no painel antes de ser cobrada.</li>
        <li>Você pode cancelar a qualquer momento; o acesso permanece até o fim do período já pago.</li>
      </ul>
      <h2>4. Seus dados</h2>
      <p>Os dados que você cadastra pertencem à sua empresa. O Kumo One os trata conforme a <a className="underline" href="/privacidade">Política de Privacidade</a> e a Lei nº 13.709/2018 (LGPD). Você pode exportar seus dados de CRM a qualquer momento.</p>
      <h2>5. Assinatura eletrônica</h2>
      <p>A assinatura de documentos oferecida é uma assinatura eletrônica simples, com registro de data, hora e endereço IP. Ela não constitui assinatura qualificada com certificado ICP-Brasil.</p>
      <h2>6. Inteligência artificial</h2>
      <p>Respostas geradas por IA podem conter erros. Revise o conteúdo antes de enviá-lo a terceiros ou tomar decisões com base nele.</p>
      <h2>7. Disponibilidade e responsabilidade</h2>
      <p>Empregamos esforços razoáveis para manter o serviço disponível e seguro, mas não garantimos funcionamento ininterrupto. Nossa responsabilidade limita-se ao valor pago nos 12 meses anteriores ao evento.</p>
      <h2>8. Software de terceiros</h2>
      <p>O Kumo One é construído sobre software de código aberto, incluindo o projeto SimplerDevelopment (licença Apache-2.0). Os avisos de licença estão disponíveis no repositório do produto.</p>
      <h2>9. Contato e foro</h2>
      <p>Dúvidas: {SUPPORT_EMAIL || 'pelo canal de suporte indicado no painel'}. Fica eleito o foro do domicílio do consumidor, quando aplicável, ou o da sede do operador.</p>
    </LegalPage>
  );
}
