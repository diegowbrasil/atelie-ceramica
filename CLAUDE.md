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

**Atualização seguinte, mesma sessão/dia (2026-09-17) — o Diego resolveu
a maior parte das pendências acima ao vivo, no chat:**
- ~~Terça tinha 14 pessoas, regra de 12 vagas não permitia~~ **"nao
  precisa travar em 12"** — a regra de exatamente 12 vagas deixou de ser
  rígida (era uma regra "não reabrir" no início desta seção; o próprio
  Diego reabriu, não é a IA decidindo por conta própria). Vivian e Cris
  (números 13/14) entraram no roster de Terça em `VAGAS_POR_TURMA`.
  Turmas podem ter mais de 12 quando a realidade pedir.
- **`ALUNOS_REAIS` criado e populado** — "qro q vc cadastre essas
  pessoas... em alunos vai ter... os pagamentos". Todas as 46 pessoas
  reais únicas das 4 turmas (dedup: Marina e Elisabeth apareciam 2× nos
  dados brutos por reposição — é a mesma pessoa, entram 1× na turma fixa
  delas; "Camila" aparece 2× sem nota de reposição — são duas pessoas
  reais diferentes, desambiguadas como "Camila (aula de quarta)"/"Camila
  (aula de quinta)", padrão pedido pelo Diego pra nomes repetidos: "vc
  coloque ana(aula de terça)"). `Alunos()` agora inicia com
  `useState(ALUNOS_REAIS)` (antes `useState([])`) e cada card mostra
  badge de pagamento (Pendente/Renovar), não só o anel de pacote.
  `tel: null` em todo mundo — telefone não foi dado nesta leva, não
  inventado; a tela já tolera (`{a.tel ? \` · ${a.tel}\` : ""}`).
  **"todas as aulas que já fez" não foi implementado como histórico
  datado de verdade** — só temos o pacote corrente (X de Y) e o ponto de
  dado concreto desta semana, não um log de aulas passadas; ver item de
  histórico de presença mais abaixo, ainda pendente de verdade.
- **Pagamentos pendentes agora entram em Pagamentos de verdade** — "qro
  q crie um historico, q entre em pagamentos os pacotes pendentes".
  `pagamentosIniciais()` deriva de `VAGAS_POR_TURMA` (só `status ===
  "pendente"`, 14 entradas reais — "ultima"/Renovar é categoria
  diferente, pacote pago só precisa renovar, não é cobrança). `telefone`
  e `valor` não informados → `null`, não inventados; `Pagamentos()`
  precisa tolerar isso (ver armadilha nova em §8 sobre isso).
- **Card "Pacotes terminando" removido do Dashboard** — "nao qro essa
  lista gigantesca no painel principal com pacotes terminando". Grid de
  3 colunas virou 2 (Próximas oficinas / Solicitações pendentes); o KPI
  "Pagamentos pendentes" no topo já cobre o resumo rápido, e a lista
  completa mora em Pagamentos agora.
- **Os 4 KPIs do topo do Dashboard viraram calculados, não mais números
  fixos** — "atualize esses cards com os dados reais". "Aulas
  hoje"/"Alunos confirmados" usam o dia real (`new Date()`, mesmo padrão
  do resto do app) contra `TURMAS_DIAS`/`VAGAS_POR_TURMA`; "confirmados"
  conta só quem não está "ausente" nas turmas de hoje. "Pagamentos
  pendentes" é `pagamentosIniciais().length` (mesma fonte real de cima).
  "Reposições pendentes" continua de `SOLICITACOES_INICIAIS`, que
  **não** fazia parte desta leva de dados reais — ainda fictício, só
  passou a ser contado em vez de ser um número solto sem relação com
  nada.
