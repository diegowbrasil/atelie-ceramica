# CLAUDE.md — Contexto permanente do projeto

> Leia este arquivo e o [`PROGRESS.md`](PROGRESS.md) **no início de toda sessão nova** e
> **antes de qualquer alteração grande**. Eles substituem a necessidade de o Diego
> reexplicar o projeto. Mantenha os dois atualizados: regras permanentes entram
> aqui; o que foi feito/está em andamento entra no PROGRESS.md.

---

## 1. Objetivo geral

Sistema de gestão para um **ateliê de cerâmica** (dona do ateliê: Hanna). Dois
perfis apenas: **Administrador** e **Aluno**. Cobre turmas fixas (vagas e
presença), pacotes de aulas, oficinas avulsas, pagamentos, e a ferramenta
central — o **Forno**, que acompanha queimas em tempo real. O cliente descreve
o forno como "o coração do ateliê"; deve ser a ferramenta mais bonita e
completa do app.

Quem conduz o projeto do lado do cliente é o **Diego** — não é necessariamente
quem vai usar o sistema no dia a dia (isso é a Hanna), mas é quem aprova
decisões de produto e testa/publica o demo.

---

## 2. Dois codebases — não confundir

**Decisão do Diego (2026-09-15): o demo é o principal.** Todo trabalho de
produto/visual/funcionalidade novo entra em `demo/AtelieDemo.jsx` primeiro.
Não invista tempo tentando manter o Next.js atualizado em paralelo sem
pedido explícito — ele fica parado como base arquitetural até decidirmos
migrar (§6 do handoff original / item 5 do backlog no PROGRESS.md).

**Preview local do demo** (fora do artifact do Claude.ai, pra testar antes
de publicar): `npm run preview:demo` sobe Vite na porta 5183, lendo
`demo/AtelieDemo.jsx` **direto** (sem cópia — qualquer edição reflete no
preview imediatamente). Os arquivos ficam em `preview/` (`vite.config.mjs`,
`index.html`, `src/main.jsx`) e reaproveitam o `node_modules` da raiz —
`react`/`recharts`/`lucide-react` já são dependências do Next.js, só
`vite`/`@vitejs/plugin-react` foram adicionados como devDependencies só pra
isso. `.claude/launch.json` já tem a config `demo-preview` pronta pra usar
com a ferramenta de preview. **Isso é só uma casca de visualização — nunca
edite `AtelieDemo.jsx` a partir de dentro de `preview/`, edite o arquivo
original em `demo/`.**

### A) `demo/AtelieDemo.jsx` — **onde o trabalho acontece hoje**

Componente React de arquivo único (~1580 linhas), sem backend, dados
fictícios em memória (`useState`). Roda como **artifact do Claude.ai**
(claude.site) para o cliente testar no celular. **Está à frente do projeto
Next.js** — toda decisão de UX recente está só aqui.

Restrições rígidas deste arquivo:
- **Proibido `localStorage`/`sessionStorage`** — quebra a renderização do
  artifact. Estado só em `useState`.
- Imports disponíveis no ambiente de artifact: `react`, `lucide-react`,
  `recharts`, `tailwindcss` (classes core apenas, sem `tailwind.config`
  customizado).
- **Sempre validar sintaxe antes de entregar** (edições já quebraram o
  arquivo 3× — ver §6):
  ```bash
  npx esbuild demo/AtelieDemo.jsx --bundle=false --format=esm --outfile=/dev/null
  ```

### B) Raiz do projeto — Next.js 14 + Supabase (base arquitetural)

Estrutura de produção real: App Router, TypeScript, Tailwind com design
tokens, Supabase (Auth + Postgres + Storage), RLS completo. **Está
desatualizado em relação ao demo** — Oficinas, Pagamentos, status de peças,
presença nos cards etc. só existem no demo por enquanto.

`supabase/schema.sql` é a peça mais valiosa: schema completo, inclusive das
telas que ainda não têm UI. **Fonte de verdade do modelo de dados.**
`src/lib/forno.ts` tem o motor de cálculo da queima tipado (mesma lógica do
demo, em TS).

**Regra de migração:** ao levar uma tela do demo pro Next.js, o **demo é a
referência de comportamento** e o **schema é a referência de dados**. Não
reescreva `calcularPrevisao` — reutilize `src/lib/forno.ts`.

---

## 3. Como rodar e validar

**Demo** (validação de sintaxe, sempre antes de entregar):
```bash
npx esbuild demo/AtelieDemo.jsx --bundle=false --format=esm --outfile=/dev/null
```
Publicação: o cliente não instala nada local. Abre o artifact no Claude.ai e
usa o botão **Publicar**, que gera link público `claude.site`. Não há
Vercel/Netlify/StackBlitz a partir do Claude — já comunicado e aceito pelo
cliente.

**Next.js + Supabase**:
```bash
npm install
cp .env.local.example .env.local   # preencher com as chaves do Supabase
# rodar supabase/schema.sql no SQL editor do Supabase
npm run dev
```
Primeiro admin: cadastrar pela tela de login (cria `auth.users`), depois no
SQL editor:
```sql
update profiles set role = 'admin' where email = '...';
```

**Ambiente local:** Node v24.18.0 / npm 11.16.0 confirmados instalados
(2026-09-15). Repositório git **local, sem remoto** — ver §7.

