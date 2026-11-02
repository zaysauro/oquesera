# Relatório de entrega — Kumo One

**O produto NÃO está pronto para comercialização.** O código funciona localmente e os fluxos principais passam no e2e, mas faltam: deploy (sem acesso à Vercel nem banco hospedado), atualização de ~300 asserções unitárias de texto, revisão jurídica e credenciais externas.

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

- **E2E dos 20 fluxos — 12/12 testes passando (duas execuções seguidas)** contra build de produção, Postgres real, Mailpit e MinIO: cadastro + confirmação de e-mail, login, logout, recuperação de senha, ativação manual auditada de plano, convite de colaborador e bloqueio do leitor, CRM (cliente, oportunidade, Kanban), projeto e tarefa, upload, site por modelo + edição + publicação + página pública, agendamento público com bloqueio de conflito, reagendamento e cancelamento, automação, isolamento entre empresas e navegação mobile.
- Defeitos reais encontrados e corrigidos durante o e2e:
  - logout não encerrava a sessão (cookie reemitido por requisição em andamento) → revogação por `sid` (`drizzle/9102`);
  - **planos não liberavam os módulos** (`hasServiceAccess` ignorava planos) → corrigido com teste de integração;
  - `ALLOWED_FILE_TYPES` vazio bloqueava qualquer upload → vazio agora significa sem restrição.

## Implementado, mas não validado
- GSAP removido (substituído por `components/three/tween.ts`); as cenas 3D afetadas só existem em páginas do projeto-base que não são mais servidas.

## Parcialmente implementado
- Tradução: telas públicas, autenticação, onboarding, CRM, projetos, agendamentos, automações, equipe, cobrança e shell traduzidos; admin, Cérebro/IA, e-mail marketing, loja e outros ainda em inglês.
- Interface de provedores de IA: usa a configuração BYOK existente; não foi criada interface nova para endpoints locais por empresa.

## Bloqueado por dependência externa
- Vercel (conta/token), PostgreSQL hospedado, bucket S3/R2, Resend (domínio), Stripe (modo teste), chave de provedor de IA, domínio + DNS curinga.

## Pendências
- Atualizar as asserções unitárias que ainda esperam textos em inglês/USD.
- Revisão jurídica de termos/privacidade e da licença do `react-leaflet`.
- Deploy conforme `DEPLOYMENT.md`.

## Observação sobre o ambiente local
Instalados via Homebrew: bun, postgresql@17, pgvector, mailpit, minio, node@22, gitleaks. A instalação do node@22 atualizou `simdjson` e quebrou o `node` padrão; foi reparado atualizando `node` (26.10 → 26.13).

## Limitações conhecidas
- A biblioteca de mídia/upload pertence a um site: a empresa precisa criar um site antes de enviar arquivos pela biblioteca.
- Login é permitido antes da confirmação de e-mail (comportamento do projeto-base); a contratação de plano exige e-mail confirmado.
- Sem Stripe configurado, planos só são ativados manualmente por um administrador da plataforma (registrado em auditoria).
