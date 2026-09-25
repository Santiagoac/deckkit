import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readSize, against, SUGGESTED } from './imagen.mjs';

const png = (w, h) => {
  const b = Buffer.alloc(26);
  b.writeUInt32BE(0x89504e47, 0);
  b.writeUInt32BE(w, 16); b.writeUInt32BE(h, 20);
  return b;
};

test('reads the size out of a PNG header', () => {
  assert.deepEqual(readSize(png(1920, 1080)), { width: 1920, height: 1080 });
});

test('reads the size out of a JPEG start-of-frame', () => {
  const b = Buffer.from([
    0xff, 0xd8,                          // SOI
    0xff, 0xe0, 0x00, 0x04, 0x00, 0x00,  // APP0, length 4
    0xff, 0xc0, 0x00, 0x11, 0x08,        // SOF0, length 17, precision
    0x02, 0x58,                          // height 600
    0x03, 0x20,                          // width 800
  ]);
  assert.deepEqual(readSize(b), { width: 800, height: 600 });
});

test('an unknown format returns null rather than a wrong guess', () => {
  assert.equal(readSize(Buffer.from('GIF89a')), null);
  assert.equal(readSize(Buffer.alloc(0)), null);
});

test('the suggested ratio is loose enough for a photo, tight enough for a banner', () => {
  assert.ok(1920 / 1080 < SUGGESTED.ratio, '16:9 passes');
  assert.ok(3200 / 180 > SUGGESTED.ratio, 'a 17:1 banner does not');
});

// The budgets belong to the caller now, which is the whole point of moving
// them out of the template's evals.
test('against() measures the numbers it is handed, not numbers of its own', async () => {
  const { writeFileSync, mkdtempSync } = await import('node:fs');
  const { join } = await import('node:path');
  const { tmpdir } = await import('node:os');

  const file = join(mkdtempSync(join(tmpdir(), 'img-')), 'a.png');
  writeFileSync(file, png(3200, 180));   // 17.8:1, tiny on disk

  assert.equal(against(file, { ratio: 20 }).length, 0, 'a loose budget passes it');
  assert.equal(against(file, { ratio: 4 }).length, 1, 'a tight one does not');
  assert.equal(against(file, {}).length, 0, 'no budget, no opinion');
});
