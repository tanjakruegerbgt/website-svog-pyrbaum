const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'index.css', to: 'index.css' },
        { from: 'datenschutz', to: 'datenschutz', globOptions: { ignore: ['**/index.html'] } },
        { from: 'igp', to: 'igp', globOptions: { ignore: ['**/index.html'] } },
        { from: 'impressum', to: 'impressum', globOptions: { ignore: ['**/index.html'] } },
        { from: 'kontakt', to: 'kontakt', globOptions: { ignore: ['**/index.html'] } },
        { from: 'rally-obedience', to: 'rally-obedience', globOptions: { ignore: ['**/index.html'] } },
        { from: 'images', to: 'images' },
        { from: 'css', to: 'css', noErrorOnMissing: true },
        { from: 'js/vendor', to: 'js/vendor' },
        { from: 'icon.svg', to: 'icon.svg' },
        { from: 'favicon.ico', to: 'favicon.ico' },
        { from: 'favicon.svg', to: 'favicon.svg' },
        { from: 'robots.txt', to: 'robots.txt' },
        { from: 'icon.png', to: 'icon.png' },
        { from: '404.html', to: '404.html' },
        { from: 'site.webmanifest', to: 'site.webmanifest' },
      ],
    }),
  ],
});
