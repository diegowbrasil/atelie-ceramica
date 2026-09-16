---
target: Redesign MTCST — demo/AtelieDemo.jsx (fase CRITIQUE do processo /impeccable de 5 fases)
total_score: 23
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:C:\\Users\\Usuario\\Desktop\\APP MTCST\\demo\\AtelieDemo.jsx"
target_fingerprint: "sha256:9b881107436343c0d7cb99dc8cc5a2eb16fdc5b7cacad47540ddd60291dbf5ea"
target_path: "C:\\Users\\Usuario\\Desktop\\APP MTCST\\demo\\AtelieDemo.jsx"
timestamp: 2026-09-16T18-34-43Z
slug: demo-ateliedemo-jsx
---
**Método:** dois sub-agentes isolados — Assessment A (revisão qualitativa de design, relançada do zero como sub-agente novo depois que a primeira tentativa foi cortada por rate limit) e Assessment B (scan determinístico `impeccable detect` + overlay via injeção no navegador, concluída mais cedo nesta mesma sessão). Não degradado.

## Design Health Score

| # | Heurística | Nota | Achado principal |
|---|-----------|------|-------------------|
| 1 | Visibilidade do status do sistema | 2 | Toasts e o gráfico/mostrador ao vivo são bons, mas as duas interações mais repetidas do app (toggle de presença, navegação entre telas) entregam menos feedback do que deveriam |
| 2 | Correspondência com o mundo real | 4 | Vocabulário de cerâmica preciso e consistente (Patamar, Abertura segura, pacote 4/8/12) |
| 3 | Controle e liberdade do usuário | 3 | Cancelar em todo modal, "Voltar" em todo lugar, presença reversível de verdade, conflito de fornada não-destrutivo |
| 4 | Consistência e padrões | 2 | Componentes bem reutilizados na estrutura, mas com vazamentos concretos (checkbox nativo, fonte mono divergente, backdrop que não renderiza) |
| 5 | Prevenção de erros | 3 | "Iniciar fornada" trava até campos obrigatórios; conflito de fornada exige confirmação explícita |
| 6 | Reconhecimento em vez de memorização | 2 | Ícones do nav têm rótulo, mas a bolinha de status RSVP e o botão hambúrguer mobile não |
| 7 | Flexibilidade e eficiência de uso | 2 | "Duplicar configuração" é bom atalho; zero ação em lote (marcar presença de 12 alunos = 12 toques) |
| 8 | Design estético e minimalista | 3 | Limpo nos estados normais; perde ponto porque todo modal deixa fundo e frente competirem |
| 9 | Ajuda a reconhecer/diagnosticar/recuperar de erros | 1 | Nenhuma mensagem de validação inline — nome vazio ou temperatura inválida não fazem nada, sem explicação |
| 10 | Ajuda e documentação | 1 | Zero ajuda contextual no app |
| **Total** | | **23/40** | **Aceitável — melhorias específicas e importantes necessárias; base sólida** |

## Veredito de Especificidade de Design

O Forno é genuinamente autoral. Quase tudo fora dele é uma ferramenta operacional genérica bem executada, com vocabulário de cerâmica pintado por cima.

Específico de verdade: o mostrador circular (TempGauge, demo/AtelieDemo.jsx linhas 822-843) modela "quão perto da temperatura alvo" como um mostrador analógico de forno, não uma barra de progresso genérica, e usa a cor de "ao vivo/ação" do sistema. A seleção múltipla de "Conteúdo do forno" (linhas 138-143) modela uma restrição real (forno comunitário compartilhado). O vocabulário de etapas da queima é preciso, não "pendente/concluído".

Fora do Forno: a lista de vagas de Turmas, a lista de participantes de Oficinas, Pagamentos e Alunos são todas o mesmo padrão -- avatar + nome + badge de status num card branco dividido -- indistinguível de um app de academia ou CRM genérico, isolado do texto em português.

