/** Measures every slide of every published deck, in a real browser, at both
 *  the shapes a deck actually gets looked at in.
 *
 *  The engine already does the hard part. `fit()` in src/deck/runtime.ts binary
 *  searches a scale factor until the slide's content fits its box, and marks
 *  `data-overflows` when even the floor is not enough. So this does not
 *  re-implement any layout logic — it builds the site, opens it, and reads the
 *  two numbers the deck computed about itself.
 *
 *  Two failures, and they are not the same thing:
 *
 *    overflows   content is cut off. Broken, and it fails.
 *    low fit     it fits, by rendering smaller than its neighbours. Not broken,
 *                but it is the thing CLAUDE.md warns about: "if one looks
 *                smaller than the rest, it has too much content". Warned.
 */
import { execFileSync, spawn } from 'node:child_process';
import { readFileSync, readdirSync, existsSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

/** Below this a slide is unreadable from across a room; it fails. */
export const FIT_FLOOR = 0.6;
/** Below this it fits but looks out of scale beside its neighbours; it warns. */
export const FIT_WARN = 0.85;

/** The two shapes a deck is actually looked at in: a laptop in a meeting and a
 *  phone on the other end of a link. Anything between these behaves like one
 *  of them. */
export const VIEWPORTS = [
  { name: 'desktop 1440x900', width: 1440, height: 900 },
  { name: 'phone 390x844', width: 390, height: 844 },
];

const CHROME = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].find((p) => existsSync(p));

export function chromeAvailable() { return Boolean(CHROME); }

/** Chrome refuses viewports under ~500px wide in headless, and a phone is
 *  narrower than that. An iframe of the exact size gives the page a real
 *  viewport for its media queries and its container units. */
function harness(url, width, height) {
  return `<!doctype html><meta charset=utf-8>
<style>html,body{margin:0}iframe{width:${width}px;height:${height}px;border:0;display:block}</style>
<iframe id=f src="${url}"></iframe>
<script>
f.addEventListener('load', () => setTimeout(() => {
  const w = f.contentWindow, d = w.document;
  const out = [...d.querySelectorAll('.slide')].map((s) => {
    const box = s.getBoundingClientRect();
    // How much of the slide each image actually takes. A rule like "the
    // closing image is a signature, not the subject" is a claim about this
    // number, and there is no way to know it without rendering.
    const imgs = [...s.querySelectorAll('img')].map((im) => {
      const r = im.getBoundingClientRect();
      return {
        src: (im.getAttribute('src') || '').split('/').pop(),
        heightRatio: box.height ? +(r.height / box.height).toFixed(3) : 0,
        widthRatio: box.width ? +(r.width / box.width).toFixed(3) : 0,
      };
    }).filter((i) => i.heightRatio > 0);

    // Content sitting on top of other content. Only siblings are compared —
    // a child always intersects its parent, and that is not a defect. A few
    // pixels of touching is rounding; a quarter of the smaller box is not.
    const overlaps = [];
    const visible = (el) => {
      const st = w.getComputedStyle(el);
      return st.position !== 'absolute' && st.position !== 'fixed'
        && st.display !== 'none' && st.visibility !== 'hidden'
        && (el.textContent || '').trim().length > 0;
    };
    for (const parent of s.querySelectorAll('*')) {
      const kids = [...parent.children].filter(visible);
      for (let a = 0; a < kids.length; a++) {
        for (let b = a + 1; b < kids.length; b++) {
          const r1 = kids[a].getBoundingClientRect();
          const r2 = kids[b].getBoundingClientRect();
          const ox = Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left);
          const oy = Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top);
          if (ox <= 1 || oy <= 1) continue;
          const area = ox * oy;
          const smaller = Math.min(r1.width * r1.height, r2.width * r2.height);
          if (smaller > 0 && area / smaller > 0.25) {
            overlaps.push(kids[a].tagName.toLowerCase() + ' over ' + kids[b].tagName.toLowerCase());
          }
        }
      }
    }

    return {
      id: s.dataset.slideId || s.id || '',
      fit: parseFloat(w.getComputedStyle(s).getPropertyValue('--fit')) || 1,
      overflows: s.dataset.overflows === 'si',
      images: imgs,
      overlaps: [...new Set(overlaps)],
    };
  });
  document.title = 'RESULT' + JSON.stringify(out);
}, 1200));
</script>`;
}

