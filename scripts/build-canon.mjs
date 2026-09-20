/** canon/brand.yaml -> src/styles/tokens.generated.css
 *  Palette custom properties, spacing scale, global chrome tokens, and one class
 *  per background and per accent carrying the semantic variables the templates
 *  use. Fails the build when text would not reach WCAG AA. */
import { writeFileSync, readFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCanon, resolveRef } from './lib/canon.mjs';
import { pickForeground, contrastRatio, relativeLuminance } from './lib/color.mjs';

const SPACING_STEPS = [1, 2, 3, 4, 5, 6, 8, 10, 12];
const AA = 4.5;

const sortedSteps = (steps) => Object.keys(steps).map(Number).sort((a, b) => a - b);
const lightest = (steps) => steps[sortedSteps(steps)[0]];
const darkest = (steps) => steps[sortedSteps(steps).at(-1)];

/** Extremes of every scale. The background's own scale goes first. */
function foregroundCandidates(palette, preferScale) {
  const ext = (steps) => (sortedSteps(steps).length ? [lightest(steps), darkest(steps)] : []);
  const own = palette[preferScale] ? ext(palette[preferScale]) : [];
  const rest = Object.entries(palette).filter(([n]) => n !== preferScale).flatMap(([, s]) => ext(s));
  return [...new Set([...own, ...rest])];
}

/** Global chrome tokens for controls, progress bar, top bar. */
function chromeTokens(palette, accents) {
  const neutral = palette.neutral ?? Object.values(palette)
    .sort((a, b) => relativeLuminance(darkest(a)) - relativeLuminance(darkest(b)))[0];
  const first = Object.values(accents)[0];
  return {
    ink: darkest(neutral),
    paper: lightest(neutral),
    brand: resolveRef(palette, first.soft),
    brandLight: resolveRef(palette, first.light ?? first.soft),
  };
}

function fontStack(font, generic) {
  const parts = [`'${font.family}'`];
  if (font.fallback) parts.push(`'${font.fallback}'`);
  return [...parts, generic].join(', ');
}

export function buildCss(canon) {
  const { palette, backgrounds, accents, typography, logo, spacingBase } = canon;
  const chrome = chromeTokens(palette, accents);
  const L = ['/* GENERATED from canon/brand.yaml by scripts/build-canon.mjs. Do not edit. */', ':root {'];

  for (const [scale, steps] of Object.entries(palette))
    for (const [step, hex] of Object.entries(steps)) L.push(`  --c-${scale}-${step}: ${hex};`);
  for (const n of SPACING_STEPS) L.push(`  --sp-${n}: ${n * spacingBase}px;`);
  L.push(`  --ink: ${chrome.ink};`, `  --paper: ${chrome.paper};`);
  L.push(`  --brand: ${chrome.brand};`, `  --brand-light: ${chrome.brandLight};`);
  L.push(`  --font-display: ${fontStack(typography.display, 'sans-serif')};`);
  L.push(`  --font-body: ${fontStack(typography.body, 'sans-serif')};`);
  L.push(`  --font-mono: ${fontStack(typography.mono, 'ui-monospace, monospace')};`);
  L.push('}');

  // Licensed fonts live in public/fonts/ (gitignored) and need @font-face; Google fonts arrive by <link>.
  for (const role of ['display', 'body', 'mono']) {
    const f = typography[role];
    if (f?.source !== 'local') continue;
    if (!f.files) throw new Error(`canon/brand.yaml: typography.${role} is local but has no "files" ({ weight: filename }).`);
    for (const [weight, file] of Object.entries(f.files)) {
      L.push('@font-face {', `  font-family: '${f.family}';`, `  src: url('/fonts/${file}') format('woff2');`,
             `  font-weight: ${weight};`, '  font-style: normal;', '  font-display: swap;', '}');
    }
  }

  for (const [name, a] of Object.entries(accents)) {
    L.push(`.accent-${name} {`);
    L.push(`  --accent: ${resolveRef(palette, a.strong)};`);
    L.push(`  --accent-soft: ${resolveRef(palette, a.soft)};`);
    L.push(`  --accent-light: ${resolveRef(palette, a.light ?? a.soft)};`);
    L.push('}');
  }

  for (const [name, b] of Object.entries(backgrounds)) {
    const bg = resolveRef(palette, b.bg);
    const isLight = relativeLuminance(bg) > 0.4;
    L.push(`.bg-${name} {`, `  --bg: ${bg};`);

    if (isLight && b.fg === 'auto') {
      // Light background: text takes the section accent. Every accent must read on it.
      for (const [an, a] of Object.entries(accents)) {
        const strong = resolveRef(palette, a.strong);
        const ratio = contrastRatio(strong, bg);
        if (ratio < AA) throw new Error(
          `Accent "${an}" (${strong}) does not reach AA on background "${name}" (${bg}): ${ratio.toFixed(2)}:1.\n` +
          `Fix: darken accents.${an}.strong in canon/brand.yaml, or don't pair them.`);
      }
      L.push('  --fg: var(--accent);', '  --fg-soft: var(--accent-soft);', '  --title: var(--accent);');
      L.push('  --accent-visible: var(--accent);');
      L.push('  --panel-bg: var(--accent);', '  --panel-fg: var(--paper);');
    } else {
      const fg = b.fg === 'auto'
        ? pickForeground(bg, foregroundCandidates(palette, String(b.bg).split('.')[0])).hex
        : resolveRef(palette, b.fg);
      L.push(`  --fg: ${fg};`, '  --fg-soft: color-mix(in srgb, var(--fg) 72%, var(--bg));', '  --title: var(--fg);');
      L.push(`  --accent-visible: ${isLight ? 'var(--accent)' : 'var(--accent-light)'};`);
      L.push('  --panel-bg: color-mix(in srgb, var(--bg) 80%, var(--paper));', '  --panel-fg: var(--paper);');
    }
    L.push('  --rule: color-mix(in srgb, var(--fg) 20%, var(--bg));');
    L.push(`  --logo: url('${logo?.[b.logo] ?? ''}');`, '}');
  }
  return L.join('\n') + '\n';
}

