# PROGRESS.md — Histórico vivo do projeto

> Leia [`CLAUDE.md`](CLAUDE.md) primeiro (contexto permanente). Este arquivo é
> o log de andamento — atualize a cada alteração relevante, sem apagar
> histórico antigo. A seção "Onde continuar agora" no topo é a única que é
> **sobrescrita** a cada atualização; o resto do arquivo só cresce.

---

## Onde continuar agora

**Última sessão:** 2026-09-16/17 (mesma sessão, bem longa, atravessou
virada de dia e um reset de limite de uso do Diego no meio). O redesign
formal completo em 5 fases (INIT → CRITIQUE → SHAPE → CRAFT → POLISH) via
`/impeccable` **está concluído** — ver "Fase atual" abaixo pro detalhe
completo de cada fase. **Área do Aluno continua começada e pausada no
meio** (ver backlog no fim desta seção) — não é o foco agora, não
terminada, não deixar o usuário achar que está.

**Depois do POLISH, mais uma rodada de iteração ao vivo (2026-09-17),
fora das 5 fases formais** — pedido do Diego reagindo ao app no celular:
1. `AgendaSemanaCard` ("Turmas da semana" no Dashboard) **redesenhado de
   lista horizontal com scroll pra lista vertical, sem scroll lateral em
   nenhum breakpoint** — "isso qro um calendario como se fosse uma lista,
   nao qro q use scroll para o lado". Um `VIDRO_CARD` só com `divide-y`,
   uma linha por dia.
2. **Datas reais (DD/MM) no lugar de números soltos/hardcoded** — tanto no
   selo de cada dia do `AgendaSemanaCard` quanto no cabeçalho do dia em
   Turmas ("Terça-feira · 15/09 · 18:30 às 20:30"). Calculado a partir de
   `new Date()` (`datasDaSemanaAtual()`/`formatarDiaMes()`), não mais mock
   fixo — motivo dado pelo Diego: "pq depois qro se precisar gerar um
   historico da pessoa d qual dia ela veio, saber qual foi a terça feira".
   Ver detalhe técnico e o que **ainda falta** (log de presença por data
   exata — não construído ainda, só a exibição da data) em CLAUDE.md §5,
   bullet do Dashboard.
3. De brinde, corrigido um `key` duplicado (`o.nome`) na lista "Próximas
   oficinas" do Dashboard — reaparecia desde a troca pras oficinas reais
   (duas ocorrências de "Kit Café da Manhã" em datas diferentes), achado
   ao verificar o console durante o teste desta rodada.
