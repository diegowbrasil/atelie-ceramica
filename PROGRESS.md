# PROGRESS.md — Histórico vivo do projeto

> Leia [`CLAUDE.md`](CLAUDE.md) primeiro (contexto permanente). Este arquivo é
> o log de andamento — atualize a cada alteração relevante, sem apagar
> histórico antigo. A seção "Onde continuar agora" no topo é a única que é
> **sobrescrita** a cada atualização; o resto do arquivo só cresce.

---

## Onde continuar agora

**Sessão mais recente: 2026-09-24/25, ainda em andamento, NADA commitado**
— a maior leva do projeto até agora, numa sessão só: os 7 domínios admin
(Turmas, Avisos, Alunos, Pagamentos, Solicitações, Oficinas, Forno) +
Dashboard todos ligados a dados reais do Supabase (não só `tsc` limpo,
testado ao vivo tela por tela); 5ª turma real criada (Segunda-feira
09:30–11:30, nova cor de identidade "ocre", com foto de fundo própria);
Área do Aluno construída do zero e testada de ponta a ponta (convite por
telefone → definir senha → login automático → Início/Turmas/solicitar
vaga/Oficinas/Sair → logar de novo só com telefone), incluindo um pivô
real de arquitetura no meio do caminho (o provider nativo de Phone do
Supabase exige Twilio configurado até só pra senha — contornado com
e-mail sintético derivado do telefone, zero config no painel); e por
último (2026-09-25) o Início da Área do Aluno reenquadrado como "Minha
Turma" (turma + painel de pacote num card só, sempre só o dado do
próprio aluno, com estado vazio pra quem não tem turma) a pedido
explícito do Diego, verificado com um aluno de teste descartável
vinculado à turma real "Terça 18:30". Resumo condensado e sempre-atual
de tudo isso já vive em `CLAUDE.md` §2B — mais curto que reler o
histórico linha a linha aqui. Detalhe passo a passo nas entradas
"2026-09-24"/"2026-09-25" do Histórico de sessões, no fim deste arquivo.
Working tree tem TODAS essas mudanças soltas — perguntar ao Diego antes
de commitar (padrão do projeto, ver §7 do CLAUDE.md).

**Atualização dentro da mesma sessão**: tudo acima foi commitado
(`7f68680`) depois que o Diego perguntou "oq seria commitado?" e
confirmou. Depois do commit, mais uma leva: Início ganhou uma 4ª aba
"Histórico" (aulas + pagamentos do próprio aluno — achado no caminho:
`aulas`/`presencas` já vinham sendo gravadas de verdade desde 24/09,
só não tinham tela nenhuma que lesse isso). Essa leva **ainda não foi
commitada**. Detalhe completo na entrada "Mesma sessão, logo em
seguida" dentro de "2026-09-25" no Histórico de sessões.

