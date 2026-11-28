const assert = require('node:assert/strict');
const test = require('node:test');
const { renderEvents } = require('../scripts/events');
const { berlinToday, nextTraining, updateEvents } = require('../js/events');
const data = require('../termine.json');

test('renders public events safely and rejects invalid input', () => {
  const html = renderEvents({
    ...data,
    training: { ...data.training, exceptions: ['2026-12-23'] },
    events: [{ title: '<script>', date: '2026-12-12', details: '15 Uhr', location: 'Ort' }],
  });
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /23\.12\.2026/);
  assert.throws(() => renderEvents({ ...data, events: [{ ...data.events[0], date: '2026-02-30' }] }), /valid date/);
  assert.throws(() => renderEvents({ ...data, training: { ...data.training, exceptions: ['2026-12-24'] } }), /valid training dates/);
  assert.throws(() => renderEvents({ ...data, events: [{ ...data.events[0], title: '' }] }), /title/);
});

test('uses Berlin calendar days and skips consecutive training exceptions', () => {
  assert.equal(berlinToday(new Date('2026-12-31T23:30:00Z')), '2027-01-01');
  assert.equal(nextTraining('2026-12-02', 3, []), '2026-12-02');
  assert.equal(nextTraining('2026-12-02', 3, ['2026-12-02', '2026-12-09']), '2026-12-16');
  assert.equal(nextTraining('2026-12-03', 3, []), '2026-12-09');
});

function card(dataset) {
  const next = {};
  const note = {};
  return {
    dataset, next, note,
    querySelector(selector) { return selector === '.event-next' ? next : note; },
  };
}

test('sorts upcoming dates, retains today, applies limit and hides past exceptions', () => {
  const training = card({ weekday: '3', exceptions: '2026-12-02,2026-12-09' });
  const past = card({ date: '2026-12-01' });
  const today = card({ date: '2026-12-03' });
  const later = card({ date: '2026-12-12' });
  const cards = [training, past, later, today];
  const ordered = [];
  const empty = {};
  const list = {
    dataset: { limit: '2' }, nextElementSibling: empty,
    querySelectorAll: () => cards,
    appendChild: (element) => ordered.push(element),
  };
  updateEvents(list, '2026-12-03');
  assert.deepEqual(ordered, [today, later, training]);
  assert.equal(today.hidden, false);
  assert.equal(past.hidden, true);
  assert.equal(training.hidden, true);
  assert.equal(training.next.dateTime, '2026-12-16');
  assert.equal(training.note.textContent, 'Kein Training am: 09.12.2026');
  assert.equal(empty.hidden, true);
});

test('shows empty state when all one-off events have passed', () => {
  const past = card({ date: '2026-12-01' });
  const empty = {};
  updateEvents({ dataset: {}, nextElementSibling: empty, querySelectorAll: () => [past], appendChild() {} }, '2026-12-02');
  assert.equal(past.hidden, true);
  assert.equal(empty.hidden, false);
});
