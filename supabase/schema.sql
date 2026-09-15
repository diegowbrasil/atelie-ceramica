-- =========================================================
-- Ateliê de Cerâmica — Schema Supabase (Postgres)
-- =========================================================
-- Convenção: profiles.role define 'admin' | 'aluno'.
-- auth.users é gerenciado pelo Supabase Auth; profiles espelha 1:1.

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------
-- PERFIS
-- ---------------------------------------------------------
create type user_role as enum ('admin', 'aluno');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'aluno',
  nome text not null,
  telefone text,
  email text,
  foto_url text,
  criado_em timestamptz not null default now()
);

-- ---------------------------------------------------------
-- TURMAS (4 turmas fixas, 12 vagas cada)
-- ---------------------------------------------------------
create type dia_semana as enum ('seg','ter','qua','qui','sex','sab','dom');

create table turmas (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,               -- ex: "Terça 18:30"
  dia dia_semana not null,
  hora_inicio time not null,
  hora_fim time not null,
  capacidade int not null default 12,
  ativo boolean not null default true
);

-- ---------------------------------------------------------
-- PACOTES (4, 8, ou N aulas) por aluno
-- ---------------------------------------------------------
create type pacote_status as enum ('ativo','ultima_aula','encerrado');

create table pacotes (
  id uuid primary key default uuid_generate_v4(),
  aluno_id uuid not null references profiles(id) on delete cascade,
  turma_id uuid not null references turmas(id),
  total_aulas int not null,
  aulas_usadas int not null default 0,
  status pacote_status not null default 'ativo',
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- matrícula — vínculo aluno x turma (permite lista de espera / vaga)
create type matricula_status as enum ('confirmado','pendente','recusado');

create table matriculas (
  id uuid primary key default uuid_generate_v4(),
  turma_id uuid not null references turmas(id) on delete cascade,
  aluno_id uuid not null references profiles(id) on delete cascade,
  pacote_id uuid references pacotes(id),
  status matricula_status not null default 'pendente',
  solicitado_em timestamptz not null default now(),
  unique (turma_id, aluno_id)
);

-- ---------------------------------------------------------
-- AULAS (instância de uma turma em uma data) e PRESENÇAS
-- ---------------------------------------------------------
create table aulas (
  id uuid primary key default uuid_generate_v4(),
  turma_id uuid not null references turmas(id),
  data date not null,
  unique (turma_id, data)
);

create type presenca_status as enum ('presente','falta','reposicao','pendente');

create table presencas (
  id uuid primary key default uuid_generate_v4(),
  aula_id uuid not null references aulas(id) on delete cascade,
  aluno_id uuid not null references profiles(id) on delete cascade,
  status presenca_status not null default 'pendente',
  confirmado_pelo_aluno boolean not null default false,
  marcado_em timestamptz,
  unique (aula_id, aluno_id)
);

-- ---------------------------------------------------------
-- REPOSIÇÕES
-- ---------------------------------------------------------
create type reposicao_status as enum ('solicitada','aprovada','recusada','realizada');

create table reposicoes (
  id uuid primary key default uuid_generate_v4(),
  aluno_id uuid not null references profiles(id) on delete cascade,
  aula_origem_id uuid references aulas(id),      -- aula que gerou a falta (opcional)
  turma_destino_id uuid not null references turmas(id),
  data_destino date not null,
  status reposicao_status not null default 'solicitada',
  solicitado_em timestamptz not null default now(),
  resolvido_em timestamptz
);

-- ---------------------------------------------------------
-- OFICINAS
-- ---------------------------------------------------------
create table oficinas (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  data date not null,
  hora_inicio time not null,
  hora_fim time not null,
  valor numeric(10,2) not null default 0,
  max_participantes int not null,
  criado_em timestamptz not null default now()
);

create type pagamento_status as enum ('pendente','pago','isento');

create table oficina_participantes (
  id uuid primary key default uuid_generate_v4(),
  oficina_id uuid not null references oficinas(id) on delete cascade,
  aluno_id uuid references profiles(id),      -- pode ser null (participante avulso)
  nome text not null,
  telefone text,
  email text,
  pagamento pagamento_status not null default 'pendente',
  confirmado boolean not null default false
);

-- ---------------------------------------------------------
-- FORNO / QUEIMAS
-- ---------------------------------------------------------
create type tipo_queima as enum ('esmalte','biscoito','outro');
create type etapa_queima as enum (
  'aquecendo','maxima_atingida','patamar','resfriando',
  'aguardando_segura','liberado_abrir','finalizada'
);

create table queimas (
  id uuid primary key default uuid_generate_v4(),
  tipo tipo_queima not null,
  tipo_descricao text,                  -- usado quando tipo = 'outro'
  temperatura_inicial numeric not null default 25,
  temperatura_maxima numeric not null,
  velocidade_aquecimento numeric not null,   -- °C/min
  tempo_patamar_min int not null default 0,
  velocidade_resfriamento numeric not null,  -- °C/min
  temperatura_segura numeric not null default 80,
  observacoes text,
  iniciado_em timestamptz,
  finalizado_em timestamptz,
  etapa_atual etapa_queima not null default 'aquecendo',
  temperatura_real numeric,             -- última leitura manual/sensor
  temperatura_real_em timestamptz,
  criado_por uuid references profiles(id),
  criado_em timestamptz not null default now()
);

create type conteudo_categoria as enum ('alunos','oficinas','encomendas','fora','misturado');

create table queima_conteudo (
  id uuid primary key default uuid_generate_v4(),
  queima_id uuid not null references queimas(id) on delete cascade,
  categoria conteudo_categoria not null,
  aluno_id uuid references profiles(id),
  turma_id uuid references turmas(id),
  oficina_id uuid references oficinas(id),
  cliente_nome text,
  quantidade int not null default 1,
  valor numeric(10,2),
  pagamento pagamento_status
);

create table queima_leituras (
  -- histórico de temperaturas reais informadas, para o gráfico estimado x real
  id uuid primary key default uuid_generate_v4(),
  queima_id uuid not null references queimas(id) on delete cascade,
  temperatura numeric not null,
  registrado_em timestamptz not null default now()
);

-- ---------------------------------------------------------
-- NOTIFICAÇÕES (in-app; estrutura pronta para WhatsApp/push)
-- ---------------------------------------------------------
create type notificacao_tipo as enum (
  'ultima_aula','pacote_encerrado','solicitacao_vaga','solicitacao_reposicao',
  'confirmacao_presenca','oficina_amanha','queima_iniciada','queima_finalizada',
  'pecas_prontas'
);

create table notificacoes (
  id uuid primary key default uuid_generate_v4(),
  destinatario_id uuid references profiles(id) on delete cascade,  -- null = broadcast admin
  tipo notificacao_tipo not null,
  titulo text not null,
  mensagem text not null,
  lida boolean not null default false,
  link text,
  criado_em timestamptz not null default now(),
  -- integrações futuras
  canal_whatsapp_enviado boolean not null default false
);

-- ---------------------------------------------------------
-- ÍNDICES
-- ---------------------------------------------------------
create index idx_pacotes_aluno on pacotes(aluno_id);
create index idx_matriculas_turma on matriculas(turma_id);
create index idx_presencas_aula on presencas(aula_id);
create index idx_notificacoes_destinatario on notificacoes(destinatario_id, lida);
create index idx_queimas_etapa on queimas(etapa_atual) where etapa_atual <> 'finalizada';

-- ---------------------------------------------------------
-- RLS
-- ---------------------------------------------------------
alter table profiles enable row level security;
alter table turmas enable row level security;
alter table pacotes enable row level security;
alter table matriculas enable row level security;
alter table aulas enable row level security;
alter table presencas enable row level security;
alter table reposicoes enable row level security;
alter table oficinas enable row level security;
alter table oficina_participantes enable row level security;
alter table queimas enable row level security;
alter table queima_conteudo enable row level security;
alter table queima_leituras enable row level security;
alter table notificacoes enable row level security;

-- helper: função que checa se o usuário logado é admin
create or replace function is_admin() returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- profiles: usuário vê o próprio perfil; admin vê todos
create policy "profiles_select" on profiles for select
  using (id = auth.uid() or is_admin());
create policy "profiles_update_self" on profiles for update
  using (id = auth.uid() or is_admin());
create policy "profiles_admin_insert" on profiles for insert
  with check (is_admin() or id = auth.uid());

-- turmas: leitura pública (autenticado); escrita só admin
create policy "turmas_select" on turmas for select using (auth.uid() is not null);
create policy "turmas_admin_write" on turmas for all using (is_admin()) with check (is_admin());

-- pacotes: aluno vê os próprios; admin vê/edita todos
create policy "pacotes_select" on pacotes for select
  using (aluno_id = auth.uid() or is_admin());
create policy "pacotes_admin_write" on pacotes for all
  using (is_admin()) with check (is_admin());

-- matrículas: aluno vê/solicita as próprias; admin tudo
create policy "matriculas_select" on matriculas for select
  using (aluno_id = auth.uid() or is_admin());
create policy "matriculas_aluno_insert" on matriculas for insert
  with check (aluno_id = auth.uid() and status = 'pendente');
create policy "matriculas_admin_write" on matriculas for update
  using (is_admin());

-- aulas: leitura autenticada; escrita admin
create policy "aulas_select" on aulas for select using (auth.uid() is not null);
create policy "aulas_admin_write" on aulas for all using (is_admin()) with check (is_admin());

-- presenças: aluno vê/confirma as próprias; admin tudo
create policy "presencas_select" on presencas for select
  using (aluno_id = auth.uid() or is_admin());
create policy "presencas_aluno_confirma" on presencas for update
  using (aluno_id = auth.uid())
  with check (aluno_id = auth.uid());
create policy "presencas_admin_write" on presencas for all
  using (is_admin()) with check (is_admin());

-- reposições: aluno solicita/vê as próprias; admin aprova/recusa
create policy "reposicoes_select" on reposicoes for select
  using (aluno_id = auth.uid() or is_admin());
create policy "reposicoes_aluno_insert" on reposicoes for insert
  with check (aluno_id = auth.uid());
create policy "reposicoes_admin_update" on reposicoes for update
  using (is_admin());

-- oficinas: leitura autenticada; escrita admin
create policy "oficinas_select" on oficinas for select using (auth.uid() is not null);
create policy "oficinas_admin_write" on oficinas for all using (is_admin()) with check (is_admin());
create policy "oficina_participantes_select" on oficina_participantes for select
  using (aluno_id = auth.uid() or is_admin());
create policy "oficina_participantes_admin_write" on oficina_participantes for all
  using (is_admin()) with check (is_admin());

-- forno: somente admin (ferramenta exclusiva do ateliê)
create policy "queimas_admin_all" on queimas for all using (is_admin()) with check (is_admin());
create policy "queima_conteudo_admin_all" on queima_conteudo for all using (is_admin()) with check (is_admin());
create policy "queima_leituras_admin_all" on queima_leituras for all using (is_admin()) with check (is_admin());

-- notificações: cada um vê as suas; admin vê todas (inclusive broadcast)
create policy "notificacoes_select" on notificacoes for select
  using (destinatario_id = auth.uid() or destinatario_id is null or is_admin());
create policy "notificacoes_admin_write" on notificacoes for all
  using (is_admin()) with check (is_admin());
create policy "notificacoes_aluno_marca_lida" on notificacoes for update
  using (destinatario_id = auth.uid())
  with check (destinatario_id = auth.uid());
