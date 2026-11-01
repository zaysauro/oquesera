// Public-site copy shared by the landing page and /funcionalidades. Every item
// here maps to a module that exists in the portal today; anything that needs an
// external account says so in `requires`.

export interface FeatureItem {
  title: string;
  text: string;
  portalPath: string;
  requires?: string;
}

export const FEATURES: FeatureItem[] = [
  {
    title: 'CRM e funil de vendas',
    text: 'Contatos, empresas, oportunidades em Kanban, atividades, tarefas, observações, campos personalizados, importação e exportação em CSV.',
    portalPath: '/portal/crm',
  },
  {
    title: 'Criador de sites',
    text: 'Editor visual em blocos, modelos por segmento, páginas, cores e informações de contato. Publicação com SEO básico e domínio próprio.',
    portalPath: '/portal/websites',
    requires: 'Domínio próprio exige apontar o DNS para a plataforma.',
  },
  {
    title: 'Agendamento online',
    text: 'Serviços, disponibilidade, página pública de agendamento, confirmação, cancelamento, reagendamento e bloqueio de conflitos de horário.',
    portalPath: '/portal/tools/booking',
  },
  {
    title: 'Projetos e tarefas',
    text: 'Projetos com quadro Kanban, responsáveis, prazos, comentários, checklists, registro de atividades e acompanhamento de progresso.',
    portalPath: '/portal/projects',
  },
  {
    title: 'Documentos, contratos e propostas',
    text: 'Contratos e propostas com aprovação e assinatura eletrônica simples, histórico de eventos e portal para o seu cliente.',
    portalPath: '/portal/crm/contracts',
    requires: 'Assinatura eletrônica simples — não é assinatura qualificada com certificado ICP-Brasil.',
  },
  {
    title: 'Automações',
    text: 'Fluxos disparados por eventos ou horários: criar tarefas, atualizar registros do CRM, enviar e-mails e mais, com histórico de execuções.',
    portalPath: '/portal/automations',
  },
  {
    title: 'Assistente de IA',
    text: 'Base de conhecimento da empresa, perguntas sobre seus dados, geração de textos, resumos e propostas. Funciona com o provedor de IA que você configurar.',
    portalPath: '/portal/brain',
    requires: 'Requer uma chave de API de um provedor de IA (Anthropic, OpenAI ou compatível).',
  },
  {
    title: 'E-mail marketing',
    text: 'Listas, segmentos, campanhas, modelos e métricas de abertura e cliques.',
    portalPath: '/portal/email',
    requires: 'Requer um serviço de envio de e-mail configurado (Resend).',
  },
  {
    title: 'Cobranças e assinaturas',
    text: 'Planos, assinaturas, faturas e histórico de pagamentos em reais. Pagamentos on-line via Stripe.',
    portalPath: '/portal/settings/billing',
    requires: 'Pagamentos on-line exigem uma conta Stripe. Pix e boleto não estão integrados nesta versão.',
  },
];

export const SEGMENTS = [
  { title: 'Restaurantes', text: 'Cardápio no site, reservas de mesa e contato direto com clientes.' },
  { title: 'Barbearias', text: 'Agenda on-line por profissional e serviço, sem conflitos de horário.' },
  { title: 'Salões de beleza', text: 'Serviços, horários, confirmações e histórico de cada cliente.' },
  { title: 'Escritórios', text: 'Propostas, contratos, projetos e portal do cliente com documentos.' },
  { title: 'Imobiliárias', text: 'Leads de imóveis no funil, visitas agendadas e site com os destaques.' },
  { title: 'Prestadores de serviços', text: 'Orçamentos, agenda, tarefas e acompanhamento de cada trabalho.' },
  { title: 'Pequenos comércios', text: 'Site, catálogo de produtos e relacionamento com clientes.' },
];

export const FAQ = [
  {
    q: 'O que é o Kumo One?',
    a: 'Uma plataforma on-line que reúne CRM, criador de sites, agendamentos, projetos, documentos, automações e assistente de IA para pequenas empresas, em português e com valores em reais.',
  },
  {
    q: 'Preciso instalar alguma coisa?',
    a: 'Não. O Kumo One funciona no navegador, no computador ou no celular.',
  },
  {
    q: 'Meus dados ficam separados dos de outras empresas?',
    a: 'Sim. Cada empresa só acessa os próprios dados. O isolamento é aplicado no servidor e coberto por testes automatizados, não apenas escondido na tela.',
  },
  {
    q: 'A assinatura eletrônica tem validade jurídica?',
    a: 'O Kumo One oferece assinatura eletrônica simples, com registro de data, hora e IP. Ela não é uma assinatura qualificada com certificado digital ICP-Brasil. Para documentos que exigem esse nível, use um serviço certificado.',
  },
  {
    q: 'Como funciona a inteligência artificial?',
    a: 'Os recursos de IA usam o provedor configurado na plataforma (Anthropic, OpenAI ou um serviço compatível). As chaves ficam somente no servidor. Sem provedor configurado, os recursos de IA ficam desativados.',
  },
  {
    q: 'Quais formas de pagamento são aceitas?',
    a: 'A cobrança on-line usa o Stripe (cartão). Pix e boleto ainda não estão integrados. Planos também podem ser ativados manualmente pela equipe Kumo One.',
  },
  {
    q: 'Posso usar meu próprio domínio no site?',
    a: 'Sim. Depois de criar o site, você adiciona seu domínio e aponta o DNS conforme as instruções exibidas no painel.',
  },
  {
    q: 'Posso cancelar quando quiser?',
    a: 'Sim. A assinatura é mensal e sem fidelidade.',
  },
];
