// Cor de identidade por oficina — hash determinístico do id, já que
// oficinas não têm uma cor fixa como as 4 turmas (qualquer oficina nova
// pega uma cor, sem precisar cadastrar isso em lugar nenhum).

export type CorIdentidade = "sienna" | "ardosia" | "musgo" | "cafe";
export const CORES_ORDEM: CorIdentidade[] = ["sienna", "ardosia", "musgo", "cafe"];
export function corOficina(id: string): CorIdentidade {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return CORES_ORDEM[Math.abs(h) % CORES_ORDEM.length];
}
