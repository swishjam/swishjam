// import * as path from 'path'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import babel from 'rollup-plugin-babel'
import json from '@rollup/plugin-json'
// import packageJson from './package.json' assert { type: 'json' }

const plugins = [
  // Resolve modules from node_modules
  resolve({
    preferBuiltins: false,
    mainFields: ['module', 'main', 'jsnext:main', 'browser'],
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  }),
  json(),
  babel({
    exclude: 'node_modules/**',
    presets: ['@babel/preset-env', '@babel/preset-react'],
  }),
  // Convert commonjs modules to esm
  commonjs(),
]

/**
 * Configuration for the ESM build
 */
const buildEsm = {
  external: ['swishjam', 'react'],
  input: ['src/index.jsx'],
  output: {
    entryFileNames: '[name].js',
    chunkFileNames: '[name]-deps.js',
    dir: 'dist/esm',
    format: 'esm',
  },
  plugins,
}

/**
 * Configuration for the UMD build
 */
const buildUmd = {
  external: ['swishjam', 'react'],
  input: 'src/index.jsx',
  output: {
    file: 'dist/umd/index.js',
    name: 'SwishjamReact',
    format: 'umd',
    esModule: false,
    inlineDynamicImports: true,
    globals: {
      react: 'React'
    },
  },
  plugins,
}

export default [buildEsm, buildUmd]








// const resolve = require("@rollup/plugin-node-resolve");
// const commonjs = require("@rollup/plugin-commonjs");
// const babel = require("rollup-plugin-babel");
// const json = require("@rollup/plugin-json");

// module.exports = [
//   {
//     input: "./index.jsx",
//     output: [
//       {
//         dir: './build',
//         // file: 'esm.js',
//         format: "esm",
//         sourcemap: true,
//       },
//     ],
//     plugins: [
//       resolve(),
//       babel({
//         exclude: "node_modules/**",
//         // babelHelpers: "bundled",
//         presets: ['@babel/env', '@babel/preset-react'],
//         plugins: ['@babel/plugin-transform-react-jsx']
//       }),
//       commonjs(),
//       json(),
//     ],
//     external: ['react']
//   },
// ];