4. **Fundo de Turmas trocado pras fotos reais de mesclagem de argila que o
   Diego mandou** (não uma recriação — ele foi direto: "vc nao consegue
   usar a foto q enviei como fundo?"), uma cor por dia ativo (Terça=sienna,
   Quarta=azul/ardósia, Quinta=verde/musgo — reaproveita `CORES_IDENTIDADE`
   já existente), com efeito parallax de verdade (fundo se move a 35% da
   velocidade do conteúdo ao rolar — pedido explícito, duas vezes: "não
   tem como eu fazer uma imagem que fique parada e conforme eu desça no
   scroll eu percorra por ela"). De caminho, corrigido um bug real de
   stacking do CSS que fazia o cabeçalho/título ficarem "apagados" (o fundo
   antigo, `position:fixed`, pintava por cima de irmãos não-posicionados) e
   subida a opacidade das pills de aba (estavam calibradas pras manchas
   suaves de antes, fracas demais contra a foto). Detalhe técnico completo
   em CLAUDE.md §5, bullet do Dashboard/Turmas — inclui o que falta (foto
   pra "café", dias sem turma sem fundo especial).
5. **`AgendaSemanaCard` (Dashboard) recebeu uma segunda passada visual** —
   o Diego mandou uma referência pronta ("o calendario da pagina inicial
   qro q seja assim") com cards separados por dia (em vez de um card só
   com divisórias), ícone de xícara + frase curta nos dias sem aula
   ("Aproveite para se inspirar!" na Segunda, "Final de semana criativo!"
   na Sexta, mais "Dia de descanso." pro Domingo que não aparecia no
   recorte da imagem), selo "Hoje" explícito no dia atual, e seta `›` nos
   cards de aula/oficina indicando que são clicáveis. Implementado 1:1 com
   a referência.
6. **Dois ajustes finos no mesmo card, na sequência**: avatares empilhados
   de 26px→30px com menos overlap ("ainda esta um pouco apertado as
   pessoas embaixo"), e cada card ganhou a cor de identidade do seu dia
   (Terça=sienna, Quarta=ardósia, Quinta=musgo — "e deixe cada card com
   sua cor da semana"), reaproveitando `corTurma`/`CORES_IDENTIDADE` já
   existentes. "Hoje" continua laranja de ação, não a cor de identidade do
   dia (mesma separação accent-vs-identidade do resto do app).
7. **Cada card do calendário semanal ganhou a foto real de mesclagem de
   argila no fundo (card inteiro, não só o selo)** — 2 rodadas rápidas de
   correção pelo Diego reagindo ao vivo: primeiro tentei só no selo
   pequeno ("nao o fundo todo do painel so esses quadrados apontados"),
   ele corrigiu — queria a foto na área maior do card, não no textinho
   ("eu quis dizer nao onde ta escrito qua, e sim onde ta azul ali, o
   fundo maior"), e junto: "o qui precisa ser verde tbm e nao laranja" —
   Quinta (hoje) agora mostra musgo/verde igual aos outros dias, o laranja
   de "hoje" saiu desse card específico (só o texto "Hoje" continua
   marcando o dia atual). Selo virou um chip sólido na cor do dia (não
   mais foto nem degradê — ficaria redundante com o card já mostrando a
   foto). Detalhe técnico em CLAUDE.md §5.
8. **Sábado ganhou uma 5ª cor ("carvão", preto/branco) e isso expôs um
   dado errado** — `AGENDA_SEMANA` (mock do Dashboard) ainda tinha 2
   oficinas fictícias no Sábado da semana atual, sobrando da troca pras
   oficinas reais de mais cedo na sessão (essa troca mexeu em
   `oficinasIniciais()`, não nesse mock separado). O Diego notou:
   "lembre as datas das oficinas, nao tem oficina desses dias ai, só a
   partir de outubro" — corrigido pra `aulas: []`, com mensagem de dia
   vazio própria ("Oficinas voltam em outubro!"). De caminho, o texto do
   estado vazio ("Sem aulas" + frase) ficou ilegível flutuando solto em
   cima da foto preto-e-branco (alto contraste demais) — o Diego pediu o
   "mesmo tratamento das outras": texto agora dentro da mesma caixa branca
   opaca que os cards de aula/oficina já usam, corrigido de forma geral
   (não só pro Sábado). Detalhe técnico em CLAUDE.md §5.
9. **Nav inferior mobile: Solicitações trocada por Oficinas** — "qro q
   tenha inicio, turmas, forno, oficinas, mais, tire o solicitações
   dali". Solicitações continua no menu completo ("Mais"), só saiu da
   barra fixa. Detalhe em CLAUDE.md §6.
10. **Roster real das 4 turmas fixas** — o Diego mandou a lista completa
    de alunos de cada turma (nome, progresso de pacote, pagamento,
    presença) e pediu "atualize as turmas". Trocou `VAGAS_INICIAIS`
    (mock fictício único, compartilhado pelas 4 abas — bug latente que
    isso escondia: trocar de turma sempre mostrava as mesmas 8 pessoas)
    por `VAGAS_POR_TURMA`, roster de verdade por turma, com o estado do
    componente `Turmas` fatiado por turma ativa (mesmo padrão dos 2
    fornos independentes). `AGENDA_SEMANA` (preview do Dashboard)
    também ganhou os nomes reais, pra não ficar inconsistente com a
    tela de Turmas. Regras de leitura da notação dele (X/Y = pago,
    número solto = não pago, "A" = avulsa, "faltou" = ausente) e as
    pendências que ficaram de fora (14 pessoas reais na Terça vs. 12
    vagas do sistema, seções de histórico que ele mandou mas não têm
    onde entrar ainda, lista de Alunos não tocada por falta de telefone,
    card "Pacotes terminando" do Dashboard que cresceu bastante) —
    tudo detalhado em CLAUDE.md §5, logo depois das regras de Turmas.

**Skill `/impeccable` instalado de verdade nesta sessão** (v4.3.1, via
`npx impeccable install` — a instalação anterior via `npx mdskills
install` só trouxe um `SKILL.md` parcial, sem os scripts/reference
completos). Fica em `.claude/skills/impeccable/` (gitignored — ferramenta
de tooling, não código do produto). Instala também hooks
(`PostToolUse`/`Stop` em `.claude/settings.local.json`, também gitignored)
que rodam `impeccable hook` depois de editar UI e no fim da sessão,
sinalizando achados de design automaticamente.

**`PRODUCT.md` criado nesta sessão** via `/impeccable init` — documento de
verdade de produto (usuários, propósito, posicionamento, contexto de uso,
capacidades/restrições, compromissos de marca, princípios). Por desenho do
próprio skill, **não contém direção visual/paleta/tipografia** (isso é
`DESIGN.md`, que nasce na fase SHAPE, ainda não criado). Registra também a
decisão de arquitetura abaixo.

**Decisão confirmada (2026-09-16): arquitetura do redesign mantém arquivo
único.** O pedido do Diego (ver "Fase atual") incluía reorganizar o código
em pastas (`components/screens/hooks/...`). Isso conflita com a restrição
que mantém `demo/AtelieDemo.jsx` publicável como artifact do Claude.ai
(sem bundler, sem resolução de import local). Perguntei antes de começar a
fase CRAFT; resposta: **manter arquivo único**, organizar por dentro
(seções claras, componentes reutilizados, zero duplicação), sem separar em
pastas de verdade. Registrado em `PRODUCT.md` no fim do arquivo.

### Fase atual do redesign formal (5 fases pedidas pelo Diego via `/impeccable`)

Pedido verbatim do Diego: reescrever/redesenhar o app inteiro com o
`/impeccable`, em etapas, preservando toda funcionalidade e dado existente.
Direção de produto pro redesign: **é um app mobile, não um site
responsivo**; VigaShoes pra linguagem estética; Apple pra clareza/
acabamento; interface limpa e premium mas com **cor usada com inteligência**
(não tudo branco com texto) — cada turma/oficina deve poder ter cor de
identidade própria (card/botão/tag/ícone/nav); fugir de cara de
template/IA-genérica; preservar identidade MTCST. Também pediu princípios
de performance/arquitetura (leve, componentes reutilizáveis, zero
duplicação, evitar libs pesadas sem necessidade, assets otimizados,
estrutura fácil de crescer).

- ✅ **INIT** — `PRODUCT.md` criado (ver acima).
- ✅ **CRITIQUE — concluída.** As duas avaliações isoladas (Assessment A
  qualitativa — Nielsen 23/40 "Aceitável"; Assessment B determinística —
  detector + overlay) foram sintetizadas num relatório único, entregue no
  chat e persistido em `.impeccable/critique/2026-09-16T18-34-43Z__demo-ateliedemo-jsx.md`
  (primeira execução, sem tendência ainda). Veredito central: **o Forno é
  autoral de verdade; Turmas/Oficinas/Pagamentos são um padrão genérico
  "lista de pessoas com badge" indistinguível de qualquer CRM pequeno** —
  ponto de partida pra fase SHAPE. 5 problemas priorizados (2× P1, 2× P2,
  1× P3) — todos corrigidos na hora, ver "O que foi feito" abaixo.
  **3 decisões do Diego nas perguntas de fechamento**: (1) corrigir todos
  os 5 problemas antes do SHAPE, não só os críticos; (2) **manter 2
  tipografias** (Inter no corpo + Space Grotesk nos títulos grandes) — ele
  respondeu inicialmente "manter uma família só", mas corrigiu poucos
  minutos depois no chat ("pode deixar com 2 fontes msm") — **a resposta
  final é 2 fontes**, não confundir com a primeira resposta se reler o
  histórico; (3) incluir os achados de acessibilidade da persona Sam no
  escopo, mas só ajustes pontuais que não mudem a direção visual nem
  deixem a interface mais carregada (nada de auditoria completa de
  acessibilidade agora).
- ✅ **SHAPE — concluída e confirmada.** Brief completo em
  `.impeccable/surfaces/demo-ateliedemo-jsx.md`. Direção final, fechada
  depois de 6 rodadas de mockup visual (widget) com o Diego reagindo a
  cada uma — resumo em "Fase SHAPE: iteração visual" logo abaixo, detalhe
  completo no brief persistido.
- ✅ **CRAFT — concluída, e muito além do brief original.** `ProgressRing`
  generalizado, paleta de identidade, vidro líquido e as manchas de fundo
  aplicados em Turmas, Oficinas (lista + detalhe), Alunos, Pagamentos e
  Solicitações, mais a barra de navegação mobile e o drawer. Só que o
  Diego seguiu revisando ao vivo (comparando com os mockups de referência)
  bem além do que o brief da SHAPE previa, e isso virou uma leva enorme de
  pedidos novos, todos já implementados e commitados: logo real da MTCST
  embutido (substituindo o `VaseMark`), gráfico de curva do Forno removido
  (nos dois lugares — painel principal e mini-card do Dashboard), correção
  de layout (`pr-0` antigo cortando cantos arredondados), **2 fornos reais
  e independentes** (mudança de arquitetura, não só visual — o ateliê tem
  2 fornos físicos), e as 6 oficinas reais no lugar das fictícias. Ver o
  histórico de commits pra detalhe de cada rodada — foram muitos, cada um
  com contexto próprio no corpo do commit.
- ✅ **POLISH — primeira passada feita via `/impeccable polish`.** Achado
  real: nenhum elemento interativo tinha indicador de foco visível ao
  navegar por teclado (Tab) — confirmado testando de verdade (tecla Tab
  real, não suposição), corrigido com um anel `:focus-visible` global na
  cor do accent. Também achou e corrigiu a tela Solicitações, que tinha
  ficado de fora da leva de vidro (não estava na lista de telas do brief
  original, mas é exatamente o mesmo padrão "lista de pessoas" que o
  resto já tem). `StatusPecasCard` continua de propósito fora do vidro —
  já documentado no brief como exceção, não é uma pendência.

### Fase SHAPE: iteração visual (2026-09-17)

O Diego pediu pra visualizar o brief em vez de só ler texto — usei o
`mcp__visualize__show_widget` pra fazer mockups HTML reais (fiéis aos
tokens do app: creme/tinta/terracota, Inter+Space Grotesk) em vez de só
descrever. 6 rodadas de ajuste, cada uma resolvida mostrando de novo, não
só explicando:
1. Fração do pacote ("3/4") precisava ficar **dentro** do anel, não do
   lado — corrigido com o padrão certo (container `relative` do tamanho
   do anel + texto `absolute inset-0` centralizado), igual o `TempGauge`
   já faz.
2. "A cor da turma só tem no quadradinho?" — não, o plano sempre incluiu
   pill de horário e navegação também, só não tinha aparecido no mockup
   ainda. Mostrado com pill + borda de card + chip + anel (4 lugares).
3. Pedido de paleta "mais moderna e colorida, tipo duo tone" — testei uma
   paleta vívida (turquesa/violeta/magenta/índigo). **Rejeitada**:
   "estranho essas cores rosas e pink, quero tons terrosos, que tenha
   mais a ver com argila". Trocado pra pigmentos de terra (sienna,
   ardósia, musgo, café) — mais saturados que um primeiro rascunho muito
   apagado que eu tinha testado internamente, mas sem entrar no
   território vívido/joia que foi rejeitado.
4. Pedido de transparência "igual widget da Apple" — testei
   `backdrop-filter: blur` nos cards. O Diego mandou uma imagem de
   referência (barra de navegação flutuante do iOS 18/"vidro líquido") e
   depois outra (painel de widgets do visionOS) dizendo "não só
   transparente" — a segunda imagem mostra um widget **sólido** e colorido
   do lado de um painel de vidro, então a correção real era sobre
   qualidade/peso do material, não sobre remover transparência.
5. Tentei "sólido com profundidade 3D" (gradiente + sombra, sem blur) —
   o Diego voltou: "quero transparentes, mas quero que pareça vidro e não
   só um pouco transparente". A causa raiz: meu vidro anterior estava
   sobre fundo liso (`--cream` só), sem nada de cor atrás pra realmente
   desfocar — lia como "opacidade baixa", não como vidro de verdade.
6. **Fechado**: vidro com receita completa — gradiente translúcido +
   `backdrop-blur` forte + saturação extra + borda clara visível + brilho
   interno no topo + sombra de dois níveis — **e manchas de gradiente
   coloridas fixas atrás do conteúdo**, especificamente pra dar ao vidro
   algo de verdade pra desfocar (sem isso o efeito não convence). Isso é
   suporte funcional do material escolhido, registrado no brief como tal
   — não é decoração solta, é o que faz "vidro" parecer vidro e não só
   uma superfície semi-transparente lisa. Confirmado: "isso melhorou,
   continue".

**Lição pra próximas sessões**: quando o pedido é sobre aparência visual
("moderno", "vidro", "cores"), mostrar mockup (`mcp__visualize__show_widget`,
fiel aos tokens reais do app) resolve mais rápido que descrever em texto
— o Diego corrigiu 3× uma leitura errada minha de pedidos anteriores só
olhando o resultado visual, coisa que não tinha acontecido com texto.

**Correções da fase CRITIQUE já aplicadas** (todas verificadas ao vivo no
preview, não só por esbuild — ver entrada de sessão abaixo pro detalhe
completo): fundo escurecido de modal/drawer que renderizava transparente
(P1), toggle de presença que não deslizava (P1), contraste do
`--ink-soft` abaixo do WCAG AA (P2), rolagem que não resetava ao trocar
de tela (P2), checkbox nativo fora do sistema de cores + fonte mono
divergente no `StatCard` (P3), mais rótulo acessível no botão hambúrguer,
na bolinha de RSVP e no `Toggle`.

**Histórico completo das 3 rodadas de direção visual e da causa raiz do
overflow mobile**: ver CLAUDE.md §6.1 e §8 (fonte de verdade permanente) —
não duplicado mais aqui pra essa seção não acumular texto desatualizado a
cada sessão (ela é sobrescrita, não é log). O log sessão-a-sessão completo
continua abaixo em "Histórico de sessões".

**Decisão do Diego:** o demo (`demo/AtelieDemo.jsx`) é oficialmente o
principal — ver CLAUDE.md §2. Next.js fica parado sem investimento até
pedido explícito. Preview local é permanente: `npm run preview:demo`
(porta 5183), pasta `preview/` versionada no repo, lê o demo direto sem
cópia.

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

---

### 2026-09-16 (continuação) — Causa raiz do overflow, redesign estrutural mobile-first, pivô visual Apple, e início do processo formal `/impeccable`

**Contexto:** sessão longa e contínua depois da entrada anterior. O Diego
confirmou com um screenshot de iPhone real que o corte ainda existia
mesmo depois das correções pontuais, e pediu explicitamente pra parar de
remendar e "pensar numa nova interface, primeiro pensando no mobile".
Isso levou a 4 desenvolvimentos sequenciais antes do pedido mais recente
(processo formal de redesign via `/impeccable`, que é a fase ativa agora
— ver "Fase atual" em "Onde continuar agora" no topo).

**1) Causa raiz real do overflow encontrada e corrigida.** Todas as
correções pontuais anteriores (grid de vagas, `Card`, `StatCard`,
containers de gráfico, depois `[&>*]:min-w-0` em ~19 grids) reduziam o
sintoma mas ele reaparecia em outra tela. Causa raiz: **uma linha só**,
`<div className="flex-1 pb-20 md:pb-0">` (wrapper de conteúdo do shell
flex do `AtelieDemo`) nunca tinha `min-w-0` — como item flex, o piso dele
era o maior min-content de QUALQUER tela do app, então corrigir uma tela
só empurrava o problema pra outra. Isso também explicava a barra de
navegação inferior sumindo (cálculo de `position: fixed` contra documento
mais largo que o viewport). Corrigido com uma linha; confirmado com
`scrollWidth === clientWidth` (375=375), não só screenshot. Detalhe
técnico completo e permanente: **CLAUDE.md §8**.

**2) Redesign estrutural mobile-first** (pedido explícito: card-grid de
pessoas vira lista de uma coluna, redundância entre chip de status e
botão de presença removida):
- **Turmas** (lista de vagas ocupadas): de grid de cards pra lista
  `divide-y` de uma coluna — avatar + nome + bolinha colorida (RSVP pra
  próxima aula, toggle com `toggleStatusAula`) + toggle switch real (
  `Toggle`, componente novo) pra "Marcar presença" (`marcarPresenca`,
  incrementa pacote, reversível — regra já fechada, não mexida). Corrigido
  depois de feedback do Diego com screenshot anotado: o checkbox antigo e
  o toggle faziam "o mesmo trabalho" visualmente — checkbox removido,
  bolinha nova assumiu só o RSVP, toggle assumiu só a presença de verdade.
  Badge de status (Pendente/Renovar) só aparece na exceção agora (antes
  duplicava a palavra "Confirmado" de um jeito que confundiu o Diego —
  perguntou 2x o que significava antes de eu esconder o badge no caso
  normal).
- **Oficinas** (lista de participantes): mesmo tratamento de lista
  aplicado no `OficinaDetalhe` (estava pendente desde a entrada anterior
  deste log, "próxima candidata óbvia" — feito nesta sessão).
- **Forno**: novo componente `TempGauge` — mostrador circular SVG
  (progress ring), reaproveitando a matemática de
  `src/components/ui/ProgressRing.tsx` (Next.js, já existia, só
  portado pro demo) — substitui o texto plano + barra linear de
  "Temperatura atual" no `FornadaAtivaPainel`. Pedido com referência
  visual (screenshot de um dial escuro circular).

**3) Segunda virada de direção visual: pivô "Apple".** Depois do redesign
MTCST-literal (v1) e da correção de acento (v2, ambos já documentados na
entrada anterior/CLAUDE.md §6.1), o Diego pediu via `/impeccable` "algo
parecido com Apple" — perguntei se era nível de acabamento ou estilo
visual mesmo, confirmou **estilo visual mesmo**. v3 (atual): cantos
arredondados e sombra suave de volta, tipografia trocada de mono-em-tudo
pra sans-serif (`-apple-system`/Inter; mono sobrevive só em leituras de
medição real — cronômetro do forno). Tokens e critério completo de onde
cada coisa se aplica: **CLAUDE.md §6.1** (reescrito nesta sessão pra
documentar as 3 rodadas como histórico deliberado, não como texto
substituído).

