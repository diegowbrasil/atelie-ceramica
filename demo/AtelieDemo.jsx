import React, { useEffect, useMemo, useState } from "react";
import {
  Home, Users, GraduationCap, Flame, Bell, CreditCard, Menu, X,
  BarChart3, Settings, MessageSquare, Plus, MoreVertical, Thermometer,
  ChevronDown, ChevronLeft, CalendarDays, RotateCcw, Check, Clock,
  Snowflake, ShieldCheck, Flag, MessageCircle, GraduationCap as GradIcon,
  Truck, Package, School,
} from "lucide-react";
import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from "recharts";

/* ------------------------------------------------------------------ */
/*  Dados fictícios base                                               */
/* ------------------------------------------------------------------ */

const TURMAS_DIAS = [
  { id: "seg", label: "Seg", disponivel: false, turmas: [] },
  { id: "ter", label: "Ter", disponivel: true, turmas: [{ id: "ter-1830", dia: "Terça-feira", hora: "18:30 às 20:30" }] },
  { id: "qua", label: "Qua", disponivel: true, turmas: [{ id: "qua-1630", dia: "Quarta-feira", hora: "16:30 às 18:30" }] },
  { id: "qui", label: "Qui", disponivel: true, turmas: [
    { id: "qui-1430", dia: "Quinta-feira", hora: "14:30 às 16:30" },
    { id: "qui-1830", dia: "Quinta-feira", hora: "18:30 às 20:30" },
  ] },
  { id: "sex", label: "Sex", disponivel: false, turmas: [] },
  { id: "sab", label: "Sáb", disponivel: false, turmas: [] },
  { id: "dom", label: "Dom", disponivel: false, turmas: [] },
];

/* Paleta de identidade por turma/oficina — pigmentos de argila, atribuição
   automática (fase SHAPE, 2026-09-17). Nunca usar tons da família do
   --accent (laranja-terracota) aqui — identidade de grupo e ação/dado-ao-vivo
   são duas famílias de cor separadas, de propósito (ver CLAUDE.md §6.1). */
const CORES_IDENTIDADE = {
  sienna: "139 74 43",
  ardosia: "74 97 120",
  musgo: "95 107 58",
  cafe: "74 52 42",
};
const CORES_ORDEM = ["sienna", "ardosia", "musgo", "cafe"];
const TURMA_COR = { "ter-1830": "sienna", "qua-1630": "ardosia", "qui-1430": "musgo", "qui-1830": "cafe" };
/* Mesmas 4 turmas, chave por rótulo em vez de id — usado onde o dado só
   tem o texto (ex: cadastro de aluno), não o id de TURMAS_DIAS. */
const TURMA_LABEL_COR = { "Terça 18:30": "sienna", "Quarta 16:30": "ardosia", "Quinta 14:30": "musgo", "Quinta 18:30": "cafe" };

function rgbCor(corKey, alpha) {
  const rgb = CORES_IDENTIDADE[corKey] || CORES_IDENTIDADE.sienna;
  return alpha === undefined ? `rgb(${rgb})` : `rgb(${rgb} / ${alpha})`;
}
function corTurma(turmaId) { return TURMA_COR[turmaId] || "sienna"; }
function corOficina(oficina) {
  let h = 0;
  for (let i = 0; i < oficina.id.length; i++) h = (h * 31 + oficina.id.charCodeAt(i)) | 0;
  return CORES_ORDEM[Math.abs(h) % CORES_ORDEM.length];
}
/* Estilo inline (não classe Tailwind) porque a cor varia em tempo de
   execução por turma/oficina — o scanner JIT do Tailwind (CDN) só gera CSS
   pra classes literais no código-fonte, não pra strings montadas em JS. */
function estiloVidroTingido(corKey) {
  return {
    background: `linear-gradient(180deg, ${rgbCor(corKey, 0.45)}, ${rgbCor(corKey, 0.22)})`,
    borderColor: rgbCor(corKey, 0.45),
    color: rgbCor(corKey),
  };
}
const VIDRO_CARD = "rounded-[26px] border border-white/70 bg-gradient-to-b from-white/50 to-white/15 shadow-[inset_0_1.5px_0_rgba(255,255,255,0.8),0_16px_32px_-10px_rgba(59,56,51,0.22),0_2px_6px_rgba(59,56,51,0.08)] backdrop-blur-2xl backdrop-saturate-150";
const VIDRO_PILL = "rounded-full border backdrop-blur-xl backdrop-saturate-150 shadow-[inset_0_1.5px_0_rgba(255,255,255,0.6)]";
/* "Sólido" != chapado: mesmo o estado de ação/selecionado ganha gradiente +
   brilho superior + sombra, a mesma qualidade de profundidade do vidro, só
   sem o blur/translucidez — nunca um preenchimento de cor plana lisa. */
const ACCENT_SOLIDO = "bg-gradient-to-b from-[#D2601F] to-[var(--accent)] text-white shadow-[inset_0_1.5px_0_rgba(255,255,255,0.35),0_3px_10px_-2px_rgba(194,65,12,0.45)]";
/* Pill neutra pros dias sem turma (Seg/Sex/Sáb/Dom) — muda mas legível,
   não texto quase invisível direto sobre o fundo colorido. */
const VIDRO_PILL_NEUTRO = "rounded-full border border-white/50 bg-white/25 text-[var(--ink-soft)] backdrop-blur-md";

function ManchasFundo() {
  /* Do tamanho do viewport inteiro (fixed), não de um "quadro" pequeno —
     precisam ser grandes/fortes o bastante pra ler em tela cheia, inclusive
     driblando a sidebar desktop opaca (128px) que cobre manchas encostadas
     na borda esquerda. Testado e recalibrado depois que a primeira versão
     (raios de 176-224px) ficou praticamente invisível em desktop. */
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -right-32 -top-32 h-[480px] w-[480px] rounded-full blur-3xl" style={{ background: rgbCor("sienna", 0.5) }} />
      <div className="absolute left-24 -top-20 h-[380px] w-[380px] rounded-full blur-3xl" style={{ background: rgbCor("ardosia", 0.4) }} />
      <div className="absolute -right-20 bottom-0 h-[420px] w-[420px] rounded-full blur-3xl" style={{ background: rgbCor("musgo", 0.42) }} />
      <div className="absolute left-32 bottom-0 h-[360px] w-[360px] rounded-full blur-3xl" style={{ background: rgbCor("cafe", 0.32) }} />
    </div>
  );
}

const VAGAS_INICIAIS = [
  { numero: 1, nome: "Maria Oliveira", aula: 3, total: 4, status: "confirmado", statusAula: "confirmado", presente: false },
  { numero: 2, nome: "João Silva", aula: 1, total: 4, status: "pendente", statusAula: "confirmado", presente: false },
  { numero: 3, nome: "Ana Paula", aula: 4, total: 4, status: "ultima", statusAula: "confirmado", presente: false },
  { numero: 4, nome: "Pedro Santos", aula: 2, total: 8, status: "confirmado", statusAula: "confirmado", presente: false },
  { numero: 5, nome: "Júlia Costa", aula: 2, total: 4, status: "confirmado", statusAula: "confirmado", presente: false },
  { numero: 6, nome: "Lucas Mendes", aula: 3, total: 4, status: "confirmado", statusAula: "confirmado", presente: false },
  { numero: 7, nome: "Carla Souza", aula: 1, total: 4, status: "pendente", statusAula: "confirmado", presente: false },
  { numero: 8, nome: "Rafael Lima", aula: 5, total: 8, status: "confirmado", statusAula: "confirmado", presente: false },
  { numero: 9, nome: null }, { numero: 10, nome: null }, { numero: 11, nome: null }, { numero: 12, nome: null },
];

const ALUNOS = [
  { nome: "Maria Oliveira", turma: "Terça 18:30", pacote: "3/4 aulas", tel: "(14) 99123-4567" },
  { nome: "João Silva", turma: "Terça 18:30", pacote: "1/4 aulas", tel: "(14) 99234-5678" },
  { nome: "Ana Paula", turma: "Terça 18:30", pacote: "4/4 aulas", tel: "(14) 99345-6789" },
  { nome: "Pedro Santos", turma: "Terça 18:30", pacote: "2/8 aulas", tel: "(14) 99456-7890" },
  { nome: "Beatriz Almeida", turma: "Quarta 16:30", pacote: "novo pacote", tel: "(14) 99567-8901" },
];

function oficinasIniciais() {
  return [
    {
      id: "o1", nome: "Kit Café da Manhã", status: "Agendada", statusPecas: "secagem",
      data: "24 de Maio de 2026", hora: "09:00 às 13:00", valor: 220,
      vagas: 12,
      descricao: "Nesta oficina você irá criar seu próprio kit café da manhã com peças feitas à mão. Vamos trabalhar com formas simples e funcionais, perfeitas para o dia a dia.",
      receita: [
        { item: "Cumbuca", peso: "650 g de argila" },
        { item: "Pratinho", peso: "650 g de argila" },
        { item: "Caneca", peso: "550 g de argila" },
      ],
      observacoes: "Levar avental, toalha e muita criatividade!",
      participantes: [
        { numero: 1, nome: "Maria Oliveira", tipo: "dupla", duplaCom: null, pagamento: "pago" },
        { numero: 2, nome: "Juliana Costa", tipo: "dupla", duplaCom: "Maria", pagamento: "pago" },
        { numero: 3, nome: "Pedro Lima", tipo: "individual", pagamento: "pago" },
        { numero: 4, nome: "Ana Paula", tipo: "individual", pagamento: "pendente" },
        { numero: 5, nome: "Rafael Souza", tipo: "dupla", duplaCom: null, pagamento: "pago" },
        { numero: 6, nome: "Camila Rocha", tipo: "dupla", duplaCom: "Rafael", pagamento: "pago" },
        { numero: 7, nome: "Larissa Silva", tipo: "individual", pagamento: "pago" },
        { numero: 8, nome: "João Marcos", tipo: "individual", pagamento: "pendente" },
        { numero: 9, nome: "Fernanda T.", tipo: "dupla", duplaCom: null, pagamento: "pago" },
        { numero: 10, nome: "Renata Costa", tipo: "dupla", duplaCom: "Fernanda", pagamento: "pago" },
        { numero: 11, nome: null }, { numero: 12, nome: null },
      ],
    },
    {
      id: "o2", nome: "Esmaltação Criativa", status: "Agendada", statusPecas: "biscoitadas",
      data: "18 de Maio de 2026", hora: "14:00 às 17:00", valor: 180,
      vagas: 12,
      descricao: "Oficina de esmaltação livre sobre peças já biscoitadas — ideal para quem quer experimentar combinações de cor.",
      receita: [{ item: "Peça biscoitada (fornecida)", peso: "1 peça por participante" }],
      observacoes: "",
      participantes: Array.from({ length: 12 }, (_, i) => i < 6
        ? { numero: i + 1, nome: ["Beatriz Almeida","Felipe Martins","Sofia Ramos","Diego Alves","Nina Prado","Caio Duarte"][i], tipo: "individual", pagamento: i % 3 === 0 ? "pendente" : "pago" }
        : { numero: i + 1, nome: null }),
    },
  ];
}
const AGENDA_SEMANA = [
  { dia: "SEG", num: 12, aulas: [] },
  { dia: "TER", num: 13, aulas: [{ hora: "18:30 - 20:30", ocupados: 8, total: 12, nomes: ["Maria Oliveira","João Silva","Ana Paula","Pedro Santos"] }] },
  { dia: "QUA", num: 14, aulas: [{ hora: "16:30 - 18:30", ocupados: 11, total: 12, nomes: ["Júlia Costa","Lucas Mendes","Carla Souza","Rafael Lima","Beatriz Almeida","Felipe Martins","Sofia Ramos"] }] },
  { dia: "QUI", num: 15, aulas: [
    { hora: "14:30 - 16:30", ocupados: 12, total: 12, nomes: ["Maria Oliveira","João Silva","Ana Paula","Pedro Santos","Júlia Costa","Lucas Mendes","Carla Souza","Rafael Lima"] },
    { hora: "18:30 - 20:30", ocupados: 9, total: 12, nomes: ["Beatriz Almeida","Felipe Martins","Sofia Ramos","Diego Alves","Nina Prado"] },
  ] },
  { dia: "SEX", num: 16, aulas: [] },
  { dia: "SÁB", num: 17, aulas: [
    { hora: "10:00 - 13:00", oficina: "Oficina Modelagem", inscritos: 8 },
    { hora: "14:00 - 17:00", oficina: "Oficina Esmaltação", inscritos: 6 },
  ] },
  { dia: "DOM", num: 18, aulas: [] },
];
const PIX_CHAVE = "ateliedeceramica@pix.com.br";

