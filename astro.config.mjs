import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// Landing estática: `npm run build` deja HTML/CSS listos en dist/ para subir a cualquier hosting.
export default defineConfig({
  vite: { plugins: [tailwindcss()] },
});
