var CopyWebpackPlugin = require('copy-webpack-plugin')
var Dotenv = require('dotenv-webpack')
var path = require('path')

module.exports = {
  entry: './src/frontend/index.js',
  mode: 'development',
  output: {
    path: path.resolve(__dirname, './public/js'),
    filename: 'index.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: [['env'], ['react']],
          plugins: [
            'transform-async-to-generator',
            'transform-object-rest-spread',
            'transform-runtime'
          ]
        }
      }
    ]
  },
  plugins: [
    new Dotenv(),
    new CopyWebpackPlugin(
      [
        {
          from: 'node_modules/chartist/dist/chartist.min.css',
          to: '../css/plugins/chartist.min.css'
        },
        {
          from: 'node_modules/normalize.css/normalize.css',
          to: '../css/plugins/normalize.css'
        }
      ],
      {
        ignore: [],
        copyUnmodified: false
      }
    )
  ]
}
