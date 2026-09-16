# PROGRESS.md — Histórico vivo do projeto

> Leia [`CLAUDE.md`](CLAUDE.md) primeiro (contexto permanente). Este arquivo é
> o log de andamento — atualize a cada alteração relevante, sem apagar
> histórico antigo. A seção "Onde continuar agora" no topo é a única que é
> **sobrescrita** a cada atualização; o resto do arquivo só cresce.

---

## Onde continuar agora

**Última sessão:** 2026-09-16 (virou o dia no meio da sessão) — retomada do
projeto, redesign visual completo, correção de bug de overflow mobile (4
rodadas até achar a causa real), e **início de um redesign estrutural
mobile-first** (Turmas virou lista, Forno ganhou mostrador circular). **Área
do Aluno continua começada e pausada no meio** (ver backlog abaixo) — não
terminada, não deixar o usuário achar que está.

**Decisão do Diego (2026-09-16): "pense em uma nova interface, primeiro
pensando no mobile, então refaça todas as ferramentas pensando na
facilidade do mobile".** Depois de 4 rodadas de correção pontual de CSS que
não resolviam de vez o corte de tela no celular (confirmado com prints do
celular real dele), ele pediu pra parar de remendar e redesenhar as telas
de verdade pensando em mobile primeiro. Padrão validado até agora (ver
CLAUDE.md §6.1 e histórico de sessão abaixo): **lista de uma coluna em vez
de grid de cards** pra qualquer "lista de pessoas" (resolve o overflow de
raiz, não só com CSS) + **toggle switch de verdade** pra ações on/off +
**mostrador circular** (SVG progress ring) pro número mais importante de
uma tela. Aplicado em Turmas; **Oficinas (participantes) tem a mesma
estrutura de card-grid e é a próxima candidata óbvia** pro mesmo tratamento
— ainda não feito. As outras telas (Pagamentos, Alunos, Dashboard) ainda
não foram revistas sob essa ótica.

**Decisão do Diego:** o demo (`demo/AtelieDemo.jsx`) é oficialmente o
principal — ver CLAUDE.md §2. Next.js fica parado sem investimento até
pedido explícito. Preview local é permanente: `npm run preview:demo`
(porta 5183), pasta `preview/` versionada no repo, lê o demo direto sem
cópia.

**Redesign visual: concluído nesta sessão.** As duas perguntas em aberto
foram respondidas com dados reais, não suposição — o Diego mandou o IP da
rede local onde o site novo do MTCST já está rodando
(`http://192.168.1.180:3000`, pode mudar — pedir de novo se não
responder), então os tokens de cor/fonte/raio foram lidos direto do CSS
computado do site de verdade (via `javascript_tool`/`getComputedStyle`),
não estimados a partir do vigashoes. Detalhes completos do sistema visual
novo: **CLAUDE.md §6.1**. Resumo: cru `#F2F2EB` + marrom-quase-preto
`#3B3833` de base, tipografia IBM Plex Mono + Space Grotesk, cantos retos
em quase tudo, sem sombra fora de elementos flutuantes. Cores semânticas
(verde/âmbar/vermelho de status) mantidas.

**Correção no mesmo dia**: a primeira versão copiou o site de referência
sem nenhuma cor de acento (fiel ao site, que é uma loja — lá a cor vem da
foto do produto). O Diego testou e achou pobre/sem cara de app, botões não
se destacando. Corrigido na hora: acento terracota (`--accent: #C2410C`)
de volta, só que usado com critério — botões, navegação ativa, indicadores
"ao vivo" (progresso do forno, curva real do gráfico) — não espalhado por
tudo feito no brief original. Ver CLAUDE.md §6.1 pro critério completo de
onde usar/não usar.

**Ambiente:** durante esta sessão também rodou `npx claude-mem install`
(ferramenta de memória de terceiros) — apareceu nas ferramentas/skills
disponíveis, instalado fora do meu controle direto. A busca dele
(`mcp__plugin_claude-mem_mcp-search__search`) testou e deu erro de conexão
com o worker — não está funcional no momento, não depender dele. Também
corrigi o `npm run dev` do Next.js (node_modules nunca tinha sido instalado
+ `.claude/launch.json` apontava pro script errado) — funciona em `:3000`
se precisar, mas não é prioridade dado a decisão acima.

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
- **Redesign visual completo** — ver detalhes logo acima e em CLAUDE.md
  §6.1. Aplicado no arquivo inteiro: variáveis CSS de cor
  (`--cream`/`--cream-soft`/`--line`/`--ink`/`--ink-soft`), fontes (IBM
  Plex Mono + Space Grotesk via Google Fonts), cantos retos, sombras só em
  elementos flutuantes, cores do gráfico do forno. Testado em Dashboard,
  Turmas, Forno (painel + gráfico), Oficinas/OficinaDetalhe/status das
  peças, Pagamentos + modal de cobrança — tudo renderizando certo, sem
  erro de console novo (só avisos pré-existentes do Recharts,
  `defaultProps` deprecation, sem relação com esta mudança). Validado por
  esbuild a cada etapa.
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

