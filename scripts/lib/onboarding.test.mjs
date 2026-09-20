import { test } from 'node:test';
import assert from 'node:assert/strict';
import { summarize, STEPS } from './onboarding.mjs';

const all = (status) => Object.fromEntries(STEPS.map((s) => [s.id, status]));

test('fresh state: not ready, next is company', () => {
  const r = summarize({ steps: all('pending') });
  assert.equal(r.ready, false);
  assert.equal(r.next, 'company');
});

test('required done, optional pending: ready, next is the first pending', () => {
  const r = summarize({ steps: { ...all('pending'), company: 'done', brand: 'done', voice: 'done' } });
  assert.equal(r.ready, true);
  assert.equal(r.next, 'resources');
});

test('everything done: ready, nothing next', () => {
  const r = summarize({ steps: all('done') });
  assert.equal(r.ready, true);
  assert.equal(r.next, null);
});

test('unknown status names the step and the valid values', () => {
  assert.throws(() => summarize({ steps: { ...all('pending'), brand: 'nope' } }), /brand.*pending.*partial.*done/s);
});
