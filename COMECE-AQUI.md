# Comece aqui

Pacote de continuidade do projeto **Ateliê de Cerâmica**.

## Se você é uma IA retomando o projeto

Leia nesta ordem:

1. **`CONTEXTO.md`** — histórico de decisões, regras de negócio, preferências
   do cliente, backlog e armadilhas. Essencial.
2. **`demo/AtelieDemo.jsx`** — onde o trabalho está acontecendo hoje.
3. **`supabase/schema.sql`** — modelo de dados completo (fonte de verdade).
4. **`README.md`** — arquitetura do projeto Next.js.

Resumo de uma linha: existe um **demo React de arquivo único** (à frente, é
onde se trabalha) e um **projeto Next.js + Supabase** (base arquitetural,
desatualizado). O cliente testa o demo no celular.

## Se você é o Diego

Para continuar em outra sessão, faça upload deste pacote inteiro e peça algo
como:

> "Retome o projeto do ateliê. Leia o CONTEXTO.md e continue de onde parou."

Para só editar o demo, o arquivo é `demo/AtelieDemo.jsx`.

## Rodar o projeto Next.js (opcional, precisa de Node)

```bash
npm install
cp .env.local.example .env.local   # preencha com as chaves do Supabase
# rode supabase/schema.sql no SQL editor do Supabase
npm run dev
```

## Validar o demo depois de editar

```bash
npx esbuild demo/AtelieDemo.jsx --bundle=false --format=esm --outfile=/dev/null
```

Rode sempre. Erros de edição já quebraram o arquivo várias vezes.
