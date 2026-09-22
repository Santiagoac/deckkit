import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

export const STEPS = [
  { id: 'company',          label: 'Company',        required: true },
  { id: 'brand',            label: 'Brand',          required: true },
  { id: 'resources',        label: 'Resources',      required: false },
  { id: 'people-and-proof', label: 'People & proof', required: false },
  { id: 'voice',            label: 'Voice',          required: true },
];
const STATUSES = ['pending', 'partial', 'done'];

/** Who may see `/`. It lists every deck WITH its URL, so an open index hands
 *  over the unguessable links — which makes this the setting the slug scheme
 *  rests on. Left `pending` on purpose: it is a decision, not a default. */
export const INDEX_ACCESS = ['pending', 'password', 'public'];

export function loadOnboarding(root) {
  return parse(readFileSync(join(root, 'canon', 'onboarding.yaml'), 'utf8'));
}

export function summarize(state) {
  const steps = STEPS.map((s) => {
    const status = state?.steps?.[s.id] ?? 'pending';
    if (!STATUSES.includes(status)) {
      throw new Error(`canon/onboarding.yaml: step "${s.id}" has status "${status}". Use one of: ${STATUSES.join(', ')}.`);
    }
    return { ...s, status };
  });
  const indexAccess = state?.index_access ?? 'pending';
  if (!INDEX_ACCESS.includes(indexAccess)) {
    throw new Error(`canon/onboarding.yaml: index_access is "${indexAccess}". Use one of: ${INDEX_ACCESS.join(', ')}.`);
  }

  const ready = steps.filter((s) => s.required).every((s) => s.status === 'done');
  const next = steps.find((s) => s.status !== 'done')?.id ?? null;
  // An undecided index does not stop you writing slides — it stops you putting
  // them somewhere anyone can find the rest of them.
  const readyToPublish = ready && indexAccess !== 'pending';
  return { steps, ready, next, indexAccess, readyToPublish };
}
