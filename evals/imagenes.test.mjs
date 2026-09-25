import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';


const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const slidesDir = join(root, 'src', 'content', 'slides');

/** Every `visual:` declared across the deck, with the slide that declared it. */
function visuals() {
  if (!existsSync(slidesDir)) return [];
  return readdirSync(slidesDir).filter((f) => f.endsWith('.mdx')).flatMap((file) => {
    const text = readFileSync(join(slidesDir, file), 'utf8');
    const block = text.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
    const line = block.match(/^visual:\s*(.+)$/m)?.[1];
    if (!line || /type:\s*none/.test(line)) return [];
    return [{
      slide: file.replace('.mdx', ''),
      src: line.match(/src:\s*([^,}\s]+)/)?.[1] ?? null,
      alt: line.match(/alt:\s*"([^"]*)"/)?.[1] ?? line.match(/alt:\s*([^,}]+)/)?.[1]?.trim() ?? null,
      type: line.match(/type:\s*(\w+)/)?.[1] ?? null,
    }];
  });
}

test('every image a slide points at is actually there', () => {
  const missing = visuals()
    .filter((v) => v.type === 'image' && v.src)
    .filter((v) => !existsSync(join(root, 'public', v.src.replace(/^\//, ''))))
    .map((v) => `${v.slide} → ${v.src}`);
  assert.deepEqual(missing, [], 'a missing image renders as a blank panel, not an error');
});

test('every image has alt text', () => {
  const mute = visuals()
    .filter((v) => v.type === 'image')
    .filter((v) => !v.alt || !v.alt.trim())
    .map((v) => v.slide);
  assert.deepEqual(mute, [], 'a deck is a link; someone will open it with a screen reader');
});

// Weight and shape budgets are judgement calls, so they are not here. See
// evals/mine/ejemplo.test.mjs for a version you can set your own numbers on.
