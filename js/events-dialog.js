(() => {
  const eventsDialog = document.querySelector('.events-dialog');
  const closeButton = document.querySelector('.events-dialog-close');

  for (const link of document.querySelectorAll('[data-events-dialog]')) {
    link.addEventListener('click', (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      eventsDialog.showModal();
      document.body.classList.add('events-dialog-open');
    });
  }

  closeButton.addEventListener('click', () => eventsDialog.close());
  eventsDialog.addEventListener('close', () => {
    document.body.classList.remove('events-dialog-open');
  });
})();
