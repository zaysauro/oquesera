/**
 * Kumo One starter-site templates, one per target segment.
 *
 * A template is plain data: branding (colors/fonts), a page list made of the
 * platform's universal blocks, and a navigation menu. Applying one writes
 * ordinary rows (site_branding, posts, site_navigation, surveys) — after that
 * the site is edited with the regular visual editor like any other site, so
 * nothing here is special at render time.
 *
 * Copy is generic placeholder text in pt-BR, clearly meant to be replaced;
 * no invented reviews, ratings, prices or client names.
 */

import type { Block, BlockType } from '@/types/blocks';
import { createDefaultBlock } from '@/lib/blocks/defaults';

export type SiteTemplateKey =
  | 'restaurante'
  | 'barbearia'
  | 'salao'
  | 'escritorio'
  | 'imobiliaria'
  | 'servicos'
  | 'comercio';

export interface SiteTemplateInfo {
  company: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  city?: string;
  /** Public booking page slug, when the business already has one. */
  bookingSlug?: string;
}

export interface TemplatePage {
  slug: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  blocks: Block[];
}

export interface BuiltTemplate {
  branding: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    headingFont: string;
    bodyFont: string;
    navTemplate: string;
  };
  pages: TemplatePage[];
  nav: { label: string; href: string; isButton?: boolean }[];
  contactForm: { title: string; description: string; messageLabel: string };
}

export interface SiteTemplateMeta {
  key: SiteTemplateKey;
  name: string;
  description: string;
  colors: [string, string, string];
}

// ── Block helpers ────────────────────────────────────────────────────────────

let seq = 0;
const uid = (p: string) => `${p}-${Date.now().toString(36)}-${(seq++).toString(36)}`;

function block<T extends BlockType>(type: T, order: number, props: Record<string, unknown>): Block {
  return { ...createDefaultBlock(type, { id: uid(type), order }), ...props } as Block;
}

function withIds<T extends object>(items: T[], prefix: string): (T & { id: string })[] {
  return items.map((i) => ({ ...i, id: uid(prefix) }));
}

