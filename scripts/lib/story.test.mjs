import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MIN_SECONDS, MAX_SECONDS, DEFAULT_SECONDS, parseStory, buildShareUrl } from './story.mjs';

test('no ?story means no story', () => {
  assert.deepEqual(parseStory(''), { enabled: false, seconds: DEFAULT_SECONDS });
  assert.deepEqual(parseStory('?notes'), { enabled: false, seconds: DEFAULT_SECONDS });
});

test('?story alone uses the default', () => {
  assert.deepEqual(parseStory('?story'), { enabled: true, seconds: DEFAULT_SECONDS });
  assert.deepEqual(parseStory('?story='), { enabled: true, seconds: DEFAULT_SECONDS });
});

test('?story=N uses N', () => {
  assert.deepEqual(parseStory('?story=3'), { enabled: true, seconds: 3 });
  assert.deepEqual(parseStory('?story=12'), { enabled: true, seconds: 12 });
});

// A typo must not produce a deck that flickers unwatchably or freezes for an
// hour. Both ends are clamped rather than rejected: the link still works.
test('a duration below the floor is clamped, not rejected', () => {
  assert.deepEqual(parseStory('?story=0'), { enabled: true, seconds: MIN_SECONDS });
  assert.deepEqual(parseStory('?story=0.1'), { enabled: true, seconds: MIN_SECONDS });
  assert.deepEqual(parseStory('?story=-5'), { enabled: true, seconds: MIN_SECONDS });
});

test('a duration above the ceiling is clamped', () => {
  assert.deepEqual(parseStory('?story=9999'), { enabled: true, seconds: MAX_SECONDS });
});

test('a non-numeric duration falls back to the default rather than NaN', () => {
  assert.deepEqual(parseStory('?story=abc'), { enabled: true, seconds: DEFAULT_SECONDS });
  assert.deepEqual(parseStory('?story=Infinity'), { enabled: true, seconds: DEFAULT_SECONDS });
  assert.deepEqual(parseStory('?story=1e9999'), { enabled: true, seconds: DEFAULT_SECONDS });
});

test('a fractional duration is kept — 2.5s is a legitimate choice', () => {
  assert.deepEqual(parseStory('?story=2.5'), { enabled: true, seconds: 2.5 });
});

test('story survives alongside the other params', () => {
  assert.deepEqual(parseStory('?notes&story=4'), { enabled: true, seconds: 4 });
  assert.deepEqual(parseStory('?story=4&present'), { enabled: true, seconds: 4 });
});

test('buildShareUrl returns the bare link for normal mode', () => {
  assert.equal(buildShareUrl('https://d.com/deck-abc', { mode: 'normal' }), 'https://d.com/deck-abc');
});

test('buildShareUrl appends the story param with its seconds', () => {
  assert.equal(buildShareUrl('https://d.com/deck-abc', { mode: 'story', seconds: 5 }),
    'https://d.com/deck-abc?story=5');
});

test('buildShareUrl clamps what it writes, so a bad link is never produced', () => {
  assert.equal(buildShareUrl('https://d.com/d', { mode: 'story', seconds: 0 }),
    `https://d.com/d?story=${MIN_SECONDS}`);
  assert.equal(buildShareUrl('https://d.com/d', { mode: 'story', seconds: 9999 }),
    `https://d.com/d?story=${MAX_SECONDS}`);
});

test('buildShareUrl replaces an existing story param instead of stacking them', () => {
  assert.equal(buildShareUrl('https://d.com/d?story=3', { mode: 'story', seconds: 8 }),
    'https://d.com/d?story=8');
  assert.equal(buildShareUrl('https://d.com/d?story=3', { mode: 'normal' }), 'https://d.com/d');
});

test('buildShareUrl keeps other params and the hash', () => {
  assert.equal(buildShareUrl('https://d.com/d?notes#3', { mode: 'story', seconds: 5 }),
    'https://d.com/d?notes=&story=5#3');
});

test('a round trip agrees with itself', () => {
  for (const s of [2, 3, 5, 8, 30]) {
    const url = buildShareUrl('https://d.com/d', { mode: 'story', seconds: s });
    assert.deepEqual(parseStory(new URL(url).search), { enabled: true, seconds: s });
  }
});
