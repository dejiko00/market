import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";

export default defineConfig({
  input: "src/server.ts",
  output: {
    dir: "dist",
    format: "esm",
    preserveModules: true,
    preserveModulesRoot: "src",
    sourcemap: true,
  },
  watch: {},
  external: ["bullmq", "typeorm", "pino"],
  plugins: [
    commonjs({}),
    nodeResolve({
      preferBuiltins: true,
    }),
    json(),
    typescript({
      tsconfig: "tsconfig.json",
    }),
  ],
});
