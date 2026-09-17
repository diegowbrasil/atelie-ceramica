---
version: 1
slug: "demo-ateliedemo-jsx"
primary_target: "demo/AtelieDemo.jsx"
related_targets: []
---

## Escopo e modo de visita

Operate (ferramenta administrativa de uso diário, não site de persuasão).
Telas: Turmas (lista de vagas), Oficinas (lista de participantes),
Pagamentos (histórico), Alunos (diretório) — mais a barra de navegação
mobile (chrome global, ver "Material" abaixo pelo motivo de entrar aqui
mesmo sendo compartilhada por todas as telas). Fora de escopo: Dashboard
(calendário/KPIs — não é o padrão "avatar+badge" apontado pela crítica) e
Forno (já é a referência de qualidade, não o problema).

## Job e audiência

Hanna, dona do ateliê, único perfil administrador ativo, quase sempre no
celular, durante o funcionamento real do ateliê (entre atender aluno,
mexer em argila, acompanhar forno). Tarefa recorrente, não exploratória:
"quem está nessa turma, como estão as peças dela, quem me deve".

## Resultado e prova

Sucesso = reconhecer turma/oficina/status num relance, sem ler texto linha
por linha. Prova específica do produto (não genérica): pacote de aulas é
uma fração que se completa (3/4), peça passa por estágios físicos reais
(secagem→biscoita→esmalte→pronta), queima sobe até um patamar — três
processos do MESMO tipo (algo caminhando até um estado final), hoje
representados de três formas diferentes (texto solto, stepper linear,
anel do Forno). A crítica achou isso porque a Turma/Oficina fora do Forno
não usa a linguagem visual que o Forno já provou funcionar.

## Direção escolhida

**Autoridade visual**: mundo já estabelecido (não é criação nova) —
cream/ink/terracota, Inter + Space Grotesk, cantos arredondados. Nesta
revisão (2026-09-17) o Diego pediu explicitamente **duas adições
materiais** ao mundo v3 existente — não substituição: (1) paleta de
identidade em tons terrosos de pigmento de argila; (2) o material "vidro
líquido" da Apple (referências trazidas por ele: a barra de navegação
flutuante do iOS, o painel de widgets do visionOS) — vidro fosco com
espessura/profundidade real, não só opacidade reduzida. VigaShoes/Apple
continuam como referência geral; o vidro é a Apple ficando ainda mais
concreta e específica do que estava antes.

**Forma**: resolvida diretamente + iterada ao vivo com mockups visuais
(não rodei `concept-seed`) — pedido preciso, mundo visual já fixado,
telas existentes sendo reestruturadas. `new-work.md` §3 orienta resolver
direto nesse caso ("local extension / precisely specified narrow
request"). **6 rodadas de mockup com o Diego** (widget HTML, não o app
real) até fechar: (1) fração dentro do anel, não fora; (2) cor de
identidade em mais lugares que só o quadradinho — pill + borda + chip +
anel; (3) paleta vívida rosa/violeta rejeitada — "estranho, quero tons
terrosos"; (4) transparência/vidro pedida, referência Apple; (5) vidro
não deve ser só transparência — widgets sólidos e coloridos com
profundidade 3D também fazem parte da referência (imagem do visionOS:
widget sólido ao lado de painel de vidro); (6) fechado: vidro de verdade
(blur + saturação + brilho de borda + sombra dando espessura), não uma
camada só semi-transparente e lisa — confirmado com "isso melhorou,
continue".

### THESIS
Progresso circular é o dispositivo visual assinatura do app inteiro
(anel reaproveitado do Forno); o material que carrega esse anel e a
identidade de turma é vidro líquido de verdade — translúcido, desfocado,
com espessura e brilho de lente — não uma superfície opaca nem uma
opacidade reduzida lisa. Recusa dois padrões-categoria ao mesmo tempo:
"lista de avatar + nome + badge de texto" genérica, e "glassmorphism"
raso (só `opacity` baixa sem blur/espessura/brilho, o clichê de 2020 que
não convence ninguém de que é vidro).

### OWN-WORLD
Tokens v3 existentes (cream/ink/accent/Inter/Space Grotesk) + três peças
novas:
1. `ProgressRing` — generalização do `TempGauge` (mesma matemática SVG),
   cor/tamanho parametrizáveis em vez de hardcoded `--accent`.
2. **Paleta de identidade** — pigmentos de argila, tom cheio + tom claro
   translúcido do mesmo tom (par duotone), ver tabela abaixo.
3. **Material vidro** — receita fixa reaproveitada em todo elemento de
   vidro do app (ver "Material" abaixo), não inventada de novo por tela.

