import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { loadCanon, resolveRef } from './canon.mjs';

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