**Rodar o Next.js pelo Claude Code:** `.claude/launch.json` já está
configurado (`npm run dev`, porta 3000) — use a ferramenta de preview em vez
de subir manualmente. `node_modules`/`package-lock.json` instalados em
2026-09-15. ⚠️ Sem `.env.local`, o `middleware.ts` (que roda em toda rota,
inclusive `/login`) tenta autenticar com Supabase mesmo assim — na prática
as páginas ainda carregam com os dados mockados que já existem direto nos
Server Components, mas login/RLS de verdade só funcionam com chaves reais.
`npm audit` (2026-09-15) apontou **17 vulnerabilidades (1 crítica, 12
altas)** em `next@14.2.5` — não corrigidas ainda, precisa de
`npm audit fix`/upgrade de major version avaliado com cuidado (pode quebrar
App Router) antes de ir pra produção.

---

## 4. Estrutura do projeto

```
APP MTCST/
├── CLAUDE.md              este arquivo — contexto permanente
├── PROGRESS.md            histórico vivo — ler junto com este arquivo
├── COMECE-AQUI.md         doc original do pacote de handoff (upload p/ artifact novo)
├── CONTEXTO.md            doc original de handoff, mesmo conteúdo deste arquivo em versão "carta"
├── files.zip              pacote original recebido (arquivo morto, não editar)
├── demo/
│   └── AtelieDemo.jsx     ← TRABALHO ATIVO. Componente único, ver §2A
├── preview/               casca Vite p/ visualizar o demo em localhost:5183
│   ├── vite.config.mjs    (`npm run preview:demo`) — não editar o demo aqui
│   ├── index.html
│   └── src/main.jsx
├── supabase/
│   └── schema.sql         ← fonte de verdade do modelo de dados
├── src/
│   ├── app/(admin)/       rotas admin: dashboard, turmas/[turmaId], forno
│   ├── app/(aluno)/aluno/ rota do aluno (placeholder, não implementada)
│   ├── app/(auth)/login/  login
│   ├── components/ui/     Card, Badge, Avatar, Button, ProgressRing (base de tudo)
│   ├── components/layout/ Sidebar (desktop), MobileNav
│   ├── components/dashboard/  KilnLiveCard, KpiCard
│   ├── components/turmas/ VagaCard
│   ├── lib/forno.ts       motor de cálculo da queima, tipado (TS)
│   ├── lib/supabase/      client.ts / server.ts
│   └── types/database.ts  tipos gerados a partir do schema
├── README.md              arquitetura do Next.js (stack, rotas, convenções)
├── middleware.ts          bloqueia rotas admin p/ quem não é admin
├── package.json, tsconfig.json, tailwind.config.ts, next.config.mjs
└── .env.local.example
```

---

## 5. Regras de negócio (já definidas com o cliente — não reabrir)

### Turmas
- 4 turmas fixas: **Ter 18:30–20:30 · Qua 16:30–18:30 · Qui 14:30–16:30 · Qui
  18:30–20:30**. Quinta tem DUAS turmas → pills de horário abaixo das abas de
  dia.
- Exatamente **12 vagas** por turma, exibidas como 12 cards.
- Card ocupado: nome, foto, contador do pacote (3/4), status.
- Card vazio: **admin vê "Cadastrar aluno"** (modal: nome + pacote 4/8/12).
  "Solicitar vaga" é visão do **aluno**, não do admin.
- Cada card de aluno tem:
  - **Chip de status da aula**: 🟢 Confirmado ↔ 🔴 Ausente, um toque alterna.
  - **Botão "Marcar presença"**: vira selo ✅ Presente, incrementa pacote
    (3/4 → 4/4). **Reversível** — clicar no selo desfaz e decrementa (pedido
    explícito do cliente, não remover essa reversibilidade).
  - Se a presença fecha o pacote: card destaca "Última aula" + alerta de
    renovação.

**Roster real das 4 turmas (2026-09-17)** — o Diego mandou a lista real de
alunos de cada turma fixa (nome, progresso do pacote, pagamento, presença
da semana de 14/09) e pediu "atualize as turmas". Substituiu o mock
fictício (`VAGAS_INICIAIS`, um array só compartilhado pelas 4 abas —
trocar de turma mostrava sempre as mesmas 8 pessoas fictícias) por
`VAGAS_POR_TURMA` em `demo/AtelieDemo.jsx`, um roster de verdade por
`id` de turma (`ter-1830`/`qua-1630`/`qui-1430`/`qui-1830`). Isso também
exigiu mudar o estado do componente `Turmas` — antes um `vagas` só
(`useState(VAGAS_INICIAIS)`), agora `vagasPorTurma` fatiado por turma
ativa (mesmo padrão já usado pros 2 fornos independentes), senão marcar
presença numa turma vazava pra outra ao trocar de aba. `AGENDA_SEMANA`
(preview do Dashboard) também foi atualizada com os mesmos nomes reais —
antes tinha "Maria Oliveira"/"João Silva" fictícios que não batiam mais
com o roster real da tela de Turmas.

Regras de leitura da notação que o Diego deu, pra reaplicar se ele mandar
atualização de novo:
- `"X/Y"` (ex: `"3/4"`): aula X de Y, **pagamento em dia**.
- Só um número solto (ex: `"2"`, sem `/Y`): "na verdade está na Xª aula do
  pacote, porém o pacote não está pago" — regra geral, vale pra **todo**
  número solto, não só os que ele anotou "(sem pagar)" explicitamente do
  lado. `total` vira 4 (padrão) quando não informado diferente.
- Nome + só a letra `"A"`: aula avulsa (não é pacote) →
  `aula: 1, total: 1` no dado (fecha o anel, não usa `status: "ultima"`/
  Renovar — avulsa não pede renovação de pacote).
