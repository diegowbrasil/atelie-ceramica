import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

/** Cliente Supabase para uso em Server Components / Route Handlers. */
export function createClient() {
  const cookieStore = cookies();

  // `getAll`/`setAll` (não mais `get`/`set`/`remove`, ver middleware.ts).
  // `setAll` pode ser chamado de dentro de um Server Component, onde
  // `cookieStore.set` lança — ignorado de propósito, o middleware cuida
  // do refresh de sessão nesse caso.
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // chamado de um Server Component — middleware cuida do refresh
          }
        },
      },
    }
  );
}
