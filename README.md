# deckkit

**Present it like a deck, share it like a link.**

Your sales deck as a small web project: it behaves like PowerPoint in the room
(keyboard, 16:9 presentation mode, overview grid) and like a website everywhere
else (a URL, responsive, always the current version). Slides are Markdown. Your
brand lives in one file and everything visual is generated from it. The build
refuses anything off-canon: an unknown color, a number without a source, a
slide that doesn't fit the screen.

## Quick start

```bash
npm install
npm run dev        # http://localhost:4321
```

Open `/demo`. Press `→` to move, `P` for presentation mode, `O` for the grid.

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

## Status

Phase 1 — the engine — is what you're looking at. Coming next:

1. Evals in CI: brand, voice and facts gates.
2. `deck-onboarding`: a guided setup in Claude Code that interviews you (company,
   brand, existing decks, team, proof, voice) and fills `canon/` for you.
3. `deck-authoring` and `deck-publish`: write slides against your canon, then
   ship to Netlify or Vercel with an exposure review first.

Design notes: [`docs/design.md`](docs/design.md).

## Credits

Brand interviews and color tooling come from [brand-book-generator](.claude/skills/brand-book-generator/),
a Claude Code skill by Santiago Aceves, vendored here under the same MIT license.

## License

MIT.
