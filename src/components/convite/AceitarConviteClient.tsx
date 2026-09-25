"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { aceitarConvite } from "@/lib/actions/convite";

export function AceitarConviteClient({ token, nome }: { token: string; nome: string }) {
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, setPendente] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (senha !== confirmar) {
      setErro("As senhas não são iguais.");
      return;
    }
    setPendente(true);
    setErro(null);
    const resultado = await aceitarConvite(token, senha);
    if (!resultado.ok) {
      setErro(resultado.erro);
      setPendente(false);
      return;
    }
    router.push("/aluno");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <Card className="w-full max-w-sm animate-fade-up p-6">
        <span className="mb-1 block font-display text-2xl uppercase leading-none tracking-wide text-ink">MTCST</span>
        <p className="mb-6 text-sm text-ink-soft">Olá, {nome.split(" ")[0]}! Defina sua senha pra acessar sua conta.</p>

        <form onSubmit={enviar} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-soft">Senha (mín. 6 caracteres)</label>
            <input
              type="password"
              required
              minLength={6}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-soft">Confirmar senha</label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-accent"
            />
          </div>
          {erro && <p className="text-sm text-rose-500">{erro}</p>}
          <Button type="submit" className="w-full" disabled={pendente}>
            {pendente ? "Ativando..." : "Ativar minha conta"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
