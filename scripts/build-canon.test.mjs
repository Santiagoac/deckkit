import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildCss } from './build-canon.mjs';

const canon = {
  name: 'Acme',
  palette: {
    primary: { 50: '#EEF6FF', 400: '#5B9BE8', 950: '#12294C' },
    neutral: { 50: '#F8F7F5', 950: '#221F1C' },
  },
  backgrounds: {
    paper: { bg: 'neutral.50', fg: 'auto', logo: 'dark' },
    deep:  { bg: 'primary.950', fg: 'auto', logo: 'light' },
  },
  accents: { blue: { strong: 'primary.950', soft: 'primary.400', light: 'primary.400' } },
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

test('emits one class per background, preferring its own scale for text', () => {
  const css = buildCss(canon);
  assert.match(css, /\.bg-paper\s*\{[^}]*--fg:\s*#221F1C/s);   // neutral bg -> dark neutral text
  assert.match(css, /\.bg-deep\s*\{[^}]*--fg:\s*#EEF6FF/s);    // primary bg -> light primary text
});

test('emits one class per accent', () => {
  assert.match(buildCss(canon), /\.accent-blue\s*\{[^}]*--accent:\s*#12294C/s);
});

test('fails when no text color reaches AA on a background', () => {
  const bad = { ...canon,
    palette: { gray: { 500: '#888888' } },
    backgrounds: { mud: { bg: 'gray.500', fg: 'auto', logo: 'dark' } },
    accents: { g: { strong: 'gray.500', soft: 'gray.500' } } };
  assert.throws(() => buildCss(bad), /AA/);
});
