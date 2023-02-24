const path = require('path');

module.exports = env => ({
  mode: 'production',
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'src.js',
    sourceMapFilename: "src.js.map"
  },
  devtool: "source-map",
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