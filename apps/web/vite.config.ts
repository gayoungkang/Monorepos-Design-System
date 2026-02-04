import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import * as path from "node:path"
import { visualizer } from "rollup-plugin-visualizer"

export default defineConfig({
  plugins: [
    react(),

    visualizer({
      filename: "dist/stats.html",
      template: "treemap",
      gzipSize: true,
      brotliSize: true,
      open: false,
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  server: {
    port: 3000,
  },

  build: {
    outDir: "dist",
    sourcemap: true,
    minify: "esbuild",

    rollupOptions: {
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) return "vendor"
        },
      },
    },
  },
})
