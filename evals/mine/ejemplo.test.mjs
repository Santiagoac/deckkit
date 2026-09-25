/** Your rules go here. This one is real but skipped — delete it or claim it.
 *
 *  The example is the rule deckkit used to impose on everybody and no longer
 *  does: that a closing slide's image is a signature rather than the subject.
 *  It is a good rule and it is not a universal one — some decks want the image
 *  to be the whole point — so it belongs to whoever wants it, here.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { measureDeck } from '../lib/measure.mjs';

/** Remove `{ skip: true }` to turn this on. */
test('a closing image is a signature, not the subject', { skip: true }, async () => {
  const CEILING = 0.62;

  const decks = await measureDeck();
  const tooBig = decks.flatMap((d) => d.slides)
    .filter((s) => /cierre|closing/.test(s.id))
    .flatMap((s) => s.images
      .filter((im) => im.heightRatio > CEILING)
      .map((im) => `${s.id}: ${im.src} takes ${Math.round(im.heightRatio * 100)}% of the slide on ${im.viewport}`));

  assert.deepEqual(tooBig, [],
    `above ${CEILING * 100}% the image outweighs the line the slide exists to say`);
});

/** Weight and shape budgets for images.
 *
 *  These used to be enforced in the template for everybody, which was wrong:
 *  500 KB is generous for a deck sent over mobile data and stingy for one shown
 *  on an office wall, and 4:1 is a preference about panels, not a defect. Set
 *  your own numbers, or delete the test if you have no opinion.
 *
 *  What the template still enforces for everybody: an image that does not load,
 *  and an image with no alt text. Those are broken for anybody.
 */
test('images stay inside our budgets', { skip: true }, async () => {
  const { readdirSync, readFileSync, existsSync } = await import('node:fs');
  const { join, dirname } = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const { against } = await import('../lib/imagen.mjs');

  const MINE = { bytes: 500 * 1024, edge: 2400, ratio: 4 };

  const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
  const slides = join(root, 'src', 'content', 'slides');
  const problems = readdirSync(slides).filter((f) => f.endsWith('.mdx')).flatMap((file) => {
    const src = readFileSync(join(slides, file), 'utf8').match(/src:\s*([^,}\s]+)/)?.[1];
    if (!src) return [];
    const path = join(root, 'public', src.replace(/^\//, ''));
    if (!existsSync(path)) return [];
    return against(path, MINE).map((p) => `${file.replace('.mdx', '')}: ${p}`);
  });

  assert.deepEqual(problems, []);
});

/** A third shape, for a rule that needs no browser at all. */
test('no deck runs longer than twelve slides', { skip: true }, async () => {
  const { readFileSync, readdirSync } = await import('node:fs');
  const { join, dirname } = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const { parse } = await import('yaml');

  const dir = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'src', 'content', 'decks');
  const tooLong = readdirSync(dir).filter((f) => f.endsWith('.yaml'))
    .map((f) => parse(readFileSync(join(dir, f), 'utf8')))
    .filter((d) => d?.status === 'published' && (d.slides?.length ?? 0) > 12)
    .map((d) => `${d.name}: ${d.slides.length} slides`);

  assert.deepEqual(tooLong, [], 'past twelve, nobody is still watching');
});
