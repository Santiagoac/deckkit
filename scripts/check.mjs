import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { loadOnboarding, summarize } from './lib/onboarding.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { steps, ready, next, indexAccess, readyToPublish } = summarize(loadOnboarding(root));
const mark = { done: '✓', partial: '~', pending: '·' };

console.log('\nOnboarding\n');
for (const s of steps) console.log(`  ${mark[s.status]} ${s.label.padEnd(16)} ${s.status}${s.required ? '' : '   (optional)'}`);
console.log(`\nReady to write slides: ${ready ? 'yes' : 'no — finish Company, Brand and Voice'}`);
if (next) console.log(`Next step: ${next}. In Claude Code, say "continue onboarding".`);

console.log('\nThe deck index at /\n');
if (indexAccess === 'pending') {
  console.log('  · Undecided.');
  console.log('    The index lists every deck WITH its URL, so leaving it open hands over');
  console.log('    the links that the unguessable slugs exist to protect. Decide before you');
  console.log('    publish: in Claude Code, say "continue onboarding".');
} else if (indexAccess === 'password') {
  console.log('  ✓ Protected by a password.');
  console.log('    This file records the decision; it cannot see your host. Confirm that');
  console.log('    DECK_INDEX_PASSWORD is set there, and that something has deployed since');
  console.log('    you set it — the value is inert until a build picks it up.');
} else {
  console.log('  ! Deliberately public.');
  console.log('    Anyone who finds / gets the URL of every deck listed there. Keep the');
  console.log('    internal ones out of this repo, or switch to a password.');
}

if (ready && !readyToPublish) {
  console.log('\nReady to publish: no — decide who may see the index first.');
} else if (readyToPublish) {
  console.log('\nReady to publish: yes.');
}
console.log('');