- `"faltou"`: ausente **nessa aula específica** (`statusAula: "ausente"`)
  — independente do status de pagamento/pacote (`status`), que é outro
  campo; um aluno pode estar ausente E com pacote pendente ao mesmo tempo.
- Quando `aula === total` **e** o pacote está pago, vira `status:
  "ultima"` (badge "Renovar") — mesma lógica que já existia. Quando não
  está pago (número solto), `status: "pendente"` tem prioridade sobre
  "ultima" mesmo se por acaso `aula === total` (ex: "Amanda 4" na
  Quarta — 4ª aula, mas sem pagar: fica "Pendente", não "Renovar", porque
  cobrar o pagamento é a ação mais urgente ali).
- `presente` sempre entra `false` — os números dados são o pacote
  corrente/estado atual, não uma marcação de presença já feita pelo
  admin; isso é ação ao vivo no app, não faz parte do dado importado.

**Pendências que ficaram de fora desta atualização** (fora do escopo de
"atualize as turmas", não construídas sem pedido explícito):
- **Terça (15/09) tinha 14 pessoas na lista do Diego, não 12** — Vivian e
  Cris apareceram lá "antecipando aula de quinta" (são alunas de Quinta,
  fazendo uma aula extra adiantada na Terça). A regra de exatamente 12
  vagas por turma (acima) já estava cheia com as 12 fixas, então essas
  duas **não entraram** no roster de Terça. Perguntar ao Diego como
  tratar esse tipo de reposição antecipada quando a turma de destino já
  está cheia (ex: 13ª/14ª vaga só naquela semana? Registrar em outro
  lugar?) antes de reintroduzir.
- As seções extras que o Diego mandou junto (**Pacotes em andamento em
  aberto**, **Aulas pontuais**, **Pacotes finalizados** — históricos de
  datas de aula por pessoa) não foram usadas em nenhuma tela ainda; não
  há campo de "histórico de datas" no modelo de dados hoje (seria o
  mesmo tipo de log mencionado no item de data exata do Dashboard, acima
  — "ainda não existe"). Ficam registradas aqui como referência caso
  vire pedido de verdade depois.
- A lista de **Alunos** (`ALUNOS`, tela separada de "todos os alunos")
  **não foi tocada** — continua com o mock fictício antigo (violando a
  regra abaixo de "lista começa vazia", pré-existente, não causado por
  esta mudança). O Diego não deu telefone de ninguém nesta leva de
  dados, e essa tela pede telefone no cadastro — não populada pra não
  inventar dado que não foi dado.
- O card "Pacotes terminando" do Dashboard (deriva de `VAGAS_POR_TURMA`
  filtrando `status !== "confirmado"`) **cresceu de ~3 linhas fictícias
  pra ~24 linhas reais** (muita gente pendente/terminando ao mesmo
  tempo, coincidência real dos dados, não bug) — deixei sem corte/paginação
  de propósito, pra não esconder dado real de cobrança que o Diego pode
  querer ver todo. Se ficar grande demais na prática, considerar
  limitar com "ver todos".

### Forno (ferramenta central)
- Menu "Forno" abre o **painel de acompanhamento**, NUNCA a criação direta.
- **O ateliê tem 2 fornos físicos de verdade (2026-09-17, pedido do
  Diego)** — o app acompanha 2 fornadas simultâneas e independentes, uma
  por forno (`FORNOS`/`fornoId` em cada fornada). Um painel só, com abas
  "Forno 1"/"Forno 2" (mesmo padrão visual das abas de dia de Turmas). Não
  é mais "1 fornada ativa no app inteiro" — é 1 fornada ativa **por
  forno**. Isso não estava no brief original; foi decisão nova do Diego
  olhando o Dashboard, não a IA reabrindo nada por conta própria.
- "+ Nova fornada" (dentro de um forno específico): sem fornada ativa
  **nesse forno** → página dedicada (não modal, não drawer). Com fornada
  ativa nesse forno → modal de conflito citando o forno pelo nome;
  confirmar salva a atual como **Interrompida** (nunca apaga) e só então
  abre a nova, no mesmo forno. O outro forno nunca é afetado.
- Status: Em andamento · Finalizada · Interrompida · Cancelada.
- Etapas: aquecendo → máx. atingida → patamar → resfriando → aguardando
  segura → liberado p/ abrir → finalizada.
- Conteúdo do forno: **seleção múltipla**, categorias Peças de alunos ·
  Peças de oficinas · Encomendas · Queimas por fora. **Sem categoria
  "Misturado"** (removida a pedido — não recriar). Sem quantidade de peças —
  só campo livre "Detalhes do conteúdo".
- Observações com timestamp, adicionáveis durante toda a queima.
- 3 botões grandes: Atualizar temperatura · Adicionar observação · Finalizar
  fornada.
- ~~Gráfico é o elemento principal~~ **Removido (2026-09-17, pedido do
  Diego): "tire essa curva de queima, não vou precisar desse gráfico".**
  Essa regra dizia o oposto até aqui — reabrir decisão só porque o Diego
  pediu de novo, não é a IA reabrindo por conta própria. O `ComposedChart`
  ("Curva da queima": curva prevista + temperatura real + linha de patamar
  + linha de abertura segura) saiu do painel do Forno inteiro. Patamar e
  abertura segura continuam visíveis como `StatCard`s (já existiam em
  paralelo ao gráfico, não foram removidos). O mini-gráfico do card de
  forno no Dashboard é outra instância, separada, e não foi tocado.
