# deckkit

**Present it like a deck, share it like a link.**

Any deck — sales, investors, internal — as a small web project: it behaves like
PowerPoint in the room (keyboard, 16:9 presentation mode, overview grid) and like
a website everywhere else (a URL, responsive, always the current version). Slides
are Markdown. Your brand lives in one file and everything visual is generated
from it. The build refuses anything off-canon: an unknown color, a number without
a source, a slide that doesn't fit the screen.

---

## Si no eres técnico

No necesitas saber programar, ni tener cuenta de GitHub, ni escribir comandos.

**1.** Instala [Claude Code](https://claude.com/claude-code).

**2.** Ábrelo y pega esto:

```
Clona https://github.com/Santiagoac/deckkit en una carpeta nueva llamada
"mis-decks", entra a ella y haz start
```

**3.** Contesta lo que te pregunte.

Eso es todo. El agente instala lo que falte, te entrevista sobre tu empresa y tu
marca, y al final te da un link para ver tu deck. Cuando quieras publicarlo,
dile *"ayúdame a publicarlo"* y te lleva paso a paso.

Ten a la mano, si los tienes: tu **logo en SVG**, tus **colores** (los códigos
tipo `#BFFF00`), el nombre de tu **tipografía**, y algún **deck viejo en PDF**.
Si no tienes algo, se puede seguir sin eso.

**Guía completa en español:** [`docs/guia.md`](docs/guia.md) — qué es Claude
Code, qué te va a preguntar, cómo presentar, cómo publicar, y un glosario.

**¿Algo no jaló?** [Abre un issue](https://github.com/Santiagoac/deckkit/issues/new?template=feedback.md)
y cuéntanos en qué paso te atoraste.

---

## Quick start (technical)

Prefer to drive it yourself, or want the copy to live on GitHub from day one?

1. **Use this template** → **Private** → Create. Private matters: onboarding
   writes your positioning, your team's photos and your customer logos into
   `company/` and `canon/`, and none of that is gitignored.
2. Clone it, or open it straight from Claude Code / Codex.
3. Say **"start"**. The agent runs `npm install` if it needs to.

`npm run check` tells you when you can write slides. `npm run dev` serves them;
it prints the URL of each deck, because a deck lives at its slug
(`/investors-7f3a9c2b1d4e`), not at `/`.

Have an old deck as a PDF? `npm run import-deck -- path/to/deck.pdf` turns every
page into a slide draft you review with the skill (needs poppler; the onboarding
offers to install it).

### What you need

| | |
|---|---|
| **Claude Code** or Codex | installed and signed in |
| **Node 20+** | CI runs 22. Check with `node -v`; the agent installs deps for you |
| git | only for the GitHub route above |
| Python 3 | optional — full color scales during the brand step |
| poppler | optional — importing old decks from PDF |

## Bringing in new features

deckkit keeps changing. To pull the latest into a copy you have already made
your own, tell your agent **"busca actualizaciones"**, or run it yourself:

```bash
npm run update -- --check   # what is new, changes nothing
npm run update              # bring it in
```

`canon/`, `company/`, `src/content/` and `public/assets/` are marked
`merge=keep-mine` in `.gitattributes`, so **your brand, your slides and your
data are never touched** — only the engine updates, and there is nothing to
resolve by hand. It links `upstream` itself the first time, so a copy made with
**Use this template** needs no setup.

## After the onboarding

`deck-authoring` and `deck-publish` are not written yet, so until they are, ask
for these in plain language:

- *"Crea un deck para inversionistas con 8 slides usando mi canon"*
- *"Genera un slug nuevo para el deck de ventas"*
- *"Ayúdame a publicarlo en Netlify"*

Publishing walkthrough: [`docs/publish.md`](docs/publish.md).

## How it works

```
canon/brand.yaml  ──build-canon──▶  src/styles/tokens.generated.css
   palette, backgrounds, accents,     one class per background/accent,
   typography, logo, spacing          contrast-checked (WCAG AA) at build
```

- `canon/` is the only place a color, font or fact is written.
- `src/content/slides/*.mdx` are the slides. `src/content/decks/*.yaml` list which slides make a deck for which audience. A slide is fixed in one place and every deck picks it up.
- A slide always fits the viewport. Too much content shrinks that slide's scale; it never grows or scrolls.
- A deck's URL is a slug with a random suffix, so being handed one deck tells you nothing about the others. The index that lists them all sits behind a password.

Edit `canon/brand.yaml` with your palette, fonts and logo, then `npm run build`.
If a color pair can't be read, the build tells you which one and why.

**Licensed fonts:** set `typography.licensed: true` and keep the `.woff2` files out
of git (`.gitignore` already covers the folder). Load them locally; the CSS font
stack falls back gracefully for anyone who clones without them.

## What the repo refuses

- A color outside your palette, or a text/background pair below WCAG AA (`npm run canon`).
- A slide with an unknown template, background or accent (`npm run build`).
- A body written under a template that cannot render one (`npm run build`).
- A deck without an unguessable slug (`npm run build`).
- A team photo without `consent: true`, a customer logo without `permission: true` (`npm run build`).
- A word you banned in `canon/voice.yaml`, or a fact past its review date (`npm run evals`).

CI runs all of it on every push.

## Hosting

**Netlify.** One option on purpose: the password on the deck index is a Netlify
edge function, so a second host would mean a second implementation and a choice
nobody wants to make on their first day. See [`docs/publish.md`](docs/publish.md).

## Status

Done: the engine, the canon build with its gates, the evals, `import-deck`,
unguessable deck URLs, the branded password gate, and the `deck-onboarding`
skill. Coming next:

1. `deck-authoring`: write slides against your canon, with the onboarding gate.
2. `deck-publish`: exposure review, deploy, verify live.

Design notes: [`docs/design.md`](docs/design.md).

## Credits

Brand interviews and color tooling come from [brand-book-generator](.claude/skills/brand-book-generator/),
a Claude Code skill by Santiago Aceves, vendored here under the same MIT license.

## License

MIT.
