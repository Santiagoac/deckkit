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

/** A second shape, for a rule that needs no browser at all. */
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
