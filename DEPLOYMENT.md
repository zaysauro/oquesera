# Implantação do Kumo One

## Situação atual

**Não há implantação publicada.** Nesta sessão não havia acesso a uma conta
Vercel (sem CLI autenticada nem token) nem a um PostgreSQL hospedado. O código,
a configuração (`vercel.json`) e este roteiro estão prontos; os passos abaixo
precisam ser executados por quem tem as contas.

## Arquitetura de hospedagem recomendada

| Peça | Serviço sugerido | Obrigatório? |
|---|---|---|
| Aplicação Next.js | Vercel (plano **Pro**, por causa dos crons de alta frequência) | Sim |
| PostgreSQL com `pgvector` | Neon, Supabase ou Railway | Sim |
| Arquivos (uploads, mídia) | Cloudflare R2 ou AWS S3 | Sim, para upload de documentos e imagens |
| E-mail transacional | Resend (domínio verificado) | Sim, para confirmação de cadastro, senha e convites |
| Pagamentos | Stripe (BRL) | Opcional; sem ele a contratação é manual |
| IA | Anthropic, OpenAI ou endpoint compatível | Opcional; sem ele os recursos de IA ficam desativados |
| Realtime (edição colaborativa) | `packages/realtime-server` em Railway/Fly (WebSocket persistente) | Opcional |
| Agentes (Mastra) | `simplerdevelopment-agents` em Railway/Fly | Opcional |

O realtime e os agentes são processos persistentes e não rodam como funções
serverless da Vercel; ficam separados e são ligados por `REALTIME_*` e
`SD_AGENTS_*`.

## Passo a passo (Vercel)

1. **Banco**: crie um Postgres e habilite as extensões:
   `CREATE EXTENSION IF NOT EXISTS vector; CREATE EXTENSION IF NOT EXISTS pg_trgm; CREATE EXTENSION IF NOT EXISTS pgcrypto;`
2. **Migrations** (de uma máquina com acesso ao banco, nunca contra outro projeto):
   ```bash
   DATABASE_URL=<url-do-banco> bun run db:migrate
   DATABASE_URL=<url-do-banco> bun scripts/apply-local-manual-migrations.ts
   DATABASE_URL=<url-do-banco> bun scripts/kumo-sync-catalog.ts
   ADMIN_EMAIL=<seu-email> ADMIN_PASSWORD=<senha-forte> DATABASE_URL=<url> bun scripts/seed-admin.ts
   ```
   A Vercel não executa migrations no deploy; aplique-as antes de cada deploy que mude o esquema.
3. **Projeto Vercel**: importe `zaysauro/oquesera`, framework Next.js, comando
   `bun run build`, Node 22. Branch de produção: a que contiver o Kumo One
   (`kumo-one` até o merge em `main`).
4. **Variáveis de ambiente** (Production e Preview), a partir de `.env.example`:
   - núcleo: `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`,
     `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SITE_URL`, `ENCRYPTION_KEY`,
     `WORKSPACE_TENANT_SECRETS_KEY`, `OAUTH_STATE_SECRET`, `PORTAL_KMS_KEY`, `CRON_SECRET`;
   - Kumo: `NEXT_PUBLIC_PLATFORM_ROOT_DOMAIN`, `EMAIL_DOMAIN`,
     `NEXT_PUBLIC_SUPPORT_EMAIL`, `NEXT_PUBLIC_OPERATOR_LEGAL_NAME`, `NEXT_PUBLIC_OPERATOR_CNPJ`, `NEXT_PUBLIC_DPO_EMAIL`;
   - e-mail: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`;
   - arquivos: `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET_NAME`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`;
   - opcionais: `STRIPE_SECRET_KEY` (+ webhooks), `ANTHROPIC_API_KEY`/`OPENAI_API_KEY`, Google, Sentry.
   Não defina `BILLING_ALLOW_UNPAID_ACTIVATION` em produção.
5. **Domínios**: aponte o domínio do produto para a Vercel e crie um registro
   curinga `*.<dominio-raiz>` para os sites dos clientes (Vercel exige o
   nameserver da Vercel para certificados curinga). Defina
   `AUTH_COOKIE_DOMAIN=.<dominio-raiz>` se quiser sessão compartilhada entre subdomínios.
6. **Stripe (modo teste primeiro)**: `STRIPE_SECRET_KEY=sk_test_…` e rode
   `bun scripts/billing/sync-stripe-products.ts` para criar produtos/preços em
   BRL e gravar os IDs na tabela `services`. Cadastre os webhooks
   (`/api/stripe/webhook` e os demais listados em `.env.example`). Só troque
   para `sk_live_` com conta ativada e autorização.
7. **Deploy** e verificação: abra `/`, `/precos`, `/portal/signup`; crie uma
   empresa, confirme o e-mail, crie um site por modelo e publique; verifique os
   logs de função na Vercel.

## Crons

`vercel.json` define ~40 rotas `/api/cron/*`, várias com frequência de
minutos. O plano Hobby da Vercel só permite execução diária; use o plano Pro
ou um agendador externo chamando as rotas com o cabeçalho
`Authorization: Bearer $CRON_SECRET`.

## Backup e restauração

- Use o backup automático do provedor (Neon/Supabase: point-in-time recovery).
- Backup lógico adicional, diário:
  ```bash
  pg_dump --format=custom --no-owner "$DATABASE_URL" > kumo-$(date +%F).dump
  ```
- Restauração em um banco novo:
  ```bash
  createdb kumo_restore
  psql kumo_restore -c 'CREATE EXTENSION IF NOT EXISTS vector; CREATE EXTENSION IF NOT EXISTS pg_trgm; CREATE EXTENSION IF NOT EXISTS pgcrypto;'
  pg_restore --no-owner --dbname=kumo_restore kumo-AAAA-MM-DD.dump
  ```
- Arquivos: habilite versionamento no bucket S3/R2.
- Teste a restauração periodicamente.

## Custos potenciais (estimativas, verifique os preços atuais)

| Item | Faixa |
|---|---|
| Vercel Pro | a partir de US$ 20/mês por membro + uso |
| Postgres gerenciado | US$ 0–25+/mês conforme volume |
| R2/S3 | centavos por GB armazenado; R2 sem taxa de saída |
| Resend | gratuito até um limite mensal; pago acima |
| Stripe | taxa por transação (cartão) |
| Provedor de IA | por token; os planos incluem franquias que o operador paga ao provedor |
