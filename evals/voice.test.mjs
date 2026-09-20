import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findBannedTerms, loadVoice } from '../scripts/lib/voice.mjs';
import { splitFrontmatter } from '../scripts/lib/frontmatter.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const banned = [
  { term: 'guarantee', use_instead: 'informs your decision', strict: false },
  { term: 'cheap', use_instead: 'affordable', strict: true },
];

test('finds a banned term case-insensitively on word boundaries', () => {
  const hits = findBannedTerms('We Guarantee results. Guaranteed!', banned, {});
  assert.deepEqual(hits.map((h) => [h.term, h.count]), [['guarantee', 1]]);
});

test('non-strict terms are allowed inside <Quote>; strict ones are not', () => {
  const text = 'Intro <Quote>they guarantee it and it is cheap</Quote> outro';
  assert.deepEqual(findBannedTerms(text, banned, {}).map((h) => h.term), ['cheap']);
});

test('customerVoice: true relaxes everything but strict terms', () => {
  const hits = findBannedTerms('we guarantee cheap prices', banned, { customerVoice: true });
  assert.deepEqual(hits.map((h) => h.term), ['cheap']);
});

test('every slide in the repo respects canon/voice.yaml', () => {
  const voice = loadVoice(root);
  const dir = join(root, 'src', 'content', 'slides');
  const failures = [];
  for (const f of readdirSync(dir).filter((n) => n.endsWith('.mdx'))) {
    const { data, body } = splitFrontmatter(readFileSync(join(dir, f), 'utf8'));
    const text = `${data.title ?? ''}\n${data.closing ?? ''}\n${body}`;
    for (const h of findBannedTerms(text, voice.banned ?? [], { customerVoice: data.customerVoice === true }))
      failures.push(`${f}: "${h.term}" ×${h.count} — say "${h.useInstead}" instead`);
  }
  assert.deepEqual(failures, [], failures.join('\n'));
});
