/** Pulling new deckkit features into a copy that has already been made its own.
 *
 *  The hard part was never fetching — it is that a founder's repo and the
 *  template both edit the same tree. Merging upstream into a customised copy
 *  collides on exactly the files they care most about: their canon, their
 *  slides, their positioning.
 *
 *  So the collision is removed rather than resolved. `MINE` lists the paths
 *  that belong to the founder; `.gitattributes` marks them with a merge driver
 *  that always keeps the local side. The engine merges normally, their content
 *  is never touched, and there is nothing for them to resolve by hand.
 */

/** Everything the onboarding, the brand step and the deck writing produce.
 *  Anything not here is the engine, and the engine should come from upstream. */
export const MINE = [
  'canon/',
  'company/',
  'src/content/',
  'public/assets/',
  'evals/mine/',
];

const TYPE = /^(\w+)(?:\([^)]*\))?!?:\s*(.+)$/;

/** Turns `git log --format=%s` lines into something worth reading out loud.
 *  Conventional-commit types are an implementation detail of this repo; a
 *  founder wants to know what is new and what got fixed. */
export function summarize(lines) {
  const features = [];
  const fixes = [];
  const other = [];

  for (const raw of lines) {
    const line = String(raw ?? '').trim();
    if (!line) continue;

    // "(#11)" is this repo's PR number. It resolves to nothing in theirs.
    const clean = line.replace(/\s*\(#\d+\)\s*$/, '');
    const m = clean.match(TYPE);
    if (!m) { other.push(clean); continue; }

    const [, type, subject] = m;
    if (type === 'feat') features.push(subject);
    else if (type === 'fix') fixes.push(subject);
    else other.push(subject);
  }

  const total = features.length + fixes.length + other.length;
  return { features, fixes, other, total, empty: total === 0 };
}
