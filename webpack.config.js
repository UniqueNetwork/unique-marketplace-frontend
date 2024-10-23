const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const dotenv = require('dotenv').config({ path: __dirname + '/.env' });

module.exports = {
  entry: './src/index.tsx',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx'],
    alias: {
      react: path.resolve(__dirname, 'node_modules/react'),
      components: path.resolve(__dirname, 'src/components'),
      account: path.resolve(__dirname, 'src/account'),
      api: path.resolve(__dirname, 'src/api'),
      hooks: path.resolve(__dirname, 'src/hooks'),
      styles: path.resolve(__dirname, 'src/styles'),
      utils: path.resolve(__dirname, 'src/utils'),
      collections: path.resolve(__dirname, 'src/collections'),
      'process/browser': require.resolve('process/browser.js'),
    },
    fallback: {
      process: require.resolve('process/browser.js'),
      util: require.resolve('util/'),
      path: require.resolve('path-browserify'),
      fs: false,
      module: false,
    },
    fullySpecified: false,
    byDependency: {
      esm: {
        fullySpecified: false,
      },
    },
    mainFields: ['browser', 'module', 'main'],
  },
  module: {
    rules: [
      {
        test: /\.(mjs|js|jsx|ts|tsx)$/,
        exclude: /node_modules\/(?!(@polkadot|@unique-nft|yaml|styled-components)\/).*/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            configFile: path.resolve(__dirname, 'babel.config.js'),
          },
        },
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.s[ac]ss$/i,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/icons/[name][ext]',
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'public',
          to: '',
          globOptions: {
            ignore: ['**/index.html'],
          },
        },
      ],
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser.js',
      Buffer: ['buffer', 'Buffer'],
    }),
    new NodePolyfillPlugin(),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(dotenv.parsed),
    }),
  ],
  optimization: {
    concatenateModules: false,
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    port: 3000,
    historyApiFallback: true,
  },
  ignoreWarnings: [
    {
      module: /node_modules\/babel-plugin-macros/,
      message: /the request of a dependency is an expression/,
    },
    {
      module: /node_modules\/import-fresh/,
      message: /the request of a dependency is an expression/,
    },
  ],
};