- "Nova fornada": tudo em UMA tela, sem etapas/"Próximo". Cards grandes
  clicáveis (tipo, categorias), config em grade com presets por tipo, bloco
  "Revisão" ao vivo.
- Histórico lateral com "Duplicar configuração" → abre Nova fornada
  preenchida.

**Motor de cálculo** — `calcularPrevisao(config, iniciadoEm, agora,
ultimaLeitura)`, função pura. Quando o admin informa temperatura real, ela
vira o novo ponto de origem do cálculo — a mesma função recalibra toda a
curva. **Não criar lógica separada de "recalcular"** — é sempre a mesma
função com outro parâmetro.

### Oficinas
- Página própria por oficina (mesmo conceito visual das turmas).
- 12 vagas como cards; vazio = "Cadastrar participante" (nome,
  individual/dupla, dupla-com, pagamento).
- Campos: descrição, Receita da oficina (peça → gramas de argila, só
  consulta), observações.
- **Status das peças**: Em secagem → Biscoitadas → Esmaltadas → Prontas p/
  retirada. **Só admin altera; aluno só visualiza.** Demo tem toggle "Ver
  como aluno" simulando a visão read-only (não há login no demo).

### Pagamentos
- Card "Pagamentos pendentes" no dashboard leva à página.
- Histórico: tipo (pacote/avulsa), valor, data, status.
- Pendentes têm "Cobrar no WhatsApp": modal com mensagem pronta + `wa.me`
  com texto codificado. Chave Pix fixa em `PIX_CHAVE`.

### Alunos
- Lista **começa vazia** — cliente quer cadastrar alunos reais, sem mocks.
- Cadastro: nome, telefone, turma fixa, pacote (4/8/12).

### Dashboard
- KPIs compactos (coluna estreita, 2×2) — cliente reclamou 2× de ocuparem
  espaço demais. Não aumentar.
