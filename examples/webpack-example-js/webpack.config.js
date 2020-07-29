const path = require('path');

module.exports = {
  entry: './src/app.js',
  module: {
    rules: [
      {
        test: /\.m?js$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.jsx', '.js' ],
  },
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
