const dialog = document.querySelector('.sport-dialog');
const dialogTitle = document.querySelector('#sport-dialog-title');
const dialogContent = document.querySelector('.sport-dialog-content');
const closeButton = document.querySelector('.sport-dialog-close');

for (const link of document.querySelectorAll('[data-sport-dialog]')) {
  link.addEventListener('click', (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    dialogTitle.textContent = link.dataset.sportDialog;
    dialogContent.title = `Informationen zu ${link.dataset.sportDialog}`;
    dialogContent.src = link.href;
    dialog.showModal();
    document.body.classList.add('sport-dialog-open');
  });
}

dialogContent.addEventListener('load', () => {
  const content = dialogContent.contentDocument;
  if (!content || !dialog.open) return;

  for (const element of content.querySelectorAll('.site-header, footer')) {
    element.style.display = 'none';
  }
  for (const link of content.querySelectorAll('a')) {
    link.target = '_top';
  }
  content.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') dialog.close();
  });
});

closeButton.addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => {
  document.body.classList.remove('sport-dialog-open');
  dialogContent.removeAttribute('src');
});