/** A text wordmark used until the founder drops in a real logo. Transparent
 *  canvas, brand name only — never something that could pass for a real mark. */
export function placeholderLogo(name, ink) {
  const safe = String(name).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
  const width = Math.max(120, safe.length * 34 + 24);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 64" width="${width}" height="64" role="img" aria-label="${safe}">` +
    `<text x="12" y="46" font-family="Inter, system-ui, sans-serif" font-size="44" font-weight="700" letter-spacing="-0.5" fill="${ink}">${safe}</text></svg>\n`;
}

/** Writes canon.logo.dark / .light only when those files do not exist yet. */
export function ensurePlaceholderLogos(canon, root) {
  const chrome = chromeTokens(canon.palette, canon.accents);
  const created = [];
  for (const [variant, ink] of [['dark', chrome.ink], ['light', chrome.paper]]) {
    const rel = canon.logo?.[variant]; if (!rel) continue;
    const abs = join(root, 'public', rel.replace(/^\//, ''));
    if (existsSync(abs)) continue;
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, placeholderLogo(canon.name, ink));
    created.push(rel);
  }
  return created;
}

/** Astro keeps validated content in node_modules/.astro/data-store.json. Editing
 *  canon/brand.yaml touches no .mdx file, so the store is reused and slides keep
 *  validating against the PREVIOUS canon — rename an accent and the build stays
 *  green while every slide points at one that no longer exists. Clearing the
 *  store forces the closed lists in src/content.config.ts to be applied again.
 *  Returns whether there was a store to clear. */
export function invalidateContentStore(root) {
  const store = join(root, 'node_modules', '.astro', 'data-store.json');
  if (!existsSync(store)) return false;
  rmSync(store);
  return true;
}

const runningAsScript = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (runningAsScript) {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const out = join(root, 'src', 'styles', 'tokens.generated.css');
  mkdirSync(dirname(out), { recursive: true });
  const canon = loadCanon(root);
  const css = buildCss(canon);
  const previous = existsSync(out) ? readFileSync(out, 'utf8') : null;
  writeFileSync(out, css);
  console.log(`canon -> ${out}`);

  // Only when the canon actually moved: any change that renames a background or
  // an accent changes this CSS, and the slides have to face the new closed lists.
  if (previous !== css && invalidateContentStore(root))
    console.log('canon changed -> cleared the Astro content cache so slides revalidate');
  const made = ensurePlaceholderLogos(canon, root);
  if (made.length) console.log(`placeholder logos -> ${made.join(', ')} (replace with your own)`);
}
