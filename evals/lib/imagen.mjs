/** What can be known about an image without opening a browser.
 *
 *  Dimensions come from the file header. PNG and JPEG both carry them in the
 *  first few hundred bytes, so this needs no dependency — which matters in a
 *  repo whose only runtime deps are astro, mdx and yaml.
 */
import { readFileSync } from 'node:fs';

/** A deck is a link someone opens on their phone, often on mobile data. */
export const MAX_BYTES = 500 * 1024;
/** Past this the image is wider than any screen it will ever land on, and the
 *  extra pixels are download time nobody sees. */
export const MAX_EDGE = 2400;
/** A panel is roughly square-ish to 16:9. Past this the image can only sit in
 *  its box as a thin strip with air around it. */
export const MAX_RATIO = 4;

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

export function inspect(path) {
  const buf = readFileSync(path);
  const size = readSize(buf);
  const problems = [];

  if (buf.length > MAX_BYTES) {
    problems.push(`${(buf.length / 1024).toFixed(0)} KB — heavy for a link opened on mobile data (budget ${MAX_BYTES / 1024} KB)`);
  }
  if (size) {
    const edge = Math.max(size.width, size.height);
    if (edge > MAX_EDGE) {
      problems.push(`${size.width}x${size.height} — larger than any screen it lands on (cap ${MAX_EDGE}px)`);
    }
    const ratio = Math.max(size.width / size.height, size.height / size.width);
    if (ratio > MAX_RATIO) {
      problems.push(`${size.width}x${size.height} is ${ratio.toFixed(1)}:1 — too elongated to fill its panel`);
    }
  }
  return { bytes: buf.length, size, problems };
}