Achado técnico conectado: `--font-display` aliasa literalmente para `--font-sans` (linha 401) -- não existe segunda família tipográfica rodando hoje. A Assessment A leu isso como o código não implementando um par "IBM Plex Mono + Space Grotesk" que o CLAUDE.md descreveria como atual -- mas na verdade o bloco "Tipografia: duas fontes" do CLAUDE.md 6.1 está desatualizado (ainda descreve v1/v2), contradizendo o resumo "Estado atual" logo acima, que já documenta a v3 corretamente. Bug de documentação, não de código -- corrigido separadamente após este relatório.

O achado de design de fundo continua válido e é convergente com a detecção automática: Inter fazendo sozinha todo o trabalho tipográfico é exatamente o tipo de escolha que gera "cara de template", e é a mesma fonte que o detector determinístico da Assessment B sinalizou.

Scan determinístico (Assessment B): `impeccable detect --json demo/AtelieDemo.jsx` voltou 1 achado -- overused-font (Inter, linha 394). Overlay via navegador rodou limpo em 4 telas: Dashboard (82 achados / 63 elementos), Turmas (33/33), Forno (27/27), detalhe de Oficina (24/23) -- dominado por low-contrast e undersized-ui-text. Falso positivo provável: padrão repetido de text-occlusion em avatares empilhados. Achado real e sistêmico, confirmado de forma independente pelas duas avaliações: contraste de --ink-soft na faixa de 3.3-3.7:1, abaixo do WCAG AA (4.5:1).

## Impressão Geral

Base estrutural sólida -- componentes reutilizados de verdade, motor de cálculo do forno sem lógica duplicada, regras de negócio respeitadas na prática. O forno prova que há cuidado de design específico quando o assunto pede; esse cuidado não se espalhou para o resto do app, que roda no piloto automático de "lista de card com avatar e badge". Duas interações de altíssima frequência (modal e toggle) têm bugs que anulam parte do polimento Apple recém-aplicado, e o texto secundário está sistematicamente abaixo do contraste mínimo. Maior oportunidade única: os dois bugs P1 são consertos mecânicos e baratos que devolvem imediatamente a sensação de acabamento -- vale resolver antes ou junto do início da fase SHAPE.

## O que está funcionando

1. TempGauge (linha 822) -- mostrador circular sob medida, reaproveitando a cor de "ao vivo/ação" do sistema.
2. calcularPrevisao (linha 201) como motor único de recalibração -- sem lógica separada de "recalcular", a regra do CLAUDE.md 5 é seguida de verdade no código.
3. Composição de tela única do Nova Fornada (linhas 964-1072) -- cards grandes e tocáveis, feedback de seleção imediato, bloco "Revisão" que só aparece quando há o que revisar.

## Prioridades

[P1] Fundo escurecido de todo modal renderiza totalmente transparente
- O quê: backdrop do Modal (bg-[var(--ink)]/40, linha 308) e do menu mobile (~linha 426) resolvem para rgba(0,0,0,0) -- confirmado via getComputedStyle.
- Por que importa: o modificador de opacidade do Tailwind não aplica canal alfa numa custom property definida como hex string -- cai silenciosamente para transparente. Afeta 7+ usos de Modal e o drawer mobile. Custa mais caro no momento de maior risco (aviso de conflito de fornada).
- Fix: token RGB separado (--ink-rgb: 59 56 51) + bg-[rgb(var(--ink-rgb)/0.4)], ou usar bg-black/40 direto.
- Comando sugerido: /impeccable harden

[P1] Toggle de presença não desliza visualmente
- O quê: a bolinha do Toggle (linha 285-296) renderiza encostada na borda direita da trilha nos dois estados -- confirmado com clique real antes/depois e getBoundingClientRect.
- Por que importa: tocado até 12x por turma, 4x por semana -- interação que o cliente pediu explicitamente para ser reversível/confiável.
- Fix: o span da bolinha não tem left/right (só top-0.5) -- ancorar explicitamente (left-0.5 + translate-x-0/translate-x-[18px]).
- Comando sugerido: /impeccable harden

