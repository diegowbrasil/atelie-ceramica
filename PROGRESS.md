# PROGRESS.md — Histórico vivo do projeto

> Leia [`CLAUDE.md`](CLAUDE.md) primeiro (contexto permanente). Este arquivo é
> o log de andamento — atualize a cada alteração relevante, sem apagar
> histórico antigo. A seção "Onde continuar agora" no topo é a única que é
> **sobrescrita** a cada atualização; o resto do arquivo só cresce.

---

## Onde continuar agora

**Última sessão:** 2026-09-15 — sessão de retomada do projeto (handoff).

**Estado:** projeto reorganizado num repositório único, sistema de memória
criado, e a feature pendente de verificação (calendário clicável do
dashboard) **testada manualmente e confirmada funcionando**. Nenhuma
funcionalidade nova foi construída ainda nesta sessão — o trabalho até aqui
foi organização + memória + verificação do estado existente.

**Próximo passo imediato:** seguir o backlog sugerido em CONTEXTO.md /
abaixo, começando por **Área do Aluno**, salvo se o Diego priorizar
diferente.

**Backlog pendente (ordem sugerida, herdada do handoff original):**
1. **Área do Aluno** — login separado, visão só-leitura: próximas aulas,
   aulas restantes do pacote, confirmar presença, solicitar reposição,
   solicitar vaga, status das peças das oficinas. Hoje só existe o toggle
   "Ver como aluno" na tela de Oficinas do demo.
2. **Notificações** — sino no header + tabela `notificacoes` (já existe no
   schema): última aula do pacote, pacote encerrado, solicitações, oficina
   amanhã, queima iniciada/finalizada, peças prontas.
3. **Reposições** — fluxo completo solicitação → aprovar/recusar →
   confirmado.
4. **Relatórios e Configurações** — hoje são placeholder "Em breve" (tela
   `EmBreve` no demo).
5. **Migrar o demo para o projeto Next.js + Supabase** (ver CLAUDE.md §2B).
6. Integração real de WhatsApp (hoje é link `wa.me`), pagamentos, sensores
   do forno.

---

## Estado atual do projeto (visão geral)

### Concluído
- Demo (`demo/AtelieDemo.jsx`): Dashboard, Turmas (12 vagas, presença
  reversível, chip confirmado/ausente), Alunos (lista vazia + cadastro),
  Oficinas (lista + detalhe + participantes + status das peças + toggle
  "Ver como aluno"), Forno (painel + nova fornada em página dedicada +
  histórico + duplicar configuração), Pagamentos (pendentes + cobrar via
  WhatsApp + histórico), Solicitações (aprovar/recusar, ainda sem persistir
  a resolução). Calendário do dashboard clicável (implementado, teste
  manual pendente — ver acima).
- Next.js/Supabase: schema completo com RLS (`supabase/schema.sql`), design
  system, componentes de UI base, layout (Sidebar/MobileNav), Dashboard,
  Turmas, Forno, login com roteamento por perfil, motor de cálculo isolado
  em `src/lib/forno.ts`.

### Em andamento
- Nada em edição de código no momento — sessão atual é de retomada/
  organização.

### Pendente (não implementado em nenhum dos dois codebases)
- Área do Aluno (login/visão do aluno de verdade — só existe o toggle
  simulado no demo).
- Notificações (sino + realtime).
- Reposições (fluxo completo).
- Relatórios, Configurações.
- Next.js: telas de Alunos, Oficinas, Solicitações, Pagamentos,
  Relatórios, Configurações, área do Aluno — todas "a implementar" (ver
  README.md).
- Integrações reais: WhatsApp (hoje é `wa.me`), pagamentos, sensores do
  forno.

### Bugs conhecidos
- Nenhum bug em aberto registrado no momento. (Histórico: o arquivo único
  do demo já quebrou a sintaxe 3× por edições anteriores a esta sessão —
  sempre corrigido rodando esbuild; ver CLAUDE.md §8.)

---

## Histórico de sessões

### 2026-09-15 — Sessão de retomada + criação do sistema de memória

**Contexto:** primeira sessão via Claude Code neste diretório. Anteriormente
o projeto só existia como um "pacote de handoff" (`COMECE-AQUI.md` +
`CONTEXTO.md` + `files.zip`) pensado para ser reenviado a uma conversa nova
no Claude.ai a cada retomada. O Diego pediu para dar continuidade ao app.

