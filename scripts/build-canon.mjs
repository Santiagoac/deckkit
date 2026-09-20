/** canon/brand.yaml -> src/styles/tokens.generated.css
 *  Palette custom properties, spacing scale, one class per background and per
 *  accent. Fails the build when a background has no AA-compliant text color. */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCanon, resolveRef } from './lib/canon.mjs';
import { pickForeground } from './lib/color.mjs';

const SPACING_STEPS = [1, 2, 3, 4, 5, 6, 8, 10, 12];

/** Extremes of every scale, lightest and darkest. The background's own scale
 *  goes first: text on a neutral is that neutral's dark end, text on a primary
 *  is that primary's light end. */
function foregroundCandidates(palette, preferScale) {
  const extremes = (steps) => {
    const keys = Object.keys(steps).map(Number).sort((a, b) => a - b);
    return keys.length ? [steps[keys[0]], steps[keys.at(-1)]] : [];
  };
  const own = preferScale && palette[preferScale] ? extremes(palette[preferScale]) : [];
  const rest = Object.entries(palette)
    .filter(([name]) => name !== preferScale)
    .flatMap(([, steps]) => extremes(steps));
  return [...new Set([...own, ...rest])];
}

function fontStack(font, generic) {
  const parts = [`'${font.family}'`];
  if (font.fallback) parts.push(`'${font.fallback}'`);
  parts.push(generic);
  return parts.join(', ');
}

export function buildCss(canon) {
  const { palette, backgrounds, accents, typography, logo, spacingBase } = canon;
  const L = ['/* GENERATED from canon/brand.yaml by scripts/build-canon.mjs. Do not edit. */', ':root {'];

  for (const [scale, steps] of Object.entries(palette))
    for (const [step, hex] of Object.entries(steps)) L.push(`  --c-${scale}-${step}: ${hex};`);
  for (const n of SPACING_STEPS) L.push(`  --sp-${n}: ${n * spacingBase}px;`);
  L.push(`  --font-display: ${fontStack(typography.display, 'sans-serif')};`);
  L.push(`  --font-body: ${fontStack(typography.body, 'sans-serif')};`);
  L.push(`  --font-mono: ${fontStack(typography.mono, 'ui-monospace, monospace')};`);
  L.push('}');

  for (const [name, a] of Object.entries(accents)) {
    L.push(`.accent-${name} {`);
    L.push(`  --accent: ${resolveRef(palette, a.strong)};`);
    L.push(`  --accent-soft: ${resolveRef(palette, a.soft)};`);
    L.push(`  --accent-light: ${resolveRef(palette, a.light ?? a.soft)};`);
    L.push('}');
  }

  for (const [name, b] of Object.entries(backgrounds)) {
    const bg = resolveRef(palette, b.bg);
    const scale = String(b.bg).split('.')[0];
    const fg = b.fg === 'auto'
      ? pickForeground(bg, foregroundCandidates(palette, scale)).hex
      : resolveRef(palette, b.fg);
    L.push(`.bg-${name} {`);
    L.push(`  --bg: ${bg};`);
    L.push(`  --fg: ${fg};`);
    L.push(`  --logo: url('${logo?.[b.logo] ?? ''}');`);
    L.push('}');
  }
  return L.join('\n') + '\n';
}

const runningAsScript = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (runningAsScript) {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const out = join(root, 'src', 'styles', 'tokens.generated.css');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, buildCss(loadCanon(root)));
  console.log(`canon -> ${out}`);
}
