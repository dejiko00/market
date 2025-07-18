import { defineConfig } from "rollup";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";

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
  external: ["typeorm", "pino", "pino-http"],
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
