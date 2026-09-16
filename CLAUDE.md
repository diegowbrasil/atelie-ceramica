# CLAUDE.md — Contexto permanente do projeto

> Leia este arquivo e o [`PROGRESS.md`](PROGRESS.md) **no início de toda sessão nova** e
> **antes de qualquer alteração grande**. Eles substituem a necessidade de o Diego
> reexplicar o projeto. Mantenha os dois atualizados: regras permanentes entram
> aqui; o que foi feito/está em andamento entra no PROGRESS.md.

---

## 1. Objetivo geral

Sistema de gestão para um **ateliê de cerâmica** (dona do ateliê: Camila). Dois
perfis apenas: **Administrador** e **Aluno**. Cobre turmas fixas (vagas e
presença), pacotes de aulas, oficinas avulsas, pagamentos, e a ferramenta
central — o **Forno**, que acompanha queimas em tempo real. O cliente descreve
o forno como "o coração do ateliê"; deve ser a ferramenta mais bonita e
completa do app.

Quem conduz o projeto do lado do cliente é o **Diego** — não é necessariamente
quem vai usar o sistema no dia a dia (isso é a Camila), mas é quem aprova
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

### Forno (ferramenta central)
- Menu "Forno" abre o **painel de acompanhamento**, NUNCA a criação direta.
- "+ Nova fornada": sem fornada ativa → página dedicada (não modal, não
  drawer). Com fornada ativa → modal de conflito; confirmar salva a atual
  como **Interrompida** (nunca apaga) e só então abre a nova.
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
- Gráfico é o elemento principal: curva prevista + temperatura real + linha
  de patamar + linha de abertura segura.
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
- Card do forno ao lado dos KPIs, com mini gráfico embutido.
- Calendário "Turmas da semana": colunas por dia, dia atual em laranja,
  cards brancos com sombra, avatares empilhados, dias vazios com
  "Sem aulas". **Colunas são clicáveis** → leva a Turmas naquele dia (dia
  com oficina → leva a Oficinas). Implementado e testado.

---

## 6. Preferências de UI (o cliente já cobrou — respeitar)

- Menu lateral **estreito** (`w-32`, ícone + rótulo pequeno empilhado) —
  pediu redução 3×. Não alargar.
- **Sem margem à direita** no conteúdo — vai até a borda. `mx-auto` no
  `<main>` foi removido de propósito; não reintroduzir.
- **Nada de "Olá, Camila" nem "Ateliê de Cerâmica"** nos headers — só o
  ícone do vaso (`VaseMark`).
- Prioridade mobile, desktop completo e confortável.

### 6.1 Sistema visual (redesign de 2026-09-15 — substitui a paleta antiga)

**Decisão do Diego**: visual alinhado ao site novo do MTCST
(`mtcst-ceramics`, hoje em `http://192.168.1.180:3000` na rede local dele —
IP muda, pedir de novo se não responder) e à inspiração dele, vigashoes.com
(marca VIGA). **Não é mais** a paleta terracota/`orange-600` original nem
os cantos arredondados Apple/Linear/Stripe do brief inicial — isso foi
explicitamente substituído. Se reabrir o assunto com o cliente, é só pra
confirmar ajustes, não pra voltar ao estilo do brief original.

⚠️ **Segunda rodada no mesmo dia**: a primeira versão deste redesign copiou
o site de referência ao pé da letra e **removeu toda cor de acento**
(o site do MTCST é uma loja — a cor vem da foto do produto, não da UI). O
Diego testou e achou "pobre visualmente", sem cara de aplicativo, botões
não se destacando. Correção aplicada na hora: **um acento terracota
voltou**, mas usado com critério (só ação/navegação/status "ao vivo"), não
espalhado por tudo como no brief original. Não repetir o erro de tirar o
acento por completo achando que fica "mais fiel ao site" — já foi testado
e rejeitado.

Tokens exatos — cream/ink medidos direto do CSS computado do site novo
(`getComputedStyle`, não é aproximação); accent é decisão de design desta
sessão (retomou o tom do `orange-700` que o app já usava antes, por ser
tematicamente ligado a argila/cerâmica):
```css
--cream: #F2F2EB;         /* fundo da página */
--cream-soft: #E7E4DA;    /* superfícies suaves, hover, badges neutros */
--line: #DEDAD1;          /* bordas */
--ink: #3B3833;           /* texto principal — não é preto puro */
--ink-soft: #8A8479;      /* texto secundário/muted */
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
- **Tipografia: duas fontes**, carregadas via `@import` do Google Fonts
  dentro do `<style>` do componente:
  - `IBM Plex Mono` (peso 500) — tudo: nav, rótulos, corpo de texto,
    botões, preços. Maiúsculo + `tracking-wide` em nav/labels/badges.
  - `Space Grotesk` — só os títulos grandes de página (`<h1>` "Forno",
    "Turmas" etc.). Aplicado via `style={FONT_DISPLAY}`
    (`{ fontFamily: "var(--font-display)" }`), não por classe Tailwind —
    mais confiável no ambiente de artifact do que arbitrary value de
    `font-family`.
- **Cantos retos em tudo** — `border-radius: 0` confirmado no site real
  (botão, card, imagem). `rounded-xl`/`rounded-2xl`/`rounded-lg` foram
  removidos do arquivo inteiro. **Exceção deliberada**: elementos
  circulares pequenos e funcionais continuam redondos —
  `Avatar`/iniciais, o badge "+N" de avatares empilhados, os círculos de
  check/seleção (NovaFornada) e os círculos de ícone "+" em vagas vazias.
  Isso segue o próprio vigashoes, que mantém botões flutuantes em pílula
  mesmo com o resto totalmente reto.
- **Sem sombra em elementos no fluxo da página** (cards, botões) —
  `shadow-sm` removido. Sombra só sobrevive em elementos genuinamente
  flutuantes sobre o conteúdo: `Modal`, menu mobile (drawer), toast.
- Gráfico do forno (Recharts): curva "real" em `--accent` sólido (`#C2410C`
  — é o dado ao vivo, tem que saltar aos olhos), curva "prevista" em
  cinza-amarronzado claro `#B8B2A6`/`#EDEBE3` (discreta, é só referência),
  grid e linha de referência "Patamar" nos tons neutros do sistema. Linha
  de referência "Abertura segura" **continua azul** (`#60A5FA`) — marcador
  funcional (não é acento de marca nem confundir com o dado ao vivo), pra
  não perder a distinção visual entre curva prevista, real, e os dois
  marcadores de referência. Cores do gráfico são hex literal (`stroke=`),
  não `var()` — Recharts/SVG e CSS custom properties nem sempre combinam
  bem, mais seguro usar o valor direto.

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
