const path = require('path')

const { name } = require('./package.json')

module.exports = {
  entry: './index.js',
  mode: 'production',
  output: {
    filename: 'build.js',
    path: path.resolve(__dirname, 'dist'),
    library: '@swishjam/react',
    libraryTarget: 'umd',
    publicPath: '/dist/',
    umdNamedDefine: true  
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
              presets: ['@babel/preset-react']
            }
          }
        ]
      }
    ]
  },
  resolve: {
    alias: {
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
    }
  },
  externals: {
    // Don't bundle react or react-dom      
    react: {
      commonjs: "react",
      commonjs2: "react",
      amd: "React",
      root: "React"
    },
    "react-dom": {
      commonjs: "react-dom",
      commonjs2: "react-dom",
      amd: "ReactDOM",
      root: "ReactDOM"
    }
  }
  // resolve: {
  //   // alias: {
  //   //   [name]: path.resolve(__dirname, 'src')
  //   // },
  //   extensions: ['.js', '.jsx']
  // }
}