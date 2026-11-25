const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const { pages } = require('./layout/LayoutPlugin');

const directories = new Set(pages.slice(1).map((page) => `/${page.replace('/index.html', '')}`));

module.exports = merge(common, {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    liveReload: true,
    hot: true,
    open: true,
    static: ['./'],
    setupMiddlewares: (middlewares) => {
      middlewares.unshift({
        name: 'static-page-index',
        middleware: (req, res, next) => {
          const [pathname, query] = req.url.split(/(?=\?)/, 2);
          const directory = pathname.replace(/\/$/, '');
          if (directories.has(directory)) {
            req.url = `${directory}/index.html${query || ''}`;
          }
          next();
        },
      });
      return middlewares;
    },
  },
});