- ~~"Painel geral" + data~~ / ~~data + "· dados de demonstração"~~ — o
  Diego pediu pra tirar os dois em mensagens separadas ("tire esse texto
  do painel geral" pro "dados de demonstração"; "tire o texto 'PAINEL
  GERAL' DEIXE DO A DATA" pro H1). Sobrou só a data, sem nenhum título
  acima — consistente com a regra de §6 de não ter saudação/nome de app
  nos headers.

**Página de detalhe do aluno — implementada (2026-09-17)**, pedido
original: "e quando eu clicar no aluno la em turma, va para a pagina do
aluno com as informações, telefone, um historico das presenças
informação sobre os pacotes e se esta pago ou nao". Ver resumo completo
da arquitetura em §5 Alunos. **O histórico de presença por data em si
continua sem existir de verdade** — a tela mostra só o estado da semana
atual, com legenda explícita disso, não um log datado (isso exigiria
`marcarPresenca` passar a gravar quando cada presença foi marcada, não
só incrementar um contador — não construído, o Diego sinalizou como
necessidade futura, não pediu essa parte agora).

As seções extras que o Diego mandou junto com o roster (**Pacotes em
andamento em aberto**, **Aulas pontuais**, **Pacotes finalizados** —
históricos de datas de aula por pessoa) ainda não foram usadas em
nenhuma tela; ficam registradas aqui como referência pra quando o
histórico de presença de verdade for construído (provavelmente a mesma
peça de trabalho).

**Card da lista de alunos ganhou contorno na cor de identidade da turma
ativa (2026-09-17)** — "e envolta do card dos alunos daquele turma
acompanhe a cor da turma igual no exemplo q montei", com screenshot
marcando o contorno do card (não dos alunos individuais). `borderColor:
rgbCor(cor, 0.75)` + `borderWidth: 2` via `style` inline no card
`VIDRO_CARD` que envolve `vagas.map(...)` (`cor` já existia no escopo,
`corTurma(turmaInfo.id)`) — troca só a cor da borda que o `VIDRO_CARD`
já desenha, resto do vidro (fundo/sombra/blur) intacto. Verificado ao
vivo trocando entre Terça (sienna)/Quinta 14:30 (musgo) — a cor do
contorno acompanha a aba ativa.

**Segunda parte do mesmo pedido — implementada junto com a feature de
mover aluno (2026-09-17)**: "cada turma os alunos tem o contorno da cor
da sua turma ai os alunos q estiverem provisorios em outra turma ele
acompanha a borda da turma dele". Três rodadas até o estado final:
1. Primeira tentativa: anel colorido só no avatar (`Avatar` ganhou prop
   `anelCor`). **Corrigida na hora, com desenho**: "quando digo o
   entorno seria assim" — ele queria um contorno ao redor da LINHA
   INTEIRA, não só o avatar.
2. Trocado pra borda arredondada própria (`rounded-2xl border-2 my-1`)
   na `<div>` da linha inteira, destacando-a das linhas normais vizinhas
   (que só têm o traço fino do `divide-y` do container).
3. **Achado real, mesma tela**: o anel de progresso (`ProgressRing`) da
   linha continuava na cor da turma ATUAL (a mesma cor do contorno do
   card inteiro), competindo visualmente com o novo contorno da turma de
   ORIGEM na mesma linha — "o contorno azul precisa substituir o da cor
   original naquele local, nao pode ficar os 2 contornos juntos". Fix:
   uma variável `corLinha` (borda da linha + `ProgressRing` + texto do
   anel) que resolve pra `corTurma(v.turmaOrigemId)` quando a pessoa é
   visitante, substituindo a cor da turma atual em TUDO daquela linha,
   não só no contorno.

**Arrastar e soltar de verdade (2026-09-17) — saga completa.** Primeira
versão do "mover aluno" foi só o handle + modal de 2 passos (escolher
turma → provisório/fixo), pensando que drag-and-drop de verdade não
encaixava bem num ambiente mobile-first sem lib (`react`/`lucide-react`/
`recharts`/`tailwindcss` são os únicos imports disponíveis no artifact).
O Diego insistiu: "na vrdd eu qria poder mover e arrastar o card e jogar
la para a turma que eu quisesse" / "nao tem como fazer isso?". Resposta:
dá sim — a API nativa de HTML5 (`draggable`) é praticamente só-mouse
(suporte fraco a toque, que é a prioridade do app), mas **Pointer Events**
(`onPointerDown`/`Move`/`Up`) unificam mouse e toque de verdade nos
navegadores atuais, sem precisar de lib nenhuma. Implementado em
`Turmas`, várias rodadas de refinamento na mesma sessão, cada uma
reagindo ao resultado ao vivo:
1. **Mecânica base**: handle (`GripVertical`) por aluno faz duas coisas
   com um limiar de 8px de movimento — toque curto sem passar do limiar
   abre o modal de sempre (passo 1: escolher turma); arrastar de verdade
   mostra um "fantasma" (cópia flutuante da linha, `ghostRef`) seguindo o
   ponteiro, testa colisão contra as pills de dia/horário (únicas turmas
   visíveis na tela por vez, já que só uma turma renderiza de cada vez) e
   solta direto no passo 2 (turma já escolhida) se soltar em cima de uma
   válida — soltar em qualquer outro lugar cancela em silêncio, sem
   mexer em dado nenhum. Posição do fantasma escrita direto no DOM
   (`style.transform`) a cada evento de ponteiro, sem `setState` — mesma
   técnica/motivo do parallax de fundo (`FundoArgilaParallax`): re-render
   a cada pixel é caro e desnecessário.
2. **"Coloque encima de quinta ja precisa mudar para quinta com as
   opções dos horarios embaixo"** — pairar sobre o pill do dia "Qui"
   (2 turmas) não resolve um alvo direto; só troca a pré-visualização
   (`diaPreviewArraste`) revelando os sub-pills de horário (14:30/18:30),
   que aí sim viram alvos de verdade assim que aparecem. `diaMultiRef`
   (nova ref, só pros pills de dia com mais de uma turma) separada de
   `pillsRef` (alvos diretos) porque a colisão com cada uma tem uma
   consequência diferente.
3. **"Quando eu mover precisa ser algo transparente pra q eu consiga
   visualizar"** — o fantasma era `bg-white` opaco, tapando o card
   embaixo. Trocado pro vidro translúcido padrão do app (`bg-white/55`
   + `backdrop-blur-md`).
4. **"Quando eu arrastar o card da pessoa para uma turma, a turma
   precisa estar por cima pra eu conseguir visualizar"** — o fantasma
   (`z-50`) tapava o pill de destino, inclusive o destaque dele. Fix:
   os containers das pills ganham `z-[60]` só durante um arraste ativo.
5. **"Faça uma animação de afunilar depois q eu deixar encima de
   algo"** — soltar sobre um alvo válido não fecha o fantasma na hora:
   ele encolhe e desliza pro centro do pill antes de sumir, só então abre
   o modal (`animarAfunilarEFechar`). Depois, 2 correções no mesmo
   efeito: (a) **"qro q ele afunili e fique qs do tamanho da turma"** —
   trocado de um scale fixo (sumia num ponto) pra uma escala calculada
   pela largura real do pill contra a largura do fantasma, termina do
   tamanho do alvo, não invisível; (b) as pills também crescem
   (`scale-125`) quando são o alvo — **achado de stacking, com
   desenho**: "qro q essa diminuição seja centralizada e nao q ele
   arraste o botao inteiro e fique essa esquerda maior". O `scale()` já
   crescia simétrico a partir do centro (não era geometria torta); o que
   ficava assimétrico era a ORDEM DE PINTURA — pill sem z-index pinta na
   ordem do DOM, então o vizinho da esquerda (que vem antes) ficava
   coberto enquanto o da direita (que vem depois) cobria o pill maior de
   volta, lendo como "cresceu só pra um lado". Fix: `relative z-10` no
   pill em destaque, pinta por cima dos dois vizinhos igualmente.
6. **"Quando eu mover o aluno para a turma qro q o card do aluno diminua
   quando deixar encima de alguma turma e a turma selecionada faça um
   aumento... qro a interação conforme eu arrasto"** — o encolher/crescer
   não podia ser só no momento de SOLTAR, precisava reagir continuamente
   enquanto o dedo paira sobre um alvo válido. Fantasma virou 2 elementos
   aninhados: o de fora (`ghostRef`) só cuida de posição (translate, sem
   transition — precisa ser instantâneo, sem atraso perceptível seguindo
   o dedo); o de dentro (`ghostInnerRef`) cuida do visual + `scale` COM
   transition curta (150ms), que `moverArraste` já encolhe
   (`scale(0.55)`) assim que o ponteiro entra numa zona de alvo válido —
   combinar as duas coisas numa `transform` só não permitia transition no
   scale sem atrasar também a posição.
7. **"E se eu jogar pra arrastar e jogar pra fora da tela ela sai...
   caso eu coloque errado"**, depois clarificado com desenho: **"seria
   nas laterais ali indicadas como vermelho, ai quando eu tiver
   segurando algum card e chegar proximo as laterais q elas fiquem
   destacadas para eu saber q tem uma ação ali"** — as duas bordas
   (esquerda/direita) da tela viraram zona de **remover** aluno da
   turma: destacam em vermelho (gradiente, mais forte quando o ponteiro
   entra nos últimos `FAIXA_LATERAL_PX` = 56px da borda) durante um
   arraste ativo, e soltar ali pede confirmação (`ModalRemover`) antes de
   esvaziar a vaga — nunca remove só pelo gesto, mesmo padrão de nunca
   apagar sem confirmar do resto do app (ex.: modal de conflito de
   fornada).
8. **Rede de segurança**: `setPointerCapture` garante que o handle
   recebe move/up mesmo fora dele, mas se o ponteiro sair da JANELA de
   verdade durante o arraste, alguns navegadores nunca disparam o
   `pointerup` no elemento — o estado ficava preso "arrastando pra
   sempre" (linha esmaecida sem voltar ao normal). `window` sempre recebe
   esses eventos; um `useEffect` que só existe enquanto `arrastandoAtivo`
   registra `pointerup`/`pointercancel`/`blur` no `window` como fallback
   que sempre limpa o estado.
9. **Bug real, achado testando no celular de verdade (2026-09-18)** — tudo
   acima tinha sido validado só com mouse simulado (`left_click_drag`/
   Pointer Events sintéticos no navegador embutido do Claude Code); no
   celular real o Diego reportou, com screenshot: "o card da pessoa ele
   ainda nao diminui quando tem a interação com a nuva turma e ele nao
   interage com os horarios de quinta, ele fica acima dos horarios".
   Causa raiz: a detecção de alvo comparava manualmente o retângulo de
   cada pill (`pillsRef`) contra a posição do ponteiro, e só contava como
   "colisão" se o pill estivesse visualmente por CIMA do fantasma no
   empilhamento — dependia de vencer o fantasma (`z-50`) no z-index. As
   pills ganharam `z-[60]` (§ acima), só que isso é `position:relative`
   (empilha só dentro do contexto local) competindo com um `position:fixed`
   (escapa pro contexto raiz) — as duas coisas não são diretamente
   comparáveis por z-index, então em algumas situações reais o fantasma
   vencia mesmo assim, e a colisão nunca era contada (sem alvo → sem
   encolher, sem highlight, sem soltar). **Fix**: trocada a detecção
   inteira pra `document.elementFromPoint(x, y)` — pergunta ao navegador
   o que está DE VERDADE desenhado naquele pixel exato (empilhamento real,
   não uma conta minha) e já ignora o fantasma de graça, já que ele é
   `pointer-events-none` (`elementFromPoint` pula elementos assim). Pills
   e faixas ganharam atributos `data-alvo-turma`/`data-alvo-dia`/
   `data-alvo-lateral` só pra esse lookup (`.closest(...)` a partir do
   elemento retornado). `pillsRef` sobrevive só pra achar o retângulo final
   da animação de afunilar (`animarAfunilarEFechar`), não mais pra detectar
   colisão. **Mesma leva**: a zona de hit-test das faixas laterais também
   foi separada do visual (zona real = `FAIXA_LATERAL_PX` = 56px sempre,
   visual pode ficar mais fino/apagado sem encolher a área clicável — antes
   os dois eram a mesma largura de 12px em repouso, exigindo mira quase
   perfeita na borda) e começa em `top-64` (256px), não `top-0` — não pra
   "vencer" as pills num z-index ambíguo, e sim pra nunca ocupar o mesmo
   espaço que elas, eliminando a ambiguidade de vez em vez de tentar
   arbitrar ela.

10. **Segundo round no mesmo dia, ainda 2026-09-18** — o item 9 resolveu
    só parte do problema. O Diego testou nas próprias palavras: "o
    arrastar os cards para os horarios de quinta ainda nao funciona e nao
    esta reduzindo os cards do jeito que qro, ele diminui na proporção
    inteira, preciso q vire qs uma bola porem so nas interações se eu sair
    de cima volte ao normal". Dois problemas distintos:
    - **Achado um segundo bug real, de timing**: o encolhimento ao pairar
      setava `ghostNomeRef.current.style.opacity`, mas `<span ref=
      {ghostNomeRef}>` só existia no DOM dentro de `{arrastoRef.current.
      aluno && (...)}`. Como `arrastoRef` é uma REF (não `state`), setar
      `arrastoRef.current.aluno` em `iniciarArraste` NÃO dispara
      re-render — o span só passava a existir de verdade depois que
      `setArrastandoAtivo(true)` terminasse de re-renderizar. No exato
      evento de ponteiro em que o limiar de arraste é cruzado, o
      fantasma já vira visível (`display:block`) na mesma chamada de
      função onde `setArrastandoAtivo` só agenda (não aplica na hora) o
      re-render — se o próximo evento de movimento chegasse antes desse
      re-render completar (plausível em toque real, onde os eventos
      podem vir mais espaçados/agrupados que num mouse), `ghostNomeRef.
      current` ainda era `null` e o `if (ghostNomeRef.current) {...}`
      não fazia nada, silenciosamente. **Fix**: avatar/nome do fantasma
      viraram SEMPRE montados (não condicionados à ref), só o texto que
      fica vazio até `arrastoRef.current.aluno` ser preenchido — a ref
      nunca mais fica indisponível.
    - **"Vire qs uma bola" não era o que "encolher" fazia**: a versão
      anterior só aplicava `scale()` uniforme no fantasma — encolhia
      mantendo a MESMA forma retangular, só menor (proporção inteira
      preservada, exatamente o que o Diego não queria). Trocado por
      largura/padding/`border-radius` de verdade animando até um círculo
      do tamanho do avatar (`BOLA_TAMANHO = 44`), com o nome
      desaparecendo (`opacity: 0`) — só sobra o avatar, que já é
      redondo, lendo como bolinha de verdade. Sempre reversível: sai do
      alvo → largura/padding/`border-radius` voltam pro estado normal do
      card, nunca fica "preso" na forma de bola (era parte explícita do
      pedido: "so nas interações se eu sair de cima volte ao normal").
    - **Reforço extra na detecção**, por precaução (não confirmado como
      causa raiz, mas remove uma categoria inteira de dúvida): o
      fantasma agora é escondido (`display:none`) por um instante
      síncrono bem na hora de chamar `document.elementFromPoint`, e
      reaparece logo em seguida — não depende só do `pointer-events-none`
      pra ficar de fora do resultado, ele literalmente não está
      renderizado nesse instante exato.

11. **Terceiro round, ainda 2026-09-18 — dois achados, um do detector de
    design e um do Diego com print**:
    - **`layout-transition` (achado automático)**: animar `width`/
      `padding` (item 10) força reflow de LAYOUT a cada frame — problema
      de performance real, não estético. **Fix de verdade, não
      supressão**: trocado por `clip-path` — o fantasma nunca mais muda
      largura/padding reais (fica sempre do tamanho natural do
      conteúdo), só tem uma JANELA CIRCULAR recortada visualmente
      (`inset(0 calc(100% - 44px) 0 0 round 9999px)` quando em cima de
      um alvo, `inset(0 round 1rem)` em repouso) — `clip-path` é
      composição/pintura, não layout, não entra na mesma categoria do
      achado.
    - **"O retangulo nao fica centralizado onde eu pego"** (print
      marcando com um ponto vermelho onde estava o mouse vs. onde
      aparecia o card) — dois bugs reais, achados juntos:
      1. O fantasma era forçado a ter a LARGURA DA LINHA INTEIRA
         (`a.largura`, incluindo o espaço do handle/anel/toggle que ele
         nem desenha) — muito mais largo que o conteúdo real
         (avatar+nome). O deslocamento do ponteiro (`offsetX`/`offsetY`)
         também era calculado contra essa linha inteira, não contra o
         fantasma de verdade. **Fix**: fantasma sem largura forçada
         (`w-max`, tamanho natural do conteúdo) e reescrito pra
         centralizar no ponteiro (mede a METADE da largura/altura do
         PRÓPRIO fantasma, uma vez só, não da linha de origem).
      2. Mesmo depois desse fix, sobrava um offset sistemático — causa:
         a MEDIÇÃO da largura do fantasma (pra centralizar) rodava antes
         do React re-renderizar o `<span>` do nome com o aluno ATUAL
         (mesma classe do bug do item 10 — refs não disparam re-render),
         então a largura medida vinha do NOME ANTERIOR (de um arraste
         anterior, ou vazio), não do nome de quem estava sendo arrastado
         agora — se o nome novo tiver tamanho bem diferente, a medição
         fica errada. **Fix**: `iniciarArraste` escreve o nome direto no
         `<span>` via `textContent` (mutação imperativa do DOM, não passa
         pelo ciclo do React) antes de qualquer coisa — quando
         `moverArraste` mede a largura, o DOM já está certo.

12. **Quarto round, ainda 2026-09-18** — o item 11 trocou `width`/
    `padding` por `clip-path`, mas com `inset(0 calc(100% - 44px) 0 0
    round 9999px)`. O Diego mandou print de novo: "olha a bolinha q
    diminuiu nao esta centralizada e nao homogenica ela esta cortando a
    letra, e eu estou mirando na ter e ela fica mais de ladinho". Dois
    bugs reais, os dois de geometria (não de detecção/timing dessa vez):
    1. **Bola não era um círculo de verdade**: `inset(0 calc(100% -
       44px) 0 0 round 9999px)` só limita a LARGURA da janela (44px) — a
       ALTURA ficava a altura inteira da caixa (~60px, sem limite). Uma
       janela 44×60 com cantos bem arredondados é uma PÍLULA/OVAL, não
       um círculo — cortava o avatar de um jeito torto ("cortando a
       letra"). **Fix**: `clip-path: circle(raio at x y)` em vez de
       `inset()`+`round` — um raio só, circular por definição, não dá
       pra virar oval sem querer.
    2. **"Fica mais de ladinho" quando mirava perto do card**: o
       fantasma era centralizado no ponteiro pelo CENTRO GEOMÉTRICO DA
       CAIXA INTEIRA (`metadeLargura`, medida da largura total incluindo
       o nome) — mas o avatar (o que fica visível na "bola") mora perto
       da borda ESQUERDA da caixa, não no centro dela. Card centralizado
       no ponteiro ≠ avatar centralizado no ponteiro; quanto mais longo
       o nome (caixa mais larga), maior a diferença entre os dois
       pontos. **Fix**: parou de medir a largura da caixa pra
       centralizar — usa uma constante FIXA (`CENTRO_AVATAR_X = borda +
       padding + metade do avatar = 31px`, nunca muda, avatar/padding/
       borda têm tamanho fixo) tanto pra posicionar o fantasma
       (`translate`) quanto pra centrar o círculo do `clip-path` — os
       dois pontos de referência viram o MESMO ponto (o avatar), sem
       pulo entre "card normal" e "modo bola", e sem depender do
       tamanho do nome de cada aluno.

13. **Quinto round, ainda 2026-09-18 — o mesmo bug do item 12 reapareceu no
    CELULAR REAL do Diego**, mesmo com `CENTRO_AVATAR_X` verificado por
    geometria computada no navegador embutido. Print com uma bolinha azul
    (indicador de toque) claramente fora do card: "porem qro q o card q eu
    seguro esteja centralizado com o mouose, estou segurando na boliza
    azul, olha como o card fica muito para a esquerda" — e de novo, já no
    modo bola: "pq na hora q ele encolhe, olhe onde ta o ponto azul q seria
    o mouse e onde o card esta, ele nao segue meu mouse, fica fora". A
    constante fixa (`CENTRO_AVATAR_X = borda 1px + padding 12px + metade do
    avatar 18px = 31px`) supunha valores exatos de borda/padding/tamanho
    que bateram certinho no navegador embutido mas, por alguma diferença
    de ambiente real (fonte carregada, rounding, o iframe do artifact),
    não batiam no celular dele — qualquer suposição "calculada à mão" é
    só isso, uma suposição. **Fix**: parar de supor e MEDIR de verdade.
    Novo `ghostAvatarRef` (wrapper `<span>` em volta do `<Avatar>` dentro
    do fantasma, já que `Avatar` não encaminha ref) — no instante em que o
    limiar de arraste é cruzado, `moverArraste` mede
    `ghostAvatarRef.getBoundingClientRect()` relativo a
    `ghostInnerRef.getBoundingClientRect()` e guarda o centro real
    (`a.centroX`/`a.centroY`) em vez de usar a constante. Não importa mais
    o que está de fato renderizado (fonte, zoom, o que for) — o valor
    medido reflete a realidade, não uma suposição. `CENTRO_AVATAR_X` foi
    removida do código.
14. **Sexto round, mesmo dia — dois bugs nos SUB-PILLS de horário de
    Quinta especificamente** (os pills de DIA já funcionavam bem): "porem
    para arrastar ainda os cards para o horario de quinta feira ele nao
    esta funcionando, para os dias ele acerta agora nos horarios nao,
    quando coloco a mira na quinta, ai vou arrastar para baixo nos
    horarios, ele some".
    1. **Z-index no container inteiro, não só no pill em destaque**: tanto
       o bloco de pills de DIA quanto o bloco de sub-pills de HORÁRIO
       ganhavam `z-[60]` (maior que o `z-50` do fantasma) no `<div>` PAI
       inteiro durante um arraste — não só no pill individual em destaque.
       Pros pills de dia (fileira estreita no topo) isso quase não se
       notava; os sub-pills de horário são mais largos/altos e ficam bem
       no caminho de quem desce o dedo até eles — o fantasma ficava
       coberto (some) assim que a MÃO entrava nessa faixa inteira, não só
       quando estava de fato em cima de um pill específico. **Fix**:
       `z-[60]` saiu dos dois containers e foi pro `emArraste` de cada
       pill individual (dia e horário) — só quem está realmente em
       destaque vence o fantasma no empilhamento, o resto da faixa deixa
       o fantasma visível por cima.
    2. **Bug mais fundo, achado ao investigar o primeiro**: mesmo depois
       do fix acima, o alvo ainda se perdia. Causa raiz: `diaPreviewArraste`
       (o dia cujos sub-pills aparecem) só ficava ativo enquanto `!alvo`
       — no EXATO frame em que o ponteiro desce o suficiente pra achar um
       SUB-PILL como alvo, essa mesma condição zerava o preview, o que
       desmonta os sub-pills do DOM (`diaExibido` volta a ser a turma
       ativa, sem sub-pills) — incluindo o sub-pill que tinha acabado de
       virar alvo. No próximo `elementFromPoint` ele já não existe mais
       ali, o alvo se perde, os horários "somem" de verdade (não é só
       cobertos, é desmontados). **Fix**: se o alvo atual já pertence a um
       dia multi-turma, o preview desse dia passa a continuar ativo — os
       sub-pills nunca desmontam enquanto um deles for o alvo.
    3. **Terceiro bug, achado testando o fix acima**: o dedo real passa
       por um instante em que não está nem sobre o pill "Qui" nem sobre
       nenhum sub-pill — o GAP/margem entre os dois blocos. Nesse frame,
       nem `alvo` nem `diaPill` batem, resetando o preview de qualquer
       jeito antes do dedo "aterrissar". Precisou de uma zona de
       tolerância: `data-zona-dias`, um `<div>` (⚠️ **não pode ser
       `display:contents`** — tentativa inicial, corrigida no mesmo teste:
       um elemento `contents` não tem caixa própria, então o `elementFromPoint`
       num pixel de margem "atravessa" pro AVÔ, não pro wrapper, e
       `closest("[data-zona-dias]")` nunca batia justo na transição entre
       os dois blocos, o ponto onde a tolerância mais importa — um `<div>`
       normal tem uma caixa de verdade cobrindo a extensão dos filhos,
       incluindo os gaps) ao redor dos dois blocos de pills. Dentro dela
       mas fora de qualquer pill específico, `moverArraste` mantém o
       preview ATUAL em vez de zerar — só reseta de verdade quando o
       ponteiro sai da zona inteira. Verificado com PointerEvents
       sintéticos com waits reais entre cada passo (rajada síncrona sem
       wait mascarava esses dois bugs — o React só reflete o novo DOM
       depois de um frame real) + um `left_click_drag` de ponta a ponta:
       modal abriu certo em "Mover Isadora / Mover para Quinta · 14:30 às
       16:30".
    4. **Pedido separado, mesma leva**: "qro q esse efeito suba ate
       encima", com seta no print mostrando a faixa vermelha lateral
       (zona de remover) parando no meio da tela em vez de cobrir até
       atrás do cabeçalho. Só o VISUAL (gradiente) precisava subir — a
       ZONA DE DETECÇÃO real continua começando em `top-64` de propósito
       (não disputar `elementFromPoint` contra as pills lá em cima, ver
       item 9). Virou dois elementos separados: o gradiente (`top-0` a
       `bottom-0`, `pointer-events-none`, decoração pura) e o
       `data-alvo-lateral` (continua `top-64`, sem estilo visual próprio
       agora — antes o gradiente era filho dele).

**Não é arrastar-e-soltar nativo do navegador** (`draggable`/`ondragstart`)
em lugar nenhum — é Pointer Events com toda a mecânica de detecção de
colisão, fantasma e animação escrita à mão. Se pedirem pra estender esse
padrão pra outra tela (ex.: mover peça de oficina, reordenar algo), o
código de `Turmas` (`iniciarArraste`/`moverArraste`/`soltarArraste`/
`animarAfunilarEFechar`/`animarSaidaLateral`) é a referência a copiar, não
reinventar do zero. **Lição pra próxima vez**: testes com mouse simulado
neste navegador embutido não pegam tudo — os bugs reais desta saga (itens
9-14) só apareceram no toque real do celular, num timing que o mouse
simulado não reproduz sozinho, ou num detalhe geométrico (oval vs.
círculo, centro-da-caixa vs. centro-do-avatar) que só fica óbvio olhando
o resultado de perto/no zoom de um print. Vale pedir confirmação no
celular antes de dar uma feature de gesto como concluída, e **quando
"centralizar em cima do ponteiro" for pedido de novo**: definir com
clareza qual é o PONTO DE REFERÊNCIA real (centro da caixa? centro de um
elemento específico dentro dela?) antes de escrever a fórmula, não só
"metade da largura/altura" no automático. **Item 13 vai além disso**:
mesmo uma fórmula com o ponto de referência certo (`CENTRO_AVATAR_X`,
item 12) pode divergir do ambiente real por causa de suposições de
tamanho/padding/borda "calculadas à mão" — quando der pra medir o
elemento de verdade (`getBoundingClientRect`) em vez de supor um número,
medir é sempre mais robusto, principalmente pra algo que só quebra num
ambiente que não dá pra testar diretamente (o celular do Diego, o iframe
do artifact). **Item 14.3 é outra lição de teste**: PointerEvents
sintéticos disparados em rajada síncrona (sem esperar um frame entre
eles) fazem o React fazer batching de vários `setState` juntos — o DOM só
reflete o ÚLTIMO estado, mascarando bugs que só existem NUM ESTADO
INTERMEDIÁRIO (como os sub-pills desmontando e remontando). Testar esse
tipo de sequência precisa de um `requestAnimationFrame` (ou wait real)
entre cada evento simulado, não só despachar tudo de uma vez. **Padrão
que se repetiu 2x nesta saga** (itens 10 e 11): cuidado geral com refs
(`useRef`) que só
existem no DOM condicionadas a OUTRA ref, ou cujo CONTEÚDO/tamanho é lido
antes do React ter re-renderizado com o valor atual — a condição/leitura
não reage a mudanças da ref, só a `state`, então a janela entre "a ref
mudou" e "o próximo `state` re-renderizou" é uma fresta real onde o DOM
ainda reflete o estado anterior. Quando isso importa pra uma medição
síncrona (não só pra exibição), escrever direto no DOM via
`textContent`/`style` antes de medir é mais confiável do que esperar o
ciclo do React.

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
- **Cancelar fornada + editar conteúdo em andamento (2026-09-18)**,
  auditoria de autonomia. Dois achados reais: o status "Cancelada" já
  existia no enum/`STATUS_LABEL` desde sempre, mas nenhuma ação o
  definia (só Finalizar ou substituir por Interrompida existiam); e não
  havia jeito de corrigir o conteúdo (categorias/detalhes) de uma
  fornada já iniciada sem "Duplicar configuração", que cria uma fornada
  NOVA (perde o progresso da atual).
  - **"Cancelar fornada"**: botão discreto (texto pequeno, não um 4º
    botão grande — a regra "3 botões grandes" do painel continua
    valendo, cancelar é bem menos comum que Atualizar/Observação/
    Finalizar) abaixo dos 3 de sempre, com confirmação. Só muda
    `status` pra "cancelada", nunca apaga (mesmo padrão de
    `finalizarFornada`).
  - **"Editar" no card "Conteúdo do forno"**: `ModalEditarConteudoForno`
    reaproveita a mesma receita visual do seletor de categorias em
    `NovaFornada` (cards 2×2 com borda de destaque), só que num modal
    compacto. De propósito, só mexe em `categorias`/`detalhesConteudo` —
    nunca em `config` (temperatura/tempo), que mudaria RETROATIVAMENTE
    toda a curva de previsão já em andamento, categoria de edição bem
    mais delicada que corrigir o que tem dentro do forno.

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
- ~~Botão "+ Nova oficina" (pill laranja cheia, com texto)~~ **Virou só um
  "+" discreto (2026-09-18)** — "troque esse 'nova oficina' por um '+'
  discreto". Ícone `Plus` num botão circular neutro
  (`text-[var(--ink-soft)]`, sem `ACCENT_SOLIDO`) — não compete mais
  visualmente com o título "OFICINAS" centralizado do lado. **Correção
  (2026-09-18, auditoria de autonomia)**: a entrada anterior dizia "mesma
  ação, `onClick` intacto" — não procede, o botão nunca teve `onClick`
  nenhum nessa troca, clicar não fazia nada. Só percebido agora ao
  auditar o app inteiro atrás do que ainda não é autoservido (ver
  detalhe abaixo).
- **Criar/editar oficina + editar/remover participante — implementado
  (2026-09-18)**, depois da auditoria de autonomia pedida pelo Diego
  ("qro ter mais autonomia no aplicativo... faça uma busca e me fale oq
  precisa adicionar", resposta em três: Solicitações/Pagamentos/Oficinas/
  Forno — ver §5 Dashboard pro resumo completo da auditoria). Achados
  reais, não só o "+" do item acima: **"Editar oficina"** (dentro do
  detalhe) também não tinha `onClick` nenhum; um participante já
  cadastrado não podia ser editado/removido pela UI, só cadastrado uma
  vez.
  - `ModalOficina` (reaproveitado pros dois modos, `oficina={null}` =
    criar / `oficina={...}` = editar): nome, data, horário (texto livre,
    não date-picker — o app inteiro já representa isso como "10 de
    Outubro de 2026" por extenso, um picker devolveria outro formato),
    vagas, valor por pessoa (opcional), descrição, observações. `receita`
    (peça→gramas) fica de fora do formulário — é só consulta em
    qualquer lugar do app hoje, editar isso é pedido separado se
    importar na prática.
  - **Editar vagas nunca apaga um participante já inscrito**: encolher o
    número de vagas só remove vagas VAZIAS do fim da lista; se a redução
    pedida removeria alguém já cadastrado, a edição recusa e mantém o
    número antigo, com aviso.
  - **Participante**: `ModalCadastrarParticipante` ganhou modo edição
    (`participante` preenchido → título/botão mudam pra "Editar"/
    "Salvar", mais um botão "Remover participante" com fundo rose) — a
    LINHA do participante (antes um `<div>` estático) virou `<button>`
    clicável, mesmo padrão de "clicar num aluno abre o detalhe" já usado
    em Turmas/Alunos.

### Pagamentos
- Card "Pagamentos pendentes" no dashboard leva à página.
- Histórico: tipo (pacote/avulsa), valor, data, status.
- Pendentes têm "Cobrar no WhatsApp": modal com mensagem pronta + `wa.me`
  com texto codificado. Chave Pix fixa em `PIX_CHAVE`.
- **Editável de verdade + busca (2026-09-18)**, mesma auditoria de
  autonomia. Achado real: a tela não tinha NENHUM setter de estado
  (`const [pagamentos] = useState(...)`, array-destructuring sem par) —
  "marcar como pago" nem cabia ali antes disso.
  - **`pagamentosIniciais` passou a receber `vagasPorTurma` como
    parâmetro** em vez de fechar sobre a constante `VAGAS_POR_TURMA`
    fixa — achado no caminho: a tela (e o KPI "Pagamentos pendentes" do
    Dashboard) nunca refletiam uma edição ao vivo (ex: editar o
    pagamento de alguém pela página de detalhe), sempre mostravam o
    snapshot de quando o app carregou. Mesma correção aplicada ao KPI
    "Alunos confirmados" do Dashboard, que tinha o mesmo problema.
  - **"Marcar como pago"**: `id` de cada pendente é sempre
    `${turmaId}-${numero}` (já existia, usado como `key`); separar pelo
    ÚLTIMO hífen (não o primeiro, já que `turmaId` em si tem um hífen,
    ex. "ter-1830") recupera os dois pedaços com segurança pra
    atualizar a vaga certa em `vagasPorTurma`. Sem estado próprio de
    "quem foi marcado" — o item some da lista sozinho assim que
    `status` deixa de ser "pendente" no state real.
  - **Busca por nome**, mesmo padrão de Alunos (filtro case-insensitive
    por substring) — "em pagamentos preciso q tenha uma busca tbm para
    procurar nomes". Filtra as duas listas (pendentes e histórico); os 4
    KPIs do topo continuam somando TODOS os pagamentos, não só o
    resultado filtrado.
  - **Bug pré-existente corrigido no caminho**: a mensagem de cobrança
    sempre incluía `"valor: R$ {p.valor}"` sem condicional — `valor` é
    `null` pra todos os pendentes derivados do roster real (nunca
    informado nesta leva de dados), então toda cobrança real saía
    "R$ null" na mensagem. `mensagemCobranca`/`abrirWhatsAppCobranca`
    extraídas pra funções top-level (reaproveitadas também em
    `AlunoDetalhe`, ver §5 Alunos) com a correção.
  - **Ações rápidas direto na página do aluno** (`AlunoDetalhe`, ver §5
    Alunos) — "no card dos alunos, quando tiver pagamentos q eu consiga
    colocar como pago tbm ou cobrar no whatts", pra não precisar sair da
    página do aluno e ir até Pagamentos só pra isso.

### Alunos
- ~~Lista começa vazia — cliente quer cadastrar alunos reais, sem mocks.~~
  **Substituída pelo roster real (2026-09-17)** — `useState(ALUNOS_REAIS)`,
  ver §5 Turmas ("roster real das 4 turmas") pro histórico completo de como
  os 46 alunos reais foram populados/desduplicados.
- Cadastro: nome, telefone, turma fixa, pacote (4/8/12).
- **Tela redesenhada pra escalar com 46 pessoas reais (2026-09-17)** — "na
  pagina dos alunos separe por turmas, e q eu consiga fazer uma busca se
  precisar, nao precisa mostrar todos os alunos em lista". Antes era uma
  lista única flat (ok pra mock vazio, ruim pra 46 pessoas). Agora: campo de
  busca (`busca`, filtro case-insensitive por substring no nome) — com
  busca ativa mostra lista flat filtrada; sem busca mostra 4 seções por
  turma (`TURMAS_ORDEM_LABELS`, ordem de `TURMA_LABEL_COR`), cada uma um
  acordeão fechado por padrão (`turmaAberta`, só uma aberta por vez —
  cabeçalho com bolinha da cor da turma + rótulo + contagem + chevron que
  gira). Linha de aluno virou componente próprio `LinhaAluno({ a })`,
  reaproveitado nos dois modos (busca e turma aberta) pra não duplicar o
  JSX do card.
- **Página de detalhe do aluno + mover entre turmas — implementado
  (2026-09-17)**, depois do pedido "e ainda nao consigo clicar no aluno e
  ver a pagina dele. e qro poder arrastar um aluno de uma turma e passar
  para a outra, porem depois de soltar vai aparecer uma mensagem, vaga
  provisória... ou vai ser trasferido fixo". Resumo da arquitetura (ver
  também §5 Turmas, "arrastar e soltar de verdade" pro histórico completo
  da saga de refinamento do gesto em si):
  - **`vagasPorTurma` subiu de `Turmas` pro componente raiz `AtelieDemo`**
    (mesmo padrão de `fornadas`/`oficinas`) — necessário porque mover um
    aluno edita o roster de DUAS turmas ao mesmo tempo, e a página de
    detalhe também precisa ser aberta a partir de Alunos, fora de
    `Turmas`. `Turmas` recebe `vagasPorTurma`/`setVagasPorTurma` via
    props agora, resto da lógica local (`setVagas`, `cadastrarAluno`,
    `toggleStatusAula`, `marcarPresenca`) não mudou.
  - **`AlunoDetalhe`** (tela nova, `tela === "alunoDetalhe"`): avatar,
    nome, turma atual, anel de pacote, telefone (ou "não informado"),
    pacote/pagamento, e presença **da semana atual só** — com legenda
    explícita ("histórico de presença por data ainda não existe"), não
    finge ter um histórico datado que não existe de verdade. Aberta a
    partir de Turmas OU de Alunos (`onAbrirAluno`/`abrirAlunoDetalhe`),
    que são duas fontes de dado ligeiramente diferentes
    (`vagasPorTurma` vs `ALUNOS_REAIS`) — o componente tolera os dois
    formatos em vez de forçar unificação das fontes (fora do escopo
    pedido agora). "Voltar" volta pra tela de onde veio (`origemTela`).
  - **Mover entre turmas**: cada aluno ganhou um handle (`GripVertical`)
    que serve dois propósitos — toque curto abre `ModalMoverAluno`
    (escolher turma destino → provisório/fixo); arrastar de verdade solta
    direto no passo 2. `moverAluno(aluno, origemId, destinoId, tipo)` (no
    componente raiz) tira do roster de origem (vira vaga vazia) e insere
    no destino com `numero` novo; `turmaOrigemId` só é sobrescrito em
    transferência **fixa** — em **provisória** preserva a origem original
    mesmo que a pessoa já tivesse sido movida antes.
  - **Remover da turma**: arrastar até uma lateral da tela (zona
    vermelha) pede confirmação (`ModalRemover`) antes de esvaziar a vaga
    — nunca remove só pelo gesto.
- **`AlunoDetalhe` virou editável de verdade (2026-09-18)** — pedido do
  Diego voltando pro app principal depois de começar a Área do Aluno:
  "preciso ter as coisas editaveis tbm, no sentido de excluir ou nao
  aludo, editar o pacote, colocar se esta em dia ou nao, mudar a turma".
  Motivo dado na sequência, mensagens separadas: "qro ter mais autonomia
  no aplicativo, sem q eu tenho q ficar toda hora pedindo para o claude
  fazer uma alteração de alunos ou turmas... do app inteiro" — a
  motivação de fundo (autonomia de gestão sem depender de pedir uma
  edição de código a cada ajuste) é maior que só esta tela; ver auditoria
  completa do resto do app logo abaixo.
  - Um formulário só, atrás de um botão "Editar" no card "Pacote e
    pagamento": turma (select das 4 turmas), pacote (4/8/12, mesmos
    botões de `ModalCadastrarAluno`), aula atual (number input, sempre
    clampado a `[0, total]` — inclusive quando o total diminui e a aula
    atual ficaria acima dele), pagamento em dia (`Toggle` reaproveitado).
    Salva tudo junto (`salvarEdicaoAluno`, componente raiz) — evita
    estados parciais estranhos tipo "mudei a turma mas esqueci de
    corrigir o pacote na mesma ida".
  - **"Está em dia ou não" não é um 4º valor de `status`** — continua só
    `confirmado`/`pendente`/`ultima`, exatamente a regra já documentada
    (não pago tem prioridade sobre "última aula"). O toggle edita um
    booleano (`pago`) que só na hora de salvar é traduzido pra `status`
    pela mesma fórmula: `!pago → "pendente"`; `pago && aula===total →
    "ultima"`; senão `"confirmado"`. Não inventa uma regra nova, só expõe
    a existente como campo editável.
  - **"Mudar a turma" reaproveita `moverAluno`** (a mesma função que já
    fazia a transferência "fixa" do arrastar-e-soltar) em vez de duplicar
    a lógica de esvaziar/achar-vaga-livre — o formulário só monta o
    objeto já com o pacote/pagamento novos embutidos
    (`{...aluno, ...patchDados}`) e deixa `moverAluno` fazer o resto.
    Isso exigiu ensinar `moverAluno` a também atualizar
    `alunoSelecionado` quando a pessoa movida é quem está aberta na tela
    de detalhe (senão a PRÓXIMA edição, ex: pacote logo em seguida,
    tentaria escrever na vaga antiga já esvaziada) — capturado numa
    variável fora do updater de `setVagasPorTurma` e aplicado depois, não
    aninhado dentro dele (chamar `setState` de dentro do updater
    funcional de outro `setState` funciona, mas não é hábito seguro).
  - **`alunosLista` (a lista da tela Alunos) subiu pro componente raiz**
    — antes era `useState(ALUNOS_REAIS)` local dentro de `Alunos()`,
    inacessível a partir de `AlunoDetalhe` (que vive na raiz). Mesmo
    padrão de lift já usado pra `vagasPorTurma`/`fornadas`/`oficinas`.
  - **As duas fontes de dado (`vagasPorTurma` e `alunosLista`) continuam
    SEPARADAS, de propósito, não unificadas** — decisão já registrada
    quando `AlunoDetalhe` foi criado (a mesma pessoa pode ter uma linha
    em cada fonte, sem sincronia entre elas), reaberta aqui só pra
    confirmar que segue valendo: unificar de verdade esbarraria num
    problema real não resolvido (algumas pessoas, ex. Marina/Elisabeth,
    aparecem em MAIS DE UMA vaga dentro do próprio `vagasPorTurma` — uma
    na turma fixa, outra numa reposição — enquanto `ALUNOS_REAIS` foi
    deliberadamente deduplicado pra mostrar cada pessoa uma vez só, na
    turma fixa; flatten ingênuo quebraria esse dedup). `salvarEdicaoAluno`/
    `excluirAlunoDetalhe` (raiz) só escrevem na fonte de onde o aluno foi
    aberto (`aluno.turmaAtualId` presente = veio de Turmas = vagasPorTurma;
    ausente = veio de Alunos = alunosLista) — editar a mesma pessoa a
    partir dos dois pontos de entrada não propaga de um lado pro outro.
    Verificado ao vivo: editar/mover/excluir funcionam nos dois casos,
    mas é um limite real a lembrar se isso virar confuso pro Diego no
    celular (nesse caso, a unificação de verdade — resolvendo o caso
    Marina/Elisabeth primeiro — vira um pedido separado, não algo pra
    fazer de lambuja aqui).
  - **Excluir** (`excluirAlunoDetalhe`) é diferente de "remover da
    turma" (que já existia, só esvazia a vaga) — excluir tira a pessoa do
    cadastro por completo. Sempre pede confirmação (`Modal` inline,
    mesmo padrão/copy do resto do app: "essa ação não pode ser
    desfeita"), nunca some só com um clique.
  - **Ações rápidas de pagamento (2026-09-18, mesmo dia)** — "no card dos
    alunos, quando tiver pagamentos q eu consiga colocar como pago tbm
    ou cobrar no whatts". Quando `status === "pendente"`, o card "Pacote
    e pagamento" (fora do modo de edição) ganha dois botões: "Cobrar no
    WhatsApp" (`abrirWhatsAppCobranca`, extraída de dentro de
    `Pagamentos` pra função top-level reaproveitável, ver §5 Pagamentos)
    e "Marcar como pago" (reaproveita `onSalvarEdicao` já existente, com
    `pago: true` e o resto dos campos intactos — não duplica a lógica de
    cálculo de status). Some sozinho assim que o status deixa de ser
    "pendente", sem precisar entrar no formulário de edição completo.

### Solicitações
- **De decorativo pra real (2026-09-18)**, auditoria de autonomia. Achado
  real: "Aprovar"/"Recusar" só chamavam `notificar(...)` em 3 lugares
  diferentes (Dashboard, card dentro de Turmas, tela Solicitações
  completa) — a solicitação nunca saía da lista de verdade
  (`SOLICITACOES_INICIAIS` era uma CONSTANTE, não `useState`), e
  aprovar um pedido de vaga não colocava ninguém em turma nenhuma.
  - `SOLICITACOES_INICIAIS` subiu pra `useState(solicitacoes)` no
    componente raiz, mesmo padrão de lift já usado nesta sessão.
  - **`turmaId` acrescentado a cada solicitação mockada** — o dado nunca
    teve isso estruturado (só um texto livre em `tipo`, às vezes citando
    a turma tipo "Solicitou reposição · Quinta 18:30", às vezes não:
    "Quer participar da turma" não dizia qual). Sem isso, "Aprovar" não
    tinha como saber onde colocar a pessoa. Esse mock nunca fez parte da
    leva de dados reais do Diego (só as 4 turmas fixas/roster são
    reais) — atribuir uma turma a cada solicitação fictícia é ajuste do
    mock, não invenção de dado de negócio real.
  - **"Aprovar"** abre `ModalAprovarSolicitacao` (mesmo padrão visual de
    `ModalCadastrarAluno`) só pra confirmar o pacote (4/8/12) — o único
    dado que a solicitação não carrega. Ao confirmar, insere a pessoa
    como vaga ocupada nova em `vagasPorTurma[turmaId]` (próximo número
    livre) e remove da lista de solicitações.
  - **Simplificação deliberada**: pedido de vaga nova e "reposição" são
    tratados IGUAL (inserem como vaga ocupada nova). Uma "reposição" de
    verdade seria uma transferência PROVISÓRIA de alguém que já é aluno
    de outra turma (mesmo mecanismo do `moverAluno`), mas o dado de
    solicitação só tem um nome solto, sem referência a uma vaga já
    existente pra mover — não dá pra inferir isso com segurança sem
    inventar uma ligação que não existe. Se isso importar na prática,
    a UI de aprovar precisaria de um passo extra ("essa pessoa já é
    aluna? de qual turma?"), pedido separado.
  - **Achado de brinde, mesma correção**: o preview "Solicitações
    pendentes" dentro de Turmas mostrava sempre os 2 primeiros de TODA
    a lista, sem relação com a turma aberta (Beatriz/Felipe apareciam
    em Terça E em Quarta, por exemplo). Agora que o dado tem `turmaId`,
    filtra de verdade pela turma ativa.

### Dashboard
- KPIs compactos (coluna estreita, 2×2) — cliente reclamou 2× de ocuparem
  espaço demais. Não aumentar.
- ~~Card do forno ao lado dos KPIs, com mini gráfico embutido~~ **2 cards
  compactos (um por forno, `FornoResumoCard`), sem gráfico** — 2 fornos
  reais desde 2026-09-17 (ver §5), e o mini-gráfico saiu junto com o
  gráfico principal do Forno (pedido do Diego, "não precisa desse
  gráfico").
- **`FornoResumoCard` ganhou um brilho ao redor pulsando, cor conforme a
  temperatura real (2026-09-17)** — "coloque envolta do card do forno,
  uma cor encandescente fazendo oscilando como se estivesse quente,
  dependendo da temperatura ali". `corIncandescente(temp)` (perto de
  `rgbCor`/`corTurma`) interpola por pontos fixos numa rampa
  vermelho-escuro → laranja → amarelo-claro (referência visual: cor de
  forja/forno de verdade, não fórmula científica de temperatura de cor) e
  devolve `"R G B"` no mesmo formato space-separated de
  `CORES_IDENTIDADE`. O card ativo ganha `--glow-rgb` inline + classe
  `.forno-brasa` (`@keyframes brasaForno` no `<style>` do app, box-shadow
  de 3 camadas oscilando de intensidade a cada 2.6s — "ao redor do card",
  não borda sólida, pra ler como brilho/calor e não como contorno).
  **Correção na sequência, mesmo pedido**: "agora o forno q estiver com
  uma temperatura mais baixa ou desligado, dele ele com o volto em azul e
  com menos efeitos" — forno sem fornada ativa (`Nenhuma fornada ativa`,
  Forno 2 no exemplo) e forno ativo mas ainda frio usam `COR_FORNO_FRIO`
  (azul, `"68 121 173"`) + classe própria `.forno-fresco`
  (`@keyframes brasaFornoFrio`, raio/opacidade bem menores, oscilação mais
  lenta — 3.6s — "menos efeitos" de verdade, não só cor diferente).
  Limiar entre os dois estados é `TEMP_FORNO_QUENTE`, pedido explícito em
  mensagem separada: "com a temperatura menor que 250 graus ja tenha a
  borda azul" → `TEMP_FORNO_QUENTE = 250`. Acima disso usa
  `corIncandescente`/`.forno-brasa`; abaixo (incluindo forno desligado)
  usa `COR_FORNO_FRIO`/`.forno-fresco`.
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

**Continuação da mesma história, ainda 2026-09-17 — o fundo com parallax
virou `FundoArgilaParallax`, componente reutilizável, e ganhou mais 3
rodadas de correção:**
1. **Extraído pra componente próprio** quando o Diego pediu o mesmo
   tratamento em Oficinas: "qro q o fundo da pagina das oficinas siga o
   msm padrao das turmas, porem com esse fundo" (foto "carvão",
   preto-e-branco — cor fixa, não varia por dia como em Turmas, já que
   Oficinas não tem a dimensão "dia da semana").
