# Ateliê de Cerâmica — Central de Gestão

PWA em Next.js 14 (App Router) + TypeScript + Tailwind + Supabase.

## Como rodar

```bash
npm install
cp .env.local.example .env.local   # preencha com as chaves do seu projeto Supabase
# no SQL editor do Supabase, rode nesta ordem:
#   1. supabase/schema.sql
npm run dev
```

Crie o primeiro usuário admin manualmente: cadastre-se pela tela de login (isso
cria o registro em `auth.users`) e depois, no SQL editor do Supabase, rode:

```sql
update profiles set role = 'admin' where email = 'seu-email@exemplo.com';
```

## Arquitetura

**Stack:** Next.js (App Router, Server Components por padrão) · TypeScript ·
Tailwind · Supabase (Auth + Postgres + Storage) · `next-pwa` para o manifesto
e service worker · Recharts para o gráfico de queima · date-fns para datas.

**Por que essa combinação:** Server Components buscam dados direto do
Supabase sem expor lógica de query no cliente; RLS no Postgres garante que um
aluno nunca leia dados de outro aluno mesmo se a UI tiver bug; Client
Components ficam só onde há interação/tempo-real (o timer do forno, os
formulários).

**Papéis:** dois únicos perfis (`admin`, `aluno`) definidos em
`profiles.role`. O `middleware.ts` bloqueia rotas administrativas para quem
não é admin, e o RLS faz a mesma checagem no banco (defesa em profundidade —
nunca confie só no middleware).

**Rotas:**
```
/login                      pública
/(admin)/dashboard          admin
/(admin)/turmas/[turmaId]   admin
/(admin)/alunos             admin — a implementar (ver abaixo)
/(admin)/oficinas           admin — a implementar
/(admin)/forno              admin
/(admin)/solicitacoes       admin — a implementar
/(admin)/pagamentos         admin — a implementar
/(admin)/relatorios         admin — a implementar
/(admin)/configuracoes      admin — a implementar
/(aluno)/aluno              aluno — a implementar
```

**Banco de dados:** ver `supabase/schema.sql` — cobre turmas, pacotes,
matrículas, aulas/presenças, reposições, oficinas, queimas (+ conteúdo do
forno e leituras) e notificações, todas com RLS. É o schema completo do
sistema descrito no briefing, incluindo as tabelas das telas que ainda não
têm UI pronta.

**Regra de negócio mais sensível — o forno:** toda a previsão (temperatura
estimada, % até a máxima, horário previsto da máxima, horário seguro para
abrir) é pura função de `(parâmetros da queima, agora)` — ver
`src/lib/forno.ts`. Quando o admin informa uma temperatura real, ela vira o
novo ponto de partida do cálculo (`ultimaLeitura`), recalibrando toda a curva
sem precisar de outra lógica: é a mesma função, só com outro parâmetro. Isso
é o que a tela chama de "recalcular toda a previsão".

**Componentes reutilizáveis:** `src/components/ui/*` (Button, Card, Badge,
Avatar, ProgressRing) são a base de todas as telas — nenhuma tela deve
estilizar botão/card do zero. `ProgressRing` é o elemento-assinatura visual
do produto (o arco de progresso do forno), reaproveitado no Dashboard e no
Forno.

## Já implementado nesta entrega

- Schema completo do banco + RLS (`supabase/schema.sql`)
- Design system (`tailwind.config.ts`, `globals.css`)
- Componentes de UI base + layout (Sidebar desktop / tab bar mobile)
- **Dashboard** completo (KPIs, card de forno ao vivo, próximas oficinas,
  pacotes terminando, solicitações pendentes)
- **Turmas** completo (grid de 12 vagas, cartão de detalhes, solicitações)
- **Forno** completo (timer inteligente, etapas, atualização de temperatura
  real, gráfico estimado × real, conteúdo do forno)
- Login com roteamento por perfil
- Motor de cálculo do forno isolado e testável (`src/lib/forno.ts`)

## Próximos passos (mesma arquitetura, é só repetir o padrão)

1. **Alunos** — CRUD com formulário (nome, foto via Supabase Storage,
   telefone, e-mail, turma fixa, pacote, histórico, observações). Reusa
   `Card`, `Avatar`, `Badge`.
2. **Oficinas** — cadastro + lista de participantes com pagamento/confirmação;
   um cron/Edge Function lê `oficinas.data` e cria `notificacoes` do tipo
   `oficina_amanha` um dia antes (a tabela já está pronta para plugar
   WhatsApp: `notificacoes.canal_whatsapp_enviado`).
3. **Solicitações** — feed único que junta `matriculas.status = 'pendente'`
   e `reposicoes.status = 'solicitada'`, com os botões Aprovar/Recusar que já
   existem como exemplo na tela de Turmas.
4. **Aluno (login do aluno)** — versão simplificada da Turma (só a própria
   vaga), tela de "aulas restantes" (lê `pacotes`), histórico e oficinas.
5. **Notificações** — sino no header lendo `notificacoes` do usuário logado,
   Supabase Realtime (`supabase.channel(...).on('postgres_changes', ...)`)
   para atualizar sem polling.
6. **Pagamentos / Relatórios / Configurações** — telas de leitura sobre as
   tabelas já existentes (`oficina_participantes.pagamento`,
   `queima_conteudo.pagamento`).

## Convenções para manter o código limpo

- Toda tela nova sob `/(admin)` herda a Sidebar/MobileNav automaticamente.
- Nunca duplique estilo de card/badge/botão — estenda `src/components/ui`.
- Mutations (aprovar solicitação, iniciar queima, marcar presença) devem
  virar Server Actions (`"use server"`) próximas da tela que as usa, para
  manter a lógica de negócio fora dos componentes de UI.
- Qualquer novo tipo de notificação entra no enum `notificacao_tipo` do
  schema e no `NotificacaoTipo` de `src/types/database.ts`.
