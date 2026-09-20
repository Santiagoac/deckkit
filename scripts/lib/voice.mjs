import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

export function loadVoice(root) {
  const p = join(root, 'canon', 'voice.yaml');
  return existsSync(p) ? (parse(readFileSync(p, 'utf8')) ?? {}) : {};
}

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Banned terms present in `text`. Non-strict terms are ignored inside <Quote>…</Quote>
 *  and everywhere when the slide is customerVoice: those are the customer's words. */
export function findBannedTerms(text, banned = [], { customerVoice = false } = {}) {
  const withoutQuotes = text.replace(/<Quote[\s\S]*?<\/Quote>/gi, ' ');
  const hits = [];
  for (const b of banned) {
    if (!b?.term) continue;
    const strict = b.strict === true;
    if (customerVoice && !strict) continue;
    const haystack = strict ? text : withoutQuotes;
    const re = new RegExp(`\\b${escape(String(b.term))}\\b`, 'gi');
    const count = (haystack.match(re) ?? []).length;
    if (count) hits.push({ term: b.term, useInstead: b.use_instead ?? '', count });
  }
  return hits;
}
