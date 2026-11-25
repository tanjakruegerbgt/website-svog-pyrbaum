const fs = require('fs');
const path = require('path');

const pages = [
  'index.html',
  'datenschutz/index.html',
  'igp/index.html',
  'impressum/index.html',
  'kontakt/index.html',
  'rally-obedience/index.html',
];

function replaceOnce(content, marker, value, filename) {
  const parts = content.split(marker);
  if (parts.length !== 2) {
    throw new Error(`${filename}: expected exactly one ${marker}`);
  }
  return parts[0] + value + parts[1];
}

function renderTemplate(template, values, filename) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (!Object.hasOwn(values, key)) {
      throw new Error(`${filename}: unknown placeholder ${match}`);
    }
    return values[key];
  });
}

function renderPage(page, content, templates) {
  const scope = content.match(/<body\s+(data-astro-cid-[a-z0-9]+)/);
  if (!scope) throw new Error(`${page}: missing page style scope`);

  const isHome = page === 'index.html';
  const isContact = page === 'kontakt/index.html';
  const isLegal = page === 'impressum/index.html' || page === 'datenschutz/index.html';
  const ctaHref = isContact ? '/' : '/kontakt';
  const ctaText = isContact ? 'Zur Startseite' : 'Kontakt';
  const logo = (scopeAttribute) =>
    renderTemplate(templates.logo, { scope: scopeAttribute }, 'layout/logo.html');
  const header = renderTemplate(templates.header, {
    scope: scope[1],
    logo: isLegal ? '' : logo(scope[1]),
    homeHref: isHome ? '#start' : '/',
    navPrefix: isHome ? '' : '/',
    newsLink: isHome ? `<a href="#news" ${scope[1]}>News</a>` : '',
    ctaHref,
    ctaText: isContact ? 'Zur Startseite' : 'Kontakt aufnehmen',
  }, 'layout/header.html');
  const footer = renderTemplate(templates.footer, {
    logo: logo('data-astro-cid-nns7i3if'),
    homeHref: isHome ? '#start' : '/',
    homeLabel: isHome ? 'Zurück nach oben' : 'Zurück zur Startseite',
    ctaHref,
    ctaText,
    imprintCurrent: page === 'impressum/index.html' ? ' aria-current="page"' : '',
    privacyCurrent: page === 'datenschutz/index.html' ? ' aria-current="page"' : '',
  }, 'layout/footer.html');

  content = replaceOnce(content, '<!-- layout:footer-style -->', `<style>${templates.footerStyle}</style>`, page);
  content = replaceOnce(content, '<!-- layout:header -->', header, page);
  return replaceOnce(content, '<!-- layout:footer -->', footer, page);
}

class LayoutPlugin {
  apply(compiler) {
    compiler.hooks.thisCompilation.tap('LayoutPlugin', (compilation) => {
      compilation.hooks.processAssets.tap(
        { name: 'LayoutPlugin', stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL },
        () => {
          const read = (filename) => {
            const absolutePath = path.resolve(compiler.context, filename);
            compilation.fileDependencies.add(absolutePath);
            return fs.readFileSync(absolutePath, 'utf8');
          };
          const templates = {
            header: read('layout/header.html'),
            footer: read('layout/footer.html'),
            logo: read('layout/logo.html'),
            footerStyle: read('layout/footer.css'),
          };
          for (const page of pages) {
            compilation.emitAsset(page, new compiler.webpack.sources.RawSource(
              renderPage(page, read(page), templates),
            ), { minimized: true });
          }
        },
      );
    });
  }
}

module.exports = { LayoutPlugin, pages, renderPage };
