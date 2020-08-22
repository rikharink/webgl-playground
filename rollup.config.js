import { terser } from "rollup-plugin-terser";
import typescript from "@rollup/plugin-typescript";
import html from "@rollup/plugin-html";
import livereload from "rollup-plugin-livereload";
import dev from "rollup-plugin-dev";
import postcss from "rollup-plugin-postcss";
import image from "@rollup/plugin-image";
import glslify from "rollup-plugin-glslify";
import { nodeResolve } from '@rollup/plugin-node-resolve';

const env = process.env.NODE_ENV || "development";

let plugins = [
  nodeResolve(),
  glslify({
    compress: false,
  }),
  image(),
  postcss({
    extract: true,
    minimize: true,
    path: "./",
    plugins: [],
  }),
  typescript(),
  terser({
    compress: {
      passes: 4,
      unsafe: true,
      unsafe_arrows: true,
      unsafe_comps: true,
      unsafe_math: true,
    },
    ecma: 8,
    // mangle: false,
    mangle: {
      properties: {
        regex: /^_/,
      },
    },
  }),
  html({
    title: "WebGL Playground",
  }),
];

if (env === "development") {
  plugins.push(
    dev({
      dirs: ["dist"],
    })
  );
  plugins.push(
    livereload({
      watch: "dist",
    })
  );
}

export default {
  input: "src/main.ts",
  output: [
    {
      name: "prod",
      dir: "dist",
      format: "es",
      sourcemap: true,
      strict: false,
      plugins: [],
    },
  ],
  plugins: plugins,
};
