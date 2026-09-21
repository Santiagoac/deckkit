/** Generate or rotate a deck's URL.
 *
 *   npm run deck:slug -- "Contadores"          print a fresh slug
 *   npm run deck:slug -- --rotate contadores   revoke the current link, in place
 *   npm run deck:slug -- --check               list every deck and its URL
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeSlug, rotateSlug, isSlug } from './lib/slug.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const DECKS = join(root, 'src', 'content', 'decks');

const deckFile = (name) => {
  const file = name.endsWith('.yaml') ? name : `${name}.yaml`;
  const path = join(DECKS, basename(file));
  if (!existsSync(path)) {
    const have = readdirSync(DECKS).filter((f) => f.endsWith('.yaml')).map((f) => f.replace('.yaml', ''));
    exit(`No deck "${name}". Decks here: ${have.join(', ') || '(none yet)'}`);
  }
  return path;
};

const exit = (msg) => { console.error(msg); process.exit(1); };

/** Rewrites the slug line in place, leaving the rest of the file untouched —
 *  comments and key order survive, which a YAML round-trip would not. */
function writeSlug(path, slug) {
  const text = readFileSync(path, 'utf8');
  const line = `slug: ${slug}`;
  writeFileSync(path, /^slug:.*$/m.test(text)
    ? text.replace(/^slug:.*$/m, line)
    // Put it under `audience:` if that exists, else at the top, so the file
    // still reads name -> audience -> slug.
    : /^audience:.*$/m.test(text) ? text.replace(/^(audience:.*)$/m, `$1\n${line}`) : `${line}\n${text}`);
  return slug;
}

const args = process.argv.slice(2);

if (args.includes('--check')) {
  const files = readdirSync(DECKS).filter((f) => f.endsWith('.yaml'));
  if (!files.length) exit('No decks yet.');
  let bad = 0;
  for (const f of files) {
    const text = readFileSync(join(DECKS, f), 'utf8');
    const slug = text.match(/^slug:\s*(.+)$/m)?.[1]?.trim();
    const ok = isSlug(slug);
    if (!ok) bad++;
    console.log(`${ok ? '✓' : '✗'} ${f.replace('.yaml', '').padEnd(24)} ${ok ? `/${slug}` : slug ? `${slug} — not an unguessable slug` : '— no slug'}`);
  }
  if (bad) exit(`\n${bad} deck(s) without a usable slug. Run: npm run deck:slug -- --rotate <deck>`);
  process.exit(0);
}

if (args[0] === '--rotate') {
  const target = args[1] ?? exit('Which deck? npm run deck:slug -- --rotate <deck>');
  const path = deckFile(target);
  const text = readFileSync(path, 'utf8');
  const current = text.match(/^slug:\s*(.+)$/m)?.[1]?.trim();
  const next = current ? rotateSlug(current) : makeSlug(basename(path, '.yaml'));
  writeSlug(path, next);
  console.log(`${basename(path)}\n  was /${current ?? '(none)'}\n  now /${next}\n\nThe old link is dead. Anyone still holding it gets a 404 after the next deploy.`);
  process.exit(0);
}

const name = args.join(' ').trim();
if (!name) exit('Usage: npm run deck:slug -- "Deck name"   |   --rotate <deck>   |   --check');
console.log(makeSlug(name));
