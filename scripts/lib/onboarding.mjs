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
  const ready = steps.filter((s) => s.required).every((s) => s.status === 'done');
  const next = steps.find((s) => s.status !== 'done')?.id ?? null;
  return { steps, ready, next };
}
