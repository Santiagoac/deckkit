import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SLUG_RE, makeSlug, isSlug, rotateSlug } from './slug.mjs';

test('makeSlug keeps the name readable and adds an unguessable suffix', () => {
  const s = makeSlug('Contadores');
  assert.match(s, /^contadores-[0-9a-f]{12}$/);
});

test('makeSlug flattens accents, spaces and punctuation', () => {
  assert.match(makeSlug('Inversionistas Serie A (2026)'), /^inversionistas-serie-a-2026-[0-9a-f]{12}$/);
  assert.match(makeSlug('Día de la Niñez'), /^dia-de-la-ninez-[0-9a-f]{12}$/);
});

test('makeSlug never returns the same suffix twice', () => {
  const seen = new Set(Array.from({ length: 200 }, () => makeSlug('deck')));
  assert.equal(seen.size, 200);
});

test('a name that flattens to nothing still yields a usable slug', () => {
  assert.match(makeSlug('!!!'), /^deck-[0-9a-f]{12}$/);
});

test('isSlug accepts what makeSlug produces', () => {
  assert.ok(isSlug(makeSlug('Contadores')));
});

test('isSlug rejects a bare name — that is the guessable URL we are removing', () => {
  assert.equal(isSlug('contadores'), false);
  assert.equal(isSlug('inversionistas'), false);
});

test('isSlug rejects a suffix too short to be unguessable', () => {
  assert.equal(isSlug('contadores-7f3a'), false);
});

test('isSlug rejects uppercase and spaces', () => {
  assert.equal(isSlug('Contadores-7f3a9c2b1d4e'), false);
  assert.equal(isSlug('mi deck-7f3a9c2b1d4e'), false);
});

test('rotateSlug keeps the readable part and replaces only the suffix', () => {
  const before = 'contadores-7f3a9c2b1d4e';
  const after = rotateSlug(before);
  assert.match(after, /^contadores-[0-9a-f]{12}$/);
  assert.notEqual(after, before);
});

test('rotateSlug works on a multi-word name', () => {
  assert.match(rotateSlug('serie-a-2026-aaaaaaaaaaaa'), /^serie-a-2026-[0-9a-f]{12}$/);
});

test('SLUG_RE is anchored, so it cannot match inside a longer string', () => {
  assert.equal(SLUG_RE.test('../../etc/passwd-7f3a9c2b1d4e'), false);
});
