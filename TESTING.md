# Testes do Kumo One

Use Node 22 (`PATH=/opt/homebrew/opt/node@22/bin:$PATH`).

| Suíte | Comando | Último resultado (2026-11-01) |
|---|---|---|
| TypeScript | `bun run typecheck` | 0 erros |
| Build de produção | `bun run build` | OK |
| Unitários | `bun test` | 28.573 passam; **313 falham em 80 arquivos** — asserções de texto em inglês/USD ainda não atualizadas após a tradução pt-BR (nenhum arquivo que passava antes regrediu) |
| Isolamento multiempresa | `DATABASE_URL_TEST=… scripts/test.sh --layer=integration --tag=tenancy --no-coverage` | 61 arquivos, 485 passam, 0 falham (inclui `tests/integration/api/kumo-*.test.ts`) |
| E2E Kumo (20 fluxos) | `bunx playwright test tests/e2e/kumo-flows.spec.ts --workers=1` (variáveis no topo do arquivo) | **Incompleto**: cadastro + confirmação de e-mail + login passaram; a verificação de logout revelou um defeito real (sessão ressuscitada por cookie reemitido), corrigido no commit final com revogação por `sid`, mas a suíte não foi reexecutada depois da correção |
| E2E do projeto-base | `bun test:critical` | Não executado (asserções em inglês) |
