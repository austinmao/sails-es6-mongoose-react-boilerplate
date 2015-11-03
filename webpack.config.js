var webpack = require('webpack');
var path = require('path')

module.exports = {
  entry: [
    // 'webpack-dev-server/client?http://localhost:8080',
    // 'webpack/hot/only-dev-server',
    // './assets/src/index.jsx'
    './api/react/index.jsx'
  ],
  resolveLoader: {
    fallback: [path.join(__dirname, 'node_modules')],
    modulesDirectories: [path.join(__dirname, "node_modules")],
    root: path.join(__dirname, 'node_modules')
  },
  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /(node_modules|bower_components)/,
      loaders: ['react-hot', 'babel'],
      // include: __dirname + '/assets/src',
    }, {
      test: /\.css$/,
      loader: 'style!css!autoprefixer?browsers=last 2 versions'
    }]
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
    fallback: path.join(__dirname, 'node_modules')
  },
  output: {
    path: __dirname + '/assets/js',
    // publicPath: 'http://localhost:8080/build/',
    publicPath: '/',
    filename: 'bundle.js'
  },
  devServer: {
    contentBase: './assets/js',
    hot: true
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin()
  ]
};