2. **"Borda lateral"** — `inset-0` só preenche o pai `relative` mais
   próximo, que fica dentro do padding do `<main>` (`px-4 md:px-6`);
   sobrava uma faixa da cor de fundo da página nos dois lados. Primeira
   tentativa (`w-screen` + `left-1/2` + `-translate-x-1/2`, técnica
   clássica de full-bleed) quebrou no desktop — `<main>` não é
   centralizado no viewport lá (sidebar de 128px desloca ele), então
   "centralizar no viewport" jogava o fundo pra fora
   (`scrollWidth > clientWidth` de verdade). Corrigido com margem
   negativa cancelando exatamente o padding do `<main>` (`-mx-4
   md:-mx-6`) — só durou até o item 3 abaixo, que trocou a abordagem de
   novo.
3. **"Puladinha" no scroll** — achado final do Diego: "qnd uso scroll ele
   da uma puladinha e nao fica parado o fundo para q eu percorra sobre
   ele". Causa raiz: o container do fundo era `position:absolute`, que já
   rola JUNTO com a página (100% da velocidade, por estar no fluxo
   normal) — o JS só compensava por cima deslocando `backgroundPositionY`
   em sentido contrário (fórmula `scrollY * (1 - VELOCIDADE)`). Duas
   fontes de movimento tentando se cancelar quase por inteiro; em scroll
   rápido (fling de trackpad/mobile) elas saem de sincronia por um
   instante — o "pulinho". **Fix definitivo**: `position:fixed` em vez de
   `absolute` — o container passa a ter ZERO movimento nativo, o
   `backgroundPositionY` via JS vira a ÚNICA fonte de movimento (fórmula
   simplificada pra `scrollY * VELOCIDADE` direto, sem o `1 -`). Isso
   também resolveu a "borda lateral" de vez, de um jeito mais robusto que
   a margem negativa (`fixed inset-0` ignora o padding/offset de
   qualquer ancestral, sempre preenche o viewport inteiro) — mas
   reabriu a mesma causa raiz do achado 1 acima (fundo fixed competindo
   por empilhamento com `<aside>`/`<header>`), corrigida dessa vez de
   forma permanente dando `z-10` explícito pros dois (antes só o
   `<header>` tinha ganhado `relative` sem z-index; `<aside>` já tinha
   `relative` mas também sem z-index — nenhum dos dois tinha proteção de
   verdade contra um futuro fundo `fixed`, só não tinha sido testado
   ainda). `FundoArgilaParallax` (função, perto de `ManchasFundo`) é o
   componente final — usado em `Turmas` (`cor` varia por dia) e
   `Oficinas` (`cor="carvao"` fixo).
