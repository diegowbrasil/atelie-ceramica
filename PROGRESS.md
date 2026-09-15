# PROGRESS.md — Histórico vivo do projeto

> Leia [`CLAUDE.md`](CLAUDE.md) primeiro (contexto permanente). Este arquivo é
> o log de andamento — atualize a cada alteração relevante, sem apagar
> histórico antigo. A seção "Onde continuar agora" no topo é a única que é
> **sobrescrita** a cada atualização; o resto do arquivo só cresce.

---

## Onde continuar agora

**Última sessão:** 2026-09-15 — retomada do projeto + correção de bug de
mobile no dashboard. **Área do Aluno começada e pausada no meio** (ver
abaixo) — não está terminada, não deixar o usuário achar que está.

**Decisão do Diego:** o demo (`demo/AtelieDemo.jsx`) é oficialmente o
principal — ver CLAUDE.md §2. Next.js fica parado sem investimento até
pedido explícito. Preview local agora é permanente: `npm run preview:demo`
(porta 5183), pasta `preview/` versionada no repo, lê o demo direto sem
cópia — ver CLAUDE.md seção de preview.

**Redesign visual pendente de resposta** (perguntei, ele ainda não
respondeu — não iniciar sem essas respostas):
1. Ele está projetando um novo site do MTCST inspirado em vigashoes.com
   (marca VIGA — bolsas/calçados de couro: fundo cru/off-white, quase tudo
   preto, acento bordô escuro, tipografia monoespaçada maiúscula, cantos
   RETOS na maioria dos elementos — oposto do visual atual do app, que é
   arredondado/terracota). Preciso saber se ele vai mandar o link/print do
   site MTCST de verdade, ou se é pra basear só no vigashoes.
2. Preciso saber se mantém o acento terracota (temático com cerâmica) ou
   vai tudo pro preto/bordô monocromático como o vigashoes.

**Ambiente:** durante esta sessão também rodou `npx claude-mem install`
(ferramenta de memória de terceiros) — apareceu nas ferramentas/skills
disponíveis, instalado fora do meu controle direto (eu tinha perguntado e
fiquei sem resposta clara). Não interfere no projeto em si, só registrando.
Também corrigi o `npm run dev` do Next.js (node_modules nunca tinha sido
instalado + `.claude/launch.json` apontava pro script errado) — funciona em
`:3000` se precisar, mas não é prioridade dado a decisão acima.

