const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports =  {
  mode:"development",
  entry:"./src/index.js",
  
  plugins:[
    new HtmlWebpackPlugin({
      template:"src/index.html"
    }),
    new CopyPlugin({
      patterns: [
        { from: "static", to: "static" },
      ],
    }),
  ],
  devServer:{
    host: '0.0.0.0',
    allowedHosts:["dbfjrh-qpsqym-8080.preview.myide.io"]
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
}