4. **Posição específica do recorte** — o Diego mandou um mockup mostrando
   exatamente qual parte da foto "carvão" queria no cabeçalho (faixa
   escura centralizada, atrás do texto "MTCST", clara nas pontas): "use
   exatamente esse pattern". `backgroundPosition: "center 38%"` no
   cabeçalho (não usa `FundoArgilaParallax` — barra pequena de altura
   fixa, sem parallax, só a foto direto com posição ajustada à mão).

**"Próximas oficinas" ganhou o mesmo tratamento de foto do card de Sábado
(2026-09-17)** — "coloque um fundo para esse card das proximas oficinas
igual ali no sabado". Mesma receita do Sábado (`AgendaSemanaCard`):
`VIDRO_CARD` com `backgroundImage: url(FUNDOS_ARGILA.carvao)` +
`borderColor: rgbCor("carvao", 0.4)`, conteúdo (título + lista) dentro de
uma caixa branca opaca por cima (não flutua direto sobre a foto
preto-e-branco — mesma lição de contraste já documentada acima).
**Posição: chegou a subir pra cima de "Turmas da semana"** no mesmo
pedido ("coloque esse card das proxima oficina la pra cima no painel
geral"), mas minutos depois o Diego voltou atrás só nisso: "deixe o
proximas oficinas no lugar q estava msm, porem matenha essa modificação
do fundo" — voltou pro lugar original (último bloco da página, `grid
md:grid-cols-2` ao lado de "Solicitações pendentes"), o fundo/foto é a
única mudança que ficou.

**Avisos fixados no topo (2026-09-18)** — pedido novo, não fazia parte da
auditoria de autonomia (que era sobre completar ações que já deveriam
existir): "qro implementar, uma seção de avisos, q eu coloque uma
mensagem ou programa e vai ficar como um aviso fixo na tela inicial no
topo, posso escolher pra mim como um lembrete, ou para os alunos".
`avisos` (`useState([])`, lista vazia — não é dado real pré-existente) +
`criarAviso`/`removerAviso` no componente raiz. `destinatario: "admin" |
"alunos"` só marca a categoria por enquanto — a Área do Aluno ainda não
existe de verdade (pausada nesta sessão, ver PROGRESS.md), então um
aviso "para os alunos" não tem pra onde ir além do Dashboard do admin
ainda; não finge que está sendo entregue a alguém.

**Três rodadas de redesenho visual, mesma sessão, cada uma reagindo ao
resultado ao vivo:**
1. Primeira versão: `Card` normal (cantos arredondados, vidro, dentro do
   padding da página) — igual todo o resto do app.
2. **Rejeitada com referência visual**: "esse aviso eu qria algo mais
   como um banner suspenso iguais aqueles de site q fica fixo colado sem
   bordas" + print de um banner de site real (faixa fina, cor clara/
   terrosa, texto normal sublinhado, sem ícone). Reescrito pra bater:
   `-mx-4 md:-mx-6` (cancela exatamente o padding lateral do `<main>`,
   mesmo valor do `className` dele) pra encostar nas duas bordas da
   tela; fundo `rgbCor("sienna", 0.12)` (a paleta de argila do app, só
   bem mais clara que o sólido usado em outros lugares); sem cantos
   arredondados nem vidro. **Achado no caminho**: `<button>` sem
   `rounded-none` explícito pega a regra CSS global de baixa
   especificidade (`button { border-radius: 0.75rem }`, CLAUDE.md §6.1)
   por cima da intenção da faixa; `<button>` também não estica pra
   ocupar a largura toda sozinho como um `<div>` faria, precisa de
   `w-full` explícito — os dois motivos pelos quais a primeira tentativa
   dessa versão saiu com cantos arredondados e alinhada à esquerda em
   vez de faixa cheia.
3. **Refinamento final, mesma sessão**: "esta bom assim, porem so deixe
   a mensagem sem esse 'lembrete' e se for uma mensagem maior, q ela
   fique passando.. para diferencias se e para mim ou para os alunos,
   mude a cor, deixe preto para os alunos e vermelho pra mim" + "e as
   mensagem sempre em maiusculo". Quatro mudanças:
   - Texto de categoria por extenso ("(para os alunos)"/"lembrete pra
     mim") removido — a cor sozinha diferencia agora.
   - Cor do TEXTO (não mais do fundo) marca o destinatário: `--ink`
     (preto) pros alunos, `rose-600` (vermelho) pra admin/"pra mim".
   - `uppercase` via CSS (`text-transform`, não mexe no dado digitado,
     só a exibição — mesmo padrão já usado nos títulos de página com
     Bebas Neue).
   - **Ticker de verdade quando o texto não cabe**: `LinhaAviso` mede
     `scrollWidth` do texto vs. largura do container (`useEffect`,
     re-mede em `resize`) e só liga a animação
     (`.aviso-passando`, `@keyframes` no `<style>` do componente raiz)
     quando de fato precisa — texto curto fica parado e centralizado,
     não tem sentido animar o que já cabe. O texto é duplicado no DOM
     (uma cópia visível + uma `aria-hidden`) e a animação desloca
     exatamente -50% (a largura de UMA cópia): dá um loop contínuo sem
     pulo perceptível no fim, técnica clássica de ticker por CSS puro.
   - **Achado de sintaxe no caminho**: um comentário dentro do `<style>`
     usou crase (`` ` ``) ao redor de um nome de componente — como esse
     `<style>` é uma template literal JS (`<style>{\`...\`}</style>`),
     a crase fechou a string prematuramente e quebrou a sintaxe do
     arquivo inteiro. Lição: nunca usar crase dentro de comentários
     CSS que vivem dentro de uma template literal JS — aspas simples ou
     nenhuma marcação, não o padrão de code-span usado no resto dos
     comentários em português deste arquivo.

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
  ~~Só o ícone do vaso (`VaseMark`)~~ ~~substituído em 2026-09-17 pelo logo
  real da marca (wordmark "MTCST" recortado de uma imagem que o Diego
  mandou, fundo transparente, paleta reduzida a 8 cores, embutido como
  base64 em `LogoMark`)~~ **`LogoMark` virou TEXTO de verdade, mesmo dia**
  — o Diego identificou a fonte: "a fonte do logo e a Bebas Neue, refaça
  o logo usando ela". A versão em imagem tinha um bug real e nunca
  resolvido de transparência (`Image.quantize()` do Pillow chamado numa
  imagem RGBA perdia o canal alpha de um jeito que PIL e o navegador
  discordavam sobre o mesmo arquivo — só ficou visível na prática ao
  tentar `filter: brightness(0) invert(1)` pra versão branca do cabeçalho,
  que virou um bloco branco sólido em vez das letras). Trocar pra texto
  elimina o problema inteiro — `LogoMark` agora é um `<span>MTCST</span>`
  com `font-family: 'Bebas Neue'` e `uppercase` (a fonte não tem forma
  minúscula visualmente distinta, é desenhada pra caixa alta), cor via
  `className` normal (`text-[var(--ink)]` nos lugares claros,
  `text-white` no cabeçalho escuro) — sem imagem, sem canal alpha, sem
  base64. `VaseMark` (o ícone antigo) e `LOGO_MTCST_SRC` (a imagem)
  seguem removidos, não usados em lugar nenhum.
