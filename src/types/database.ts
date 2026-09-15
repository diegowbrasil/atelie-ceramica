// Tipos manuais espelhando supabase/schema.sql.
// Em produção, substitua por `npm run supabase:types` (supabase gen types).

export type UserRole = "admin" | "aluno";
export type DiaSemana = "seg" | "ter" | "qua" | "qui" | "sex" | "sab" | "dom";
export type PacoteStatus = "ativo" | "ultima_aula" | "encerrado";
export type MatriculaStatus = "confirmado" | "pendente" | "recusado";
export type PresencaStatus = "presente" | "falta" | "reposicao" | "pendente";
export type ReposicaoStatus = "solicitada" | "aprovada" | "recusada" | "realizada";
export type PagamentoStatus = "pendente" | "pago" | "isento";
export type TipoQueima = "esmalte" | "biscoito" | "outro";
export type EtapaQueimaDB =
  | "aquecendo" | "maxima_atingida" | "patamar" | "resfriando"
  | "aguardando_segura" | "liberado_abrir" | "finalizada";
export type ConteudoCategoria = "alunos" | "oficinas" | "encomendas" | "fora" | "misturado";
export type NotificacaoTipo =
  | "ultima_aula" | "pacote_encerrado" | "solicitacao_vaga" | "solicitacao_reposicao"
  | "confirmacao_presenca" | "oficina_amanha" | "queima_iniciada" | "queima_finalizada"
  | "pecas_prontas";

export interface Profile {
  id: string;
  role: UserRole;
  nome: string;
  telefone: string | null;
  email: string | null;
  foto_url: string | null;
  criado_em: string;
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
  solicitado_em: string;
}

export interface Queima {
  id: string;
  tipo: TipoQueima;
  tipo_descricao: string | null;
  temperatura_inicial: number;
  temperatura_maxima: number;
  velocidade_aquecimento: number;
  tempo_patamar_min: number;
  velocidade_resfriamento: number;
  temperatura_segura: number;
  observacoes: string | null;
  iniciado_em: string | null;
  finalizado_em: string | null;
  etapa_atual: EtapaQueimaDB;
  temperatura_real: number | null;
  temperatura_real_em: string | null;
  criado_por: string | null;
  criado_em: string;
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

// Placeholder para o client tipado do Supabase (`Database`).
// Ao rodar `supabase gen types`, este tipo é substituído pelo real.
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      turmas: { Row: Turma; Insert: Partial<Turma>; Update: Partial<Turma> };
      pacotes: { Row: Pacote; Insert: Partial<Pacote>; Update: Partial<Pacote> };
      matriculas: { Row: Matricula; Insert: Partial<Matricula>; Update: Partial<Matricula> };
      queimas: { Row: Queima; Insert: Partial<Queima>; Update: Partial<Queima> };
      notificacoes: { Row: Notificacao; Insert: Partial<Notificacao>; Update: Partial<Notificacao> };
      [key: string]: { Row: any; Insert: any; Update: any };
    };
  };
}
