const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'index.html', to: 'index.html' },
        { from: 'images', to: 'images' },
        { from: 'img', to: 'img' },
        { from: 'css', to: 'css', noErrorOnMissing: true },
        { from: 'icon.svg', to: 'icon.svg' },
        { from: 'favicon.ico', to: 'favicon.ico' },
        { from: 'favicon.svg', to: 'favicon.svg' },
        { from: 'robots.txt', to: 'robots.txt' },
        { from: 'icon.png', to: 'icon.png' },
        { from: 'site.webmanifest', to: 'site.webmanifest' },
      ],
    }),
  ],
});