function contactLines(info: SiteTemplateInfo): string {
  const lines = [
    info.address && `<p><strong>Endereço:</strong> ${esc(info.address)}${info.city ? ` — ${esc(info.city)}` : ''}</p>`,
    info.phone && `<p><strong>Telefone:</strong> ${esc(info.phone)}</p>`,
    info.whatsapp && `<p><strong>WhatsApp:</strong> <a href="https://wa.me/${digits(info.whatsapp)}">${esc(info.whatsapp)}</a></p>`,
    info.email && `<p><strong>E-mail:</strong> <a href="mailto:${esc(info.email)}">${esc(info.email)}</a></p>`,
  ].filter(Boolean);
  return lines.length ? lines.join('') : '<p>Adicione aqui telefone, WhatsApp, e-mail e endereço da empresa.</p>';
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
const digits = (s: string) => {
  const d = s.replace(/\D/g, '');
  return d.length <= 11 ? `55${d}` : d;
};

// ── Shared page builders ─────────────────────────────────────────────────────

interface Copy {
  heroTitle: string;
  heroSubtitle: string;
  heroText: string;
  primaryCta: string;
  servicesPageTitle: string;
  servicesPageSlug: string;
  servicesIntro: string;
  services: { title: string; description: string; icon: string }[];
  aboutTitle: string;
  aboutText: string;
  highlights: { title: string; description: string; icon: string }[];
  faq: { title: string; content: string }[];
  ctaTitle: string;
  ctaText: string;
  contactTitle: string;
  messageLabel: string;
  seoKeyword: string;
}

function primaryHref(info: SiteTemplateInfo): string {
  return info.bookingSlug ? `/book/${info.bookingSlug}` : '/contato';
}

function buildPages(info: SiteTemplateInfo, c: Copy, contactSurveySlug: string): TemplatePage[] {
  const company = info.company;
  const where = info.city ? ` em ${info.city}` : '';
  const home: Block[] = [
    block('hero', 0, {
      title: c.heroTitle.replace('{empresa}', company),
      subtitle: c.heroSubtitle,
      description: c.heroText,
      ctaText: c.primaryCta,
      ctaLink: primaryHref(info),
      secondaryCtaText: c.servicesPageTitle,
      secondaryCtaLink: `/${c.servicesPageSlug}`,
    }),
    block('services-grid', 1, {
      overline: c.servicesPageTitle,
      title: `O que a ${company} oferece`,
      description: c.servicesIntro,
      columns: 3,
      services: withIds(c.services.slice(0, 3).map((s) => ({ ...s, link: `/${c.servicesPageSlug}`, linkText: 'Saiba mais' })), 'svc'),
    }),
    block('card-grid', 2, {
      title: 'Por que escolher a gente',
      columns: 3,
      cards: withIds(c.highlights, 'card'),
    }),
    block('cta', 3, {
      title: c.ctaTitle,
      description: c.ctaText,
      primaryButtonText: c.primaryCta,
      primaryButtonUrl: primaryHref(info),
      backgroundStyle: 'solid',
    }),
  ];

  const services: Block[] = [
    block('heading', 0, { content: c.servicesPageTitle, level: 1, alignment: 'center' }),
    block('text', 1, { content: `<p>${c.servicesIntro}</p>`, alignment: 'center', size: 'lg' }),
    block('services-grid', 2, {
      columns: 3,
      services: withIds(c.services.map((s) => ({ ...s })), 'svc'),
    }),
    block('accordion', 3, { title: 'Perguntas frequentes', items: withIds(c.faq, 'faq') }),
    block('cta', 4, {
      title: c.ctaTitle,
      description: c.ctaText,
      primaryButtonText: c.primaryCta,
      primaryButtonUrl: primaryHref(info),
      backgroundStyle: 'solid',
    }),
  ];

  const about: Block[] = [
    block('heading', 0, { content: c.aboutTitle, level: 1, alignment: 'left' }),
    block('text', 1, { content: `<p>${c.aboutText.replace('{empresa}', esc(company))}</p>`, alignment: 'left', size: 'lg' }),
    block('card-grid', 2, { title: 'Nossos diferenciais', columns: 3, cards: withIds(c.highlights, 'card') }),
  ];

  const contact: Block[] = [
    block('heading', 0, { content: c.contactTitle, level: 1, alignment: 'left' }),
    block('columns', 1, {
      gap: 'lg',
      stackOnMobile: true,
      columns: [
        {
          id: uid('col'),
          width: 45,
          blocks: [
            block('heading', 0, { content: 'Onde estamos', level: 2, alignment: 'left' }),
            block('text', 1, { content: contactLines(info), alignment: 'left', size: 'base' }),
          ],
        },
        {
          id: uid('col'),
          width: 55,
          blocks: [
            block('survey', 0, {
              slug: contactSurveySlug,
              title: 'Envie uma mensagem',
              description: 'Preencha o formulário e retornaremos o quanto antes.',
              showPageTitle: false,
              showDescription: true,
              showLogo: false,
            }),
          ],
        },
      ],
    }),
  ];

  // Inner pages open with a heading block, which has no top padding of its
  // own; a spacer keeps it clear of the fixed site header.
  const padded = (blocks: Block[]): Block[] =>
    [block('spacer', 0, { height: 'lg' }), ...blocks].map((b, i) => ({ ...b, order: i }) as Block);

  return [
    {
      slug: 'home',
      title: 'Início',
      seoTitle: `${company}${where} — ${c.seoKeyword}`,
      seoDescription: `${c.heroText} ${company}${where}.`.slice(0, 300),
      blocks: home,
    },
    {
      slug: c.servicesPageSlug,
      title: c.servicesPageTitle,
      seoTitle: `${c.servicesPageTitle} — ${company}`,
      seoDescription: c.servicesIntro.slice(0, 300),
      blocks: padded(services),
    },
    {
      slug: 'sobre',
      title: 'Sobre',
      seoTitle: `Sobre a ${company}`,
      seoDescription: c.aboutText.replace('{empresa}', company).slice(0, 300),
      blocks: padded(about),
    },
    {
      slug: 'contato',
      title: 'Contato',
      seoTitle: `Contato — ${company}`,
      seoDescription: `Fale com a ${company}${where}: telefone, WhatsApp, e-mail e formulário de contato.`,
      blocks: padded(contact),
    },
  ];
}

// ── Templates ────────────────────────────────────────────────────────────────

interface TemplateDef extends SiteTemplateMeta {
  branding: BuiltTemplate['branding'];
  copy: Copy;
}

const FAQ_GENERIC = (extra: { title: string; content: string }[]) => [
  ...extra,
  { title: 'Quais são as formas de pagamento?', content: 'Edite esta resposta com as formas de pagamento aceitas.' },
  { title: 'Como entro em contato?', content: 'Use o formulário da página de contato, o telefone ou o WhatsApp.' },
];

const TEMPLATES: TemplateDef[] = [
  {
    key: 'restaurante',
    name: 'Restaurante',
    description: 'Cardápio, reservas e localização. Ideal para restaurantes, bares e cafés.',
    colors: ['#7f1d1d', '#1c1917', '#f59e0b'],
    branding: { primaryColor: '#7f1d1d', secondaryColor: '#1c1917', accentColor: '#f59e0b', backgroundColor: '#fffbf5', textColor: '#1c1917', headingFont: 'Playfair Display', bodyFont: 'Inter', navTemplate: 'classic' },
    copy: {
      heroTitle: '{empresa}',
      heroSubtitle: 'Comida feita com cuidado',
      heroText: 'Pratos preparados na hora, ambiente acolhedor e atendimento atencioso.',
      primaryCta: 'Reservar mesa',
      servicesPageTitle: 'Cardápio',
      servicesPageSlug: 'cardapio',
      servicesIntro: 'Conheça nossos pratos. Atualize esta lista com o seu cardápio e os preços praticados.',
      services: [
        { title: 'Entradas', description: 'Descreva as entradas e porções da casa.', icon: 'restaurant' },
        { title: 'Pratos principais', description: 'Liste os pratos principais com uma breve descrição.', icon: 'dinner_dining' },
        { title: 'Sobremesas', description: 'Apresente as sobremesas do dia.', icon: 'icecream' },
        { title: 'Bebidas', description: 'Sucos, refrigerantes, cafés e drinks.', icon: 'local_bar' },
        { title: 'Pratos do dia', description: 'Informe as opções especiais de cada dia da semana.', icon: 'today' },
        { title: 'Delivery e retirada', description: 'Explique como pedir para entrega ou retirada no local.', icon: 'delivery_dining' },
      ],
      aboutTitle: 'Nossa história',
      aboutText: 'Conte aqui a história da {empresa}: como começou, quem está na cozinha e o que torna a casa especial.',
      highlights: [
        { title: 'Ingredientes frescos', description: 'Descreva a origem dos ingredientes.', icon: 'eco' },
        { title: 'Ambiente acolhedor', description: 'Fale sobre o espaço e a capacidade.', icon: 'chair' },
        { title: 'Horário de funcionamento', description: 'Informe os dias e horários de atendimento.', icon: 'schedule' },
      ],
      faq: FAQ_GENERIC([{ title: 'Preciso reservar?', content: 'Edite esta resposta explicando a política de reservas.' }]),
      ctaTitle: 'Venha nos visitar',
      ctaText: 'Reserve sua mesa ou fale com a gente pelo formulário de contato.',
      contactTitle: 'Reservas e contato',
      messageLabel: 'Data, horário e número de pessoas',
      seoKeyword: 'Restaurante',
    },
  },
  {
    key: 'barbearia',
    name: 'Barbearia',
    description: 'Serviços, profissionais e agendamento de horários.',
    colors: ['#111111', '#3f3f46', '#d4a017'],
    branding: { primaryColor: '#111111', secondaryColor: '#3f3f46', accentColor: '#d4a017', backgroundColor: '#ffffff', textColor: '#111111', headingFont: 'Oswald', bodyFont: 'Inter', navTemplate: 'modern' },
    copy: {
      heroTitle: '{empresa}',
      heroSubtitle: 'Corte, barba e cuidado',
      heroText: 'Atendimento com hora marcada, profissionais experientes e ambiente confortável.',
      primaryCta: 'Agendar horário',
      servicesPageTitle: 'Serviços',
      servicesPageSlug: 'servicos',
      servicesIntro: 'Escolha o serviço e agende seu horário. Ajuste a lista e os preços conforme a sua barbearia.',
      services: [
        { title: 'Corte de cabelo', description: 'Descreva o estilo e a duração do corte.', icon: 'content_cut' },
        { title: 'Barba', description: 'Modelagem, toalha quente e acabamento.', icon: 'face' },
        { title: 'Corte + barba', description: 'O combo completo.', icon: 'star' },
        { title: 'Sobrancelha', description: 'Acabamento com navalha ou pinça.', icon: 'visibility' },
        { title: 'Pigmentação', description: 'Descreva o serviço.', icon: 'brush' },
        { title: 'Infantil', description: 'Corte para crianças.', icon: 'child_care' },
      ],
      aboutTitle: 'Sobre a barbearia',
      aboutText: 'Apresente a {empresa}: a equipe, o estilo da casa e o que os clientes encontram aqui.',
      highlights: [
        { title: 'Hora marcada', description: 'Sem fila: agende pelo site.', icon: 'event_available' },
        { title: 'Profissionais', description: 'Apresente a equipe e as especialidades.', icon: 'groups' },
        { title: 'Produtos', description: 'Informe as marcas e produtos utilizados.', icon: 'inventory_2' },
      ],
      faq: FAQ_GENERIC([{ title: 'Preciso agendar?', content: 'Edite esta resposta com a política de agendamento e de atrasos.' }]),
      ctaTitle: 'Garanta seu horário',
      ctaText: 'Escolha o serviço e o melhor horário para você.',
      contactTitle: 'Contato',
      messageLabel: 'Serviço desejado e melhor dia/horário',
      seoKeyword: 'Barbearia',
    },
  },
  {
    key: 'salao',
    name: 'Salão de beleza',
    description: 'Serviços de beleza, equipe e agendamento.',
    colors: ['#9d174d', '#4a044e', '#f9a8d4'],
    branding: { primaryColor: '#9d174d', secondaryColor: '#4a044e', accentColor: '#f9a8d4', backgroundColor: '#fffafc', textColor: '#1f1022', headingFont: 'Playfair Display', bodyFont: 'Lato', navTemplate: 'centered' },
    copy: {
      heroTitle: '{empresa}',
      heroSubtitle: 'Beleza e bem-estar',
      heroText: 'Cabelo, unhas, estética e muito cuidado em um só lugar.',
      primaryCta: 'Agendar atendimento',
      servicesPageTitle: 'Serviços',
      servicesPageSlug: 'servicos',
      servicesIntro: 'Conheça nossos serviços. Ajuste a lista, a duração e os valores conforme o seu salão.',
      services: [
        { title: 'Cabelo', description: 'Corte, escova, coloração e tratamentos.', icon: 'content_cut' },
        { title: 'Manicure e pedicure', description: 'Esmaltação, alongamento e cuidados.', icon: 'back_hand' },
        { title: 'Estética', description: 'Limpeza de pele e tratamentos faciais.', icon: 'spa' },
        { title: 'Maquiagem', description: 'Para eventos e ocasiões especiais.', icon: 'brush' },
        { title: 'Sobrancelhas', description: 'Design e henna.', icon: 'visibility' },
        { title: 'Noivas', description: 'Pacotes para o grande dia.', icon: 'favorite' },
      ],
      aboutTitle: 'Sobre o salão',
      aboutText: 'Conte a história da {empresa}, apresente a equipe e o que torna o atendimento especial.',
      highlights: [
        { title: 'Equipe especializada', description: 'Apresente as profissionais e especialidades.', icon: 'groups' },
        { title: 'Agendamento fácil', description: 'Marque seu horário sem precisar ligar.', icon: 'event_available' },
        { title: 'Ambiente', description: 'Descreva o espaço e o conforto oferecido.', icon: 'weekend' },
      ],
      faq: FAQ_GENERIC([{ title: 'Como funciona o cancelamento?', content: 'Edite esta resposta com a política de cancelamento.' }]),
      ctaTitle: 'Reserve seu momento',
      ctaText: 'Escolha o serviço e o melhor horário.',
      contactTitle: 'Contato',
      messageLabel: 'Serviço desejado e melhor dia/horário',
      seoKeyword: 'Salão de beleza',
    },
  },
  {
    key: 'escritorio',
    name: 'Escritório',
    description: 'Contabilidade, advocacia, consultoria e outros serviços profissionais.',
    colors: ['#1e3a5f', '#0f172a', '#c9a227'],
    branding: { primaryColor: '#1e3a5f', secondaryColor: '#0f172a', accentColor: '#c9a227', backgroundColor: '#ffffff', textColor: '#0f172a', headingFont: 'Merriweather', bodyFont: 'Source Sans 3', navTemplate: 'classic' },
    copy: {
      heroTitle: '{empresa}',
      heroSubtitle: 'Atendimento profissional e próximo',
      heroText: 'Soluções sob medida para pessoas e empresas, com transparência e prazos claros.',
      primaryCta: 'Solicitar contato',
      servicesPageTitle: 'Áreas de atuação',
      servicesPageSlug: 'areas-de-atuacao',
      servicesIntro: 'Descreva as áreas em que o escritório atua. Edite os itens abaixo.',
      services: [
        { title: 'Consultoria', description: 'Descreva o serviço de consultoria.', icon: 'support_agent' },
        { title: 'Assessoria mensal', description: 'Acompanhamento contínuo para empresas.', icon: 'event_repeat' },
        { title: 'Projetos específicos', description: 'Demandas pontuais com escopo definido.', icon: 'assignment' },
        { title: 'Pessoa física', description: 'Atendimento a pessoas físicas.', icon: 'person' },
        { title: 'Pessoa jurídica', description: 'Atendimento a empresas de todos os portes.', icon: 'business' },
        { title: 'Treinamentos', description: 'Capacitação para equipes.', icon: 'school' },
      ],
      aboutTitle: 'O escritório',
      aboutText: 'Apresente a {empresa}: formação da equipe, registros profissionais e a forma de trabalhar.',
      highlights: [
        { title: 'Equipe qualificada', description: 'Informe formação e registros profissionais.', icon: 'workspace_premium' },
        { title: 'Atendimento on-line', description: 'Reuniões presenciais ou por vídeo.', icon: 'video_call' },
        { title: 'Sigilo', description: 'Tratamento confidencial das informações.', icon: 'lock' },
      ],
      faq: FAQ_GENERIC([{ title: 'Como é feito o orçamento?', content: 'Edite esta resposta explicando como o escritório elabora propostas.' }]),
      ctaTitle: 'Vamos conversar?',
      ctaText: 'Conte sua necessidade e retornamos com uma proposta.',
      contactTitle: 'Fale com o escritório',
      messageLabel: 'Como podemos ajudar?',
      seoKeyword: 'Escritório',
    },
  },
  {
    key: 'imobiliaria',
    name: 'Imobiliária',
    description: 'Imóveis em destaque, captação e atendimento a interessados.',
    colors: ['#065f46', '#064e3b', '#fbbf24'],
    branding: { primaryColor: '#065f46', secondaryColor: '#064e3b', accentColor: '#fbbf24', backgroundColor: '#ffffff', textColor: '#0f172a', headingFont: 'Montserrat', bodyFont: 'Inter', navTemplate: 'modern' },
    copy: {
      heroTitle: '{empresa}',
      heroSubtitle: 'Compra, venda e locação',
      heroText: 'Encontre o imóvel certo com atendimento personalizado do início ao fim.',
      primaryCta: 'Falar com um corretor',
      servicesPageTitle: 'Imóveis',
      servicesPageSlug: 'imoveis',
      servicesIntro: 'Destaque aqui os imóveis disponíveis. Substitua os exemplos por anúncios reais com fotos.',
      services: [
        { title: 'Apartamentos à venda', description: 'Descreva bairro, metragem e diferenciais.', icon: 'apartment' },
        { title: 'Casas à venda', description: 'Descreva bairro, metragem e diferenciais.', icon: 'house' },
        { title: 'Imóveis para alugar', description: 'Informe as condições de locação.', icon: 'key' },
        { title: 'Imóveis comerciais', description: 'Salas, lojas e galpões.', icon: 'storefront' },
        { title: 'Lançamentos', description: 'Empreendimentos na planta.', icon: 'construction' },
        { title: 'Anuncie seu imóvel', description: 'Quer vender ou alugar? Fale com a gente.', icon: 'campaign' },
      ],
      aboutTitle: 'Sobre a imobiliária',
      aboutText: 'Apresente a {empresa}, o registro no CRECI, a região de atuação e a equipe de corretores.',
      highlights: [
        { title: 'Corretores credenciados', description: 'Informe o número do CRECI.', icon: 'badge' },
        { title: 'Visitas agendadas', description: 'Marque visitas no melhor horário para você.', icon: 'event' },
        { title: 'Documentação', description: 'Apoio em toda a documentação do negócio.', icon: 'description' },
      ],
      faq: FAQ_GENERIC([{ title: 'Como agendar uma visita?', content: 'Envie o formulário de contato informando o imóvel de interesse.' }]),
      ctaTitle: 'Quer vender ou alugar seu imóvel?',
      ctaText: 'Fale com a nossa equipe e receba uma avaliação.',
      contactTitle: 'Fale com um corretor',
      messageLabel: 'Imóvel de interesse ou o que você procura',
      seoKeyword: 'Imobiliária',
    },
  },
  {
    key: 'servicos',
    name: 'Prestador de serviços',
    description: 'Reformas, manutenção, limpeza, aulas e outros serviços.',
    colors: ['#1d4ed8', '#1e293b', '#facc15'],
    branding: { primaryColor: '#1d4ed8', secondaryColor: '#1e293b', accentColor: '#facc15', backgroundColor: '#ffffff', textColor: '#0f172a', headingFont: 'Poppins', bodyFont: 'Inter', navTemplate: 'classic' },
    copy: {
      heroTitle: '{empresa}',
      heroSubtitle: 'Serviço bem feito, no prazo combinado',
      heroText: 'Orçamento sem compromisso e atendimento rápido.',
      primaryCta: 'Pedir orçamento',
      servicesPageTitle: 'Serviços',
      servicesPageSlug: 'servicos',
      servicesIntro: 'Veja o que fazemos. Edite a lista com os serviços que você presta.',
      services: [
        { title: 'Serviço 1', description: 'Descreva o serviço e o que está incluído.', icon: 'handyman' },
        { title: 'Serviço 2', description: 'Descreva o serviço e o que está incluído.', icon: 'build' },
        { title: 'Serviço 3', description: 'Descreva o serviço e o que está incluído.', icon: 'cleaning_services' },
        { title: 'Atendimento emergencial', description: 'Informe se há atendimento fora do horário.', icon: 'bolt' },
        { title: 'Contratos mensais', description: 'Manutenção recorrente para empresas e condomínios.', icon: 'event_repeat' },
        { title: 'Garantia', description: 'Explique a garantia oferecida.', icon: 'verified' },
      ],
      aboutTitle: 'Quem somos',
      aboutText: 'Apresente a {empresa}: experiência, região atendida e a forma de trabalhar.',
      highlights: [
        { title: 'Orçamento rápido', description: 'Envie o pedido e receba um retorno.', icon: 'request_quote' },
        { title: 'Pontualidade', description: 'Compromisso com o horário combinado.', icon: 'schedule' },
        { title: 'Região atendida', description: 'Informe os bairros e cidades atendidos.', icon: 'map' },
      ],
      faq: FAQ_GENERIC([{ title: 'O orçamento é cobrado?', content: 'Edite esta resposta com a política de orçamentos e visitas técnicas.' }]),
      ctaTitle: 'Precisa de um orçamento?',
      ctaText: 'Descreva o serviço e retornamos o quanto antes.',
      contactTitle: 'Peça seu orçamento',
      messageLabel: 'Descreva o serviço que você precisa',
      seoKeyword: 'Serviços',
    },
  },
  {
    key: 'comercio',
    name: 'Pequeno comércio',
    description: 'Lojas, mercados, papelarias e comércios de bairro.',
    colors: ['#c2410c', '#431407', '#fde047'],
    branding: { primaryColor: '#c2410c', secondaryColor: '#431407', accentColor: '#fde047', backgroundColor: '#fffdf8', textColor: '#1c1917', headingFont: 'Nunito', bodyFont: 'Nunito', navTemplate: 'classic' },
    copy: {
      heroTitle: '{empresa}',
      heroSubtitle: 'Perto de você',
      heroText: 'Variedade, bom atendimento e preço justo.',
      primaryCta: 'Fale com a loja',
      servicesPageTitle: 'Produtos',
      servicesPageSlug: 'produtos',
      servicesIntro: 'Conheça nossas categorias de produtos. Para vender on-line, ative a loja virtual no painel.',
      services: [
        { title: 'Categoria 1', description: 'Descreva os produtos desta categoria.', icon: 'category' },
        { title: 'Categoria 2', description: 'Descreva os produtos desta categoria.', icon: 'shopping_basket' },
        { title: 'Categoria 3', description: 'Descreva os produtos desta categoria.', icon: 'inventory_2' },
        { title: 'Ofertas da semana', description: 'Divulgue as promoções vigentes.', icon: 'local_offer' },
        { title: 'Encomendas', description: 'Explique como fazer encomendas.', icon: 'shopping_cart' },
        { title: 'Entrega', description: 'Informe a região e as condições de entrega.', icon: 'local_shipping' },
      ],
      aboutTitle: 'Sobre a loja',
      aboutText: 'Conte a história da {empresa} e o que os clientes encontram aqui.',
      highlights: [
        { title: 'Horário de funcionamento', description: 'Informe os dias e horários.', icon: 'schedule' },
        { title: 'Formas de pagamento', description: 'Informe as formas aceitas.', icon: 'payments' },
        { title: 'Entrega no bairro', description: 'Explique as condições de entrega.', icon: 'local_shipping' },
      ],
      faq: FAQ_GENERIC([{ title: 'Vocês fazem entrega?', content: 'Edite esta resposta com a região e as condições de entrega.' }]),
      ctaTitle: 'Fale com a loja',
      ctaText: 'Tire dúvidas, faça encomendas ou consulte disponibilidade.',
      contactTitle: 'Contato',
      messageLabel: 'Sua mensagem ou pedido',
      seoKeyword: 'Loja',
    },
  },
];

export const SITE_TEMPLATES: SiteTemplateMeta[] = TEMPLATES.map(({ key, name, description, colors }) => ({ key, name, description, colors }));

export function isSiteTemplateKey(k: unknown): k is SiteTemplateKey {
  return typeof k === 'string' && TEMPLATES.some((t) => t.key === k);
}

export function buildSiteTemplate(key: SiteTemplateKey, info: SiteTemplateInfo, contactSurveySlug: string): BuiltTemplate {
  const t = TEMPLATES.find((x) => x.key === key);
  if (!t) throw new Error(`Unknown site template: ${key}`);
  const pages = buildPages(info, t.copy, contactSurveySlug);
  return {
    branding: t.branding,
    pages,
    nav: [
      { label: 'Início', href: '/' },
      { label: t.copy.servicesPageTitle, href: `/${t.copy.servicesPageSlug}` },
      { label: 'Sobre', href: '/sobre' },
      { label: 'Contato', href: '/contato' },
      { label: t.copy.primaryCta, href: primaryHref(info), isButton: true },
    ],
    contactForm: {
      title: `Contato — ${info.company}`,
      description: 'Preencha o formulário e retornaremos o quanto antes.',
      messageLabel: t.copy.messageLabel,
    },
  };
}
