/** Color math for the canon build. No dependencies; WCAG 2.x formulas. */

export function hexToRgb(hex) {
  let h = String(hex).trim().replace('#', '');
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) throw new Error(`Invalid hex color: ${hex}`);
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
}

export function relativeLuminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a, b) {
  const [la, lb] = [relativeLuminance(a), relativeLuminance(b)];
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** First candidate that reaches AA (4.5:1) on `bg`. Throws if none does. */
export function pickForeground(bg, candidates) {
  let best = { hex: null, ratio: 0 };
  for (const hex of candidates) {
    const ratio = contrastRatio(hex, bg);
    if (ratio >= 4.5) return { hex, ratio };
    if (ratio > best.ratio) best = { hex, ratio };
  }
  throw new Error(
    `No foreground reaches AA (4.5:1) on ${bg}. Best was ${best.hex} at ${best.ratio.toFixed(2)}:1.\n` +
    `Fix: add a lighter or darker step to this scale in canon/brand.yaml.`,
  );
}
