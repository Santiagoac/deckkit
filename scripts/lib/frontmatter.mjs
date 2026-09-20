import { parse } from 'yaml';
/** Splits `---\nyaml\n---\nbody`. Returns { data: {}, body } when there is no frontmatter. */
export function splitFrontmatter(src) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(src);
  if (!m) return { data: {}, body: src };
  return { data: parse(m[1]) ?? {}, body: m[2] };
}
