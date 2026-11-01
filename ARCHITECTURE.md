# Arquitetura do Kumo One

## Visão geral

Uma única aplicação **Next.js 16 (App Router) + React 19 + TypeScript**, com
**Drizzle ORM sobre PostgreSQL (pgvector)** e **NextAuth v5**. Herdada do
SimplerDevelopment; o Kumo One adapta identidade, idioma, moeda, planos, site
institucional e o criador de sites, sem reescrever os módulos.

```
Navegador ──► Next.js (Vercel)
               ├─ /                      site institucional Kumo (pt-BR)
               ├─ /portal/*              painel da empresa (tenant)
               ├─ /admin/*               administração da plataforma
               ├─ /sites/<host>/*        sites publicados dos clientes
               ├─ /book/<slug>, /s/<slug>, /proposal, /contract   páginas públicas
               ├─ /api/portal/*          API do painel (sessão + papel + módulo)
               ├─ /api/public/*          API pública (agendamento, formulários)
               ├─ /api/mcp               servidor MCP (≈480 ferramentas, escopo por chave)
               └─ /api/cron/*            tarefas agendadas (CRON_SECRET)
                     │
                     ├─► PostgreSQL + pgvector     (dados de todas as empresas)
                     ├─► S3 / R2 / MinIO           (arquivos e mídia)
                     ├─► Resend ou SMTP (Mailpit)  (e-mails transacionais)
                     ├─► Stripe                    (cobrança, opcional)
                     └─► Provedor de IA            (Anthropic / OpenAI / compatível)

Serviços separados (opcionais, não serverless):
  packages/realtime-server   Yjs/WebSocket para edição colaborativa
  simplerdevelopment-agents  serviço de agentes (Mastra)
```

## Multiempresa (tenancy)

- `clients` = empresa. `client_members` liga usuários a empresas com papel
  `owner | admin | member | viewer`.
- `users.role` separa equipe da plataforma (`admin`, `editor` → `/admin`) de
  usuários das empresas (`client` → `/portal`).
- Toda rota do painel resolve a empresa ativa no servidor
  (`lib/portal-auth.ts → authorizePortal({ action, requireService })`) e filtra
  as consultas por `clientId`. O cliente nunca envia o `clientId` de quem ele é.
- Módulos contratados controlam acesso (`requireService`) via
  `lib/billing/entitlements.ts`.
- Isolamento é coberto pela suíte `@tenancy` (59 arquivos de integração) mais
  os testes do Kumo em `tests/integration/api/kumo-*.test.ts`.

## Módulos reutilizados do projeto-base

| Área | Onde |
|---|---|
| CRM (contatos, empresas, oportunidades, funis, Kanban, atividades, tarefas, campos personalizados, importação/exportação CSV, pontuação de leads) | `app/portal/crm`, `app/api/portal/crm`, `components/portal/Crm*` |
| Sites/CMS e editor visual em blocos | `app/portal/websites`, `components/portal/visual-editor`, `components/blocks`, renderizador `app/sites/[domain]` |
| Agendamentos (páginas, disponibilidade, equipe, grupos, conflitos, cancelamento, check-in, orçamentos) | `app/portal/tools/booking`, `app/book`, `app/api/public/booking` |
| Projetos, Kanban, tarefas, comentários, tempo | `app/portal/projects`, `components/portal/card-detail` |
| Contratos, propostas, aprovações, assinatura eletrônica simples | `app/portal/crm/contracts`, `app/proposal`, `app/contract`, `lib/esign` |
| Automações e fluxos | `app/portal/automations`, `lib/automation` |
| IA (Cérebro da Empresa, assistente, BYOK) | `app/portal/brain`, `lib/ai`, `lib/brain` |
| MCP | `app/api/mcp`, `lib/mcp` |
| Cobrança e planos | `lib/billing`, `app/portal/settings/billing`, `app/api/portal/billing` |

## O que o Kumo One acrescentou ou mudou

| Mudança | Arquivos |
|---|---|
| Identidade central (nome, locale pt-BR, BRL, fuso, domínio raiz dos sites, domínio de e-mail) | `config/brand.ts`, `config/site.ts`, `config/seo.ts` |
| Logotipo, favicon, imagem OG e paleta preto/branco/amarelo (claro e escuro) | `public/brand`, `public/favicon.ico`, `app/globals.css`, `components/kumo/KumoLogo.tsx` |
| Site institucional: início, funcionalidades, preços (lidos do banco), sobre, termos, privacidade | `app/page.tsx`, `app/(pages)/{funcionalidades,precos,sobre,termos,privacidade}`, `components/kumo`, `lib/kumo/plans.ts` |
| Planos Essencial/Profissional/Empresarial em BRL, módulos em pt-BR, IDs Stripe do projeto-base removidos | `lib/billing/domain-catalog.ts`, `scripts/kumo-sync-catalog.ts` |
| Contratação sem provedor de pagamento recusa em vez de liberar grátis | `app/api/portal/billing/modules/checkout/route.ts` |
| 7 modelos de site por segmento + publicação do site inteiro + contatos do rodapé | `lib/kumo/site-templates.ts`, `lib/kumo/apply-site-template.ts`, `app/api/portal/cms/websites/[siteId]/publish`, `app/api/portal/websites/[siteId]/contact`, `app/portal/websites/new` |
| Colunas de contato em `site_branding`; moedas padrão BRL | `drizzle/9100_*`, `drizzle/9101_*` (migrations manuais idempotentes) |
| Tradução pt-BR de telas públicas e principais telas do painel | `scripts/kumo-i18n.py`, `scripts/kumo-i18n/*.json` |
| Trilha de auditoria para publicação/criação de site | `lib/kumo/audit.ts` (reusa `brain_audit_logs`) |
| Remoção do GSAP (licença restritiva) | `components/three/tween.ts` |

## Persistência

- Esquema em `lib/db/schema/*.ts` (≈290 tabelas). Migrations geradas pelo
  Drizzle em `drizzle/*.sql` e migrations manuais idempotentes em
  `drizzle/9xxx_*_manual.sql` (aplicadas por `scripts/apply-local-manual-migrations.ts`).
- Integridade referencial com `references(... onDelete)`; índices por
  `(client_id, …)` nas tabelas multiempresa.
- Valores monetários em centavos (inteiros).

## Internacionalização

Não há biblioteca de i18n no projeto-base. O Kumo traduziu as strings
diretamente (pt-BR é o único idioma). O processo é repetível: os mapas em
`scripts/kumo-i18n/*.json` podem ser reaplicados depois de atualizar o código
do projeto-base. Telas administrativas e módulos secundários ainda têm textos
em inglês — ver `DELIVERY_REPORT.md`.
