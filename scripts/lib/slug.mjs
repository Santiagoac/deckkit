/** Deck URLs.
 *
 *  A deck's route used to be its filename, so `/contadores` implied
 *  `/inversionistas`. Anyone you sent one deck could try the others by typing.
 *  A slug keeps the readable part — you still recognise the link you are about
 *  to paste into an email — and appends a random suffix that cannot be guessed.
 *
 *  This is obscurity, not authentication: whoever holds the link holds it for
 *  good, and can forward it. It closes "the client pokes around the other
 *  decks". It does not make a deck secret. Rotate the suffix to revoke.
 */
import { randomBytes } from 'node:crypto';

/** 12 hex chars = 48 bits. Guessing one is 2^48 tries against a static host
 *  that answers 404 — not a threat model anyone runs at. Short enough that the
 *  whole URL still fits in a message without wrapping. */
const SUFFIX_BYTES = 6;

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*-[0-9a-f]{12}$/;

export function randomSuffix() {
  return randomBytes(SUFFIX_BYTES).toString('hex');
}

/** "Inversionistas Serie A (2026)" -> "inversionistas-serie-a-2026" */
export function slugifyName(name) {
  const flat = String(name)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')  // café -> cafe, niñez -> ninez
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  // A name of pure punctuation would leave nothing to prefix the suffix with,
  // and a slug that is only a suffix is unreadable in a link.
  return flat || 'deck';
}

export function makeSlug(name) {
  return `${slugifyName(name)}-${randomSuffix()}`;
}

export function isSlug(value) {
  return typeof value === 'string' && SLUG_RE.test(value);
}

/** Revoke a leaked link: same readable name, new suffix. */
export function rotateSlug(slug) {
  const readable = String(slug).replace(/-[0-9a-f]{12}$/, '');
  return `${readable || 'deck'}-${randomSuffix()}`;
}