/** The harness is written into dist/ and loaded over http rather than from a
 *  temp dir over file://. An iframe is only readable from the same origin, and
 *  file:// to http:// is not — reading it there throws SecurityError and the
 *  page reports nothing at all. */
function dumpTitle(base, path, width, height) {
  const name = `__eval-${width}x${height}.html`;
  writeFileSync(join(root, 'dist', name), harness(path, width, height));
  const dom = execFileSync(CHROME, [
    '--headless=new', '--disable-gpu', '--no-sandbox',
    `--window-size=${Math.max(width, 900)},${Math.max(height, 900)}`,
    '--virtual-time-budget=9000', '--dump-dom', `${base}/${name}`,
  ], {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
    // Chrome writes pages of CVDisplayLink warnings on macOS headless. They
    // are harmless and they are also the first thing a founder would read as
    // "something broke", so they do not reach the terminal.
    stdio: ['ignore', 'pipe', 'ignore'],
  });

  const m = dom.match(/<title>RESULT(.*?)<\/title>/s);
  if (!m) throw new Error(`The deck never reported its layout at ${width}x${height}.`);
  return JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&'));
}

function publishedDecks() {
  const dir = join(root, 'src', 'content', 'decks');
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith('.yaml'))
    .map((f) => parse(readFileSync(join(dir, f), 'utf8')))
    .filter((d) => d?.status === 'published' && d?.slug);
}

export async function measureDeck() {
  if (!CHROME) {
    // On someone's laptop, missing Chrome is a missing tool and should not
    // read as a broken deck. In CI it means the check silently stopped
    // running, which is worse than a red build — so there, it fails.
    if (process.env.CI) {
      throw new Error('No Chrome on this runner, so the slide layout went unchecked.');
    }
    console.error(
      '\n  Skipping the layout check: no Chrome found.\n'
      + '  Install Google Chrome to have your slides measured before you publish.\n',
    );
    return [];
  }

  execFileSync('npm', ['run', 'build'], { cwd: root, stdio: 'pipe' });

  const port = 8700 + (process.pid % 200);
  const server = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'],
    { cwd: join(root, 'dist'), stdio: 'ignore' });

  try {
    // Give the server a moment; a refused connection reads as an empty deck.
    await new Promise((r) => setTimeout(r, 700));

    return publishedDecks().map((deck) => {
      const base = `http://127.0.0.1:${port}`;
      const byViewport = {};
      for (const v of VIEWPORTS) byViewport[v.name] = dumpTitle(base, `/${deck.slug}/`, v.width, v.height);

      const slides = (deck.slides ?? []).map((id, i) => {
        const per = {};
        for (const v of VIEWPORTS) per[v.name] = byViewport[v.name][i] ?? { fit: 1, overflows: false, images: [], overlaps: [] };

        const worst = Object.entries(per)
          .map(([viewport, r]) => ({ viewport, ...r }))
          .sort((a, b) => a.fit - b.fit)[0];

        // The tallest an image gets across the viewports measured: a rule about
        // an image's weight has to hold on the screen where it weighs most.
        const images = Object.entries(per).flatMap(([viewport, r]) =>
          (r.images ?? []).map((im) => ({ viewport, ...im })));

        return {
          id,
          byViewport: per,
          worst,
          images,
          overflows: Object.entries(per).filter(([, r]) => r.overflows).map(([v]) => v),
          overlaps: Object.entries(per).flatMap(([viewport, r]) =>
            (r.overlaps ?? []).map((o) => `${o} on ${viewport}`)),
        };
      });

      return { deck: deck.name ?? deck.slug, slides };
    });
  } finally {
    server.kill();
    for (const v of VIEWPORTS) {
      rmSync(join(root, 'dist', `__eval-${v.width}x${v.height}.html`), { force: true });
    }
  }
}
