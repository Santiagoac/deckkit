import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { loadOnboarding, summarize } from './lib/onboarding.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { steps, ready, next } = summarize(loadOnboarding(root));
const mark = { done: '✓', partial: '~', pending: '·' };

console.log('\nOnboarding\n');
for (const s of steps) console.log(`  ${mark[s.status]} ${s.label.padEnd(16)} ${s.status}${s.required ? '' : '   (optional)'}`);
console.log(`\nReady to write slides: ${ready ? 'yes' : 'no — finish Company, Brand and Voice'}`);
if (next) console.log(`Next step: ${next}. In Claude Code, say "continue onboarding".`);
console.log('');
