/** Bring new deckkit features into a copy that has been made its own.
 *
 *   npm run update -- --check    what is new, changes nothing
 *   npm run update               bring it in
 *
 *  Safe by construction:
 *   - refuses to run with uncommitted work, so there is always something to
 *     go back to
 *   - tags the current commit first, so undo is one command and the script
 *     prints it
 *   - your canon, slides, company and assets are marked `merge=keep-mine` in
 *     .gitattributes, so a merge never touches them
 *   - runs the tests and the build afterwards, and if either fails it says how
 *     to undo rather than leaving a broken repo behind
 */
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { summarize, MINE } from './lib/update.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const UPSTREAM = 'https://github.com/Santiagoac/deckkit.git';
const check = process.argv.includes('--check');

const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
const gitQuiet = (...args) => {
  try { return { ok: true, out: git(...args) }; } catch (e) { return { ok: false, out: String(e.stdout ?? e.message) }; }
};
const say = (s = '') => console.log(s);
const die = (s) => { console.error(`\n${s}\n`); process.exit(1); };

// --- where does upstream live -----------------------------------------------
const remotes = git('remote').split('\n').filter(Boolean);
const urlOf = (r) => gitQuiet('remote', 'get-url', r).out.replace(/\.git$/, '');
const canonical = UPSTREAM.replace(/\.git$/, '');

if (remotes.includes('origin') && urlOf('origin') === canonical) {
  // This IS deckkit, or a clone that still points at it. Nothing to link.
  die('This repo is deckkit itself. There is nothing upstream of it.');
}

if (!remotes.includes('upstream')) {
  // A copy made with "Use this template", or a clone whose origin was
  // repointed at the founder's own repo, has no link back here. Make one.
  git('remote', 'add', 'upstream', UPSTREAM);
  say(`Linked to deckkit (${UPSTREAM})`);
} else if (urlOf('upstream') !== canonical) {
  say(`Note: upstream points at ${urlOf('upstream')}, not the deckkit template.`);
}

say('Checking for updates…');
const fetched = gitQuiet('fetch', 'upstream', 'main');
if (!fetched.ok) die(`Could not reach deckkit. Check your connection.\n\n${fetched.out}`);

// --- what is new ------------------------------------------------------------
const head = git('rev-parse', 'HEAD');
const target = git('rev-parse', 'upstream/main');
const shared = gitQuiet('merge-base', 'HEAD', 'upstream/main');

// A template copy starts from a fresh commit and shares no history at all.
// That is normal, not damage; the first merge has to be told so.
const unrelated = !shared.ok;
const range = unrelated ? 'upstream/main' : `${shared.out}..upstream/main`;
const subjects = git('log', '--format=%s', '--no-merges', range).split('\n');
const news = summarize(subjects);

if (head === target || news.empty) {
  say('\nYou are up to date.\n');
  process.exit(0);
}

say(`\n${news.total} change${news.total === 1 ? '' : 's'} since your version:\n`);
const list = (title, items) => {
  if (!items.length) return;
  say(`  ${title}`);
  for (const i of items) say(`    · ${i}`);
};
list('New', news.features);
list('Fixed', news.fixes);
list('Other', news.other);

say(`\n  Your ${MINE.join(', ')} are not touched.`);

if (check) {
  say('\nRun `npm run update` to bring these in.\n');
  process.exit(0);
}

// --- guard rails ------------------------------------------------------------
if (git('status', '--porcelain')) {
  die('You have uncommitted changes. Commit them first, so there is something to go back to.');
}

const tag = `before-update-${Date.now()}`;
git('tag', tag);

// Marked in .gitattributes; the driver has to exist for those marks to mean
// anything. `true` succeeds without writing, so the local side survives.
git('config', 'merge.keep-mine.driver', 'true');
git('config', 'merge.keep-mine.name', 'keep the local version of the founder\'s own files');

// --- merge ------------------------------------------------------------------
say('\nBringing them in…');
const args = ['merge', 'upstream/main', '--no-edit'];
if (unrelated) args.push('--allow-unrelated-histories');
const merged = gitQuiet(...args);

if (!merged.ok) {
  const conflicted = gitQuiet('diff', '--name-only', '--diff-filter=U').out.split('\n').filter(Boolean);
  gitQuiet('merge', '--abort');
  die(
    'The update could not be applied on its own.\n\n'
    + (conflicted.length ? `It collided on:\n${conflicted.map((f) => `  ${f}`).join('\n')}\n\n` : '')
    + 'Nothing changed — the merge was undone. Ask your agent to look at it:\n'
    + '  "la actualización de deckkit chocó, ayúdame"',
  );
}

// --- did it survive ---------------------------------------------------------
say('Checking that everything still works…');
const verify = gitQuiet('status', '--porcelain');
let broken = null;
for (const [label, cmd] of [['tests', 'test'], ['build', 'build']]) {
  try {
    execFileSync('npm', ['run', cmd], { cwd: root, stdio: 'pipe' });
  } catch {
    broken = label;
    break;
  }
}

if (broken) {
  die(
    `The update came in but the ${broken} now fail.\n\n`
    + `Undo it with:\n  git reset --hard ${tag}\n\n`
    + 'Then tell your agent: "la actualización de deckkit rompió el ' + broken + '".',
  );
}

say(`\nDone. Everything still works.`);
say(`\nIf anything looks wrong, undo with:\n  git reset --hard ${tag}\n`);
void verify;
