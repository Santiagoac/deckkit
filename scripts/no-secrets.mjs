/** Refuses to let a real-looking credential into the repo.
 *
 *  This exists because it already happened: a live index password was used as a
 *  test fixture and shipped to a public repo. Rotating fixed the exposure;
 *  nothing stopped it from happening in the first place.
 *
 *  Deliberately dumb. It cannot know what is secret, so it looks for the shapes
 *  a secret takes in this repo — an assignment to something named like a
 *  credential, with a literal that is not obviously a placeholder.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SKIP = new Set(['node_modules', '.git', 'dist', '.astro', 'reference', '.netlify']);
const EXT = /\.(mjs|js|ts|astro|md|yaml|yml|json)$/;

/** A literal that announces it is not real. */
const PLACEHOLDER = /^(|x+|\.\.\.|<[^>]*>|\$\{[^}]*\}|change-?me|your-?[a-z-]*|example|test|fixture|placeholder|tu-contrase(ñ|n)a|la-nueva|theirs)$/i;
const OBVIOUSLY_FAKE = /(not-a-real|fixture-only|example\.com|placeholder|dummy|sample)/i;

/** The word "password" is not a password. These are field names, autocomplete
 *  hints and form keys — `name="password"`, `autocomplete="current-password"`. */
const FIELD_NAME = /^(password|current-password|new-password|username|email|text|submit)$/i;

const NAMED_SECRET = /\b(password|passwd|secret|token|api[_-]?key|apikey|credential)\b[^\n=:]{0,20}[=:]\s*(["'`])([^"'`\n]{6,})\2/gi;

const hits = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (SKIP.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) { walk(full); continue; }
    if (!EXT.test(entry)) continue;

    const rel = relative(root, full);
    const text = readFileSync(full, 'utf8');
    for (const m of text.matchAll(NAMED_SECRET)) {
      const value = m[3];
      if (PLACEHOLDER.test(value) || OBVIOUSLY_FAKE.test(value) || FIELD_NAME.test(value)) continue;
      // An env var read, not a value: DECK_INDEX_PASSWORD in prose or a lookup.
      if (/^[A-Z][A-Z0-9_]*$/.test(value)) continue;
      const line = text.slice(0, m.index).split('\n').length;
      hits.push({ rel, line, value });
    }
  }
}

walk(root);

if (hits.length) {
  console.error('\nSomething shaped like a real credential is in the repo:\n');
  for (const h of hits) console.error(`  ${h.rel}:${h.line}  ${h.value.slice(0, 4)}${'*'.repeat(Math.max(0, h.value.length - 4))}`);
  console.error('\nIf it is a fixture, make it obviously fake: "not-a-real-password", "fixture-only".');
  console.error('If it is real, it is published the moment this is committed. Rotate it, do not just delete the line.\n');
  process.exit(1);
}
