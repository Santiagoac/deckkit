/** Loads and validates canon/brand.yaml. Shared by the token generator and the content schemas. */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

/** `primary.950` -> '#12294C'. Raw hex passes through untouched. */
export function resolveRef(palette, ref) {
  if (typeof ref === 'string' && ref.startsWith('#')) return ref;
  const [scale, step] = String(ref).split('.');
  const hex = palette?.[scale]?.[step];
  if (!hex) {
    const known = Object.keys(palette ?? {}).join(', ') || '(none)';
    throw new Error(`canon/brand.yaml: "${ref}" is not in the palette. Declared scales: ${known}.`);
  }
  return hex;
}

export function loadCanon(root) {
  const path = join(root, 'canon', 'brand.yaml');
  const raw = parse(readFileSync(path, 'utf8'));
  for (const key of ['name', 'palette', 'backgrounds', 'accents', 'typography']) {
    if (!raw?.[key]) throw new Error(`canon/brand.yaml is missing "${key}".`);
  }
  return {
    name: raw.name,
    palette: raw.palette,
    backgrounds: raw.backgrounds,
    accents: raw.accents,
    typography: raw.typography,
    logo: raw.logo ?? {},
    spacingBase: raw.spacing_base ?? 8,
  };
}

/** The one <link> that loads every Google-hosted family the canon declares.
 *  Licensed families load from public/fonts/ via @font-face instead, so they
 *  are skipped here. Returns null when nothing is Google-hosted.
 *
 *  Lives here because every page that renders brand type needs it, and a page
 *  that forgets it falls back to a system font without any visible error —
 *  which is exactly what happened to the deck index. */
export function googleFontsHref(canon) {
  // display and body are commonly the same family at different weights, so
  // merge by family or the URL asks Google for it twice.
  const byFamily = new Map();
  for (const f of Object.values(canon.typography)) {
    if (!f || typeof f !== 'object' || f.source !== 'google') continue;
    const weights = byFamily.get(f.family) ?? new Set();
    for (const w of f.weights ?? [400]) weights.add(w);
    byFamily.set(f.family, weights);
  }
  const families = [...byFamily].map(([family, weights]) =>
    `family=${encodeURIComponent(family)}:wght@${[...weights].sort((a, b) => a - b).join(';')}`);
  return families.length ? `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap` : null;
}

/** The language the decks are written in, from canon/voice.yaml. Drives the
 *  <html lang> attribute and the handful of strings deckkit supplies itself.
 *  Defaults to English when voice.yaml is absent or silent — the onboarding
 *  asks for it, but the repo has to build before the onboarding has run. */
export function loadLanguage(root) {
  try {
    const voice = parse(readFileSync(join(root, 'canon', 'voice.yaml'), 'utf8'));
    return voice?.language ?? 'en';
  } catch {
    return 'en';
  }
}
