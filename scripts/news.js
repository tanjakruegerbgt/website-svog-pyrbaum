function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function validateNews(news) {
  if (!Array.isArray(news)) {
    throw new TypeError('news.json: expected an array of articles');
  }

  const ids = new Set();
  for (const [index, article] of news.entries()) {
    validateArticle(article, index, ids);
  }
}

function validateArticle(article, index, ids) {
  const label = `news.json: article ${index + 1}`;
  if (!article || typeof article !== 'object') {
    throw new TypeError(`${label} must be an object`);
  }
  validateArticleFields(article, label);
  validateArticleId(article, label, ids);
  validateArticleDate(article, label);
  validateArticleImage(article, label);
  validateArticleBody(article, label);
}

function validateArticleFields(article, label) {
  for (const field of ['id', 'title', 'date', 'dateText', 'location']) {
    if (typeof article[field] !== 'string') {
      throw new TypeError(`${label} needs a non-empty ${field}`);
    }
    if (!article[field].trim()) {
      throw new Error(`${label} needs a non-empty ${field}`);
    }
  }
}

function validateArticleId(article, label, ids) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.id) || ids.has(article.id)) {
    throw new Error(`${label} has an invalid or duplicate id`);
  }
  ids.add(article.id);
}

function validateArticleDate(article, label) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(article.date)) {
    throw new Error(`${label} has an invalid date; expected YYYY-MM-DD`);
  }
}

function validateArticleImage(article, label) {
  if (article.image !== null && typeof article.image !== 'string') {
    throw new TypeError(`${label} image must be a path or null`);
  }
  if (article.image && (!article.image.startsWith('/images/') || article.image.includes('..'))) {
    throw new Error(`${label} image must point to a file in /images`);
  }
  if (article.image && typeof article.imageAlt !== 'string') {
    throw new TypeError(`${label} imageAlt must be a string when an image is set`);
  }
}

function validateArticleBody(article, label) {
  if (!Array.isArray(article.body)) {
    throw new TypeError(`${label} body must be an array`);
  }
  for (const block of article.body) {
    validateBodyBlock(block, label);
  }
}

function validateBodyBlock(block, label) {
  if (!block || typeof block !== 'object') {
    throw new TypeError(`${label} body contains an invalid block`);
  }
  switch (block.type) {
    case 'paragraph':
    case 'heading':
      validateTextBlock(block, label);
      if (block.type === 'heading') validateHeadingId(block, label);
      break;
    case 'list':
      validateListBlock(block, label);
      break;
    default:
      throw new Error(`${label} has an unsupported body block type`);
  }
}

function validateTextBlock(block, label) {
  if (typeof block.text !== 'string') {
    throw new TypeError(`${label} ${block.type} text must be a string`);
  }
  if (!block.text.trim()) {
    throw new Error(`${label} ${block.type} needs non-empty text`);
  }
}

function validateHeadingId(block, label) {
  if (block.id && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(block.id)) {
    throw new Error(`${label} heading has an invalid id`);
  }
}

function validateListBlock(block, label) {
  if (!Array.isArray(block.items)) {
    throw new TypeError(`${label} list items must be an array`);
  }
  if (block.items.some((item) => typeof item !== 'string' || !item.trim())) {
    throw new Error(`${label} list needs non-empty text items`);
  }
}

function renderListItem(item) {
  return `<li>${escapeHtml(item)}</li>`;
}

function renderBodyBlock(block) {
  if (block.type === 'paragraph') {
    return `<p>${escapeHtml(block.text)}</p>`;
  }
  if (block.type === 'heading') {
    const id = block.id ? ` id="${escapeHtml(block.id)}"` : '';
    return `<h3${id}>${escapeHtml(block.text)}</h3>`;
  }
  const items = block.items.map(renderListItem).join('');
  return `<ul>${items}</ul>`;
}

function renderArticle(article) {
  const image = article.image
    ? `<div class="news-image"><img src="${escapeHtml(article.image)}" alt="${escapeHtml(article.imageAlt)}" loading="lazy" /></div>`
    : '<div class="news-image"><span>Bild folgt</span></div>';
  const body = article.body.map(renderBodyBlock).join('');

  return `<article class="news-card">
  ${image}
  <div class="news-content">
    <p class="news-meta"><time datetime="${escapeHtml(article.date)}">${escapeHtml(article.dateText)}</time><span aria-hidden="true"> · </span><span>${escapeHtml(article.location)}</span></p>
    <h3 id="news-${escapeHtml(article.id)}">${escapeHtml(article.title)}</h3>
    <details>
      <summary aria-describedby="news-${escapeHtml(article.id)}">Bericht lesen</summary>
      <div class="news-body">${body}</div>
    </details>
  </div>
</article>`;
}

function renderNews(news) {
  validateNews(news);
  return news.length
    ? news.map(renderArticle).join('\n')
    : '<p class="news-empty">Aktuell gibt es keine Neuigkeiten.</p>';
}

module.exports = { escapeHtml, renderNews };
