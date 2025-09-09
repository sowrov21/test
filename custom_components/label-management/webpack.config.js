const webpack = require('webpack');
const FailOnErrorsPlugin = require('fail-on-errors-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CNAMEWebpackPlugin = require('cname-webpack-plugin');
// const ESLintPlugin = require('eslint-webpack-plugin');
const path = require('path');

// const env = process.env.NODE_ENV || 'development';
// const env = 'development';

module.exports = (env, argv) => {
  const mode = argv.mode || 'development';
  let plugins = [];
  let config = {};
  if (mode === 'production') {
    config = {
      loggingLevel: 'normal',
      outputDirectory: 'dist', // 'tempDeployFolder',//dist
      outputFileName: '[name].[contenthash].js',
      externalsFileExtension: '.min.js',
      externalsDirectory: 'externalsProd',
    };
    plugins = plugins.concat([
      new CNAMEWebpackPlugin({
        domain: 'myvision.ai',
      })]);
  } else {
    config = {
      loggingLevel: { assets: false, modules: false, children: false },
      outputDirectory: 'publicDev',
      outputFileName: '[name].js',
      externalsFileExtension: '.js',
      externalsDirectory: 'externalsDev',
    };
  }
  plugins = plugins.concat([
    new FailOnErrorsPlugin({
      failOnErrors: true,
      failOnWarnings: true,
    }),
    new HtmlWebpackPlugin({
      externalsFileExtension: config.externalsFileExtension,
      template: 'src/devIndexTemplate.html',
      minify: false,
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: './src/assets/css', to: 'assets/css' },
        { from: './src/assets/images', to: 'assets/images' },
        { from: './src/assets/svg', to: 'assets/svg' },
        { from: `./src/assets/externals/${config.externalsDirectory}`, to: 'assets/externals' },
      ],
    }),
    new webpack.DefinePlugin({
      'process.env.API_ENDPOINT': JSON.stringify(
        mode === 'production'
          ? 'https://visionapi.xpertcapture.com/api/v1/'
          : 'http://127.0.0.1:8000/api/v1/',
      ),
      'process.env.SECRET_KEY': 'Vw2kd9X6rTn8P0pLzM1Aq3Xe7YfKgB4NsVhZcG5Ru8IoU2JyTfLdCq9MhEnWAbXs',
    }),
    // new ESLintPlugin({}),
  ]);
  return {
    entry: {
      browserSupportBundle: './src/browserSupport/index.js',
      appBundle: './src/app/index.js',
    },
    output: {
      filename: config.outputFileName,
      path: path.resolve(__dirname, `./${config.outputDirectory}`),
    },
    externals: {
      fabric: 'fabric',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env'],
              },
            },
          ],
        },
      ],
    },
    mode,
    stats: config.loggingLevel,
    plugins,
    performance: {
      maxEntrypointSize: 345000,
      maxAssetSize: 345000,
    },
  };
};