---

### 2026-09-15 (continuação 2) — Redesign visual completo do demo

**Contexto:** o Diego pediu pra mudar o visual do app pra ficar parecido
com o novo site do MTCST que ele está projetando, inspirado no vigashoes.com.
Duas perguntas ficaram em aberto na sessão anterior (link do site novo? /
manter terracota ou não?) — ele respondeu passando o IP da rede local onde
o site novo já está rodando (`http://192.168.1.180:3000`), o que permitiu
ler os valores reais de design (cor, fonte, raio de borda) direto do CSS
computado do site, em vez de estimar a partir do vigashoes.

**O que foi feito:**
- Visitado `vigashoes.com` (marca VIGA, bolsas/calçados de couro) e
  `http://192.168.1.180:3000` (site novo "MTCST Ceramics", já com loja de
  peças, mesmo endereço em Bauru-SP que já aparecia nos dados fictícios do
  demo — confirma que é o mesmo negócio). Extraídos os tokens reais via
  `javascript_tool`/`getComputedStyle` do site novo: fundo `#F2F2EB`,
  texto `#3B3833`, fonte `IBM Plex Mono` (nav/corpo/preços, maiúsculo,
  peso 500) + `Space Grotesk` (títulos grandes), `border-radius: 0` em
  botão/card/imagem, **nenhuma cor de acento de marca** (nem laranja nem
  bordô — só cru + o marrom escuro do texto, a cor vem da foto do
  produto).
- Aplicado em `demo/AtelieDemo.jsx` inteiro:
  - Variáveis CSS (`--cream`, `--cream-soft`, `--line`, `--ink`,
    `--ink-soft`, `--font-mono`, `--font-display`) + `@import` das duas
    fontes do Google Fonts, tudo dentro do `<style>` já existente no JSX
    (sem tocar em `tailwind.config`, que não existe nesse ambiente).
  - Reescritos os componentes-base (`Card`, `Badge`, `Avatar`, `VaseMark`,
    `Modal`) e todo o chrome (sidebar, menu mobile, header, tab bar
    inferior, toast) pro novo sistema.
  - **Troca em massa de cor/canto**: em vez de editar uma por uma, escrito
    um script Node (`scratchpad/recolor.mjs`, descartável, não faz parte
    do repo) que aplicou ~35 regras de substituição de string
    (`bg-orange-600` → `bg-[var(--ink)]`, `text-stone-400` →
    `text-[var(--ink-soft)]`, remoção de `rounded-xl`/`rounded-2xl`/
    `rounded-lg`, etc.) no arquivo inteiro — mais de 300 ocorrências em uma
    passada. Único cuidado necessário: `bg-orange-50` é prefixo de
    `bg-orange-500` como string, então a regra de `orange-500` teve que
    rodar antes da de `orange-50` pra não corromper o token (documentado
    no próprio script).
  - `rounded-full` **não** foi removido em massa — tratado caso a caso:
    mantido em `Avatar`, no badge "+N" de avatares empilhados, nos círculos
    de check/seleção do NovaFornada e nos ícones "+" de vaga vazia (são
    elementos pequenos e funcionais, mesmo padrão que o próprio vigashoes
    usa pros botões flutuantes dele); removido das barras de progresso e
    dos chips de categoria do forno.
  - Cores hardcoded em hex que o script não pegava (por estarem em
    `style={{}}` do JS, não em `className`) corrigidas à mão: o indicador
    de etapa do `StatusPecasCard` e as cores das linhas/área do gráfico
    Recharts (curva "real" → `--ink` sólido, curva "prevista" → cinza-
    amarronzado claro, grid/"Patamar" → tons neutros do sistema). A linha
    de referência "Abertura segura" do gráfico **continua azul**
    (`#60A5FA`) de propósito — é um marcador funcional, não acento de
    marca, e o gráfico perderia legibilidade sem ela se distinguir das
    outras linhas.
  - `style={FONT_DISPLAY}` aplicado nos 9 `<h1>` de título de página
    (Painel geral, Forno, Turmas, Alunos, Oficinas, nome da oficina,
    Nova fornada, Solicitações, Pagamentos).
  - `shadow-sm` removido de botões e cards no fluxo da página (o site real
    não usa sombra nenhuma); mantido só em `Modal`/drawer/toast, que são
    elementos flutuantes de verdade.
- Cores semânticas de status (`emerald`/`amber`/`rose` do Tailwind, e o
  verde do botão "Cobrar no WhatsApp") **não foram tocadas** — continuam
  comunicando estado (confirmado/pendente/atrasado), isso é informação,
  não identidade de marca.