**4) Instalação correta do skill `/impeccable`.** A primeira tentativa
(`npx mdskills install pbakaus/impeccable`) só trouxe um `SKILL.md`
parcial, sem `scripts/`/`reference/`. Instalador correto, referenciado
dentro do próprio SKILL.md parcial: `npx impeccable install` (precisou
`echo "y" |` pra passar do prompt interativo `(Y/n)` que trava a ferramenta
Bash não-interativa). Instalação completa v4.3.1 em
`.claude/skills/impeccable/`, mais hooks `PostToolUse`/`Stop` em
`.claude/settings.local.json` (ambos gitignored — tooling, não código do
produto). Também limpou 2 inconsistências que o próprio skill sinalizou
via `craft-floor.md`: "🔥 Iniciar fornada" e "← Voltar" eram emoji/glyph
soltos inconsistentes com o resto do app (que usa só `lucide-react`) —
trocados por ícones de verdade (`Flame`).

**5) Pedido formal do Diego: redesign completo em 5 fases via
`/impeccable`** (INIT → CRITIQUE → SHAPE → CRAFT → POLISH), preservando
toda funcionalidade/dado existente. Brief completo com direção de produto
(app mobile de verdade, não site responsivo; VigaShoes + Apple como
referência sem copiar nenhuma literalmente; cor com inteligência, inclusive
identidade própria por turma/oficina; fugir de cara genérica/IA) e
princípios de arquitetura (leve, reutilizável, sem duplicação, sem lib
pesada desnecessária, estrutura fácil de crescer — inclusive pedido de
reorganizar em pastas "quando fizer sentido").
- **INIT**: `PRODUCT.md` criado (verdade de produto — usuários, propósito,
  posicionamento, contexto, capacidades/restrições, marca, princípios;
  **sem** direção visual, por desenho do próprio skill — isso é
  `DESIGN.md`, ainda não criado, nasce na fase SHAPE).
