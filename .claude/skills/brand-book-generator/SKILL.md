---
name: brand-book-generator
description: Generate brand books and design guidelines through a guided interview, from scratch or from reference material. Produces a structured .md design guidelines document, an interactive .jsx brand book component, and optionally a brand assets kit (ZIP with SVG logo variants). Use this skill whenever the user wants to create, document, formalize or refresh brand guidelines, a brand book, design system docs, visual identity, style guide, design tokens, or a color/typography system for a new or existing project. Trigger on "brand book", "brand guidelines", "design guidelines", "visual identity", "design system", "style guide", "lineamientos de diseño", "manual de marca", "identidad visual", or when the user shares a logo, palette, fonts, screenshots or an existing guidelines file and wants it turned into documentation. Also trigger when the user wants to design a logo, create logo variants, or generate a downloadable brand kit. Do NOT use for applying an already-documented brand to an output (use that brand's own skill).
---

# Brand Book Generator

Turn brand inputs into two consistent deliverables, plus an optional third:

1. **Design Guidelines (.md)** - source of truth for developers and designers
2. **Brand Book (.jsx)** - interactive React showcase of the same system
3. **Brand Kit (.zip)** - only if the user wants logo SVG variants

The `.md` is the source of truth. The `.jsx` renders what the `.md` says. They must never disagree; `scripts/check_consistency.py` enforces this before delivery.

## Workflow

```
0. Intake        detect mode (reference-first / from scratch), set output language
1. Interview     only ask what's missing; batch questions; offer a fast path
2. Tokens        lock colors (scales via script), fonts (+ fallbacks), spacing
3. Logo          embed / render / design / skip
4. Generate      write .md first, then .jsx from the same tokens
5. Verify        run check_consistency + contrast, fix, deliver
```

---

## Phase 0: Intake

Before asking anything, look at what the user gave you.

**Reference-first mode** (user shared any of: an existing guidelines file, a logo, a palette, fonts, screenshots, a website URL, a Figma export, an old brand book):
- Extract everything you can: name, colors (every hex), fonts, tone words, rules, components.
- Build a short "what I found / what's missing" summary and show it. Only interview on the gaps.
- If they shared a similar brand's guidelines as a *format* reference (not the brand itself), treat it as structure only and say so.

**From-scratch mode** (nothing shared): run the full interview below.

**Output language:** match the language the user writes in. If their references mix languages (common: Spanish prose, English tokens), keep tokens/code in English and prose in the user's language. Don't ask about this unless it's ambiguous.

---

## Phase 1: Interview

Batch questions so each turn asks 3-5 things max. On mobile or when tappable options are available, use them for closed questions (logo type, warm vs cool neutrals, spacing base, tone spectrum). Free text for names, taglines, hex values.

Always offer the **fast path** in the first message: "Dame nombre, color principal, tipografía y 3 adjetivos de tono y armo un v1. Luego iteramos." Many users prefer to react to a draft than answer 25 questions.

**Batch 1: Essence** (required)
- Brand name (exact casing, special characters)
- Tagline
- What it does, for whom, in 1-2 lines
- What it is NOT
- 3-5 tone adjectives

**Batch 2: Color** (required)
- Primary hex. One is enough; generate the scale with the script.
- Accent(s), if any
- Neutrals: warm or cool? (or "I'll pick")
- Feedback colors: theirs, or use defaults (success #22C55E, warning #F59E0B, error #EF4444, info #3B82F6) and say you did
- Hard rules ("never pink on CTAs", "no gradients")

**Batch 3: Typography** (required)
- Display font, body font, mono font (any can be "same" or "none")
- Source: Google Fonts or licensed. If licensed, pick a stand-in from `references/font-fallbacks.md` and tell them.
- Allowed weights

**Batch 4: Logo** (required, but the answer can be "skip")
- Has one? Ask them to upload SVG (preferred) or PNG.
- Typographic wordmark? Then you can render it with the font, no file needed. Ask for letter-spacing / weight / any colored letters.
- Wants one designed? Go to Phase 3 design path.
- Nothing yet? Skip; leave a placeholder section.

**Batch 5: System** (optional, ask only if they build product UI)
- Spacing base: 4 or 8
- Radius feel: sharp / soft / pill
- Button variants they actually use
- Any signature component (ranking item, share card, data table...)

**Batch 6: Voice** (optional, ask only if they write copy at scale)
- 2-3 "say this / not this" pairs
- Glossary: internal term -> user-facing term
- Formality (tú / usted / mixed), emoji policy, regionalisms

Stop interviewing as soon as Batches 1-4 are covered. Everything else can be added in a second pass.

---

## Phase 2: Lock Tokens

Colors are where drift happens. Do this mechanically:

1. For each brand color with a single hex, generate the scale:
   ```bash
   python3 scripts/color_tools.py scale "#14B8A6" --name teal --format all
   ```
   `--anchor 600` if the brand color should sit at 600 (darker brands). Paste the output verbatim into both files. Never hand-write a scale.
2. If the user already has full scales, use theirs exactly. Don't "improve" them.
3. Check every text/background pair you'll document in the semantic mapping:
   ```bash
   python3 scripts/color_tools.py contrast "#TEXT" "#BG" "#TEXT2" "#BG2"
   ```
   If white-on-primary fails AA, say so and propose the darker step for CTAs. Document the result, don't hide it.
4. Fonts: real name goes in the `.md`. Stand-in goes in the `.jsx` with a comment. See `references/font-fallbacks.md`.
5. Write a semantic layer (bg, card, border, text, muted, cta, ctaHover, dark). Both files use these names.

---

## Phase 3: Logo

Pick one path. Don't push design on someone who has a logo.

| Situation | Action |
|---|---|
| User uploads SVG | Inline the `<svg>` in the .jsx `Logo` component. Reference the file in the .md. Generate color variants only if asked. |
| User uploads PNG only | Show it in the .jsx via base64 data URI. Note in .md that vector source is pending. |
| Typographic wordmark | Render with the font in a `Wordmark` component (see Topolly/SACVS pattern: colored letters, tracking). Document CSS in .md. |
| Wants a new logo | 2-3 SVG concepts as artifacts, rationale for each, iterate to approval, then variants. Rules in `references/logo-design.md`. |
| Skip | Placeholder section with the rules that apply anyway (clear space, no distortion, contrast). |

Logo rules that go in every `.md` regardless: no rotation/distortion, no shadows/gradients/effects, no color changes, minimum clear space, minimum size, sufficient contrast, no undefined containers.

---

## Phase 4: Generate

### 4A: Design Guidelines (.md) - write this FIRST

Follow `references/md-template.md`. Non-negotiables:
- Every color as a table with hex. Scales in 50-950 rows.
- Semantic mapping table (element -> token -> value)
- Color ratios (approximate composition %)
- Type scale table (size / name / font / weight)
- Quick Reference at the end: CSS custom properties + Tailwind extend + font `<link>`, copy-paste ready
- Version footer

### 4B: Brand Book (.jsx)

Start from `assets/brand-book-skeleton.jsx`: copy it, replace placeholders, then expand each tab. Patterns and per-tab content in `references/jsx-template.md`.

Hard constraints (the artifact viewer enforces them):
- One file, `export default`, only `useState` from react
- Tailwind core utilities for layout, inline styles for brand values
- Fonts via one Google Fonts `<link>`
- No localStorage, no fetch, no external images (inline SVG or data URIs)
- 600-950 lines. Under 600 is thin; over 1000 breaks.
- The brand book uses the brand's own fonts and colors. It should feel like the brand made it.

### 4C: Brand Kit (.zip) - only when logo variants exist

Structure and README spec in `references/logo-design.md`. Zip to `/mnt/user-data/outputs/{brand}-brand-kit.zip`.

---

## Phase 5: Verify and Deliver

Run before presenting:

```bash
python3 scripts/check_consistency.py {brand}-design-guidelines.md {brand}-brand-guidelines.jsx
```

Fix anything it flags. A hex in the `.jsx` that isn't in the `.md` is a bug, not a detail. Then:

1. Present the `.jsx` first (hero), `.md` second, `.zip` last if any.
2. One-line summary of what was assumed or substituted (fallback fonts, default feedback colors, generated scales).
3. Offer a second pass on Batches 5-6 or on any tab.

File names: `{brand}-design-guidelines.md`, `{brand}-brand-guidelines.jsx`, `{brand}-brand-kit.zip`. Lowercase brand slug.

---

## Rules

1. Never invent brand facts. Missing info -> ask or leave an explicit `TODO:` in the .md.
2. Exact hex values. No approximation, no "improving" user-provided colors.
3. Scales come from the script, never hand-typed.
4. `.md` first, `.jsx` from it. Run the checker.
5. Say what you substituted (fonts, defaults). Don't let a fallback pass as the real thing.
6. A strong existing logo stays. Don't propose redesigns nobody asked for.
7. Match the user's language and detail level. Small brand, small book.
8. Reference material from *other* brands is structure, not content.

## Files

- `scripts/color_tools.py` - scale generation + WCAG contrast
- `scripts/check_consistency.py` - md/jsx drift + jsx sanity checks
- `assets/brand-book-skeleton.jsx` - working starter component
- `references/md-template.md` - .md section structure
- `references/jsx-template.md` - .jsx patterns per tab
- `references/font-fallbacks.md` - licensed font -> Google Fonts map
- `references/logo-design.md` - logo concepts, variants, SVG rules, kit layout
