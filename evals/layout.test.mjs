import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { measureDeck, FIT_FLOOR, FIT_WARN, VIEWPORTS } from './lib/measure.mjs';

/** Measured once for the whole file: launching a browser per assertion would
 *  turn a ten-second check into a minute of waiting nobody runs. */
let decks = [];
before(async () => { decks = await measureDeck(); }, { timeout: 180_000 });
after(() => {
  const warned = decks.flatMap((d) => d.slides).filter((s) => s.worst.fit < FIT_WARN && s.worst.fit >= FIT_FLOOR);
  if (!warned.length) return;
  console.error(`\n  ${warned.length} slide(s) fit, but had to shrink to do it:\n`);
  for (const s of warned) {
    console.error(`    ${s.id}  ${Math.round(s.worst.fit * 100)}% on ${s.worst.viewport}`);
    console.error(`      it renders smaller than its neighbours — cut a line or split it\n`);
  }
});

test('every slide fits on a desktop screen and on a phone', () => {
  const broken = decks.flatMap((d) =>
    d.slides.filter((s) => s.overflows.length).map((s) => ({ deck: d.deck, ...s })));

  assert.deepEqual(broken.map((b) => `${b.id} overflows on ${b.overflows.join(' and ')}`), [],
    'a slide that overflows is cut off on screen, not merely small');
});

test('no slide is forced below the readable floor', () => {
  const tooSmall = decks.flatMap((d) => d.slides)
    .filter((s) => s.worst.fit < FIT_FLOOR)
    .map((s) => `${s.id} renders at ${Math.round(s.worst.fit * 100)}% on ${s.worst.viewport}`);

  assert.deepEqual(tooSmall, [], `below ${FIT_FLOOR * 100}% the type is too small to read from a room`);
});

test('both orientations were actually measured', () => {
  // Empty means Chrome was absent and the check skipped itself, which it
  // already said out loud. Asserting here would turn a missing tool into a
  // failing deck.
  if (!decks.length) return;
  for (const d of decks) {
    assert.ok(d.slides.length > 0, `${d.deck} has slides`);
    for (const s of d.slides) {
      assert.deepEqual(Object.keys(s.byViewport).sort(), VIEWPORTS.map((v) => v.name).sort());
    }
  }
});
