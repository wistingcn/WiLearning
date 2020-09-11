const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
	mode: 'production',
  entry: './server.ts',
  module: {
    rules: [
      {
        use: 'ts-loader',
				exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js' ],
  },
  output: {
    filename: 'classvideo-server.js',
    path: path.resolve(__dirname, 'dist'),
  },
	target: 'node',
	externals: [nodeExternals()],
};
