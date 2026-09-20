/** npm run import-deck -- <deck.pdf>                      -> reference/<deck>/{pages,text,slides}
 *  npm run import-deck -- <deck.pdf> --crop <page> <x> <y> <w> <h> <name>  -> public/assets/<name>.png
 *  Needs poppler (pdfinfo, pdftoppm, pdftotext). Coordinates are PDF points. */
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readdirSync, renameSync } from 'node:fs';
import { join, dirname, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCanon } from './lib/canon.mjs';
import { slugify, draftFromPageText, detectTools } from './lib/import.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const pdf = args.find((a) => !a.startsWith('--') && a.toLowerCase().endsWith('.pdf'));
if (!pdf) { console.error('Usage: npm run import-deck -- <deck.pdf> [--crop <page> <x> <y> <w> <h> <name>]'); process.exit(2); }

const missing = detectTools(['pdfinfo', 'pdftoppm', 'pdftotext']);
if (missing.length) {
  console.error(`Missing: ${missing.join(', ')}. They come with poppler:\n  macOS:   brew install poppler\n  Debian:  sudo apt install poppler-utils\n  Windows: https://github.com/oschwartz10612/poppler-windows/releases`);
  process.exit(1);
}
const run = (cmd, a) => { const r = spawnSync(cmd, a, { encoding: 'utf8' }); if (r.status !== 0) throw new Error(`${cmd} failed: ${r.stderr}`); return r.stdout; };

const deck = slugify(basename(pdf, extname(pdf)));
const cropAt = args.indexOf('--crop');

if (cropAt >= 0) {
  const [page, x, y, w, h, name] = args.slice(cropAt + 1, cropAt + 7);
  if (!name) { console.error('--crop needs: <page> <x> <y> <w> <h> <name>'); process.exit(2); }
  const S = 3;  // 3x for retina screens
  const dest = join(root, 'public', 'assets');
  mkdirSync(dest, { recursive: true });
  run('pdftoppm', ['-png', '-r', String(72 * S), '-f', page, '-l', page, '-x', String(x * S), '-y', String(y * S), '-W', String(w * S), '-H', String(h * S), pdf, join(dest, name)]);
  const produced = readdirSync(dest).find((f) => f.startsWith(`${name}-`) && f.endsWith('.png'));
  if (produced) renameSync(join(dest, produced), join(dest, `${name}.png`));
  console.log(`crop -> public/assets/${name}.png`);
  process.exit(0);
}

const pages = Number(/Pages:\s+(\d+)/.exec(run('pdfinfo', [pdf]))?.[1] ?? 0);
if (!pages) throw new Error('Could not read the page count.');
const out = join(root, 'reference', deck);
for (const d of ['pages', 'text', 'slides']) mkdirSync(join(out, d), { recursive: true });

run('pdftoppm', ['-png', '-r', '110', pdf, join(out, 'pages', 'p')]);
const canon = loadCanon(root);
const background = Object.keys(canon.backgrounds)[0];
const accent = Object.keys(canon.accents)[0];
for (let n = 1; n <= pages; n++) {
  const text = run('pdftotext', ['-f', String(n), '-l', String(n), '-layout', pdf, '-']);
  writeFileSync(join(out, 'text', `p-${String(n).padStart(2, '0')}.txt`), text);
  const { filename, mdx } = draftFromPageText(text, n, { deck, background, accent });
  writeFileSync(join(out, 'slides', filename), mdx);
}
console.log(`${pages} pages -> reference/${deck}/{pages,text,slides}\nreference/ is gitignored. Review the drafts with the deck-onboarding skill before copying any into src/content/slides/.`);
