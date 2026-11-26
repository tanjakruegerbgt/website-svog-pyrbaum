const imprintDialog = document.querySelector('.imprint-dialog');
const imprintTitle = document.querySelector('#imprint-dialog-title');
const imprintContent = document.querySelector('.imprint-dialog-content');
const imprintClose = document.querySelector('.imprint-dialog-close');

for (const link of document.querySelectorAll('[data-imprint-dialog], [data-privacy-dialog]')) {
  link.addEventListener('click', (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    imprintTitle.textContent = link.textContent.trim();
    imprintContent.title = imprintTitle.textContent;
    imprintContent.src = link.href;
    imprintDialog.showModal();
    document.body.classList.add('imprint-dialog-open');
  });
}

imprintContent.addEventListener('load', () => {
  const content = imprintContent.contentDocument;
  if (!content || !imprintDialog.open) return;

  for (const element of content.querySelectorAll('.site-header, footer')) {
    element.style.display = 'none';
  }
  for (const link of content.querySelectorAll('a')) {
    link.target = '_top';
  }
  content.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') imprintDialog.close();
  });
});

imprintClose.addEventListener('click', () => imprintDialog.close());
imprintDialog.addEventListener('close', () => {
  document.body.classList.remove('imprint-dialog-open');
  imprintContent.removeAttribute('src');
});
