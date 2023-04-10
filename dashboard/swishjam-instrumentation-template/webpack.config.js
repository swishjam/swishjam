const path = require('path');

module.exports = env => ({
  mode: 'production',
  entry: './src.js',
  output: {
    path: path.resolve(__dirname),
    filename: 'template.js',
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