- Durante o INIT, identifiquei o conflito real entre "reorganizar em
  pastas" e a restrição de arquivo único (`demo/AtelieDemo.jsx` publicado
  como artifact do Claude.ai, sem bundler). Perguntei ao Diego antes de
  seguir pra fase CRAFT: **resposta — manter arquivo único**, organizar só
  por dentro (seções/componentes bem definidos, zero duplicação). Registrado
  no fim do `PRODUCT.md`.
- **CRITIQUE**: iniciada seguindo `critique.md` à risca — dois sub-agentes
  isolados (Assessment A qualitativa + Assessment B determinística).
  Assessment B concluiu de primeira (detector: 1 finding `overused-font`;
  overlay via navegador em 4 telas, achado real de contraste em
  `--ink-soft` ~3.7:1 abaixo do WCAG AA). Assessment A foi cortada no meio
  por rate limit do Diego (resolveu sozinho depois que o limite de uso
  dele resetou) e foi **relançada do zero como um sub-agente novo** — ver
  "Fase atual" no topo deste arquivo pro status mais atual; se o relatório
  final da fase CRITIQUE ainda não estiver em `.impeccable/critique/`
  numa sessão futura, essa fase não terminou, retomar por ali.

**Testes realizados:** `esbuild` a cada edição de UI (regra fixa do
projeto). Fix do overflow confirmado por medição JS
(`scrollWidth`/`clientWidth`), não só screenshot — ver CLAUDE.md §8 pro
porquê disso importar (a ferramenta de navegador desta sessão já mostrou
medidas inconsistentes antes). Redesign estrutural e pivô visual testados
via preview local (`localhost:5183`) e, em pelo menos uma rodada, direto
no celular real do Diego pela rede local.

