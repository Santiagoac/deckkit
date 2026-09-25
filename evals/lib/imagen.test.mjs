import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readSize, MAX_RATIO } from './imagen.mjs';

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

test('the ratio cap is loose enough for a normal photo, tight enough for a banner', () => {
  assert.ok(1920 / 1080 < MAX_RATIO, '16:9 passes');
  assert.ok(3200 / 180 > MAX_RATIO, 'a 17:1 banner does not');
});