- **Bebas Neue também virou a fonte de TODOS os títulos de página
  (`FONT_DISPLAY`/`--font-display`), não só do logo** — "smp titulo de
  alguma pagina faça ela" (sempre, título de qualquer página, use essa
  fonte). `--font-display` trocou de `'Space Grotesk', var(--font-sans)`
  pra `'Bebas Neue', 'Space Grotesk', var(--font-sans)` (Space Grotesk
  fica de fallback, não removido de outros usos). Todo `<h1>` que já usava
  `style={FONT_DISPLAY}` ganhou também `uppercase tracking-wide
  font-bold` — Forno, Nova fornada, Turmas, Alunos, Oficinas, nome da
  oficina em OficinaDetalhe, Solicitações, Pagamentos. Reabre a decisão
  "Space Grotesk nos títulos" registrada em §6.1 abaixo — reabertura do
  próprio Diego, com motivo novo (identificou a fonte real do logo),
  não a IA voltando atrás por conta própria.
- **Cabeçalho mobile ganhou fundo de foto (2026-09-17)** — "qro q a parte
  do topo fique assim, com o logo branco", com referência visual. Primeira
  tentativa foi pílula flutuante (margem + cantos arredondados, mesma
  linguagem visual da nav inferior) — corrigido na hora: "nao qro q seja
  uma pilula flutuante, qro q só tenha essa aparencia de mesclado, porem
  seja quadrado igual estava". Formato final: retangular, borda a borda,
  igual sempre foi. Logo/ícones brancos com sombra escura garantida
  (`textShadow` no logo, `filter: drop-shadow` no sino) — não depende só
  de qual parte da foto cai atrás pra manter contraste, achado do próprio
  Diego reagindo ao resultado ("MTCST" ficando pouco legível sem reforço).
  Logo virou legível de verdade só depois da correção de §6.1 (fonte
  real Bebas Neue, texto em vez de imagem — a versão em imagem tinha o
  bug de alpha documentado em §8).
  **Segunda rodada de ajuste, mesmo dia**: "dobre a altura do cabeçalho,
  tire os 3 risquinho esquerda, pq ja tem esse msm atalho la embaixo,
  troque a imagem do cabeçalho por essa, e aumente um pouco o logo" — 4
  pedidos numa mensagem só:
  1. Altura dobrada: `py-3` → `py-8` (~48px → ~89px medido de verdade,
     não só a classe).
  2. **Botão de menu (hambúrguer) removido** — o botão "Mais" da nav
     inferior mobile já chama o mesmíssimo `setMenuAberto(true)`, o ícone
     era redundante. Layout do cabeçalho trocou de `flex justify-between`
     pra `grid grid-cols-[1fr_auto_1fr]` (coluna vazia / logo / sino) —
     mantém o logo genuinamente centralizado sem precisar de um
     espaçador do tamanho exato do ícone removido.
  3. **Foto trocada pra uma dedicada só do cabeçalho**
     (`FUNDO_CABECALHO_SRC`, mais escura/preta que `FUNDOS_ARGILA.carvao`
     — que continua em uso normal em Oficinas/Sábado, não foi
     substituída, são fotos diferentes agora).
  4. Logo aumentado: `text-lg` → `text-2xl`.
  **Terceira rodada — o Diego reverteu a foto de novo, mas manteve os
  ganhos de tamanho**: "volte a deixar todo o cabeçalho branco com a
  fonte preta, porem aumente mais um pouco". `FUNDO_CABECALHO_SRC`
  removido do cabeçalho (constante continua no código, sem uso — não
  apagada porque ele já pediu foto de volta uma vez, pode pedir de
  novo), fundo `bg-white`, logo/ícones voltam pra `var(--ink)`/
  `var(--ink-soft)` (sem `textShadow`/`drop-shadow` — não precisa em
  fundo claro). Logo aumentado de novo: `text-2xl` → `text-3xl`.
  **Quarta rodada — pílula flutuante de vidro, de verdade dessa vez**:
  "esse cabeçalho ainda nao ficou bom, deixe ele como uma pilula
  flutuante com os cantos arredondados com os efeitos nas bordas igual
  de vidro". Isso REABRE a recusa de pílula flutuante de duas rodadas
  atrás — mas aquela recusa foi especificamente sobre a versão com FOTO
  escura ("nao qro q seja uma pilula flutuante... seja quadrado igual
  estava"); com fundo branco a leitura mudou, não é a IA ignorando o
  pedido anterior. `<header>` virou `position:fixed` (antes `relative`,
  no fluxo normal) com a MESMA receita de vidro da nav inferior —
  `rounded-full` + gradiente branco translúcido + `backdrop-blur-2xl` +
  brilho interno + sombra de dois níveis, não uma variação nova, cópia
  fiel do padrão já estabelecido. Por virar `fixed` (flutua sobre o
  conteúdo, não empurra ele pra baixo), o `<main>` ganhou `pt-24` extra
  só no mobile (compensar a altura da pílula + a margem `top-3` —
  `md:pt-8` mantém o normal no desktop, cabeçalho é `md:hidden` lá de
  qualquer forma) — mesmo padrão que `pb-20` já fazia pra nav inferior.
  **Quinta rodada — o texto "MTCST" em si, duas correções em sequência**:
  1. "pore a fonte mtcst acho q precisa de algum efeito, deixa ela um pouco
     transparente como se fosse vidro escuro" — tentei `color:
     rgba(59,56,51,0.55)` (tinta normal do app, só com alpha). **Rejeitado**
     na hora: "porem ele ficou cinza, e nao qro cinza qro preto com efeito
     q parece vidro" — a causa é óptica, não escolha de tom errado:
     alfa-blend de uma cor escura sobre o fundo CLARO da pílula sempre
     clareia pro cinza, não tem alpha que resolva "preto com transparência"
     sobre fundo claro. Trocado pra `background-clip: text` (+
     `WebkitBackgroundClip`) com um gradiente escuro opaco de verdade
     (preenchimento sólido, não alpha) e `color: transparent` — o "vidro"
     vem de um `textShadow` sutil claro por cima (`0 1px 0
     rgba(255,255,255,0.35)`, brilho de borda), não de transparência real
     do texto.
  2. "e deixe mais preto o mtcst porem com a borda com efeito de vidro" —
     gradiente escurecido pra `#0c0c0b → #000` (preto de verdade, não só
     escuro). Primeira tentativa da borda: `WebkitTextStroke: "0.5px
     rgba(255,255,255,0.4)"`. **Rejeitada na hora**, com screenshot:
     "essa borda ficou muito feia, qro q fique menor q a borda seja pra
     fora da fonte e nao dentro, dentro qro a cor preta" — causa raiz:
     `-webkit-text-stroke` desenha o traço CENTRADO no contorno da letra
     (metade por dentro, metade por fora), então numa fonte com traços
     finos (Bebas Neue) ele invade o preenchimento preto por dentro,
     "sujando" o preto em vez de só contornar. Segunda tentativa: 8
     `textShadow`s sobrepostos (deslocamento pequeno em 8 direções, sem
     blur) tentando simular contorno só por fora — **pior ainda**,
     confirmado por screenshot (não só suposição): a pilha de 8 camadas
     claras semi-transparentes se fundiu visualmente num halo que lavou o
     preto quase inteiro, "MTCST" ficou quase ilegível. **Solução final**:
     `filter: drop-shadow(0 0 0.6px rgba(255,255,255,0.85))
     drop-shadow(0 0.5px 0.5px rgba(255,255,255,0.5))` — `drop-shadow`
     (diferente de `text-shadow`) segue o canal alfa real do que está
     desenhado (o texto já clipado pelo gradiente), então o brilho nasce
     só na borda visível de cada letra, nunca por dentro; usar só 2
     camadas (não 8) evitou o halo. Confirmado por screenshot: preto
     sólido por dentro, contorno claro fino só por fora.