### Paleta de identidade — pigmentos de argila (revisão final)
Testei antes uma versão mais vívida (rosa/violeta/magenta) — rejeitada
("estranho", "quero tons terrosos, que tenha mais a ver com argila").
Versão final, tons de pigmento de terra real (sienna, ardósia, musgo,
óxido de manganês), mais saturados que o primeiro rascunho muito
apagado, mas sem entrar no território vívido/joia:
```
--turma-sienna:  #8B4A2B   (sienna queimada — pigmento de terra clássico)
--turma-ardosia: #4A6178   (azul-ardósia — engobe/slip sobre grês)
--turma-musgo:   #5F6B3A   (verde-musgo — óxido sobre argila)
--turma-cafe:    #4A342A   (café/manganês — quase preto, argila escura)
```
Cada cor existe em par duotone: o tom cheio acima (texto, ícone, traço do
anel, pill ativa não usa isso — pill ativa é sempre `--accent`) + uma
versão translúcida do mesmo tom pro vidro (`rgba(r,g,b,0.20-0.42)`
dependendo do elemento, ver "Material"). **Deliberadamente longe da
família do `--accent`** (laranja-terracota) — nenhuma delas é
vermelho/laranja, pra nunca serem confundidas com "ação".
**Mecanismo de atribuição** (automático, confirmado com o Diego): as 4
turmas fixas mapeiam 1:1 por horário — Ter 18:30→sienna, Qua
16:30→ardósia, Qui 14:30→musgo, Qui 18:30→café. Oficinas (número
variável) ciclam pelas mesmas 4 por índice de criação.

### Onde a cor de identidade aparece (revisado — 3 lugares, não 4)
A ideia original de borda colorida no card da lista foi **superada**
durante a iteração visual: o card da lista virou vidro neutro (não
colorido por turma) pra não competir com o conteúdo das linhas. Cor de
identidade aparece em exatamente 3 lugares agora:
1. **Pill de horário** (só as 4 turmas fixas) — pill ativa em
   `--accent` sólido (ação/seleção); pills inativas em vidro tingido com
   a cor da própria turma.
2. **Chip do cabeçalho** (nome da turma/oficina) — vidro tingido, mesmo
   tom.
3. **Anel de progresso** — traço sólido na cor da turma (não vidro — ver
   "Material" sobre por que o anel fica fora do tratamento de vidro).
Card da lista, `Avatar`, `Toggle`, badges de status (Pendente/Renovar)
continuam neutros/semânticos, sem cor de identidade.

### Material: vidro líquido — receita e onde aplica
**Onde aplica**: card da lista (Turmas/Oficinas), pills de horário
inativas, chip de identidade do cabeçalho, barra de navegação mobile
flutuante (chrome compartilhado — é o "dock" da referência do iOS, faz
sentido ganhar o mesmo material em toda tela, não só nestas 4). Ativo
(pill selecionada, item de nav ativo, botões) continua `--accent` sólido
— vidro é estado de repouso/neutro, sólido é ação/seleção, mesma lógica
de sempre, só que agora com um terceiro material (vidro) além de
sólido-neutro e sólido-accent.

**Onde NÃO aplica** (decisão explícita, não esquecimento): `Avatar`
(precisa ler nome/iniciais com nitidez), `Toggle`/badges de status
(pequenos, blur em elemento pequeno vira ilegível — aprendido testando o
anel: manteve traço sólido pelo mesmo motivo), stepper de status das
peças (já usa `--accent` corretamente, crítica não achou problema nele).

**Receita** (testada e ajustada em 3 rodadas até parecer vidro de
verdade, não só "meio transparente"):
- Fundo: gradiente de branco translúcido, mais opaco no topo —
  `from-white/65 to-white/30` (ou equivalente pra elementos tingidos:
  gradiente do tom cheio em opacidade 0.42→0.20).
- `backdrop-blur-2xl` (~24-26px) + `backdrop-saturate-150`\~`200` —
  blur sozinho lava a cor de trás; a saturação extra é o que faz o vidro
  "puxar" cor do que está atrás em vez de ficar cinza.
- Borda **clara e visível** (`border border-white/70`, não um hairline
  quase invisível) — é a borda que lê como "borda de lente", não decoração.
- Brilho superior: `shadow-[inset_0_1.5px_0_rgba(255,255,255,0.8)]` —
  simula a curvatura/espessura de uma superfície de vidro.
- Sombra de baixo pra dar profundidade: sombra suave de dois níveis
  (contato + difusa), não só `shadow-sm` chapado.