**O que foi feito:**
- Extraído `files.zip` → continha `atelie-ceramica-completo.zip` (projeto
  Next.js completo) e `atelie-ceramica-demo.jsx` (cópia idêntica ao
  `demo/AtelieDemo.jsx` de dentro do zip aninhado — confirmado por `diff`,
  0 diferenças).
- Reorganizado: conteúdo do projeto Next.js movido para a raiz de
  `APP MTCST/` (antes estava aninhado em
  `extracted/nextjs-project/atelie-ceramica-projeto/`). Pasta temporária de
  extração removida. `files.zip` mantido na raiz como arquivo original.
- **Git inicializado** (não existia antes) — repositório **local, sem
  remoto**. Criado `.gitignore` (`node_modules/`, `.next/`, `.env.local`,
  `*.log`). `user.name`/`user.email` configurados localmente neste repo
  (Diego / denisatbrasil@gmail.com — não alterada a config global do git).
  Commit inicial criado com todo o conteúdo do pacote de handoff.
- Lidos por completo: `COMECE-AQUI.md`, `CONTEXTO.md`, `README.md`,
  `supabase/schema.sql`, `demo/AtelieDemo.jsx` (1580 linhas, arquivo
  inteiro). Confirmado por leitura de código que a feature "calendário
  clicável" descrita como última coisa em andamento no `CONTEXTO.md` está de
  fato implementada (`AgendaSemanaCard` recebe `onAbrirDia`/`onAbrirOficinas`,
  `Turmas` aceita `diaInicial`) — **ainda não testada manualmente em
  navegador** nesta sessão.
- Confirmado ambiente local: Node v24.18.0, npm 11.16.0.
- **Validação de sintaxe**: `npx esbuild demo/AtelieDemo.jsx --bundle=false
  --format=esm --outfile=/dev/null` → sucesso, sem erros.
- **Teste manual em navegador**: montado um harness descartável (Vite +
  React + lucide-react + recharts + Tailwind via CDN) só para rodar o
  `AtelieDemo.jsx` real fora do ambiente de artifact e clicar nele. Vivia em
  `scratchpad/preview` (fora do projeto, não versionado, já removido/expirou
  com a sessão). Resultado: dashboard renderiza igual ao esperado (KPIs,
  card do forno com mini-gráfico, calendário "Turmas da semana" com os 7
  dias). Clique na coluna **QUA** → abriu Turmas já em "Quarta-feira · 16:30
  às 18:30" com os alunos certos. Clique na coluna **SÁB** (tem oficina) →
  abriu a lista de Oficinas. Clique na coluna **SEG** (vazia, "Sem aulas")
  → não navegou, ficou no Dashboard, como esperado. **Feature do calendário
  clicável confirmada funcionando ponta a ponta.**
- Criados `CLAUDE.md` e `PROGRESS.md` (este arquivo) a pedido do Diego, para
  que sessões futuras não precisem reexplicar o projeto do zero. `CLAUDE.md`
  absorveu e reorganizou o conteúdo de `CONTEXTO.md` no formato padrão de
  memória permanente; `CONTEXTO.md`/`COMECE-AQUI.md` foram mantidos como
  estão (ainda servem para o fluxo de reenviar o pacote a uma conversa nova
  do Claude.ai quando for republicar o artifact — ver CLAUDE.md §3).

**Decisões tomadas:**
- Git local sem remoto, para permitir diff/revert dado o histórico de
  edições que quebraram a sintaxe do demo. Nada será enviado a um host
  remoto (GitHub etc.) sem pedido explícito.
- `CLAUDE.md` e `PROGRESS.md` passam a ser a fonte principal de contexto
  para sessões via Claude Code neste diretório; `CONTEXTO.md`/
  `COMECE-AQUI.md` continuam existindo para o fluxo separado de publicação
  via artifact do Claude.ai.

**Testes realizados:** esbuild (sintaxe) + teste manual em navegador via
harness Vite descartável, cobrindo os 3 casos do calendário clicável
(dia com turma, dia com oficina, dia vazio) — todos corretos.

**Próximos passos:** ver "Onde continuar agora" no topo deste arquivo.
