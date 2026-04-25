import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  base: "./",

  server: {
    proxy: {
      "/api": {
        target: "https://d36bbfu262j7b7.cloudfront.net",
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    outDir: "dist",
    minify: 'terser',
  },
});