- ~~Card do forno ao lado dos KPIs, com mini gráfico embutido~~ **2 cards
  compactos (um por forno, `FornoResumoCard`), sem gráfico** — 2 fornos
  reais desde 2026-09-17 (ver §5), e o mini-gráfico saiu junto com o
  gráfico principal do Forno (pedido do Diego, "não precisa desse
  gráfico").
- ~~Calendário "Turmas da semana": colunas por dia, scroll horizontal no
  mobile.~~ **Redesenhado como lista vertical (2026-09-17)** — pedido do
  Diego: "isso qro um calendario como se fosse uma lista, nao qro q use
  scroll para o lado". `space-y-3` de cards `VIDRO_CARD` separados (um por
  dia, SEG→DOM — não mais um card só com `divide-y`, trocado no mesmo dia
  depois que o Diego mandou uma referência visual pronta: "o calendario da
  pagina inicial qro q seja assim", print com cards soltos, ícone+frase nos
  dias vazios e chevron nos cards de aula), sem scroll lateral em nenhum
  breakpoint. Selo do dia (esquerda da linha) mostra sigla + **data real**
  (`DD/MM`, calculada de `new Date()` via
  `datasDaSemanaAtual()`/`formatarDiaMes()` em `AtelieDemo.jsx`, não mais
  um número fixo) — dia atual identificado comparando a data real, não
  mais um id de dia fixo (`"TER"`) hardcoded; o card de hoje também ganhou
  o rótulo "Hoje" dentro do próprio selo. Dias vazios mostram ícone
  (`Coffee`, lucide) + "Sem aulas" + frase curta com a cara do ateliê
  (`MENSAGEM_DIA_VAZIO`, uma por dia — só Seg/Sex/Dom têm entrada, é onde
  a agenda fica vazia hoje). Dias com aula(s)/oficina(s) empilham sub-cards
  brancos com `ChevronRight` indicando que são clicáveis. **Cards de aula
  continuam clicáveis individualmente** → leva a Turmas naquele dia (dia
  com oficina → leva a Oficinas); todo card do mesmo dia ainda aponta pro
  mesmo destino (não há deep-link pra uma turma específica dentro do dia —
  Quinta com 2 horários sempre abre no primeiro; não implementado por não
  ter sido pedido). **Avatares empilhados aumentados de 26px pra 30px e
  overlap reduzido (`-space-x-2` → `-space-x-1`)** — achado do Diego
  vendo no celular: "ainda esta um pouco apertado as pessoas embaixo".
  **Cada card ganhou a cor de identidade do próprio dia** (2026-09-17,
  "e deixe cada card com sua cor da semana") — mesma cor que já marca a
  turma daquele dia em Turmas/fundo (`corTurma` do primeiro horário):
  Terça=sienna, Quarta=ardósia, Quinta=musgo, aplicada tanto no selo do
  dia quanto num tingimento suave do card inteiro
  (`estiloVidroTingido`/gradiente próprio — versão inicial, ver estado
  final abaixo). ~~"Hoje" continua com o laranja de ação, não a cor de
  identidade (CLAUDE.md §6.1) — Quinta mostra laranja, não musgo.~~
  ~~Depois, só o selo do dia (não o card inteiro) ganhou a FOTO de
  mesclagem de argila, `background-size:cover` num quadradinho pequeno,
  com degradê escuro por cima pro texto branco.~~ **Duas rodadas de ajuste
  no mesmo dia, ambas do Diego reagindo ao resultado ao vivo — estado
  final:**
  1. "nao o fundo todo do painel so esses quadrados apontados de cada dia
     da semana" → tentei só no selo pequeno primeiro.
  2. "eu quis dizer nao onde ta escrito qua, e sim onde ta azul ali, o
     fundo maior" — ele queria a foto no **card inteiro** (a área maior,
     não o textinho do selo), só nunca quis o painel/dashboard inteiro.
     **E**: "o qui precisa ser verde tbm e nao laranja" — reverte a regra
     de "hoje usa o accent, não a cor de identidade" só pra esse card
     específico; aqui a cor do dia manda mesmo em "hoje", o laranja saiu
     de vez, só o texto "Hoje" continua marcando qual dia é o atual.
  **Estado final**: card inteiro com `backgroundImage` da foto
  (`FUNDOS_ARGILA[corDia]`, `cover`, sem parallax — card pequeno e de
  altura variável, não precisa), selo do dia virou um chip sólido na cor
  do dia (gradiente 92%→78% opaco, não mais a foto nem o degradê escuro —
  ficou redundante com o card já mostrando a foto). Dias sem turma fixa
  ainda ficam neutros, **exceto Sábado** — ver próximo item.
  **Sábado ganhou uma 5ª cor, "carvão" (preto/branco), e a agenda ficou
  factualmente errada nesse processo (2026-09-17)**: o Diego mandou uma
  foto de mesclagem preto-e-branco pro card de Sábado — `CORES_IDENTIDADE`
  ganhou `carvao: "38 38 36"` **fora** de `CORES_ORDEM` de propósito (não
  entra na rotação de cor de `corOficina()`, só é usada via um mapa à
  parte, `COR_DIA_EXTRA = { SÁB: "carvao" }`, já que Sábado não é dia de
  turma fixa — `TURMAS_DIAS` não tem cor pra ele). Ao implementar, o Diego
  notou que `AGENDA_SEMANA` (mock do calendário do Dashboard, diferente de
  `oficinasIniciais()`) ainda tinha "Oficina Modelagem"/"Oficina
  Esmaltação" fictícias no Sábado da semana atual: "lembre as datas das
  oficinas, nao tem oficina desses dias ai, só a partir de outubro" —
  sobrara da troca pras oficinas reais (2026-09-17, mais cedo na sessão),
  que atualizou `oficinasIniciais()` mas não esse mock separado. Corrigido
  pra `aulas: []`; `MENSAGEM_DIA_VAZIO` ganhou `SÁB: "Oficinas voltam em
  outubro!"`. **Não reintroduzir oficina fictícia em `AGENDA_SEMANA`.**
  **Achado de contraste na mesma leva**: o texto do estado vazio ("Sem
  aulas" + frase) flutuava direto sobre o fundo do card — com as manchas
  suaves de antes isso lia bem, mas a foto preto-e-branco de Sábado é alto
  contraste demais e o texto sumia em cima das ondas pretas. Corrigido de
  forma geral (não só pro Sábado): o bloco do estado vazio agora mora
  dentro da mesma caixa branca opaca (`rounded-2xl border bg-white p-3`)
  que os cards de aula/oficina já usavam — consistente com o resto do
  app (nada mais flutua solto em cima de um fundo ocupado) e resolve o
  problema pra qualquer foto, não só a preto-e-branco. O mesmo par de
  funções (`datasDaSemanaAtual`/`formatarDiaMes`) também alimenta a data
  exata no cabeçalho do dia em Turmas ("Terça-feira · 15/09 · 18:30 às
  20:30" — antes só "Terça-feira · 18:30 às 20:30"), pedido explícito do
  Diego (2026-09-17): "nas turmas no dia da aula preciso q coloque o dia
  exato... pq depois qro se precisar gerar um historico da pessoa d qual
  dia ela veio, saber qual foi a terça feira". **Isso resolve só a exibição
  da data** — o histórico de presença por data em si (registrar em qual
  data exata cada presença foi marcada) ainda não existe;
  `marcarPresenca`/`VAGAS_INICIAIS` (Turmas) continuam só com contador
  agregado (`aula`/`total`), sem log de datas. Não construir essa parte sem
  pedido explícito — o Diego sinalizou como necessidade futura ("depois"),
  não decisão de escopo pra agora.
- **Turmas ganhou um fundo de fotos reais de mesclagem de argila, uma cor
  por dia, com parallax (2026-09-17)** — pedido do Diego em várias rodadas
  seguidas. (1) "vc nao consegue usar a foto q enviei como fundo?" — queria
  a FOTO de verdade, não a recriação em SVG que eu tinha tentado primeiro.
  (2) "qro q cada dia seja uma cor diferente, quarta azul e quinta o fundo
  verde" — `FUNDOS_ARGILA` (`demo/AtelieDemo.jsx`) mapeia cor→foto (JPEG
  comprimido, base64), reaproveitando as mesmas chaves de
  `CORES_IDENTIDADE`/`TURMA_COR` já existentes; a cor do dia ativo em
  Turmas decide a foto. Fotos hoje: sienna (Terça), ardósia/azul (Quarta),
  musgo/verde (Quinta) — falta uma pra "café" (Quinta 18:30 usa o musgo do
  primeiro horário do dia por enquanto); dias sem turma ficam no `--cream`
  normal. (3) Pediu parallax de verdade, em duas mensagens com a mesma
  ideia: "não tem como eu fazer uma imagem que fique parada e conforme eu
  desça no scroll eu percorra por ela" e, depois de eu ter feito o fundo
  rolar 1:1 junto com o conteúdo (achou pouco): "o fundo ainda esta fixo
  junto com o scroll, mexe td.. eu qria q o fundo ficasse parado e conforme
  eu desça o scroll eu perscorra pelo fundo" — ele queria o fundo se
  movendo mais DEVAGAR que o conteúdo, nem 0% parado (`position:fixed`,
  trava sempre no mesmo recorte) nem 100% junto. Implementado com um
  listener de `scroll` no `window` (não CSS puro —
  `background-attachment:fixed` não tem suporte confiável em mobile
  Safari) deslocando `backgroundPositionY` a 65% da rolagem via `ref`
  (mutação direta do DOM, sem `setState`, pra não re-renderizar a cada
  pixel) — o fundo passa a se mover a 35% da velocidade do conteúdo.
  `backgroundSize:"100% auto"` + `repeat-y` (não `cover`) continua a
  mesma base de antes, só ganhou o deslocamento por cima. **Achado
  corrigido na mesma leva**: cabeçalho mobile e título "Turmas" ficaram
  "apagados" no primeiro teste — causa raiz dupla: (1) o fundo antigo
  (`ManchasFundo`, `position:fixed z-0`) pintava por cima de irmãos
  não-posicionados tipo o `<header>` mesmo vindo depois no DOM (regra de
  stacking do CSS — corrigida ao mover o fundo pra dentro do fluxo do
  próprio `Turmas`, que não tem como alcançar o header, que fica fora
  dele); (2) título e abas de dia ficavam direto sobre a foto sem card
  atrás — corrigido com `relative` nesses blocos (pintam por cima do fundo
  `absolute`) e um degradê cream nos primeiros ~144px. As pills de aba
  também estavam "fracas, parecem estar atrás do fundo" (22-45% opacas,
  calibradas pras manchas suaves de antes): `VIDRO_PILL_NEUTRO` subiu pra
  65% e `estiloVidroTingido` ganhou 2º/3º parâmetro opcional de alpha
  (default inalterado — só a aba de dia em Turmas passa valores mais
  fortes).

---

## 6. Preferências de UI (o cliente já cobrou — respeitar)

- Menu lateral **estreito** (`w-32`, ícone + rótulo pequeno empilhado) —
  pediu redução 3×. Não alargar.
- ~~Nav inferior mobile (`TABS_MOBILE`): Início, Turmas, Forno,
  Solicitações, Mais~~ **Solicitações trocada por Oficinas (2026-09-17)**
  — "qro q tenha inicio, turmas, forno, oficinas, mais, tire o
  solicitações dali". Solicitações continua acessível, só saiu da barra
  fixa — ainda está na lista completa (`NAV`) que abre pelo "Mais", com o
  badge de contagem intacto.
- ~~Sem margem à direita no conteúdo~~ **Revertido em 2026-09-17.** Fazia
  sentido só enquanto os cards eram retos e iam até a borda (regra da v1
  MTCST-literal); com cantos arredondados + sombra (v3, atual), `pr-0`
  cortava a sombra/borda direita do card contra a viewport — achado real
  do Diego, screenshot mostrando o corte. `<main>` voltou a ter padding
  simétrico (`px-4`/`md:px-6`). Não é a IA reabrindo a decisão por conta
  própria — é a mudança de material (reto → vidro) tornando a regra antiga
  obsoleta, junto com um pedido direto de corrigir o corte.
- **Nada de "Olá, Hanna" nem "Ateliê de Cerâmica"** nos headers.
  ~~Só o ícone do vaso (`VaseMark`)~~ **substituído em 2026-09-17 pelo
  logo real da marca** (wordmark "MTCST" que o Diego mandou — recortado,
  fundo tornado transparente, paleta reduzida a 8 cores, ~3.4KB, embutido
  como base64 no componente `LogoMark`). `VaseMark` era só um placeholder
  de antes de existir logo de verdade — removido do código, não é mais
  usado em lugar nenhum.
- Prioridade mobile, desktop completo e confortável.

### 6.1 Sistema visual (revisado 2026-09-15/16 — 3 rodadas no mesmo período,
ver histórico completo em PROGRESS.md)

