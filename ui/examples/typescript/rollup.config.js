import copy from "rollup-plugin-copy";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "rollup-plugin-typescript2";
import { terser } from "rollup-plugin-terser";

export default [
  {
    input: "src/app.ts",
    output: {
      file: "dist/app.js",
      format: "iife",
    },
    plugins: [
      nodeResolve(),
      typescript(),
      terser({
        compress: {
          pure_getters: true,
          unsafe: true,
          unsafe_comps: true,
          warnings: false,
        },
      }),
      copy({
        targets: [
          { src: "public/*", dest: "dist" },

          // Copy WASM resources to public location
          {
            src: "node_modules/@microblink/blinkid-in-browser-sdk/resources/*",
            dest: "dist",
          },

          // Copy UI resources to public location
          {
            src: "node_modules/@microblink/blinkid-in-browser-sdk/ui/dist/blinkid-in-browser/",
            dest: "dist",
          },
        ],
      }),
    ],
  },
];
