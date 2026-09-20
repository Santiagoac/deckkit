import { defineCollection, reference, z } from 'astro:content';
import { glob, file } from 'astro/loaders';
import { loadCanon } from '../scripts/lib/canon.mjs';

/** Closed lists. Backgrounds and accents come from canon/brand.yaml, so every
 *  founder gets their own. Writing anything else fails the build and says why. */
const canon = loadCanon(process.cwd());
export const BACKGROUNDS = Object.keys(canon.backgrounds) as [string, ...string[]];
export const ACCENTS = Object.keys(canon.accents) as [string, ...string[]];
export const TEMPLATES = [
  'cover', 'statement', 'numbered-split', 'pillar',
  'metrics', 'product', 'team', 'logo-wall', 'closing',
] as const;

const visual = z.object({
  type: z.enum(['image', 'mockup', 'none']),
  src: z.string().optional(),
  alt: z.string().optional(),
  component: z.string().optional(),
  framing: z.enum(['contained', 'bleed']).default('contained'),
});

const slides = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/slides' }),
  schema: z.object({
    title: z.string(),
    // Astro reserves `layout` in MDX frontmatter (resolves it as an import), hence `template`.
    template: z.enum(TEMPLATES, {
      errorMap: () => ({ message: `Unknown template. Valid: ${TEMPLATES.join(', ')}` }),
    }),
    background: z.enum(BACKGROUNDS, {
      errorMap: () => ({ message: `Unknown background. Declare it in canon/brand.yaml. Valid: ${BACKGROUNDS.join(', ')}` }),
    }),
    accent: z.enum(ACCENTS, {
      errorMap: () => ({ message: `Unknown accent. Declare it in canon/brand.yaml. Valid: ${ACCENTS.join(', ')}` }),
    }).default(ACCENTS[0]),
    eyebrow: z.string().optional(),
    closing: z.string().optional(),
    footer: z.string().default(''),
    visual: visual.optional(),
    notes: z.string().optional(),
    /** Marks quoted customer speech. Lexicon rules (phase 2) relax inside it. */
    customerVoice: z.boolean().default(false),
  }),
});

const decks = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/decks' }),
  schema: z.object({
    name: z.string(),
    audience: z.string(),
    status: z.enum(['published', 'draft']),
    // reference() makes the build verify every slide id exists.
    slides: z.array(reference('slides')),
  }).refine((d) => d.status !== 'published' || d.slides.length > 0,
    { message: 'A published deck needs at least one slide.', path: ['slides'] }),
});

const facts = defineCollection({
  loader: file('./canon/facts.yaml'),
  schema: z.object({
    id: z.string(),
    value: z.string(),
    label: z.string(),
    source: z.string(),
    reviewedOn: z.coerce.date(),
    validForDays: z.number().int().positive(),
    usage: z.array(z.enum(['sales', 'marketing', 'internal'])).min(1),
  }),
});

const team = defineCollection({
  loader: file('./canon/team.yaml'),
  schema: z.object({ id: z.string(), name: z.string(), role: z.string(), photo: z.string() }),
});

const logos = defineCollection({
  loader: file('./canon/logos.yaml'),
  schema: z.object({ id: z.string(), group: z.enum(['customers', 'investors']), src: z.string(), alt: z.string() }),
});

export const collections = { slides, decks, facts, team, logos };
