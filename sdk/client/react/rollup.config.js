const resolve = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const babel = require("rollup-plugin-babel");
const json = require("@rollup/plugin-json");

module.exports = [
  {
    input: "./index.jsx",
    output: [
      {
        dir: './build',
        // file: 'esm.js',
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins: [
      resolve(),
      babel({
        exclude: "node_modules/**",
        // babelHelpers: "bundled",
        presets: ['@babel/env', '@babel/preset-react'],
        plugins: ['@babel/plugin-transform-react-jsx']
      }),
      commonjs(),
      json(),
    ],
    // external: ['react', 'react-dom']
  },
];