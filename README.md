# deckkit

**Present it like a deck, share it like a link.**

Your sales deck as a small web project: it behaves like PowerPoint in the room
(keyboard, 16:9 presentation mode, overview grid) and like a website everywhere
else (a URL, responsive, always the current version). Slides are Markdown. Your
brand lives in one file and everything visual is generated from it. The build
refuses anything off-canon: an unknown color, a number without a source, a
slide that doesn't fit the screen.

## Quick start

1. Click **Use this template**, clone your copy, `npm install`.
2. Open the folder in Claude Code and say **"start"**. The `deck-onboarding`
   skill interviews you — company, brand, old decks, team, voice — and fills
   `canon/` for you. Stop whenever; it resumes where you left off.
3. `npm run check` tells you when you can write slides. `npm run dev` shows them
   at `http://localhost:4321`. Press `→` to move, `P` for presentation mode, `O` for the grid.

Have an old deck as a PDF? `npm run import-deck -- path/to/deck.pdf` turns every
page into a slide draft you review with the skill (needs poppler: `brew install poppler`).

## How it works

```
canon/brand.yaml  ──build-canon──▶  src/styles/tokens.generated.css
   palette, backgrounds, accents,     one class per background/accent,
   typography, logo, spacing          contrast-checked (WCAG AA) at build
```

- `canon/` is the only place a color, font or fact is written.
- `src/content/slides/*.mdx` are the slides. `src/content/decks/*.yaml` list which slides make a deck for which audience. A slide is fixed in one place and every deck picks it up.
- A slide always fits the viewport. Too much content shrinks that slide's scale; it never grows or scrolls.

Edit `canon/brand.yaml` with your palette, fonts and logo, then `npm run build`.
If a color pair can't be read, the build tells you which one and why.

**Licensed fonts:** set `typography.licensed: true` and keep the `.woff2` files out
of git (`.gitignore` already covers the folder). Load them locally; the CSS font
stack falls back gracefully for anyone who clones without them.

## What the repo refuses

- A color outside your palette, or a text/background pair below WCAG AA (`npm run canon`).
- A slide with an unknown template, background or accent (`npm run build`).
- A team photo without `consent: true`, a customer logo without `permission: true` (`npm run build`).
- A word you banned in `canon/voice.yaml`, or a fact past its review date (`npm run evals`).

CI runs all of it on every push.

## Status

Done: the engine, the canon build with its gates, the evals, `import-deck`, and
the `deck-onboarding` skill. Coming next:

1. `deck-authoring`: write slides against your canon, with the onboarding gate.
2. `deck-publish`: exposure review, Netlify/Vercel, headers, verify live.

Design notes: [`docs/design.md`](docs/design.md).

## Credits

Brand interviews and color tooling come from [brand-book-generator](.claude/skills/brand-book-generator/),
a Claude Code skill by Santiago Aceves, vendored here under the same MIT license.

## License

MIT.
