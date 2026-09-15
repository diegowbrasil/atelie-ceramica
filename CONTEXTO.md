# Ateliê de Cerâmica — Contexto do projeto (handoff)

> **Leia este arquivo primeiro.** Ele explica o que existe, por que existe,
> o que já foi decidido com o cliente e o que falta fazer. O objetivo é
> permitir que outra sessão (Claude Code ou outra) continue exatamente de
> onde parou, sem refazer decisões.

---

## 1. O que é

Sistema de gestão para um ateliê de cerâmica. Dois perfis apenas:
**Administrador** (a dona do ateliê) e **Aluno**.

O sistema cobre: turmas fixas com controle de vagas/presença, pacotes de
aulas, oficinas avulsas, controle de pagamentos, e — a ferramenta central —
o **Forno**, que acompanha queimas em tempo real.

O cliente descreve o forno como "o coração do ateliê". A ferramenta do forno
deve ser a mais bonita e completa do app.

---

## 2. Estado atual — DOIS artefatos neste pacote

### A) `demo/AtelieDemo.jsx` — **é aqui que o trabalho está acontecendo**

Componente React único (~1580 linhas), sem backend, dados fictícios em
memória. Foi construído para o cliente testar no celular via artifact do
Claude. **Todas as decisões de UX recentes estão neste arquivo**, e ele está
à frente do projeto Next.js em funcionalidade.

Restrições importantes desse arquivo:
- **NÃO usa localStorage/sessionStorage** (artifacts do Claude não suportam —
  quebra a renderização). Estado só em `useState`.
- Imports disponíveis no ambiente de artifact: `react`, `lucide-react`,
  `recharts`, `tailwindcss` (classes core apenas, sem config custom).
- Sempre validar sintaxe antes de entregar. Erros de edição já quebraram o
  arquivo 3x. Comando usado:
  ```bash
  npx esbuild AtelieDemo.jsx --bundle=false --format=esm --outfile=/dev/null
  ```

### B) Raiz do pacote — projeto Next.js + Supabase (base arquitetural)

Estrutura real de produção: Next.js 14 App Router, TypeScript, Tailwind com
design tokens, Supabase (Auth + Postgres + Storage), RLS completo.

**`supabase/schema.sql` é a peça mais valiosa aqui** — schema completo com
todas as tabelas (inclusive das telas que ainda não têm UI) e políticas RLS
para os dois perfis. Use-o como fonte de verdade do modelo de dados.

`src/lib/forno.ts` tem o motor de cálculo de queima tipado (mesma lógica que
está no demo, em TS).

⚠️ O projeto Next.js **está desatualizado em relação ao demo**. As telas de
Oficinas, Pagamentos, status de peças, presença nos cards etc. só existem no
demo. Ao migrar, o demo é a referência de comportamento; o schema é a
referência de dados.

---

## 3. Regras de negócio já definidas (não reabrir com o cliente)

### Turmas
- 4 turmas fixas: Ter 18:30–20:30 · Qua 16:30–18:30 · Qui 14:30–16:30 ·
  **Qui 18:30–20:30**. Atenção: quinta tem DUAS turmas — na UI isso vira
  pills de horário abaixo das abas de dia.
- Exatamente **12 vagas** por turma, exibidas como 12 cards.
- Card ocupado mostra: nome, foto, contador do pacote (3/4), status.
- Card vazio: **admin vê "Cadastrar aluno"** (abre modal: nome + pacote
  4/8/12). O fluxo "Solicitar vaga" é a visão do **aluno**, não do admin.
- Cada card de aluno tem também:
  - **Chip de status da aula**: 🟢 Confirmado (padrão) ↔ 🔴 Ausente. Um toque
    alterna, sem menu.
  - **Botão "Marcar presença"**: some ao clicar, vira selo ✅ Presente,
    incrementa o pacote (3/4 → 4/4). **É reversível** — clicar no selo
    desfaz e decrementa (pedido explícito do cliente).
  - Se a presença fecha o pacote, o card destaca "Última aula" e dispara
    alerta de renovação.