**Pendências do lado do Diego** (nada bloqueando mais trabalho meu):
2 patches de RLS — `fix-profiles-delete-policy.sql` (`profiles` sem
policy de `delete`; última confirmação registrada era "enviado, ainda
não aplicado", vale confirmar) e `add-solicitacao-aluno-delete-policy.sql`
(novo, 2026-09-25 — sem ele, "Cancelar" solicitação na Área do Aluno
não funciona de verdade, só mostra erro claro em vez de fingir sucesso).
Fora isso, só restam as Fases 11/12 do plano (deploy real na Vercel +
PWA instalável), explicitamente adiadas.

<details>
<summary>Histórico mais antigo desta seção (sessões até 2026-09-22, mantido por referência)</summary>

**Sessão anterior: 2026-09-20/21 — migração Next.js + PWA, Fases 1-10
completas (fundação técnica + as 7 telas principais), tudo commitado em
`34751af`.** Depois de fechar a auditoria de autonomia (2026-09-18, ver
item 23 abaixo), o Diego voltou à pergunta de colocar o app "na
appstore" — ao saber do custo/Mac exigido pelo caminho nativo, decidiu
ir de **PWA** ("Adicionar à tela inicial", sem loja, sem taxa,
instalável no Android e iPhone). Isso exige um site publicado em HTTPS
de verdade, o que só o projeto Next.js+Supabase pode ser (o demo é
artifact do Claude.ai, sem domínio próprio) — plano completo de
migração aprovado (12 fases, ver
`C:\Users\Usuario\.claude\plans\zippy-frolicking-token.md`), Capacitor/
lojas nativas explicitamente fora de escopo por decisão do Diego.

**Fase 1 (fundação técnica) concluída**, sem tocar em nenhuma tela ainda
nessa etapa:
- Paleta do demo portada pro `tailwind.config.ts`/`globals.css`
  (tokens `cream`/`ink`/`accent`/identidade de turma, com suporte nativo
  a `/opacidade` do Tailwind) — os 16 arquivos que usavam a paleta antiga
  (`paper`/`clay`/`glaze`/`ink-50..900`) foram todos atualizados, dark
  mode morto removido (nunca teve toggle). Fontes trocadas pra
  `next/font/google` real: Bebas Neue + Space Grotesk + Inter + IBM Plex
  Mono, mesmos papéis semânticos do demo.
- Sidebar estreitada pra bater com a regra já registrada (§6, "não
  alargar"), logo virou o wordmark "MTCST" (mesma lógica do `LogoMark`
  do demo — nunca mais imagem).
- Componentes que faltavam criados: `Modal`, `Toggle`, `StatCard`.
- Schema estendido com `pagamentos` e `avisos` (+ RLS); `database.ts`
  agora tipa as 13 tabelas (antes só 6).
- **Ícone do PWA — achado um bug real do `next/og` no Windows** (path
  com espaço em "APP MTCST" quebra o carregamento de fonte do
  `ImageResponse`, mesmo sem nenhum texto na árvore e mesmo fornecendo
  fonte própria — ver detalhe técnico no item novo do Histórico de
  sessões). Resolvido com um SVG estático (`public/icon.svg`, a
  silhueta do vaso) em vez de gerado — nunca depende de fonte, funciona
  em qualquer ambiente. `manifest.json` corrigido (nome "MTCST", cores
  certas, ícone que existe de verdade).
- **`npm audit` — só os fixes seguros (sem major) aplicados**: `next`
  14.2.5→14.2.35, `@supabase/supabase-js`/`ssr`, `vite` (usado só pelo
  preview do demo). **Achado importante, ainda pendente de decisão do
  Diego**: mesmo em 14.2.35, a linha inteira do Next 14 tem 2
  vulnerabilidades CRÍTICAS sem patch dentro do major
  (`GHSA-p293-qw3h-jr36` RCE não-autenticado em servidor Windows,
  `GHSA-2xp9-vwfh-vxw4` RCE via AVIF no Image Optimization API) — só
  fecham de verdade com Next ≥15.5.24. Upgrade de major fica pra decidir
  com calma antes da Fase 11 (deploy real), não forçado aqui (pode
  quebrar o App Router, CLAUDE.md já sinalizava essa cautela). Ver
  próxima sessão.
- Verificado ao vivo: Dashboard/Turmas/Forno/Login rodando sem erro de
  console em `localhost:3000` (aba nova a cada checagem, não reaproveitei
  abas com erro antigo em cache).

**Fases 2-10 (reconstrução das 7 telas) concluídas na mesma sessão**,
cada uma trazida pro visual/comportamento real do demo (referência de
comportamento, schema como referência de dados — regra do CLAUDE.md §2B):
- **Forno**: gráfico antigo removido, 2 fornos com brilho incandescente
  real conforme temperatura, config/etapas/presets reais.
- **Turmas**: roster real das 4 turmas movido pra `src/lib/
  vagasPorTurma.ts` (fonte compartilhada com Pagamentos), presença/
  pacote funcionais.
- **Dashboard**: KPIs calculados de verdade (não mais fixos), 2
  `FornoResumoCard`, `AgendaSemanaCard` real, "Próximas oficinas" real.
- **Oficinas**: lista + detalhe, `ModalOficina` (criar/editar). Achado
  real: exportar um componente extra de dentro de um `page.tsx` quebra
  a validação de rotas do Next.js (`.next/types` reclama). Corrigido
  extraindo pra `src/components/oficinas/ModalOficina.tsx`. **Lição pra
  próximas telas**: nunca exportar componente extra de um `page.tsx`,
  sempre extrair pra `src/components/`.
- **Alunos**: roster real (46 pessoas — 14+11+10+11, confirmado ao
  vivo), busca, acordeão por turma, detalhe editável, ações rápidas de
  pagamento.
- **Pagamentos**: StatCards, busca, 14 pendentes reais (derivados do
  roster via `pagamentosIniciais(vagasPorTurma)`), "Marcar como pago"
  reativo, `src/lib/whatsapp.ts` com o bug do "R$ null" já corrigido.
- **Solicitações**: mock de 3 (nunca fez parte da leva de dados reais),
  "Aprovar" insere de verdade na vaga livre da turma certa, "Recusar"
  remove da lista.

`tsc --noEmit` limpo (só o erro pré-existente do `login/page.tsx`, não
relacionado a esta leva). Verificado ao vivo no navegador embutido,
viewport desktop, sem erro de console. **Nenhuma tela testada ainda no
celular real do Diego.**

**Tudo commitado em `34751af`** ("Migrate Next.js app to demo's visual
system and rebuild all 7 core screens", 44 arquivos) — working tree
limpo.

**Próximos passos, nessa ordem:**
1. Pedir pro Diego testar as 7 telas no celular real antes de considerar
   essa leva "pronta" de verdade (padrão do projeto: cliente testa e
   reporta por screenshot, espaçamento/largura é o que ele mais nota —
   CLAUDE.md §8).
2. Decisão do Diego sobre o upgrade de major do Next.js (2 CVEs
   críticos sem patch no Next 14, ver bullet do `npm audit` acima) — não
   bloqueia o app em dev, mas bloqueia a Fase 11 (deploy real).
3. Fase 0 (ação do próprio Diego, pode ser feita em paralelo a qualquer
   momento): criar contas Supabase + Vercel.
4. Fase 11: conectar Supabase de verdade — substitui todo `useState`
   local por queries reais, dissolve a limitação de cada rota ter sua
   própria cópia do roster (ex: marcar um pagamento em Pagamentos não
   reflete em Turmas até recarregar — mesma limitação aceita
   conscientemente nas 7 telas até aqui).
5. Fase 12: confirmar instalação PWA num Android e um iPhone reais.

Resumo da sessão anterior (2026-09-18), pra contexto: retomada do app
principal (arrastar-e-soltar de Turmas ganhou mais 2 rounds de correção
real-device — item 21/22), `AlunoDetalhe` virou editável de verdade
(turma/pacote/pagamento/excluir), e depois uma auditoria completa de
"autonomia" pedida pelo Diego resultou em Solicitações/Pagamentos/
Oficinas/Forno todos ganhando ações que antes só pareciam funcionar mas
não persistiam nada — mais uma seção nova de "Avisos" fixados no
Dashboard (3 rodadas de redesenho visual no mesmo dia). Tudo isso
commitado até `ce2b064`.

O redesign formal completo em 5 fases (INIT → CRITIQUE → SHAPE → CRAFT →
POLISH) via `/impeccable` **está concluído** — ver "Fase atual" abaixo
pro detalhe completo de cada fase. **Área do Aluno continua começada e
pausada no meio** (ver backlog no fim desta seção) — o Diego pediu
explicitamente pra pausar isso e voltar pro app principal em 2026-09-18
("continue de onde parou, voltando ao app principal, nao a tela do
aluno"), não é uma pendência esquecida, foi decisão dele. Ainda não
retomada; não deixar o usuário achar que está pronta.

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
11. **O Diego resolveu ao vivo quase todas as pendências do item 10**,
    numa sequência rápida de mensagens curtas: regra de 12 vagas
    destravada (Vivian/Cris entraram em Terça, 14/12), `ALUNOS_REAIS`
    criado e populado (46 pessoas únicas, dedup de Marina/Elisabeth que
    apareciam 2× por reposição, "Camila" desambiguada em duas pessoas
    reais diferentes), pagamentos pendentes reais entrando em Pagamentos
    (`pagamentosIniciais()` agora deriva de `VAGAS_POR_TURMA`), os 4 KPIs
    do Dashboard recalculados a partir do dado real, card "Pacotes
    terminando" removido do painel principal, e os textos "Painel geral"
    + "· dados de demonstração" removidos dos headers. Fica só o
    histórico de presença datado de verdade como pendência real (não é
    falta de dado, é feature que ainda não existe) — ver CLAUDE.md §5.
12. **Cabeçalho mobile, logo e tipografia de título — mini-saga na mesma
    sessão**: o Diego pediu o fundo "carvão" no cabeçalho com o logo
    branco; a primeira tentativa de deixar o logo (imagem PNG) branco via
    `filter: invert()` expôs um bug real de transparência que já existia
    sem ninguém notar (a imagem virava um bloco branco sólido, não as
    letras — Pillow perdendo o canal alpha na quantização, detalhe em
    CLAUDE.md §8). Depois de tentar reprocessar a imagem correndo atrás
    do alpha (sem sucesso confiável — PIL e o navegador discordavam sobre
    o mesmo arquivo), o Diego identificou a fonte de verdade do logo
    ("Bebas Neue") e pediu pra refazer como texto — resolveu o problema
    pela raiz. `LogoMark` virou um `<span>` de texto, `LOGO_MTCST_SRC`
    (a imagem base64) foi removida, e Bebas Neue virou a fonte de todos
    os títulos de página (`--font-display`), não só do logo. Também
    corrigido no caminho: formato do cabeçalho (pílula flutuante →
    voltou pro retangular original, só o fundo mudou), "borda lateral"
    no fundo com foto de Turmas/Oficinas (técnica de full-bleed
    incompatível com a sidebar do desktop), e uma "puladinha" no scroll
    do parallax (`position:absolute` competindo com o próprio scroll
    nativo da página — virou `position:fixed`, única fonte de
    movimento). Detalhe técnico completo em CLAUDE.md §5 (parallax) e §6
    (logo/tipografia/cabeçalho).
13. **Contraste do logo reforçado com sombra + segunda rodada de ajustes
    no cabeçalho** — mesmo texto "MTCST" difícil de ler mesmo já sendo
    texto de verdade (a foto atrás varia demais pra confiar só na cor
    branca); `textShadow`/`drop-shadow` escuros garantem contraste
    independente de qual parte da foto cai atrás. Na sequência, 4 pedidos
    numa mensagem só: altura do cabeçalho dobrada, hambúrguer removido
    (redundante com "Mais" na nav inferior — layout virou grid de 3
    colunas pra manter o logo centralizado sem o ícone), foto do
    cabeçalho trocada por uma nova dedicada (mais escura, só pra essa
    barra — não mexeu na foto "carvão" usada em Oficinas/Sábado), logo
    aumentado. Detalhe técnico em CLAUDE.md §6.
14. **Fechamento do cabeçalho (pílula de vidro de volta + logo) + achado
    generalizado de contraste + brilho do forno por temperatura + borda
    de identidade na lista de Turmas** — leva grande, tudo verificado ao
    vivo (esbuild + screenshot/computed style) e detalhado em CLAUDE.md
    §5/§6:
    - Cabeçalho voltou a ser pílula flutuante de vidro (o Diego reabriu
      essa direção de novo, agora sobre fundo branco — "esse cabeçalho
      ainda nao ficou bom, deixe ele como uma pilula flutuante..."), e o
      texto "MTCST" passou por 2 rodadas de ajuste (transparência
      rejeitada por ler cinza → gradiente escuro com `background-clip:
      text`; depois "mais preto com borda de vidro" — 2 tentativas de
      contorno rejeitadas/pioradas antes da que funcionou,
      `filter:drop-shadow` em vez de `text-stroke`/pilha de
      `text-shadow`). Ver CLAUDE.md §6 pro histórico completo das
      tentativas (vale ler se pedirem pra mexer no logo de novo — já
      sabemos 2 caminhos que não funcionam).
    - **Achado generalizado**: as abas Qua/Qui de Turmas tinham texto de
      baixo contraste (mesma cor do fundo tingido) — corrigido, e o Diego
      generalizou na hora: "a msm regra vale para os outros botoes q
      estiverem coloridos". Causa raiz era `estiloVidroTingido()`, função
      central usada por abas do forno, pill de horário, chip de dia,
      status de oficina — corrigida na função (texto branco + sombra por
      padrão), não em cada botão. CLAUDE.md §6.
    - **Card do forno (Dashboard) ganhou brilho ao redor conforme a
      temperatura real** — incandescente (vermelho→laranja→amarelo) acima
      de 250°C, azul e discreto abaixo disso ou sem fornada ativa. 3
      mensagens curtas em sequência definindo a regra final (cor
      incandescente → forno frio/desligado em azul com menos efeito →
      limiar exato de 250°C). CLAUDE.md §5, bullet do Dashboard.
    - **Lista de alunos de Turmas ganhou contorno na cor de identidade da
      turma ativa** (sienna/ardósia/musgo/café conforme a aba), a partir
      de um exemplo visual que o Diego montou com uma seta. **Pendente,
      mesmo pedido**: aluno "provisório" numa turma que não é a dele
      deveria mostrar a borda da turma de ORIGEM — não dá pra construir
      ainda, não existe esse dado (mesmo pré-requisito do recurso de
      mover aluno entre turmas, ver item de pendências abaixo).
      CLAUDE.md §5.
15. **Títulos de Oficinas/Turmas/Forno centralizados + subtítulos
    removidos, e "Próximas oficinas" ganhou o fundo foto do card de
    Sábado** — pedido rápido em 2 mensagens: primeiro pediu o card mais
    pra cima no Dashboard, minutos depois voltou atrás só na posição
    ("deixe no lugar q estava, porem mantenha a modificação do fundo") —
    o fundo ficou, a posição (ao lado de "Solicitações pendentes", no
    fim da página) é a original. Detalhe técnico (a centralização do
    título não é trivial com um botão assimétrico do lado — solução via
    `absolute` + `translate`, verificado por `getBoundingClientRect`) em
    CLAUDE.md §6.
16. **Página de detalhe do aluno + mover/remover aluno entre turmas com
    arrastar-e-soltar de verdade** — retomou os 2 pedidos que ficavam
    pendentes desde o item 10/14 ("continue a parte dos alunos"). Lift de
    `vagasPorTurma` pro componente raiz (mesmo padrão de
    `fornadas`/`oficinas`), tela nova `AlunoDetalhe` (aberta a partir de
    Turmas OU Alunos), e uma feature de arraste construída do zero com
    Pointer Events (sem lib, HTML5 `draggable` nativo é fraco em toque) —
    o Diego pediu drag de verdade depois que eu tinha proposto só um
    botão+modal por achar que arrastar não encaixava num ambiente sem
    lib: "nao tem como fazer isso?". Muitas rodadas de refinamento ao
    vivo na mesma sessão (fantasma vira vidro translúcido, pills de
    Quinta revelam sub-horários ao pairar, animação de "afunilar" ao
    soltar que termina do tamanho do pill, card encolhe/pill cresce
    continuamente durante o arraste — não só ao soltar, faixas laterais
    viraram zona de remover com confirmação, rede de segurança pra
    ponteiro saindo da janela). Detalhe técnico completo — vale ler antes
    de mexer nessa área de novo — em CLAUDE.md §5 (Turmas: "arrastar e
    soltar de verdade — saga completa"; Alunos: resumo da arquitetura da
    página de detalhe).
17. **Bug real do arraste, achado testando no celular de verdade
    (2026-09-18)** — tudo do item 16 tinha sido validado só com mouse
    simulado no navegador embutido; no celular real o card não encolhia
    ao pairar sobre uma turma e não interagia com os horários de Quinta.
    Causa raiz e correção (trocar a detecção de colisão por
    `document.elementFromPoint` em vez de comparar retângulos manuais —
    mais robusto, ignora o fantasma de graça, não depende de vencer
    z-index entre `position:fixed`/`relative`) em CLAUDE.md §5, item 9 da
    mesma saga de Turmas. **Lição**: testes com mouse simulado não pegam
    tudo em features de gesto — vale confirmação no celular antes de dar
    como concluído. De brinde, "+ Nova oficina" virou um "+" discreto
    (pedido rápido, mesma sessão).
18. **Segundo round do mesmo bug, mesmo dia** — o item 17 não resolveu
    tudo: Quinta ainda falhava, e o encolhimento não virava "bola" (só
    escalava o card inteiro, mantendo a forma retangular). Achado um
    SEGUNDO bug real, de timing (`ghostNomeRef` podia não existir ainda
    no instante exato em que o arraste cruzava o limiar, por causa de um
    `<span>` condicionado à ref `arrastoRef` em vez de a `state` — refs
    não disparam re-render, então a condição podia ainda não ter sido
    aplicada), mais a troca do encolhimento por largura/padding/
    border-radius de verdade (não `scale`) até virar um círculo,
    revertendo assim que sai do alvo. Detalhe técnico completo em
    CLAUDE.md §5, item 10 da mesma saga.
19. **Terceiro round, mesmo dia** — o detector de design apontou
    `layout-transition` no `width`/`padding` animados do item 18 (reflow
    de verdade, não estético) — trocado por `clip-path` (recorte visual,
    nunca muda o tamanho real da caixa). No mesmo round, o Diego mandou
    print com um ponto marcando onde o mouse estava vs. onde o card
    aparecia — bem longe um do outro. Dois bugs reais: o fantasma era
    forçado a ter a largura da LINHA INTEIRA (não só do conteúdo que ele
    mostra) e o deslocamento do ponteiro era calculado em cima disso; e,
    mesmo corrigindo isso, sobrava um offset porque a largura do
    fantasma era medida ANTES do nome do aluno atual aparecer no DOM
    (mesma classe do bug de timing do item 18 — ref não dispara
    re-render). Centralização confirmada matematicamente depois (diff
    de 0px entre ponteiro e centro do fantasma, em repouso e em modo
    "bola"). Detalhe técnico completo em CLAUDE.md §5, item 11 da mesma
    saga — vale ler antes de mexer nessa área nunca mais sem reler.
20. **Quarto round, mesmo dia** — a correção do item 19 ainda tinha 2
    bugs de geometria (não mais timing/detecção): a "bola" usava
    `inset()`+`round`, que só limitava a LARGURA da janela (a altura
    ficava inteira) — dava uma pílula/oval cortando o avatar torto, não
    um círculo; e a centralização no ponteiro usava o centro da CAIXA
    INTEIRA, enquanto o avatar (o que fica visível na bola) mora perto
    da borda esquerda — quanto mais longo o nome, maior o desalinho
    ("fica mais de ladinho"). Trocado `inset()` por `clip-path:
    circle(raio at x y)` (círculo de verdade) e a centralização passou a
    usar uma constante fixa (posição do avatar, não a largura variável
    da caixa) como ponto de referência único pros dois estados (card
    normal e bola). Detalhe técnico completo em CLAUDE.md §5, item 12 da
    mesma saga.
21. **Quinto round, mesmo dia** — a constante fixa do item 20 batia certo
    no navegador embutido mas não no celular real do Diego (print: "olha
    como o card fica muito para a esquerda" / "ele nao segue meu mouse,
    fica fora"). Trocado por MEDIÇÃO real (`getBoundingClientRect` do
    avatar dentro do fantasma, um novo `ghostAvatarRef`) em vez de uma
    constante calculada à mão — não depende mais de nenhuma suposição
    sobre tamanho/padding/borda que possa divergir do ambiente real.
    Detalhe técnico completo em CLAUDE.md §5, item 13 da mesma saga.
22. **Sexto round, mesmo dia** — arrastar até os SUB-PILLS de horário de
    Quinta especificamente estava quebrado ("quando coloco a mira na
    quinta, ai vou arrastar para baixo nos horarios, ele some"), por 3
    bugs empilhados: z-index elevado no container inteiro dos pills (não
    só no pill em destaque) cobrindo o fantasma; a pré-visualização do
    dia sendo desligada no exato frame em que um sub-pill virava alvo,
    desmontando os sub-pills; e um gap/margem entre os dois blocos de
    pills sem zona de tolerância. Também: a faixa vermelha lateral (zona
    de remover) passou a cobrir a tela inteira visualmente (antes parava
    no meio), mantendo a área real de detecção só a partir de onde já
    estava (não competir com as pills lá em cima). Detalhe técnico
    completo em CLAUDE.md §5, item 14 da mesma saga — inclui uma lição de
    teste nova (PointerEvents sintéticos precisam de um frame de espera
    entre eles, senão o React faz batching e mascara bugs de estado
    intermediário).
23. **Pivô de volta pro app principal (2026-09-18)** — o Diego pausou a
    retomada da Área do Aluno (pedida na sessão anterior) e pediu edição
    de verdade no app do admin: "preciso ter as coisas editaveis tbm...
    excluir... editar o pacote, colocar se esta em dia ou nao, mudar a
    turma", com o motivo explícito de fundo "qro ter mais autonomia no
    aplicativo, sem q eu tenho q ficar toda hora pedindo para o claude
    fazer uma alteração... do app inteiro". `AlunoDetalhe` ganhou um modo
    de edição completo (turma/pacote/pagamento num formulário só, atrás
    de "Editar") mais exclusão com confirmação, reaproveitando
    `moverAluno` já existente pra "mudar a turma" em vez de duplicar
    lógica. Exigiu subir `alunosLista` (a lista da tela Alunos) pro
    componente raiz, mesmo padrão de `vagasPorTurma`/`fornadas`/
    `oficinas` — as duas fontes de dado continuam separadas de propósito
    (motivo real, não preguiça: unificar esbarra num dedup existente que
    quebraria, ver CLAUDE.md). Verificado ao vivo nos dois pontos de
    entrada (Turmas e Alunos). Detalhe técnico completo em CLAUDE.md §5,
    Alunos. Depois disso, o Diego pediu uma auditoria do app inteiro
    (Turmas/Forno/Oficinas/Pagamentos/Solicitações) listando o que ainda
    não é autoservido — ver achados abaixo, em "Auditoria de autonomia".

**Auditoria de autonomia (2026-09-18) — achados e o que foi implementado
em resposta.** Varredura pedida pelo Diego: "faça uma busca e me fale oq
precisa adicionar para eu ter mais essa autonomia... e me faça perguntas
se eu qro essa adição ou nao". Achados (tudo confirmado lendo o código,
não suposição): "Aprovar"/"Recusar" solicitação só notificava, nunca
persistia; tela de Pagamentos não tinha setter de estado nenhum, "marcar
como pago" nem cabia ali; botão "+" de Nova Oficina e "Editar oficina"
sem `onClick` nenhum, clicar não fazia nada; participante de oficina não
podia ser editado/removido depois de cadastrado; "Cancelar fornada" não
existia (status já estava no enum, mas nenhuma ação o usava); e não
dava pra corrigir o conteúdo de uma fornada já iniciada sem duplicar.
O Diego escolheu as 4 frentes (todas as opções oferecidas) — implementadas
e testadas ao vivo nesta sessão:
- **Solicitações de verdade**: aprovar insere a pessoa na turma pedida
  (com pacote a confirmar), recusar remove da lista, as duas ações
  persistem de verdade agora. Detalhe técnico completo em CLAUDE.md §5,
  nova seção "Solicitações".
- **Pagamentos editável + busca**: marcar como pago, busca por nome, e
  um bug real corrigido no caminho (mensagem de cobrança sempre saía
  "R$ null" pra pendentes reais, sem condicional pro valor não
  informado). Detalhe em CLAUDE.md §5, Pagamentos.
- **Oficinas criar/editar**: `ModalOficina` (mesmo formulário pros dois
  modos), participante editável/removível pela primeira vez. Detalhe em
  CLAUDE.md §5, Oficinas.
- **Forno cancelar/editar conteúdo**: botão discreto de cancelar (não
  compete com os 3 botões grandes já estabelecidos), editar categorias/
  detalhes de uma fornada em andamento sem duplicar. Detalhe em
  CLAUDE.md §5, Forno.

**De brinde, no meio da auditoria, três pedidos novos do Diego (não
faziam parte da lista original, vieram enquanto eu implementava):**
- Ações rápidas de pagamento (cobrar/marcar como pago) direto na página
  de detalhe do aluno, sem precisar ir até Pagamentos.
- Uma seção de "Avisos" fixados no topo do Dashboard (mensagem +
  destinatário admin/alunos) — passou por 3 rodadas de redesenho visual
  no mesmo dia até virar a faixa fina com ticker que existe agora.
  Histórico completo (incluindo um achado de sintaxe real — crase dentro
  de comentário CSS quebrando a template literal do `<style>`) em
  CLAUDE.md §5 Dashboard, "Avisos fixados no topo".

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

**Antes disso, considerar priorizar os 2 pedidos mais recentes do Diego
(2026-09-17, item 10/14 acima), que também dependem do MESMO passo 1 abaixo
(lift de `vagas`/`vagasPorTurma` pro componente raiz)**: página de detalhe
do aluno (clicar num aluno em Turmas/Alunos) e mover aluno entre turmas
(com prompt "vaga provisória" vs. fixa, e a borda de identidade seguindo a
turma de origem enquanto provisório). Nenhum dos dois foi começado ainda —
ver CLAUDE.md §5 (Turmas e Alunos) pro pedido verbatim e os detalhes
técnicos de cada um. Como os dois pedem o mesmo lift de estado que o passo
1 da Área do Aluno já precisava, faz sentido resolver o lift uma vez só e
decidir com o Diego qual das duas frentes (Área do Aluno vs. estas duas
features de Turmas/Alunos) construir em cima primeiro.

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

</details>

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

---

### 2026-09-20/21 — Migração Next.js + PWA, Fase 1 (fundação técnica)

**Contexto da decisão** (resumo completo em "Onde continuar agora" no
topo): o Diego reabriu a pergunta de app store ("gente ja nao consegue ja
começar a colocar ela nas appstore para rodar como um app nativo?"), foi
informado do custo ($99/ano Apple + necessidade de Mac/Xcode pra iOS
nativo — bloqueio real, não contornável no Windows dele) e perguntou por
uma alternativa sem loja/taxa que não parecesse "página de navegador"
("tem algum jeito de publicar o app q nao precisa colocar no appstore...
porem q ele nao pareça uma pagina de navegador?"). PWA resolve
exatamente isso — confirmado por ele ("vms para pwa primeiro entao").
Plano de 12 fases aprovado via Plan Mode, salvo em
`C:\Users\Usuario\.claude\plans\zippy-frolicking-token.md`. Capacitor e
as duas lojas nativas ficaram explicitamente fora de escopo (decisão do
próprio Diego, não esquecimento).

Como PWA só instala a partir de HTTPS publicado de verdade (não dá pra
instalar o demo, artifact sem domínio próprio, nem `localhost`), o
caminho é terminar de portar o app pro Next.js+Supabase (que está com só
3 telas com visual antigo e dado 100% mockado) antes de publicar. Fase 1
é a fundação — nenhuma tela foi reconstruída ainda, isso é Fase 2+.

**O que foi feito:**

1. **Paleta**: `tailwind.config.ts` reescrito do zero — saiu a paleta
   antiga (`paper`/`surface`/`ink` 50-900/`clay` 50-900/`glaze`, mais
   `darkMode:"class"` sem nenhum toggle em lugar nenhum do projeto,
   confirmado via busca — código morto) e entrou a paleta do demo:
   `cream`/`cream-soft`/`line`/`ink`/`ink-soft`/`accent`(+hover/soft) +
   as 5 cores de identidade (`sienna`/`ardosia`/`musgo`/`cafe`/`carvao`).
   Implementadas como função `withOpacity()` lendo CSS custom properties
   "R G B" espaçadas — dá suporte nativo a `bg-accent/40` etc., versão
   mais idiomática do que o `rgbCor()` do demo precisa fazer na mão (o
   ambiente de artifact não permite Tailwind config customizado, o
   Next.js permite). Tokens definidos em `globals.css` `:root`. Removido
   o override de `borderRadius` (xl/2xl) que existia só pra imitar
   cantos do sistema antigo — a escala padrão do Tailwind já bate com o
   demo (`rounded-2xl`=1rem, `rounded-3xl`=1.5rem); em troca, entrou a
   regra global de baixa especificidade do demo (`button, input,
   textarea, select { border-radius: 0.75rem }`).
2. **Fontes**: trocadas de Fraunces/Inter/JetBrains Mono (que nunca
   bateram com o demo) pra Bebas Neue + Space Grotesk + Inter + IBM Plex
   Mono via `next/font/google` (melhor que o `@import` do Google Fonts
   que o demo usa — só existe por causa da limitação do artifact).
   `--font-display`/`--font-sans`/`--font-mono` compõem as variáveis que
   cada `next/font` já gera, mesmos 3 papéis semânticos documentados no
   CLAUDE.md §6.1.
3. **16 arquivos que usavam a paleta antiga** (grep confirmou 0 restantes
   depois): `Card`/`Badge`/`Button`/`Avatar`/`ProgressRing` (ui),
   `Sidebar`/`MobileNav` (layout), `VagaCard`, `KpiCard`/`KilnLiveCard`
   (dashboard), as 4 `page.tsx` (dashboard/forno/turmas/login) +
   `(admin)/layout.tsx` + `globals.css`. `dark:` removido de todo mundo
   junto (nunca teve toggle, era código morto desde sempre nesse
   projeto). `Badge` perdeu o tom "glaze" (não existe mais 2ª cor de
   acento, só `accent` + tons semânticos Tailwind core pra status).
   `Avatar` ganhou `anelCor` opcional e `ProgressRing` ganhou
   `color`/`trackColor` customizáveis — preparação pra portar a feature
   de vaga provisória (contorno da turma de origem) nas fases seguintes,
   sem precisar reabrir esses componentes de novo.
4. **Sidebar**: `w-64` → `w-32` com ícone+rótulo empilhado — a regra "não
   alargar" já estava em CLAUDE.md §6 (pedido antigo do Diego, nunca
   aplicado nesse lado do código porque o Next.js nunca foi atualizado
   junto). `VaseMark` (SVG do vaso antigo) removido, logo virou o
   wordmark "MTCST" em Bebas Neue — mesma decisão já tomada no demo
   (§6, `LogoMark`), só nunca replicada aqui. Rodapé da sidebar
   simplificado pra só o avatar (removido texto "Administrador" +
   nome + chevron que sugeria um menu que não existe — o demo não tem
   isso, era invenção do Next.js antigo).
5. **`MobileNav`**: tabs alinhadas ao que CLAUDE.md já documentava como
   decisão fechada (Início/Turmas/Forno/Oficinas/Mais — Solicitações
   saiu da barra fixa em 2026-09-17 no demo, nunca propagado aqui) +
   visual de pílula flutuante de vidro igual ao demo (antes era uma
   barra reta colada, quase opaca).
6. **Componentes novos**: `Modal.tsx`, `Toggle.tsx`, `StatCard.tsx` —
   portas diretas dos equivalentes do demo, nenhum ainda usado em tela
   nenhuma (isso é Fase 2+).
7. **Schema** (`supabase/schema.sql`): duas tabelas novas com RLS —
   `pagamentos` (aluno/turma/tipo pacote-avulsa/valor nullable/status,
   reaproveitando o enum `pagamento_status` que já existia) e `avisos`
   (texto/destinatario admin-alunos/ativo). RLS de `avisos` deixa "pra
   alunos" visível a qualquer autenticado e "pra admin" só admin — a
   escrita é sempre admin nos dois casos. `src/types/database.ts`
   reescrito: as 13 tabelas do schema agora têm tipo (antes só 6 —
   `Aula`/`Presenca`/`Reposicao`/`Oficina`/`OficinaParticipante`/
   `QueimaConteudo`/`QueimaLeitura` estavam faltando, mais as 2 novas).
8. **Manifest/ícone do PWA — achado um bug real do `next/og` no Windows**:
   `ImageResponse` (usada nos arquivos de convenção `icon.tsx`/
   `apple-icon.tsx`/rotas customizadas) quebrava com `TypeError: Invalid
   URL` (`fileURLToPath` recebendo uma string tipo
   `.\file:\C:\Users\...\APP%20MTCST\...\noto-sans-v27-latin-regular.ttf`
   malformada) ao tentar carregar a fonte padrão embutida — **acontece
   mesmo sem nenhum texto na árvore JSX e mesmo fornecendo uma fonte
   própria via a opção `fonts`** (testei as duas coisas, achado real via
   preview + `preview_logs`, não suposição): o Satori tenta carregar a
   fonte padrão dele incondicionalmente antes de olhar o conteúdo,
   então não tem workaround por cima da própria chamada de
   `ImageResponse` — é um bug de terceiros específico de Windows +
   espaço no caminho do projeto ("APP MTCST"), não algo que dá pra
   corrigir editando o código da aplicação. **Resolvido trocando pra um
   SVG estático** (`public/icon.svg`, a silhueta do vaso antigo —
   `VaseMark`, nunca mais usada como logo dentro do app, mas apropriada
   aqui: ícone de ~48px na tela do celular lê melhor como marca gráfica
   do que "MTCST" em texto condensado) — Next.js serve arquivo estático
   direto, zero Satori, zero fonte, funciona em qualquer ambiente (dev
   Windows e produção Vercel/Linux igual). `manifest.json` corrigido:
   nome "MTCST" (era "Ateliê de Cerâmica"), `background_color`/
   `theme_color` nas cores certas, ícone único `sizes:"any"` (SVG
   escala). `layout.tsx` ganhou `metadata.icons` apontando pro mesmo
   arquivo (favicon + apple-touch-icon). **Pendência conhecida, não
   gravidade alta**: apple-touch-icon em SVG tem suporte inconsistente
   em iOS mais antigo (PNG seria mais seguro pra 100% de compatibilidade)
   — não resolvido por falta de ferramenta de rasterização no ambiente
   (sem ImageMagick/sharp/rsvg-convert instalados); revisitar se isso
   incomodar na prática ao testar num iPhone real (Fase 12), ou se o
   Diego quiser encomendar um ícone PNG de verdade da Hanna depois.
9. **`npm audit`**: 19 vulnerabilidades no início (4 low, 1 moderate, 13
   high, 1 critical). Aplicado o que é seguro sem major version:
   `next` 14.2.5→14.2.35, `@supabase/supabase-js`→2.116.0, `@supabase/
   ssr`→0.5.2, `vite`→5.4.21 (usado só pelo `preview:demo`, nunca vai
   pra produção do app real). **Achado sério, não resolvido de
   propósito**: mesmo em 14.2.35, `next` continua listado como CRÍTICO —
   investigando o motivo real (não só confiando no resumo do `npm
   audit`), são 2 CVEs sem patch em NENHUMA versão 14.x:
   `GHSA-p293-qw3h-jr36` (RCE não-autenticado em servidor hospedado em
   Windows) e `GHSA-2xp9-vwfh-vxw4` (RCE não-autenticado no Image
   Optimization API ao processar AVIF) — só fecham de verdade com Next
   ≥15.5.24. A sugestão automática do `npm audit fix --force` pula
   direto pro Next 16 (major, quebra bem provável no App Router,
   CLAUDE.md já pedia cautela nisso). Como o destino de produção é
   Vercel (Linux), o primeiro CVE não bate no deploy real, mas bate em
   qualquer um rodando `npm run dev`/self-host Windows; o segundo (AVIF)
   bate em qualquer lugar que sirva imagem otimizada, incluindo Vercel.
   **Não fiz o upgrade de major sozinho** — decisão que precisa do
   Diego, propus fazer como tarefa própria (build completo + smoke test
   de toda a Fase 2+ depois) antes da Fase 11 (deploy real), não
   misturado com o resto da Fase 1. `eslint-config-next`14→16 (major)
   também ficou de fora, mesma lógica (ferramenta de lint/build, não
   necessidade). Resto das vulnerabilidades (`next-pwa`→`workbox`→
   `serialize-javascript`, sugestão de downgrade pra `next-pwa@2.0.2`)
   também não mexido — a "correção" sugerida é uma versão MAIS ANTIGA
   que `next-pwa` 5.6.0 atual, quase certamente perde suporte a App
   Router (a versão 2.x é da era do Pages Router); aplicar isso às
   cegas provavelmente quebra o PWA inteiro. Risco real mas baixo na
   prática (workbox/terser rodam só em build time pra gerar o service
   worker, não ficam expostos em requisição de usuário final).
10. **Verificação ao vivo**: `npm run dev` rodando, testado
    Dashboard/Turmas(Terça)/Forno/Login em abas novas (não reaproveitei
    abas que tinham visto erro antigo — lição já registrada no CLAUDE.md
    sobre cache de console do HMR mascarar o estado real) — sem erro de
    servidor (`preview_logs` limpo) nem de console, texto em português
    renderizando certo, cores/fontes batendo com o demo. Único warning
    visto (`recharts`/`defaultProps` no gráfico do Forno) é da própria
    lib, pré-existente, não relacionado a nada mexido aqui.

**Não mexido nesta sessão** (de propósito, é Fase 2+): conteúdo/dado
mockado de cada tela continua mockado (TODOs comentados intactos); o
gráfico "Curva da queima" continua no Forno (o demo removeu isso a
pedido do Diego em 2026-09-17, mas essa é uma mudança de conteúdo/
comportamento da tela, não de paleta — fica pra quando Forno for
reconstruído de verdade); cabeçalho mobile (o demo tem uma pílula
flutuante com o logo — o Next.js hoje não tem cabeçalho mobile nenhum,
só a `Sidebar` desktop + `MobileNav` — construir um do zero é trabalho
de tela, não de fundação, fica pra Fase 2 junto do resto do
`AdminLayout`).

**Problemas pendentes:** decisão do Diego sobre o upgrade major do
Next.js (14→15/16, resolve os 2 CVEs críticos) antes do deploy real;
apple-touch-icon em SVG (compatibilidade iOS mais antiga, ver item 8);
`login/page.tsx` tem 1 erro de tipo (`role` on `never`) que sobrou depois
do bump de `@supabase/supabase-js` — a versão nova exige um formato mais
estrito de `Database` (`Relationships`/`Views`/`Functions`/
`__InternalSupabase`, já adicionados) mas ainda não fechou 100%; não
bloqueia o dev server (só `tsc --noEmit`/build), não investigado até o
fim por causa da prioridade abaixo; working tree ainda não commitado.

**Correção no meio da sessão — o Diego testou o preview e apontou que
Turmas/Forno ainda pareciam com o Next.js antigo, não com o demo**
("vc leu oq eu falei? q qro q o aplicativo seja como estava no demo e
nao como esta no localhost3000"). Procedente — Fase 1 só tinha portado
cor/fonte, o CONTEÚDO de cada tela continuava sendo o mock antigo do
Next.js (nomes fictícios, e o Forno especificamente ainda tinha o
gráfico "Curva da queima" que o próprio Diego pediu pra tirar do demo em
2026-09-17). Puxei a reconstrução do **Forno** pra esta sessão (seria
Fase 3) por ser a tela mais visivelmente errada e "o coração do ateliê":

- Gráfico removido (import do `recharts` inteiro saiu do arquivo).
- **2 fornos com abas** (Forno 1/Forno 2, ponto verde indicando qual tem
  fornada ativa) — antes só existia o conceito de "a queima", singular.
- Painel da fornada ativa reconstruído fiel ao demo:
  `ProgressRing` + StatCards (Tempo decorrido/Temp. máxima/Tempo
  restante/Patamar/Abertura segura/Etapa atual), "Conteúdo do forno" por
  categorias (Peças de alunos/oficinas/Encomendas/Queimas por fora — sem
  "Misturado", removida a pedido faz tempo) com botão Editar, lista de
  Observações, os 3 botões grandes (Atualizar temperatura/Adicionar
  observação/Finalizar fornada) + "Cancelar fornada" discreto abaixo.
  Estado vazio ("Nenhuma fornada em andamento no Forno X") quando o
  forno selecionado não tem fornada ativa.
- **Modal "Nova fornada"** funcional (tipo com presets/temp. máxima/
  categorias/detalhes) — simplificação deliberada do fluxo do demo (lá é
  página dedicada com mais seções; aqui é modal, pra não estourar o
  escopo desta correção). Ao iniciar com uma fornada já ativa no forno,
  pede confirmação (vira "Interrompida", nunca apaga) antes de criar a
  nova — mesma regra do demo.
- `paramsDe()` (função nova, local ao arquivo) faz a ponte entre o
  formato de fornada da tela (`config`+`iniciadoEm`+`leituras[]`
  separados, mesma forma do demo) e `ParametrosQueima` de
  `src/lib/forno.ts` (formato achatado) — **`calcularPrevisao` em si não
  foi reescrita**, só chamada com os dados remontados (regra do
  CLAUDE.md §2B respeitada).
- Estado 100% local (`useState`, mesmo padrão "TODO conectar dados
  reais" já usado no resto do projeto) — Supabase ainda não entra aqui.
- Testado ao vivo: troquei de aba (Forno 2 mostra o estado vazio
  corretamente), criei uma fornada nova de verdade no Forno 2 (apareceu
  no histórico, painel ativo mostrando 25°C/00:00:00 decorrido),
  histórico filtra certo por forno. `tsc --noEmit` limpo nesse arquivo.

**Ainda no Next.js antigo, não tocado ainda** (mesma lista de sempre,
Fases 2+): Turmas (roster fictício, sem arrastar/mover, sem busca),
Dashboard (KPIs/agenda ainda mockados, sem Avisos), Oficinas/Pagamentos/
Alunos/Solicitações (nenhuma tela existe de verdade ainda no Next.js).

**Turmas também reconstruída na mesma sessão**, mesma lógica (é a 2ª
tela mais visivelmente errada). Portado fiel ao demo:
- **Roster real das 4 turmas** (`VAGAS_POR_TURMA_INICIAL`) — os mesmos
  46 nomes/números reais do demo, copiados exatamente (dado real do
  Diego, não inventar de novo). Abas de dia (Seg-Dom, só Ter/Qua/Qui
  disponíveis) + sub-pills de horário só na Quinta (2 turmas).
- **Cor de identidade por turma de verdade** (sienna/ardósia/musgo/café)
  aplicada em borda do card, pills ativas/inativas, anel de progresso —
  usando os tokens Tailwind já criados na Fase 1. Achado técnico
  importante: cor NÃO pode ser um nome de classe montado em runtime
  (tipo `"border-" + cor`) porque o Tailwind só gera CSS pra classes que
  aparecem como texto literal no arquivo — usei tabelas de lookup
  (`PILL_ATIVA`, `BORDA_CARD` etc.) com a string completa escrita à mão
  pra cada cor, indexadas em runtime. Registrar essa armadilha caso
  apareça de novo em Oficinas/Dashboard.
- Chip verde/vermelho de presença da aula (toggle), badge Pendente/
  Renovar, anel de pacote com fração dentro (ex: "3/4"), toggle de
  presença **reversível** (incrementa/decrementa o pacote, testado ao
  vivo nos dois sentidos — Bia foi de 1/4 a 2/4 e voltou a 1/4).
- Vaga vazia → "Cadastrar aluno" (modal nome+pacote 4/8/12).
- **Mover aluno**: só a versão "toque" (modal 2 passos: escolher turma
  → confirmar), sem o gesto de arrastar-e-soltar — decisão já registrada
  no plano de migração (a saga de 14+ rounds do drag-and-drop no demo
  vira fase própria, não replicada agora). Dentro disso, também
  simplificado pra só transferência FIXA (sem "vaga provisória" — exige
  rastrear turma de origem/visitante pra funcionar direito, registrado
  como gap consciente, não esquecimento).
- `VagaCard.tsx`/`src/components/turmas/` **removidos** — layout de
  grid de cards não existe no demo (lá é lista dividida, uma linha por
  aluno), ficou órfão assim que reescrevi pra bater com o layout real.
- Testado ao vivo: Terça (14/12, sienna), Quinta 14:30 (musgo, sub-pill),
  presença reversível nos dois sentidos, sem erro de console em aba nova.

**Simplificações desta rodada, registradas pra não esquecer**:
"Solicitações pendentes" na lateral da tela sempre mostra vazio (não há
fonte de dado real ainda — vira a fonte de verdade só quando
Solicitações ganhar sua própria fase); sem parallax/foto de fundo por
dia (decoração, não comportamento); sem badge "provisório"/aluno-visita
entre turmas (ver acima).

**Dashboard também reconstruído na mesma sessão** (o Diego confirmou via
pergunta direta: "continuar agora" depois de ver Forno/Turmas). Portado
fiel ao demo:
- **Layout mudou de grid 2×4 largura total pra `300px` (KPIs 2×2) +
  resto do espaço pros 2 cards de forno lado a lado** — proporção exata
  do demo, não só cor. KPIs agora linkam de verdade pra cada tela
  (antes só decoravam).
- **`FornoResumoCard` novo** (`src/components/dashboard/
  FornoResumoCard.tsx`) substitui o antigo `KilnLiveCard` (card único
  grande, com gráfico embutido) — 2 cards compactos, um por forno, com
  o **brilho pulsante por temperatura** (`corIncandescente()`, rampa
  vermelho-escuro→amarelo-claro, keyframes `forno-brasa`/`forno-fresco`
  adicionados no `globals.css`) — forno ativo e quente (≥250°C) pulsa
  laranja/vermelho, frio ou sem fornada pulsa azul discreto. Forno sem
  fornada mostra "Nenhuma fornada ativa". Os dois levam pra `/forno`
  (não há deep-link pra uma aba específica ainda — simplificação
  consciente, a página já abre na fornada ativa que existir).
- **`AgendaSemanaCard` novo** ("Turmas da semana") — não existia
  NENHUMA versão disso no Next.js antes. Lista vertical (sem scroll
  lateral), um card por dia da semana com data real (`datasDaSemanaAtual`/
  `formatarDiaMes`, mesmas funções do demo), selo do dia na cor de
  identidade da turma (sienna/ardósia/musgo), avatares empilhados com
  o roster real, "Hoje" no dia atual, estado vazio com ícone+frase nos
  dias sem turma. Clicar num dia leva pra `/turmas/{id}`. **Não
  portado**: foto de fundo por dia (`FUNDOS_ARGILA`, decoração pura,
  fica pra depois se importar) e Sábado com a cor "carvão" (sem
  oficina real cadastrada ainda pra testar isso direito).
- "Próximas oficinas" trocado pro dado real do demo (2× "Kit Café da
  Manhã", 10 e 24 de outubro) — antes tinha "Modelagem Manual"/
  "Esmaltação Criativa" com datas de maio, claramente obsoletas/
  fictícias.
- `KilnLiveCard.tsx`/`KpiCard.tsx` **removidos** (substituídos, ficaram
  órfãos — confirmado via busca antes de apagar).
- Testado ao vivo: glow visível nos 2 fornos (laranja no ativo/quente,
  azul no vazio), agenda mostrando datas/nomes reais corretos, sem erro
  de console em aba nova.

**Três telas do plano de migração agora fiéis ao demo nesta sessão:
Forno, Turmas, Dashboard.** Faltam: Oficinas, Pagamentos, Alunos,
Solicitações — nenhuma existe de verdade no Next.js ainda (só
placeholder/mock antigo ou nem isso).

**Oficinas construída do zero nesta sessão** (não existia NENHUM arquivo
antes — nem lista nem detalhe). `src/lib/oficinas.ts` novo, dado
compartilhado (tipos + `oficinasIniciais()`, os 6 registros reais do
demo: 4× Kit Café da Manhã, Enfeites de Natal, Peças Marmorizadas,
datas reais out-dez/2026) entre:
- `/oficinas` (lista): grid 2 col, anel de progresso por ocupação, cor
  de identidade rotativa por oficina (`corOficina`, hash determinístico
  do id — mesmo algoritmo do demo), "+" abre `ModalOficina` (criar).
- `/oficinas/[oficinaId]` (detalhe, rota nova): Status das peças (4
  etapas clicáveis), StatCards (Participantes/Pagos/Pendentes/Duplas),
  Sobre/Receita/Observações, lista de participantes (vaga vazia →
  cadastrar; preenchida → editar/remover, mesmo modal nos dois modos),
  "Ver como aluno" (toggle read-only), "Editar oficina" reaproveitando
  o `ModalOficina` da lista (exportado e importado entre os 2 arquivos
  de rota — variação aceitável de reuso, não uma pasta `lib` só pra
  isso).
- Testado ao vivo: criar oficina, abrir detalhe, cadastrar participante
  (Participantes foi de 0/12 pra 1/12, Pendentes 0→1, confirmado no
  texto da página), sem erro de servidor.
- **Limitação aceita conscientemente**: lista e detalhe têm cada um seu
  próprio `useState` local (mesmo padrão de Turmas/Forno) — cadastrar
  um participante no detalhe não atualiza a ocupação mostrada na lista
  até recarregar a página. Native do estágio "mock pré-Supabase":
  construir um Context só pra isso seria arquitetura descartável (Fase
  11 troca tudo por query real, que naturalmente compartilha fonte via
  banco). Mesma decisão já vale pra Turmas/Forno, não é regressão nova.

**Sessão continuou e fechou as 3 telas restantes do plano: Alunos,
Pagamentos, Solicitações.** Achado real no meio do caminho: exportar um
componente extra (`ModalOficina`) de dentro de `oficinas/page.tsx`
quebra a validação de rotas do Next.js (`.next/types` reclama que
`page.tsx` só pode exportar `default`/`metadata`/etc.) — corrigido
extraindo pra `src/components/oficinas/ModalOficina.tsx`, importado
pelos dois arquivos de rota. **Lição pra próximas telas**: nunca
exportar um componente extra de um arquivo `page.tsx`, sempre extrair
pra `src/components/`.

- **`src/lib/vagasPorTurma.ts` (novo)** — o roster real das 4 turmas
  (antes só existia dentro de `turmas/[turmaId]/page.tsx`) virou lib
  compartilhada, igual já tinha sido feito pra Oficinas/Alunos.
  `turmas/[turmaId]/page.tsx` foi atualizado pra importar de lá em vez
  de ter a própria cópia local — uma fonte só do roster real agora.
  `pagamentosIniciais(vagasPorTurma)` (mesma função/regra do demo) mora
  no mesmo arquivo, deriva os pendentes reais direto do roster.
- **`src/lib/whatsapp.ts` (novo)** — `mensagemCobranca`/
  `abrirWhatsAppCobranca` extraídas (mesma correção do demo: `valor`
  null não vira mais "R$ null" na mensagem), compartilhadas entre
  Pagamentos e AlunoDetalhe.
- **`/alunos` + `/alunos/[index]`**: roster real (46 pessoas, confirmado
  ao vivo: 14+11+10+11 nas 4 turmas, bate com CLAUDE.md), busca por nome,
  acordeão por turma com cor de identidade, página de detalhe editável
  (turma/pacote/pagamento, aula clampada [0,total]), "Cobrar no
  WhatsApp"/"Marcar como pago" quando pendente, excluir com
  confirmação. Rota usa índice do array como id (`/alunos/0`) — sem
  Supabase ainda não tem UUID de verdade, índice é suficiente por ora.
- **`/pagamentos`**: StatCards, busca, pendentes derivados do roster
  real (14 cobranças reais, bate com CLAUDE.md), "Marcar como pago"
  reativo (testado ao vivo: Cintya marcada, contagem caiu de 14→13 na
  hora), modal "Cobrar no WhatsApp" com a mensagem corrigida.
- **`/solicitacoes`**: mock de 3 solicitações (nunca foi dado real, só
  as 4 turmas/roster são reais — mesma nota já registrada no CLAUDE.md),
  "Aprovar" abre modal de pacote e insere de verdade na vaga livre da
  turma certa (`vagasPorTurma` local desta rota), "Recusar" remove da
  lista. Testado ao vivo: aprovar Beatriz Almeida removeu ela da lista
  corretamente, sem erro de console.
- **Mesma limitação de sempre, aceita conscientemente**: cada rota tem
  seu próprio `useState` do roster — marcar um pagamento em Pagamentos
  não atualiza o que Turmas mostra até recarregar. Fica assim até a
  Fase 11 trocar tudo por Supabase de verdade (fonte compartilhada via
  banco, não Context React descartável).

**As 7 telas do plano de migração agora existem e são fiéis ao demo:
Dashboard, Turmas, Forno, Oficinas, Alunos, Pagamentos, Solicitações.**
`tsc --noEmit` limpo (só o erro pré-existente do login, não
relacionado). Nenhuma tela testada ainda no celular real do Diego — só
no navegador embutido, viewport desktop. Working tree inteiro desta
sessão (Fase 1 + todas as 7 telas) commitado em `34751af` ("Migrate
Next.js app to demo's visual system and rebuild all 7 core screens",
44 arquivos).

**Próximos passos:** pedir pro Diego testar no celular antes de
considerar as 7 telas "prontas" de verdade (padrão do projeto: cliente
testa e reporta por screenshot, espaçamento/largura é o que ele mais
nota — CLAUDE.md §8). Decisão do Next.js major (CVEs críticos) ainda em
aberto, não bloqueia esse trabalho de tela — mas precisa ser resolvida
antes da Fase 11 (deploy real). Depois: Fase 0 (Diego cria contas
Supabase/Vercel, pode ser feito em paralelo a qualquer momento), Fase
11 (conectar Supabase de verdade, substitui todo o `useState` local por
queries reais — dissolve a limitação de fontes duplicadas citada
acima), Fase 12 (confirmar instalação PWA num Android e iPhone reais).

### 2026-09-22 — Paridade visual com o demo: fundo de argila, cabeçalho mobile, correção de bugs

Diego voltou a testar as 7 telas (commitadas em `34751af`) e apontou, ao
vivo, várias diferenças reais contra o demo — sessão de correção rápida,
achado a achado, sem pausa entre eles.

1. **Bug real: `/turmas` dava 404.** `src/app/(admin)/turmas/` só tinha
   `[turmaId]/page.tsx` (rota dinâmica), nunca teve um `page.tsx` no
   índice — mas `Sidebar.tsx`/`MobileNav.tsx` sempre apontaram pra
   `/turmas` puro. Corrigido com `src/app/(admin)/turmas/page.tsx` novo,
   só um `redirect("/turmas/ter-1830")`.
2. **`FundoArgilaParallax` portado de verdade** — o fundo de fotos reais
   de mesclagem de argila com parallax (saga completa em CLAUDE.md §5,
   2026-09-17) nunca tinha sido trazido pro Next.js; as 7 telas
   rebuiladas ficaram com fundo cream liso. Extraí as 4 fotos do base64
   embutido no demo (`node` + regex, sem passar o base64 pelo meu
   contexto) pra arquivos de verdade em `public/fundos/{carvao,sienna,
   ardosia,musgo}.jpg` — o Next.js não tem a limitação de artifact que
   forçava o demo a inline. Novo componente `src/components/ui/
   FundoArgilaParallax.tsx` (mesma lógica de scroll do demo: `position:
   fixed`, `backgroundPositionY = scrollY * 0.35`, `requestAnimationFrame`)
   e `src/lib/fundosArgila.ts` (mapa cor→caminho, fonte única
   compartilhada). Usado em Turmas (cor muda com o dia ativo) e Oficinas
   (carvão fixo), exatamente como no demo.
   - **Mesmo bug de stacking do demo reapareceu**: o fundo `fixed` pintava
     por cima do `<aside>` (Sidebar) no desktop, que não tinha z-index
     nenhum. Mesmo fix já documentado: `z-10` explícito no `<aside>`.
3. **Fundo de foto nos cards do Dashboard** — Diego pediu em seguida
   ("na pagina inicial tbm, o fundo dos card igual na demo"). Portado
   pra `AgendaSemanaCard.tsx` (cada card do "Turmas da semana" usa a foto
   do seu dia, dias sem cor própria continuam neutros) e pro card
   "Próximas oficinas" no `dashboard/page.tsx` (carvão fixo, conteúdo
   dentro de uma caixa branca opaca por cima — mesma lição de contraste
   já documentada, foto preto-e-branco não pode ter texto solto em cima).
4. **Cabeçalho mobile portado** — auditando Forno contra o demo, achei
   que a pílula flutuante de vidro (logo "MTCST" com efeito de vidro +
   sino, topo de toda tela mobile — 5 rodadas de refinamento em
   CLAUDE.md §6) nunca existiu no Next.js, só a nav inferior. Novo
   `src/components/layout/MobileHeader.tsx`, cópia fiel do `<header>` do
   demo (mesmo gradiente translúcido/`backdrop-blur-2xl`/sombra de dois
   níveis da nav inferior, mesmo efeito de texto do logo —
   `background-clip:text` + `drop-shadow` duplo, não `text-shadow`/
   `-webkit-text-stroke`, que o CLAUDE.md já documentava como "feio"/
   "lava o preto"). Adicionado no `(admin)/layout.tsx`; `<main>` ganhou
   `pt-24 md:pt-0` pra compensar a pílula `fixed` só no mobile (cabeçalho
   é `md:hidden`, cada página já tem seu próprio `pt-6` pro desktop).
   Verificado nos dois breakpoints (viewport 375px e 1280px) — sem gap
   nem sobreposição.
5. **Banner de Avisos — pedido de mudança de verdade, não bug** (print
   marcado, ALL CAPS: "PRECISO Q ESSA FAIXA FIQUE PRETA E Q FIQUE SÓ O
   AVISO NA FAIXA E NAO O +NOVO AVISO"). Avisos só existe no demo (nunca
   foi portado pro Next.js — fora do lote das 7 telas). Dois problemas
   na mesma faixa: `estiloFaixa` (fundo terroso claro,
   `rgbCor("sienna", 0.12)`) era aplicado tanto no(s) `<div>` de cada
   aviso quanto no botão "+ Novo aviso"/"Fixar um aviso" — os três
   liam como um banner só. Fix em `AvisosCard`/`LinhaAviso`
   (`demo/AtelieDemo.jsx`): `estiloFaixa` virou preto
   (`rgbCor("carvao")`) e **só** fica no `<div>` de cada aviso de
   verdade; os dois botões de adicionar perderam o `style` da faixa,
   viram link discreto na cor normal da página. Cores de texto
   reajustadas pro fundo escuro: "alunos" de `--ink` (ilegível em preto)
   pra branco; "admin/pra mim" de `rose-600` pra `rose-500` (mais
   legível no escuro); botão de remover (X) de tons escuros pra
   branco/50→branco. Testado ao vivo criando um aviso de cada categoria
   — confirmado por screenshot, faixa preta com só o aviso, "+ Novo
   aviso" separado embaixo, sem faixa.
6. **Avisos portado pro Next.js** — logo em seguida, Diego mandou "AVISO
   NAO ESTA PARECENDI": a correção acima só tinha ido pro demo, e
   Avisos nunca existiu no Next.js (fora do lote das 7 telas) — no app
   que ele estava testando (`localhost:3000`) não tinha banner nenhum,
   nem o prompt vazio. Portado como componente próprio e autocontido
   (`src/components/dashboard/AvisosCard.tsx` — `useState` local tanto
   pros avisos quanto pro modal, mesmo padrão de estado por rota já
   usado nas 7 telas), já direto na versão corrigida (faixa preta, ver
   item 5). `.aviso-passando`/`@keyframes avisoPassando` (ticker de
   texto longo) movido pro `globals.css`, junto dos outros keyframes
   (`.forno-brasa`/`.forno-fresco`). Adicionado no `dashboard/page.tsx`,
   mesma posição do demo (logo abaixo da data, antes dos KPIs).
   - **Bug real, achado testando ao vivo**: a primeira versão do
     componente tinha `if (avisos.length === 0) return (<button
     .../>)` como early return, com o `{modalAberto && <ModalNovoAviso
     .../>}` só depois, na árvore do outro branch (`return (<>...
     </>)`). Clicar em "Fixar um aviso no topo" (lista vazia — o único
     estado que dá pra testar do zero) setava `modalAberto` certinho,
     mas como esse branch retorna ANTES de chegar no modal, ele nunca
     aparecia — parecia um clique que não fazia nada. Confirmado que
     não era o problema já conhecido de clique instável do navegador
     embutido (CLAUDE.md §8): o `read_page` mostrava o estado do botão
     inalterado depois do clique, nenhum elemento novo na árvore.
     Corrigido pra um `return` só, com ternário pros dois estados
     visuais e o modal sempre no escopo. **Lição**: sempre que um
     componente tem `if (...) return (...)` + outro `return` mais
     embaixo, qualquer coisa que precise aparecer nos dois casos
     (modal, toast) tem que estar em cima da bifurcação, não só num dos
     lados.

Todas as mudanças verificadas ao vivo (mobile 375px + desktop 1280px,
`tsc --noEmit` limpo salvo o erro pré-existente do login, sem erro de
console em nenhuma tela tocada). **Nada commitado ainda desta rodada** —
esperando o Diego confirmar que está tudo do jeito que ele queria antes
de fechar o commit.

### 2026-09-23 — Início da Fase 11 (Supabase real): contas criadas, base de tipos corrigida

O Diego confirmou que já criou as contas Supabase e Vercel (Fase 0) e
pediu pra eu ir adiantando o resto enquanto ele passa as credenciais.
Antes de escrever qualquer query real (que eu não conseguiria testar sem
chaves de verdade — risco real de ficar tudo errado e descobrir só
depois), decidi primeiro deixar a base de tipos sólida, já que ia virar
carga de trabalho pesada em cima dela.

1. **`@supabase/ssr` estava em 0.5.2** (bem antigo — instalado desde a
   Fase 0 original, nunca tinha passado por um upgrade de verdade,
   só patches dentro do range `^0.5.2`). Achado real: essa versão
   referencia um caminho interno do `@supabase/supabase-js` (`dist/
   module/lib/types`) que **não existe mais** na versão atual instalada
   (2.116.0 só tem `dist/umd` + `src`). Upgradado pra 0.12.7 (última
   publicada, peer dependency bate certinho com `^2.114.0`). Isso exigiu
   migrar `middleware.ts` e `src/lib/supabase/server.ts` do padrão de
   cookies depreciado (`get`/`set`/`remove`) pro atual (`getAll`/
   `setAll` — padrão oficial recomendado pelo próprio Supabase pra SSR
   do Next.js, inclusive resolve a recriação de `response` depois de
   escrever cookie, que o padrão antigo fazia errado).
2. **O erro de tipo `never` em `login/page.tsx`, que sobrevivia desde
   a Fase 1 (sempre atribuído ao formato do `Database`), tinha uma causa
   raiz completamente diferente** — achado depurando caso a caso, ver
   detalhe técnico completo (e a lição de não reabrir essa investigação
   à toa) em CLAUDE.md §8, entrada nova: é um desalinhamento real de
   parâmetros genéricos entre `@supabase/ssr` e `@supabase/supabase-js`
   nas versões atuais, sem fix disponível via upgrade. Resolvido com o
   escape hatch oficial do postgrest-js (`.overrideTypes<T, {merge:
   false}>()`) em vez de continuar brigando com a inferência. **`tsc
   --noEmit` do projeto inteiro está limpo pela primeira vez desde o
   início da migração** — zero erros, nem o pré-existente.
3. No caminho, testado e descartado como causa (registrado no CLAUDE.md
   pra não reabrir à toa numa próxima sessão): formato de `Database`
   (achei e removi de qualquer forma um problema real e separado — o
   helper genérico `TableOf<Row>` que as 15 tabelas usavam quebra a
   inferência do Supabase mesmo produzindo um tipo idêntico a escrever
   a tabela por extenso; `database.ts` já não usa mais esse helper),
   número de tabelas, `__InternalSupabase`, função wrapper com/sem tipo
   de retorno explícito, cast manual do client.

**Atualização, mesmo dia — o Diego passou as credenciais reais na hora**
(URL, anon key, service_role key direto no chat; Project ID eu derivei
da própria URL) e rodou o `schema.sql` no SQL Editor. A partir daí, tudo
mudou de "código às cegas" pra "testado de verdade contra o banco":

1. **Achei a causa raiz de VERDADE do bug de tipos `never`** (a entrada
   acima, sobre desalinhamento `@supabase/ssr`/`@supabase/supabase-js`,
   era um diagnóstico errado, ainda que o sintoma batesse) — ver CLAUDE.md
   §8, entrada reescrita. Resumo: `Row: Profile` (referência a uma
   interface nomeada, mesmo sem generic nenhum envolvido) quebra a
   inferência; `Row: {id: string, ...}` (literal inline idêntico)
   funciona. Fix: `Prettify<T> = {[K in keyof T]: T[K]} & {}` em volta de
   cada `Row`/`Insert`/`Update` em `database.ts` — mesmo truque que o
   `postgrest-js` usa internamente. **`tsc` do projeto inteiro limpo**,
   incluindo as queries reais novas (ver abaixo) — não precisou mais do
   `.overrideTypes()` manual em lugar nenhum.
2. **Teste real de ponta a ponta, aprovado**: criei um usuário admin de
   teste via Admin API (`teste-admin@mtcst.invalid`) direto no projeto
   real do Diego, logei pela tela de `/login` de verdade — `signIn` →
   middleware → query de `profiles` → redirect pro Dashboard, tudo
   funcionou sem erro nenhum, sem cast, sem workaround. **A base de auth
   está genuinamente pronta pra Fase 11**, não só "compila".
3. **As 4 turmas reais foram semeadas no banco** (Terça 18:30, Quarta
   16:30, Quinta 14:30, Quinta 18:30, com a capacidade real de cada uma —
   Terça com 14, as outras com 12). Achado no caminho, ainda sem
   resolver: o mock atual usa slugs fixos como id de rota (`ter-1830`),
   mas o banco gera UUID de verdade pra cada turma — quando a página for
   religada de vez, o slug da URL precisa virar uma busca por dia+hora
   em vez de bater direto com o id do banco (não é bloqueio, só uma
   camada de tradução a mais).
4. **Achado e corrigido um gap real no schema**: `matriculas` não tinha
   como representar "aluno provisório visitando outra turma" (a feature
   de mover aluno). Adicionada a coluna `provisorio boolean` (default
   false) antes do Diego rodar o schema, sem custo nenhum por ainda não
   ter sido rodado.
5. **Decisão de arquitetura tomada sem poder perguntar ao Diego** (é
   detalhe de implementação, não de produto): `profiles.id` continua
   igual a `auth.users.id` (schema original), então "Cadastrar aluno"
   (que só pede nome, sem e-mail/senha) cria uma conta muda de verdade
   por trás (`src/lib/supabase/admin.ts`, `criarContaMudaParaAluno` — via
   `service_role`, e-mail interno gerado tipo `nome-abc123@sememail.
   mtcst.invalid`, senha aleatória descartada, ninguém loga com ela) em
   vez de desacoplar `profiles` de `auth.users` — evita reescrever as 8
   políticas de RLS que já assumem `profiles.id === auth.uid()`, risco
   maior de acertar errado sem poder testar RLS isoladamente.
6. **Domínio de Turmas escrito por completo** (`src/lib/actions/
   turmas.ts`): `getRosterTurma` (leitura, monta o roster real —
   matrículas confirmadas + profile + pacote atual + presença desta
   semana + pagamento pendente, deriva `numero`/`status`/`statusAula`
   porque nenhum desses existe como coluna, são computados), e as
   mutações `cadastrarAluno`/`toggleStatusAula`/`marcarPresenca`/
   `moverAluno` (todas como Server Actions, `revalidatePath` no fim).
   **Compilado limpo, mas ainda não testado rodando de verdade nem
   ligado a nenhuma tela** — o próximo passo é ligar `turmas/[turmaId]/
   page.tsx` nisso e testar o fluxo completo ao vivo (cadastrar aluno de
   verdade, marcar presença, etc.), depois repetir o mesmo padrão pros
   outros 6 domínios (Forno, Oficinas, Alunos, Pagamentos, Solicitações,
   Avisos).

**Conta de teste `teste-admin@mtcst.invalid` continua no projeto real do
Diego** — útil pra continuar testando, mas avisar antes de apagar (ou
perguntar se ele quer manter/trocar pelo admin de verdade da Hanna).

**Atualização, ainda 2026-09-23 — o Diego reagiu ao "conta muda" do item
5 acima**: "precisa de email? nao pode ser um usuario?". Certo — não
precisava, era eu resolvendo um problema que eu mesmo criei ao manter
`profiles.id references auth.users(id)` (schema original, decisão de
sessão anterior à migração). **Revertido pra um modelo melhor**:
`profiles` ganhou seu próprio `id` (não depende mais de `auth.users`) e
um `auth_user_id` opcional, só preenchido pra quem realmente loga (admin
sempre; aluno só se/quando a Área do Aluno pedir um convite de verdade).
Isso exigiu:
- Reescrever as 8 políticas de RLS que assumiam `profiles.id ===
  auth.uid()` — criado um helper novo `current_profile_id()` (mesmo
  padrão do `is_admin()` já existente) em vez de repetir a subquery em
  cada policy. Risco considerado ANTES (session anterior) maior do que
  valia a pena sem poder testar contra um banco de verdade — mas as
  policies de "aluno vê o próprio X" estão 100% dormentes hoje (Área do
  Aluno nem existe), então o risco de regressão prática é baixo mesmo
  sem teste ao vivo de cada uma; iterar se algo aparecer errado quando a
  Área do Aluno for construída de verdade.
- `src/lib/supabase/admin.ts` perdeu a criação de conta muda inteira
  (`criarContaMudaParaAluno`/`slugify`/`emailInterno`) — sobrou só
  `createAdminClient()`, guardado pra quando realmente precisar ignorar
  RLS (não o caso comum de cadastrar aluno).
- `cadastrarAluno` (`src/lib/actions/turmas.ts`) simplificado — só um
  insert direto em `profiles` (a política já libera pra admin), sem
  tocar em `auth.users` nenhuma.
- Como só existia dado de teste no banco (4 turmas + 1 admin fake), pedi
  pro Diego rodar um script único de reset (drop de tudo + schema
  atualizado) em vez de escrever uma migração incremental — mais simples
  e sem risco, dado que não tinha dado real pra perder.
`tsc` do projeto inteiro limpo depois da mudança. Ainda esperando o
Diego confirmar que rodou o reset antes de recriar a conta de teste e
as 4 turmas de novo.

**Atualização — Diego confirmou ("AGORA FOI?") e rodou o reset.** Recriei
turmas + conta de teste (o usuário `auth.users` de antes sobreviveu ao
reset — só as tabelas do `public` foram apagadas — então bastou linkar
um `profiles` novo a ele em vez de criar de novo). Testei login e **achei
um bug real que eu mesmo introduzi**: mudei o schema pra `profiles.id` não
ser mais igual a `auth.users.id`, mas esqueci de atualizar as DUAS queries
que ainda assumiam isso — `login/page.tsx` (`.eq("id", data.user.id)`) e
`middleware.ts` (`.eq("id", user.id)`, a checagem de admin). Resultado:
login "funcionava" (autenticava) mas a busca do profile sempre vinha
vazia, e o middleware redirecionava qualquer admin pra `/aluno` (rota que
nem existe de verdade → 404). Corrigido as duas pra `.eq("auth_user_id",
...)`; procurei no projeto inteiro por outro `.eq("id", user.id)`/
`auth.uid()` parecido, não achei mais nenhum. Login retestado do zero,
funcionando limpo. **Lição**: uma mudança de "o que uma coluna significa"
(não só adicionar uma coluna nova) precisa de uma busca deliberada por
todo lugar que fazia a suposição antiga, não só nos arquivos óbvios
(`admin.ts`/`turmas.ts`) — o login e o middleware quase passaram batido
por serem os arquivos "de sempre", que eu não voltei a olhar depois da
mudança de schema.

### 2026-09-24 — Os outros 6 domínios (Forno, Oficinas, Pagamentos, Solicitações, Avisos, Alunos)

Diego: "JA VAI ADIANTANDO TD". Segui o mesmo processo de Turmas pra cada
domínio: mapear a tela real contra `supabase/schema.sql`, achar e
corrigir gaps ANTES de escrever query (mais barato agora, banco só tem
dado de teste, do que depois), escrever a Server Action, `tsc` limpo
antes de seguir pro próximo. **Todos os 7 domínios do plano de migração
agora têm camada de dados real escrita** (`src/lib/actions/*.ts`) —
nenhum ainda ligado às telas (esse é o próximo passo, tela por tela).

**Gaps de schema achados e corrigidos** (todos aditivos — só colunas/
tabelas novas, nada que quebra o que já existia):
- **Forno**: faltava `forno_id` (qual dos 2 fornos físicos — sem isso
  nem dava pra saber de qual forno uma queima é), `status` da fornada
  como registro (diferente de `etapa_atual`, que é só o progresso
  dentro de uma queima ativa — "interrompida"/"cancelada" são estados
  finais alternativos, não uma etapa), `categorias`/`detalhes_conteudo`
  direto em `queimas` (a UI já tinha, o schema não), e observações
  virou tabela própria (`queima_observacoes`) em vez de um campo de
  texto único — a UI precisa de uma lista com timestamp.
- **Oficinas**: faltava `status_pecas` por completo (Em secagem → ... →
  Prontas), `descricao`/`observacoes`/`receita` (jsonb) em `oficinas`,
  e `tipo`/`dupla_com` (individual/dupla) + `criado_em` (pra numerar
  vaga em ordem de chegada, mesmo padrão de Turmas) em
  `oficina_participantes`.
- **Solicitações**: `reposicoes` (já existia) não serve — exige um
  aluno já cadastrado, mas a tela trata pedido de vaga nova (gente que
  ainda não é aluna) e reposição como a mesma coisa, de propósito
  (regra já registrada no CLAUDE.md). Tabela nova `solicitacoes_vaga`,
  mais simples, só pro fluxo atual — `reposicoes` fica pra uma versão
  futura mais rigorosa.
- **Pagamentos**: nenhum gap — mas achei que o mock nunca criava um
  registro de cobrança de verdade, só DERIVAVA "pendente" olhando o
  roster. `cadastrarAluno` (Turmas) passou a criar a cobrança
  (`pagamentos`, status pendente) na hora de matricular, senão
  Pagamentos ficaria pra sempre vazio no mundo real.
- **Avisos**: nenhum gap, schema já tinha tudo desde a Fase 1.
- **Alunos**: nenhum gap de schema — mas o mock tinha DUAS fontes
  nunca unificadas de propósito (`vagasPorTurma` vs `alunosLista`,
  CLAUDE.md §5 Alunos). Com Supabase de verdade essa separação
  dissolve sozinha (as duas telas agora leem a mesma `profiles`/
  `pacotes`/`matriculas`) — a limitação documentada não se aplica mais
  à versão real, só ao mock.

**Reaproveitamento entre domínios** (evitar duplicar lógica): "Aprovar"
solicitação chama o mesmo `cadastrarAluno` de Turmas por baixo (mesmo
fluxo de criar profile+pacote+matrícula+cobrança) — não repete a lógica.

**Pedido novo de reset enviado ao Diego** (mesmo padrão do 2026-09-23) —
schema mudou bastante desde a última vez que ele rodou, mais simples
apagar e recriar (só dado de teste) do que migrar incremental. Depois de
confirmado, preciso recriar turmas + admin de teste de novo (mesmo passo
de sempre) antes de testar qualquer coisa nova ao vivo.

### 2026-09-24 (continuação) — Turmas ligada de verdade, primeiro bug de RLS achado em produção

Diego: "COMO DOU SEGUIMENTO AGORA" — comecei a ligar as telas nos dados
reais de verdade, uma por uma, começando por Turmas (a mais construída).

1. **`turmas/[turmaId]/page.tsx` virou Server Component** (busca
   `getRosterTurma`/`getTurmaPorSlug` no servidor) — a interatividade
   (tabs, modais, mutações) foi pra `src/components/turmas/
   TurmaDetalheClient.tsx`, novo Client Component. `TURMAS_DIAS`/
   `corTurma` extraídos pra `src/lib/turmasDias.ts` (server e client
   precisam do mesmo dado). Trocar de dia/turma agora navega pra outra
   rota (`<Link>`) em vez de trocar state local — cada slug busca seu
   próprio roster fresco no servidor; `key={slug}` no componente client
   força remount pra não ficar preso no roster antigo ao navegar.
2. **Achado real: rotas usam slug fixo (`ter-1830`), banco usa UUID** —
   `getTurmaPorSlug` (novo, turmas.ts) traduz um pelo outro comparando
   `dia`+`hora_inicio`, já que não dá pra mudar as URLs sem quebrar
   tudo que já aponta pra elas.
3. **Bug de segurança real, achado testando "cadastrar aluno" ao
   vivo**: `matriculas_admin_write` só cobria `for update` — nenhuma
   política de INSERT pro admin existia (só a de aluno pedindo a
   própria vaga, pendente). `cadastrarAluno`/`moverAluno` inserem
   matrícula direto — toda tentativa batia em "new row violates
   row-level security policy". Mandei um fix de 3 linhas (só essa
   policy, não precisou resetar nada) — `matriculas_admin_write` virou
   `for all`, mesmo padrão que toda outra tabela já usava. **Lição**:
   esse bug existe desde a primeira versão do schema (nunca foi eu que
   escrevi essa política errada nesta sessão) — só nunca tinha sido
   testado com um INSERT de verdade até agora. Prova de que testar
   contra um banco real (não só `tsc` limpo) pega uma categoria de erro
   que revisão de código sozinha não pega.
4. **Testado ao vivo, de ponta a ponta, os 3 fluxos principais**:
   cadastrar aluno (criou profile+pacote+matrícula+cobrança pendente,
   apareceu na hora "Pendente 0/4"), marcar presença (0/4 → 1/4,
   incrementou o pacote de verdade). Sem erro de console em nenhum dos
   dois. **Turmas é a primeira tela 100% real do projeto** — não só
   compilando, testada contra o banco de produção do Diego.

Próximo: repetir o mesmo padrão (Server Component + Client Component +
Server Actions já prontas) pros outros 6 domínios — Avisos primeiro
(mais simples, `AvisosCard.tsx` já existe só com state local).

### 2026-09-24 (continuação 2) — Avisos ligado; roster real sumiu e foi
### reconstruído; Alunos ligado; segundo bug de RLS achado

**Avisos**: `dashboard/page.tsx` busca `getAvisosReal()` no servidor,
`AvisosCard` virou `{ avisosIniciais }` + `useEffect` pra resincronizar
depois de `router.refresh()` (esse componente não remonta sozinho ao
navegar, diferente de `TurmaDetalheClient` que tem `key={slug}` —
mesmo problema, solução diferente: aqui é resync via prop, lá é
remount). Testado ao vivo: criar aviso ("Aviso de teste real") apareceu
na faixa preta na hora, remover sumiu — sem erro de console. Depois
apagado (era só teste).

**Achado grave, testando Turmas de novo antes de começar Alunos**: a
tela que "funcionava" no fim da sessão anterior (roster real de 14/14
alunos na Terça) agora mostrava **0/14, todas as vagas vazias**. Não
era bug de RLS/sessão (cheguei a suspeitar disso primeiro, já que
Avisos folgava exigindo `is_admin()`) — era perda de dado mesmo,
confirmado direto no banco via service_role: `profiles` só tinha 1
linha (o admin de teste), `matriculas`/`pacotes` zerados. Causa: o
roster de 46 alunos foi inserido por um script avulso (`setup-teste.mjs`,
sessão anterior) ANTES do reset completo de schema (drop+recreate) que
o Diego rodou pra aplicar os gaps dos 6 domínios (seção anterior) — o
reset apaga tudo em `public.*`, e ninguém rodou o seed de novo depois.
**Lição**: um "reset completo, só tem dado de teste mesmo" deixa de ser
verdade no instante em que um roster real é inserido por cima — depois
disso, todo pedido de reset precisa vir acompanhado de replantar esse
dado, não só recriar a conta de admin. Reconstruído com um script novo
(`seed-alunos-reais.mjs`, rodado e apagado, mesmo padrão de sempre) a
partir de `ALUNOS_REAIS` em `demo/AtelieDemo.jsx` (fonte já deduplicada
— não usei `VAGAS_POR_TURMA`, que tem Marina/Elisabeth repetidas por
causa de reposição; `ALUNOS_REAIS` é a versão "uma pessoa, uma linha"
que já é a certa pra um `profiles` real). Confirmado 46/46 criados,
contagem por turma batendo com CLAUDE.md (14/11/10/11), 14 pagamentos
pendentes. Também limpei um `pagamentos` órfão (`aluno_id` null) que
tinha sobrado de um teste anterior ("Ana Silva", já excluído antes
desta sessão) — `on delete set null` preserva a linha mesmo depois do
aluno sumir, então isso não era bug, só lixo de teste pra apagar.

**Alunos ligado**:
- `listarTurmas()` novo em `turmas.ts` (`{id, nome}[]`, ordenado por
  dia/hora) — os selects de turma em Alunos usam id de verdade em vez
  de label livre; confirmado que `turmas.nome` no banco já é
  exatamente "Terça 18:30" etc, então a cor-por-label que a tela sempre
  usou (`TURMA_LABEL_COR`) continua batendo sem tradução nenhuma.
- `src/lib/alunos.ts` (mock) perdeu `AlunoReal`/`alunosIniciais` — só
  sobrou a paleta de cor por turma, que continua válida. O tipo
  `AlunoReal` real agora vem só de `src/lib/actions/alunos.ts` (evita a
  colisão de nome entre os dois que já tinha sido sinalizada como risco).
- `alunos/page.tsx` virou Server Component (`getAlunosReal` +
  `listarTurmas`) + `AlunosListClient.tsx` novo (busca, acordeão por
  turma — ganhou um balde "Sem turma" a mais, silencioso se vazio, pra
  nunca esconder alguém sem matrícula ativa da lista por engano;
  cadastrar aluno reaproveita `cadastrarAluno` de turmas.ts).
- **Rota `/alunos/[index]` virou `/alunos/[id]`** (`git mv`) — índice de
  array não existe mais fazendo sentido contra dado real, id agora é
  `profiles.id` de verdade. `AlunoDetalheClient.tsx` novo: editar
  turma/pacote/pago (`editarAluno`), ação rápida "marcar como pago"
  sem abrir o formulário inteiro, excluir com confirmação.
- Testado ao vivo, ponta a ponta, num aluno descartável ("Teste Wiring
  Alunos", criado/editado/excluído só pra teste, nunca em cima de
  gente real): cadastrar → aparece com pendência automática; marcar
  como pago → pendência some; editar turma+pacote+aula → aluno migra
  de matrícula igual ao `moverAluno` de Turmas, contagem das duas
  turmas atualiza; excluir → **não funcionou** (ver bug abaixo).

**Segundo bug de RLS achado em produção**: excluir aluno voltava pra
`/alunos` sem erro nenhum, mas o profile continuava no banco (confirmei
via service_role). Causa: `profiles` tinha policy de `select`/`update`/
`insert`, mas **nenhuma de `delete`** — RLS nega por padrão quando não
existe policy pra a operação, sem lançar erro (o DELETE roda, casa 0
linhas, retorna sucesso). Mesma CATEGORIA do bug de `matriculas_admin_write`
achado na sessão anterior (política incompleta, não escrita errada) —
dessa vez em `profiles`. Corrigido em `schema.sql` (`profiles_admin_delete for
delete using (is_admin())`) e mandado pro Diego como patch de 1 linha
(`fix-profiles-delete-policy.sql`, mesmo padrão de patch pequeno de
sempre — não precisa resetar nada). O aluno de teste que ficou preso foi
limpo direto via service_role (bypassa RLS de propósito, é
manutenção, não ação de usuário). **Ainda esperando o Diego rodar o
patch** — até lá, excluir aluno na tela continua "funcionando" sem
avisar que não apagou nada de verdade (não travei a UI por causa disso;
o `editarAluno`/resto do fluxo não depende dessa policy).

`tsc` limpo depois de toda a mudança de Alunos.

Próximo: Pagamentos (mais simples, sem gap de schema, já teve
`mensagemCobranca`/`abrirWhatsAppCobranca` extraídas na sessão
anterior) ou Solicitações — ainda não decidido qual primeiro.

**Checagem rápida de toda a RLS do schema** (motivada pelo 2º bug
seguido de policy incompleta) — li todas as `create policy` de uma vez
em vez de só a tabela que deu problema. Achado um terceiro caso do
mesmo padrão (`reposicoes_admin_update` só cobre `for update`, sem
insert/delete pro admin), mas **não mexi** — essa tabela não é usada
por nenhuma Server Action ainda (Solicitações usa `solicitacoes_vaga`,
tabela nova, de propósito — ver seção anterior), então não é um bug
ativo agora; só fica anotado pra quando/se `reposicoes` entrar em uso
de verdade. Todo o resto (`pacotes`, `matriculas`, `aulas`, `presencas`,
`oficinas`, `oficina_participantes`, `queimas` e as 3 tabelas
associadas, `notificacoes`, `pagamentos`, `avisos`, `solicitacoes_vaga`)
tem cobertura `for all`/admin completa — sem outro gap escondido.

**Pagamentos ligado** — o domínio mais simples até agora, sem gap de
schema. `pagamentos/page.tsx` virou Server Component (`getPagamentosReal`)
+ `PagamentosClient.tsx` novo. Único ajuste de comportamento real: o
mock (`pagamentosIniciais()`) só DERIVAVA pendentes do roster, então a
variável `pagamentos` ali dentro já era implicitamente "só pendente" —
`getPagamentosReal()` devolve pendente E pago de verdade agora, então
os cálculos dos StatCards precisaram de um filtro explícito por
`status` que antes não fazia falta (sem isso, "Pendente"/"Alunos"/
"Ticket médio" contariam pagos também, que é errado pros rótulos).
"Recebido" deixou de ser `TODO(0 fixo)` e virou soma real de `pago` —
hoje ainda mostra R$0 porque nenhum pagamento real tem `valor`
preenchido (mesma leva de dado do Diego nunca trouxe isso), mas a
conta em si já está certa pra quando existir. Testado ao vivo num
aluno descartável (criado via Alunos, cobrança pendente automática):
busca filtra os StatCards + as duas listas junto, "Cobrar no WhatsApp"
mostra a mensagem certa sem "R$ null" (bug antigo do mock, já corrigido
antes, confirmado que continua corrigido aqui), "Marcar como pago"
(a Server Action `marcarComoPago`, ainda não exercida por nenhum outro
teste até agora — o atalho equivalente em Alunos usa `editarAluno`, um
caminho diferente) moveu o pendente pro histórico como "Pago" na hora,
sem erro de console. Aluno de teste removido depois (via service_role,
mesmo motivo do de Alunos — a policy de delete de `profiles` ainda não
foi aplicada pelo Diego).

`tsc` limpo. Domínios ligados até aqui: **Turmas, Avisos, Alunos,
Pagamentos**. Faltam: Solicitações, Oficinas, Forno.

**Solicitações ligado** — sem gap de schema (`solicitacoes_vaga_admin_all`
é `for all`, sem surpresa de RLS desta vez). `solicitacoes/page.tsx`
virou Server Component (`getSolicitacoesReal` + `listarTurmas`, pro
label da turma no modal de aprovar) + `SolicitacoesClient.tsx` novo.
"Aprovar" chama `aprovarSolicitacao`, que por baixo reaproveita o mesmo
`cadastrarAluno` de Turmas (sem duplicar criação de profile+pacote+
matrícula+cobrança) e marca a solicitação como `aprovada`; "Recusar" só
marca `recusada` — nenhuma linha é apagada, mesmo padrão do resto do
app. **A lista real começa (e continua) vazia** — as 3 solicitações que
sempre apareceram no mock nunca foram dado real do Diego (documentado
desde que a tela foi feita), e não existe ainda um jeito de um aluno de
verdade CRIAR uma solicitação (Área do Aluno não existe) — então "zero
solicitações pendentes" é o estado real correto, não bug nem
regressão. Testado ao vivo com 2 linhas de teste inseridas na mão via
service_role (`solicitacoes_vaga`, nomes "Teste Wiring Solicitação
Aprovar/Recusar") especificamente pra poder exercitar os dois botões
sem esperar uma solicitação real acontecer: aprovar abriu o modal com o
nome certo da turma (`Terça 18:30`, via `listarTurmas`), confirmou,
criou o aluno de verdade na turma (verificado direto depois, contagem
Terça voltou a 15 e depois a 14 após a limpeza) e sumiu da lista;
recusar sumiu da lista na hora. Sem erro de console nos dois. Limpeza
depois: as 2 linhas de teste em `solicitacoes_vaga` E o profile/pacote/
matrícula/pagamento reais que a aprovação criou — tudo via service_role
(mesmo motivo de sempre, a policy de delete de `profiles` ainda não foi
aplicada).

`tsc` limpo. Domínios ligados até aqui: **Turmas, Avisos, Alunos,
Pagamentos, Solicitações**. Faltam: Oficinas, Forno — os dois maiores/
mais complexos (Oficinas tem participantes+receita+status de peças;
Forno tem 2 fornos independentes + o motor de cálculo de queima).

**Achado igual ao dos alunos, desta vez em Oficinas — outra leva de
dado real nunca tinha sido inserida na tabela.** `demo/AtelieDemo.jsx`
documenta explicitamente (comentário acima de `oficinasIniciais()`):
"Agenda real passada pelo Diego em 2026-09-17... substitui as oficinas
fictícias antigas" — as 6 oficinas (3× Kit Café da Manhã, Enfeites de
Natal, Peças Marmorizadas, datas de out/nov/dez 2026) são dado real, não
mock, só nunca tinham sido semeadas na tabela `oficinas` (que sempre
esteve vazia desde a Fase 1). Resseeded com `seed-oficinas-reais.mjs`
(rodado e apagado, mesmo padrão) — datas convertidas do formato de
exibição ("10 de Outubro de 2026") pro ISO que a coluna `date` do banco
exige, valor/vagas mantidos `null`/12 exatamente como o comentário
original já documentava (não informados nessa leva, não inventados
agora). **Diferente de Solicitações** (onde vazio era o estado real
correto) — aqui vazio teria sido uma REGRESSÃO, escondido até eu
comparar contra o comentário do demo antes de aceitar "0 oficinas" como
resultado esperado.

**Oficinas ligado** — o domínio com mais peças até agora (lista +
detalhe + participantes + status de peças + criar/editar oficina).
Único ajuste estrutural real: o mock representava data/hora como STRING
livre de exibição ("10 de Outubro de 2026", "16:00 às 19:00" — decisão
antiga, CLAUDE.md, "não date-picker, o app já representa por extenso"),
mas o schema real guarda `date`/`time` estruturados de verdade — não dá
pra editar uma oficina existente sem saber o valor bruto (ISO) pra
pré-preencher o formulário, e `OficinaReal` só tinha a versão já
formatada pra exibição. **Isso não reabre a decisão de exibição**
(continua "10 de Outubro de 2026" em todo canto que mostra a data) — só
o FORMULÁRIO de criar/editar virou inputs `type="date"`/`type="time"`
estruturados, e `OficinaReal` ganhou `dataISO`/`horaInicioRaw`/
`horaFimRaw` (crus, só pro formulário) ao lado de `data`/`hora`
(formatados, pra exibição — os dois convivem, escopos diferentes).
`ModalOficina.tsx` reescrito nesse sentido (reaproveitado nos dois
modos, criar/editar, mesmo padrão de antes). `src/lib/oficinas.ts`
podado igual ao de Alunos — só sobrou `corOficina`/`CorIdentidade`
(hash determinístico do id pra cor, continua válido), `Oficina`/
`Participante`/`oficinasIniciais`/`vagasVazias` saíram (tipo real agora
vem só de `actions/oficinas.ts`).

Testado ao vivo, ponta a ponta, nas 6 oficinas reais + 1 descartável
("Teste Wiring Oficina Nova", criada só pra exercitar "Nova oficina" e
apagada depois): cadastrar participante (1/12 → pendente), avançar
status das peças (Em secagem → Biscoitadas, depois revertido pra não
deixar dado real de uma oficina futura num estado errado), editar
oficina abrindo o modal numa oficina REAL pra confirmar que
dataISO/horaInicioRaw/horaFimRaw pré-preenchem certo (2026-10-10/16:00/
19:00, conferido, fechado sem salvar pra não alterar a oficina real à
toa), remover participante, criar oficina nova (data 01/10, ordenou
certo antes da de 10/10 na lista) e editar essa com um valor de verdade
(R$80, salvou e refletiu). Sem erro de console em nenhum passo. Limpeza
final: participante e oficina de teste removidos (esses DELETE
funcionam de verdade — `oficina_participantes`/`oficinas` já tinham
policy completa desde o início, diferente do gap achado em `profiles`).

`tsc` limpo. Domínios ligados até aqui: **Turmas, Avisos, Alunos,
Pagamentos, Solicitações, Oficinas**. Falta só **Forno** — o mais
complexo (2 fornos físicos independentes, motor de cálculo de queima
tipado que já existe em `src/lib/forno.ts` e precisa ser reaproveitado,
não reescrito).

**Forno ligado — último dos 7 domínios.** `forno/page.tsx` virou Server
Component (`getFornadasReal("forno1")` + `getFornadasReal("forno2")` em
paralelo) + `FornoClient.tsx` novo (todo o conteúdo de `forno/page.tsx`
antigo, só a casca mudou). Decisão central: a forma local `Fornada` (com
`Date` de verdade, igual sempre foi) foi MANTIDA como estava — só um
`paraFornadaLocal(f: FornadaReal): Fornada` novo converte
`iniciadoEm`/`finalizadoEm`/`leituras[].em`/`observacoes[].em` de string
ISO (formato do banco) pra `Date` antes de qualquer cálculo. Isso deixa
`calcularPrevisao`/`ETAPA_LABEL`/`formatarDuracao` (`src/lib/forno.ts`)
INTOCADOS — exatamente a regra do CLAUDE.md ("não criar lógica separada
de recalcular, é sempre a mesma função"). `iniciarFornada` real também
simplificou o client: o servidor já interrompe sozinho qualquer fornada
'andamento' daquele forno antes de criar a nova (mesma regra do demo),
então o handler client-side não precisa mais fazer esse "substituir"
manualmente, só chamar a action e dar refresh.

**Achado de modelagem, não bug**: `queimas.etapa_atual` (coluna no banco)
NÃO é o que a tela usa pra mostrar "Etapa atual" — isso sempre foi (e
continua sendo) calculado AO VIVO por `calcularPrevisao(params, agora)`
a cada render (o `agora` troca a cada segundo, via `setInterval`), já
que só assim "Patamar"/"Resfriando"/"Aguardando segura" progridem
sozinhos sem precisar de update no banco a cada transição. A coluna no
schema é só um marcador grosso (só muda em `iniciarFornada`/
`finalizarFornada`) — não precisava ser lida pra nada na UI, e não foi.

Testado ao vivo, ponta a ponta, nos 2 fornos (que começaram vazios de
verdade — `queimas` nunca teve dado real nenhum, as 4 fornadas do mock
eram só cenários de demonstração fictícios, diferente de Alunos/
Oficinas): nova fornada (Esmalte, Peças de alunos) → painel calculou
certo (ProgressRing, previsão de máxima/patamar/abertura segura, todos
os StatCards) desde o primeiro render; atualizar temperatura (310°C) →
recalibrou a previsão em tempo real (previsão de máxima mudou de 22:17
pra 20:43, confirmando que a recalibração pela leitura real está
funcionando com dado de verdade); adicionar observação → apareceu com
timestamp; editar conteúdo (Encomendas adicionada) → refletiu; cancelar
fornada → virou "Cancelada" no histórico, painel voltou pro estado
vazio; segunda fornada criada e finalizada → virou "Finalizada"; Forno 2
conferido em paralelo, histórico vazio, totalmente independente do
Forno 1 (confirma que `forno_id` isola os dois de verdade em cada
camada — query, interromper-ao-criar, tudo). Sem erro de console em
nenhum passo. Limpeza final: as 2 fornadas de teste apagadas via
service_role (tabela começou vazia, seguro apagar tudo que tinha ali).

## Os 7 domínios estão todos ligados a dados reais

Turmas, Avisos, Alunos, Pagamentos, Solicitações, Oficinas e Forno — os
7 domínios do plano de migração (`C:\Users\Usuario\.claude\plans\
zippy-frolicking-token.md`, Fases 2-8) agora leem e escrevem no Supabase
de verdade, cada um testado ao vivo contra o banco de produção do
Diego, não só `tsc` limpo. Nesta rodada (2026-09-24, a mesma sessão
inteira, disparada por "JA VAI ADIANTANDO TD"):
- **2 buracos de RLS reais encontrados e corrigidos** (além do de
  `matriculas` da sessão anterior): `profiles` sem policy de `delete`
  (excluir aluno não fazia nada, sem erro) — patch enviado ao Diego,
  ainda não aplicado, contornado via service_role nos testes/limpezas
  desta sessão. Nenhum outro buraco achado numa revisão completa de
  todas as policies do schema (só uma tabela não-crítica, `reposicoes`,
  ficou com uma assimetria parecida, mas não é usada por nenhuma tela
  ainda — anotado, não corrigido, fora de escopo até entrar em uso).
- **2 levas de dado real perdidas e reconstruídas**: o roster de 46
  alunos (sumiu no reset de schema v2, nunca foi re-semeado) e as 6
  oficinas reais que o Diego passou em 2026-09-17 (nunca tinham sido
  semeadas na tabela `oficinas`, só existiam no mock). As duas achadas
  comparando contra o que `demo/AtelieDemo.jsx` já documentava como
  real, não assumindo que "vazio" era sempre o estado esperado.
- **Ajustes estruturais genuínos** (não reabertura de decisão de
  produto): Alunos ganhou rota `/alunos/[id]` (era `/alunos/[index]`,
  sem sentido contra dado real); Oficinas ganhou inputs de data/hora
  estruturados no formulário de criar/editar (mantendo a EXIBIÇÃO por
  extenso em português em todo canto, só a entrada de dado mudou).

**Ainda não ligado**: o Dashboard continua com KPIs/card de forno/
agenda semanal/preview de oficinas/preview de solicitações mockados —
não é um domínio próprio, é uma tela de agregação que só faz sentido
ligar DEPOIS que as fontes existem de verdade (agora existem todas).
Próximo passo natural.

### 2026-09-24 (continuação 3) — Dashboard ligado, migração dos 7 domínios completa

Último passo da mesma leva ("JA VAI ADIANTANDO TD") — o Dashboard nunca
foi um domínio próprio, só agregava as 7 fontes; com todas reais, ligar
virou só orquestração.

- **`AgendaSemanaCard.tsx`**: deixou de gerar seu próprio mock
  (`AGENDA_SEMANA`) e virou `{ aulasPorDia }` — só a estrutura ESTÁTICA
  da semana (quais 7 dias existem, label, cor de identidade) continua
  local ao componente, porque isso é layout, não dado. O conteúdo
  dinâmico (roster por turma, oficinas da semana) vem do servidor.
- **`dashboard/page.tsx`** virou um Server Component que busca as 7
  fontes em paralelo (`Promise.all`) e agrega:
  - **KPIs**: "Aulas hoje" conta `TURMAS_DIAS` pro dia da semana atual
    (sem query — é estrutura fixa); "Alunos confirmados" busca o
    roster real de hoje (`getRosterTurma`) e exclui quem está
    `statusAula === "ausente"`; "Reposições pendentes" e "Pagamentos
    pendentes" viram contagens reais de `getSolicitacoesReal`/
    `getPagamentosReal` (antes eram números fixos, 2 e 5).
  - **Cards de forno**: `fornadaResumo()` pega a fornada `andamento` de
    cada forno (se houver) e converte pro formato que `FornoResumoCard`
    já esperava (mesma conversão ISO→Date de `FornoClient`, só que
    reduzida — não precisa do histórico inteiro aqui).
  - **Agenda da semana**: busca roster real das 4 turmas fixas + casa
    as oficinas reais contra as 7 datas calendário desta semana
    (comparação de string ISO, mesmo cálculo de segunda-feira que
    `AgendaSemanaCard`/`turmas.ts` já usavam, reescrito aqui porque
    Server Components não importam de "use client").
  - **Próximas oficinas**: `getOficinasReal()` filtrado por
    `dataISO >= hoje`, 2 primeiras, badge "Faltam N dias" calculado de
    verdade.
  - **Solicitações pendentes**: 3 primeiras de `getSolicitacoesReal()`,
    label da turma via `listarTurmas()`.

Testado ao vivo (quinta-feira, 24/09, sem nenhuma fornada ativa nem
solicitação pendente no momento — estado real limpo depois das
limpezas dos testes anteriores): **"Aulas hoje" = 2** (Quinta tem 2
turmas, batendo com o dia real), **"Alunos confirmados" = 21** (10 da
Quinta 14:30 + 11 da Quinta 18:30, nenhum ausente ainda essa semana),
"Reposições"/"Pagamentos pendentes" = 0/14 (batendo exatamente com
Solicitações/Pagamentos reais), os 2 cards de forno "Nenhuma fornada
ativa", agenda da semana mostrando as 4 turmas reais com occupação e
avatares corretos (Terça 14/14, Quarta 11/12, Quinta 10/12 e 11/12,
selo "HOJE" na Quinta certo), Sábado/Segunda/Sexta/Domingo com as
mensagens de dia vazio de sempre, "Próximas oficinas" mostrando as 2
primeiras das 6 reais com contagem de dias certa (16 e 30, conferido
manualmente), "Solicitações pendentes" mostrando o estado vazio real.
Sem erro de console. `tsc` limpo.

**Os 7 domínios (Turmas, Avisos, Alunos, Pagamentos, Solicitações,
Oficinas, Forno) MAIS o Dashboard que os agrega — toda a área
administrativa do Next.js está ligada ao Supabase de verdade agora,
testada ao vivo tela por tela.** Nenhum commit feito nesta sessão
inteira (regra do CLAUDE.md §7 — repo só local, sem remoto — e a regra
de só commitar quando pedido explicitamente).

**O que ainda falta, pro app inteiro (não só o admin)** — lista original
desta rodada, ver atualizações abaixo pro estado real de cada item:
1. Diego aplicar o patch pendente `profiles_admin_delete` (RLS de
   delete faltando — "Excluir aluno" não apaga de verdade até isso
   rodar, contornado com service_role só nos testes desta sessão).
2. Área do Aluno — não existe nem um arquivo ainda, é a Fase 9 do
   plano original, escopo grande (nav própria, Turmas só-leitura,
   Oficinas, histórico pessoal), não começada.
3. Fase 11 (deploy real na Vercel) e Fase 12 (PWA instalável de
   verdade) do plano em `zippy-frolicking-token.md`.
4. As 2 CVEs críticas do Next 14 sem patch (`GHSA-p293-qw3h-jr36`/
   `GHSA-2xp9-vwfh-vxw4`, documentadas em CLAUDE.md §3) — decisão de
   upgrade de major ainda pendente do Diego, avisar antes do deploy.

### 2026-09-24 (continuação 4) — 5ª turma (Segunda 09:30–11:30) + login por convite

**Diego confirmou que rodou o patch `profiles_admin_delete`** (item 1 da
lista acima — resolvido, ver teste ao vivo mais abaixo). Também avisou
que o roster que ele passou é dado real de verdade (já tratado como tal
a sessão inteira) e que edições futuras dos alunos ficam por conta dele
mesmo, pela tela — não é mais pra eu editar dado na mão.

**Turma nova — Segunda 09:30 às 11:30.** Diego pediu direto no chat, sem
capacidade nem cor especificadas. Decisões tomadas por conta própria (e
avisadas): capacidade 12 (padrão das turmas "normais", só Terça foge
disso por causa do overflow real documentado no CLAUDE.md); cor de
identidade nova, **"ocre"** (`168 130 58`, dourado-terroso — dentro do
tema de pigmento de argila das outras 4, deliberadamente fora da família
do `--accent`, mesma regra de sempre). Tocado nos dois codebases:
- **Next.js**: `--ocre` em `globals.css` + `tailwind.config.ts`;
  `TURMAS_DIAS`/`TURMA_COR` em `turmasDias.ts`; `TURMA_LABEL_COR` em
  `alunos.ts`; e os ~12 `Record<CorIdentidade, string>` espalhados em
  `TurmaDetalheClient`/`AlunosListClient`/`AlunoDetalheClient`/
  `AgendaSemanaCard` — o próprio `tsc` apontou exatamente quais Records
  estavam incompletos depois de eu adicionar "ocre" ao tipo `CorIdentidade`
  (união de 5 valores agora), então nenhum ficou pra trás por engano.
  Turma real inserida na tabela `turmas` via service_role (é um INSERT
  comum, não precisa de patch — DDL é que eu não posso rodar sozinho).
- **Demo**: mesma decisão espelhada — `TURMAS_DIAS`, `CORES_IDENTIDADE`/
  `CORES_ORDEM` (ocre ENTRA na rotação, diferente de carvão, porque é cor
  de turma de verdade), `TURMA_COR`/`TURMA_LABEL_COR`/`TURMA_ID_PARA_LABEL`,
  `VAGAS_POR_TURMA` (reaproveitou `vagasVazias()`, já existia pra
  Oficinas — mesmo formato `{numero, nome}`, não duplicou a função),
  `AGENDA_SEMANA`. Confirmado por leitura de código (não só suposição)
  que o demo NUNCA teve Records estáticos por cor pros pills/cards de
  Turmas — tudo passa por `rgbCor()`/`corTurma()` calculados na hora, TAILWIND
  arbitrário sem classes customizadas — só o Next.js precisa dos Records
  porque lá as cores viraram classes reais do Tailwind
  (`tailwind.config.ts`), que exige literal string pro JIT compilar.
  Isso poupou uma rodada inteira de edições que pareceriam necessárias
  mas não eram.

Testado ao vivo no `preview:demo` (Vite, não depende de sessão/Supabase):
aba "Seg" aparece, roster vazio (12 vagas, 0/12), cor certa no chip/card,
fundo com parallax funcionando na tela de Turmas — sem erro de console.
`tsc` limpo no Next.js.

**Foto real pra "ocre" (mesmo dia, mensagem seguinte)** — o Diego mandou
uma foto de mesclagem de argila dourada, bateu quase exatamente com a
cor que eu já tinha escolhido. Processada com Pillow (só o Python tinha
biblioteca de imagem disponível — `sharp` do Node não estava instalado):
mesma receita já documentada no CLAUDE.md pras outras 4 fotos (941×1672
original → 480px de largura, JPEG qualidade 75, ~84KB, bem dentro da
faixa 76-98KB dos arquivos existentes). Salva em dois lugares:
`public/fundos/ocre.jpg` (Next.js, arquivo estático de verdade) e
embutida em base64 no `FUNDOS_ARGILA` do demo (inserção feita por script
Python direto no arquivo-texto, sem o base64 nunca passar pelo meu
próprio contexto — mesma disciplina já estabelecida nesta sessão pra
evitar gastar tokens com 100KB+ de texto codificado). **Achado
importante**: como `FUNDOS_ARGILA[cor]` já era consultado dinamicamente
em TODO lugar que usa fundo de turma (card do Dashboard, fundo com
parallax da tela de Turmas, nos dois codebases), adicionar a entrada
"ocre" no dicionário foi a ÚNICA mudança de código necessária — nenhum
componente precisou de edição extra, a foto passou a aparecer sozinha
em todo canto relevante. Confirmado por screenshot no demo (mobile): os
cards de Segunda e Terça lado a lado na Home, cada um com sua própria
foto; fundo com parallax de Segunda na tela de Turmas, igual às outras.

### Login por convite — Área do Aluno, primeira fatia

Diego respondeu a pergunta em aberto de "como o aluno vai logar": **convite
por telefone/nome** — admin já cadastrou nome+telefone quando matriculou
alguém, o aluno só define a própria senha depois, via link, sem
recadastrar nada. Isso já tinha sido antecipado no comentário do schema
quando `profiles` foi desacoplado de `auth.users` (2026-09-23: "aluno só
quando/se a Área do Aluno existir de verdade e ele aceitar um convite") —
não é uma decisão nova brigando com a arquitetura, é o schema cumprindo o
que já tinha sido desenhado pra isso.

**Peças construídas**:
- `profiles` ganhou `convite_token uuid` / `convite_expira_em timestamptz`
  (schema.sql + patch de 2 linhas mandado pro Diego rodar — aplicado,
  confirmado ao vivo). Verificação/consumo do convite inteiramente em
  código (`src/lib/actions/convite.ts`, service_role) — decisão
  deliberada de NÃO abrir nenhuma policy de leitura pública em `profiles`
  pra isso, mesmo sendo tecnicamente possível com uma RLS bem estreita
  (`convite_token is not null`); prefiro manter RLS conservador numa
  tabela sensível e resolver no application layer, que já tem controle
  fino de validação (expiração, conta já ativa, telefone ausente).
- **Login por TELEFONE, não e-mail** — a leva de dado real nunca trouxe
  e-mail de aluno nenhum. Supabase Auth aceita `phone`+`password` direto
  (sem SMS) quando a conta é criada pelo Admin API com `phone_confirm:
  true` — a "verificação de posse do número" aqui é o próprio link de
  convite (só quem tem o link/WhatsApp da pessoa consegue chegar até a
  tela de definir senha), não um OTP por SMS de verdade (exigiria
  provedor configurado, fora de escopo/custo). `normalizarTelefoneE164`
  (duplicada pequena, em `convite.ts` e `login/page.tsx` — 3 linhas cada,
  não valeu a pena um módulo compartilhado só pra isso) assume DDI +55
  quando o número não vem com código de país, já que todo telefone dado
  até agora é brasileiro sem DDI.
- `gerarConvite`/`verificarConvite`/`aceitarConvite` — o terceiro faz
  tudo numa Server Action só: cria o `auth.users` (Admin API), linka
  `profiles.auth_user_id`, limpa o token (não dá pra reusar o link depois
  de aceito) e **assina o aluno de verdade na mesma ida**, usando o
  client normal (não o admin) pra escrever os cookies de sessão certos
  no mesmo request — evita uma segunda ida manual à tela de login logo
  depois de criar a conta.
- **Admin UI**: botão "Convidar pro app" em `AlunoDetalheClient` (dentro
  do card de contato) — desabilitado/com aviso se o aluno não tem
  telefone cadastrado (a mecânica inteira depende disso); se já tem
  conta ativa, mostra badge "Já usa o app" em vez do botão. Ao gerar,
  abre modal com o link + "Copiar link" + "Enviar no WhatsApp" (mesmo
  padrão visual/UX já usado em Pagamentos pra cobrança).
- **Página pública** `/convite/[token]` (fora de `(admin)`/`(auth)`,
  sem sessão nenhuma) — `middleware.ts` precisou de um ajuste pra
  liberar esse caminho sem exigir login (antes só `/login` era exceção;
  virou uma checagem `publica = path === "/login" || path.startsWith
  ("/convite")`). Convite inválido/expirado mostra uma mensagem simples
  em vez de erro; convite válido mostra o form de definir senha
  (`AceitarConviteClient`, novo componente).
- **Login (`/login`) ganhou um campo só, "e-mail ou telefone"** em vez de
  dois fluxos separados — detecta pelo formato ("@" → e-mail; senão,
  telefone) em vez de pedir pro usuário escolher. Admin continua
  logando com e-mail (nada mudou pra ele); aluno loga com telefone.
- **Início mínimo da Área do Aluno** (`(aluno)/aluno/page.tsx`) — só o
  suficiente pra provar que o ciclo inteiro funciona: nome, turma, anel
  de progresso do pacote (cor de identidade da turma, mesmo padrão visual
  do admin), status de pagamento, botão "Sair". Reaproveita `getAlunoReal`
  (mesma função que a tela admin de Alunos usa) — o aluno só enxerga a
  própria linha porque a RLS de `matriculas`/`pacotes`/`pagamentos` já
  tinha `aluno_id = current_profile_id() or is_admin()` desde a Fase 1,
  nunca antes exercida por uma sessão de aluno de verdade. **Resto da
  Fase 9 (Turmas só-leitura, Oficinas, histórico) fica pra depois,
  deliberadamente** — este pedido era especificamente sobre o mecanismo
  de login, não o escopo inteiro da Área do Aluno.
- `sair()` (`src/lib/actions/auth.ts`) — primeiro logout que existe no
  projeto inteiro (nem o admin tinha um até agora). Só wireado no
  `/aluno` por enquanto — dar o mesmo botão pro admin/Sidebar é um gap
  real mas separado, não bundlado aqui sem pedido.

**Testado ao vivo, ponta a ponta, com um aluno descartável** (perfil +
pacote + matrícula na Segunda 09:30, a turma nova, que não tem gente
real ainda — seguro testar ali): gerado um convite direto via
service_role (sem precisar do botão do admin, que eu não conseguia
clicar por causa da sessão expirada — ver achado abaixo), acessada a
página `/convite/[token]` numa aba nova (não precisa de sessão nenhuma,
confirmado), form preenchido e enviado. **Resultado real**: conta criada
e vinculada com sucesso (`auth_user_id` preenchido, `convite_token`
limpo, confirmado direto no banco) — mas o LOGIN AUTOMÁTICO falhou com
"Phone logins are disabled", erro tratado corretamente pelo código
(mensagem clara pro usuário, nada quebrou). Teste isolado adicional via
Admin API (`createUser` direto, sem passar pelo convite) confirmou que
CRIAR um usuário por telefone funciona sem config nenhuma — só o
SIGN-IN de usuário comum por telefone é que está desligado.

**Bloqueio real pendente, fora do meu alcance**: preciso que o Diego
habilite "Phone" em Authentication → Providers no painel do Supabase
(configuração do projeto, não é SQL nem código — não tenho como fazer
isso pelos meus scripts). Sem isso, NENHUM aluno consegue logar depois
de aceitar o convite (nem automático nem manual na tela de login) — a
conta existe, só não tem como entrar nela. Assim que ligar, não precisa
de nenhuma mudança de código — o fluxo já está construído e testado até
esse ponto exato.

Aluno de teste + conta auth removidos depois (service_role, mesmo
padrão de sempre). `tsc` limpo. Nenhum commit feito.

**Ainda pendente, minha sessão de teste no navegador**: o servidor dev
caiu durante uma pausa por limite de uso desta mesma conversa (reiniciado
com sucesso) — perdi a sessão de admin autenticada de novo no processo.
Não travou o trabalho desta vez porque o fluxo de convite é
majoritariamente público, mas ainda não consegui confirmar visualmente o
botão "Convidar pro app" em si (só a lógica por trás, via service_role).

### 2026-09-24 (continuação 5) — Área do Aluno: Turmas + Oficinas, resto da Fase 9

Diego: "continue" — segui direto pro resto da Fase 9 (nav própria, Turmas
só-leitura + solicitar vaga, Oficinas). "Histórico" não virou aba
própria de propósito — mesma limitação de sempre (histórico de presença
por data não existe em lugar nenhum do sistema ainda), uma aba
praticamente vazia só pra existir seria pior que não ter; o Início já
mostra o estado atual do pacote, que é o que existe de verdade hoje.

**Peças construídas**:
- `AlunoNav.tsx` — mesma pílula de vidro flutuante do admin
  (`MobileNav.tsx`), só 3 abas (Início/Turmas/Oficinas).
- `src/lib/actions/alunoPortal.ts` — leituras/ações do aluno. Ponto
  central: `matriculas_select`/`oficina_participantes_select` só liberam
  `aluno_id = current_profile_id()` pra quem não é admin (regra desde a
  Fase 1) — uma contagem de ocupação feita pelo client normal numa
  sessão de aluno só veria a PRÓPRIA linha, não o total da turma/oficina.
  `getTurmasParaAluno`/`getOficinasParaAluno` usam service_role de
  propósito só pra isso (contagem agregada), nunca expondo nome/dado de
  outro aluno — a única coisa "de outra pessoa" que sai daqui é um
  número. A própria participação do aluno (`minhaParticipacao` em
  Oficinas) é filtrada pelo próprio id dentro da mesma função.
  `solicitarVaga` é o oposto — client normal, RLS de verdade
  (`aluno_id = current_profile_id()`), sem service_role.
- **Schema**: `solicitacoes_vaga` ganhou `aluno_id` (nullable — só
  preenchido quando vem de um aluno logado de verdade, `nome` continua
  existindo pras entradas antigas/manuais do admin) + policy de insert
  pro aluno. Patch mandado pro Diego, **ainda não aplicado** — testado
  que falha do jeito certo (mensagem de erro clara) contra o schema
  atual.
- `/aluno/turmas` — as 5 turmas fixas com ocupação real, "Solicitar
  vaga" abre um modal de 2 opções (vaga nova / reposição), sem pedir
  pro aluno escolher entre as duas telas — mesmo texto livre (`tipo`)
  que Solicitações do admin já usa, só que agora criado pelo aluno em
  vez de digitado à mão.
- `/aluno/oficinas` — lista real (mesma fonte que o admin, `oficinas`
  é `select` público pra qualquer autenticado desde a Fase 1), read-only
  de verdade: se o aluno está inscrito numa oficina, mostra status das
  peças (mesmas 4 etapas do admin) e status de pagamento, sem botão
  nenhum de editar — mesma regra "só admin altera" já documentada.

**Bug real de build achado e corrigido**: `formatarData`/`formatarHora`
viviam dentro de `src/lib/actions/oficinas.ts` (arquivo `"use server"`).
Funcionavam enquanto só esse arquivo as usava — quebraram o build assim
que `alunoPortal.ts` tentou importá-las de fora ("Server actions must be
async functions": TODA export de um arquivo `"use server"` vira Server
Action, que É OBRIGADA a ser async — funções puras não podem viver ali
se algo de fora precisa importá-las). Extraídas pra
`src/lib/formatarData.ts` (sem `"use server"`), reimportadas nos dois
lugares. Documentado em CLAUDE.md §8 como armadilha — é o tipo de erro
que só aparece na hora de REUSAR algo que já existia, não na primeira
vez que foi escrito.

**Saga de infraestrutura, mesma investigação**: depois do fix acima, o
navegador embutido continuou mostrando o erro de build ANTIGO — mesmo
com `tsc` limpo, mesmo depois de `preview_stop`/`preview_start` várias
vezes, mesmo depois de apagar `.next` inteiro. Causa raiz real, achada
com `netstat -ano` + `Get-Process`: um processo `node` ÓRFÃO preso na
porta 3000 desde 3h+ antes — a ferramenta de preview achava que tinha
matado/reiniciado o servidor, mas esse processo antigo nunca morreu de
verdade e continuava respondendo com o código velho em memória.
Confirmado com `curl localhost:3000/dashboard` direto (fora do navegador
embutido) — resposta limpa, prova de que o SERVIDOR já estava certo e o
problema era só a conexão do painel. Matei o processo (`Stop-Process -Id
<pid> -Force`) e fechei/reabri as abas do navegador embutido — resolveu
os dois problemas de vez. Documentado em CLAUDE.md §8 (o `curl` direto
como primeiro passo de diagnóstico é o achado mais reaproveitável aqui,
evita repetir a mesma investigação longa da próxima vez).

**Achado um segundo bug real, testando "Solicitar vaga" sem sessão
nenhuma** (não tinha como testar com sessão de aluno de verdade — ainda
sem login por telefone habilitado): o erro ("Não autenticado.") virava
uma promise rejeitada sem tratamento nenhum no client — modal ficava
preso, sem nenhuma mensagem pro usuário, só um erro no console que
ninguém real veria. `AlunoTurmasClient` ganhou um `try/catch` de
verdade + estado de erro exibido no modal, mesmo padrão já usado em
todo formulário do resto do app — achado só porque tentei o caminho de
erro de propósito (sem sessão), não porque o caminho feliz revelou isso.

**Testado ao vivo**, ainda sem sessão de aluno de verdade (bloqueado
pelos 2 pendentes já conhecidos — login por telefone desativado +
coluna `aluno_id` não aplicada): `/aluno/turmas` e `/aluno/oficinas`
renderizam com dado 100% real e correto mesmo sem sessão de admin nem
de aluno válida (por design — as contagens vêm de service_role, não de
RLS de sessão), confirmando a turma nova (Segunda 0/12), o roster real
das outras 4 (14/14, 11/12, 10/12, 11/12) e as 6 oficinas reais, tudo
sem erro de console depois do fix. "Solicitar vaga" testado até o ponto
onde a falta de sessão bloqueia (erro tratado corretamente, mensagem
clara). Não deu pra testar o "Convidar pro app" do admin nem o
"Solicitar vaga" com sessão de aluno de verdade — os 2 mesmos
bloqueios de sempre.

`tsc` limpo. Nenhum commit feito.

**Résumo do que falta pra fechar a Área do Aluno de vez** (tudo do lado
do Diego, nada meu):
1. Rodar o patch `add-solicitacao-aluno.sql` (coluna `aluno_id` +
   policy).
2. Habilitar "Phone" em Authentication → Providers no painel do
   Supabase.
Assim que os dois estiverem feitos, dá pra testar o ciclo inteiro de
ponta a ponta de verdade — convite → login → turmas → solicitar vaga →
oficinas — sem nenhuma mudança de código adicional esperada.

### 2026-09-24 (continuação 6) — Login por telefone sem Twilio + saga final de processo órfão

Diego rodou o patch da coluna (✅) e tentou habilitar "Phone" no painel —
achado real, com print: o toggle "Enable Phone provider" **exige um
provedor de SMS configurado** (Twilio Account SID/Auth Token/Message
Service SID como campos obrigatórios pra salvar), mesmo pra login só
por senha sem OTP nenhum envolvido. Desligar "Enable phone
confirmations" (minha primeira sugestão) não resolveu — os campos do
Twilio continuaram obrigatórios, confirmado pelo Diego ("nao parou de
ser obrigatorio"). Contornado esse SMS provider de vez, sem custo nem
conta de Twilio nenhuma: **parou de usar o provider nativo de Phone do
Supabase inteiramente**. `src/lib/telefone.ts` (novo, compartilhado
entre `convite.ts` e `login/page.tsx`) ganhou
`emailSinteticoDoTelefone(tel)` — deriva um e-mail interno determinístico
do telefone (`{dígitos}@aluno.mtcst.interno`), nunca exposto pro aluno
em lugar nenhum da UI (ele só digita telefone, em qualquer tela). Por
baixo, `aceitarConvite`/`login/page.tsx` viraram login por E-MAIL comum
(`createUser({email, password, email_confirm: true})` /
`signInWithPassword({email, password})`) — Supabase Auth por e-mail já
funciona sem NENHUMA configuração extra no painel (é o que o admin já
usa). Testado isolado antes de mexer no fluxo real: criar + logar com
e-mail sintético funcionou de primeira, sem exigir nada do painel.

**Ciclo completo testado ao vivo, de ponta a ponta, pela primeira vez
nesta sessão**: aluno de teste descartável (perfil+pacote+matrícula em
Segunda 09:30, convite gerado via service_role) → acessar `/convite/
[token]` → definir senha → **login automático funcionou** → caiu direto
em `/aluno` com "Olá, Teste!", turma e pacote reais corretos → `/aluno/
turmas`, testado "Solicitar vaga" numa turma diferente (Terça) → 
"Solicitação enviada!" confirmado → `/aluno/oficinas` renderizando as 6
oficinas reais → "Sair" desloga e manda pra `/login` → **logar de novo
digitando só o telefone** (não o e-mail sintético, que o aluno nunca
vê) → voltou certinho pra `/aluno`. Cada etapa dessa é uma peça
diferente que eu tinha construído em rodadas anteriores sem conseguir
testar junto — a primeira vez que o fluxo INTEIRO rodou de verdade,
sem nenhum erro. Tudo limpo depois (conta auth + profile + pacote +
matrícula + a solicitação de teste, via service_role).

**Achado no meio da limpeza — mais uma rodada da saga do processo
órfão** (ver CLAUDE.md §8, já documentada, mas reaberta 2× nesta mesma
tarde): depois de apagar os dados de teste direto no banco, a tela
`/aluno/turmas` continuou mostrando "1/12" pra Segunda em vez de "0/12"
— e dessa vez **nem `tsc` limpo, nem `curl` direto, nem `force-dynamic`,
nem apagar `.next`, nem matar o PID que o `netstat` apontava** resolveram
de cara, o que quase me fez suspeitar de cache do Next.js/fetch (cheguei
a adicionar `force-dynamic` em `/aluno/turmas/page.tsx`, mantido por
ser uma boa prática de qualquer forma, mas NÃO foi a causa real).
Diagnóstico definitivo: um `console.log` temporário dentro da própria
`getTurmasParaAluno` provou que o CÁLCULO sempre esteve certo
("Segunda -> 0" nos logs do servidor) enquanto o HTML servido por
`curl` ainda mostrava "1" — ou seja, `Get-Process -Id <pid> | StartTime`
tinha me enganado mais de uma vez sobre qual processo era "o novo"
(reportou horários incompatíveis com "acabei de reiniciar agora"), e
ainda existia PELO MENOS UM processo node órfão adicional respondendo
por trás, não pego pela checagem anterior. Só depois de matar de novo +
apagar `.next` de novo + subir de novo bateu tudo (log E html mostrando
"0"). Lição registrada em CLAUDE.md: da próxima vez, ir direto pro teste
do marcador em vez de cogitar cache do Next.js primeiro — é mais rápido
de confirmar e, até agora, sempre foi processo órfão mesmo.

`tsc` limpo. Nenhum commit feito. **Área do Aluno (Fase 9) está
funcionalmente completa e testada de ponta a ponta**: convite, login
(telefone ou e-mail), Início, Turmas (+ solicitar vaga), Oficinas,
logout. Único ponto deliberadamente fora de escopo, documentado desde o
início: histórico de presença por data (não existe em lugar nenhum do
sistema ainda, mock ou real).

### 2026-09-25 — Início vira "Minha Turma" + demonstração com aluno vinculado

O Diego pediu pra ver como a Área do Aluno aparece pra alguém já
vinculado a uma turma de verdade (os testes anteriores só cobriam aluno
sem matrícula). No meio disso, mandou uma correção de produto: "a
pagina inicial precisa ser minha turma, e ja com o painel dele de qual
as aulas do pacote, porem só dele" — o Início não podia ser só uma
saudação com a turma como subtítulo discreto; precisava ser
explicitamente enquadrado como "Minha Turma", com o painel de pacote
junto, e sempre só o dado do próprio aluno logado.

- **`src/app/(aluno)/aluno/page.tsx` redesenhado**: "Olá, {nome}!" virou
  subtítulo pequeno; "MINHA TURMA" virou o `<h1>` de verdade da página
  (`font-display uppercase`, mesmo tratamento dos títulos do resto do
  app). Turma + pacote passaram a viver DENTRO de um card só, com borda
  na cor de identidade da turma (mesmo padrão de contorno colorido já
  usado em Turmas/Alunos): ponto colorido + nome da turma no topo do
  card, anel de progresso do pacote + badge de pagamento logo abaixo —
  não mais dois elementos soltos sem ligação visual.
- **Estado vazio adicionado** (não existia antes): se `aluno.turmaId`
  for `null` ("Sem turma"), o card colorido não aparece — em vez de um
  anel de pacote 0/0 sem sentido, mostra uma mensagem + botão "Solicitar
  uma vaga" linkando pra `/aluno/turmas`. Achado ao pensar no "porém só
  dele" — mostrar dado fictício pra quem não tem turma seria inventar
  informação que não existe.
- **Demonstração ao vivo**: criado aluno descartável ("Teste
  Vinculado", telefone `(14) 97777-6666`) matriculado na turma REAL
  "Terça 18:30" (a mesma com 14 pessoas reais já matriculadas) com
  pacote parcial (2 de 4 aulas, pago), conta auth ligada direto via
  service_role (e-mail sintético, mesmo mecanismo do convite — não
  precisou repassar pelo fluxo de convite de novo, já testado à
  exaustão). Login por telefone confirmado funcionando; `/aluno` mostrou
  "MINHA TURMA / Terça 18:30 / 2/4 / Seu pacote / Aula 2 de 4 /
  Pagamento em dia" com o anel e a borda do card na cor sienna (a cor
  real da Terça); `/aluno/turmas` mostrou a ocupação real das 5 turmas
  lado a lado (Segunda 0/12, Terça 14/14, Quarta 11/12, Quinta 10/12,
  Quinta 11/12) sem erro de console. Print enviado ao Diego pelas duas
  telas. Aluno de teste, matrícula, pacote e conta auth removidos logo
  em seguida (service_role); scripts descartáveis (`setup-teste-
  vinculado.mjs`/`cleanup-teste-vinculado.mjs`) apagados do projeto,
  mesma disciplina de sempre — nunca fica artefato de teste no repo do
  Diego.

`tsc` limpo. Nenhum commit feito.

**Mesma sessão, logo em seguida — commit feito e nova aba "Histórico".**
Diego perguntou "oq seria commitado?" antes de eu commitar qualquer
coisa (resposta: 41 arquivos novos + 1 renomeado + ~26 modificados,
tudo desde `34751af`) — ele confirmou um commit só, mesmo padrão do
commit anterior. Commitado como `7f68680` ("Wire all 7 admin domains +
Dashboard to real Supabase data, add 5th turma and full student
portal"), 69 arquivos, 6553 inserções.

Na sequência, Diego pediu pra ver a Área do Aluno visualmente — só que
os screenshots que eu tinha tirado direto no navegador embutido (pra
demonstrar o teste anterior) **não aparecem pro Diego**, só pra mim:
"vc fez o teste porem eu nao vi". Causa: o navegador embutido é um
painel separado da conversa, e o system prompt já avisa "assume users
can't see most tool calls" — só texto de resposta é visível por
padrão. **Fix pro padrão de demonstração usado daqui pra frente**: em
vez de só descrever ou depender do painel do navegador, montei um
mockup HTML fiel (cores/fonte/layout reais do app, dados reais do
teste) via `mcp__visualize__show_widget`, que renderiza inline na
própria resposta — garantidamente visível, painel aberto ou não. Regra
a manter: qualquer demonstração visual pro Diego a partir de agora usa
esse widget, não só screenshot do navegador embutido.

Diego então perguntou "e o historico das aulas e pagamentos?" — pergunta
que corrigiu uma suposição antiga minha. Investigando o schema/código
real (não só CLAUDE.md, que estava desatualizado nesse ponto específico):
- **Pagamentos**: histórico completo já existe, mas só o admin vê
  (`/pagamentos`). Aluno não tinha acesso nenhum, só o status atual
  (badge) no Início.
- **Aulas/presença**: achado real — as tabelas `aulas`/`presencas` do
  schema original (sem UI desde sempre) **já estavam sendo gravadas de
  verdade** desde que Turmas ligou em dado real (2026-09-24):
  `toggleStatusAula`/`marcarPresenca` (`src/lib/actions/turmas.ts`) já
  faziam upsert nelas a cada marcação do admin. Só que **nada lia esse
  histórico** — nem admin nem aluno tinham tela nenhuma pra ele. Dado
  sendo acumulado silenciosamente, invisível. Só existe a partir de
  24/09 (antes disso, nenhuma linha).

Diego escolheu construir os dois. **`src/lib/actions/alunoPortal.ts`**
ganhou `getHistoricoAulas()` (junta `presencas`+`aulas`+`turmas`,
filtra pelo próprio `aluno_id`, RLS já cobria isso sem precisar de
service_role) e `getHistoricoPagamentos()` (mesma ideia em
`pagamentos`, reaproveitando `formatarData`). Em vez de virar 2 abas
novas na nav (ficaria em 5, pesado pra uma pílula mobile), as duas
entram numa tela só, **`AlunoHistoricoClient`** (nova, duas seções:
"Minhas aulas" e "Pagamentos", cards no mesmo padrão visual de
Turmas/Oficinas do aluno) atrás de uma 4ª aba "Histórico"
(`AlunoNav.tsx`, ícone `History` do lucide). `tsc` limpo.

**Verificado ao vivo**: aluno de teste descartável (mesmo "Teste
Vinculado", Terça 18:30) ganhou 3 `aulas` de teste em datas passadas
(2 presenças + 1 falta) e 2 `pagamentos` (1 pago com valor, 1
pendente) inseridos direto via service_role. Login por telefone →
`/aluno/historico` mostrou as 3 aulas ordenadas por data decrescente
com o rótulo de status certo, e os 2 pagamentos com valor/data
formatados certo — sem erro de console (os 3 erros que apareceram no
console eram sobras de navegação de ANTES desse teste nesta mesma aba
do navegador — uma rota `/mais` inexistente visitada mais cedo na
sessão — não relacionados ao código novo). Aluno de teste e todas as
linhas criadas (aulas/presenças/pagamentos/matrícula/pacote/perfil/
conta auth) apagados logo depois; scripts descartáveis apagados do
projeto.

Nenhum commit feito ainda dessa leva (Histórico + widget de
demonstração).

### 2026-09-25 (continuação) — "Solicitar vaga" do aluno virou fluxo de verdade

Diego perguntou se ainda dava pra solicitar vaga provisória ou trocar
de turma pela aba Turmas do aluno. Investigando a fundo: o PEDIDO
sempre funcionou, mas **aprovar sempre criava um profile duplicado** —
`aprovarSolicitacao` chamava o mesmo `cadastrarAluno` de "vaga vazia",
sem saber que quem pediu já era um aluno logado com conta própria.
"Provisório"/"trocar de turma" nunca existiam de verdade no Next.js
(só documentados como pendência).

Rodada de refinamento de copy com o Diego em tempo real — "preciso
repor aula" foi rejeitado ("as vezes a pessoa só quer ir um dia
diferente, não é sempre reposição"), testei várias sugestões até ele
escolher: **"Quero trocar para essa turma"** (com aviso de confirmação
antes de enviar, pedido dele: "tem certeza? sua vaga atual será
liberada") e **"Quero experimentar essa turma um dia"** (visita
provisória, sem mexer na turma fixa).

Implementado:
- `moverAluno` (`turmas.ts`) ganhou modo `"provisoria"` — nunca tinha
  sido escrito de verdade no Next.js. Mantém a matrícula fixa,
  consome 1 aula do pacote existente, cria uma segunda matrícula
  (`provisorio: true`) na turma nova. `"fixa"` é o comportamento
  original.
- `aprovarSolicitacao` liga de volta ao `aluno_id` da solicitação: sem
  matrícula fixa → matricula sem duplicar profile
  (`matricularAlunoExistente`, extraído de `cadastrarAluno`); com
  matrícula fixa → `moverAluno` no modo certo.
- Depois de aprovado, ainda mid-turn o Diego pediu mais 2 coisas: a
  tela do aluno precisa mostrar se a solicitação está pendente ou
  confirmada ("algo assim: pendente aguarde, confirmada pode ir pra
  aula") — feito, com o TIPO junto ("Pendente (troca de turma)"); e
  pra quem já tem turma fixa, o card dela precisa dizer "Minha turma"
  em vez de "Solicitar vaga" em todas — `souEuFixo` novo em
  `getTurmasParaAluno`. E por último: precisa dar pra cancelar ou
  editar a solicitação — `cancelarSolicitacao` nova (RLS: só apaga se
  for do próprio aluno E ainda pendente, policy nova enviada como
  patch), "editar" virou cancelar + reenviar em vez de formulário
  separado.
- **Achado testando o cancelar antes do patch chegar no banco**: um
  `.delete()` que a RLS bloqueia não vem com `error`, só devolve 0
  linhas — o código original teria tratado isso como sucesso
  silencioso. Corrigido com `.select("id")` no delete pra checar se
  alguma linha realmente saiu, e erro claro se não saiu.

**Verificado ao vivo, ponta a ponta, com o banco real** (aluno de
teste fixo em Terça 18:30 + admin de teste, os dois descartados
depois): pediu visita avulsa em Quarta → aprovado → matrícula
provisória criada, pacote foi de 2/4 pra 3/4, Terça continuou intacta;
pediu trocar pra Quinta 14:30 → aprovado → Terça virou `recusado`,
pacote migrou pra Quinta (ainda 3/4) — conferido direto nas tabelas
(`matriculas`/`pacotes`), não só pela tela. "Minha turma" confirmado
na turma nova. Card "Pendente (visita avulsa)" + "Cancelar" testado
(cancelar falhou como esperado, sem o patch ainda aplicado — mensagem
de erro clara, não um no-op silencioso).

`tsc` limpo. Patch `add-solicitacao-aluno-delete-policy.sql` enviado
ao Diego (RLS `solicitacoes_vaga_aluno_delete`) — sem ele, "Cancelar"
não funciona de verdade em produção. Commitado (`14307cc`).

### 2026-09-25 (continuação) — "Quais os próximos caminhos?": pontas soltas do admin

Diego escolheu as 4 opções que ofereci (fechar pontas soltas, avaliar
upgrade do Next.js, deploy real, construir uma tela que falta).
Comecei pela mais rápida e sem decisão de produto pendente.

Investigando o botão de sair do admin, achei bem mais que isso:
- **`/mais`, linkado pelo rodapé mobile (`MobileNav.tsx`) desde
  sempre, nunca teve página — 404 real**, confirmado pelos erros de
  console que já vinham aparecendo (e eu vinha descartando como
  "sobra de teste antigo") em VÁRIOS testes anteriores desta sessão.
  Criada (`src/app/(admin)/mais/page.tsx`): lista Alunos/Solicitações
  (com badge)/Pagamentos/Relatórios/Configurações + botão "Sair"
  (primeiro do admin no projeto inteiro — a Área do Aluno já tinha o
  dela desde a Fase 9).
- **`/relatorios` e `/configuracoes`, linkados pela Sidebar desktop
  desde sempre, também nunca tiveram página** — mesmo tipo de link
  morto, só que no desktop. `EmBreve.tsx` (novo componente
  compartilhado) cobre as duas, mesmo padrão do `EmBreve` do demo
  ("essa tela ainda não foi construída").
- **`AdminLayout` (`src/app/(admin)/layout.tsx`) ainda tinha o TODO
  original never fechado**: `userName="Hanna"` e
  `badges={{ solicitacoes: 3 }}` **hardcoded no código**, visível em
  TODA página admin, desde antes da migração de dados reais. Virou
  `async`, busca o profile do admin logado (`auth.getUser()` →
  `profiles`) e a contagem real via `getSolicitacoesReal().length`.
  `MobileNav` ganhou o badge também (na aba "Mais", já que
  Solicitações não é uma das 5 abas fixas do rodapé).

**Verificado ao vivo** com um admin de teste com nome deliberadamente
diferente ("Cláudia Teste", pra provar que "Hanna" não aparecia mais
por acidente) — confirmado via `document.querySelector('aside').
innerText` que a sidebar mostra as iniciais reais ("CT") e não mais
nada fixo; `/mais`, `/relatorios`, `/configuracoes` renderizando sem
404; "Sair" testado nos dois lugares (desktop Sidebar existe no DOM,
`/mais` no mobile) — desloga e volta pro `/login` de verdade.

`tsc` limpo. Nenhum commit feito ainda desta leva. Ainda por vir, nas
próximas rodadas: avaliar upgrade do Next.js (14→15+, por causa das 2
CVEs críticas sem patch no major atual), deploy real (Vercel) e
escolher qual tela ainda-não-construída vira prioridade (Relatórios,
Configurações ou Notificações).

### 2026-09-25 (continuação) — Upgrade pro Next 15.5.24

Diego escolheu as 4 opções ("fechar pontas soltas" já feito acima).
Antes de mexer em código, pesquisei as 2 CVEs de verdade (não só
repeti o que já estava documentado): as duas só fecham na 15.5.24 (ou
16.3.3+). Achado relevante que mudou a urgência real: a falha do
Windows nem chega a valer numa Vercel (roda Linux); a do AVIF bate em
qualquer host, mas só é explorável se o app processar AVIF de fonte
não confiável pelo `next/image` — hoje não processa (as fotos de fundo
são JPEG fixas, que eu inseri). Expliquei isso pro Diego e ele confirmou
fazer o upgrade mesmo assim, antes do deploy.

**Escopo real do upgrade**: `cookies()`/`headers()`/`params` viram
assíncronos no Next 15 — bate direto no `createClient()`
(`src/lib/supabase/server.ts`), usado em praticamente toda Server
Action/página do projeto.
- `npm install next@15.5.24 eslint-config-next@15.5.24`.
- `createClient()` virou `async function`, `cookies()` → `await
  cookies()`.
- **45 chamadas em 14 arquivos** (`const supabase = createClient();`)
  ganharam `await` — feito com `sed` em lote (todos os arquivos
  confirmados um a um antes, checando o import real de cada um pra não
  mexer sem querer no `createClient` do CLIENTE em `login/page.tsx`,
  que é outro arquivo/outra função, sem nada a ver com essa mudança).
- **4 rotas dinâmicas** (`turmas/[turmaId]`, `alunos/[id]`,
  `oficinas/[oficinaId]`, `convite/[token]`) tiveram `params`
  embrulhado em `Promise<{...}>` + `await params` no topo da função.
  Confirmado por glob que essas eram as ÚNICAS 4 rotas dinâmicas reais
  do projeto — outras ocorrências da palavra "params" encontradas por
  grep (`dashboard/page.tsx`, `FornoResumoCard.tsx`, `forno.ts`) eram
  falso-positivo, um campo `params` de configuração de queima do forno,
  nada a ver com rota do Next.
- **Achado no caminho, TypeScript pegou na hora**: `alunos.ts` tinha um
  helper interno (`montarAlunoReal`) tipado como `supabase:
  ReturnType<typeof createClient>` — precisou virar `Awaited<
  ReturnType<typeof createClient>>`, já que o tipo de retorno da
  função em si mudou de `SupabaseClient` pra `Promise<SupabaseClient>`.
  Confirma o valor de rodar `tsc` a cada passo nessa migração — esse
  tipo de erro não aparece rodando só o app manualmente.
- `middleware.ts` e `src/lib/supabase/admin.ts` **não precisaram
  mudar** — nenhum dos dois usa `cookies()` de `next/headers`
  (middleware usa `request.cookies`/`response.cookies` direto; o
  client admin é service_role, sem sessão).

**`npm run build` rodou de verdade pela primeira vez no projeto
inteiro** (nunca tinha rodado antes desta sessão, CLAUDE.md já
registrava isso como pendência da Fase 12) — passou limpo de primeira,
inclusive o service worker do PWA. Pesquisei antes se `next-pwa`
(pacote sem atualização há 8+ meses) teria problema real com Next 15 —
o risco documentado era conflito com Turbopack, que este projeto não
usa (`next dev`/`next build` sem `--turbo`) — e na prática compilou
sem erro nenhum. `public/sw.js`/`public/workbox-*.js` (gerados a cada
build, hash muda toda vez) entraram no `.gitignore` — nunca tinha sido
necessário antes por nunca ter rodado um build de produção de verdade.

**Verificado ao vivo** com um admin de teste descartável: login →
`/turmas/ter-1830` (rota dinâmica, roster real das 14 pessoas) →
`/alunos` → busquei "Isadora" → cliquei no resultado → navegou pra
`/alunos/[id]` de verdade, carregou os dados dela — as duas rotas
dinâmicas que eu mexi, confirmadas sem erro de servidor. Aluno de
teste removido depois.

`tsc` limpo. `npm audit`: 9 vulnerabilidades restantes, nenhuma mais
crítica — todas em dependências de build/dev (esbuild do Vite do
preview do demo, postcss empacotado dentro do próprio pacote `next`,
a cadeia `workbox`/`serialize-javascript` do `next-pwa`), nenhuma
afeta o app rodando em produção. Registradas, não perseguidas agora —
`npm audit fix --force` levaria a mais 2 majors (`next@16`,
`next-pwa@2.0.2`) que não foram pedidos nem avaliados. Nenhum commit
feito ainda desta leva.