- **Pills/chips coloridos com texto ilegível — achado generalizado
  (2026-09-17)**: o Diego apontou primeiro as abas de dia Qua/Qui em
  Turmas ("esses textos q estao nos quadrinhos coloridos precisam ser
  branco, meio envidraçado", screenshot com setas) e, ao ver a correção,
  generalizou: "a msm regra vale para os outros botoes q estiverem
  coloridos" (com setas apontando o pill de horário "18:30 às 20:30" e o
  chip de dia "Quinta" no card de Turmas). Causa raiz era uma só:
  `estiloVidroTingido()` (função central que estiliza TODO pill/chip
  tingido do app — abas de forno, pill de horário de Turmas, chip de dia
  no card de Turmas, status de Oficinas, tag "Oficina" no detalhe) sempre
  devolvia `color: rgbCor(corKey)` — a mesma cor do fundo tingido, só
  opaca, baixo contraste em qualquer alpha. Corrigido na função em vez de
  em cada botão (antes a correção das abas Qua/Qui tinha sido um override
  só naquele call site, de propósito, por cautela de não saber se os
  outros usos aguentavam texto branco — o pedido generalizado do Diego
  confirmou que sim): `estiloVidroTingido` agora devolve sempre `color:
  "#fff"` + `textShadow: "0 1px 2px rgba(0,0,0,0.35)"` por padrão.
  Verificado ao vivo (computed style + screenshot) em todos os usos:
  abas de forno, pill de horário e chip de dia em Turmas, status
  "Agendada" em Oficinas — todos legíveis. Se um uso futuro de alpha bem
  baixo (fundo quase branco) ficar difícil de ler com texto branco, é
  esse ponto único que precisa de ajuste, não um override espalhado de
  novo.