function pagamentosIniciais() {
  return [
    { id: "p1", nome: "Maria Oliveira", telefone: "5514991234567", tipo: "Pacote 4 aulas", valor: 320, data: "10/05", status: "pendente", motivo: "Pacote finalizado" },
    { id: "p2", nome: "João Silva", telefone: "5514992345678", tipo: "Pacote 4 aulas", valor: 320, data: "05/05", status: "pendente", motivo: "Pacote finalizado" },
    { id: "p3", nome: "Ana Paula", telefone: "5514993456789", tipo: "Pacote 4 aulas", valor: 320, data: "12/05", status: "pendente", motivo: "Pacote finalizado" },
    { id: "p4", nome: "Rafael Lima", telefone: "5514994567890", tipo: "Aula avulsa", valor: 90, data: "13/05", status: "pendente", motivo: "Aula avulsa não paga" },
    { id: "p5", nome: "Beatriz Almeida", telefone: "5514995678901", tipo: "Pacote 8 aulas", valor: 580, data: "14/05", status: "pendente", motivo: "Pacote novo" },
    { id: "p6", nome: "Pedro Santos", telefone: "5514996789012", tipo: "Pacote 8 aulas", valor: 580, data: "02/05", status: "pago" },
    { id: "p7", nome: "Júlia Costa", telefone: "5514997890123", tipo: "Pacote 4 aulas", valor: 320, data: "01/05", status: "pago" },
    { id: "p8", nome: "Lucas Mendes", telefone: "5514998901234", tipo: "Aula avulsa", valor: 90, data: "28/04", status: "pago" },
    { id: "p9", nome: "Carla Souza", telefone: "5514999012345", tipo: "Pacote 4 aulas", valor: 320, data: "20/04", status: "pago" },
  ];
}

const OFICINAS_RESUMO = [
  { nome: "Kit Café da Manhã", data: "24 de maio · 09:00–13:00", faltam: "5 dias" },
  { nome: "Esmaltação Criativa", data: "18 de maio · 14:00–17:00", faltam: "6 dias" },
];

const SOLICITACOES_INICIAIS = [
  { id: "sol1", nome: "Beatriz Almeida", tipo: "Quer participar da turma", quando: "12/05 às 10:23" },
  { id: "sol2", nome: "Felipe Martins", tipo: "Quer participar da turma", quando: "12/05 às 09:15" },
  { id: "sol3", nome: "Lucas Mendes", tipo: "Solicitou reposição · Quinta 18:30", quando: "11/05 às 20:02" },
];

/* Aluno "logado" no demo — não há autenticação real, é um recorte fixo dos
   dados fictícios para simular a Área do Aluno. Ver CLAUDE.md §2A. */
const ALUNO_LOGADO = { nome: "Maria Oliveira", diaId: "ter", turmaId: "ter-1830" };

/* Categorias de conteúdo do forno — seleção múltipla, sem "misturado" */
const CATEGORIAS = [
  { id: "alunos", label: "Peças de alunos", icon: School },
  { id: "oficinas", label: "Peças de oficinas", icon: GradIcon },
  { id: "encomendas", label: "Encomendas", icon: Package },
  { id: "fora", label: "Queimas por fora", icon: Truck },
];

/* Presets por tipo de queima — preenchem a Configuração automaticamente */
const PRESETS = {
  esmalte: { temperaturaInicial: 25, temperaturaMaxima: 1240, velocidadeAquecimento: 3, tempoPatamarMin: 15, velocidadeResfriamento: 2.5, temperaturaSegura: 80 },
  biscoito: { temperaturaInicial: 25, temperaturaMaxima: 980, velocidadeAquecimento: 4, tempoPatamarMin: 20, velocidadeResfriamento: 3, temperaturaSegura: 80 },
  outro: { temperaturaInicial: 25, temperaturaMaxima: 1000, velocidadeAquecimento: 3, tempoPatamarMin: 10, velocidadeResfriamento: 2.5, temperaturaSegura: 80 },
};
const TIPO_LABEL = { esmalte: "Esmalte", biscoito: "Biscoito", outro: "Outros" };

const ETAPAS = ["aquecendo", "maxima", "patamar", "resfriando", "aguardando", "liberado", "finalizada"];
const ETAPA_LABEL = {
  aquecendo: "Aquecendo", maxima: "Máx. atingida", patamar: "Patamar", resfriando: "Resfriando",
  aguardando: "Aguardando segura", liberado: "Liberado p/ abrir", finalizada: "Finalizada",
};
const STATUS_LABEL = { andamento: "Em andamento", finalizada: "Finalizada", interrompida: "Interrompida", cancelada: "Cancelada" };
const STATUS_TONE = { andamento: "warning", finalizada: "success", interrompida: "info", cancelada: "neutral" };

/* Histórico inicial (fictício) — a 1ª é a fornada ativa */
function fornadasIniciais() {
  const agora = Date.now();
  return [
    {
      id: "f1", tipo: "esmalte", tipoDescricao: "", categorias: ["alunos", "encomendas"],
      detalhesConteudo: "Peças da turma de terça, duas encomendas e uma queima externa (cliente João).",
      config: PRESETS.esmalte,
      iniciadoEm: new Date(agora - 6.7 * 3600 * 1000), finalizadoEm: null, status: "andamento",
      leituras: [{ temp: 920, em: new Date(agora - 15 * 60 * 1000) }],
      observacoes: [
        { em: new Date(agora - 6.7 * 3600 * 1000), texto: "Início da queima às 08:08." },
        { em: new Date(agora - 1.2 * 3600 * 1000), texto: "Atingiu 600°C. Queima está estável." },
      ],
    },
    {
      id: "f2", tipo: "biscoito", tipoDescricao: "", categorias: ["oficinas"],
      detalhesConteudo: "", config: PRESETS.biscoito,
      iniciadoEm: new Date(agora - 3 * 24 * 3600 * 1000), finalizadoEm: new Date(agora - 3 * 24 * 3600 * 1000 + 9 * 3600 * 1000),
      status: "finalizada", leituras: [], observacoes: [],
    },
    {
      id: "f3", tipo: "outro", tipoDescricao: "Lustre", categorias: ["fora"],
      detalhesConteudo: "", config: { ...PRESETS.outro, temperaturaMaxima: 1220 },
      iniciadoEm: new Date(agora - 10 * 24 * 3600 * 1000), finalizadoEm: new Date(agora - 10 * 24 * 3600 * 1000 + 5 * 3600 * 1000),
      status: "interrompida", leituras: [], observacoes: [],
    },
    {
      id: "f4", tipo: "esmalte", tipoDescricao: "", categorias: ["alunos"],
      detalhesConteudo: "", config: PRESETS.esmalte,
      iniciadoEm: new Date(agora - 15 * 24 * 3600 * 1000), finalizadoEm: new Date(agora - 15 * 24 * 3600 * 1000 + 1 * 3600 * 1000),
      status: "cancelada", leituras: [], observacoes: [],
    },
  ];
}

/* ------------------------------------------------------------------ */
/*  Motor de previsão do forno                                         */
/* ------------------------------------------------------------------ */

function calcularPrevisao(cfg, iniciadoEm, agora, ultimaLeitura) {
  const origem = ultimaLeitura ? { t: ultimaLeitura.temp, em: ultimaLeitura.em } : { t: cfg.temperaturaInicial, em: iniciadoEm };
  const deltaMax = Math.max(cfg.temperaturaMaxima - origem.t, 0);
  const minAteMax = cfg.velocidadeAquecimento > 0 ? deltaMax / cfg.velocidadeAquecimento : 0;
  const horaMax = origem.t >= cfg.temperaturaMaxima ? origem.em : new Date(origem.em.getTime() + minAteMax * 60000);
  const horaFimPatamar = new Date(horaMax.getTime() + cfg.tempoPatamarMin * 60000);
  const deltaResf = Math.max(cfg.temperaturaMaxima - cfg.temperaturaSegura, 0);
  const minResf = cfg.velocidadeResfriamento > 0 ? deltaResf / cfg.velocidadeResfriamento : 0;
  const horaSegura = new Date(horaFimPatamar.getTime() + minResf * 60000);

  let etapa, temp;
  if (agora < horaMax) {
    etapa = "aquecendo";
    const minDec = (agora - origem.em) / 60000;
    temp = Math.min(origem.t + minDec * cfg.velocidadeAquecimento, cfg.temperaturaMaxima);
  } else if (agora < horaFimPatamar) {
    etapa = cfg.tempoPatamarMin > 0 ? "patamar" : "maxima";
    temp = cfg.temperaturaMaxima;
  } else if (agora < horaSegura) {
    etapa = "resfriando";
    const minResfriando = (agora - horaFimPatamar) / 60000;
    temp = Math.max(cfg.temperaturaMaxima - minResfriando * cfg.velocidadeResfriamento, cfg.temperaturaSegura);
  } else {
    etapa = "aguardando";
    temp = cfg.temperaturaSegura;
  }

  const grausRestantes = Math.max(cfg.temperaturaMaxima - temp, 0);
  const pct = Math.min(100, Math.max(0, ((temp - cfg.temperaturaInicial) / (cfg.temperaturaMaxima - cfg.temperaturaInicial)) * 100));
  const decorridoSeg = Math.max((agora - iniciadoEm) / 1000, 0);
  const marco = etapa === "aquecendo" ? horaMax : etapa === "maxima" || etapa === "patamar" ? horaFimPatamar : etapa === "resfriando" ? horaSegura : agora;
  const restanteSeg = Math.max((marco - agora) / 1000, 0);
  const restantePatamarSeg = Math.max((horaFimPatamar - agora) / 1000, 0);

  return { etapa, temperatura: Math.round(temp), pct: Math.round(pct), grausRestantes: Math.round(grausRestantes), horaMax, horaFimPatamar, horaSegura, decorridoSeg, restanteSeg, restantePatamarSeg };
}

function fmtDuracao(seg) {
  const h = Math.floor(seg / 3600), m = Math.floor((seg % 3600) / 60), s = Math.floor(seg % 60);
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}
function fmtDuracaoCurta(seg) {
  const h = Math.floor(seg / 3600), m = Math.floor((seg % 3600) / 60);
  return h > 0 ? `${h}h ${String(m).padStart(2, "0")}min` : `${m}min`;
}
function fmtHora(d) { return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }); }
function fmtDiaHora(d) { return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) + " às " + fmtHora(d); }
function fmtRelativo(d, agora) {
  const min = Math.round((agora - d) / 60000);
  if (min < 1) return "agora mesmo";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  return `há ${h}h`;
}

/* ------------------------------------------------------------------ */
/*  UI base                                                             */
/* ------------------------------------------------------------------ */

const FONT_DISPLAY = { fontFamily: "var(--font-display)" };

function Card({ className = "", children }) {
  return <div className={"min-w-0 rounded-2xl border border-[var(--line)] bg-white shadow-sm " + className}>{children}</div>;
}
function Badge({ tone = "neutral", children }) {
  const tones = {
    success: "bg-emerald-50 text-emerald-700", warning: "bg-amber-100 text-amber-700",
    danger: "bg-rose-100 text-rose-600",
    info: "border border-[var(--ink)] text-[var(--ink)]",
    neutral: "bg-[var(--cream-soft)] text-[var(--ink-soft)]",
  };
  return <span className={"inline-flex max-w-full items-center whitespace-normal break-words rounded-full px-2.5 py-1 text-xs font-medium " + tones[tone]}>{children}</span>;
}
function Avatar({ nome, size = 40, stacked }) {
  const iniciais = nome ? nome.split(" ").slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") : "?";
  return (
    <div
      style={{ width: size, height: size, fontSize: Math.max(9, size * 0.36) }}
      className={"flex items-center justify-center overflow-hidden rounded-full bg-[var(--ink)] text-[var(--cream)] font-medium shrink-0 leading-none " + (stacked ? "ring-2 ring-white" : "")}
    >
      {iniciais}
    </div>
  );
}
function Toggle({ checked, onChange, title }) {
  return (
    <button
      onClick={onChange}
      title={title}
      aria-label={title}
      aria-pressed={checked}
      className={"relative h-6 w-11 shrink-0 rounded-full transition-colors " + (checked ? "bg-emerald-500" : "bg-[var(--line)]")}
    >
      <span className={"absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform " + (checked ? "translate-x-5" : "translate-x-0")} />
    </button>
  );
}
function VaseMark() {
  return (
    <svg width="24" height="24" viewBox="0 0 26 26" fill="none" className="text-[var(--ink)] shrink-0">
      <path d="M10 3h6l1 3-1.5 1.5c1.7 1.6 2.8 3.4 2.8 6 0 5-3 8.5-5.3 8.5S8 18.5 8 13.5c0-2.6 1.1-4.4 2.8-6L9.3 6 10 3Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M9.3 6h7.4" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-3xl border border-[var(--line)] bg-white p-5 shadow-xl animate-in">{children}</div>
    </div>
  );
}

