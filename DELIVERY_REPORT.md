# Relatório de entrega — Kumo One

**O produto NÃO está pronto para comercialização.** Faltam: deploy, reexecução do e2e, 313 testes unitários de texto, revisão jurídica e credenciais externas.

- Repositório: https://github.com/zaysauro/oquesera — branch `kumo-one` (main contém a base importada)
- URL publicada: **nenhuma** (sem acesso a conta Vercel nem banco hospedado)

## Implementado e testado
- Importação da base SimplerDevelopment (Apache-2.0) com atribuição (`NOTICE`, `THIRD_PARTY_NOTICES.md`).
- Identidade Kumo One (logo, favicon, OG, paleta preto/branco/amarelo, claro/escuro), pt-BR, BRL, domínio configurável.
- Site institucional (início, funcionalidades, preços lidos do banco, sobre, termos, privacidade) — verificado no navegador, inclusive mobile.
- Planos Essencial/Profissional/Empresarial em BRL; IDs Stripe do projeto-base removidos; checkout recusa sem provedor (teste de integração); atribuição manual de plano auditada.
- 7 modelos de site, publicação em um passo com auditoria, contatos do rodapé, formulário de contato persistindo — testes de integração + navegador.
- Isolamento multiempresa: suíte @tenancy 61/61 arquivos.
- Correção de segurança: escrita no CRM agora exige papel (leitor recebia permissão de escrita) — teste de integração.
- Cadastro, confirmação de e-mail e login — e2e.

## Implementado, mas não validado
- Correção de logout (revogação por `sid`, `drizzle/9102`) — tipada, não reexecutada no e2e.
- Fluxos e2e 4–20 (recuperação de senha, convite, CRM/Kanban, projetos, upload, agendamento/reagendamento/cancelamento, automação, mobile no painel) — spec escrita, não executada até o fim.
- GSAP removido (substituído por `components/three/tween.ts`).

## Parcialmente implementado
- Tradução: telas públicas, autenticação, onboarding, CRM, projetos, agendamentos, automações, equipe, cobrança e shell traduzidos; admin, Cérebro/IA, e-mail marketing, loja e outros ainda em inglês.
- Interface de provedores de IA: usa a configuração BYOK existente; não foi criada interface nova para endpoints locais por empresa.

## Bloqueado por dependência externa
- Vercel (conta/token), PostgreSQL hospedado, bucket S3/R2, Resend (domínio), Stripe (modo teste), chave de provedor de IA, domínio + DNS curinga.

## Pendências
- Reexecutar `tests/e2e/kumo-flows.spec.ts` e corrigir falhas; atualizar 313 asserções unitárias.
- Revisão jurídica de termos/privacidade e da licença do `react-leaflet`.
- Deploy conforme `DEPLOYMENT.md`.

## Observação sobre o ambiente local
Instalados via Homebrew: bun, postgresql@17, pgvector, mailpit, minio, node@22, gitleaks. A instalação do node@22 atualizou `simdjson` e quebrou o `node` padrão; foi reparado atualizando `node` (26.10 → 26.13).
