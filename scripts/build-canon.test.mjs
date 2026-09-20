import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { buildCss, invalidateContentStore } from './build-canon.mjs';

const canon = {
  name: 'Acme',
  palette: {
    primary: { 50: '#EEF6FF', 400: '#5B9BE8', 700: '#2C5FA8', 950: '#12294C' },
    neutral: { 50: '#F8F7F5', 950: '#221F1C' },
  },
  backgrounds: {
    paper: { bg: 'neutral.50', fg: 'auto', logo: 'dark' },
    deep:  { bg: 'primary.950', fg: 'auto', logo: 'light' },
  },
  accents: { blue: { strong: 'primary.950', soft: 'primary.700', light: 'primary.400' } },
  typography: {
    display: { family: 'Inter', source: 'google', weights: [400, 700] },
    body: { family: 'Inter', source: 'google', weights: [400] },
    mono: { family: 'JetBrains Mono', source: 'google', weights: [400] },
    licensed: false,
  },
  logo: { dark: '/assets/logo-dark.svg', light: '/assets/logo-light.svg' },
  spacingBase: 8,
};

test('emits palette custom properties', () => {
  assert.match(buildCss(canon), /--c-primary-950:\s*#12294C/);
});

test('derives the spacing scale from spacingBase', () => {
  assert.match(buildCss(canon), /--sp-3:\s*24px/);
});

test('emits chrome tokens from the neutral scale and the first accent', () => {
  const css = buildCss(canon);
  assert.match(css, /--ink:\s*#221F1C/);
  assert.match(css, /--paper:\s*#F8F7F5/);
  assert.match(css, /--brand:\s*#2C5FA8/);
  assert.match(css, /--brand-light:\s*#5B9BE8/);
});

test('light background: text takes the accent; dark background: contrast-picked light text', () => {
  const css = buildCss(canon);
  assert.match(css, /\.bg-paper\s*\{[^}]*--fg:\s*var\(--accent\)/s);
  assert.match(css, /\.bg-deep\s*\{[^}]*--fg:\s*#EEF6FF/s);
  assert.match(css, /\.bg-deep\s*\{[^}]*--accent-visible:\s*var\(--accent-light\)/s);
});

test('emits one class per accent', () => {
  assert.match(buildCss(canon), /\.accent-blue\s*\{[^}]*--accent:\s*#12294C/s);
});

test('fails when an accent does not reach AA on a light background', () => {
  const bad = { ...canon, accents: { pale: { strong: 'primary.400', soft: 'primary.400' } } };
  assert.throws(() => buildCss(bad), /AA on background "paper"/);
});

test('fails when no text color reaches AA on a dark background', () => {
  const bad = { ...canon,
    palette: { gray: { 400: '#777777', 500: '#888888' } },
    backgrounds: { mud: { bg: 'gray.500', fg: 'auto', logo: 'dark' } },
    accents: { g: { strong: 'gray.400', soft: 'gray.400' } } };
  assert.throws(() => buildCss(bad), /AA/);
});

import { placeholderLogo } from './build-canon.mjs';

test('placeholderLogo renders the brand name in the requested ink on a transparent canvas', () => {
  const svg = placeholderLogo('Acme', '#221F1C');
  assert.match(svg, /^<svg /);
  assert.match(svg, />Acme</);
  assert.match(svg, /fill="#221F1C"/);
  assert.doesNotMatch(svg, /<rect/);
});

test('emits @font-face for locally hosted (licensed) fonts', () => {
  const local = { ...canon, typography: { ...canon.typography,
    display: { family: 'Graphik', source: 'local', weights: [400, 500], files: { 400: 'Graphik-Regular.woff2', 500: 'Graphik-Medium.woff2' }, fallback: 'Inter' } } };
  const css = buildCss(local);
  assert.match(css, /@font-face\s*\{[^}]*font-family:\s*'Graphik'[^}]*url\('\/fonts\/Graphik-Regular\.woff2'\)[^}]*font-weight:\s*400/s);
  assert.match(css, /--font-display:\s*'Graphik', 'Inter', sans-serif/);
});

test('google-hosted fonts emit no @font-face', () => {
  assert.doesNotMatch(buildCss(canon), /@font-face/);
});

// Astro caches validated content in node_modules/.astro/data-store.json. Editing
// canon/brand.yaml does not touch any .mdx file, so without this the store is
// reused and every slide keeps validating against the PREVIOUS canon: rename an
// accent and the build stays green while every slide references one that is gone.
test('invalidateContentStore removes the Astro content store and reports it', () => {
  const root = mkdtempSync(join(tmpdir(), 'canon-store-'));
  const store = join(root, 'node_modules', '.astro', 'data-store.json');
  mkdirSync(dirname(store), { recursive: true });
  writeFileSync(store, '{"slides":"validated against the old canon"}');

  assert.equal(invalidateContentStore(root), true);
  assert.equal(existsSync(store), false);
});

test('invalidateContentStore reports false when there is no store to clear', () => {
  const root = mkdtempSync(join(tmpdir(), 'canon-store-'));
  assert.equal(invalidateContentStore(root), false);
});