[P2] Cor de texto secundário (--ink-soft) não passa no WCAG AA -- confirmado por duas fontes independentes
- O quê: --ink-soft #8A8479 (linha 397) mede 3.30:1 contra --cream e 3.71:1 contra cards brancos -- abaixo de 4.5:1. Confirmado independentemente pela Assessment A (cálculo de luminância) e pela Assessment B (padrão sistêmico de low-contrast no overlay das 4 telas).
- Por que importa: segunda cor mais usada do sistema depois de --ink -- rótulos, subtítulos, timestamps.
- Fix: escurecer para ~#6B655C (reconferir contraste) ou dividir em dois tokens.
- Comando sugerido: /impeccable clarify

[P2] Posição de rolagem não reseta ao trocar de tela
- O quê: trocar `tela` via ir() nunca reseta scroll. Reproduzido 2x: Oficina Detalhe -> Forno pousa no meio do gráfico; "Duplicar configuração" pousa no meio do formulário Nova Fornada.
- Por que importa: Forno é a tela mais aberta e mais importante -- pousar no meio tira mostrador/status/botões da vista.
- Fix: resetar scroll dentro de ir() e em abrirNovaFornada.
- Comando sugerido: /impeccable harden

[P3] Duas pequenas inconsistências
- O quê: (a) checkbox "Ver como aluno" (~linha 1407) é input nativo sem estilo, azul padrão; (b) StatCard usa font-mono genérico em vez de font-[family-name:var(--font-mono)].
- Por que importa: pequeno isoladamente, mas é o tipo de "padrão genérico escapou" que enfraquece um sistema de tokens cuidado.
- Fix: restilizar checkbox no padrão de quadradinho já usado no Nova Fornada; trocar a classe de fonte do StatCard.
- Comando sugerido: /impeccable polish

## Red Flags por Persona

Alex (usuária avançada) -- na prática, a Camila é a Alex:
- Marcar presença de turma cheia = 12 toques individuais, sem ação em lote.
- Toggle sem deslizar (P1) tira a confirmação tátil que a memória muscular espera.
- Nenhum atalho de teclado.

Sam (usuária dependente de acessibilidade):
- Botão hambúrguer mobile sem nome acessível (árvore de acessibilidade retorna button sem rótulo).
- Bolinha de RSVP comunica status só por cor em repouso, e tocar para "descobrir" também muda o valor.
- Contraste 3.3-3.7:1 do --ink-soft é barreira de baixa visão quantificada.

Casey (usuária mobile distraída) -- persona diária principal:
- Oficinas não está na barra de abas mobile (TABS_MOBILE só tem dashboard/turmas/forno/solicitações).
- Botões do cabeçalho quebram em duas linhas a 375px.
- Pousar no meio da rolagem ao trocar de tela quebra o fluxo de uma usuária de uma mão só.

## Observações menores

- Ícone de nav de Oficinas é MessageSquare -- não evoca "oficina", só salvo pelo rótulo de texto.
- Badge de contagem de "Solicitações" concatena direto no texto sem separador.
- Dado de demo tem participante de oficina "Camila Rocha" -- mesmo primeiro nome da dona do ateliê, ruído de dado fictício.
- --line (#DEDAD1) mede ~1.24:1 contra --cream -- praticamente invisível como borda.
- "Patamar"/"Abertura segura" em sans-serif vs "Tempo decorrido"/"Tempo restante" em mono -- distinção não sinalizada, confirmar se é intencional.

## Perguntas provocativas

1. Antes do sistema de cor de identidade por turma chegar: qual é o único movimento que faria Turmas/Oficinas/Pagamentos parecerem inconfundivelmente "ateliê de cerâmica", e não um CRM genérico bem vestido?
2. Marcar presença é o controle mais tocado do app e o único ponto com reversibilidade exigida -- hoje o único feedback é mudança de cor, sem movimento. Se essa interação virasse a prova de que "parece Apple", o que isso significaria em movimento?
3. Todo modal abre hoje com o mesmo peso visual (ausente). Agora que o fundo escurecido é um conserto de uma linha, faz sentido dar às confirmações de alto risco um peso maior que às rotineiras?
