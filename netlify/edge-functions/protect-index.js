/** The gate in front of the deck index.
 *
 *  `/` lists every deck you have, with their URLs — which makes it the one page
 *  that turns "a link someone sent me" into "a directory of everything". The
 *  decks themselves stay open: their URLs carry an unguessable suffix and are
 *  meant to be pasted into an email.
 *
 *  A password, not a username and password: there is one team credential, and
 *  asking for a username that is always the same only adds a field to get
 *  wrong. And a real page rather than the browser's Basic Auth dialog, so the
 *  first thing anyone sees of this deck site is the brand, not a grey box.
 *
 *  The page itself is `src/pages/gate.astro`, fetched at request time. It is
 *  not a string in here on purpose: it takes its colours and type from
 *  canon/brand.yaml, which is where this repo insists every colour lives.
 *
 *  Configure in the Netlify UI:
 *    DECK_INDEX_PASSWORD   the team password
 *    DECK_INDEX_PUBLIC     "true" to publish the index with no password at all
 *
 *  With neither set the index is sealed, not opened. A secret that went missing
 *  must never fail towards "everyone can read it" — leaving it open has to be
 *  something somebody typed on purpose.
 */
import { COOKIE, TTL_SECONDS, issue, verify, readCookie, timingSafeEqual }
  from '../../scripts/lib/session.mjs';

export default async (request, context) => {
  const password = Netlify.env.get('DECK_INDEX_PASSWORD');
  const isPublic = Netlify.env.get('DECK_INDEX_PUBLIC') === 'true';

  // Declared open. Nothing to check.
  if (isPublic && !password) return context.next();

  if (!password) {
    return new Response(
      'The deck index has no password set.\n\n'
      + 'Set DECK_INDEX_PASSWORD in the Netlify site settings, then redeploy '
      + '(Netlify snapshots the environment into each deploy, so the value is '
      + 'inert until something rebuilds).\n\n'
      + 'To publish the index with no password instead, set DECK_INDEX_PUBLIC=true.',
      { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' } },
    );
  }

  if (request.method === 'POST') {
    let submitted = '';
    try {
      submitted = String((await request.formData()).get('password') ?? '');
    } catch {
      submitted = '';
    }

    if (!timingSafeEqual(submitted, password)) return gate(request, { failed: true });

    // 303 so the browser re-requests with GET; a refresh must not re-POST.
    return new Response(null, {
      status: 303,
      headers: {
        location: '/',
        'set-cookie': `${COOKIE}=${await issue(password)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${TTL_SECONDS}`,
        'cache-control': 'no-store',
      },
    });
  }

  const token = readCookie(request.headers.get('cookie'), COOKIE);
  if (await verify(password, token)) return context.next();

  return gate(request, { failed: false });
};

/** Returns src/pages/gate.astro, with the error message switched on or off.
 *  One attribute swap — this function never assembles markup. */
async function gate(request, { failed }) {
  const url = new URL('/gate/', request.url);
  const res = await fetch(url);

  if (!res.ok) {
    // The page is part of the build, so this means the build is broken. Say so
    // rather than letting the index through.
    return new Response('The deck index gate is missing from this deploy.', {
      status: 500, headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
    });
  }

  const html = (await res.text()).replace('data-error="false"', `data-error="${failed}"`);

  return new Response(html, {
    // 401 keeps it honest for anything reading status codes, and the browser
    // renders our page instead of its own dialog because we send no
    // WWW-Authenticate header. Same status whether or not they just got it
    // wrong: the difference belongs in the page, not the protocol.
    status: 401,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex, nofollow',
    },
  });
}

export const config = { path: '/' };
