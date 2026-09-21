// Tipos manuais espelhando supabase/schema.sql.
// Em produção, substitua por `npm run supabase:types` (supabase gen types).

export type UserRole = "admin" | "aluno";
export type DiaSemana = "seg" | "ter" | "qua" | "qui" | "sex" | "sab" | "dom";
export type PacoteStatus = "ativo" | "ultima_aula" | "encerrado";
export type MatriculaStatus = "confirmado" | "pendente" | "recusado";
export type PresencaStatus = "presente" | "falta" | "reposicao" | "pendente";
export type ReposicaoStatus = "solicitada" | "aprovada" | "recusada" | "realizada";
export type PagamentoStatus = "pendente" | "pago" | "isento";
export type PagamentoTipo = "pacote" | "avulsa";
export type TipoQueima = "esmalte" | "biscoito" | "outro";
export type EtapaQueimaDB =
  | "aquecendo" | "maxima_atingida" | "patamar" | "resfriando"
  | "aguardando_segura" | "liberado_abrir" | "finalizada";
export type ConteudoCategoria = "alunos" | "oficinas" | "encomendas" | "fora" | "misturado";
export type NotificacaoTipo =
  | "ultima_aula" | "pacote_encerrado" | "solicitacao_vaga" | "solicitacao_reposicao"
  | "confirmacao_presenca" | "oficina_amanha" | "queima_iniciada" | "queima_finalizada"
  | "pecas_prontas";
export type AvisoDestinatario = "admin" | "alunos";

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

export interface Oficina {
  id: string;
  nome: string;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  valor: number;
  max_participantes: number;
  criado_em: string;
}

export interface OficinaParticipante {
  id: string;
  oficina_id: string;
  aluno_id: string | null;
  nome: string;
  telefone: string | null;
  email: string | null;
  pagamento: PagamentoStatus;
  confirmado: boolean;
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
type TableOf<Row, InsertRow = Partial<Row>, UpdateRow = Partial<Row>> = {
  Row: Row;
  Insert: InsertRow;
  Update: UpdateRow;
  Relationships: [];
};

// Placeholder para o client tipado do Supabase (`Database`).
// Ao rodar `supabase gen types`, este tipo é substituído pelo real.
export interface Database {
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
  public: {
    Tables: {
      profiles: TableOf<Profile>;
      turmas: TableOf<Turma>;
      pacotes: TableOf<Pacote>;
      matriculas: TableOf<Matricula>;
      aulas: TableOf<Aula>;
      presencas: TableOf<Presenca>;
      reposicoes: TableOf<Reposicao>;
      oficinas: TableOf<Oficina>;
      oficina_participantes: TableOf<OficinaParticipante>;
      queimas: TableOf<Queima>;
      queima_conteudo: TableOf<QueimaConteudo>;
      queima_leituras: TableOf<QueimaLeitura>;
      notificacoes: TableOf<Notificacao>;
      pagamentos: TableOf<Pagamento>;
      avisos: TableOf<Aviso>;
    };
    Views: {};
    Functions: {};
  };
}
