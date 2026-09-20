import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { loadCanon, resolveRef } from './canon.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));

test('loadCanon reads the repo brand.yaml', () => {
  const c = loadCanon(root);
  assert.equal(c.name, 'Acme');
  assert.equal(c.spacingBase, 8);
  assert.ok(c.backgrounds.paper);
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
