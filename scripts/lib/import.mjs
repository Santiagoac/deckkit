import { spawnSync } from 'node:child_process';

export function slugify(s) {
  return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function whichSync(name) {
  const r = spawnSync(process.platform === 'win32' ? 'where' : 'which', [name], { encoding: 'utf8' });
  return r.status === 0 ? r.stdout.trim() : null;
}

/** Names from `names` that are not on PATH. */
export function detectTools(names, which = whichSync) {
  return names.filter((n) => !which(n));
}

const yamlString = (s) => `"${String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;

/** One page of extracted text -> one slide draft. Heuristic on purpose: the
 *  founder reviews every draft with the skill before it enters src/content. */
export function draftFromPageText(text, n, { deck, background, accent }) {
  const lines = String(text).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const title = lines[0] && lines[0].length <= 120 ? lines[0] : `Slide ${n}`;
  const body = lines.slice(1).filter((l) => l.length <= 160);
  const nn = String(n).padStart(2, '0');
  const template = body.length ? 'numbered-split' : 'statement';
  const fm = [
    '---', `title: ${yamlString(title)}`, `template: ${template}`, `background: ${background}`, `accent: ${accent}`,
    `notes: ${yamlString(`Imported from ${deck} page ${n}. Review before use.`)}`, '---', '',
  ];
  const list = body.length ? ['<List>', ...body.map((l) => `  <Bullet>${l.replace(/</g, '&lt;')}</Bullet>`), '</List>', ''] : [];
  return { filename: `${nn}-${slugify(title) || `slide-${n}`}.mdx`, mdx: [...fm, ...list].join('\n') };
}
