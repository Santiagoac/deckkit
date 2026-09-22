import { test } from 'node:test';
import assert from 'node:assert/strict';
import { issue, verify, COOKIE, readCookie } from './session.mjs';

// Obviously fake, and it has to stay that way. An earlier version of this file
// used a real site's index password as the fixture; it went into a public repo
// and had to be rotated. A test fixture is published the moment it is committed.
const SECRET = 'not-a-real-password-fixture-only';

test('a freshly issued token verifies', async () => {
  const t = await issue(SECRET, 3600, 1000);
  assert.equal(await verify(SECRET, t, 1000), true);
});

test('a token does not verify under a different secret — rotating the password logs everyone out', async () => {
  const t = await issue(SECRET, 3600, 1000);
  assert.equal(await verify('something-else', t, 1000), false);
});

test('a token stops verifying once it expires', async () => {
  const t = await issue(SECRET, 3600, 1000);
  assert.equal(await verify(SECRET, t, 1000 + 3599), true);
  assert.equal(await verify(SECRET, t, 1000 + 3601), false);
});

test('the expiry cannot be extended without the secret', async () => {
  const t = await issue(SECRET, 60, 1000);
  const [, sig] = t.split('.');
  const forged = `${1000 + 999999}.${sig}`;
  assert.equal(await verify(SECRET, forged, 2000), false);
});

test('a tampered signature is rejected', async () => {
  const t = await issue(SECRET, 3600, 1000);
  const [exp, sig] = t.split('.');
  const flipped = sig[0] === 'A' ? `B${sig.slice(1)}` : `A${sig.slice(1)}`;
  assert.equal(await verify(SECRET, `${exp}.${flipped}`, 1000), false);
});

test('garbage never verifies and never throws', async () => {
  for (const junk of ['', '.', 'abc', 'abc.def', '1000', 'null.null', '../../etc/passwd']) {
    assert.equal(await verify(SECRET, junk, 1000), false, `rejected: ${junk}`);
  }
  assert.equal(await verify(SECRET, undefined, 1000), false);
  assert.equal(await verify(SECRET, null, 1000), false);
});

test('a non-numeric expiry is rejected rather than coerced', async () => {
  const t = await issue(SECRET, 3600, 1000);
  const [, sig] = t.split('.');
  assert.equal(await verify(SECRET, `NaN.${sig}`, 1000), false);
  assert.equal(await verify(SECRET, `1e9999.${sig}`, 1000), false);
});

test('the cookie name says what it is and carries no value of its own', () => {
  assert.equal(typeof COOKIE, 'string');
  assert.ok(COOKIE.length > 0);
  assert.doesNotMatch(COOKIE, /password|secret/i);
});

test('readCookie finds the cookie among others, and tolerates a malformed header', () => {
  assert.equal(readCookie('a=1; deck_index=tok; b=2', 'deck_index'), 'tok');
  assert.equal(readCookie('deck_index=tok', 'deck_index'), 'tok');
  assert.equal(readCookie('  deck_index = tok ', 'deck_index'), 'tok');
  assert.equal(readCookie('', 'deck_index'), null);
  assert.equal(readCookie(undefined, 'deck_index'), null);
  assert.equal(readCookie('garbage;;;=;', 'deck_index'), null);
  // A cookie whose NAME merely contains ours must not match.
  assert.equal(readCookie('not_deck_index=tok', 'deck_index'), null);
});

test('readCookie keeps a token containing "=" intact (base64 padding)', () => {
  assert.equal(readCookie('deck_index=abc==', 'deck_index'), 'abc==');
});
