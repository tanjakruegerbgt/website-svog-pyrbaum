function berlinToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function nextTraining(today, weekday, exceptions) {
  const date = new Date(`${today}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + (weekday - date.getUTCDay() + 7) % 7);
  while (exceptions.includes(date.toISOString().slice(0, 10))) {
    date.setUTCDate(date.getUTCDate() + 7);
  }
  return date.toISOString().slice(0, 10);
}

function updateEvents(list, today) {
  const cards = Array.from(list.querySelectorAll('.event-card'));
  const upcoming = [];
  for (const card of cards) {
    let date = card.dataset.date;
    if (card.dataset.weekday !== undefined) {
      const exceptions = card.dataset.exceptions.split(',').filter(Boolean);
      date = nextTraining(today, Number(card.dataset.weekday), exceptions);
      const next = card.querySelector('.event-next');
      const [year, month, day] = date.split('-');
      next.dateTime = date;
      next.textContent = `Nächster Termin: ${day}.${month}.${year}`;
      next.hidden = false;
      const exceptionNote = card.querySelector('[data-training-exceptions]');
      if (exceptionNote) {
        const upcomingExceptions = exceptions.filter((value) => value >= today).sort();
        exceptionNote.hidden = upcomingExceptions.length === 0;
        exceptionNote.textContent = `Kein Training am: ${upcomingExceptions.map((value) => value.split('-').reverse().join('.')).join(', ')}`;
      }
    }
    card.hidden = date < today;
    if (!card.hidden) upcoming.push({ card, date });
  }
  upcoming.sort((a, b) => a.date.localeCompare(b.date));
  const limit = list.dataset.limit ? Number(list.dataset.limit) : Infinity;
  upcoming.forEach(({ card }, index) => {
    card.hidden = index >= limit;
    list.appendChild(card);
  });
  list.nextElementSibling.hidden = upcoming.length !== 0;
}

if (typeof document !== 'undefined') {
  document.querySelectorAll('[data-events]').forEach((list) => updateEvents(list, berlinToday()));
}

if (typeof module !== 'undefined') module.exports = { berlinToday, nextTraining, updateEvents };
