import { test } from 'node:test';
import assert from 'node:assert/strict';
import { summarize, MINE } from './update.mjs';

const log = (...s) => s;

test('groups commits by what they mean to a founder, not by prefix', () => {
  const s = summarize(log(
    'feat(story): play a deck on its own',
    'fix(story): fill a portrait screen',
    'docs: say where the password lives',
  ));
  assert.equal(s.total, 3);
  assert.deepEqual(s.features, ['play a deck on its own']);
  assert.deepEqual(s.fixes, ['fill a portrait screen']);
  assert.deepEqual(s.other, ['say where the password lives']);
});

test('strips the squash-merge PR number — it means nothing in their repo', () => {
  const s = summarize(log('feat(gate): a branded password page (#11)'));
  assert.deepEqual(s.features, ['a branded password page']);
});

test('a commit with no conventional prefix still gets listed', () => {
  const s = summarize(log('Rename the thing'));
  assert.deepEqual(s.other, ['Rename the thing']);
  assert.equal(s.total, 1);
});

test('perf and refactor read as improvements, not as fixes', () => {
  const s = summarize(log('perf(progress): use transform', 'refactor: tidy the canon loader'));
  assert.deepEqual(s.features, []);
  assert.deepEqual(s.fixes, []);
  assert.equal(s.other.length, 2);
});

test('nothing new is not an error', () => {
  const s = summarize([]);
  assert.equal(s.total, 0);
  assert.equal(s.empty, true);
});

test('blank lines from git output are ignored', () => {
  assert.equal(summarize(['', '  ', 'fix: real one']).total, 1);
});

// The whole update story rests on this list: these paths are the founder's and
// a merge must never take upstream's version of them.
test('MINE covers every place the onboarding writes, and nothing of the engine', () => {
  for (const p of ['canon/', 'company/', 'src/content/', 'public/assets/', 'evals/mine/']) {
    assert.ok(MINE.includes(p), `${p} is the founder's`);
  }
  for (const p of ['src/components/', 'src/layouts/', 'scripts/', '.claude/']) {
    assert.ok(!MINE.includes(p), `${p} is the engine's`);
  }
  // evals/ minus evals/mine/ is the template's: its rules must keep updating.
  assert.ok(!MINE.includes('evals/'), "the template's own evals still update");
});
