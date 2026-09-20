import { test } from 'node:test';
import assert from 'node:assert/strict';
import { contrastRatio, pickForeground } from './color.mjs';

test('contrastRatio: white on black is 21:1', () => {
  assert.equal(Math.round(contrastRatio('#FFFFFF', '#000000')), 21);
});

test('contrastRatio: a color against itself is 1:1', () => {
  assert.equal(Math.round(contrastRatio('#3E8DCB', '#3E8DCB')), 1);
});

test('pickForeground returns the first candidate that passes AA', () => {
  const r = pickForeground('#143054', ['#235581', '#F8F7F2']);
  assert.equal(r.hex, '#F8F7F2');
  assert.ok(r.ratio >= 4.5);
});

test('pickForeground throws when no candidate passes AA', () => {
  assert.throws(() => pickForeground('#888888', ['#777777', '#999999']), /AA/);
});
