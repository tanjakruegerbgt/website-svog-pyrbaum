const path = require('path');
const { LayoutPlugin } = require('./layout/LayoutPlugin');

module.exports = {
  entry: {
    app: './js/app.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    filename: './js/app.js',
  },
  plugins: [new LayoutPlugin()],
};
