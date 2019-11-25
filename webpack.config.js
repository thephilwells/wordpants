const absolutePath = require("./utils/relativeToAbsolutePath")(__dirname);
const webpack = require("webpack");

module.exports = {
  mode: "development",
  entry: [
    "webpack-hot-middleware/client",
    absolutePath("./app/index.js")
  ],
  output: {
    filename: "main.js"
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new (require("html-webpack-plugin"))({
      template: absolutePath("./public/index.html") 
    })
  ]
};