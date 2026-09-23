import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LANGUAGES, uiStrings } from './ui.mjs';

test('every language defines every key — a half-translated UI is worse than an English one', () => {
  const keys = Object.keys(uiStrings('en'));
  for (const lang of LANGUAGES) {
    const s = uiStrings(lang);
    assert.deepEqual(Object.keys(s).sort(), keys.sort(), `${lang} has the same keys`);
    for (const [k, v] of Object.entries(s)) {
      assert.ok(typeof v === 'string' && v.length > 0, `${lang}.${k} is a non-empty string`);
    }
  }
});

test('Spanish is actually translated, not English copied across', () => {
  const en = uiStrings('en');
  const es = uiStrings('es');
  const shared = Object.keys(en).filter((k) => en[k] === es[k]).sort();
  // "deck" and "slide" are the words Spanish-speaking founders actually use —
  // translating them to "baraja" and "diapositiva" would read as machine output.
  // Named here so a genuinely forgotten translation still fails this test.
  assert.deepEqual(shared, ['backToDecks', 'decks', 'slideCount']);
});

test('an unknown language falls back to English rather than throwing', () => {
  assert.deepEqual(uiStrings('fr'), uiStrings('en'));
  assert.deepEqual(uiStrings(undefined), uiStrings('en'));
  assert.deepEqual(uiStrings(null), uiStrings('en'));
});

test('a regional tag resolves to its base language', () => {
  assert.deepEqual(uiStrings('es-MX'), uiStrings('es'));
  assert.deepEqual(uiStrings('ES'), uiStrings('es'));
});
