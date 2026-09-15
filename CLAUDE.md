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
- Referências visuais: Apple, Linear, Notion, Stripe Dashboard. Muito espaço
  em branco, tipografia refinada, cards arredondados, animações suaves,
  áreas clicáveis grandes. "Software premium, não sistema administrativo."
- Prioridade mobile, desktop completo e confortável.
- Paleta: terracota/argila (`orange-600` acento) sobre neutros `stone`.

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
