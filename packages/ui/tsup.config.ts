import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/public.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  target: "esnext",
  tsconfig: "tsconfig.build.json",
  external: ["react", "react-dom", "styled-components"],
})