**Estado:**
- Sistema de memória criado (este arquivo + CLAUDE.md).
- Calendário clicável do dashboard testado e funcionando.
- **Bug de mobile corrigido**: o card "Turmas da semana" (`AgendaSemanaCard`)
  usava `grid grid-cols-7` com `min-w-[150px]` por coluna — em telas de
  celular (375px) isso força ~1050px de largura mínima e estoura a tela.
  Corrigido para `flex overflow-x-auto` (scroll horizontal) abaixo do
  breakpoint `md`, mantendo o grid de 7 colunas no desktop. Mesmo padrão que
  já era usado nas abas de dia da tela Turmas. Também dei `flex-wrap` no
  grupo de botões do cabeçalho de `OficinaDetalhe` (checkbox "Ver como
  aluno" + "Editar oficina" + "Enviar lembrete"), que corria risco de
  estourar a largura em telas estreitas.
- **Início da Área do Aluno** (backlog #1): comecei a preparar o terreno —
  troquei a constante `SOLICITACOES` por `SOLICITACOES_INICIAIS` (vai virar
  `useState` na App, hoje ainda é só a constante renomeada nos 3 lugares que
  usavam) e adicionei o mock `ALUNO_LOGADO = { nome: "Maria Oliveira", diaId:
  "ter", turmaId: "ter-1830" }`. **Nada além disso foi construído ainda** —
  não existe tela de aluno, não existe troca de papel (admin/aluno), não
  existe `vagas` lifted pro nível da App. Isso tudo ainda precisa ser feito
  (ver plano em "Próximo passo imediato").

**Próximo passo imediato — retomar a Área do Aluno:**
1. Lift `vagas` (hoje `useState` local dentro de `Turmas`) pro nível da
   `App`, do mesmo jeito que `fornadas`/`oficinas` já são — necessário pra
   `AlunoDashboard` conseguir ler o pacote da Maria sem duplicar estado.
2. Lift `SOLICITACOES_INICIAIS` pra `useState(solicitacoes)` na App, com
   `resolverSolicitacao(id, aprovado)` (remove da lista) e
   `adicionarSolicitacao({ tipo })` (usa `ALUNO_LOGADO`, insere no topo).
   Atualizar os 3 lugares que hoje leem `SOLICITACOES_INICIAIS` direto
   (Dashboard, sidebar de Turmas, tela Solicitações) pra usar o estado real.
3. Adicionar `papel` (`"admin" | "aluno"`) na App + botão "Ver como aluno" /
   "Voltar ao admin" (rodapé do sidebar desktop + menu mobile) + `NAV_ALUNO`
   = Início, Minha turma, Oficinas.
4. `AlunoDashboard`: próxima aula, progresso do pacote, oficinas inscritas
   com status das peças, atalhos.
5. Estender `Turmas` (reaproveitar componente, não duplicar) com props de
   papel: card da própria aluna mantém o toggle 🟢/🔴 (isso é o "confirmar
   presença" do backlog — RSVP pra próxima aula, diferente do "Marcar
   presença" em pessoa que continua admin-only); cards de outras pessoas
   ficam só-leitura; vagas vazias mostram "Solicitar vaga" em vez de
   "Cadastrar aluno".
6. Estender `OficinaDetalhe` com prop de papel pra esconder ações de admin
   e forçar `verComoAluno`.
7. Modal "Solicitar reposição" (turma destino + observação).
8. Rodar esbuild + testar os dois papéis no navegador (admin e aluno) antes
   de reportar concluído.

**Backlog seguinte (depois da Área do Aluno terminada):**
1. **Notificações** — sino no header + tabela `notificacoes` (já existe no
   schema): última aula do pacote, pacote encerrado, solicitações, oficina
   amanhã, queima iniciada/finalizada, peças prontas.
2. **Reposições** — fluxo completo solicitação → aprovar/recusar →
   confirmado (a parte de "solicitar" nasce junto com a Área do Aluno; falta
   o lado do admin aprovar/recusar de verdade, hoje é só notificação).
3. **Relatórios e Configurações** — hoje são placeholder "Em breve" (tela
   `EmBreve` no demo).
4. **Migrar o demo para o projeto Next.js + Supabase** (ver CLAUDE.md §2B).
5. Integração real de WhatsApp (hoje é link `wa.me`), pagamentos, sensores
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
  a resolução). Calendário do dashboard clicável (implementado e testado).
  Layout mobile do calendário "Turmas da semana" corrigido (scroll
  horizontal abaixo de `md`, ver histórico de sessões 2026-09-15).
- Next.js/Supabase: schema completo com RLS (`supabase/schema.sql`), design
  system, componentes de UI base, layout (Sidebar/MobileNav), Dashboard,
  Turmas, Forno, login com roteamento por perfil, motor de cálculo isolado
  em `src/lib/forno.ts`.

### Em andamento
- **Área do Aluno** (demo) — começada e pausada no meio, ver "Onde continuar
  agora" no topo deste arquivo para o plano detalhado de retomada. Até agora
  só existe `SOLICITACOES_INICIAIS` (renomeada, ainda não é `useState`) e o
  mock `ALUNO_LOGADO`. Nenhuma tela nova, nenhuma troca de papel ainda.

### Pendente (não implementado em nenhum dos dois codebases)
- Notificações (sino + realtime).
- Reposições (fluxo completo).
- Relatórios, Configurações.
- Next.js: telas de Alunos, Oficinas, Solicitações, Pagamentos,
  Relatórios, Configurações, área do Aluno — todas "a implementar" (ver
  README.md).
- Integrações reais: WhatsApp (hoje é `wa.me`), pagamentos, sensores do
  forno.

### Bugs conhecidos
- **Aviso de React no console** (não trava nada, funcionalidade OK): "Cannot
  update a component (...) while rendering a different component" apontando
  pro componente `Turmas`. Detectado em 2026-09-15 no console do navegador,
  parece pré-existente (não relacionado às edições desta sessão, que não
  tocaram na lógica interna de `Turmas`). Não investigado a fundo ainda —
  próxima pessoa que mexer em `Turmas` pode aproveitar pra rastrear a causa.
- (Histórico: o arquivo único do demo já quebrou a sintaxe 3× por edições
  anteriores a esta sessão — sempre corrigido rodando esbuild; ver CLAUDE.md
  §8.)

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

---

### 2026-09-15 (continuação) — Correção de mobile + início da Área do Aluno

**Contexto:** Diego pediu pra testar o app de novo (harness reaberto) e, ao
ver o preview, pediu pra otimizar para celular também. No meio dessa
verificação eu tinha acabado de começar a construir a Área do Aluno (backlog
#1) — fiquei pausado nela pra atender o pedido de mobile primeiro.

**O que foi feito:**
- Reaberto o harness de preview descartável (`scratchpad/preview`, mesmo
  esquema da sessão anterior — Vite + cópia do `AtelieDemo.jsx`) e
  recriado temporariamente `.claude/launch.json` (removido de novo ao
  final, aponta pra um caminho de scratchpad que não sobrevive entre
  sessões).
- **Bug de mobile encontrado e corrigido** — ver detalhes em "Onde continuar
  agora" e em "Estado atual". Em resumo: `AgendaSemanaCard` (calendário do
  dashboard) estourava a largura da tela em viewport de celular
  (`grid-cols-7` + `min-w-[150px]` por coluna = ~1050px mínimo). Trocado por
  scroll horizontal abaixo do breakpoint `md`. Também adicionado
  `flex-wrap` no grupo de botões do cabeçalho de `OficinaDetalhe` por
  segurança (risco parecido, menor).
- Validação: esbuild passou após cada edição. Confirmado visualmente em
  viewport mobile genuíno (375×812) que o bug existia antes da correção
  (screenshot mostrando as colunas SEX/SÁB/DOM cortadas). Depois da
  correção, confirmei por leitura de DOM (`window.innerWidth` via JS) que a
  emulação de mobile do navegador embutido ficou instável no meio da sessão
  — o painel voltou sozinho pra um viewport largo (~1180px) mesmo depois de
  eu reaplicar `resize_window` várias vezes (preset e dimensões explícitas).
  Isso parece uma limitação do ambiente desta sessão específica (o painel
  redimensionando por conta própria), não algo que dá pra corrigir do lado
  do código. Consegui confirmar que o app continua renderizando sem erros
  nesse viewport largo (usa o caminho `md:grid` normalmente), mas **não
  consegui re-confirmar visualmente a correção em viewport mobile genuíno
  depois de aplicada** — a validação final ficou apoiada em: (a) o
  screenshot mobile de antes da correção, que mostrou o bug com clareza, (b)
  o padrão de código usado na correção ser idêntico a um padrão já
  comprovado no mesmo arquivo (abas de dia da tela Turmas, que já usam
  `overflow-x-auto`), e (c) esbuild + checagem de que nada quebrou no
  viewport largo. **Vale o Diego conferir no celular de verdade** (publicando
  o artifact) antes de considerar 100% fechado.
- Notado (não corrigido, não é desta sessão): aviso de React no console
  sobre `Turmas` fazendo setState durante render de outro componente — não
  trava nada, registrado em "Bugs conhecidos" pra investigar depois.
- **Área do Aluno**: comecei o primeiro passo (renomear `SOLICITACOES` →
  `SOLICITACOES_INICIAIS`, adicionar mock `ALUNO_LOGADO`) e parei aí pra
  atender o pedido de mobile. Plano completo de retomada documentado em
  "Onde continuar agora" no topo deste arquivo — 8 passos, do lift de estado
  até o teste final nos dois papéis.
- Preview harness parado e tab fechada ao final; `.claude/launch.json`
  removido de novo do projeto.

**Decisões tomadas:**
- Priorizar o pedido explícito de mobile em cima do trabalho de feature que
  já estava em andamento, em vez de terminar a Área do Aluno primeiro e
  voltar depois — o pedido do Diego chegou no meio da construção.

**Testes realizados:** esbuild após cada edição; inspeção visual em
viewport mobile genuíno (confirmou o bug antes da correção); inspeção via
JS (`window.innerWidth`/`scrollWidth`) depois que a emulação ficou
instável; checagem de console (`read_console_messages`) sem erros novos
introduzidos pelas edições desta sessão.

**Problemas pendentes:**
- Confirmar visualmente em celular real (ou navegador com emulação mobile
  estável) que o calendário do dashboard não estoura mais a tela.
- Aviso de React em `Turmas` (setState durante render) — não investigado.
- Área do Aluno — só o primeiro passo dos 8 foi feito.

**Próximos passos:** ver "Onde continuar agora" no topo deste arquivo.