**Estado atual (vale como fonte de verdade — as rodadas anteriores abaixo
são só contexto histórico do "porquê"):**
1. **v1**: copiou o site novo do MTCST (`mtcst-ceramics`, hoje em
   `http://192.168.1.180:3000` na rede local do Diego — IP muda, pedir de
   novo se não responder) e a inspiração dele, vigashoes.com, ao pé da
   letra: cru/tinta, mono, cantos retos, **sem cor de acento nenhuma**.
2. **v2**: o Diego testou e achou "pobre, sem cara de app" — sem acento
   nada se destacava. Voltou um acento terracota, só que usado com critério
   (ação/navegação/status ao vivo), não espalhado feito no brief pré-MTCST.
3. **v3 (atual)**: o Diego pediu, via `/impeccable`, "algo parecido com
   Apple" — confirmou que queria o **estilo visual mesmo**, não só nível de
   acabamento. Trouxe de volta cantos arredondados e sombra suave,
   **trocou a tipografia de mono-em-tudo pra sans-serif** (mono só
   sobrevive em leituras de medição de verdade — cronômetro do forno).
   **Não é retrocesso pro brief pré-MTCST original** (Apple/Linear/Notion/
   Stripe) — é uma direção nova, deliberada, que mantém a paleta
   cru+terracota do MTCST mas com a linguagem de superfície da Apple.

⚠️ Se pedirem pra mexer no visual de novo, **confirme qual desses 3 estados
é a base** antes de editar — já rodou nos três nesta sessão e cada um tinha
justificativa própria. Não presuma que "mais fiel ao site MTCST" ou "mais
retro/tecnológico" é automaticamente a direção certa sem perguntar.