**Decisões tomadas:**
- Arquivo único é definitivo pro redesign atual (não uma pendência em
  aberto) — ver PRODUCT.md.
- As 3 rodadas de direção visual não são indecisão — cada uma teve
  motivo próprio e ficou documentada como tal (CLAUDE.md §6.1), pra não
  reabrir a pergunta "qual estilo" sem necessidade numa sessão futura.

**Próximos passos:** ver "Onde continuar agora" no topo deste arquivo.

---

### 2026-09-16 (continuação) — Fase CRITIQUE concluída e os 5 achados corrigidos

**Contexto:** retomada depois do reset do limite de uso do Diego.
Relancei a Assessment A do zero como sub-agente novo (a tentativa anterior
não tinha produzido achado nenhum antes do rate limit cortar). Ela voltou
com um relatório completo e bem verificado (leu o arquivo inteiro, testou
ao vivo no preview a 375px, descartou 2 suspeitas de bug que eram artefato
de timing da própria ferramenta de automação antes de reportar as que se
confirmaram — mesma disciplina que o CLAUDE.md §8 pede).

**Síntese das duas avaliações**, entregue no chat seguindo o formato do
`critique.md` (tabela de heurísticas, veredito de especificidade, 5
prioridades P1-P3, personas, observações menores) e persistida em
`.impeccable/critique/2026-09-16T18-34-43Z__demo-ateliedemo-jsx.md`
(23/40 no Design Health Score — "Aceitável"). Achado central: o Forno
(`TempGauge`, `calcularPrevisao`, seleção de conteúdo) é genuinamente
autoral; fora dele, Turmas/Oficinas/Pagamentos/Alunos são o mesmo padrão
"avatar + nome + badge" indistinguível de um CRM genérico — isso vira o
ponto de partida da fase SHAPE.