### Forno (ferramenta central)
- Menu "Forno" abre o **painel de acompanhamento**, NUNCA a criação.
- Botão "+ Nova fornada" sempre visível:
  - sem fornada ativa → abre **página dedicada** "Nova fornada" (não modal,
    não drawer);
  - com fornada ativa → modal "Já existe uma fornada em andamento". Confirmar
    salva a atual como **Interrompida** (nunca apaga) e só então abre a
    página nova.
- Status possíveis: Em andamento · Finalizada · Interrompida · Cancelada.
- Etapas da queima: aquecendo → máx. atingida → patamar → resfriando →
  aguardando segura → liberado p/ abrir → finalizada.
- **Conteúdo do forno: seleção múltipla**, sem categoria "Misturado"
  (removida a pedido). Categorias: Peças de alunos · Peças de oficinas ·
  Encomendas · Queimas por fora. Aparecem como etiquetas. **Não cadastrar
  quantidade de peças** — só um campo livre "Detalhes do conteúdo".
- Observações com timestamp, adicionáveis durante toda a queima.
- 3 botões grandes: Atualizar temperatura · Adicionar observação ·
  Finalizar fornada.
- Gráfico é o elemento principal da parte inferior: curva prevista +
  temperatura real + linha de patamar + linha de abertura segura.
- Página "Nova fornada": tudo em UMA tela, sem etapas, sem "Próximo". Cards
  grandes clicáveis para tipo e categorias (com destaque + ícone de check),
  config em grade com presets por tipo, e bloco "Revisão" atualizado ao vivo.
- Histórico lateral com "Duplicar configuração" → abre Nova fornada
  preenchida.

### Motor de cálculo da queima
Função pura `calcularPrevisao(config, iniciadoEm, agora, ultimaLeitura)`.
A sacada: quando o admin informa a temperatura real, ela vira o novo ponto de
origem do cálculo — a mesma função recalibra toda a curva. Não existe lógica
separada de "recalcular".

### Oficinas
- Cada oficina tem página própria (mesmo conceito visual das turmas).
- 12 vagas como cards; vazio = "Cadastrar participante" (modal: nome,
  individual/dupla, dupla-com, pagamento).
- Campos: descrição, **Receita da oficina** (peça → gramas de argila, só
  consulta), observações.
- **Status das peças** (adicionado por último): Em secagem → Biscoitadas →
  Esmaltadas → Prontas para retirada. **Só o admin altera; o aluno apenas
  visualiza** para saber quando buscar. No demo há um toggle "Ver como aluno"
  simulando a visão só-leitura, já que o demo não tem login.

