const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');
const { pages, renderPage } = require('../layout/render');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const templates = {
  header: read('layout/header.html'),
  footer: read('layout/footer.html'),
  logo: read('layout/logo.html'),
  footerStyle: read('layout/footer.css'),
};

for (const page of pages) {
  test(`renders shared layout for ${page}`, () => {
    const source = read(page);
    const output = renderPage(page, source, templates);
    const header = output.match(/<header\b[\s\S]*?<\/header>/)[0];
    const footer = output.match(/<footer\b[\s\S]*?<\/footer>/)[0];
    const isHome = page === 'index.html';
    const isContact = page === 'kontakt/index.html';
    const isLegal = page === 'impressum/index.html' || page === 'datenschutz/index.html';

    assert.ok(!output.includes('<!-- layout:'));
    assert.ok(!output.includes('{{'));
    assert.ok(!output.includes('data-astro-cid-'));
    assert.ok(output.includes('href="/css/base.css"'));
    assert.ok(output.includes(`<style>${templates.footerStyle}</style>`));
    assert.match(header, new RegExp(`href="${isHome ? '#start' : '/'}"`));
    assert.equal(header.includes('class="brand-mark"'), !isLegal);
    assert.match(header, /<details class="site-menu">[\s\S]*<nav id="site-navigation"/);
    assert.match(header, /<svg class="menu-icon"[^>]*aria-hidden="true">[\s\S]*stroke-linecap="round"[\s\S]*<\/svg>/);
    for (const label of ['Unser Sport', 'Der Verein', 'Trainingszeiten', 'News', 'Impressum', 'Datenschutz']) {
      assert.ok(header.includes(`>${label}</a>`));
    }
    assert.ok(header.includes(isHome ? 'href="#news"' : 'href="/#news"'));
    assert.match(header, /<span class="brand-association">Verein für dt\. Schäferhunde<\/span>\s*<span class="brand-local"><strong>Ortsgruppe Pyrbaum e\. V\.<\/strong><\/span>/);
    assert.match(header, /<span class="brand-stamp"><span>seit<\/span> <span>1984<\/span><\/span>/);
    assert.ok(header.includes(isContact ? '>Zur Startseite</a>' : '>Kontakt</a>'));
    assert.equal(header.includes('href="/impressum" aria-current="page"'), page === 'impressum/index.html');
    assert.equal(header.includes('href="/datenschutz" aria-current="page"'), page === 'datenschutz/index.html');
    assert.ok(footer.includes(isHome ? 'aria-label="Zurück nach oben"' : 'aria-label="Zurück zur Startseite"'));
    assert.ok(footer.includes(isContact ? '>Zur Startseite ' : '>Kontakt '));
    assert.match(footer, /<span class="brand-association">Verein für dt\. Schäferhunde<\/span>\s*<span class="brand-local"><strong>Ortsgruppe Pyrbaum e\. V\.<\/strong><\/span>/);
    assert.match(footer, /<span class="brand-stamp"><span>seit<\/span> <span>1984<\/span><\/span>/);
    assert.equal(footer.includes('href="/impressum" aria-current="page"'), page === 'impressum/index.html');
    assert.equal(footer.includes('href="/datenschutz" aria-current="page"'), page === 'datenschutz/index.html');
    assert.match(header, /href="\/impressum"[^>]*data-imprint-dialog/);
    assert.match(footer, /href="\/impressum"[^>]*data-imprint-dialog/);
    assert.match(output, /<dialog class="imprint-dialog" aria-labelledby="imprint-dialog-title">/);
    assert.match(output, /<script src="\/js\/imprint-dialog\.js" defer><\/script>/);
    assert.ok(output.includes(source.match(/<main\b[\s\S]*?<\/main>/)[0]));
  });
}

test('rejects missing or repeated layout markers', () => {
  const source = read('index.html');
  assert.throws(() => renderPage('index.html', source.replace('<!-- layout:header -->', ''), templates), /expected exactly one/);
  assert.throws(() => renderPage('index.html', source.replace('<!-- layout:header -->', '<!-- layout:header --><!-- layout:header -->'), templates), /expected exactly one/);
});

test('rejects unknown layout placeholders', () => {
  assert.throws(() => renderPage('index.html', read('index.html'), {
    ...templates,
    header: `${templates.header}{{unknown}}`,
  }), /unknown placeholder/);
});

test('shared and page styles do not depend on generated Astro scopes', () => {
  const styles = [
    'css/base.css',
    'layout/footer.css',
    'index.css',
    ...pages.slice(1).map((page) => page.replace('index.html', `${page.split('/')[0]}.css`)),
  ];
  for (const style of styles) {
    assert.doesNotMatch(read(style), /data-astro-cid-/);
  }
});

test('sport dialog has an initial heading and links retain their visible labels', () => {
  const html = read('index.html');
  assert.match(html, /<h2 id="sport-dialog-title">Informationen zum Hundesport<\/h2>/);
  for (const sport of ['IGP', 'Rally Obedience']) {
    assert.match(html, new RegExp(`data-sport-dialog="${sport}"\\s+aria-label="Mehr erfahren über ${sport}"\\s*>Mehr erfahren`));
  }
});

