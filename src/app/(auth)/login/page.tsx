"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { emailSinteticoDoTelefone } from "@/lib/telefone";
import { FUNDOS_ARGILA } from "@/lib/fundosArgila";

// Um campo só, "e-mail ou telefone" — admin loga com e-mail, aluno com
// telefone (a leva de dado real nunca trouxe e-mail de aluno, ver
// src/lib/actions/convite.ts). Detecta pelo formato em vez de duas telas/
// um seletor: tem "@" → e-mail; senão, número de telefone → vira o mesmo
// e-mail sintético que `aceitarConvite` já usou pra criar a conta (não
// usa o provider nativo de Phone do Supabase, ver comentário em
// convite.ts — exige Twilio configurado até só pra auth por senha).

export default function LoginPage() {
  const router = useRouter();
  const [identificador, setIdentificador] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro(null);

    const supabase = createClient();
    const ehEmail = identificador.includes("@");
    const { data, error } = ehEmail
      ? await supabase.auth.signInWithPassword({ email: identificador.trim(), password: senha })
      : await supabase.auth.signInWithPassword({ email: emailSinteticoDoTelefone(identificador), password: senha });

    if (error) {
      setErro("Credenciais inválidas.");
      setCarregando(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("auth_user_id", data.user.id)
      .single();

    router.push(profile?.role === "admin" ? "/dashboard" : "/aluno");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <Card
        className="w-full max-w-sm animate-fade-up overflow-hidden border-carvao/40 p-2"
        style={{ backgroundImage: `url(${FUNDOS_ARGILA.carvao})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="rounded-xl bg-white p-6">
          <span className="mb-1 block font-display text-2xl uppercase leading-none tracking-wide text-ink">MTCST</span>
          <p className="mb-6 text-sm text-ink-soft">Entre para acessar sua conta.</p>

          <form onSubmit={entrar} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">E-mail ou telefone</label>
              <input
                type="text"
                required
                value={identificador}
                onChange={(e) => setIdentificador(e.target.value)}
                placeholder="seu@email.com ou (14) 99999-9999"
                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">Senha</label>
              <input
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </div>
            {erro && <p className="text-sm text-rose-500">{erro}</p>}
            <Button type="submit" className="w-full" disabled={carregando}>
              {carregando ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
