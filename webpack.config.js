/* eslint-disable global-require */
const webpack = require('webpack')
const path = require('path')
const absolutePath = require('./utils/relativeToAbsolutePath')(__dirname)

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, './app/index.js'),
  output: {
    filename: 'main.js',
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new (require('html-webpack-plugin'))({
      template: absolutePath('./public/index.html'),
    }),
  ],
}
