/** Story mode: the deck advancing on its own, one slide at a time.
 *
 *  Carried by one URL parameter so a link is the whole configuration —
 *  `?story=5` says both "play this" and "five seconds each". `?story` alone
 *  takes the default.
 *
 *  Pure functions with no DOM, so the same file runs in the browser bundle and
 *  under `node --test`. The parsing is deliberately forgiving: a link someone
 *  typed by hand should still play rather than fail, so a bad duration is
 *  clamped or defaulted, never rejected.
 */

export const MIN_SECONDS = 2;
export const MAX_SECONDS = 30;
export const DEFAULT_SECONDS = 5;

/** Below the floor the deck flickers unreadably; above the ceiling a viewer
 *  thinks it froze. Both ends are someone's typo, not someone's intent. */
export function clampSeconds(value) {
  return Math.min(MAX_SECONDS, Math.max(MIN_SECONDS, value));
}

/** @param search a location.search string, with or without the leading "?" */
export function parseStory(search) {
  const params = new URLSearchParams(String(search ?? '').replace(/^\?/, ''));
  if (!params.has('story')) return { enabled: false, seconds: DEFAULT_SECONDS };

  const raw = params.get('story');
  if (raw === null || raw === '') return { enabled: true, seconds: DEFAULT_SECONDS };

  // Number() takes "Infinity" and "1e9999"; a plain decimal is what we mean.
  const n = /^-?\d*\.?\d+$/.test(raw.trim()) ? Number(raw) : NaN;
  if (!Number.isFinite(n)) return { enabled: true, seconds: DEFAULT_SECONDS };

  return { enabled: true, seconds: clampSeconds(n) };
}

/** Builds the link to hand someone. Replaces any story param already there
 *  rather than appending a second one, so repeatedly changing the duration in
 *  a share panel does not grow the URL. */
export function buildShareUrl(base, { mode, seconds = DEFAULT_SECONDS }) {
  const url = new URL(base);
  if (mode === 'story') url.searchParams.set('story', String(clampSeconds(seconds)));
  else url.searchParams.delete('story');
  return url.toString();
}
