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
  const isHome = page === 'index.html';
  const isContact = page === 'kontakt/index.html';
  const isLegal = page === 'impressum/index.html' || page === 'datenschutz/index.html';
  const ctaHref = isContact ? '/' : '/kontakt';
  const ctaText = isContact ? 'Zur Startseite' : 'Kontakt';
  const header = renderTemplate(templates.header, {
    logo: isLegal ? '' : templates.logo,
    homeHref: isHome ? '#start' : '/',
    navPrefix: isHome ? '' : '/',
    newsHref: isHome ? '#news' : '/#news',
    ctaHref,
    ctaText: isContact ? 'Zur Startseite' : 'Kontakt',
    imprintCurrent: page === 'impressum/index.html' ? ' aria-current="page"' : '',
    privacyCurrent: page === 'datenschutz/index.html' ? ' aria-current="page"' : '',
  }, 'layout/header.html');
  const footer = renderTemplate(templates.footer, {
    logo: templates.logo,
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

module.exports = { pages, renderPage };
