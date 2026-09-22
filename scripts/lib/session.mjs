/** The signed cookie behind the deck index.
 *
 *  A token is `<expiry>.<hmac>`, signed with the index password itself as the
 *  key. Two consequences worth knowing, both deliberate:
 *
 *  - Rotating the password invalidates every session. Someone who should no
 *    longer be in is out at the next request, not whenever their cookie expires.
 *  - There is no server-side session store. A static site has nowhere to keep
 *    one, and the whole point of this gate is that it needs no infrastructure.
 *
 *  Web Crypto only, so the same file runs in a Netlify edge function (Deno) and
 *  under `node --test`. Time is passed in rather than read, so the expiry tests
 *  are not flaky and the module has no clock of its own.
 */

export const COOKIE = 'deck_index';

/** Eight hours: a working day, so nobody re-enters it after lunch, and a
 *  borrowed laptop is not open forever. */
export const TTL_SECONDS = 8 * 60 * 60;

const enc = new TextEncoder();

async function key(secret) {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
}

async function sign(secret, message) {
  const mac = await crypto.subtle.sign('HMAC', await key(secret), enc.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(mac))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** @param nowSeconds unix seconds; injected so callers control the clock. */
export async function issue(secret, ttlSeconds = TTL_SECONDS, nowSeconds = Math.floor(Date.now() / 1000)) {
  const exp = nowSeconds + ttlSeconds;
  return `${exp}.${await sign(secret, String(exp))}`;
}

export async function verify(secret, token, nowSeconds = Math.floor(Date.now() / 1000)) {
  if (typeof token !== 'string') return false;
  const dot = token.indexOf('.');
  if (dot <= 0) return false;

  const expRaw = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!sig) return false;

  // Only plain digits. Number() would happily take "1e9999", " 10", "0x10".
  if (!/^\d+$/.test(expRaw)) return false;
  const exp = Number(expRaw);
  if (!Number.isSafeInteger(exp) || exp <= nowSeconds) return false;

  // Signed over the expiry, so moving it forward invalidates the signature.
  return timingSafeEqual(sig, await sign(secret, expRaw));
}

/** Comparison whose duration does not depend on where the first difference is. */
export function timingSafeEqual(a, b) {
  const ab = enc.encode(String(a));
  const bb = enc.encode(String(b));
  let diff = ab.length ^ bb.length;
  for (let i = 0; i < Math.max(ab.length, bb.length); i++) diff |= (ab[i] ?? 0) ^ (bb[i] ?? 0);
  return diff === 0;
}

/** Reads one cookie out of a Cookie header without trusting its shape. */
export function readCookie(header, name) {
  for (const part of String(header ?? '').split(';')) {
    const i = part.indexOf('=');
    if (i === -1) continue;
    if (part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return null;
}
