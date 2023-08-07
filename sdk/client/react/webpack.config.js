const path = require('path');

module.exports = _env => ({
  mode: 'production',
  entry: './index.mjs',
  output: {
    path: path.resolve(__dirname),
    filename: 'build.js',
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              // ['@babel/preset-env', { targets: "defaults" }]
              ['@babel/preset-env']
            ]
          }
        }
      }
    ]
  }
});