### Pagamentos
- Card "Pagamentos pendentes" do dashboard leva à página.
- Histórico com tipo (pacote / aula avulsa), valor, data, status.
- Pendentes têm botão "Cobrar no WhatsApp": abre modal com mensagem pronta
  ("Oi Fulana! Vi que seu pacote foi finalizado 😊 Quer renovar? Segue a
  chave Pix: ... — valor: R$ ...") e dispara `wa.me` com o texto codificado.

### Alunos
- Lista **começa vazia** — o cliente quer cadastrar alunos reais, não mocks.
- Cadastro: nome, telefone, turma fixa, pacote (4/8/12).

### Dashboard
- KPIs compactos (coluna estreita, 2x2) — o cliente reclamou duas vezes que
  ocupavam espaço demais.
- Card do forno ao lado dos KPIs, com mini gráfico embutido.
- **Calendário "Turmas da semana"** em destaque: colunas por dia com fundo,
  dia atual em laranja, cards de aula brancos com sombra, avatares
  empilhados, dias vazios com placeholder "Sem aulas".

---

## 4. Preferências de UI que o cliente já cobrou (respeite)

- Menu lateral **estreito** (hoje `w-32`, ícone + rótulo pequeno empilhado).
  Ele pediu redução 3x.
- **Sem margem à direita** no conteúdo — deve ir até a borda. O `mx-auto` no
  `<main>` foi removido justamente por isso; não reintroduza.
- Nada de "Olá, Camila" nem o texto "Ateliê de Cerâmica" nos headers — só o
  ícone do vaso.
- Referências visuais: Apple, Linear, Notion, Stripe Dashboard. Muito espaço
  em branco, tipografia refinada, cards arredondados, animações suaves,
  áreas clicáveis grandes. "Software premium, não sistema administrativo."
- Prioridade mobile, mas desktop completo e confortável.
- Paleta: terracota/argila (`orange-600` como acento) sobre neutros `stone`.

---

## 5. Em andamento / próximo passo imediato

**A última coisa em execução** era tornar o calendário do dashboard clicável:
clicar num dia leva à página de Turmas já naquele dia. Isso foi implementado:
- `App` tem `diaTurmaAlvo` + `abrirDiaTurmas(diaId)`;
- `Dashboard` recebe `onAbrirDia` / `onAbrirOficinas` e repassa ao
  `AgendaSemanaCard`;
- colunas do calendário são clicáveis (sábado com oficina → vai para
  Oficinas);
- `Turmas` aceita `diaInicial` e abre no dia certo.

Está funcional. **Vale testar clicando em cada dia** antes de seguir.

### Backlog (ordem sugerida)
1. **Área do Aluno** — login separado com visão só-leitura: próximas aulas,
   aulas restantes do pacote, confirmar presença, solicitar reposição,
   solicitar vaga, status das peças das oficinas. Hoje só existe o toggle
   "Ver como aluno" na tela de oficinas.
2. **Notificações** — sino no header + tabela `notificacoes` (já no schema):
   última aula do pacote, pacote encerrado, solicitações, oficina amanhã,
   queima iniciada/finalizada, peças prontas.
3. **Reposições** — fluxo completo solicitação → aprovar/recusar → confirmado.
4. **Relatórios e Configurações** — hoje são placeholder "Em breve".
5. **Migrar o demo para o projeto Next.js + Supabase** (ver seção 6).
6. Integração real de WhatsApp (hoje é `wa.me`), pagamentos, sensores do forno.

---

## 6. Como migrar demo → produção

O demo é um arquivo só por limitação do ambiente de artifact. Ao levar para
o Next.js:

1. Quebre por rota seguindo a estrutura que já existe em `src/app/(admin)/`.
2. Componentes de UI (`Card`, `Badge`, `Avatar`, `Modal`, `StatCard`) vão
   para `src/components/ui/` — já há versões TS lá, alinhe as duas.
3. Estado local vira queries Supabase; **use `supabase/schema.sql` como
   contrato**. Mutations como Server Actions.
4. `calcularPrevisao` já está tipado em `src/lib/forno.ts` — reutilize, não
   reescreva.
5. RLS já cobre os dois perfis. Middleware + RLS = defesa em profundidade;
   não confie só no middleware.
6. Primeiro admin: cadastre pelo login e rode
   `update profiles set role = 'admin' where email = '...';`

---

## 7. Armadilhas conhecidas

- **Edições no arquivo único já quebraram a sintaxe 3 vezes**, sempre por
  `str_replace` que engoliu uma linha de declaração (`const X = [` sumindo) ou
  fechamento de `.map()`. **Sempre rode o esbuild antes de entregar.**
- `localStorage` é proibido no artifact — se o cliente pedir persistência,
  ou é o projeto Next.js, ou avise da limitação.
- Ao mexer no calendário do dashboard, cuidado com o fechamento do
  `.map()` aninhado (`))}` vs `)}`) — foi exatamente o erro de duas quebras.
- O cliente testa no celular e reporta por screenshot; espaçamentos e
  larguras são o que ele mais nota.

---

## 8. Como o cliente publica o demo

Ele não instala nada local. O caminho é: abrir o artifact no Claude e usar o
botão **Publicar**, que gera link público `claude.site`. Não há acesso a
Vercel/Netlify/StackBlitz a partir do ambiente do Claude — isso já foi
comunicado e aceito.
