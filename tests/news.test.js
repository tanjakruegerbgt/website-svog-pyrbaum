const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { renderNews } = require('../scripts/news');

const news = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'news.json'), 'utf8'));

test('renders all news articles and their content blocks', () => {
  const html = renderNews(news);
  assert.equal((html.match(/<article class="news-card">/g) || []).length, news.length);
  assert.match(html, /datetime="2026-11-08">7\. und 8\. November 2026/);
  assert.match(html, /<ul><li>Meli mit Nuri<\/li>/);
  assert.match(html, /src="\/images\/rally-obedience-turnier-2025\.jpeg"/);
  assert.match(html, /<h3 id="erfolge-fuer-die-ortsgruppe-pyrbaum">/);
});

test('escapes article content before inserting it into HTML', () => {
  const html = renderNews([{
    id: 'test-article',
    title: '<script>alert("x")</script>',
    date: '2026-01-02',
    dateText: '2. Januar 2026',
    location: 'Pyrbaum & Umgebung',
    image: null,
    body: [{ type: 'paragraph', text: '<img src=x onerror=alert(1)>' }],
  }]);
  assert.match(html, /&lt;script&gt;alert\(&quot;x&quot;\)&lt;\/script&gt;/);
  assert.match(html, /Pyrbaum &amp; Umgebung/);
  assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.doesNotMatch(html, /<script>|<img src=x/);
});

test('rejects invalid news data with a useful error', () => {
  assert.throws(() => renderNews([{ id: 'bad id' }]), /needs a non-empty title/);
  assert.throws(() => renderNews([{
    id: 'duplicate', title: 'News', date: '2026-01-01', dateText: '1. Januar',
    location: 'Pyrbaum', image: null, body: [],
  }, {
    id: 'duplicate', title: 'Mehr News', date: '2026-01-02', dateText: '2. Januar',
    location: 'Pyrbaum', image: null, body: [],
  }]), /invalid or duplicate id/);
});
