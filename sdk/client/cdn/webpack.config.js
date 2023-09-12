const path = require('path');

module.exports = _env => ({
  mode: 'production',
  entry: './index.js',
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
              ['@babel/preset-env', {
                targets: [
                  'last 2 versions', // The last 2 versions of major browsers
                  'not dead', // Exclude dead browsers (ones that are no longer being updated)
                  'not ie <= 11', // Exclude Internet Explorer 11 and below
                ],
              },]
            ]
          }
        }
      }
    ]
  }
});