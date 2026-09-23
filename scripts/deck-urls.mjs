/** Prints where each deck actually lives.
 *
 *  `astro dev` announces one URL, the root — which is the index, behind a
 *  password in production and never the thing you wanted to look at. A deck
 *  lives at its slug, and a slug has a random suffix nobody is going to guess
 *  from the deck's name. So print them.
 *
 *  Runs before `dev` and after `build`. Silent when there are no decks yet,
 *  because saying nothing is better than saying "0 decks" to someone who has
 *  not written one on purpose.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'src', 'content', 'decks');
const base = process.argv[2] ?? 'http://localhost:4321';

if (!existsSync(dir)) process.exit(0);

const decks = readdirSync(dir)
  .filter((f) => f.endsWith('.yaml'))
  .map((f) => {
    try { return parse(readFileSync(join(dir, f), 'utf8')); } catch { return null; }
  })
  .filter((d) => d?.slug);

if (!decks.length) process.exit(0);

const width = Math.max(...decks.map((d) => String(d.name ?? '').length));
console.log('');
for (const d of decks.sort((a, b) => (a.status === b.status ? 0 : a.status === 'published' ? -1 : 1))) {
  const tag = d.status === 'published' ? '' : '  (draft — not built)';
  console.log(`  ${String(d.name ?? '').padEnd(width)}  ${base}/${d.slug}${tag}`);
}
console.log('');