**Testes realizados:**
- `esbuild` depois de cada etapa (script em massa, ajustes manuais, fontes
  nos títulos) — sempre passou.
- Verificação de cor por `getComputedStyle` via `javascript_tool` (não só
  visual) confirmando que os 4 ícones de KPI do dashboard batem exatamente
  com os tokens esperados (um deles virou `--cream-soft`, os outros três
  continuam emerald/amber/rose).
- Navegação clicando em Dashboard, Turmas (grid de 12 vagas), Forno
  (painel + gráfico), Oficinas → detalhe de oficina → Status das peças,
  Pagamentos + modal "Cobrar no WhatsApp" — tudo renderizando com o layout
  certo, sem crash.
- `read_console_messages`: só os avisos pré-existentes do Recharts
  (`defaultProps` deprecation, warning de versão antiga da lib), sem
  nenhum erro novo introduzido.
- Um screenshot do Forno saiu com um "buraco" vazio grande entre seções —
  investigado com `getBoundingClientRect` em cada card via JS, que provou
  que os elementos estão exatamente onde deveriam (sem gap real no DOM).
  Concluído que era falha pontual de captura de tela do navegador embutido
  desta sessão (mesmo ambiente que já tinha dado problema de viewport
  mobile antes) — não um bug de layout. Screenshots seguintes saíram
  normais.

**Decisões tomadas:**
- Basear o redesign no CSS **medido do site real**, não em suposição a
  partir do vigashoes — o vigashoes é só a inspiração dele, o site dele é
  a fonte de verdade.
- Manter cores semânticas de status separadas de "acento de marca" — são
  conceitos diferentes, uma reforça usabilidade, a outra é identidade
  visual, e só a segunda foi removida.
- Manter pequenos elementos circulares funcionais (avatar, ícones de
  seleção) mesmo com o resto do app em cantos retos — segue o próprio
  vigashoes, que faz a mesma exceção.
- Preferir um script de substituição em massa a dezenas de edições manuais
  — mais rápido e, com as strings certas, mais seguro (menos chance de
  esquecer uma ocorrência no meio de 1600 linhas).

**Problemas pendentes:**
- Next.js (§2B) não foi tocado — continua com o Tailwind config antigo,
  fora de escopo enquanto o demo for o principal.
- Área do Aluno continua no passo 1 de 8 (ver "Onde continuar agora").
- Vale o Diego conferir o resultado publicando o artifact de verdade, já
  que a checagem desta sessão foi toda via preview local.

**Próximos passos:** ver "Onde continuar agora" no topo deste arquivo.

---

### 2026-09-15 (continuação 3) — Correção: trouxe o acento de cor de volta

**Contexto:** minutos depois de reportar o redesign como concluído, o
Diego testou e voltou com feedback direto: "está muito pobre visualmente,
quero que fique com uma cara mais aplicativo, com botões mais destacados,
ficou tudo muito a mesma cor". A versão sem acento nenhum seguiu o site de
referência à risca, mas esse site é uma **loja** (a cor vem da foto do
produto); o app é uma **ferramenta**, sem fotografia pra carregar
interesse visual — precisa de hierarquia própria.

**O que foi feito:**
- Adicionadas 3 variáveis novas: `--accent: #C2410C` (o mesmo tom de
  terracota — `orange-700` — que o app já usava antes do redesign, escolha
  deliberada por já ser testado e por ligar tematicamente com argila),
  `--accent-hover: #9A3412`, `--accent-soft: #F3E1D6`.
- Script (`scratchpad/accent.mjs`, descartável): converteu em massa todo
  `bg-[var(--ink)]` → `bg-[var(--accent)]` e `hover:opacity-90` →
  `hover:bg-[var(--accent-hover)]`, depois reverteu manualmente as 4
  exceções que deviam continuar neutras (`Avatar`, overlay do `Modal`,
  overlay do menu mobile, `toast`) — mesma técnica "converte tudo, depois
  reverte exceção" do redesign original.
- Ajustes manuais adicionais pro acento cobrir também: estado ativo do
  menu (sidebar, menu mobile, tab bar — antes só um fundo branco/cinza sem
  graça, agora borda/texto/fundo em accent), dia atual e aba de dia
  selecionada no calendário/Turmas (volta a bater com a regra original do
  CONTEXTO.md: "dia atual em laranja"), linha "temperatura real" do
  gráfico do forno (era ink, virou accent — é o dado mais importante da
  tela), etapa atual do Status das peças, cards de seleção do Nova
  Fornada (tipo/categoria escolhidos).
