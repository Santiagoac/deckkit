import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { loadCanon, resolveRef, googleFontsHref } from './canon.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));

// Asserts the contract, not the demo canon's values. Pinning name === 'Acme' and
// spacingBase === 8 made the suite fail the moment onboarding wrote a real
// brand.yaml — the template broke on its own intended use.
test('loadCanon reads the repo brand.yaml', () => {
  const c = loadCanon(root);
  assert.ok(c.name.length > 0, 'canon declares a brand name');
  assert.equal(typeof c.spacingBase, 'number');
  assert.ok(Object.keys(c.backgrounds).length > 0, 'canon declares a background');
  assert.ok(Object.keys(c.accents).length > 0, 'canon declares an accent');
});

test('resolveRef resolves a palette reference', () => {
  assert.equal(resolveRef({ primary: { 950: '#12294C' } }, 'primary.950'), '#12294C');
});

test('resolveRef passes raw hex through', () => {
  assert.equal(resolveRef({}, '#FFFFFF'), '#FFFFFF');
});

test('resolveRef names the missing reference', () => {
  assert.throws(() => resolveRef({ primary: {} }, 'primary.500'), /primary\.500/);
});

// A page that forgets this link falls back to a system font with no visible
// error. That is how the deck index shipped entirely off-brand.
test('googleFontsHref asks for every google family and its weights', () => {
  const href = googleFontsHref({ typography: {
    display: { family: 'Plus Jakarta Sans', source: 'google', weights: [600, 800] },
    body: { family: 'DM Sans', source: 'google', weights: [400] },
    licensed: false,
  } });
  assert.match(href, /family=Plus%20Jakarta%20Sans:wght@600;800/);
  assert.match(href, /family=DM%20Sans:wght@400/);
  assert.match(href, /display=swap/);
});

test('googleFontsHref skips licensed families, which load from public/fonts', () => {
  const href = googleFontsHref({ typography: {
    display: { family: 'Graphik', source: 'local', weights: [400] },
    body: { family: 'DM Sans', source: 'google', weights: [400] },
  } });
  assert.doesNotMatch(href, /Graphik/);
  assert.match(href, /DM%20Sans/);
});

test('googleFontsHref returns null when nothing is google-hosted', () => {
  assert.equal(googleFontsHref({ typography: { display: { family: 'Graphik', source: 'local' } } }), null);
});

// display and body are often the same family with different weights. Asking
// for it twice in one URL is a sloppy request; merge the weights instead.
test('googleFontsHref asks for a shared family once, with the union of weights', () => {
  const href = googleFontsHref({ typography: {
    display: { family: 'Inter', source: 'google', weights: [400, 500, 700] },
    body: { family: 'Inter', source: 'google', weights: [400, 500] },
    mono: { family: 'JetBrains Mono', source: 'google', weights: [400] },
  } });
  assert.equal(href.match(/family=Inter:/g).length, 1, 'Inter requested exactly once');
  assert.match(href, /family=Inter:wght@400;500;700/);
  assert.match(href, /family=JetBrains%20Mono:wght@400/);
});