const NAV = [
  { id: "dashboard", label: "Início", icon: Home },
  { id: "turmas", label: "Turmas", icon: Users },
  { id: "alunos", label: "Alunos", icon: GraduationCap },
  { id: "oficinas", label: "Oficinas", icon: MessageSquare },
  { id: "forno", label: "Forno", icon: Flame },
  { id: "solicitacoes", label: "Solicitações", icon: Bell, badge: 3 },
  { id: "pagamentos", label: "Pagamentos", icon: CreditCard },
  { id: "relatorios", label: "Relatórios", icon: BarChart3 },
  { id: "config", label: "Configurações", icon: Settings },
];
const TABS_MOBILE = ["dashboard", "turmas", "forno", "solicitacoes"];

/* ------------------------------------------------------------------ */
/*  App principal                                                      */
/* ------------------------------------------------------------------ */

export default function AtelieDemo() {
  const [tela, setTela] = useState("dashboard");
  const [menuAberto, setMenuAberto] = useState(false);
  const [toast, setToast] = useState(null);
  const [fornadas, setFornadas] = useState(fornadasIniciais);
  const [rascunho, setRascunho] = useState(null); // config pré-preenchida ao "Duplicar"
  const [modalConflito, setModalConflito] = useState(false);
  const [oficinas, setOficinas] = useState(oficinasIniciais);
  const [oficinaAbertaId, setOficinaAbertaId] = useState(null);

  function notificar(msg) { setToast(msg); setTimeout(() => setToast(null), 2200); }

  const ativa = fornadas.find((f) => f.status === "andamento") || null;

  function abrirNovaFornada(base) {
    setRascunho(base || null);
    setTela("fornoNova");
    window.scrollTo(0, 0);
  }

  function cliqueNovaFornada() {
    if (ativa) setModalConflito(true);
    else abrirNovaFornada(null);
  }

  function confirmarSalvarEIniciarNova() {
    setFornadas((fs) => fs.map((f) => f.id === ativa.id ? { ...f, status: "interrompida", finalizadoEm: new Date() } : f));
    setModalConflito(false);
    notificar("Fornada atual salva no histórico como Interrompida.");
    abrirNovaFornada(null);
  }

  function iniciarFornada(config) {
    const nova = {
      id: "f" + Date.now(), tipo: config.tipo, tipoDescricao: config.tipoDescricao,
      categorias: config.categorias, detalhesConteudo: config.detalhesConteudo,
      config: config.parametros, iniciadoEm: new Date(), finalizadoEm: null, status: "andamento",
      leituras: [], observacoes: [{ em: new Date(), texto: "Início da queima." }],
    };
    setFornadas((fs) => [nova, ...fs]);
    setTela("forno");
    window.scrollTo(0, 0);
    notificar("Fornada iniciada! Acompanhamento em tempo real ativo.");
  }

  function atualizarTemperatura(valor) {
    setFornadas((fs) => fs.map((f) => f.id === ativa.id ? { ...f, leituras: [...f.leituras, { temp: valor, em: new Date() }] } : f));
    notificar("Temperatura real atualizada — gráfico e previsão recalculados.");
  }
  function adicionarObservacao(texto) {
    setFornadas((fs) => fs.map((f) => f.id === ativa.id ? { ...f, observacoes: [...f.observacoes, { em: new Date(), texto }] } : f));
    notificar("Observação adicionada.");
  }
  function finalizarFornada() {
    setFornadas((fs) => fs.map((f) => f.id === ativa.id ? { ...f, status: "finalizada", finalizadoEm: new Date() } : f));
    notificar("Fornada finalizada e salva no histórico.");
  }

  function ir(t) { setTela(t); setMenuAberto(false); window.scrollTo(0, 0); }
  const [diaTurmaAlvo, setDiaTurmaAlvo] = useState("ter");
  function abrirDiaTurmas(diaId) { setDiaTurmaAlvo(diaId); ir("turmas"); }

  return (
    <div className="flex min-h-screen w-full bg-[var(--cream)] text-[var(--ink)]" style={{ fontFamily: "var(--font-sans)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600&family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');
        :root {
          --cream: #F2F2EB; --cream-soft: #E7E4DA; --line: #DEDAD1;
          --ink: #3B3833; --ink-soft: #6B655C;
          --accent: #C2410C; --accent-hover: #9A3412; --accent-soft: #F3E1D6;
          --turma-sienna-rgb: 139 74 43; --turma-ardosia-rgb: 74 97 120;
          --turma-musgo-rgb: 95 107 58; --turma-cafe-rgb: 74 52 42;
          --font-sans: -apple-system, BlinkMacSystemFont, 'Inter', 'SF Pro Text', ui-sans-serif, system-ui, sans-serif;
          --font-mono: 'IBM Plex Mono', ui-monospace, monospace;
          --font-display: 'Space Grotesk', var(--font-sans);
        }
        @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .animate-in{animation:fadeUp .2s ease-out both}
        /* Apple-ish default: soft rounding on every button/field unless a
           utility class (e.g. rounded-full on Toggle/Avatar) wins on specificity. */
        button, input, textarea, select { border-radius: 0.75rem; }
      `}</style>

      <ManchasFundo />

      <aside className="relative hidden md:flex md:w-32 md:shrink-0 md:flex-col md:border-r md:border-[var(--line)] md:bg-[var(--cream)] md:px-1.5 md:py-5">
        <div className="mb-6 flex justify-center px-1"><VaseMark /></div>
        <nav className="flex-1 space-y-0.5">
          {NAV.map((item) => (
            <button key={item.id} onClick={() => ir(item.id)} title={item.label} className={"relative flex w-full flex-col items-center gap-0.5 rounded-2xl px-1 py-2 text-[10px] font-medium leading-tight transition-colors " + ((tela === item.id || (item.id === "forno" && tela === "fornoNova") || (item.id === "oficinas" && tela === "oficinaDetalhe")) ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--ink-soft)] hover:bg-white/60")}>
              <item.icon size={16} />
              <span className="truncate w-full text-center">{item.label}</span>
              {!!item.badge && <span className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center bg-[var(--accent)] text-[9px] font-semibold text-white">{item.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="mt-3 flex justify-center"><Avatar nome="Hanna" size={28} /></div>
      </aside>

      {menuAberto && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMenuAberto(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-white p-4 shadow-xl">
            <div className="mb-6 flex items-center justify-between"><VaseMark /><button onClick={() => setMenuAberto(false)}><X size={20} /></button></div>
            <nav className="space-y-1">
              {NAV.map((item) => (
                <button key={item.id} onClick={() => ir(item.id)} className={"flex w-full items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm font-medium " + (tela === item.id ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--ink-soft)]")}>
                  <item.icon size={17} />{item.label}
                  {!!item.badge && <span className="ml-auto bg-[var(--accent)] px-1.5 py-0.5 text-[11px] font-semibold text-white">{item.badge}</span>}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      <div className="min-w-0 flex-1 pb-20 md:pb-0">
        <header className="flex items-center justify-between border-b border-[var(--line)] bg-white px-4 py-3 md:hidden">
          <button onClick={() => setMenuAberto(true)} aria-label="Abrir menu"><Menu size={22} /></button>
          <VaseMark />
          <Bell size={20} className="text-[var(--ink-soft)]" />
        </header>

        <main className="w-full pl-4 pr-0 py-5 md:pl-6 md:pr-0 md:py-8">
          {tela === "dashboard" && <Dashboard ir={ir} ativa={ativa} onAbrirDia={abrirDiaTurmas} onAbrirOficinas={() => ir("oficinas")} />}
          {tela === "turmas" && <Turmas notificar={notificar} diaInicial={diaTurmaAlvo} />}
          {tela === "alunos" && <Alunos />}
          {tela === "oficinas" && <Oficinas oficinas={oficinas} onAbrir={(id) => { setOficinaAbertaId(id); ir("oficinaDetalhe"); }} />}
          {tela === "oficinaDetalhe" && (
            <OficinaDetalhe
              oficina={oficinas.find((o) => o.id === oficinaAbertaId)}
              notificar={notificar}
              onVoltar={() => ir("oficinas")}
              onCadastrarParticipante={(numero, dados) => {
                setOficinas((os) => os.map((o) => o.id !== oficinaAbertaId ? o : {
                  ...o, participantes: o.participantes.map((p) => p.numero === numero ? { numero, ...dados } : p),
                }));
                notificar("Participante cadastrado.");
              }}
              onAtualizarStatusPecas={(novoStatus) => {
                setOficinas((os) => os.map((o) => o.id !== oficinaAbertaId ? o : { ...o, statusPecas: novoStatus }));
                notificar("Status das peças atualizado.");
              }}
            />
          )}
          {tela === "forno" && (
            <PainelForno
              ativa={ativa} fornadas={fornadas} notificar={notificar}
              onNovaFornada={cliqueNovaFornada}
              onDuplicar={(f) => abrirNovaFornada(f)}
              onAtualizarTemp={atualizarTemperatura}
              onAdicionarObs={adicionarObservacao}
              onFinalizar={finalizarFornada}
            />
          )}
          {tela === "fornoNova" && (
            <NovaFornada rascunho={rascunho} onVoltar={() => ir("forno")} onIniciar={iniciarFornada} />
          )}
          {tela === "solicitacoes" && <Solicitacoes notificar={notificar} />}
          {tela === "pagamentos" && <Pagamentos />}
          {(tela === "relatorios" || tela === "config") && <EmBreve tela={tela} />}
        </main>
      </div>

      <nav className="fixed inset-x-3 bottom-3 z-30 flex items-center justify-around gap-1 rounded-full border border-white/70 bg-gradient-to-b from-white/70 to-white/35 px-2 py-2 shadow-[inset_0_1.5px_0_rgba(255,255,255,0.8),0_10px_24px_-6px_rgba(59,56,51,0.22)] backdrop-blur-2xl backdrop-saturate-150 md:hidden">
        {TABS_MOBILE.map((id) => {
          const item = NAV.find((n) => n.id === id);
          const ativoTab = tela === id || (id === "forno" && tela === "fornoNova");
          return (
            <button key={id} onClick={() => ir(id)} className={"flex flex-col items-center gap-0.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors " + (ativoTab ? "bg-[var(--accent)] text-white" : "text-[var(--ink-soft)]")}>
              <item.icon size={20} strokeWidth={ativoTab ? 2.4 : 1.8} />{item.label}
            </button>
          );
        })}
        <button onClick={() => setMenuAberto(true)} className="flex flex-col items-center gap-0.5 rounded-full px-3 py-1.5 text-[11px] font-medium text-[var(--ink-soft)]"><Menu size={20} />Mais</button>
      </nav>

      {toast && <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 bg-[var(--ink)] px-4 py-2.5 text-sm text-[var(--cream)] shadow-lg md:bottom-6">{toast}</div>}

      {modalConflito && (
        <Modal onClose={() => setModalConflito(false)}>
          <h3 className="mb-2 text-base font-semibold">Já existe uma fornada em andamento</h3>
          <p className="mb-5 text-sm leading-relaxed text-[var(--ink-soft)]">
            Você já possui uma fornada sendo acompanhada. Ao iniciar uma nova fornada, a atual será encerrada automaticamente e salva no histórico. Nenhuma informação será perdida. Deseja continuar?
          </p>
          <div className="flex gap-2">
            <button onClick={() => setModalConflito(false)} className="flex-1 border border-[var(--line)] py-2.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--cream)]">Cancelar</button>
            <button onClick={confirmarSalvarEIniciarNova} className="flex-1 bg-[var(--accent)] py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-hover)]">Salvar e criar nova</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dashboard                                                          */
/* ------------------------------------------------------------------ */

function Dashboard({ ir, ativa, onAbrirDia, onAbrirOficinas }) {
  const kpis = [
    { icon: CalendarDays, valor: 4, label: "Aulas hoje", tone: "text-[var(--ink)] bg-[var(--cream-soft)]", tela: "turmas" },
    { icon: Users, valor: 28, label: "Alunos confirmados", tone: "text-emerald-700 bg-emerald-50", tela: "alunos" },
    { icon: RotateCcw, valor: 2, label: "Reposições pendentes", tone: "text-amber-600 bg-amber-100", tela: "solicitacoes" },
    { icon: CreditCard, valor: 5, label: "Pagamentos pendentes", tone: "text-rose-600 bg-rose-100", tela: "pagamentos" },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--ink)]" style={FONT_DISPLAY}>Painel geral</h1>
        <p className="text-sm text-[var(--ink-soft)]">{new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })} · dados de demonstração</p>
      </div>
      <div className="grid min-w-0 gap-3 lg:grid-cols-[300px_1fr]">
        <div className="[&>*]:min-w-0 grid min-w-0 grid-cols-2 gap-2">
          {kpis.map((k) => (
            <button key={k.label} onClick={() => ir(k.tela)} className="min-w-0 text-left">
              <Card className="flex items-center gap-2 p-2.5 hover:border-[var(--ink-soft)]">
                <div className={"flex h-8 w-8 shrink-0 items-center justify-center " + k.tone}><k.icon size={14} /></div>
                <div className="min-w-0">
                  <div className="text-base font-semibold leading-tight text-[var(--ink)]">{k.valor}</div>
                  <div className="truncate text-[11px] leading-tight text-[var(--ink-soft)]">{k.label}</div>
                </div>
              </Card>
            </button>
          ))}
        </div>

        {ativa ? <KilnMiniCard fornada={ativa} onDetalhes={() => ir("forno")} /> : (
          <Card className="flex items-center justify-center p-5 text-center text-sm text-[var(--ink-soft)]">Nenhuma fornada ativa no momento.</Card>
        )}
      </div>

      <AgendaSemanaCard onAbrirDia={onAbrirDia} onAbrirOficinas={onAbrirOficinas} />

      <div className="[&>*]:min-w-0 grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <h3 className="mb-3 text-sm font-semibold">Próximas oficinas</h3>
          <ul className="space-y-3 text-sm">{OFICINAS_RESUMO.map((o) => (
            <li key={o.nome} className="flex items-center justify-between"><span><span className="block font-medium">{o.nome}</span><span className="text-[var(--ink-soft)]">{o.data}</span></span><Badge tone="warning">Faltam {o.faltam}</Badge></li>
          ))}</ul>
        </Card>
        <Card className="p-4">
          <h3 className="mb-3 text-sm font-semibold">Pacotes terminando</h3>
          <ul className="space-y-3 text-sm">{VAGAS_INICIAIS.filter((v) => v.status === "ultima" || v.status === "pendente").map((v) => (
            <li key={v.numero} className="flex items-center justify-between"><span><span className="block font-medium">{v.nome}</span><span className="text-[var(--ink-soft)]">{v.aula}/{v.total} aulas</span></span><Badge tone={v.status === "ultima" ? "danger" : "warning"}>{v.aula}/{v.total}</Badge></li>
          ))}</ul>
        </Card>
        <Card className="p-4">
          <h3 className="mb-3 text-sm font-semibold">Solicitações pendentes</h3>
          <ul className="space-y-3 text-sm">{SOLICITACOES_INICIAIS.map((s) => (
            <li key={s.nome} className="flex items-center justify-between"><span><span className="block font-medium">{s.nome}</span><span className="text-[var(--ink-soft)]">{s.tipo}</span></span></li>
          ))}</ul>
        </Card>
      </div>
    </div>
  );
}

const DIA_ID_MAP = { SEG: "seg", TER: "ter", QUA: "qua", QUI: "qui", SEX: "sex", "SÁB": "sab", DOM: "dom" };

function AgendaSemanaCard({ onAbrirDia, onAbrirOficinas }) {
  const hoje = "TER";
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold">Turmas da semana</h3>
        <button className="border border-[var(--line)] px-3 py-1.5 text-xs font-medium text-[var(--ink)] hover:bg-[var(--cream)]">Ver calendário completo</button>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-7 md:overflow-visible md:pb-0">
        {AGENDA_SEMANA.map((d) => {
          const vazio = d.aulas.length === 0;
          const isHoje = d.dia === hoje;
          const temOficina = d.aulas.some((a) => a.oficina);
          const clicavel = !vazio;
          function clicarDia() {
            if (!clicavel) return;
            if (temOficina) onAbrirOficinas();
            else onAbrirDia(DIA_ID_MAP[d.dia]);
          }
          return (
            <div
              key={d.dia}
              onClick={clicarDia}
              className={
                "w-[150px] shrink-0 md:w-auto md:min-w-0 border p-3 transition-colors " +
                (isHoje ? "border-[var(--ink-soft)] bg-[var(--cream-soft)]/50" : "border-[var(--line)] bg-[var(--cream)]/70") +
                (clicavel ? " cursor-pointer hover:border-[var(--ink-soft)] hover:bg-[var(--cream-soft)]/40" : "")
              }
            >
              <div className="mb-3 flex items-center justify-between">
                <span className={"inline-flex items-center gap-1.5 px-2 py-1 text-xs font-bold tracking-wide " + (isHoje ? "bg-[var(--accent)] text-white" : "bg-white text-[var(--ink-soft)] border border-[var(--line)]")}>
                  {d.dia} <span className={isHoje ? "font-normal text-[var(--cream)]" : "font-normal text-[var(--line)]"}>{d.num}</span>
                </span>
              </div>
              <div className="space-y-2.5">
                {vazio && (
                  <div className="flex h-20 items-center justify-center border border-dashed border-[var(--ink-soft)] text-center text-[11px] text-[var(--ink-soft)]">Sem aulas</div>
                )}
                {d.aulas.map((a, i) => a.oficina ? (
                  <div key={i} className="border border-[var(--line)] bg-white p-3">
                    <div className="text-xs font-bold text-[var(--ink)]">{a.hora}</div>
                    <div className="mt-0.5 text-sm font-semibold text-[var(--ink)]">{a.oficina}</div>
                    <div className="mt-0.5 text-xs text-[var(--ink-soft)]">{a.inscritos} inscritos</div>
                  </div>
                ) : (
                  <div key={i} className="border border-[var(--line)] bg-white p-3">
                    <div className="text-xs font-bold text-[var(--ink)]">{a.hora}</div>
                    <div className="mt-0.5 text-xs text-[var(--ink-soft)]">{a.ocupados}/{a.total} alunos</div>
                    <div className="mt-2 flex items-center -space-x-2">
                      {a.nomes.slice(0, 4).map((n) => <Avatar key={n} nome={n} size={26} stacked />)}
                      {a.nomes.length > 4 && <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[var(--cream-soft)] text-[10px] font-semibold text-[var(--ink)] ring-2 ring-white">+{a.nomes.length - 4}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function KilnMiniCard({ fornada, onDetalhes }) {
  const [agora, setAgora] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setAgora(new Date()), 1000); return () => clearInterval(id); }, []);
  const ultima = fornada.leituras[fornada.leituras.length - 1] || null;
  const p = calcularPrevisao(fornada.config, fornada.iniciadoEm, agora, ultima);

  const mini = useMemo(() => {
    const pontos = [];
    const inicio = fornada.iniciadoEm.getTime();
    const fim = inicio + 20 * 3600 * 1000;
    for (let i = 0; i <= 16; i++) {
      const t = new Date(inicio + (i / 16) * (fim - inicio));
      const pp = calcularPrevisao(fornada.config, fornada.iniciadoEm, t, null);
      const leituraProxima = fornada.leituras.filter((l) => l.em <= t).slice(-1)[0];
      pontos.push({ prevista: pp.temperatura, real: t <= agora ? (leituraProxima ? leituraProxima.temp : pp.temperatura) : null });
    }
    return pontos;
  }, [fornada, agora]);

  return (
    <Card className="overflow-hidden border-[var(--line)] bg-gradient-to-br from-[var(--cream-soft)] to-white">
      <div className="flex items-center justify-between px-5 pt-4">
        <span className="flex items-center gap-2 text-sm font-semibold text-[var(--ink)]"><Flame size={16} />Forno em andamento</span>
        <button onClick={onDetalhes} className="bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--accent-hover)]">Ver forno</button>
      </div>
      <div className="grid gap-3 px-5 pb-5 pt-3 sm:grid-cols-[1fr_180px]">
        <div>
          <p className="mb-2 text-base font-medium">Queima de {TIPO_LABEL[fornada.tipo]}</p>
          <div className="[&>*]:min-w-0 grid grid-cols-2 gap-3">
            <div><div className="text-2xl font-semibold">{p.temperatura}°C</div><div className="text-xs text-[var(--ink-soft)]">Estimada</div></div>
            <div><div className="text-base font-semibold">{ETAPA_LABEL[p.etapa]}</div><div className="text-xs text-[var(--ink-soft)]">Etapa</div></div>
            <div><div className="text-sm font-[family-name:var(--font-mono)]">{fmtDuracaoCurta(p.restanteSeg)}</div><div className="text-xs text-[var(--ink-soft)]">Restante</div></div>
            <div><div className="text-sm font-[family-name:var(--font-mono)]">{fmtDuracaoCurta(p.decorridoSeg)}</div><div className="text-xs text-[var(--ink-soft)]">Decorrido</div></div>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden bg-[var(--cream-soft)]"><div className="h-full bg-[var(--accent)] transition-all duration-700" style={{ width: p.pct + "%" }} /></div>
        </div>
        <div className="h-24 w-full min-w-0 overflow-hidden sm:h-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={mini}>
              <Area type="monotone" dataKey="prevista" stroke="#B8B2A6" fill="#EDEBE3" strokeDasharray="3 2" />
              <Line type="monotone" dataKey="real" stroke="#C2410C" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Painel principal do Forno                                          */
/* ------------------------------------------------------------------ */

function PainelForno({ ativa, fornadas, notificar, onNovaFornada, onDuplicar, onAtualizarTemp, onAdicionarObs, onFinalizar }) {
  const [modalTemp, setModalTemp] = useState(false);
  const [modalObs, setModalObs] = useState(false);
  const [modalFinalizar, setModalFinalizar] = useState(false);
  const [modalDetalheHist, setModalDetalheHist] = useState(null);
  const [inputTemp, setInputTemp] = useState("");
  const [inputObs, setInputObs] = useState("");
  const [agora, setAgora] = useState(new Date());

  useEffect(() => { const id = setInterval(() => setAgora(new Date()), 1000); return () => clearInterval(id); }, []);

  const historico = fornadas;

  return (
    <div>
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold" style={FONT_DISPLAY}>Forno</h1>
          <p className="text-sm text-[var(--ink-soft)]">Acompanhe sua fornada em tempo real.</p>
        </div>
        <button onClick={onNovaFornada} className="flex shrink-0 items-center gap-1.5 bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-hover)]">
          <Plus size={16} strokeWidth={2.5} />Nova fornada
        </button>
      </div>

      {!ativa ? (
        <Card className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center bg-[var(--cream-soft)] text-[var(--ink-soft)]"><Flame size={26} /></div>
          <h2 className="text-lg font-semibold">Nenhuma fornada em andamento</h2>
          <p className="max-w-sm text-sm text-[var(--ink-soft)]">Inicie uma nova fornada para começar o acompanhamento em tempo real da temperatura, etapas e previsões.</p>
          <button onClick={onNovaFornada} className="mt-2 bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-hover)]">+ Nova fornada</button>
        </Card>
      ) : (
        <FornadaAtivaPainel
          fornada={ativa} agora={agora}
          onAtualizarTemp={() => setModalTemp(true)}
          onAdicionarObs={() => setModalObs(true)}
          onFinalizar={() => setModalFinalizar(true)}
        />
      )}

      <div className="[&>*]:min-w-0 mt-5 grid gap-5 lg:grid-cols-[1fr_320px]">
        <div />
        <Card className="p-4 lg:col-start-2">
          <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold">Histórico de fornadas</h3></div>
          <ul className="space-y-3">
            {historico.map((f) => (
              <li key={f.id} className="border border-[var(--line)] p-3 hover:border-[var(--line)]">
                <button onClick={() => setModalDetalheHist(f)} className="w-full text-left">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs text-[var(--ink-soft)]">{fmtDiaHora(f.iniciadoEm)}</span>
                    <Badge tone={STATUS_TONE[f.status]}>{STATUS_LABEL[f.status]}</Badge>
                  </div>
                  <div className="text-sm font-medium">{TIPO_LABEL[f.tipo]}{f.tipoDescricao ? ` (${f.tipoDescricao})` : ""}</div>
                  <div className="text-xs text-[var(--ink-soft)]">{f.categorias.map((c) => CATEGORIAS.find((x) => x.id === c)?.label).join(", ") || "—"}</div>
                  <div className="mt-1 text-xs text-[var(--ink-soft)]">Temp. máx: {f.config.temperaturaMaxima}°C</div>
                </button>
                <button onClick={() => onDuplicar(f)} className="mt-2 text-xs font-medium text-[var(--ink)] hover:underline">Duplicar configuração</button>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {modalTemp && (
        <Modal onClose={() => setModalTemp(false)}>
          <h3 className="mb-3 text-base font-semibold">Atualizar temperatura</h3>
          <form onSubmit={(e) => { e.preventDefault(); const v = parseFloat(inputTemp); if (!isNaN(v)) { onAtualizarTemp(v); setModalTemp(false); setInputTemp(""); } }}>
            <label className="mb-1 block text-xs font-medium text-[var(--ink-soft)]">Temperatura real (°C)</label>
            <input autoFocus value={inputTemp} onChange={(e) => setInputTemp(e.target.value)} type="number" className="mb-4 w-full border border-[var(--line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--ink)]" placeholder="Ex: 920" />
            <div className="flex gap-2">
              <button type="button" onClick={() => setModalTemp(false)} className="flex-1 border border-[var(--line)] py-2.5 text-sm font-medium text-[var(--ink)]">Cancelar</button>
              <button type="submit" className="flex-1 bg-[var(--accent)] py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-hover)]">Atualizar</button>
            </div>
          </form>
        </Modal>
      )}

      {modalObs && (
        <Modal onClose={() => setModalObs(false)}>
          <h3 className="mb-3 text-base font-semibold">Adicionar observação</h3>
          <form onSubmit={(e) => { e.preventDefault(); if (inputObs.trim()) { onAdicionarObs(inputObs.trim()); setModalObs(false); setInputObs(""); } }}>
            <textarea autoFocus value={inputObs} onChange={(e) => setInputObs(e.target.value)} rows={3} className="mb-4 w-full border border-[var(--line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--ink)]" placeholder="Ex: Patamar iniciado." />
            <div className="flex gap-2">
              <button type="button" onClick={() => setModalObs(false)} className="flex-1 border border-[var(--line)] py-2.5 text-sm font-medium text-[var(--ink)]">Cancelar</button>
              <button type="submit" className="flex-1 bg-[var(--accent)] py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-hover)]">Adicionar</button>
            </div>
          </form>
        </Modal>
      )}

      {modalFinalizar && (
        <Modal onClose={() => setModalFinalizar(false)}>
          <h3 className="mb-2 text-base font-semibold">Finalizar fornada?</h3>
          <p className="mb-5 text-sm text-[var(--ink-soft)]">A fornada será marcada como Finalizada e todo o histórico (gráfico, temperaturas, observações e conteúdo) será salvo.</p>
          <div className="flex gap-2">
            <button onClick={() => setModalFinalizar(false)} className="flex-1 border border-[var(--line)] py-2.5 text-sm font-medium text-[var(--ink)]">Cancelar</button>
            <button onClick={() => { onFinalizar(); setModalFinalizar(false); }} className="flex-1 bg-rose-600 py-2.5 text-sm font-medium text-white hover:bg-rose-700">Finalizar</button>
          </div>
        </Modal>
      )}

      {modalDetalheHist && (
        <Modal onClose={() => setModalDetalheHist(null)}>
          <div className="mb-1 flex items-center justify-between">
            <h3 className="text-base font-semibold">{TIPO_LABEL[modalDetalheHist.tipo]}{modalDetalheHist.tipoDescricao ? ` (${modalDetalheHist.tipoDescricao})` : ""}</h3>
            <Badge tone={STATUS_TONE[modalDetalheHist.status]}>{STATUS_LABEL[modalDetalheHist.status]}</Badge>
          </div>
          <p className="mb-3 text-xs text-[var(--ink-soft)]">Iniciada em {fmtDiaHora(modalDetalheHist.iniciadoEm)}{modalDetalheHist.finalizadoEm ? ` · encerrada em ${fmtDiaHora(modalDetalheHist.finalizadoEm)}` : ""}</p>
          <dl className="[&>*]:min-w-0 mb-4 grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-[var(--ink-soft)]">Temp. máxima</dt><dd className="text-right font-medium">{modalDetalheHist.config.temperaturaMaxima}°C</dd>
            <dt className="text-[var(--ink-soft)]">Categorias</dt><dd className="text-right font-medium">{modalDetalheHist.categorias.map((c) => CATEGORIAS.find((x) => x.id === c)?.label).join(", ") || "—"}</dd>
          </dl>
          {modalDetalheHist.detalhesConteudo && <p className="mb-4 bg-[var(--cream)] p-3 text-sm text-[var(--ink-soft)]">{modalDetalheHist.detalhesConteudo}</p>}
          <button onClick={() => { onDuplicar(modalDetalheHist); setModalDetalheHist(null); }} className="w-full bg-[var(--accent)] py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-hover)]">Duplicar configuração</button>
        </Modal>
      )}
    </div>
  );
}

function ProgressRing({ pct, size = 176, stroke = 12, color = "var(--accent)", trackColor = "var(--cream-soft)", children }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(Math.max(pct, 0), 100) / 100) * circumference;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} fill="none" style={{ stroke: trackColor }} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ stroke: color }}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

function FornadaAtivaPainel({ fornada, agora, onAtualizarTemp, onAdicionarObs, onFinalizar }) {
  const ultima = fornada.leituras[fornada.leituras.length - 1] || null;
  const p = calcularPrevisao(fornada.config, fornada.iniciadoEm, agora, ultima);

  const grafico = useMemo(() => {
    const pontos = [];
    const inicio = fornada.iniciadoEm.getTime();
    const fimJanela = inicio + 20 * 3600 * 1000;
    for (let i = 0; i <= 24; i++) {
      const t = new Date(inicio + (i / 24) * (fimJanela - inicio));
      const pp = calcularPrevisao(fornada.config, fornada.iniciadoEm, t, null);
      const leituraProxima = fornada.leituras.filter((l) => l.em <= t).slice(-1)[0];
      pontos.push({
        hora: fmtHora(t),
        prevista: pp.temperatura,
        real: t <= agora ? (leituraProxima ? leituraProxima.temp : pp.temperatura) : null,
      });
    }
    return pontos;
  }, [fornada, agora]);

  return (
    <>
      <Card className="p-5">
        <div className="[&>*]:min-w-0 flex flex-col items-center gap-6 sm:flex-row sm:items-center">
          <div className="flex flex-col items-center gap-2">
            <ProgressRing pct={p.pct}>
              <div className="text-4xl font-semibold leading-none text-[var(--ink)]">{p.temperatura}°</div>
              <div className="mt-1.5 text-xs text-[var(--ink-soft)]">de {fornada.config.temperaturaMaxima}°C</div>
            </ProgressRing>
            {ultima && <div className="text-center text-xs text-[var(--ink-soft)]">Última informada: <span className="font-medium text-[var(--ink)]">{ultima.temp}°C</span> · {fmtRelativo(ultima.em, agora)}</div>}
          </div>
          <div className="[&>*]:min-w-0 grid w-full flex-1 grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col items-center gap-1 sm:items-start">
              <span className="flex items-center gap-1 text-xs text-[var(--ink-soft)]"><Flame size={13} />Etapa atual</span>
              <Badge tone="warning">{ETAPA_LABEL[p.etapa]}</Badge>
            </div>
            <div className="flex flex-col items-center gap-0.5 sm:items-start">
              <span className="flex items-center gap-1 text-xs text-[var(--ink-soft)]"><Clock size={13} />Previsão temp. máxima</span>
              <span className="text-sm font-semibold">{fmtDiaHora(p.horaMax)}</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 sm:items-start">
              <span className="flex items-center gap-1 text-xs text-[var(--ink-soft)]"><ShieldCheck size={13} />Previsão abertura segura</span>
              <span className="text-sm font-semibold">{fmtDiaHora(p.horaSegura)}</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="[&>*]:min-w-0 mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard icon={Clock} label="Tempo decorrido" value={fmtDuracao(p.decorridoSeg)} mono />
        <StatCard icon={Thermometer} label="Temp. máxima" value={fornada.config.temperaturaMaxima + "°C"} />
        <StatCard icon={Clock} label="Tempo restante" value={fmtDuracao(p.restanteSeg)} mono />
        <StatCard icon={Snowflake} label="Patamar" value={fmtHora(p.horaFimPatamar)} sub={p.etapa === "aquecendo" || p.etapa === "patamar" || p.etapa === "maxima" ? `restam ${fmtDuracaoCurta(p.restantePatamarSeg)}` : null} />
        <StatCard icon={ShieldCheck} label="Abertura segura" value={fmtDiaHora(p.horaSegura)} />
        <StatCard icon={Flag} label="Etapa atual" value={ETAPA_LABEL[p.etapa]} />
      </div>

      <div className="[&>*]:min-w-0 mt-5 grid gap-5 lg:grid-cols-[1fr_1fr_280px]">
        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold">Conteúdo do forno</h3></div>
          <div className="flex flex-wrap gap-1.5">
            {fornada.categorias.map((c) => {
              const cat = CATEGORIAS.find((x) => x.id === c);
              return <span key={c} className="inline-flex items-center gap-1 bg-[var(--cream-soft)] px-2.5 py-1 text-xs font-medium text-[var(--ink)]"><cat.icon size={13} />{cat.label}</span>;
            })}
          </div>
          {fornada.detalhesConteudo && <p className="mt-3 text-sm text-[var(--ink-soft)]">{fornada.detalhesConteudo}</p>}
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold">Observações</h3></div>
          <ul className="max-h-44 space-y-3 overflow-y-auto pr-1 text-sm">
            {[...fornada.observacoes].reverse().map((o, i) => (
              <li key={i}><span className="mr-2 text-xs text-[var(--ink-soft)] font-[family-name:var(--font-mono)]">{fmtHora(o.em)}</span><span className="text-[var(--ink)]">{o.texto}</span></li>
            ))}
          </ul>
        </Card>

        <div className="flex flex-col gap-2.5">
          <button onClick={onAtualizarTemp} className="flex items-center justify-center gap-2 bg-[var(--accent)] py-3.5 text-sm font-semibold text-white hover:bg-[var(--accent-hover)]"><Thermometer size={17} />Atualizar temperatura</button>
          <button onClick={onAdicionarObs} className="flex items-center justify-center gap-2 border border-[var(--line)] bg-white py-3.5 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--cream)]"><MessageCircle size={17} />Adicionar observação</button>
          <button onClick={onFinalizar} className="flex items-center justify-center gap-2 bg-rose-50 py-3.5 text-sm font-semibold text-rose-600 hover:bg-rose-100">Finalizar fornada</button>
        </div>
      </div>

      <Card className="mt-5 p-5">
        <h3 className="mb-3 text-sm font-semibold">Curva da queima</h3>
        <div className="h-80 w-full min-w-0 overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={grafico}>
              <CartesianGrid strokeDasharray="3 3" stroke="#DEDAD1" />
              <XAxis dataKey="hora" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} unit="°C" width={54} />
              <Tooltip />
              <Legend />
              <ReferenceLine y={fornada.config.temperaturaMaxima} stroke="#8A8479" strokeDasharray="3 3" label={{ value: "Patamar", position: "insideTopLeft", fontSize: 11, fill: "#8A8479" }} />
              <ReferenceLine y={fornada.config.temperaturaSegura} stroke="#60A5FA" strokeDasharray="3 3" label={{ value: "Abertura segura", position: "insideBottomLeft", fontSize: 11, fill: "#60A5FA" }} />
              <Area type="monotone" dataKey="prevista" name="Curva prevista" stroke="#B8B2A6" fill="#EDEBE3" strokeDasharray="4 3" />
              <Line type="monotone" dataKey="real" name="Temperatura real" stroke="#C2410C" strokeWidth={2.5} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </>
  );
}

function StatCard({ icon: Icon, label, value, sub, mono }) {
  return (
    <Card className="min-w-0 p-4">
      <div className="mb-2 flex items-center gap-1.5 text-[var(--ink-soft)]"><Icon size={15} /><span className="truncate text-xs">{label}</span></div>
      <div className={"truncate text-lg font-semibold text-[var(--ink)] " + (mono ? "font-[family-name:var(--font-mono)]" : "")}>{value}</div>
      {sub && <div className="truncate text-xs text-[var(--ink-soft)]">{sub}</div>}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Página dedicada: Nova fornada                                      */
/* ------------------------------------------------------------------ */

function NovaFornada({ rascunho, onVoltar, onIniciar }) {
  const [tipo, setTipo] = useState(rascunho?.tipo || null);
  const [tipoDescricao, setTipoDescricao] = useState(rascunho?.tipoDescricao || "");
  const [categorias, setCategorias] = useState(rascunho?.categorias || []);
  const [detalhes, setDetalhes] = useState(rascunho?.detalhesConteudo || "");
  const [cfg, setCfg] = useState(rascunho?.config || null);

  function selecionarTipo(t) {
    setTipo(t);
    if (!rascunho || rascunho.tipo !== t) setCfg(PRESETS[t]);
  }
  function toggleCategoria(id) {
    setCategorias((cs) => cs.includes(id) ? cs.filter((c) => c !== id) : [...cs, id]);
  }
  function setCampo(campo, valor) {
    setCfg((c) => ({ ...(c || PRESETS.esmalte), [campo]: valor }));
  }

  const config = cfg || PRESETS.esmalte;
  const previsao = useMemo(() => {
    if (!tipo) return null;
    return calcularPrevisao(config, new Date(), new Date(), null);
  }, [tipo, config]);

  const pronto = !!tipo && (tipo !== "outro" || tipoDescricao.trim().length > 0) && categorias.length > 0;

  return (
    <div className="mx-auto max-w-3xl">
      <button onClick={onVoltar} className="mb-4 flex items-center gap-1 text-sm font-medium text-[var(--ink-soft)] hover:text-[var(--ink)]"><ChevronLeft size={16} />Voltar</button>
      <h1 className="mb-1 text-2xl font-semibold" style={FONT_DISPLAY}>Nova fornada</h1>
      <p className="mb-6 text-sm text-[var(--ink-soft)]">Preencha tudo nesta única tela — sem etapas.</p>

      <Card className="p-5">
        <h2 className="mb-3 text-sm font-semibold">Tipo de queima</h2>
        <div className="[&>*]:min-w-0 grid grid-cols-3 gap-3">
          {[["esmalte", "Esmalte"], ["biscoito", "Biscoito"], ["outro", "Outros"]].map(([id, label]) => (
            <button key={id} onClick={() => selecionarTipo(id)} className={"relative border-2 px-3 py-6 text-center text-sm font-semibold transition-all " + (tipo === id ? "scale-[1.03] border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]" : "border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--ink-soft)]")}>
              {tipo === id && <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)] text-white"><Check size={12} strokeWidth={3} /></span>}
              {label}
            </button>
          ))}
        </div>
        {tipo === "outro" && (
          <input value={tipoDescricao} onChange={(e) => setTipoDescricao(e.target.value)} placeholder="Descreva o tipo de queima" className="mt-4 w-full border border-[var(--line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--ink)]" />
        )}
      </Card>

      <Card className="mt-5 p-5">
        <h2 className="mb-3 text-sm font-semibold">Conteúdo do forno</h2>
        <div className="[&>*]:min-w-0 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CATEGORIAS.map((c) => {
            const ativo = categorias.includes(c.id);
            return (
              <button key={c.id} onClick={() => toggleCategoria(c.id)} className={"relative flex flex-col items-center gap-2 border-2 px-3 py-5 text-center text-xs font-medium transition-all " + (ativo ? "scale-[1.03] border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]" : "border-[var(--line)] text-[var(--ink-soft)] hover:border-[var(--ink-soft)]")}>
                {ativo && <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--accent)] text-white"><Check size={12} strokeWidth={3} /></span>}
                <c.icon size={22} />{c.label}
              </button>
            );
          })}
        </div>
        <div className="mt-4">
          <label className="mb-1 block text-xs font-medium text-[var(--ink-soft)]">Detalhes do conteúdo do forno (opcional)</label>
          <textarea value={detalhes} onChange={(e) => setDetalhes(e.target.value)} rows={2} placeholder="Ex: Peças da turma de terça junto com uma encomenda da Marina." className="w-full border border-[var(--line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--ink)]" />
        </div>
      </Card>

      <Card className="mt-5 p-5">
        <h2 className="mb-3 text-sm font-semibold">Configuração</h2>
        <div className="[&>*]:min-w-0 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Campo label="Temp. inicial (°C)" value={config.temperaturaInicial} onChange={(v) => setCampo("temperaturaInicial", v)} />
          <Campo label="Temp. máxima (°C)" value={config.temperaturaMaxima} onChange={(v) => setCampo("temperaturaMaxima", v)} />
          <Campo label="Vel. aquecimento (°C/min)" value={config.velocidadeAquecimento} onChange={(v) => setCampo("velocidadeAquecimento", v)} />
          <Campo label="Tempo de patamar (min)" value={config.tempoPatamarMin} onChange={(v) => setCampo("tempoPatamarMin", v)} />
          <Campo label="Vel. resfriamento (°C/min)" value={config.velocidadeResfriamento} onChange={(v) => setCampo("velocidadeResfriamento", v)} />
          <Campo label="Temp. segura (°C)" value={config.temperaturaSegura} onChange={(v) => setCampo("temperaturaSegura", v)} />
        </div>
        <div className="mt-3">
          <label className="mb-1 block text-xs font-medium text-[var(--ink-soft)]">Observações</label>
          <textarea rows={2} placeholder="Observações gerais sobre esta queima" className="w-full border border-[var(--line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--ink)]" />
        </div>
      </Card>

      {tipo && (
        <Card className="mt-5 p-5">
          <h2 className="mb-3 text-sm font-semibold">Revisão</h2>
          <dl className="[&>*]:min-w-0 grid grid-cols-2 gap-y-2.5 text-sm">
            <dt className="text-[var(--ink-soft)]">Tipo</dt><dd className="text-right font-medium">{TIPO_LABEL[tipo]}{tipoDescricao ? ` — ${tipoDescricao}` : ""}</dd>
            <dt className="text-[var(--ink-soft)]">Categorias</dt><dd className="text-right font-medium">{categorias.length ? categorias.map((c) => CATEGORIAS.find((x) => x.id === c)?.label).join(", ") : "nenhuma selecionada"}</dd>
            {detalhes && (<><dt className="text-[var(--ink-soft)]">Detalhes</dt><dd className="text-right font-medium">{detalhes}</dd></>)}
            <dt className="text-[var(--ink-soft)]">Configuração</dt><dd className="text-right font-medium">{config.temperaturaMaxima}°C · {config.velocidadeAquecimento}°C/min</dd>
            {previsao && (<><dt className="text-[var(--ink-soft)]">Previsão máxima</dt><dd className="text-right font-medium">{fmtHora(previsao.horaMax)}</dd></>)}
            {previsao && (<><dt className="text-[var(--ink-soft)]">Previsão abertura segura</dt><dd className="text-right font-medium">{fmtDiaHora(previsao.horaSegura)}</dd></>)}
          </dl>
        </Card>
      )}

      <div className="mt-6 flex gap-3 pb-6">
        <button onClick={onVoltar} className="flex-1 border border-[var(--line)] py-3 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--cream)]">Voltar</button>
        <button
          disabled={!pronto}
          onClick={() => onIniciar({ tipo, tipoDescricao, categorias, detalhesConteudo: detalhes, parametros: config })}
          className="flex-[2] flex items-center justify-center gap-2 bg-[var(--accent)] py-3 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Flame size={16} />Iniciar fornada
        </button>
      </div>
    </div>
  );
}

function Campo({ label, value, onChange }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-[var(--ink-soft)]">{label}</label>
      <input type="number" value={value} onChange={(e) => onChange(parseFloat(e.target.value) || 0)} className="w-full border border-[var(--line)] px-3 py-2 text-sm outline-none focus:border-[var(--ink)]" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Demais telas (inalteradas)                                         */
/* ------------------------------------------------------------------ */

function Turmas({ notificar, diaInicial = "ter" }) {
  const diaValido = TURMAS_DIAS.find((d) => d.id === diaInicial && d.disponivel) || TURMAS_DIAS.find((d) => d.id === "ter");
  const [diaAtivo, setDiaAtivo] = useState(diaValido.id);
  const [turmaAtiva, setTurmaAtiva] = useState(diaValido.turmas[0].id);
  const [vagas, setVagas] = useState(VAGAS_INICIAIS);
  const [modalVaga, setModalVaga] = useState(null);
  function cadastrarAluno(numero, dados) {
    setVagas((vs) => vs.map((v) => v.numero === numero ? { ...v, nome: dados.nome, aula: 0, total: dados.total, status: "confirmado", statusAula: "confirmado", presente: false } : v));
    notificar(`${dados.nome} cadastrado(a) na turma.`);
    setModalVaga(null);
  }
  function selecionarDia(dia) {
    if (!dia.disponivel) return;
    setDiaAtivo(dia.id);
    setTurmaAtiva(dia.turmas[0].id);
  }
  function resolver(nome, aprovado) { notificar(aprovado ? `Solicitação de ${nome} aprovada.` : `Solicitação de ${nome} recusada.`); }
  function toggleStatusAula(numero) {
    setVagas((vs) => vs.map((v) => v.numero === numero ? { ...v, statusAula: v.statusAula === "confirmado" ? "ausente" : "confirmado" } : v));
  }
  function marcarPresenca(numero) {
    setVagas((vs) => vs.map((v) => {
      if (v.numero !== numero) return v;
      if (v.presente) {
        const aula = Math.max(v.aula - 1, 0);
        return { ...v, presente: false, aula, status: v.status === "ultima" ? "confirmado" : v.status };
      }
      const aula = Math.min(v.aula + 1, v.total);
      const ultima = aula === v.total;
      if (ultima) notificar(`${v.nome}: última aula do pacote — gerar alerta de renovação.`);
      return { ...v, presente: true, aula, status: ultima ? "ultima" : v.status };
    }));
  }
  const ocupadas = vagas.filter((v) => v.nome).length;
  const diaInfo = TURMAS_DIAS.find((d) => d.id === diaAtivo) || TURMAS_DIAS[1];
  const turmaInfo = diaInfo.turmas.find((t) => t.id === turmaAtiva) || diaInfo.turmas[0];
  const cor = corTurma(turmaInfo.id);
  return (
    <div>
      <div className="mb-5 flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold" style={FONT_DISPLAY}>Turmas</h1><p className="text-sm text-[var(--ink-soft)]">Gerencie suas turmas, alunos e presenças.</p></div>
        <button className={"hidden rounded-full px-4 py-2 text-sm font-medium sm:block " + ACCENT_SOLIDO} onClick={() => notificar("Cadastro de nova turma (demo)")}>+ Nova turma</button>
      </div>
      <div className="mb-3 flex gap-2 overflow-x-auto">
        {TURMAS_DIAS.map((d) => {
          const ativo = diaAtivo === d.id;
          const corDia = d.turmas[0] ? corTurma(d.turmas[0].id) : null;
          return (
            <button
              key={d.id}
              onClick={() => selecionarDia(d)}
              disabled={!d.disponivel}
              className={"shrink-0 rounded-full px-4 py-2 text-sm font-medium " + (ativo ? ACCENT_SOLIDO : d.disponivel ? VIDRO_PILL : VIDRO_PILL_NEUTRO)}
              style={ativo ? undefined : d.disponivel ? estiloVidroTingido(corDia) : undefined}
            >
              {d.label}
            </button>
          );
        })}
      </div>
      {diaInfo.turmas.length > 1 && (
        <div className="relative mb-5 flex gap-2">
          {diaInfo.turmas.map((t) => {
            const corPill = corTurma(t.id);
            const ativa = turmaAtiva === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTurmaAtiva(t.id)}
                className={"rounded-full px-3 py-1.5 text-xs font-medium " + (ativa ? ACCENT_SOLIDO : VIDRO_PILL)}
                style={ativa ? undefined : estiloVidroTingido(corPill)}
              >
                {t.hora}
              </button>
            );
          })}
        </div>
      )}
      {diaInfo.turmas.length <= 1 && <div className="mb-5" />}
      <div className="[&>*]:min-w-0 grid gap-5 lg:grid-cols-[1fr_300px]">
        <div className="w-full min-w-0">
          <Card className="mb-4 flex flex-wrap items-center justify-between gap-2 px-4 py-3">
            <div><div className="text-sm font-semibold">{turmaInfo.dia} · {turmaInfo.hora}</div><div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge tone="success">{ocupadas}/12 alunos</Badge>
              <span className={"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium " + VIDRO_PILL} style={estiloVidroTingido(cor)}>{turmaInfo.dia.split("-")[0]}</span>
            </div></div>
          </Card>
          <div className={"relative w-full min-w-0 divide-y divide-white/50 overflow-hidden " + VIDRO_CARD}>
            {vagas.map((v) => v.nome ? (
              <div key={v.numero} className="flex w-full min-w-0 items-center gap-3 p-3">
                <Avatar nome={v.nome} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <button
                      onClick={() => toggleStatusAula(v.numero)}
                      title={v.statusAula === "confirmado" ? "Confirmado p/ próxima aula — toque p/ marcar ausente" : "Ausente na próxima aula — toque p/ confirmar"}
                      aria-label={v.statusAula === "confirmado" ? "Confirmado para a próxima aula. Toque para marcar ausente." : "Ausente na próxima aula. Toque para confirmar."}
                      className={"h-2.5 w-2.5 shrink-0 rounded-full " + (v.statusAula === "confirmado" ? "bg-emerald-500" : "bg-rose-500")}
                    />
                    <span className="truncate text-sm font-medium">{v.nome}</span>
                    {v.status !== "confirmado" && <Badge tone={v.status === "ultima" ? "danger" : "warning"}>{v.status === "ultima" ? "Renovar" : "Pendente"}</Badge>}
                  </div>
                </div>
                <ProgressRing pct={(v.aula / v.total) * 100} size={40} stroke={5} color={rgbCor(cor)} trackColor={rgbCor(cor, 0.18)}>
                  <span className="text-[10px] font-semibold" style={{ color: rgbCor(cor) }}>{v.aula}/{v.total}</span>
                </ProgressRing>
                <Toggle checked={v.presente} onChange={() => marcarPresenca(v.numero)} title={v.presente ? "Presente — toque para desfazer" : "Marcar presença"} />
              </div>
            ) : (
              <button key={v.numero} onClick={() => setModalVaga(v.numero)} className="flex w-full items-center gap-3 p-3 text-left hover:bg-[var(--cream)]">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-dashed border-[var(--ink-soft)] text-[var(--ink-soft)]"><Plus size={16} /></span>
                <span className="min-w-0 flex-1 text-sm text-[var(--ink-soft)]">Vaga {v.numero} disponível</span>
                <span className="shrink-0 border border-[var(--ink-soft)] px-2 py-1 text-xs font-medium text-[var(--ink)]">Cadastrar aluno</span>
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="mb-3 text-sm font-semibold">Detalhes da turma</h3>
            <dl className="[&>*]:min-w-0 grid grid-cols-2 gap-y-3 text-sm">
              <dt className="text-[var(--ink-soft)]">Dia</dt><dd className="text-right font-medium">{turmaInfo.dia}</dd>
              <dt className="text-[var(--ink-soft)]">Horário</dt><dd className="text-right font-medium">{turmaInfo.hora}</dd>
              <dt className="text-[var(--ink-soft)]">Capacidade</dt><dd className="text-right font-medium">12 alunos</dd>
              <dt className="text-[var(--ink-soft)]">Confirmados</dt><dd className="text-right font-medium">{vagas.filter(v=>v.status==="confirmado").length} alunos</dd>
            </dl>
          </Card>
          <Card className="p-4">
            <h3 className="mb-3 text-sm font-semibold">Solicitações pendentes</h3>
            <ul className="space-y-3">
              {SOLICITACOES_INICIAIS.slice(0, 2).map((s) => (
                <li key={s.nome} className="flex items-center justify-between text-sm">
                  <span><span className="block font-medium">{s.nome}</span><span className="text-[var(--ink-soft)]">{s.tipo}</span></span>
                  <div className="flex gap-1.5">
                    <button onClick={() => resolver(s.nome, true)} className="bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">Aprovar</button>
                    <button onClick={() => resolver(s.nome, false)} className="bg-rose-100 px-2 py-1 text-xs font-medium text-rose-600">Recusar</button>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      {modalVaga && (
        <ModalCadastrarAluno numero={modalVaga} onClose={() => setModalVaga(null)} onSalvar={(dados) => cadastrarAluno(modalVaga, dados)} />
      )}
    </div>
  );
}

function ModalCadastrarAluno({ numero, onClose, onSalvar }) {
  const [nome, setNome] = useState("");
  const [total, setTotal] = useState(4);
  return (
    <Modal onClose={onClose}>
      <h3 className="mb-3 text-base font-semibold">Cadastrar aluno — vaga {numero}</h3>
      <form onSubmit={(e) => { e.preventDefault(); if (!nome.trim()) return; onSalvar({ nome: nome.trim(), total }); }}>
        <label className="mb-1 block text-xs font-medium text-[var(--ink-soft)]">Nome do aluno</label>
        <input autoFocus value={nome} onChange={(e) => setNome(e.target.value)} className="mb-3 w-full border border-[var(--line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--ink)]" placeholder="Nome completo" />
        <label className="mb-1 block text-xs font-medium text-[var(--ink-soft)]">Pacote</label>
        <div className="mb-4 flex gap-2">
          {[4, 8, 12].map((n) => (
            <button type="button" key={n} onClick={() => setTotal(n)} className={"flex-1 border px-3 py-2 text-sm font-medium " + (total === n ? "border-[var(--ink)] bg-[var(--cream-soft)] text-[var(--ink)]" : "border-[var(--line)] text-[var(--ink-soft)]")}>{n} aulas</button>
          ))}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 border border-[var(--line)] py-2.5 text-sm font-medium text-[var(--ink)]">Cancelar</button>
          <button type="submit" className="flex-1 bg-[var(--accent)] py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-hover)]">Cadastrar</button>
        </div>
      </form>
    </Modal>
  );
}

function Alunos() {
  const [alunos, setAlunos] = useState([]);
  const [modal, setModal] = useState(false);

  function cadastrar(dados) {
    setAlunos((as) => [...as, dados]);
    setModal(false);
  }

  return (
    <div>
      <div className="mb-5 flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold" style={FONT_DISPLAY}>Alunos</h1><p className="text-sm text-[var(--ink-soft)]">Cadastro e histórico dos alunos do ateliê.</p></div>
        <button onClick={() => setModal(true)} className="bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)]">+ Cadastrar aluno</button>
      </div>

      {alunos.length === 0 ? (
        <Card className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
          <GraduationCap size={26} className="text-[var(--ink-soft)]" />
          <h2 className="text-base font-semibold">Nenhum aluno cadastrado ainda</h2>
          <p className="max-w-xs text-sm text-[var(--ink-soft)]">Cadastre seus alunos reais para começar a controlar turmas, pacotes e presenças.</p>
          <button onClick={() => setModal(true)} className="mt-2 bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-hover)]">+ Cadastrar aluno</button>
        </Card>
      ) : (
        <div className={"relative divide-y divide-white/50 overflow-hidden " + VIDRO_CARD}>
          {alunos.map((a, i) => {
            const cor = TURMA_LABEL_COR[a.turma] || "sienna";
            return (
              <div key={i} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar nome={a.nome} />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{a.nome}</div>
                    <div className="flex items-center gap-1.5 text-xs text-[var(--ink-soft)]">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: rgbCor(cor) }} />
                      {a.turma} · {a.tel}
                    </div>
                  </div>
                </div>
                <ProgressRing pct={(a.aula / a.total) * 100} size={40} stroke={5} color={rgbCor(cor)} trackColor={rgbCor(cor, 0.18)}>
                  <span className="text-[10px] font-semibold" style={{ color: rgbCor(cor) }}>{a.aula}/{a.total}</span>
                </ProgressRing>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <Modal onClose={() => setModal(false)}>
          <h3 className="mb-3 text-base font-semibold">Cadastrar aluno</h3>
          <FormAluno onCancelar={() => setModal(false)} onSalvar={cadastrar} />
        </Modal>
      )}
    </div>
  );
}

function FormAluno({ onCancelar, onSalvar }) {
  const [nome, setNome] = useState("");
  const [tel, setTel] = useState("");
  const [turma, setTurma] = useState("Terça 18:30");
  const [total, setTotal] = useState(4);
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (!nome.trim()) return; onSalvar({ nome: nome.trim(), tel, turma, aula: 0, total }); }}>
      <label className="mb-1 block text-xs font-medium text-[var(--ink-soft)]">Nome completo</label>
      <input autoFocus value={nome} onChange={(e) => setNome(e.target.value)} className="mb-3 w-full border border-[var(--line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--ink)]" placeholder="Nome do aluno" />
      <label className="mb-1 block text-xs font-medium text-[var(--ink-soft)]">Telefone</label>
      <input value={tel} onChange={(e) => setTel(e.target.value)} className="mb-3 w-full border border-[var(--line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--ink)]" placeholder="(14) 99999-9999" />
      <label className="mb-1 block text-xs font-medium text-[var(--ink-soft)]">Turma fixa</label>
      <select value={turma} onChange={(e) => setTurma(e.target.value)} className="mb-3 w-full border border-[var(--line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--ink)]">
        <option>Terça 18:30</option><option>Quarta 16:30</option><option>Quinta 14:30</option><option>Quinta 18:30</option>
      </select>
      <label className="mb-1 block text-xs font-medium text-[var(--ink-soft)]">Pacote</label>
      <div className="mb-4 flex gap-2">
        {[4, 8, 12].map((n) => (
          <button type="button" key={n} onClick={() => setTotal(n)} className={"flex-1 border px-3 py-2 text-sm font-medium " + (total === n ? "border-[var(--ink)] bg-[var(--cream-soft)] text-[var(--ink)]" : "border-[var(--line)] text-[var(--ink-soft)]")}>{n} aulas</button>
        ))}
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={onCancelar} className="flex-1 border border-[var(--line)] py-2.5 text-sm font-medium text-[var(--ink)]">Cancelar</button>
        <button type="submit" className="flex-1 bg-[var(--accent)] py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-hover)]">Cadastrar</button>
      </div>
    </form>
  );
}

function Oficinas({ oficinas, onAbrir }) {
  return (
    <div>
      <div className="mb-5 flex items-start justify-between">
        <div><h1 className="text-2xl font-semibold" style={FONT_DISPLAY}>Oficinas</h1><p className="text-sm text-[var(--ink-soft)]">Eventos avulsos com inscrição e pagamento.</p></div>
        <button className="bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white">+ Nova oficina</button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {oficinas.map((o) => {
          const ocupadas = o.participantes.filter((p) => p.nome).length;
          const cor = corOficina(o);
          return (
            <button key={o.id} onClick={() => onAbrir(o.id)} className="text-left">
              <div className={"relative min-w-0 p-4 " + VIDRO_CARD}>
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-medium">{o.nome}</h3>
                    <span className={"mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium " + VIDRO_PILL} style={estiloVidroTingido(cor)}>{o.status}</span>
                  </div>
                  <ProgressRing pct={(ocupadas / o.vagas) * 100} size={44} stroke={5} color={rgbCor(cor)} trackColor={rgbCor(cor, 0.18)}>
                    <span className="text-[10px] font-semibold" style={{ color: rgbCor(cor) }}>{ocupadas}/{o.vagas}</span>
                  </ProgressRing>
                </div>
                <p className="text-sm text-[var(--ink-soft)]">{o.data} · {o.hora}</p>
                <p className="mt-1 text-sm text-[var(--ink-soft)]">R$ {o.valor} por pessoa</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const ETAPAS_PECAS = [
  { id: "secagem", label: "Em secagem" },
  { id: "biscoitadas", label: "Peças biscoitadas" },
  { id: "esmaltadas", label: "Peças esmaltadas" },
  { id: "prontas", label: "Prontas para retirada" },
];

function StatusPecasCard({ status, somenteLeitura, onAlterar }) {
  const idxAtual = ETAPAS_PECAS.findIndex((e) => e.id === status);
  return (
    <Card className="mb-5 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Status das peças</h3>
        {somenteLeitura && <Badge tone="info">Visualização do aluno</Badge>}
      </div>
      <div className="flex flex-wrap gap-2">
        {ETAPAS_PECAS.map((e, i) => {
          const concluida = i <= idxAtual;
          const atual = i === idxAtual;
          const clicavel = !somenteLeitura;
          return (
            <button
              key={e.id}
              disabled={!clicavel}
              onClick={() => clicavel && onAlterar(e.id)}
              className={
                "flex-1 min-w-[140px] border px-3 py-3 text-left text-xs font-medium transition-all " +
                (atual ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]" : concluida ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-[var(--line)] bg-[var(--cream)] text-[var(--ink-soft)]") +
                (clicavel ? " hover:border-[var(--ink-soft)] cursor-pointer" : " cursor-default")
              }
            >
              <div className="mb-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold "
                style={{ background: atual ? "#C2410C" : concluida ? "#059669" : "#DEDAD1", color: "#fff" }}>
                {concluida && !atual ? <Check size={12} /> : i + 1}
              </div>
              {e.label}
            </button>
          );
        })}
      </div>
      {somenteLeitura && <p className="mt-2 text-xs text-[var(--ink-soft)]">O aluno só visualiza — apenas o administrador altera o status.</p>}
    </Card>
  );
}

function OficinaDetalhe({ oficina, notificar, onVoltar, onCadastrarParticipante, onAtualizarStatusPecas }) {
  const [modalNumero, setModalNumero] = useState(null);
  const [verComoAluno, setVerComoAluno] = useState(false);
  if (!oficina) return null;

  const preenchidos = oficina.participantes.filter((p) => p.nome);
  const pagos = preenchidos.filter((p) => p.pagamento === "pago").length;
  const pendentes = preenchidos.filter((p) => p.pagamento === "pendente").length;
  const duplas = preenchidos.filter((p) => p.tipo === "dupla").length;
  const individuaisPreenchidos = preenchidos.filter((p) => p.tipo === "individual" || !p.duplaCom);
  const cor = corOficina(oficina);

  return (
    <div>
      <button onClick={onVoltar} className="mb-4 flex items-center gap-1 text-sm font-medium text-[var(--ink-soft)] hover:text-[var(--ink)]"><ChevronLeft size={16} />Voltar para oficinas</button>

      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold" style={FONT_DISPLAY}>{oficina.nome}</h1>
            <Badge tone="success">{oficina.status}</Badge>
            <span className={"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium " + VIDRO_PILL} style={estiloVidroTingido(cor)}>Oficina</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-[var(--ink-soft)]">
            <span className="flex items-center gap-1.5"><CalendarDays size={14} />{oficina.data}</span>
            <span className="flex items-center gap-1.5"><Clock size={14} />{oficina.hora}</span>
            <span className="flex items-center gap-1.5"><CreditCard size={14} />R$ {oficina.valor} por pessoa</span>
            <span className="flex items-center gap-1.5"><Users size={14} />{oficina.vagas} vagas</span>
          </div>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
          <button
            type="button"
            role="checkbox"
            aria-checked={verComoAluno}
            onClick={() => setVerComoAluno((v) => !v)}
            className="flex items-center gap-1.5 border border-[var(--line)] bg-white px-3 py-2.5 text-xs font-medium text-[var(--ink-soft)]"
          >
            <span className={"flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border " + (verComoAluno ? "border-[var(--accent)] bg-[var(--accent)] text-white" : "border-[var(--ink-soft)]")}>
              {verComoAluno && <Check size={10} strokeWidth={3} />}
            </span>
            Ver como aluno
          </button>
          <button className="flex items-center gap-1.5 border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--cream)]">Editar oficina</button>
          <button onClick={() => notificar("Lembrete enviado via WhatsApp (demo).")} className="flex items-center gap-1.5 bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-hover)]">Enviar lembrete</button>
        </div>
      </div>

      <StatusPecasCard status={oficina.statusPecas} somenteLeitura={verComoAluno} onAlterar={onAtualizarStatusPecas} />

      <div className="[&>*]:min-w-0 mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Users} label="Participantes" value={`${preenchidos.length} / ${oficina.vagas}`} sub="inscritos" />
        <StatCard icon={Check} label="Pagos" value={pagos} sub="confirmados" />
        <StatCard icon={Clock} label="Pendentes" value={pendentes} sub="aguardando" />
        <StatCard icon={Users} label="Duplas" value={duplas} sub="participantes em dupla" />
      </div>

      <div className="[&>*]:min-w-0 mb-5 grid gap-4 lg:grid-cols-3">
        <Card className="p-4">
          <h3 className="mb-2 text-sm font-semibold">Sobre a oficina</h3>
          <p className="text-sm text-[var(--ink-soft)]">{oficina.descricao}</p>
        </Card>
        <Card className="p-4">
          <h3 className="mb-2 text-sm font-semibold">Receita da oficina</h3>
          <ul className="space-y-1.5 text-sm">
            {oficina.receita.map((r) => (
              <li key={r.item} className="flex items-center justify-between"><span className="text-[var(--ink)]">{r.item}</span><span className="text-[var(--ink-soft)]">{r.peso}</span></li>
            ))}
          </ul>
        </Card>
        <Card className="border-[var(--line)] bg-[var(--cream-soft)]/40 p-4">
          <h3 className="mb-2 text-sm font-semibold text-[var(--ink)]">Observações</h3>
          <p className="text-sm text-[var(--ink)]">{oficina.observacoes || "Nenhuma observação registrada."}</p>
        </Card>
      </div>

      <h3 className="mb-3 text-sm font-semibold">Participantes ({oficina.vagas} vagas)</h3>
      <div className={"relative w-full min-w-0 divide-y divide-white/50 overflow-hidden " + VIDRO_CARD}>
        {oficina.participantes.map((p) => p.nome ? (
          <div key={p.numero} className="flex w-full min-w-0 items-center gap-3 p-3">
            <Avatar nome={p.nome} size={40} />
            <div className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{p.nome}</span>
              <span className="text-xs text-[var(--ink-soft)]">{p.tipo === "dupla" ? (p.duplaCom ? `Dupla com ${p.duplaCom}` : "Dupla") : "Individual"}</span>
            </div>
            <Badge tone={p.pagamento === "pago" ? "success" : "warning"}>{p.pagamento === "pago" ? "Pago" : "Pendente"}</Badge>
          </div>
        ) : (
          <button key={p.numero} onClick={() => setModalNumero(p.numero)} className="flex w-full items-center gap-3 p-3 text-left hover:bg-[var(--cream)]">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-dashed border-[var(--ink-soft)] text-[var(--ink-soft)]"><Plus size={16} /></span>
            <span className="min-w-0 flex-1 text-sm text-[var(--ink-soft)]">Vaga {p.numero} disponível</span>
            <span className="shrink-0 border border-[var(--ink-soft)] px-2 py-1 text-xs font-medium text-[var(--ink)]">Cadastrar participante</span>
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 bg-[var(--cream)] px-3 py-2.5 text-sm text-[var(--ink-soft)]">
        Os lembretes serão enviados via WhatsApp um dia antes da oficina.
      </div>

      {modalNumero && (
        <ModalCadastrarParticipante
          numero={modalNumero}
          opcoesDupla={individuaisPreenchidos.map((p) => p.nome)}
          onClose={() => setModalNumero(null)}
          onSalvar={(dados) => { onCadastrarParticipante(modalNumero, dados); setModalNumero(null); }}
        />
      )}
    </div>
  );
}

function ModalCadastrarParticipante({ numero, opcoesDupla, onClose, onSalvar }) {
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("individual");
  const [duplaCom, setDuplaCom] = useState("");
  const [pagamento, setPagamento] = useState("pendente");

  return (
    <Modal onClose={onClose}>
      <h3 className="mb-3 text-base font-semibold">Cadastrar participante — vaga {numero}</h3>
      <form onSubmit={(e) => { e.preventDefault(); if (!nome.trim()) return; onSalvar({ nome: nome.trim(), tipo, duplaCom: tipo === "dupla" ? duplaCom || null : null, pagamento }); }}>
        <label className="mb-1 block text-xs font-medium text-[var(--ink-soft)]">Nome</label>
        <input autoFocus value={nome} onChange={(e) => setNome(e.target.value)} className="mb-3 w-full border border-[var(--line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--ink)]" placeholder="Nome do participante" />

        <label className="mb-1 block text-xs font-medium text-[var(--ink-soft)]">Tipo</label>
        <div className="mb-3 flex gap-2">
          {["individual", "dupla"].map((t) => (
            <button type="button" key={t} onClick={() => setTipo(t)} className={"flex-1 border px-3 py-2 text-sm font-medium capitalize " + (tipo === t ? "border-[var(--ink)] bg-[var(--cream-soft)] text-[var(--ink)]" : "border-[var(--line)] text-[var(--ink-soft)]")}>{t}</button>
          ))}
        </div>

        {tipo === "dupla" && opcoesDupla.length > 0 && (
          <div className="mb-3">
            <label className="mb-1 block text-xs font-medium text-[var(--ink-soft)]">Dupla com (opcional)</label>
            <select value={duplaCom} onChange={(e) => setDuplaCom(e.target.value)} className="w-full border border-[var(--line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--ink)]">
              <option value="">Selecionar...</option>
              {opcoesDupla.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        )}

        <label className="mb-1 block text-xs font-medium text-[var(--ink-soft)]">Pagamento</label>
        <div className="mb-4 flex gap-2">
          {[["pendente", "Pendente"], ["pago", "Pago"]].map(([id, label]) => (
            <button type="button" key={id} onClick={() => setPagamento(id)} className={"flex-1 border px-3 py-2 text-sm font-medium " + (pagamento === id ? "border-[var(--ink)] bg-[var(--cream-soft)] text-[var(--ink)]" : "border-[var(--line)] text-[var(--ink-soft)]")}>{label}</button>
          ))}
        </div>

        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 border border-[var(--line)] py-2.5 text-sm font-medium text-[var(--ink)]">Cancelar</button>
          <button type="submit" className="flex-1 bg-[var(--accent)] py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-hover)]">Cadastrar</button>
        </div>
      </form>
    </Modal>
  );
}

function Solicitacoes({ notificar }) {
  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold" style={FONT_DISPLAY}>Solicitações</h1>
      <p className="mb-5 text-sm text-[var(--ink-soft)]">Vagas e reposições aguardando aprovação.</p>
      <Card><ul className="divide-y divide-[var(--line)]">
        {SOLICITACOES_INICIAIS.map((s) => (
          <li key={s.nome} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-3"><Avatar nome={s.nome} /><div><div className="text-sm font-medium">{s.nome}</div><div className="text-xs text-[var(--ink-soft)]">{s.tipo} · {s.quando}</div></div></div>
            <div className="flex gap-1.5">
              <button onClick={() => notificar(`Aprovado: ${s.nome}`)} className="bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700">Aprovar</button>
              <button onClick={() => notificar(`Recusado: ${s.nome}`)} className="bg-rose-100 px-2.5 py-1.5 text-xs font-medium text-rose-600">Recusar</button>
            </div>
          </li>
        ))}
      </ul></Card>
    </div>
  );
}

function Pagamentos() {
  const [pagamentos] = useState(pagamentosIniciais);
  const [modal, setModal] = useState(null);

  const pendentes = pagamentos.filter((p) => p.status === "pendente");
  const pagos = pagamentos.filter((p) => p.status === "pago");
  const totalPendente = pendentes.reduce((s, p) => s + p.valor, 0);
  const totalRecebido = pagos.reduce((s, p) => s + p.valor, 0);

  function mensagem(p) {
    return `Oi ${p.nome.split(" ")[0]}! Vi que seu pacote de cerâmica foi finalizado 😊 Quer renovar? Segue a chave Pix: ${PIX_CHAVE} — valor: R$ ${p.valor}. Qualquer dúvida me chama por aqui!`;
  }
  function enviarWhatsApp(p) {
    window.open(`https://wa.me/${p.telefone}?text=${encodeURIComponent(mensagem(p))}`, "_blank");
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold" style={FONT_DISPLAY}>Pagamentos</h1>
      <p className="mb-5 text-sm text-[var(--ink-soft)]">Histórico de pacotes e aulas avulsas, cobranças pendentes.</p>

      <div className="[&>*]:min-w-0 mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={CreditCard} label="Pendente" value={"R$ " + totalPendente} sub={pendentes.length + " cobranças"} />
        <StatCard icon={Check} label="Recebido" value={"R$ " + totalRecebido} sub={pagos.length + " pagamentos"} />
        <StatCard icon={Users} label="Alunos" value={pagamentos.length} sub="no período" />
        <StatCard icon={Clock} label="Ticket médio" value={"R$ " + Math.round((totalPendente + totalRecebido) / pagamentos.length)} />
      </div>

      <div className={"relative mb-5 p-4 " + VIDRO_CARD}>
        <h3 className="mb-3 text-sm font-semibold">Pendentes — cobrar</h3>
        <ul className="divide-y divide-white/50">
          {pendentes.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
              <div className="flex items-center gap-3">
                <Avatar nome={p.nome} />
                <div>
                  <div className="text-sm font-medium">{p.nome}</div>
                  <div className="text-xs text-[var(--ink-soft)]">{p.tipo} · R$ {p.valor} · {p.motivo}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone="warning">Pendente</Badge>
                <button onClick={() => setModal(p)} className="bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700">Cobrar no WhatsApp</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className={"relative p-4 " + VIDRO_CARD}>
        <h3 className="mb-3 text-sm font-semibold">Histórico</h3>
        <ul className="divide-y divide-white/50">
          {pagamentos.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-2 py-2.5 text-sm">
              <div className="flex items-center gap-3">
                <Avatar nome={p.nome} size={30} />
                <div>
                  <div className="font-medium">{p.nome}</div>
                  <div className="text-xs text-[var(--ink-soft)]">{p.tipo} · {p.data}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[var(--ink-soft)]">R$ {p.valor}</span>
                <Badge tone={p.status === "pago" ? "success" : "warning"}>{p.status === "pago" ? "Pago" : "Pendente"}</Badge>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {modal && (
        <Modal onClose={() => setModal(null)}>
          <h3 className="mb-3 text-base font-semibold">Cobrar {modal.nome.split(" ")[0]}</h3>
          <div className="mb-4 bg-[var(--cream)] p-3 text-sm text-[var(--ink)]">{mensagem(modal)}</div>
          <div className="flex gap-2">
            <button onClick={() => setModal(null)} className="flex-1 border border-[var(--line)] py-2.5 text-sm font-medium text-[var(--ink)]">Cancelar</button>
            <button onClick={() => { enviarWhatsApp(modal); setModal(null); }} className="flex-1 bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-700">Enviar no WhatsApp</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function EmBreve({ tela }) {
  const nomes = { pagamentos: "Pagamentos", relatorios: "Relatórios", config: "Configurações" };
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center bg-[var(--cream-soft)] text-[var(--ink)]"><ChevronDown size={22} /></div>
      <h2 className="text-lg font-semibold">{nomes[tela]}</h2>
      <p className="mt-1 max-w-xs text-sm text-[var(--ink-soft)]">Tela ainda não implementada nesta demo — mesma arquitetura das demais.</p>
    </div>
  );
}
