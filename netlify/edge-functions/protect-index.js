/** Basic Auth on the deck index only.
 *
 *  The index lists every deck you have, including the ones a client should
 *  never see. The decks themselves stay open: their URLs carry an unguessable
 *  suffix (scripts/lib/slug.mjs) and are meant to be pasted into an email.
 *
 *  So this guards the one page that turns "a link someone gave me" into "a
 *  directory of everything". Without it, a client who clicks "← Decks" in the
 *  top bar lands on your investor deck.
 *
 *  Set DECK_INDEX_USER and DECK_INDEX_PASSWORD in the Netlify UI
 *  (Site configuration -> Environment variables). If either is missing the
 *  index is sealed rather than left open — a misconfigured secret must never
 *  fail towards "everyone can read it".
 */
export default async (request, context) => {
  const user = Netlify.env.get('DECK_INDEX_USER');
  const password = Netlify.env.get('DECK_INDEX_PASSWORD');

  if (!user || !password) {
    return new Response(
      'The deck index is not configured. Set DECK_INDEX_USER and DECK_INDEX_PASSWORD in the Netlify site settings.',
      { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8' } },
    );
  }

  const header = request.headers.get('authorization') ?? '';
  const [scheme, encoded] = header.split(' ');

  if (scheme === 'Basic' && encoded) {
    let decoded = '';
    try { decoded = atob(encoded); } catch { decoded = ''; }
    // Split on the FIRST colon only: a password may legitimately contain one.
    const i = decoded.indexOf(':');
    if (i !== -1 && safeEqual(decoded.slice(0, i), user) && safeEqual(decoded.slice(i + 1), password)) {
      return context.next();
    }
  }

  return new Response('Authentication required.', {
    status: 401,
    headers: {
      'www-authenticate': 'Basic realm="Decks", charset="UTF-8"',
      'content-type': 'text/plain; charset=utf-8',
      // Never let a proxy keep the index around.
      'cache-control': 'no-store',
    },
  });
};

/** Compares in time that does not depend on where the first difference is.
 *  Overkill for one password, but a timing-leaky compare is the kind of thing
 *  that gets copied into somewhere it matters. */
function safeEqual(a, b) {
  const ab = new TextEncoder().encode(a);
  const bb = new TextEncoder().encode(b);
  let diff = ab.length ^ bb.length;
  for (let i = 0; i < Math.max(ab.length, bb.length); i++) diff |= (ab[i] ?? 0) ^ (bb[i] ?? 0);
  return diff === 0;
}

export const config = { path: '/' };