**Uma correção de leitura própria durante a síntese**: a Assessment A leu
o bloco "Tipografia: duas fontes" do CLAUDE.md §6.1 (na época ainda
descrevendo a v1/v2 — mono em tudo + Space Grotesk nos títulos) e
concluiu que o código (`--font-display` igual a `--font-sans`, sem
segunda família) não implementava o que o CLAUDE.md dizia ser a v3. Não
era isso — o bloco em si estava desatualizado (eu tinha reescrito só o
resumo "Estado atual" da mesma seção antes, não as regras detalhadas
embaixo). Identifiquei e corrigi essa contradição interna do CLAUDE.md
durante a limpeza abaixo, independente da decisão de tipografia em si.

**As 3 perguntas de fechamento e as respostas do Diego:**
1. Corrigir os 5 problemas priorizados agora (não só os 2 P1, nem adiar
   tudo pra fase SHAPE) — **"Corrigir tudo (P1 a P3) agora."**
2. Manter tipografia única ou reintroduzir uma segunda família pros
   títulos — respondeu **"Manter uma família só"** na pergunta
   estruturada, mas **poucos minutos depois, no chat, corrigiu**: "pode
   deixar com 2 fontes msm". A resposta que valeu foi a segunda —
   registrei isso explicitamente no CLAUDE.md e no topo deste arquivo
   pra não se perder numa sessão futura que só olhe a primeira resposta.
3. Incluir os achados de acessibilidade da persona Sam no escopo —
   **"Sim, pode incluir... desde que sejam ajustes pontuais e não alterem
   a direção visual nem deixem a interface mais carregada."** Tratado
   como restrição de escopo, não como pedido de auditoria completa.

**O que foi feito** (todos os 5 problemas priorizados + os itens
pontuais de acessibilidade, nesta ordem de prioridade do relatório):
- **[P1] Fundo escurecido de modal/drawer transparente**: `bg-[var(--ink)]/40`
  e `/30` resolviam pra `rgba(0,0,0,0)` porque o modificador de opacidade
  do Tailwind não combina com custom property em string hex — trocado
  por `bg-black/40`/`bg-black/30` (`Modal` e o drawer mobile). Confirmado
  via `getComputedStyle` no navegador: `rgba(0, 0, 0, 0.4)` agora.
- **[P1] Toggle de presença sem deslizar**: a bolinha não tinha
  `left`/`right`, só `top-0.5` — ancorada em `left-0.5` e as classes de
  translação trocadas pra `translate-x-0`/`translate-x-5` (20px de
  percurso, bate exato com `w-11` de trilha menos `w-5` de bolinha menos
  padding dos dois lados). Confirmado clicando de verdade no preview e
  lendo `transform` computado antes/depois (`matrix(1,0,0,1,0,0)` →
  `matrix(1,0,0,1,20,0)`).
- **[P2] Contraste do `--ink-soft`**: escurecido de `#8A8479` (~3.3-3.7:1)
  pra `#6B655C` (~5.1:1 contra `--cream`, ~5.8:1 contra branco — cálculo
  de luminância relativa, não estimativa). Como é só texto/borda em todo
  o arquivo (conferido por busca — nenhum uso como fundo sólido), o
  escurecimento não quebra nenhum outro lugar.
- **[P2] Rolagem não resetava ao trocar de tela**: `window.scrollTo(0, 0)`
  adicionado nos 3 pontos que mudam `tela` (`ir()`, `abrirNovaFornada`,
  `iniciarFornada`). Confirmado no navegador: rolar a página, trocar de
  aba, `scrollY` volta a 0.
- **[P3] Checkbox nativo "Ver como aluno"**: virou um botão
  `role="checkbox"`/`aria-checked` com quadradinho no mesmo padrão visual
  do check de seleção do Nova Fornada (accent + ícone `Check`), em vez do
  checkbox azul padrão do navegador. Confirmado clicando via JS: estado e
  aparência alternam certo.
- **[P3] Fonte mono divergente no `StatCard`**: `font-mono` genérico
  (cai na mono do sistema operacional) trocado por
  `font-[family-name:var(--font-mono)]` (o token do projeto), igual já
  era feito em `KilnMiniCard`/observações do forno.
- **Acessibilidade pontual** (escopo definido pelo Diego, sem mudar
  direção visual): `aria-label` no botão hambúrguer mobile (não tinha
  nome acessível nenhum), na bolinha de RSVP (`toggleStatusAula`,
  espelhando o `title` já existente) e no `Toggle` (idem).
- **Tipografia — decisão revertida em tempo real**: reintroduzida a
  segunda família (`Space Grotesk`, pesos 500/600/700, adicionada ao
  `@import` do Google Fonts) pros títulos grandes de página via
  `--font-display: 'Space Grotesk', var(--font-sans)` — só esse token
  mudou, `FONT_DISPLAY`/`style={FONT_DISPLAY}` já existiam nos 9 `<h1>`
  de tela e não precisaram de nenhuma edição. Confirmado via
  `getComputedStyle` no `<h1>` ao vivo.
