---
name: deck-onboarding
description: Set up this deckkit repo for one company by interviewing the founder step by step — company, brand, resources, people & proof, voice — writing canon/ and company/, and resuming wherever it was left. Use when canon/onboarding.yaml has any step not done, when the user says "start", "set up", "onboarding", "continue onboarding", "configure my brand", or opens a fresh deckkit clone.
---

# Deck onboarding

You are setting this repo up for one company so it can write decks in its own
brand and never drift from it. Everything you collect lands in `canon/`
(machine-read, enforced by the build and `npm run evals`) or `company/`
(context for writing later). You never invent brand facts: if the founder
doesn't know something, leave it pending and say so.

## Before anything

1. Read `canon/onboarding.yaml` and run `npm run check`. In one short paragraph,
   in the founder's language, say which steps are done and which comes next.
2. Resume at the first step that is not `done`. Never redo a `done` step unless asked.
3. Offer to stop after any step — the file remembers where you were.
4. When a step finishes: write its files, run the validation listed for it, set
   the step to `done` (or `partial` if the founder paused) in
   `canon/onboarding.yaml`, and commit with a short English message.

Required to write slides: **1 Company, 2 Brand, 5 Voice.** Optional: 3, 4.

Batch 3–5 questions per turn. Always offer the fast path first: *"Give me your
company name, one brand color, one font and three words that describe your
tone, and I'll draft a v1 you can react to."*

## 1. Company → `company/positioning.md`, `company/audiences.md`

Ask: exact company name; what you sell in one line; to whom; the one sentence
you'd want a prospect to remember; stage; who you pitch to (each answer here is
a future deck). Also: what you are **not**.

Write `positioning.md` (name · one-liner · who · the sentence · stage · what it
is not) and `audiences.md` (a section per audience: who they are, what they care
about, what they must believe by the end). Validate: both files exist and are
non-empty. Mark `company: done`.

## 2. Brand → `canon/brand.yaml`, `company/brand-book.md`, `public/assets/logo-*.svg`

Run the vendored `brand-book-generator` skill for the interview and to lock
tokens (its Phases 0–2 and the `.md`; skip the `.jsx` unless asked). Then map the
locked tokens into `canon/brand.yaml` **exactly** as `references/canon-mapping.md`
says. Rules that don't bend:

- Full scales come from the script, never typed by hand:
  `python3 .claude/skills/brand-book-generator/scripts/color_tools.py scale "#HEX" --name primary`.
  No Python on this machine? Ask for at least steps 50 / 400 / 700 / 950, or
  propose a default and say it's a default.
- **Ask the licensing question out loud:** *"Are these fonts licensed webfonts
  you paid for, or Google Fonts?"* Licensed → `licensed: true`, `source: local`,
  `files` per weight, `.woff2` in `public/fonts/` (already gitignored), a
  `fallback` from `brand-book-generator/references/font-fallbacks.md`. Google →
  `source: google`. Tell them why the files won't be committed.
- Logo: ask for SVG, two variants — dark artwork for light backgrounds and light
  artwork for dark ones. Save as `public/assets/logo-dark.svg` and
  `logo-light.svg`. None yet? Keep the generated wordmark placeholders and say so.
- Keep the brand book as `company/brand-book.md`. The founder gets a manual out
  of this step, not just config.

Validate: `npm run canon` passes (it fails if any accent can't be read on a
light background — explain the pair and darken the accent), then `npm run build`.
Mark `brand: done`.

## 3. Resources → `reference/`, `public/assets/`, corrections to steps 1–2

**Website.** If you can fetch the URL, read the homepage and one product page.
Extract hex colors, font names, positioning copy. Propose additions or
corrections to `canon/brand.yaml` and `company/positioning.md`; the founder
confirms each one. Never overwrite step 2 silently.

**Old decks.** For each PDF: `npm run import-deck -- path/to/deck.pdf`. It
writes page renders and text to `reference/<deck>/` and one draft per page to
`reference/<deck>/slides/`. Walk the drafts with the founder: which to keep as
starting points (copy into `src/content/slides/`, then `npm run build`), which
illustrations to extract
(`npm run import-deck -- deck.pdf --crop <page> <x> <y> <w> <h> <name>`,
coordinates in PDF points; look at the page render first). If poppler is
missing the command says how to install it; the step stays optional.

**Images.** Collect into `public/assets/`. Ask whether any contains third-party
logos — those belong in step 4 with permission.

`reference/` is gitignored: say so, and ask before changing that. Mark
`resources: done` or `partial`.

## 4. People & proof → `canon/team.yaml`, `canon/logos.yaml`, `canon/facts.yaml`, `company/proof.md`

**Team.** Per person: name, role, photo path (square, under
`public/assets/team/`). **Ask:** *"Has each of these people agreed to appear in a
public deck?"* Only entries with `consent: true` build. No consent, no entry —
even for the founder.

**Customer and investor logos.** Files under `public/assets/logos/`. **Ask:**
*"Do you have permission to show each of these logos?"* Only `permission: true`
builds. Many contracts forbid it; when unsure, leave it out.

**Facts.** Every number they would put on a slide: `value`, `label`, `source`,
`reviewedOn`, `validForDays`, `usage` (`[sales, marketing]`, or `[internal]` for
a source that must never be shown outside). Ask for the source of each one.

**`proof.md`.** The story behind the numbers, notable customers, results — prose
for writing later.

Validate: `npm run build` (the schema enforces consent and permission) and
`npm run evals` (no expired facts). Mark `people-and-proof: done` or `partial`.

## 5. Voice → `canon/voice.yaml`

Ask: 3–5 tone adjectives; words you never want in a deck — and for each, what to
say instead and why; phrases legal requires and when; the tagline if there is
one; formality; a glossary of internal terms → customer terms. See
`references/voice-schema.md` for the exact shape.

Banned terms are checked on every slide by `npm run evals`. `<Quote>` (the
customer's own words) is exempt unless the term is `strict: true`. Validate:
`npm run evals`. Mark `voice: done`.

## When the required steps are done

Run `npm run check`. If it says ready, tell the founder they can write the
first deck — with the `deck-authoring` skill if present, otherwise by hand
following CLAUDE.md — and that publishing comes after (`deck-publish`). Commit.

## Rules

- Never invent brand facts, numbers, names or logos. Missing → ask, or leave
  pending and say so.
- Exact hex values. Scales from the script. Say what you substituted (fallback
  fonts, default palettes, placeholder logos).
- Personal data and third-party marks enter the repo only after the consent or
  permission question was answered yes — and the answer is recorded as the flag.
- Prose in the founder's language; keys, ids, filenames, code and commits in English.
- One step at a time. Don't ask what the repo already knows: read `canon/` and
  `company/` first.