- **Títulos de página centralizados de verdade em Oficinas/Turmas/Forno,
  subtítulos removidos (2026-09-17)** — "tire esse subtexto e deixe todos
  os titulos centralizados no meio, oficinas, turmas, forno". As 3 telas
  tinham `<h1>` alinhado à esquerda + botão de ação à direita
  (`flex justify-between`); centralizar o `<h1>` com esse layout não é
  trivial quando o botão do lado tem largura diferente do espaço vazio do
  outro lado (testado: `grid grid-cols-[1fr_auto_1fr]`, que funciona bem
  no cabeçalho mobile onde os dois lados são estreitos, deixaria o título
  visivelmente fora do centro aqui, porque a coluna do botão "puxa" mais
  largura que a coluna vazia). Solução: container `relative` +
  `<h1 className="absolute left-1/2 top-1/2 -translate-x-1/2
  -translate-y-1/2">`, que centraliza em relação à largura TOTAL do
  container, e o botão continua em fluxo normal (`justify-end`) por cima.
  Confirmado por `getBoundingClientRect` (não só olho): centro do `<h1>`
  bate exatamente com o centro do viewport nas 3 telas, sem sobrepor o
  botão. Forno e Oficinas também perderam o parágrafo de subtítulo
  (“Acompanhe sua fornada em tempo real.” / “Eventos avulsos com
  inscrição e pagamento.”) — Turmas já não tinha subtítulo desde uma
  rodada anterior.
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
  - ~~`Space Grotesk` (pesos 500/600/700) — só os títulos grandes de
    página~~ **`Bebas Neue` (2026-09-17)** — via `--font-display` +
    `style={FONT_DISPLAY}` (`{ fontFamily: "var(--font-display)" }`),
    não classe Tailwind — mais confiável no ambiente de artifact do que
    arbitrary value de `font-family`. Na primeira resposta da fase
    CRITIQUE o Diego tinha pedido família única (`--font-display` virou
    alias de `--font-sans`); poucos minutos depois voltou atrás no chat
    — Space Grotesk nos títulos ficou como resposta final da fase
    CRITIQUE. **Reaberto de novo, mesmo dia, motivo novo**: o Diego
    identificou que a fonte do próprio logo "MTCST" é Bebas Neue e pediu
    pra usar ela tanto no logo (`LogoMark`, ver §6 — imagem virou texto)
    quanto "sempre, título de qualquer página". `--font-display` agora é
    `'Bebas Neue', 'Space Grotesk', var(--font-sans)` (Space Grotesk
    ainda é o fallback caso Bebas Neue não carregue) e todo `<h1>` que
    usa `FONT_DISPLAY` ganhou `uppercase` — a fonte é desenhada só pra
    caixa alta, não tem uma forma minúscula visualmente distinta.
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

