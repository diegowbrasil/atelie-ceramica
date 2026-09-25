import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Protege rotas por perfil:
 *  - /forno, /alunos, /oficinas, /relatorios, /configuracoes → só admin
 *  - /aluno/**                                                → só aluno logado
 *  - qualquer rota autenticada exige sessão válida
 */
const ADMIN_ONLY = ["/dashboard", "/turmas", "/forno", "/alunos", "/oficinas", "/relatorios", "/pagamentos", "/configuracoes"];

export async function middleware(request: NextRequest) {
  // `getAll`/`setAll` (não mais `get`/`set`/`remove`, removido em versões
  // recentes do @supabase/ssr — achado 2026-09-22/23 ao investigar o erro
  // de tipo `never` pré-existente em login/page.tsx, ver PROGRESS.md).
  // Recriar `response` depois de escrever nos cookies da REQUEST é o
  // padrão oficial: os Server Components desta mesma requisição enxergam
  // os cookies atualizados via `request`, e o navegador via `response`.
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // /convite/[token] é a página pública de aceitar convite (2026-09-24) —
  // por definição ninguém está logado ainda nesse fluxo.
  const publica = path === "/login" || path.startsWith("/convite");

  if (!user && !publica) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && ADMIN_ONLY.some((p) => path.startsWith(p))) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("auth_user_id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/aluno", request.url));
    }
  }

  return response;
}

// A lista antiga excluía nomes de arquivo específicos um a um
// (`favicon.ico`, `manifest.json`, `icons`) — "icons" nunca bateu com
// `/icon.svg` de verdade (falta o "s", achado 2026-09-25 testando o
// PWA em produção pela primeira vez: o ícone do manifest carregava
// redirecionado pro /login, já que o Middleware só passou a rodar de
// verdade nesta mesma sessão, ver armadilha em CLAUDE.md §8). Trocado
// por uma regra geral — qualquer caminho com extensão de arquivo
// estático (svg/jpg/png/json/js/ico/webmanifest) nunca precisa de
// sessão, cobre `/icon.svg`, `/fundos/*.jpg`, `/manifest.json`,
// `/sw.js`/`/workbox-*.js` (service worker do next-pwa) de uma vez só,
// sem precisar listar cada nome à mão de novo no futuro.
export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:svg|jpg|jpeg|png|gif|ico|json|js|webmanifest|txt|xml)$).*)"],
};
