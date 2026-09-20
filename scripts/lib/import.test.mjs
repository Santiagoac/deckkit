import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slugify, draftFromPageText, detectTools } from './import.mjs';

test('slugify', () => { assert.equal(slugify('Análisis de crédito — 2026!'), 'analisis-de-credito-2026'); });

test('a page with a title and bullets becomes a numbered-split draft', () => {
  const { filename, mdx } = draftFromPageText('Why now\n\nMarket shifted\nRegulation changed\n', 3, { deck: 'investors', background: 'paper', accent: 'blue' });
  assert.equal(filename, '03-why-now.mdx');
  assert.match(mdx, /template: numbered-split/);
  assert.match(mdx, /title: "Why now"/);
  assert.match(mdx, /<Bullet>Market shifted<\/Bullet>/);
  assert.match(mdx, /Imported from investors page 3/);
});

test('a page with only a title becomes a statement', () => {
  const { mdx } = draftFromPageText('Thank you', 9, { deck: 'x', background: 'deep', accent: 'blue' });
  assert.match(mdx, /template: statement/);
});

test('an empty page falls back to a numbered placeholder title', () => {
  const { filename } = draftFromPageText('   \n', 4, { deck: 'x', background: 'paper', accent: 'blue' });
  assert.equal(filename, '04-slide-4.mdx');
});

test('detectTools reports what is missing', () => {
  const which = (n) => (n === 'pdftoppm' ? '/usr/bin/pdftoppm' : null);
  assert.deepEqual(detectTools(['pdftoppm', 'pdftotext'], which), ['pdftotext']);
});
