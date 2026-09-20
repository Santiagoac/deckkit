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
