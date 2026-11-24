const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'index.html', to: 'index.html' },
        { from: 'datenschutz', to: 'datenschutz' },
        { from: 'igp', to: 'igp' },
        { from: 'impressum', to: 'impressum' },
        { from: 'kontakt', to: 'kontakt' },
        { from: 'rally-obedience', to: 'rally-obedience' },
        { from: '_astro', to: '_astro' },
        { from: 'images', to: 'images' },
        { from: 'img', to: 'img' },
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
