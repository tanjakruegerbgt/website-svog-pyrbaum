const { escapeHtml } = require('./news');

function isDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function requiredText(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`termine.json: ${label} must be non-empty text`);
}

function renderEvents(data) {
  if (!data?.training || !Array.isArray(data.events)) {
    throw new Error('termine.json: expected training and events');
  }
  const training = data.training;
  for (const field of ['title', 'time', 'location']) requiredText(training[field], `training.${field}`);
  if (!Number.isInteger(training.weekday) || training.weekday < 0 || training.weekday > 6) {
    throw new Error('termine.json: training.weekday must be 0–6');
  }
  if (!Array.isArray(training.exceptions) || training.exceptions.some((date) =>
    !isDate(date) || new Date(`${date}T00:00:00Z`).getUTCDay() !== training.weekday)) {
    throw new Error('termine.json: training.exceptions must contain valid training dates');
  }
  const weekday = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'][training.weekday];
  const exceptions = training.exceptions.map((date) => {
    const [year, month, day] = date.split('-');
    return `${day}.${month}.${year}`;
  }).join(', ');
  const trainingCard = `<article class="event-card" data-weekday="${training.weekday}" data-exceptions="${escapeHtml(training.exceptions.join(','))}">
  <div class="event-date"><span>REGELMÄSSIG</span><strong>Jeden ${weekday}</strong><time class="event-next" hidden></time></div>
  <div class="event-content"><h3>${escapeHtml(training.title)}</h3><p>${escapeHtml(training.time)}</p><p>${escapeHtml(training.location)}</p>${exceptions ? `<p data-training-exceptions>Kein Training am: ${escapeHtml(exceptions)}</p>` : ''}</div>
</article>`;
  const cards = data.events.map((event, index) => {
    if (!event || typeof event !== 'object') throw new Error(`termine.json: event ${index + 1} must be an object`);
    for (const field of ['title', 'details', 'location']) requiredText(event[field], `event ${index + 1}.${field}`);
    if (!isDate(event.date)) throw new Error(`termine.json: event ${index + 1} needs a valid date`);
    const [year, month, day] = event.date.split('-');
    return `<article class="event-card" data-date="${event.date}">
  <div class="event-date"><span>VERANSTALTUNG</span><time datetime="${event.date}">${day}.${month}.${year}</time></div>
  <div class="event-content"><h3>${escapeHtml(event.title)}</h3><p>${escapeHtml(event.details)}</p><p>${escapeHtml(event.location)}</p></div>
</article>`;
  });
  return [trainingCard, ...cards].join('\n');
}

module.exports = { renderEvents };
