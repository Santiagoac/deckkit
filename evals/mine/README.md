# Your own rules

`npm run evals` runs everything under `evals/`, including this folder. The
difference is that **this folder is yours**: `.gitattributes` marks it
`merge=keep-mine`, so `npm run update` never touches it. The rules one level up
belong to deckkit and get updated; the ones here belong to you and do not.

The split is not "mine vs theirs" by ownership — it is **universal vs yours**:

| | |
|---|---|
| `evals/` | true of any deck: a slide must fit, an image must load, a banned word must not appear |
| `evals/mine/` | true of *your* decks: how long they run, what a closing must carry, what your brand will not say |

`ejemplo.test.mjs` is a worked one, skipped by default. Copy it, rename it,
make it yours. Delete it if you would rather start from nothing — it will not
come back.

## What you can measure

`measureDeck()` from `../lib/measure.mjs` opens every published deck in a real
browser at desktop and phone sizes, and reports per slide:

```js
{
  id: 'contadores-cierre',
  worst: { viewport: 'phone 390x844', fit: 0.82, overflows: false },
  byViewport: { 'desktop 1440x900': {...}, 'phone 390x844': {...} },
  images: [{ viewport, src, heightRatio, widthRatio }],
  overflows: [],            // the viewports where content is cut off
}
```

`fit` is the scale the deck had to shrink that slide to. `heightRatio` is how
much of the slide's height an image takes. Both are measured, not guessed.

Static rules need none of that — read the `.mdx` or the deck YAML directly, the
way `evals/imagenes.test.mjs` does.