- Critério documentado em CLAUDE.md §6.1 pra não perder a régua depois:
  accent = ação ou dado "ao vivo" mais importante da tela; tudo o resto
  (texto, cards, tags informativas, avatar) continua neutro. Isso evita
  cair de novo em nenhum dos dois extremos (tudo colorido como o brief
  original, ou nada colorido como a v1 deste redesign).

**Testes realizados:** esbuild após o script + após cada ajuste manual;
navegação por Dashboard, Turmas e Forno confirmando visualmente (screenshot
funcionou desta vez) que menu ativo, dia atual, botões primários e barra
de progresso agora saltam aos olhos contra o fundo neutro.

**Decisões tomadas:**
- Reintroduzir cor de acento é a correção certa, não um retrocesso — o
  "sem acento" da v1 era fidelidade excessiva a uma referência que não é
  do mesmo tipo de produto (loja vs. ferramenta de gestão).
- Manter o critério de uso restrito ("só ação/dado ao vivo") em vez de
  simplesmente devolver o laranja pra tudo como era antes — é isso que dá
  hierarquia, não a cor em si.

**Próximos passos:** ver "Onde continuar agora" no topo deste arquivo.

---

### 2026-09-16 — Bug real de overflow mobile (reportado com screenshot do usuário)

**Contexto:** o Diego mandou um screenshot de verdade (celular/menu de
Viewport do próprio painel, não a ferramenta de preview instável deste
Claude Code) mostrando a tela de Turmas cortada na lateral direita, e
descreveu que na página inicial a barra de navegação de baixo some.

**O que foi encontrado e corrigido:**
- **Bug real confirmado**: os grids de 12 vagas (`Turmas` e
  `OficinaDetalhe`) usam `grid grid-cols-2` mas os cards dentro (tanto o
  card de aluno ocupado quanto o botão "vaga disponível") não tinham
  `min-width: 0`. É o bug clássico do CSS Grid: sem isso, um item de grid
  não encolhe abaixo do tamanho mínimo do próprio conteúdo, então em telas
  estreitas o grid inteiro estoura a largura em vez dos cards encolherem.
  Também quebrava o `truncate` do nome do aluno, que precisa de um
  container com largura restringida pra funcionar. Corrigido nos 4 pontos
  (card + vaga vazia, em Turmas e em Oficinas).
- **Correções defensivas relacionadas** (mesma causa-raiz, aplicadas por
  precaução mesmo sem confirmação visual direta): `min-w-0` no componente
  `Card` (usado em quase todo o app) e no `StatCard` (mais `truncate` nos
  textos), e `w-full min-w-0 overflow-hidden` nos dois containers do
  gráfico Recharts (mini-gráfico do dashboard e gráfico grande do Forno) —
  gráficos responsivos são uma fonte comum desse tipo de problema.
- **Não confirmado**: a barra de navegação sumindo especificamente na
  página inicial. Tentei reproduzir e medir via JavaScript
  (`getBoundingClientRect`), mas a ferramenta de navegador deste Claude
  Code está com uma inconsistência própria nesta sessão — reporta duas
  larguras de página diferentes ao mesmo tempo (uma "correta" pra media
  queries, outra bem maior pra medidas de elemento/scroll), o que faz
  qualquer medição minha sobre esse ponto especificamente não ser
  confiável. Não descarto que seja o mesmo tipo de causa (overflow
  horizontal empurrando/confundindo o cálculo de `position: fixed` em
  algum navegador móvel real), mas não consegui isolar com certeza.
  **Vale o Diego testar de novo depois desta correção** — é possível que
  já tenha resolvido junto, já que overflow horizontal real na página pode
  interferir em elementos fixos em alguns navegadores.

**Testes realizados:** esbuild após cada edição; `get_page_text` +
`read_console_messages` confirmando que a página carrega sem erro novo
(só os avisos pré-existentes do Recharts). Medição via
`getBoundingClientRect`/`scrollWidth` tentada mas não confiável nesta
sessão pelo motivo acima — **não** serve como confirmação de que o
overflow sumiu, só o código foi corrigido com uma causa plausível e bem
entendida.

**Problemas pendentes:**
- Confirmar com o Diego se a barra de navegação da página inicial voltou
  a aparecer depois desta correção.
- Se ainda estiver quebrada, pedir um screenshot novo especificamente da
  página inicial (Dashboard) pra investigar mais fundo — o código deste
  componente específico (nav fixa, `position: fixed; bottom: 0`) não tem
  nada visivelmente diferente por tela, então se o problema for
  tela-específico a causa provavelmente está no conteúdo daquela tela
  (ela é a mais alta/complexa do app: KPIs + card do forno com gráfico +
  calendário da semana + 3 cards de resumo) interagindo com o navegador
  real do celular, não algo óbvio no código da própria barra.

**Próximos passos:** ver "Onde continuar agora" no topo deste arquivo.
