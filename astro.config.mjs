import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// Landing estática: `npm run build` deja HTML/CSS listos en dist/ para subir a cualquier hosting.
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    // En desarrollo, /api/chat va al servicio de chat local (`node chat/server.mjs`, con LLM_PROVIDER=mock para probar).
    // En producción lo hace nginx (ver nginx.conf).
    server: { proxy: { "/api": "http://127.0.0.1:3000" } },
  },
});