test('sport dialog uses the selected sport as its heading', () => {
  const heading = {};
  const frame = { addEventListener() {} };
  const closeButton = { addEventListener() {} };
  const dialog = { showModal() { this.open = true; }, addEventListener() {} };
  const links = ['IGP', 'Rally Obedience'].map((sport) => ({
    dataset: { sportDialog: sport },
    href: `/${sport}`,
    addEventListener(type, listener) { this.click = listener; },
  }));
  const elements = {
    '.sport-dialog': dialog,
    '#sport-dialog-title': heading,
    '.sport-dialog-content': frame,
    '.sport-dialog-close': closeButton,
  };
  const document = {
    querySelector: (selector) => elements[selector],
    querySelectorAll: () => links,
    body: { classList: { add() {} } },
  };
  vm.runInNewContext(read('js/sport-dialog.js'), { document });
  for (const link of links) {
    let prevented = false;
    link.click({ button: 0, preventDefault() { prevented = true; } });
    assert.ok(prevented);
    assert.equal(heading.textContent, link.dataset.sportDialog);
    assert.equal(frame.src, link.href);
    assert.equal(dialog.open, true);
  }
});

test('imprint links open and close a modal while preserving modified clicks', () => {
  const handlers = {};
  const bodyClasses = new Set();
  const frame = {
    addEventListener(type, listener) { handlers.frame = listener; },
    removeAttribute(name) { assert.equal(name, 'src'); delete this.src; },
  };
  const closeButton = { addEventListener(type, listener) { handlers.button = listener; } };
  const dialog = {
    showModal() { this.open = true; },
    close() { this.open = false; handlers.close(); },
    addEventListener(type, listener) { handlers[type] = listener; },
  };
  const links = Array.from({ length: 2 }, () => ({
    href: 'https://example.org/impressum',
    addEventListener(type, listener) { this.click = listener; },
  }));
  const elements = {
    '.imprint-dialog': dialog,
    '.imprint-dialog-content': frame,
    '.imprint-dialog-close': closeButton,
  };
  const document = {
    querySelector: (selector) => elements[selector],
    querySelectorAll: () => links,
    body: { classList: {
      add: (value) => bodyClasses.add(value),
      remove: (value) => bodyClasses.delete(value),
    } },
  };
  vm.runInNewContext(read('js/imprint-dialog.js'), { document });
  for (const link of links) {
    let prevented = false;
    link.click({ button: 0, ctrlKey: true, preventDefault() { prevented = true; } });
    assert.equal(prevented, false);
    assert.equal(dialog.open, undefined);
    link.click({ button: 0, preventDefault() { prevented = true; } });
    assert.equal(prevented, true);
    assert.equal(frame.src, link.href);
    assert.equal(dialog.open, true);
    assert.equal(bodyClasses.has('imprint-dialog-open'), true);

    const header = { style: {} };
    const footer = { style: {} };
    const contentLink = {};
    let keydown;
    frame.contentDocument = {
      querySelectorAll: (selector) => selector === 'a' ? [contentLink] : [header, footer],
      addEventListener: (type, listener) => { keydown = listener; },
    };
    handlers.frame();
    assert.equal(header.style.display, 'none');
    assert.equal(footer.style.display, 'none');
    assert.equal(contentLink.target, '_top');
    keydown({ key: 'Escape' });
    assert.equal(dialog.open, false);
    assert.equal(bodyClasses.has('imprint-dialog-open'), false);
    assert.equal(frame.src, undefined);
    delete dialog.open;
  }
  links[0].click({ button: 0, preventDefault() {} });
  handlers.button();
  assert.equal(dialog.open, false);
});

test('contact form opens an encoded email draft', () => {
  const html = read('kontakt/index.html');
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  const fields = {
    vorname: ' Ada ',
    nachname: ' Muster ',
    handy: ' 01234 ',
    email: ' ada@example.org ',
    nachricht: 'Hallo & willkommen',
  };
  let submit;
  const status = {};
  const form = { addEventListener: (type, listener) => { assert.equal(type, 'submit'); submit = listener; } };
  const window = { location: {} };
  const document = { querySelector: (selector) => selector === '#contact-form' ? form : status };
  class FormData {
    constructor(element) { assert.equal(element, form); }
    get(key) { return fields[key]; }
  }
  vm.runInNewContext(script, { document, window, FormData });
  let prevented = false;
  submit({ preventDefault: () => { prevented = true; } });
  assert.ok(prevented);
  const mailto = new URL(window.location.href);
  assert.equal(mailto.pathname, 'svog-pyrbaum@web.de');
  assert.equal(mailto.searchParams.get('subject'), 'Kontaktanfrage von Ada Muster');
  assert.equal(mailto.searchParams.get('body'), 'Hallo & willkommen\nName: Ada Muster\nE-Mail: ada@example.org\nHandy: 01234');
  assert.match(status.textContent, /erst nach Ihrer Bestätigung/);
});