Tokens exatos — cream/ink medidos direto do CSS computado do site novo
(`getComputedStyle`, não é aproximação); accent é decisão de design desta
sessão (retomou o tom do `orange-700` que o app já usava antes, por ser
tematicamente ligado a argila/cerâmica):
```css
--cream: #F2F2EB;         /* fundo da página */
--cream-soft: #E7E4DA;    /* superfícies suaves, hover, badges neutros */
--line: #DEDAD1;          /* bordas */
--ink: #3B3833;           /* texto principal — não é preto puro */
--ink-soft: #6B655C;      /* texto secundário/muted — escurecido na fase
                              CRITIQUE (2026-09-16): era #8A8479, medindo
                              ~3.3-3.7:1 de contraste, abaixo do WCAG AA
                              (4.5:1); achado confirmado por duas
                              avaliações independentes, ver PROGRESS.md */
--accent: #C2410C;        /* AÇÃO: botão primário, nav ativo, "hoje", progresso, dado ao vivo */
--accent-hover: #9A3412;  /* hover dos botões de acento */
--accent-soft: #F3E1D6;   /* fundo tingido leve p/ estado ativo (ex: item de menu selecionado) */
```
Definidos como CSS custom properties dentro do `<style>` dentro do JSX do
`AtelieDemo` (não em Tailwind config — o ambiente de artifact não permite
config customizado). Usados via sintaxe arbitrária do Tailwind:
`bg-[var(--cream)]`, `text-[var(--accent)]`, etc.

- **Onde usar `--accent`** (critério: "isto é uma ação, ou é o dado mais
  importante da tela agora?"): botões primários (fundo sólido
  `bg-[var(--accent)] hover:bg-[var(--accent-hover)]`), item de menu ativo
  (borda esquerda + texto, ou fundo `--accent-soft` no menu mobile), dia
  atual no calendário/aba de dia selecionada, badge de contagem
  (Solicitações pendentes), barra de progresso do forno, linha "temperatura
  real" do gráfico (era `--ink`, virou `--accent` — é o dado ao vivo mais
  importante da tela), etapa atual do "Status das peças", cards de seleção
  do Nova Fornada (tipo/categoria escolhidos).
- **Onde NÃO usar** — mantém neutro (`--ink`/`--cream-soft`): `Avatar`
  (identidade de pessoa, não ação), overlay de modal/drawer, toast (aviso
  neutro do sistema), tags informativas que só exibem dado sem ser
  clicável (ex: chips de "Conteúdo do forno"), badge "info" do componente
  `Badge` (contorno em `--ink`, não `--accent` — reservar accent pra não
  perder força quando usado).
- **Cores semânticas de status continuam** (`emerald`/`amber`/`rose` do
  Tailwind) — success/warning/danger em badges, "Cobrar no WhatsApp"
  (verde, ligado à marca do WhatsApp), etapa "Aquecendo" do forno (âmbar).
  Isso é informação de estado, não identidade visual — não confundir com o
  "sem acento de marca" acima.
- **Tipografia: três papéis, não dois** (redefinido na fase CRITIQUE do
  redesign formal, 2026-09-16 — ver PROGRESS.md pelo histórico da
  decisão, tomada em duas rodadas no chat):
  - `Inter` (pesos 400/500/600/700), fallback de
    `-apple-system`/`BlinkMacSystemFont` — corpo de texto, nav, rótulos,
    botões, preços. **Não é mais maiúsculo/`tracking-wide`** como na
    v1/v2 (removido na virada Apple) — mais suave, menos "site
    institucional".
  - `Space Grotesk` (pesos 500/600/700) — só os títulos grandes de
    página (`<h1>` "Forno", "Turmas" etc.), via `--font-display` +
    `style={FONT_DISPLAY}` (`{ fontFamily: "var(--font-display)" }`),
    não classe Tailwind — mais confiável no ambiente de artifact do que
    arbitrary value de `font-family`. Na primeira resposta da fase
    CRITIQUE o Diego tinha pedido família única (`--font-display` virou
    alias de `--font-sans`); poucos minutos depois voltou atrás no chat
    — **Space Grotesk nos títulos fica**, não é regressão pra v1/v2, é
    a resposta final.
  - `IBM Plex Mono` (peso 500), só via
    `font-[family-name:var(--font-mono)]` — exclusivo de leitura de
    medição real (cronômetro do forno: tempo decorrido/restante). Nunca
    usar a classe genérica `font-mono` do Tailwind aqui — ela cai na
    fonte mono do sistema operacional, não no token do projeto; já
    causou inconsistência real entre timers na mesma tela (achado da
    fase CRITIQUE, corrigido no `StatCard`).
- **Cantos arredondados e sombra suave em tudo** — o oposto da v1/v2:
  `rounded-2xl` (`Card`), `rounded-3xl` (`Modal`), `rounded-full`
  (`Avatar`/`Toggle`/`Badge`/círculos de seleção) e `shadow-sm` **no
  fluxo normal da página, não só em elementos flutuantes** — todos
  fazem parte do sistema v3 desde a virada "parecido com Apple". Regra
  global de baixa especificidade no `<style>`: `button, input, textarea,
  select { border-radius: 0.75rem; }`, cobre controles sem `rounded-*`
  explícito, sem competir com quem já define a própria classe.
- ~~Gráfico do forno (Recharts)~~ **O `ComposedChart` "Curva da queima"
  foi removido do painel do Forno em 2026-09-17 (pedido do Diego, ver
  §5).** Essa paleta descrevia esse gráfico especificamente — fica aqui só
  de referência histórica caso ele peça de volta algum dia, não é mais uma
  regra ativa. O mini-gráfico do Dashboard é outra instância e continua de
  pé, mesma lógica de cor (hex literal em vez de `var()`, Recharts/SVG nem
  sempre combina bem com CSS custom property).

