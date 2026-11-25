const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { pages, renderPage } = require('../layout/LayoutPlugin');

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
    assert.ok(output.includes(`<style>${templates.footerStyle}</style>`));
    assert.match(header, new RegExp(`href="${isHome ? '#start' : '/'}"`));
    assert.equal(header.includes('class="brand-mark"'), !isLegal);
    assert.equal(header.includes('>News</a>'), isHome);
    assert.ok(header.includes(isContact ? '>Zur Startseite ' : '>Kontakt aufnehmen '));
    assert.ok(footer.includes(isHome ? 'aria-label="Zurück nach oben"' : 'aria-label="Zurück zur Startseite"'));
    assert.ok(footer.includes(isContact ? '>Zur Startseite ' : '>Kontakt '));
    assert.equal(footer.includes('href="/impressum" aria-current="page"'), page === 'impressum/index.html');
    assert.equal(footer.includes('href="/datenschutz" aria-current="page"'), page === 'datenschutz/index.html');
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
