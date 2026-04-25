// frontend/vite.config.mts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  // 🔥 VERY IMPORTANT for S3 deployment
  base: "./",

  server: {
    proxy: {
      "/api": {
        target: "http://13.206.109.35:8000", // your EC2 backend
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    outDir: "dist",
  },
});