**Ainda não migrado para este sistema**: o projeto Next.js (§2B) —
continua com o Tailwind config antigo (`tailwind.config.ts`,
`globals.css`), fora do escopo enquanto o demo for o principal (ver
decisão no início da §2).

---

## 7. Decisões técnicas e operacionais

- **git**: repositório inicializado localmente em 2026-09-15 (não existia
  antes). **Sem remoto configurado** — só local, nada foi/será enviado a
  GitHub ou outro host sem pedido explícito. `user.name`/`user.email`
  configurados só neste repo (não globalmente). Objetivo: poder revisar
  diffs e reverter, já que edições no arquivo único quebraram a sintaxe
  várias vezes no passado (§8).
- **RLS + middleware = defesa em profundidade** no Next.js — nunca confiar
  só no middleware para proteger rotas/dados de admin.
- **Componentes de UI não devem ser reestilizados do zero** por tela — usar
  sempre `Card`/`Badge`/`Avatar`/`Modal`/`StatCard` (demo) ou
  `src/components/ui/*` (Next.js).
- Mutations no Next.js devem virar **Server Actions** (`"use server"`)
  próximas da tela que usa, mantendo lógica de negócio fora da UI.
- Novo tipo de notificação → entra no enum `notificacao_tipo` do schema E em
  `NotificacaoTipo` de `src/types/database.ts` (os dois, sempre juntos).

---

## 8. Armadilhas conhecidas — cuidado ao editar

- **Overflow horizontal no mobile: cheque `min-w-0` no shell do App primeiro,
  não só no componente que parece afetado.** Isso já consumiu várias rodadas
  de correção numa sessão (2026-09-16): cada fix (grid de vagas, `Card`,
  `StatCard`, containers de gráfico, `[&>*]:min-w-0` em ~19 grids) resolvia o
  sintoma na tela testada e reaparecia em outra. A causa raiz real era UMA
  linha: `<div className="flex-1 pb-20 md:pb-0">` — o wrapper direto do
  conteúdo dentro do shell flex do `AtelieDemo` — nunca tinha `min-w-0`. Como
  item flex com `min-width: auto` (padrão), o piso dele é o maior
  min-content de QUALQUER conteúdo em QUALQUER tela do app — corrigir uma
  tela só empurra o sintoma pra outra. Isso também causava a barra de
  navegação inferior (`position: fixed`) sumir em telas altas (o navegador
  recalcula `fixed` de forma estranha contra um documento mais largo que o
  viewport). Teste real: `document.documentElement.scrollWidth ===
  document.documentElement.clientWidth` deve ser verdadeiro em toda tela —
  se não for, procure `min-w-0` faltando subindo a árvore a partir do
  elemento largo, não só nele.
- **Nunca combine `bg-[var(--token)]` com modificador de opacidade do
  Tailwind (`/40`, `/30` etc.) quando o token é uma string hex** (ex:
  `--ink: #3B3833`). `rgb(#3B3833 / 0.4)` não é CSS válido — o Tailwind
  gera a declaração assim mesmo, o navegador ignora silenciosamente, sem
  erro nenhum, e o elemento fica 100% transparente. Já aconteceu 2× (fundo
  escurecido do `Modal` e do menu mobile — achado na fase CRITIQUE do
  redesign, 2026-09-16, ambos rodando "invisíveis" havia sessões sem
  ninguém notar porque não dá erro de console). Corrigido pra
  `bg-black/40`/`bg-black/30` direto. Pra escurecer/clarear com opacidade
  de verdade a partir de um token de cor, ou usa `bg-black/NN`/
  `bg-white/NN`, ou cria um token RGB space-separated à parte
  (`--ink-rgb: 59 56 51;`) e usa `bg-[rgb(var(--ink-rgb)/0.4)]`.
- **Edições no `demo/AtelieDemo.jsx` já quebraram a sintaxe 3×**, sempre por
  `str_replace`/edição que engoliu uma linha de declaração (`const X = [`
  sumindo) ou fechamento de `.map()`. **Rodar o esbuild (§3) sempre antes de
  entregar.**
- Ao mexer no calendário do dashboard (`AgendaSemanaCard`), cuidado com o
  fechamento do `.map()` aninhado (`))}` vs `)}`) — foi exatamente esse erro
  de duas quebras que já causou quebra de sintaxe.
- `localStorage`/`sessionStorage` são proibidos no artifact do demo — se o
  cliente pedir persistência real, ou é o projeto Next.js, ou avisar da
  limitação.
- O cliente testa no celular e reporta por screenshot — espaçamentos e
  larguras são o que ele mais nota. Testar em viewport mobile antes de
  reportar como concluído.
- Não reabrir decisões já tomadas listadas em §5/§6 com o cliente sem
  motivo novo.
- **`resize_window` (viewport mobile) e `computer{screenshot}` ficaram
  instáveis** no navegador embutido em 2026-09-15 durante uma sessão longa
  (o viewport real não batia com o solicitado, screenshots vinham em branco
  ou davam timeout, mesmo com o app renderizando certo). Parece limitação
  pontual do ambiente/sessão, não algo consertável no código. Se acontecer
  de novo: confirmar o layout por `get_page_text`,
  `read_console_messages` e `javascript_tool`
  (`getBoundingClientRect`/`getComputedStyle`) antes de concluir que há um
  bug real — só then vale insistir em screenshot.