- **CLAUDE.md §6.1 corrigido** pra descrever o sistema de 3 papéis
  tipográficos certo pra v3 (Inter no corpo sem maiúsculo/tracking,
  Space Grotesk só nos títulos, mono só em medição real — não o par
  antigo "mono em tudo + Space Grotesk" da v1/v2), o token `--ink-soft`
  atualizado com o novo valor e o motivo, e cantos
  arredondados/sombra suave documentados como regra v3 (a regra antiga
  de "cantos retos em tudo, sem sombra no fluxo" também estava
  desatualizada, mesmo bug de documentação). **Nova armadilha em §8**:
  nunca combinar `bg-[var(--token)]` com modificador de opacidade
  Tailwind quando o token é hex string — é exatamente o bug do P1 acima,
  documentado pra não se repetir num modal novo.

**Testes realizados:** `esbuild` depois de cada edição (limpo, sem
erro). Todas as mudanças visuais/comportamentais confirmadas ao vivo no
preview (`localhost:5183`, já rodando de antes na sessão) via
`getComputedStyle`/`getBoundingClientRect`/clique real simulado por JS —
não só screenshot, seguindo a lição do CLAUDE.md §8. Um teste inicial do
toggle deu leitura inconsistente (posição igual antes/depois) — repetido
com uma abordagem mais direta (ler `transform` computado em vez de só
`getBoundingClientRect`) e confirmou que o fix funciona; ficou registrado
aqui como mais um caso da instabilidade de medição já conhecida desta
sessão, não um bug real do toggle.

**Problemas pendentes:** nenhum dos 5 da CRITIQUE. Backlog não afetado
(Área do Aluno, Notificações, Reposições — ver fim deste arquivo).

**Próximos passos:** iniciar a fase SHAPE — repensar nav/home/lista de
turma/detalhe/participantes/estados/ações com identidade própria MTCST,
endereçando o veredito central da CRITIQUE (telas fora do Forno parecem
CRM genérico) e o sistema de cor de identidade por turma/oficina pedido
no brief original. Ver "Onde continuar agora" no topo deste arquivo.

---

### 2026-09-16 (continuação) — Correção de fato: o nome da dona do ateliê é Hanna, não Camila

**Contexto:** o Diego corrigiu no chat, sem mais explicação: "uma correção
não existe Camila, o nome é Hanna". "Camila" vinha do pacote de handoff
original (`COMECE-AQUI.md`/`CONTEXTO.md`, de antes desta sessão) e tinha
sido repetido em todo lugar que descreve a dona do ateliê desde então —
era informação errada desde o início do projeto, não uma mudança de
decisão.