- **Precisa de cor atrás pra funcionar** — testado ao vivo: sobre fundo
  liso (`--cream` só), o vidro lê como "só um pouco transparente", não
  como vidro. Fundo cream **ganha 2-3 manchas de gradiente suaves e
  desfocadas** (`blur-3xl`, opacidade baixa ~0.4-0.5), nas cores da
  paleta de identidade + accent, fixas por trás do conteúdo — é o que dá
  ao vidro algo de verdade pra desfocar e mostrar espessura. Isso é
  suporte funcional do material escolhido, não decoração solta — sem
  isso o vidro simplesmente não lê como vidro (testado e confirmado
  nesta sessão).

### STORY
Hanna abre Turmas: reconhece a cor da terça na pill antes de ler o
texto. A lista inteira tem espessura de vidro sobre o fundo com manchas
suaves de cor — não é mais uma folha de papel branca, é uma superfície
com profundidade de verdade. O anel de cada aluno mostra a fração exata
dentro dele. Marcar presença anima o anel enchendo (reaproveita a
transição de 700ms do `TempGauge`).

### FIRST VIEWPORT (por tela)
- **Turmas**: header com chip de vidro tingido (turma atual) + pills de
  horário (ativa sólida accent, inativas vidro tingido) + card de lista
  em vidro neutro contendo linhas avatar+nome+badge-semântico+anel
  (40px, cor da turma, fração centrada)+toggle.
- **Alunos**: mesmo `ProgressRing` (mesmo dado, visão cross-turma) + chip
  de cor da turma do aluno junto a "turma · telefone"; card da lista em
  vidro neutro igual Turmas.
- **Oficinas**: sem anel (sem fração real por participante — decisão já
  tomada antes desta rodada de material, continua valendo); chip do
  cabeçalho em vidro tingido; sem pill de horário (sem os 4 slots
  fixos); card em vidro neutro.
- **Status das peças** (Oficina): sem mudança — stepper linear já correto.
- **Pagamentos**: sem anel; chip de cor da turma associada por linha, se
  aplicável; card do histórico em vidro neutro igual às outras.
- **Nav mobile flutuante**: vidro (chrome global), item ativo em pill
  sólida `--accent`, ícones inativos sem fundo.

### Interação assinatura
Marcar presença anima o anel preenchendo (transição de 700ms reaproveitada
do `TempGauge`) — hoje o toggle só muda de cor, sem retorno visual do que
realmente aconteceu no pacote.

### FORM
Resolvido diretamente + 6 rodadas de mockup visual (widget HTML) com o
Diego reagindo a cada uma — não `concept-seed`. Sem seed key. Ver
"Direção escolhida" pelo relato completo da iteração.

### FINISH
unreviewed and undocumented is unfinished; this build ends with the
finish review, the verdict, DESIGN.md, and every shipping raster
carrying its provenance.

## Escopo e limites

**Fidelidade**: brief pra implementação real na fase CRAFT. **O que NÃO
muda**: regras de negócio do CLAUDE.md §5, arquitetura de arquivo único,
`calcularPrevisao` intocado, nenhum dado mock novo inventado além das
manchas de gradiente de fundo (que são decoração funcional do material,
não dado). **Anti-meta explícito**: não adicionar biblioteca nova
(`backdrop-blur`/`backdrop-saturate` são classes core do Tailwind, já
disponíveis no ambiente de artifact via CDN — confirmar isso na prática
antes de aplicar em massa, é a única dependência técnica não testada
ainda deste brief); não tirar informação explícita (fração sempre como
texto dentro do anel); não aplicar vidro em elemento pequeno/denso de
informação (avatar, toggle, badge) onde o blur prejudicaria a leitura.

## Estados e faixas

Pacote: 0/4 a 12/12. Turma sem aluno: vaga vazia mantém tratamento atual
("Cadastrar aluno"), sem chip de cor (não é pessoa). Oficina nova: cor
atribuída na criação.

## Interação e layout

Nenhuma mudança de hierarquia/navegação/topologia — é tratamento visual
sobre a estrutura já redesenhada mobile-first nesta sessão (lista de uma
coluna, toggle, avatar).

## Restrições e decisões em aberto

- **Constraint confirmada**: cor por turma é automática, sem UI de
  escolha pra Hanna.
- **Constraint confirmada nesta revisão**: vidro é vidro de verdade
  (blur+saturação+borda clara+brilho+sombra), nunca só `opacity`
  reduzida — e precisa de manchas de cor de fundo pra funcionar
  visualmente.
- **Decisão em aberto pro CRAFT**: verificar na prática (não só
  teoricamente) que `backdrop-filter` renderiza corretamente no ambiente
  de artifact do Claude.ai (CDN Tailwind) antes de aplicar em todo o
  arquivo — testar num componente primeiro.
- **Decisão em aberto pro CRAFT**: nome exato da prop/função índice→cor
  pra oficinas — resolver no código, não é decisão de produto.
- **Não decidido, não urgente**: paleta configurável pela Hanna (não
  pedida).
