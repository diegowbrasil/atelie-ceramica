# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

Roda em navegador (Chrome/Safari mobile incluído) — não é um wrapper nativo
iOS/Android. A meta explícita do produto (ver Product Principles) é que a
*experiência* pareça um app nativo mesmo rodando em web; isso não muda a
plataforma registrada aqui, só a régua de qualidade da UI.

## Stack

Existente — ver CLAUDE.md §2 e §3 pelo detalhe operacional completo (como
rodar, publicar, armadilhas). Resumo: React de arquivo único
(`demo/AtelieDemo.jsx`, sem bundler no ambiente de destino), Tailwind
(classes core via CDN JIT, sem config customizado), Recharts, lucide-react.
Preview local via Vite (`npm run preview:demo`) espelha o mesmo arquivo sem
cópia. Existe também um projeto-base Next.js 14 + Supabase, hoje pausado
sem investimento (decisão do Diego) — não é o alvo deste redesign.

## Users

Dois perfis, um ateliê de cerâmica só:
- **Administradora** (Hanna, dona do ateliê) — usa o app no dia a dia pra
  gerir turmas fixas, presença, pacotes, oficinas avulsas, pagamentos e
  acompanhar o forno em tempo real. É quem mais abre o app, no celular.
- **Aluno** — perfil planejado, ainda não implementado de verdade (só um
  toggle "Ver como aluno" simulando a visão só-leitura numa tela). Quando
  existir: vê as próprias aulas/pacote, confirma presença, solicita
  reposição/vaga, acompanha status das peças das oficinas em que está.

Diego conduz o projeto do lado do cliente (aprova decisões de produto,
testa e publica o demo) — não é necessariamente quem usa no dia a dia.

## Product Purpose

Ferramenta de gestão interna pro ateliê de cerâmica: turmas fixas com
controle de vagas/presença, pacotes de aulas, oficinas avulsas, pagamentos,
e o **Forno** — acompanhamento de queima em tempo real, descrito pelo
cliente como "o coração do ateliê" e que deve ser a ferramenta mais bonita
e completa do app. Sucesso = Hanna consegue rodar o dia a dia do ateliê
(marcar presença, ver quem precisa renovar pacote, acompanhar uma queima,
cobrar pagamento pendente) inteiramente pelo celular, rápido, sem fricção.

## Positioning

Não é um produto de mercado disputando usuários — é uma ferramenta interna
de um negócio, encomendada sob medida. O "concorrente" real não é outro
software de gestão, é a alternativa de Hanna continuar no caderno/planilha
ou WhatsApp solto. A vara de comparação que o Diego trouxe é de qualidade
de experiência (Apple) e de linguagem visual editorial (VigaShoes), não de
feature-parity com outro gestor de ateliês.

## Operating Context

- Ateliê físico, 4 turmas fixas por semana (Ter 18:30, Qua 16:30, Qui
  14:30, Qui 18:30), 12 vagas cada.
- Pacotes de aulas (4/8/12) por aluno, consumidos aula a aula.
- Oficinas avulsas agendadas, com inscrição paga (individual ou dupla) e
  acompanhamento de status das peças (secagem → biscoitada → esmaltada →
  pronta).
- O Forno é compartilhado entre turmas/oficinas/encomendas/queimas de
  terceiros numa mesma fornada — precisa de acompanhamento em tempo real
  (temperatura estimada vs. real, etapas, previsão de abertura segura).
- Cobrança hoje é manual via Pix + WhatsApp (`wa.me` com mensagem
  pré-pronta), sem gateway de pagamento integrado.
- Hanna testa o demo no próprio celular; Diego publica atualizações.

## Capabilities and Constraints

Ver CLAUDE.md §5 pelas regras de negócio completas e já fechadas com o
cliente (não reabrir sem motivo novo) — Turmas, Forno, Oficinas,
Pagamentos, Alunos, Dashboard. Restrições técnicas que valem pro redesign:

- **Sem `localStorage`/`sessionStorage`** — quebra o ambiente de artifact
  do Claude.ai, que é hoje o canal de publicação pro cliente testar num
  celular que não seja o do Diego. Estado só em `useState`.
