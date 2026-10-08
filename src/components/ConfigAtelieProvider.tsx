"use client";

import { createContext, useContext, type ReactNode } from "react";
import { CONFIG_PADRAO, type ConfigAtelie } from "@/lib/pacotes";

// Preços e chave Pix chegam do layout (servidor) uma vez só, em vez de
// passar por props até cada modal de pagamento.
const ConfigAtelieContext = createContext<ConfigAtelie>(CONFIG_PADRAO);

export function ConfigAtelieProvider({ config, children }: { config: ConfigAtelie; children: ReactNode }) {
  return <ConfigAtelieContext.Provider value={config}>{children}</ConfigAtelieContext.Provider>;
}

export function useConfigAtelie() {
  return useContext(ConfigAtelieContext);
}
