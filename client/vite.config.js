import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite konfigurace – nastavujeme React plugin a proxy pro API
// Proxy přesměruje /api/* requesty na backend server, abychom nemuseli psát celou URL
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
      },
    },
  },
});
