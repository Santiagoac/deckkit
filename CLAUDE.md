# deckkit — how this repo works

A sales deck as a web project. Presents like PowerPoint, shares like a link.

## Start here

This repo sets itself up for one company before any slide is written. **Before
anything else**, read `canon/onboarding.yaml` and run `npm run check`. Tell the
person which steps are done and which comes next, in their language, in a short
paragraph. If any step is not `done`, your first action is to invoke the
`deck-onboarding` skill — it resumes where things were left. Never redo a `done`
step unless asked.

The path, in order:

```
0. Orient           read canon/onboarding.yaml, say where we are
1. Company          what you sell, to whom, in one line          [required]
2. Brand            palette, type, logo → brand book              [required]
3. Resources        website, old decks, images                    [optional]
4. People & proof   team, customers, investors, facts             [optional]
5. Voice            banned words, disclaimers, tagline            [required]
6. First deck       pick an audience, write slides
7. Publish          exposure review, host, verify live
```

Steps 6 and 7 have their own skills (`deck-authoring`, `deck-publish`) when present;
until then, follow the editing guide below and `npm run check` tells you if the
canon is complete enough to start.

## Rules that don't bend

1. **Never write a color.** Pick a `background` and an `accent`; the system supplies the color. Palette lives only in `canon/brand.yaml`.
2. **Never write a bare number.** Every hard figure goes in `canon/facts.yaml` and is used with `<Fact id="..." />`. No source and review date, no entry.
3. **A slide is fixed in one place.** Don't duplicate a slide to change one word for one deck — decks reference slides, they never copy them.
4. **`canon/` is the source of truth.** `src/styles/tokens.generated.css` is generated from it on every `dev`/`build` and is gitignored. If you find yourself editing CSS colors, stop: edit the canon.

## A slide always fits the screen

No scrolling inside a slide: each one is exactly the viewport height, on a phone and on a projector alike. If you put too much in, the deck **won't let it grow** — it shrinks that slide's scale until it fits.

So the penalty for overwriting isn't a broken slide, it's a slide with smaller type than its neighbours. If one looks smaller than the rest, that's not a bug: it has too much content. Cut it or split it.

## Editing a slide

Slides live in `src/content/slides/*.mdx`:

```mdx
---
title: "Most teams ship <strong>the wrong thing first.</strong>"
template: numbered-split
background: paper
accent: blue
closing: "Expensive, and slow to find out."
visual: { type: image, src: /assets/some-image.png, alt: "..." }
notes: "What you say out loud when you reach this slide."
---

<List>
  <Numbered n={1}>No shared definition of done</Numbered>
</List>
```

- `title` accepts `<strong>`. If present, the first part renders regular and only the marked part bold — no weights to declare.
- `notes` show only when the URL has `?notes`. The audience never sees them.
- `template`, not `layout`: Astro reserves `layout` in MDX frontmatter.

### Valid values

| Field | Values |
|---|---|
| `template` | `cover` · `statement` · `numbered-split` · `pillar` · `metrics` · `product` · `team` · `logo-wall` · `closing` |
| `background` | whatever `canon/brand.yaml` declares under `backgrounds` (the demo canon has `paper`, `deep`) |
| `accent` | whatever `canon/brand.yaml` declares under `accents` (the demo canon has `blue`) |
| `visual.type` | `image` · `mockup` · `none` |
| `visual.component` | a component you registered in `src/components/Visual.astro` (empty by default) |

Anything outside these lists **fails the build and tells you what is valid**. That's the point: it keeps the deck from drifting.

`background` is what color the slide is; `accent` is the color world of the section. On a light background, text takes the accent color.

### Components available inside a slide

`<List>` `<Numbered n={1}>` `<Bullet>` `<Fact id="">` `<Metric id="">` `<Quote>`

Nothing else, and nothing to import. `<Quote>` is for the customer's own words.

## Adding a fact

In `canon/facts.yaml`:

```yaml
- id: customers
  value: "+120"
  label: "Customers"
  source: "Internal CRM export"
  reviewedOn: 2026-09-01
  validForDays: 180
  usage: [sales, marketing]
```

`usage: [internal]` marks a source that must never appear in an external deck; a slide that cites it fails the build. Expired facts warn at build today and will fail in phase 2.

## Creating a deck

A deck is an audience. It only lists slides:

```yaml
# src/content/decks/investors.yaml
name: "Investors"
audience: investors
status: published      # `draft` stays out of the index
slides: [cover, problem, closing]
```

Each deck is a route: `/investors`.

## Presenting

Move the cursor to the top edge and a bar appears with **← Decks**. On a phone, tap the top strip.

| Key | Does |
|---|---|
| `→` `space` | Next |
| `←` | Previous |
| `P` | Presentation mode (fixed 16:9 for projectors) |
| `O` | All slides |
| `Esc` | Back to normal |

`?present` opens straight into presentation mode. `?notes` shows your notes. `#7` opens on slide 7 — handy for a link that points at something specific.

## Running

```bash
npm install && npm run dev
```

`npm run build` runs the content validation; if it passes, the deck is sound. `npm test` runs the canon generator's tests.

