/** What can be known about an image without opening a browser.
 *
 *  Dimensions come from the file header. PNG and JPEG both carry them in the
 *  first few hundred bytes, so this needs no dependency — which matters in a
 *  repo whose only runtime deps are astro, mdx and yaml.
 */
import { readFileSync } from 'node:fs';

/** Suggested budgets, NOT enforced here.
 *
 *  A weight limit and a shape limit are judgement calls: 500 KB is generous for
 *  a deck sent over mobile data and stingy for one shown on an office wall, and
 *  4:1 is a preference about panels, not a defect. Rules in `evals/` hold for
 *  every deck ever made with this; these do not, so they live in
 *  `evals/mine/` where whoever wants them can set their own numbers.
 *
 *  What stays universal: an image that does not load, and an image with no alt
 *  text. Both are broken for anybody. */
export const SUGGESTED = {
  bytes: 500 * 1024,
  edge: 2400,
  ratio: 4,
};

export function readSize(buf) {
  // PNG: 8-byte signature, then IHDR with width and height as big-endian u32.
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  // JPEG: walk the segments to a start-of-frame marker, which carries the size.
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    // <= : the frame header needs bytes i..i+8, so i may sit exactly at
    // length-9. The strict form skipped a SOF that ended the file.
    while (i <= buf.length - 9) {
      if (buf[i] !== 0xff) { i++; continue; }
      const marker = buf[i + 1];
      // SOF0..SOF15, excluding the four that are not frame headers.
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
      }
      i += 2 + buf.readUInt16BE(i + 2);
    }
  }
  return null;
}

/** Facts about the file. Deciding which of them is a problem is the caller's
 *  job — that is where taste lives. */
export function inspect(path) {
  const buf = readFileSync(path);
  const size = readSize(buf);
  const ratio = size ? Math.max(size.width / size.height, size.height / size.width) : null;
  return { bytes: buf.length, size, ratio, edge: size ? Math.max(size.width, size.height) : null };
}

/** Measures against whichever budgets the caller passes. Defaults to the
 *  suggested ones so `evals/mine/` can call it with a single line. */
export function against(path, budgets = SUGGESTED) {
  const f = inspect(path);
  const problems = [];
  if (budgets.bytes && f.bytes > budgets.bytes) {
    problems.push(`${(f.bytes / 1024).toFixed(0)} KB (budget ${Math.round(budgets.bytes / 1024)} KB)`);
  }
  if (budgets.edge && f.edge && f.edge > budgets.edge) {
    problems.push(`${f.size.width}x${f.size.height} — longest edge over ${budgets.edge}px`);
  }
  if (budgets.ratio && f.ratio && f.ratio > budgets.ratio) {
    problems.push(`${f.size.width}x${f.size.height} is ${f.ratio.toFixed(1)}:1`);
  }
  return problems;
}
