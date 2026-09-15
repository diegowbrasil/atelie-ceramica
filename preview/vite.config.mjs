import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Preview local do demo/AtelieDemo.jsx fora do artifact do Claude.ai.
// Não editar AtelieDemo.jsx a partir daqui — isto só serve pra visualizar.
export default defineConfig({
  root: import.meta.dirname,
  plugins: [react()],
  server: {
    port: 5183,
    strictPort: true,
    fs: { allow: [".."] },
  },
});
