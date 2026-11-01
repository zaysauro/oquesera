# Segurança do Kumo One

## Comunicar uma vulnerabilidade

Não abra uma issue pública. Envie os detalhes para o e-mail de suporte do
operador (`NEXT_PUBLIC_SUPPORT_EMAIL`) ou use "Report a vulnerability" na aba
Security do repositório `zaysauro/oquesera`. A política original do projeto-base
está em `docs/UPSTREAM_SECURITY.md`; falhas no código herdado também devem ser
comunicadas ao SimplerDevelopment.

## Modelo de segurança

**Isolamento entre empresas**
- A empresa ativa é resolvida no servidor a partir da sessão
  (`authorizePortal`), nunca a partir de um parâmetro do navegador.
- Consultas filtram por `clientId`; recursos de outra empresa respondem 404.
- Coberto por testes de integração `@tenancy` (59 arquivos, 478 casos) e
  `tests/integration/api/kumo-sites.test.ts`.

**Autenticação e sessões**
- NextAuth v5 com senha (bcrypt), confirmação de e-mail, recuperação de senha
  por link de uso único (1 hora), 2FA (TOTP) opcional, login Google opcional.
- Cookies `httpOnly`/`secure` em produção; domínio do cookie configurável.

**Autorização**
- Papéis na empresa: proprietário, administrador, membro, leitor.
- Acesso aos módulos depende do plano (`requireService`).
- Ações externas ou destrutivas (publicar site, despublicar, enviar contratos,
  pagamentos) passam por confirmação na interface e checagem de papel no servidor.

**Segredos**
- Nenhuma credencial no repositório (`.env*` no `.gitignore`; gitleaks no
  pre-commit; varredura do GitHub ativa).
- Chaves de IA e de integrações de cada empresa ficam criptografadas no banco
  (`ENCRYPTION_KEY`, `WORKSPACE_TENANT_SECRETS_KEY`) e só são usadas no servidor.
- O frontend nunca recebe chaves de API.

**Cobrança**
- Sem provedor de pagamento configurado, a contratação on-line é recusada; um
  plano só é ativado por confirmação do Stripe (webhook/verificação da sessão)
  ou por atribuição manual de um administrador da plataforma.

**Auditoria**
- Operações relevantes geram registros (`brain_audit_logs`; publicação e
  criação de site por modelo no Kumo; eventos de assinatura de contratos;
  execuções de automações e chamadas MCP).

**Assinatura eletrônica**
- O produto oferece assinatura eletrônica simples (registro de data, hora, IP).
  Não é assinatura qualificada ICP-Brasil e não deve ser apresentada como tal.

## LGPD

- A empresa cliente é controladora dos dados que cadastra; o Kumo One é operador.
- Política em `/privacidade`; canal do encarregado via `NEXT_PUBLIC_DPO_EMAIL`.
- Contas não confirmadas são removidas após 7 dias (`/api/cron/purge-unverified`).
- Exportação de dados de CRM em CSV disponível no painel.

## Pendências conhecidas

- Revisão jurídica dos termos e da política de privacidade antes do lançamento.
- Revisão da licença Hippocratic do `react-leaflet` (ver `THIRD_PARTY_NOTICES.md`).
- Rodar uma varredura completa de dependências transitivas
  (`bun audit` / `npm audit`) antes de cada release.
