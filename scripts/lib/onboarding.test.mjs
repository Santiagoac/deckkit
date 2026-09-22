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

// The index lists every deck WITH its URL, so leaving it open hands over the
// unguessable links. The decision has to be made, not defaulted into.
test('index access defaults to pending when the canon does not say', () => {
  assert.equal(summarize({ steps: {} }).indexAccess, 'pending');
});

test('index access carries through when decided', () => {
  assert.equal(summarize({ steps: {}, index_access: 'password' }).indexAccess, 'password');
  assert.equal(summarize({ steps: {}, index_access: 'public' }).indexAccess, 'public');
});

test('an unknown index access value names itself and the valid ones', () => {
  assert.throws(() => summarize({ steps: {}, index_access: 'maybe' }), /maybe.*pending.*password.*public/s);
});

test('an undecided index does not block writing slides — it blocks publishing', () => {
  const done = Object.fromEntries(STEPS.map((s) => [s.id, 'done']));
  assert.equal(summarize({ steps: done, index_access: 'pending' }).ready, true);
  assert.equal(summarize({ steps: done, index_access: 'pending' }).readyToPublish, false);
  assert.equal(summarize({ steps: done, index_access: 'password' }).readyToPublish, true);
});
