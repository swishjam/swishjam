const path = require('path')

module.exports = {
  entry: './index.js',
  mode: 'production',
  output: {
    filename: 'build.js',
    path: path.resolve(__dirname, 'dist'),
    library: '@swishjam/react',
    libraryTarget: 'umd',
    publicPath: '/dist/',
    umdNamedDefine: true,
    globalObject: 'this'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: path.resolve(__dirname, 'node_modules'),
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-react',
                '@babel/preset-env',
              ]
            }
          }
        ]
      }
    ]
  }
}