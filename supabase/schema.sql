-- =========================================================
-- Ateliê de Cerâmica — Schema Supabase (Postgres)
-- =========================================================
-- Convenção: profiles.role define 'admin' | 'aluno'.
--
-- `profiles` NÃO é 1:1 com auth.users (revisado 2026-09-23, decisão do
-- Diego reagindo ao fluxo de "criar aluno": "precisa de email? nao pode
-- ser um usuario?"). A maioria dos alunos é só um registro cadastrado
-- pelo admin (nome, telefone, pacote) — nunca vai logar no app, não faz
-- sentido exigir conta. `auth_user_id` é opcional: só quem de fato loga
-- (admin sempre; aluno só quando/se a Área do Aluno existir de verdade e
-- ele aceitar um convite) tem um `auth.users` por trás. Primeira versão
-- do schema exigia isso pra TODO profile (`id references auth.users`) —
-- forçava criar uma conta "muda" com e-mail inventado só pra satisfazer a
-- FK, gambiarra que o Diego notou e pediu pra tirar antes de virar hábito.

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------
-- PERFIS
-- ---------------------------------------------------------
create type user_role as enum ('admin', 'aluno');

create table profiles (
  id uuid primary key default uuid_generate_v4(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  role user_role not null default 'aluno',
  nome text not null,
  telefone text,
  email text,
  foto_url text,
  criado_em timestamptz not null default now(),
  -- Convite pra Área do Aluno (2026-09-24, decisão do Diego: "convite por
  -- telefone/nome" — admin já cadastrou nome+telefone, aluno só define a
  -- própria senha depois via link, sem precisar recadastrar ninguém). Só
  -- um convite ativo por vez; limpo (volta a null) assim que aceito —
  -- não dá pra reusar o mesmo link duas vezes. Verificação/consumo
  -- inteiramente em código (src/lib/actions/convite.ts, service role),
  -- não em RLS — evita abrir uma policy de leitura pública em `profiles`.
  convite_token uuid,
  convite_expira_em timestamptz
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
  -- `false` = turma fixa do aluno. `true` = visita provisória a outra
  -- turma (mesmo aluno pode ter uma matrícula fixa + uma provisória ao
  -- mesmo tempo, em turmas diferentes — feature de "mover aluno" da UI,
  -- ver CLAUDE.md §5 Turmas "arrastar e soltar"). Adicionado 2026-09-23
  -- ao ligar dados reais — schema original não tinha como representar
  -- isso, achado ao mapear a tela real contra o schema antes de escrever
  -- as queries.
  provisorio boolean not null default false,
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

-- Fila de "Solicitações" da tela homônima — achado 2026-09-24 mapeando a
-- tela real: NÃO é o mesmo conceito de `reposicoes` acima. `reposicoes`
-- exige um `aluno_id` já cadastrado (matrícula existente pedindo reposição
-- de uma aula específica); a tela "Solicitações" trata pedido de vaga NOVA
-- (gente que ainda não é aluna) e reposição como a mesma coisa, de
-- propósito (CLAUDE.md §5 Solicitações, "simplificação deliberada") —
-- não dá pra forçar isso dentro de `reposicoes` sem inventar um aluno_id
-- que não existe. Tabela própria, mais simples, só pro fluxo atual;
-- `reposicoes` continua de pé pra uma versão futura mais rigorosa (aluno
-- de verdade pedindo reposição de uma aula específica que perdeu).
create type solicitacao_status as enum ('pendente', 'aprovada', 'recusada');

create table solicitacoes_vaga (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  tipo text not null,              -- texto livre: "Quer participar da turma" / "Solicitou reposição · Quinta 18:30"
  turma_id uuid not null references turmas(id) on delete cascade,
  status solicitacao_status not null default 'pendente',
  solicitado_em timestamptz not null default now(),
  resolvido_em timestamptz,
  -- Preenchido só quando a solicitação vem de um aluno de verdade logado
  -- na Área do Aluno (2026-09-24) — null pras solicitações mockadas
  -- antigas/entradas manuais do admin, que só têm o `nome` livre. Existir
  -- separado de `nome` (em vez de substituir) evita quebrar o fluxo já
  -- existente de aprovar solicitação sem aluno_id.
  aluno_id uuid references profiles(id) on delete cascade
);

-- ---------------------------------------------------------
-- OFICINAS
-- ---------------------------------------------------------
-- Status das peças (CLAUDE.md §5 Oficinas: "Em secagem → Biscoitadas →
-- Esmaltadas → Prontas p/ retirada. Só admin altera") — achado 2026-09-24
-- mapeando a tela real: faltava por completo no schema original.
create type status_pecas as enum ('secagem', 'biscoitadas', 'esmaltadas', 'prontas');

create table oficinas (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  data date not null,
  hora_inicio time not null,
  hora_fim time not null,
  valor numeric(10,2),                  -- opcional (CLAUDE.md: "valor por pessoa (opcional)")
  max_participantes int not null,
  status_pecas status_pecas not null default 'secagem',
  descricao text,
  observacoes text,
  -- Receita da oficina (peça → gramas de argila) — só consulta, não editável
  -- pela UI hoje (CLAUDE.md §5 Oficinas). Formato: [{"item": "Cumbuca",
  -- "peso": "650 g de argila"}, ...]. Null/[] pras oficinas sem receita
  -- cadastrada ainda.
  receita jsonb not null default '[]',
  criado_em timestamptz not null default now()
);

create type pagamento_status as enum ('pendente','pago','isento');
-- Individual ou dupla (CLAUDE.md §5 Oficinas: "individual/dupla, dupla-com").
create type participante_tipo as enum ('individual', 'dupla');

create table oficina_participantes (
  id uuid primary key default uuid_generate_v4(),
  oficina_id uuid not null references oficinas(id) on delete cascade,
  aluno_id uuid references profiles(id),      -- pode ser null (participante avulso)
  nome text not null,
  telefone text,
  email text,
  tipo participante_tipo not null default 'individual',
  dupla_com text,                       -- nome livre, não precisa ser aluno cadastrado
  pagamento pagamento_status not null default 'pendente',
  confirmado boolean not null default false,
  -- ordem de inscrição — não existe "número de vaga" persistido (mesma
  -- decisão de matriculas/`solicitado_em` em Turmas), a UI numera as
  -- vagas em ordem de chegada e preenche o resto como vazio até
  -- `max_participantes`.
  criado_em timestamptz not null default now()
);

-- ---------------------------------------------------------
-- PAGAMENTOS (histórico de cobrança — pacotes e aulas avulsas)
-- ---------------------------------------------------------
create type pagamento_tipo as enum ('pacote', 'avulsa');

create table pagamentos (
  id uuid primary key default uuid_generate_v4(),
  aluno_id uuid references profiles(id) on delete set null,
  turma_id uuid references turmas(id),
  tipo pagamento_tipo not null default 'pacote',
  descricao text,                       -- ex: "Pacote 4 aulas"
  valor numeric(10,2),                  -- null = valor ainda não informado
  status pagamento_status not null default 'pendente',
  vencimento date,
  pago_em timestamptz,
  criado_em timestamptz not null default now()
);

-- ---------------------------------------------------------
-- FORNO / QUEIMAS
-- ---------------------------------------------------------
create type tipo_queima as enum ('esmalte','biscoito','outro');
create type etapa_queima as enum (
  'aquecendo','maxima_atingida','patamar','resfriando',
  'aguardando_segura','liberado_abrir','finalizada'
);
-- Qual dos 2 fornos físicos de verdade do ateliê (CLAUDE.md §5, "o ateliê
-- tem 2 fornos físicos de verdade") — achado 2026-09-24 mapeando a tela
-- real contra o schema: faltava por completo, sem isso não dá nem pra
-- saber de qual forno uma queima é. Enum (não uma tabela `fornos`) porque
-- são sempre exatamente 2, fixos — não é dado que o admin cadastra.
create type forno_fisico as enum ('forno1', 'forno2');
-- Status da FORNADA como registro — dimensão diferente de `etapa_atual`
-- (que é o progresso DENTRO de uma queima em andamento: aquecendo →
-- ... → finalizada). "Interrompida" (substituída por uma fornada nova no
-- mesmo forno) e "cancelada" (ação explícita do admin) não são etapas
-- naturais de uma queima, são estados finais que uma fornada pode
-- assumir em vez de terminar normalmente — não dá pra derivar de
-- `etapa_atual` sozinho.
create type fornada_status as enum ('andamento', 'finalizada', 'interrompida', 'cancelada');
create type conteudo_categoria as enum ('alunos','oficinas','encomendas','fora','misturado');

create table queimas (
  id uuid primary key default uuid_generate_v4(),
  forno_id forno_fisico not null default 'forno1',
  status fornada_status not null default 'andamento',
  tipo tipo_queima not null,
  tipo_descricao text,                  -- usado quando tipo = 'outro'
  -- seleção múltipla de categorias (CLAUDE.md §5 Forno, "seleção
  -- múltipla... sem categoria misturado") + campo livre — versão
  -- simplificada que a UI usa hoje. `queima_conteudo` abaixo é um
  -- modelo mais detalhado (item a item) pra uma tela futura, não some.
  categorias conteudo_categoria[] not null default '{}',
  detalhes_conteudo text,
  temperatura_inicial numeric not null default 25,
  temperatura_maxima numeric not null,
  velocidade_aquecimento numeric not null,   -- °C/min
  tempo_patamar_min int not null default 0,
  velocidade_resfriamento numeric not null,  -- °C/min
  temperatura_segura numeric not null default 80,
  iniciado_em timestamptz,
  finalizado_em timestamptz,
  etapa_atual etapa_queima not null default 'aquecendo',
  temperatura_real numeric,             -- última leitura manual/sensor
  temperatura_real_em timestamptz,
  criado_por uuid references profiles(id),
  criado_em timestamptz not null default now()
);

-- Observações com timestamp, adicionáveis durante toda a queima
-- (CLAUDE.md §5 Forno) — precisa ser uma lista, não um campo de texto
-- único (o schema original só tinha `queimas.observacoes text`, achado
-- 2026-09-24 mapeando a tela real). Mesmo formato de `queima_leituras`
-- logo abaixo, mesmo propósito (histórico cronológico por queima).
create table queima_observacoes (
  id uuid primary key default uuid_generate_v4(),
  queima_id uuid not null references queimas(id) on delete cascade,
  texto text not null,
  registrado_em timestamptz not null default now()
);

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
-- AVISOS (banner fixado no topo do Dashboard — livre, sem tipo automático;
-- diferente de `notificacoes`, que é pra alertas tipados do sistema)
-- ---------------------------------------------------------
create type aviso_destinatario as enum ('admin', 'alunos');

create table avisos (
  id uuid primary key default uuid_generate_v4(),
  texto text not null,
  destinatario aviso_destinatario not null default 'admin',
  criado_por uuid references profiles(id),
  criado_em timestamptz not null default now(),
  ativo boolean not null default true
);

-- ---------------------------------------------------------
-- ÍNDICES
-- ---------------------------------------------------------
create index idx_pacotes_aluno on pacotes(aluno_id);
create index idx_matriculas_turma on matriculas(turma_id);
create index idx_presencas_aula on presencas(aula_id);
create index idx_notificacoes_destinatario on notificacoes(destinatario_id, lida);
create index idx_queimas_etapa on queimas(etapa_atual) where etapa_atual <> 'finalizada';
create index idx_pagamentos_aluno on pagamentos(aluno_id);
create index idx_pagamentos_pendentes on pagamentos(status) where status = 'pendente';
create index idx_avisos_ativos on avisos(destinatario) where ativo;

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
alter table solicitacoes_vaga enable row level security;
alter table oficinas enable row level security;
alter table oficina_participantes enable row level security;
alter table queimas enable row level security;
alter table queima_observacoes enable row level security;
alter table queima_conteudo enable row level security;
alter table queima_leituras enable row level security;
alter table notificacoes enable row level security;
alter table pagamentos enable row level security;
alter table avisos enable row level security;

-- helper: função que checa se o usuário logado é admin
create or replace function is_admin() returns boolean as $$
  select exists (
    select 1 from profiles where auth_user_id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- helper: id em `profiles` do usuário logado (não é mais igual a
-- auth.uid() — profiles.id tem UUID próprio, ver comentário no topo do
-- arquivo). Null se o usuário logado não tiver profile (não deveria
-- acontecer na prática, mas as policies abaixo tratam esse caso como
-- "não é dono de nada" naturalmente, já que nenhum aluno_id bate com null).
create or replace function current_profile_id() returns uuid as $$
  select id from profiles where auth_user_id = auth.uid();
$$ language sql security definer stable;

-- profiles: usuário vê o próprio perfil; admin vê todos
create policy "profiles_select" on profiles for select
  using (auth_user_id = auth.uid() or is_admin());
create policy "profiles_update_self" on profiles for update
  using (auth_user_id = auth.uid() or is_admin());
create policy "profiles_admin_insert" on profiles for insert
  with check (is_admin() or auth_user_id = auth.uid());
create policy "profiles_admin_delete" on profiles for delete using (is_admin());

-- turmas: leitura pública (autenticado); escrita só admin
create policy "turmas_select" on turmas for select using (auth.uid() is not null);
create policy "turmas_admin_write" on turmas for all using (is_admin()) with check (is_admin());

-- pacotes: aluno vê os próprios; admin vê/edita todos
create policy "pacotes_select" on pacotes for select
  using (aluno_id = current_profile_id() or is_admin());
create policy "pacotes_admin_write" on pacotes for all
  using (is_admin()) with check (is_admin());

-- matrículas: aluno vê/solicita as próprias; admin tudo (inclusive
-- insert/delete — achado real 2026-09-24 testando "cadastrar aluno" ao
-- vivo: `for update` sozinho deixava passar editar mas não criar uma
-- matrícula nova pro admin, `cadastrarAluno`/`moverAluno` em turmas.ts
-- fazem insert direto. Mesmo padrão `for all` que toda outra tabela já
-- usa pro admin — essa tinha ficado pra trás.)
create policy "matriculas_select" on matriculas for select
  using (aluno_id = current_profile_id() or is_admin());
create policy "matriculas_aluno_insert" on matriculas for insert
  with check (aluno_id = current_profile_id() and status = 'pendente');
create policy "matriculas_admin_write" on matriculas for all
  using (is_admin()) with check (is_admin());

-- aulas: leitura autenticada; escrita admin
create policy "aulas_select" on aulas for select using (auth.uid() is not null);
create policy "aulas_admin_write" on aulas for all using (is_admin()) with check (is_admin());

-- presenças: aluno vê/confirma as próprias; admin tudo
create policy "presencas_select" on presencas for select
  using (aluno_id = current_profile_id() or is_admin());
create policy "presencas_aluno_confirma" on presencas for update
  using (aluno_id = current_profile_id())
  with check (aluno_id = current_profile_id());
create policy "presencas_admin_write" on presencas for all
  using (is_admin()) with check (is_admin());

-- reposições: aluno solicita/vê as próprias; admin aprova/recusa
create policy "reposicoes_select" on reposicoes for select
  using (aluno_id = current_profile_id() or is_admin());
create policy "reposicoes_aluno_insert" on reposicoes for insert
  with check (aluno_id = current_profile_id());
create policy "reposicoes_admin_update" on reposicoes for update
  using (is_admin());

-- solicitações: admin vê/edita tudo; aluno só cria em nome próprio
-- (Área do Aluno, 2026-09-24) — não pode ler as dos outros nem marcar
-- aprovada/recusada sozinho.
create policy "solicitacoes_vaga_admin_all" on solicitacoes_vaga for all
  using (is_admin()) with check (is_admin());
create policy "solicitacoes_vaga_aluno_insert" on solicitacoes_vaga for insert
  with check (aluno_id = current_profile_id());
-- Aluno cancela a própria solicitação, só enquanto ainda está pendente
-- (2026-09-25, "q ela consiga cancelar ou editar a solicitação" — editar
-- vira cancelar + reenviar na UI, não um formulário de edição separado).
create policy "solicitacoes_vaga_aluno_delete" on solicitacoes_vaga for delete
  using (aluno_id = current_profile_id() and status = 'pendente');

-- oficinas: leitura autenticada; escrita admin
create policy "oficinas_select" on oficinas for select using (auth.uid() is not null);
create policy "oficinas_admin_write" on oficinas for all using (is_admin()) with check (is_admin());
create policy "oficina_participantes_select" on oficina_participantes for select
  using (aluno_id = current_profile_id() or is_admin());
create policy "oficina_participantes_admin_write" on oficina_participantes for all
  using (is_admin()) with check (is_admin());

-- forno: somente admin (ferramenta exclusiva do ateliê)
create policy "queimas_admin_all" on queimas for all using (is_admin()) with check (is_admin());
create policy "queima_observacoes_admin_all" on queima_observacoes for all using (is_admin()) with check (is_admin());
create policy "queima_conteudo_admin_all" on queima_conteudo for all using (is_admin()) with check (is_admin());
create policy "queima_leituras_admin_all" on queima_leituras for all using (is_admin()) with check (is_admin());

-- notificações: cada um vê as suas; admin vê todas (inclusive broadcast)
create policy "notificacoes_select" on notificacoes for select
  using (destinatario_id = current_profile_id() or destinatario_id is null or is_admin());
create policy "notificacoes_admin_write" on notificacoes for all
  using (is_admin()) with check (is_admin());
create policy "notificacoes_aluno_marca_lida" on notificacoes for update
  using (destinatario_id = current_profile_id())
  with check (destinatario_id = current_profile_id());

-- pagamentos: aluno vê os próprios (read-only); admin vê/edita todos
create policy "pagamentos_select" on pagamentos for select
  using (aluno_id = current_profile_id() or is_admin());
create policy "pagamentos_admin_write" on pagamentos for all
  using (is_admin()) with check (is_admin());

-- avisos: "para alunos" é visível a qualquer autenticado; "para admin" só admin.
-- Escrita sempre admin (é quem cria o aviso, pros dois destinatários).
create policy "avisos_select" on avisos for select
  using ((destinatario = 'alunos' and auth.uid() is not null) or (destinatario = 'admin' and is_admin()));
create policy "avisos_admin_write" on avisos for all
  using (is_admin()) with check (is_admin());
