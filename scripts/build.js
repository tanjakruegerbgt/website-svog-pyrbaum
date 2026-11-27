const fs = require('node:fs');
const path = require('node:path');
const { pages, renderPage } = require('../layout/render');
const { renderNews } = require('./news');
const { renderEvents } = require('./events');

const root = path.resolve(__dirname, '..');
const pageDirectories = pages.slice(1).map((page) => page.split('/')[0]);
const directories = [...pageDirectories, 'images', 'css', 'js'];
const files = [
  'index.css', 'icon.svg', 'favicon.ico', 'favicon.svg', 'robots.txt',
  'icon.png', '404.html', 'site.webmanifest',
];
const inputs = [...pages, 'layout', ...directories, ...files, 'news.json', 'termine.json'];

function build(output = path.join(root, 'dist')) {
  const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
  const templates = {
    header: read('layout/header.html'),
    footer: read('layout/footer.html'),
    logo: read('layout/logo.html'),
    footerStyle: read('layout/footer.css'),
  };
  const news = renderNews(JSON.parse(read('news.json')));
  const events = renderEvents(JSON.parse(read('termine.json')));
  const rendered = pages.map((page) => {
    let content = read(page);
    if (page === 'index.html') {
      const marker = '<!-- news:articles -->';
      const parts = content.split(marker);
      if (parts.length !== 2) {
        throw new Error(`${page}: expected exactly one ${marker}`);
      }
      content = parts[0] + news + parts[1];
    }
    if (page === 'index.html' || page === 'termine/index.html') {
      const marker = '<!-- events:list -->';
      const parts = content.split(marker);
      if (parts.length !== 2) {
        throw new Error(`${page}: expected exactly one ${marker}`);
      }
      content = parts[0] + events + parts[1];
    }
    if (page === 'index.html') {
      const marker = '<!-- events:dialog-list -->';
      const parts = content.split(marker);
      if (parts.length !== 2) {
        throw new Error(`${page}: expected exactly one ${marker}`);
      }
      content = parts[0] + events + parts[1];
    }
    return [page, renderPage(page, content, templates)];
  });

  fs.rmSync(output, { recursive: true, force: true });
  fs.mkdirSync(output, { recursive: true });
  for (const directory of directories) {
    const source = path.join(root, directory);
    if (directory === 'css' && !fs.existsSync(source)) continue;
    fs.cpSync(source, path.join(output, directory), {
      recursive: true,
      filter: (entry) => {
        const relative = path.relative(source, entry);
        return !relative.split(path.sep).some((part) => part.startsWith('.')) &&
          !(pageDirectories.includes(directory) && path.basename(entry) === 'index.html');
      },
    });
  }
  for (const file of files) {
    fs.copyFileSync(path.join(root, file), path.join(output, file));
  }
  for (const [page, content] of rendered) {
    const destination = path.join(output, page);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, content);
  }
}

if (require.main === module) {
  build();
  console.log('Website erstellt: dist');
}

module.exports = { build, inputs, root };
