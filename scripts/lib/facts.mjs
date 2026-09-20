import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

export function loadFacts(root) {
  const p = join(root, 'canon', 'facts.yaml');
  const data = existsSync(p) ? parse(readFileSync(p, 'utf8')) : [];
  return Array.isArray(data) ? data : [];
}

/** Facts whose reviewedOn + validForDays is before `today`. */
export function expiredFacts(facts, today = new Date()) {
  const out = [];
  for (const f of facts) {
    const reviewed = new Date(f.reviewedOn);
    if (Number.isNaN(reviewed.getTime())) continue;
    const expires = new Date(reviewed); expires.setUTCDate(expires.getUTCDate() + Number(f.validForDays ?? 0));
    if (expires < today) out.push({ id: f.id, expiredOn: expires.toISOString().slice(0, 10) });
  }
  return out;
}
