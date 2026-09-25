// Tipos manuais espelhando supabase/schema.sql.
// Em produção, substitua por `npm run supabase:types` (supabase gen types).

export type UserRole = "admin" | "aluno";
export type DiaSemana = "seg" | "ter" | "qua" | "qui" | "sex" | "sab" | "dom";
export type PacoteStatus = "ativo" | "ultima_aula" | "encerrado";
export type MatriculaStatus = "confirmado" | "pendente" | "recusado";
export type PresencaStatus = "presente" | "falta" | "reposicao" | "pendente";
export type ReposicaoStatus = "solicitada" | "aprovada" | "recusada" | "realizada";
export type SolicitacaoStatus = "pendente" | "aprovada" | "recusada";
export type PagamentoStatus = "pendente" | "pago" | "isento";
export type PagamentoTipo = "pacote" | "avulsa";
export type TipoQueima = "esmalte" | "biscoito" | "outro";
export type EtapaQueimaDB =
  | "aquecendo" | "maxima_atingida" | "patamar" | "resfriando"
  | "aguardando_segura" | "liberado_abrir" | "finalizada";
export type FornoFisico = "forno1" | "forno2";
export type FornadaStatusDB = "andamento" | "finalizada" | "interrompida" | "cancelada";
export type StatusPecas = "secagem" | "biscoitadas" | "esmaltadas" | "prontas";
export type ParticipanteTipo = "individual" | "dupla";
export type ConteudoCategoria = "alunos" | "oficinas" | "encomendas" | "fora" | "misturado";
export type NotificacaoTipo =
  | "ultima_aula" | "pacote_encerrado" | "solicitacao_vaga" | "solicitacao_reposicao"
  | "confirmacao_presenca" | "oficina_amanha" | "queima_iniciada" | "queima_finalizada"
  | "pecas_prontas";
export type AvisoDestinatario = "admin" | "alunos";

export interface Profile {
  id: string;
  // Só preenchido pra quem de fato loga (admin sempre; aluno só se/quando
  // a Área do Aluno existir e ele aceitar um convite) — ver schema.sql.
  auth_user_id: string | null;
  role: UserRole;
  nome: string;
  telefone: string | null;
  email: string | null;
  foto_url: string | null;
  criado_em: string;
  convite_token: string | null;
  convite_expira_em: string | null;
}

export interface Turma {
  id: string;
  nome: string;
  dia: DiaSemana;
  hora_inicio: string;
  hora_fim: string;
  capacidade: number;
  ativo: boolean;
}

export interface Pacote {
  id: string;
  aluno_id: string;
  turma_id: string;
  total_aulas: number;
  aulas_usadas: number;
  status: PacoteStatus;
  criado_em: string;
  atualizado_em: string;
}

export interface Matricula {
  id: string;
  turma_id: string;
  aluno_id: string;
  pacote_id: string | null;
  status: MatriculaStatus;
  provisorio: boolean;
  solicitado_em: string;
}

export interface Aula {
  id: string;
  turma_id: string;
  data: string;
}

export interface Presenca {
  id: string;
  aula_id: string;
  aluno_id: string;
  status: PresencaStatus;
  confirmado_pelo_aluno: boolean;
  marcado_em: string | null;
}

export interface Reposicao {
  id: string;
  aluno_id: string;
  aula_origem_id: string | null;
  turma_destino_id: string;
  data_destino: string;
  status: ReposicaoStatus;
  solicitado_em: string;
  resolvido_em: string | null;
}

export interface SolicitacaoVaga {
  id: string;
  nome: string;
  tipo: string;
  turma_id: string;
  status: SolicitacaoStatus;
  solicitado_em: string;
  resolvido_em: string | null;
  aluno_id: string | null;
}

export interface Oficina {
  id: string;
  nome: string;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  valor: number | null;
  max_participantes: number;
  status_pecas: StatusPecas;
  descricao: string | null;
  observacoes: string | null;
  receita: { item: string; peso: string }[];
  criado_em: string;
}

export interface OficinaParticipante {
  id: string;
  oficina_id: string;
  aluno_id: string | null;
  nome: string;
  telefone: string | null;
  email: string | null;
  tipo: ParticipanteTipo;
  dupla_com: string | null;
  pagamento: PagamentoStatus;
  confirmado: boolean;
  criado_em: string;
}

export interface Queima {
  id: string;
  forno_id: FornoFisico;
  status: FornadaStatusDB;
  tipo: TipoQueima;
  tipo_descricao: string | null;
  categorias: ConteudoCategoria[];
  detalhes_conteudo: string | null;
  temperatura_inicial: number;
  temperatura_maxima: number;
  velocidade_aquecimento: number;
  tempo_patamar_min: number;
  velocidade_resfriamento: number;
  temperatura_segura: number;
  iniciado_em: string | null;
  finalizado_em: string | null;
  etapa_atual: EtapaQueimaDB;
  temperatura_real: number | null;
  temperatura_real_em: string | null;
  criado_por: string | null;
  criado_em: string;
}

export interface QueimaObservacao {
  id: string;
  queima_id: string;
  texto: string;
  registrado_em: string;
}

export interface QueimaConteudo {
  id: string;
  queima_id: string;
  categoria: ConteudoCategoria;
  aluno_id: string | null;
  turma_id: string | null;
  oficina_id: string | null;
  cliente_nome: string | null;
  quantidade: number;
  valor: number | null;
  pagamento: PagamentoStatus | null;
}

export interface QueimaLeitura {
  id: string;
  queima_id: string;
  temperatura: number;
  registrado_em: string;
}