- **`Image.quantize()` do Pillow chamado direto numa imagem RGBA perde o
  canal alpha de um jeito que nem sempre aparece nos seus próprios testes**
  (2026-09-17, durante o processamento do logo antigo — hoje já não é mais
  imagem, ver §6, mas a armadilha vale pra QUALQUER PNG com transparência
  processado neste projeto no futuro, ex: os fundos de `FUNDOS_ARGILA` se
  algum dia precisarem de alpha, hoje são JPEG sem alpha então não foram
  afetados). PIL relendo o PRÓPRIO arquivo salvo às vezes reportava alpha
  correto (`getextrema()` mostrando 0-255) e o navegador, no mesmo arquivo,
  via tudo opaco (`transparentCount: 0` num canvas real) — ou vice-versa,
  dependendo exatamente de como o alpha foi reaplicado depois da
  quantização. Sem erro, sem exceção, só a imagem renderizando errado
  (virou um bloco sólido em vez de letras recortadas — só ficou óbvio ao
  tentar `filter: invert()` pra uma versão branca, que expôs um retângulo
  branco sólido em vez da silhueta esperada). **Não confiar só no
  `Image.open(out).convert('RGBA').split()[-1].getextrema()` do PIL como
  prova de que o arquivo está correto** — verificar TAMBÉM no navegador de
  verdade via canvas (`ctx.drawImage` + `getImageData` + contar pixels com
  alpha 0 vs 255), já que os dois discordaram nesta sessão sobre o mesmo
  arquivo. Se possível, evitar quantização de paleta em PNGs com
  transparência inteiramente — um PNG RGBA sem quantizar (só resize +
  `optimize=True`) é mais pesado mas não tem essa categoria de bug.
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
