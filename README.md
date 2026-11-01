<p align="center">
  <img src="public/brand/kumo-logo.svg" alt="Kumo One" width="320" />
</p>

# Kumo One

Plataforma SaaS multiempresa para pequenas empresas brasileiras: CRM com funil
em Kanban, criador de sites com modelos por segmento, agendamento online,
projetos e tarefas, contratos e propostas com assinatura eletrônica simples,
automações e assistente de IA — em português, com valores em reais.

O Kumo One é uma distribuição modificada do projeto open source
[SimplerDevelopment](https://github.com/SimplerDevelopment/SimplerDevelopment)
(Apache-2.0). Veja [`NOTICE`](NOTICE) e
[`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md).

| Documento | Conteúdo |
|---|---|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Arquitetura, multiempresa, módulos e o que o Kumo mudou |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Vercel, banco, armazenamento, e-mail, pagamentos, custos |
| [SECURITY.md](SECURITY.md) | Modelo de segurança, isolamento, segredos, LGPD |
| [TESTING.md](TESTING.md) | Como rodar os testes e resultados atuais |
| [DELIVERY_REPORT.md](DELIVERY_REPORT.md) | Estado da entrega: o que está pronto, validado e bloqueado |

## Requisitos

- **Node.js 22** (o projeto fixa `engines.node = 22.x`; com Node 26 o jsdom dos testes falha).
- **Bun 1.3+** (gerenciador de pacotes; use `bun`, não `npm`).
- **PostgreSQL 14+ com `pgvector`** (`vector`, `pg_trgm`, `pgcrypto`).
- Opcional para desenvolvimento: **Mailpit** (captura e-mails) e **MinIO** (S3 local para uploads).

No macOS:

```bash
brew install oven-sh/bun/bun node@22 postgresql@17 pgvector mailpit minio minio-mc
brew services start postgresql@17 && brew services start mailpit
```

## Instalação

```bash
git clone https://github.com/zaysauro/oquesera.git kumo-one && cd kumo-one
bun install
cp .env.example .env.local
```

Preencha em `.env.local` (gere cada segredo com `openssl rand -hex 32`, e
`PORTAL_KMS_KEY` com `openssl rand -base64 32`):

| Variável | Para quê |
|---|---|
| `DATABASE_URL` | Postgres, ex.: `postgresql://usuario@localhost:5432/kumo_dev` |
| `AUTH_SECRET`, `NEXTAUTH_SECRET` | Sessões (mesmo valor) |
| `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` em dev |
| `ENCRYPTION_KEY`, `WORKSPACE_TENANT_SECRETS_KEY`, `OAUTH_STATE_SECRET`, `PORTAL_KMS_KEY`, `CRON_SECRET` | Criptografia de chaves de integração, OAuth, cron |
| `EMAIL_TRANSPORT=mailpit` | Em dev, e-mails vão para o Mailpit (http://localhost:8025) |
| `S3_*` | Armazenamento de arquivos (MinIO local ou S3/R2) |

Banco de dados:

```bash
createdb kumo_dev
psql kumo_dev -c 'CREATE EXTENSION IF NOT EXISTS vector; CREATE EXTENSION IF NOT EXISTS pg_trgm; CREATE EXTENSION IF NOT EXISTS pgcrypto;'
bun run db:migrate                                  # migrations do Drizzle
bun scripts/apply-local-manual-migrations.ts        # migrations manuais (drizzle/9xxx_*_manual.sql)
bun scripts/kumo-sync-catalog.ts                    # planos e módulos do Kumo em BRL
ADMIN_EMAIL=admin@exemplo.com DEMO_EMAIL=demo@exemplo.com bun scripts/seed-dev.ts   # dados demonstrativos (opcional)
```

## Executar

```bash
bun run dev:docker      # next dev com webpack (recomendado; o Turbopack falhou ao baixar Google Fonts neste ambiente)
```

- Site institucional: http://localhost:3000
- Painel da empresa: http://localhost:3000/portal
- Administração da plataforma: http://localhost:3000/admin
- Sites dos clientes em dev: `http://<subdominio>.kumo.localhost:3000` ou `http://localhost:3000/sites/<subdominio>.kumo.localhost`

Produção local: `bun run build && bun run start`.

## Administração

- **Administrador da plataforma**: usuário com `users.role = 'admin'` (criado pelo
  `seed-dev.ts`/`seed-admin.ts`). Acessa `/admin`: empresas, usuários,
  assinaturas, faturas, serviços, sinalizadores e saúde do sistema.
- **Empresa (tenant)**: criada pelo cadastro em `/portal/signup`. Papéis dentro da
  empresa: proprietário, administrador, membro, leitor (`client_members.role`).
- **Planos**: Essencial (R$ 49,90), Profissional (R$ 99,90) e Empresarial
  (R$ 199,90) são linhas da tabela `services`; preço e textos podem ser
  alterados em `/admin/portal-services`. A página `/precos` lê esses valores.
  Para recriar os padrões: `bun scripts/kumo-sync-catalog.ts`.
- **Pagamentos**: com `STRIPE_SECRET_KEY` (modo teste `sk_test_…`) rode
  `bun scripts/billing/sync-stripe-products.ts` para criar produtos/preços em
  BRL. Sem Stripe, a contratação on-line fica desativada e o plano é atribuído
  pelo administrador.

## Comandos úteis

```bash
bun run typecheck                                   # TypeScript
bun run lint                                        # ESLint
bun test                                            # testes unitários
bun test:tenancy                                    # isolamento entre empresas (Postgres local)
bun run db:studio                                   # explorar o banco
```

## Licença

Código do projeto-base: Apache-2.0 © SimplerDevelopment (arquivo `LICENSE`,
inalterado). Modificações do Kumo One distribuídas sob a mesma licença. Marca
Kumo One e logotipo: próprios.