export interface Notificacao {
  id: string;
  destinatario_id: string | null;
  tipo: NotificacaoTipo;
  titulo: string;
  mensagem: string;
  lida: boolean;
  link: string | null;
  criado_em: string;
  canal_whatsapp_enviado: boolean;
}

export interface Pagamento {
  id: string;
  aluno_id: string | null;
  turma_id: string | null;
  tipo: PagamentoTipo;
  descricao: string | null;
  valor: number | null;
  status: PagamentoStatus;
  vencimento: string | null;
  pago_em: string | null;
  criado_em: string;
}

export interface Aviso {
  id: string;
  texto: string;
  destinatario: AvisoDestinatario;
  criado_por: string | null;
  criado_em: string;
  ativo: boolean;
}

// Formato exigido pelo `GenericSchema`/`GenericTable` do postgrest-js —
// `Relationships` é obrigatório mesmo sem FK modeladas aqui (achado
// 2026-09-21: sem isso, `Database["public"]` não satisfaz `GenericSchema`
// e o client Supabase silenciosamente perde o tipo, toda query devolvia
// `never`). Mesmo formato que `supabase gen types` geraria de verdade.
//
// **Cada `Row`/`Insert`/`Update` passa por `Prettify<T>`** — achado real
// 2026-09-23 (a versão anterior deste comentário, que culpava um helper
// genérico `TableOf<Row>`, estava certa por acidente mas errada na causa:
// o problema nunca foi "é genérico", foi que `Row: Profile` (referência a
// uma interface NOMEADA, mesmo sem generic nenhum envolvido) já quebra
// sozinho — confirmado isolando lado a lado `Row: Profile` (falha) vs.
// `Row: { id: string; role: ... }` (literal inline idêntico, funciona)
// num arquivo à parte). A cadeia de tipos condicionais aninhados do
// Supabase (GenericSchema → PostgrestClient → PostgrestQueryBuilder,
// várias camadas de `extends X ? Y : never`) não resolve uma referência
// nomeada a tempo e cai no branch `never`. `Prettify<T> = { [K in keyof
// T]: T[K] } & {}` força T a "achatar" numa forma anônima antes de entrar
// no Database — mesmo truque do `Prettify` que o próprio postgrest-js usa
// internamente (`node_modules/@supabase/postgrest-js/src/types/types.ts`).
// Runtime não é afetado — 100% um problema de tipos, ver CLAUDE.md §8.
type Prettify<T> = { [K in keyof T]: T[K] } & {};

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
  public: {
    Tables: {
      profiles: { Row: Prettify<Profile>; Insert: Prettify<Partial<Profile>>; Update: Prettify<Partial<Profile>>; Relationships: [] };
      turmas: { Row: Prettify<Turma>; Insert: Prettify<Partial<Turma>>; Update: Prettify<Partial<Turma>>; Relationships: [] };
      pacotes: { Row: Prettify<Pacote>; Insert: Prettify<Partial<Pacote>>; Update: Prettify<Partial<Pacote>>; Relationships: [] };
      matriculas: { Row: Prettify<Matricula>; Insert: Prettify<Partial<Matricula>>; Update: Prettify<Partial<Matricula>>; Relationships: [] };
      aulas: { Row: Prettify<Aula>; Insert: Prettify<Partial<Aula>>; Update: Prettify<Partial<Aula>>; Relationships: [] };
      presencas: { Row: Prettify<Presenca>; Insert: Prettify<Partial<Presenca>>; Update: Prettify<Partial<Presenca>>; Relationships: [] };
      reposicoes: { Row: Prettify<Reposicao>; Insert: Prettify<Partial<Reposicao>>; Update: Prettify<Partial<Reposicao>>; Relationships: [] };
      solicitacoes_vaga: { Row: Prettify<SolicitacaoVaga>; Insert: Prettify<Partial<SolicitacaoVaga>>; Update: Prettify<Partial<SolicitacaoVaga>>; Relationships: [] };
      oficinas: { Row: Prettify<Oficina>; Insert: Prettify<Partial<Oficina>>; Update: Prettify<Partial<Oficina>>; Relationships: [] };
      oficina_participantes: { Row: Prettify<OficinaParticipante>; Insert: Prettify<Partial<OficinaParticipante>>; Update: Prettify<Partial<OficinaParticipante>>; Relationships: [] };
      queimas: { Row: Prettify<Queima>; Insert: Prettify<Partial<Queima>>; Update: Prettify<Partial<Queima>>; Relationships: [] };
      queima_observacoes: { Row: Prettify<QueimaObservacao>; Insert: Prettify<Partial<QueimaObservacao>>; Update: Prettify<Partial<QueimaObservacao>>; Relationships: [] };
      queima_conteudo: { Row: Prettify<QueimaConteudo>; Insert: Prettify<Partial<QueimaConteudo>>; Update: Prettify<Partial<QueimaConteudo>>; Relationships: [] };
      queima_leituras: { Row: Prettify<QueimaLeitura>; Insert: Prettify<Partial<QueimaLeitura>>; Update: Prettify<Partial<QueimaLeitura>>; Relationships: [] };
      notificacoes: { Row: Prettify<Notificacao>; Insert: Prettify<Partial<Notificacao>>; Update: Prettify<Partial<Notificacao>>; Relationships: [] };
      pagamentos: { Row: Prettify<Pagamento>; Insert: Prettify<Partial<Pagamento>>; Update: Prettify<Partial<Pagamento>>; Relationships: [] };
      avisos: { Row: Prettify<Aviso>; Insert: Prettify<Partial<Aviso>>; Update: Prettify<Partial<Aviso>>; Relationships: [] };
    };
    Views: {};
    Functions: {};
  };
}
