const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { inputs, root } = require('../scripts/build');

test('builds and serves the static site, including updates', async (t) => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'hundesport-build-'));
  t.after(() => fs.rmSync(fixture, { recursive: true, force: true }));
  for (const input of [...inputs, 'scripts']) {
    const source = path.join(root, input);
    if (!fs.existsSync(source)) continue;
    const destination = path.join(fixture, input);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.cpSync(source, destination, { recursive: true });
  }

  const { build } = require(path.join(fixture, 'scripts', 'build'));
  const output = path.join(fixture, 'dist');
  fs.mkdirSync(output);
  fs.writeFileSync(path.join(output, 'stale.txt'), 'stale');
  build();
  assert.equal(fs.existsSync(path.join(output, 'stale.txt')), false);
  assert.equal(fs.existsSync(path.join(output, 'js', 'app.js')), false);
  assert.equal(fs.readFileSync(path.join(output, 'js', 'sport-dialog.js'), 'utf8'),
    fs.readFileSync(path.join(fixture, 'js', 'sport-dialog.js'), 'utf8'));
  assert.deepEqual(fs.readFileSync(path.join(output, 'images', 'hunde-im-herbstlaub.png')),
    fs.readFileSync(path.join(fixture, 'images', 'hunde-im-herbstlaub.png')));
  const { pages, renderPage } = require(path.join(fixture, 'layout', 'render'));
  const read = (file) => fs.readFileSync(path.join(fixture, file), 'utf8');
  const templates = {
    header: read('layout/header.html'),
    footer: read('layout/footer.html'),
    logo: read('layout/logo.html'),
    footerStyle: read('layout/footer.css'),
  };
  for (const page of pages) {
    assert.equal(fs.readFileSync(path.join(output, page), 'utf8'),
      renderPage(page, read(page), templates));
  }
  for (const asset of ['index.css', 'css/base.css', 'kontakt/kontakt.css', '404.html']) {
    assert.equal(fs.readFileSync(path.join(output, asset), 'utf8'), read(asset));
  }
  const contact = fs.readFileSync(path.join(output, 'kontakt', 'index.html'), 'utf8');
  assert.match(contact, /<header\b/);
  assert.doesNotMatch(contact, /<!-- layout:/);

  const { createServer } = require(path.join(fixture, 'scripts', 'dev-server'));
  const server = createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));
  const base = `http://127.0.0.1:${server.address().port}`;
  const page = await fetch(`${base}/kontakt?test=1`);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /<header\b/);
  assert.equal((await fetch(`${base}/kontakt/`)).status, 200);
  assert.equal((await fetch(`${base}/css/base.css`)).status, 200);
  assert.equal((await fetch(`${base}/js/sport-dialog.js`)).status, 200);
  assert.equal((await fetch(`${base}/not-found`)).status, 404);
  assert.equal((await fetch(`${base}/package.json`)).status, 404);
  assert.equal((await fetch(`${base}/kontakt`, { method: 'HEAD' })).status, 200);
  assert.equal((await fetch(`${base}/kontakt`, { method: 'POST' })).status, 405);
  assert.equal((await fetch(`${base}/%zz`)).status, 400);
  assert.equal(await (await fetch(`${base}/__dev/version`)).text(), '0');

  const header = path.join(fixture, 'layout', 'header.html');
  fs.appendFileSync(header, '\n<!-- changed -->');
  assert.equal(await (await fetch(`${base}/__dev/version`)).text(), '1');
  assert.match(await (await fetch(`${base}/kontakt`)).text(), /<!-- changed -->/);
});