- **Arquivo único** (`demo/AtelieDemo.jsx`) por causa do ambiente de
  artifact (sem bundler, sem resolução de imports locais) — ver decisão
  em aberto no fim deste documento sobre até onde isso deve valer no
  redesign estrutural pedido.
- Motor de cálculo da queima (`calcularPrevisao`) é função pura,
  deliberadamente reaproveitada sem duplicar lógica — não reescrever.
- Reversibilidade de "Marcar presença" (desfazer decrementa o pacote) é
  requisito explícito do cliente, não remover.

## Brand Commitments

- Nome do produto/marca: **MTCST**. Ateliê de cerâmica, dona Hanna.
- Paleta base já fixada nesta sessão a partir do CSS real do site novo do
  MTCST (`mtcst-ceramics`): cru `#F2F2EB` + tinta `#3B3833`, acento
  terracota `#C2410C` (ligado a argila/cerâmica).
- **Referências vinculantes trazidas pelo Diego, nesta ordem de peso**:
  VigaShoes (vigashoes.com, marca VIGA) pra linguagem estética/editorial;
  Apple pra clareza, acabamento e sofisticação de experiência. Explícito:
  "não copie literalmente nenhuma das duas — crie identidade própria do
  MTCST."
- Ícone de marca: o vaso (`VaseMark`, SVG próprio) — sem nome escrito nem
  saudação ("Olá, Hanna") nos headers, decisão já cobrada 2× pelo
  cliente.

## Evidence on Hand

- `CLAUDE.md` — contexto permanente completo, regras de negócio fechadas,
  decisões técnicas, armadilhas conhecidas. Ler junto com este arquivo.
- `PROGRESS.md` — histórico vivo sessão a sessão, inclusive o raciocínio
  por trás de cada virada de direção visual de hoje.
- `supabase/schema.sql` — modelo de dados completo (fonte de verdade),
  inclusive tabelas de telas ainda sem UI.
- Site real do MTCST: `http://192.168.1.180:3000` (rede local do Diego, IP
  pode mudar). Referência de vigashoes.com já analisada e documentada.
- Sem depoimentos, cases ou métricas de uso reais ainda — não inventar.

## Product Principles

1. **Celular primeiro, de verdade** — não só responsivo: precisa ler como
   app nativo (navegação, densidade, áreas de toque, ausência de "cara de
   site"), mesmo rodando em navegador.
2. **O Forno é o coração** — a ferramenta de acompanhamento de queima
   recebe o maior cuidado visual e de interação do app; nenhuma outra tela
   deve competir com ela em destaque.
3. **Cor com intenção, não decoração genérica** — o pedido explícito do
   Diego é fugir de "tudo em fundo branco com texto" e usar cor de verdade
   em cards/botões/tags/navegação, inclusive cor de identidade própria por
   turma/oficina — mas sempre com critério (ação, identidade, ou estado),
   nunca aleatória.
4. **Reversível e sem perda de dado** — ações administrativas sensíveis
   (marcar presença, trocar fornada) sempre avisam/permitem desfazer antes
   de perder histórico.
5. **Um arquivo, uma fonte de verdade visual** — qualquer mudança de
   design entra primeiro no demo (`AtelieDemo.jsx`); o projeto Next.js é
   base arquitetural parada, não o alvo ativo.

## Accessibility & Inclusion

Nenhum requisito de acessibilidade específico levantado pelo cliente ainda.
Boas práticas gerais (contraste, área de toque, foco de teclado) valem por
padrão — ver `reference/craft-floor.md` do impeccable pela régua mecânica.

---

## Decisão confirmada (2026-09-16): arquitetura de código do redesign

Perguntado ao Diego antes da fase CRAFT: o pedido de estrutura de pastas
(`components/screens/hooks/...`) conflita com a restrição de arquivo único
que mantém `demo/AtelieDemo.jsx` publicável como artifact do Claude.ai.
**Resposta: manter arquivo único.** O código é organizado POR DENTRO do
mesmo arquivo — seções claras, componentes bem definidos e reutilizados,
zero duplicação — mas sem separar em pastas de verdade. O canal de
publicação pro Claude.ai continua sendo o principal pra Hanna testar.