**O que foi corrigido** (toda menção à dona do ateliê como pessoa real,
não dado fictício de demo): `CLAUDE.md` (§1 "dona do ateliê", §1 "quem
vai usar no dia a dia", §6 exemplo "Nada de 'Olá, X'"), `PRODUCT.md`
(Users, Product Purpose, Positioning, Operating Context, Brand
Commitments — 7 ocorrências), `CONTEXTO.md` (mesmo exemplo de header do
CLAUDE.md — mantido em sincronia por ainda circular como cópia do
mesmo conteúdo), `demo/AtelieDemo.jsx` (avatar da sidebar desktop, era
`nome="Camila Rodrigues"`, virou `nome="Hanna"`), e no lado Next.js
pausado (`src/app/(admin)/layout.tsx` `userName`, `dashboard/page.tsx`
`nomeAdmin`) — corrigido mesmo pausado, pra não deixar um dado errado
esperando confundir uma sessão futura.

**O que NÃO foi mexido, de propósito**: a participante fictícia de
oficina "Camila Rocha" (dado de demo, não a dona) e o relatório já
persistido da fase CRITIQUE (`.impeccable/critique/...md`) — é um
retrato congelado do que foi avaliado naquele momento, com a informação
que existia então; reescrever citações dentro dele seria adulterar um
registro, não corrigir um fato vivo.

**Pendência:** o avatar da Hanna no app hoje é só o primeiro nome —
`Avatar` tira iniciais de até 2 palavras (`nome.split(" ").slice(0,2)`),
então "Hanna" sozinho vira só "H" (1 letra), diferente de todos os
outros avatares do app (2 letras). Perguntei o sobrenome pro Diego no
chat; se ele responder, é só trocar a string na linha do `Avatar` da
sidebar — 1 linha, nenhum outro impacto.

**Testes realizados:** `esbuild` depois da leva de edições — limpo.

**Próximos passos:** confirmar sobrenome da Hanna (opcional, cosmético) e
seguir com a fase SHAPE — ver acima.

---

### 2026-09-17 (continuação) — Fase CRAFT: primeira leva implementada

Implementei o brief da fase SHAPE (`.impeccable/surfaces/demo-ateliedemo-jsx.md`)
em `demo/AtelieDemo.jsx`, validando com `esbuild` a cada edição e testando
ao vivo no preview (`localhost:5183`, tive que reiniciar o servidor Vite —
tinha caído em algum ponto da sessão) em viewport mobile (375px) antes de
considerar concluído.

**Fundação (tokens + helpers, perto de `TURMAS_DIAS`):**
- 4 tokens CSS novos, RGB space-separated de propósito (`--turma-sienna-rgb`
  etc.) — **não** string hex, pra não cair de novo na armadilha do §8
  sobre `/NN` de opacidade não combinar com token hex.
- `CORES_IDENTIDADE`/`CORES_ORDEM`/`TURMA_COR`/`TURMA_LABEL_COR`: mapa
  fixo turma→cor pelas 4 turmas reais (`ter-1830` etc., conferido no
  código, não pela memória), mais um mapa paralelo por rótulo-texto pro
  cadastro de aluno, que só tem o texto "Terça 18:30" etc., não o id.
- `corOficina(oficina)`: hash simples do `id` da oficina % 4 — determinístico,
  sem precisar salvar a cor em lugar nenhum.
- **Decisão técnica importante**: a cor é aplicada via `style={{}}` inline
  (RGB calculado em JS), não via classe Tailwind dinâmica
  (`` `bg-[rgb(var(--turma-${cor}-rgb))]` ``) — o JIT do Tailwind via CDN só
  gera CSS pra classes **literais** presentes no código-fonte; uma string
  montada em runtime não é confiável. Só a "receita" estrutural do vidro
  (`backdrop-blur-2xl`, `backdrop-saturate-150`, `bg-gradient-to-b
  from-white/65 to-white/30` etc.) usa classe Tailwind normal, porque essa
  parte é sempre a mesma string literal, só a cor de tingimento varia.
- `ProgressRing`: `TempGauge` generalizado (mesmo SVG/matemática), agora
  aceita `color`/`trackColor`/`children` em vez de temperatura hardcoded.
  Forno (`FornadaAtivaPainel`) foi migrado pra usar `ProgressRing` direto
  com `--accent`, preservando exatamente o visual/comportamento anterior —
  `TempGauge` não existe mais, sem duplicação.
- `VIDRO_CARD`/`VIDRO_PILL`: classes Tailwind compartilhadas pra não
  repetir a receita de vidro (blur+saturação+brilho+sombra) em cada tela.
- `ManchasFundo`: 3 blobs de gradiente desfocados (`blur-3xl`), `position:
  fixed`, `pointer-events-none`, renderizados uma vez no shell raiz —
  é o que dá ao vidro algo de verdade pra desfocar (sem isso o efeito não
  lê como vidro, confirmado nos mockups da fase SHAPE).

**Por tela:**
- **Turmas**: descobri ao ler o código (antes de implementar às cegas)
  que a estrutura real não é um "4 pills sempre visíveis" como no mockup —
  é abas de **dia** (Ter/Qua/Qui) + pills de **hora só aparecem quinta**
  (2 turmas), regra de negócio já fechada no CLAUDE.md §5. Adaptei: chip
  de identidade no card "Detalhes da turma" (sempre visível, todo dia),
  pills de hora tingidas quando aparecem (quinta), anel de progresso em
  cada aluno da lista (substituindo "X/4 aulas" solto), card da lista em
  vidro. Testado nos 2 casos (dia com 1 turma e quinta com 2) — cor muda
  corretamente junto com a turma ativa.
- **Oficinas** (lista de oficinas, tela que eu tinha subestimado no brief
  original): a barra de progresso reta (`ocupadas/vagas`) virou
  `ProgressRing` — é a mesma métrica de fração-até-completar do resto do
  app, fazia sentido incluir mesmo não estando no brief original. Chip de
  identidade + card em vidro.
- **OficinaDetalhe** (participantes): chip de identidade no cabeçalho,
  card da lista em vidro, **sem anel** (decisão do brief — pago/pendente
  não é fração, forçar anel ali seria decoração sem dado real).
- **Alunos**: mudei o formato do campo `pacote` de string pré-formatada
  (`"0/4 aulas"`) pra `{ aula, total }` estruturado — só assim dá pra
  alimentar o `ProgressRing` sem parsear string. Lista começa vazia (regra
  de negócio intacta, não mexida); testei cadastrando um aluno de teste
  ao vivo no preview e confirmei que o anel nasce em 0% corretamente.
  `ALUNOS` (a constante mock no topo do arquivo) é código morto — nunca
  foi referenciada em lugar nenhum, não mexi nela.
- **Pagamentos**: cards em vidro (lista de pendentes + histórico); **sem**
  chip de identidade — os registros de pagamento não têm campo de turma
  (só `tipo`: "Pacote 4 aulas"/"Aula avulsa"), e inventar esse campo
  seria inventar dado, contra o próprio brief. StatCards (Pendente/
  Recebido/Alunos/Ticket médio) não mudaram — não são "lista de pessoas",
  fora do escopo do brief.
- **Nav mobile**: virou uma pílula flutuante de vidro (antes era uma barra
  reta colada nas bordas, quase opaca) — item ativo em `--accent` sólido
  arredondado, resto em texto neutro sobre o vidro. Testado navegando
  entre 5 telas diferentes, sem quebrar.

**O que ficou de fora deste CRAFT** (não pedido pelo brief, não mexido):
Dashboard, Forno, sidebar desktop, drawer mobile — nenhum ganhou vidro.

**Testes realizados:** `esbuild` depois de cada edição (todas limpas).
Testado ao vivo em `localhost:5183`, viewport mobile 375px: Turmas (dia
único e quinta com 2 turmas), Oficinas (lista + detalhe), Alunos
(cadastro real de teste), Pagamentos, nav flutuante em 5 telas. Conferido
`backdrop-filter` computado de verdade via `getComputedStyle` (não só
visual) — `blur(40px) saturate(1.5)` aplicando corretamente (Tailwind CDN
JIT reconhece `backdrop-blur-2xl`/`backdrop-saturate-150` sem problema,
uma incerteza que o próprio brief tinha marcado como "verificar na
prática"). `scrollWidth === clientWidth` (375=375, sem overflow). 2 erros
de HMR no console eram de um momento anterior da sessão (confirmado via
`curl` direto no servidor: HTTP 200 em tudo, nada quebrado agora).

**Problemas pendentes:** nenhum encontrado nesta leva. Sobrenome da Hanna
ainda não veio do Diego (cosmético, avatar da sidebar mostra só "H").

**Próximos passos:** revisar com o Diego (testar no preview/celular real),
depois fase POLISH — tipografia/espaçamento/estados/contraste fina, ou
CRAFT de continuação se ele quiser o mesmo tratamento em mais lugares
(Dashboard, sidebar) antes de fechar a fase.
