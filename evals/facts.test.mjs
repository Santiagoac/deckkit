import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { expiredFacts, loadFacts } from '../scripts/lib/facts.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));

test('a fact past reviewedOn + validForDays is expired', () => {
  const facts = [{ id: 'old', reviewedOn: '2026-01-01', validForDays: 30 }, { id: 'fresh', reviewedOn: '2026-09-01', validForDays: 365 }];
  const r = expiredFacts(facts, new Date('2026-09-20'));
  assert.deepEqual(r.map((f) => f.id), ['old']);
  assert.equal(r[0].expiredOn, '2026-01-31');
});

test('no fact in canon/facts.yaml is expired today', () => {
  const r = expiredFacts(loadFacts(root), new Date());
  assert.deepEqual(r, [], r.map((f) => `${f.id} expired on ${f.expiredOn} — review it and update reviewedOn`).join('\n'));
});
