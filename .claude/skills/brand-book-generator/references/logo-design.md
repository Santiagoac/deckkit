# Logo Design, Variants and Brand Kit

Read this only when the user wants a logo designed, improved, or wants SVG variants / a downloadable kit.

## Design from scratch

1. From the interview, propose 2-3 concepts as SVG artifacts. Each concept = combined mark (symbol + wordmark).
2. One paragraph of rationale per concept: geometry, symbolism, link to brand pillars. No fluff.
3. Ask which direction, or what to merge. Iterate until explicit approval.
4. Only then generate variants.

## Improve an existing logo

1. User uploads current logo.
2. Assess in 3-4 lines: what works, what doesn't, alignment with the stated tone.
3. If it's already strong, say so and stop. Don't force a redesign.
4. Otherwise propose 3 directions, each as an SVG artifact:
   - Refinement: proportions, spacing, weight
   - Evolution: simplified form, updated style, core intact
   - Reimagination: significant change keeping one recognizable element
5. Iterate to approval, then variants.

## Design principles

- Simple primitives (paths, circles, rects). Minimal anchor count.
- Optical centering, not mathematical.
- 16x16 favicon test: the symbol must still read.
- Consistent stroke or visual weight across elements.
- Must work on light AND dark backgrounds.
- Wordmark as paths if it's a custom drawing. If it's just a font, keep it as a rendered font in the .jsx and document the CSS instead of faking paths.

## Variant matrix

Types: `combined`, `symbol`, `wordmark`
Colors per type: `primary` (brand color, transparent bg), `dark` (for light bg), `white` (for dark bg), plus `{accent}` if the brand has accent lockups.

Naming: `{brand}-{type}-{color}-{bg}.svg`

```
topolly-combined-teal-light.svg
topolly-combined-white-dark.svg
topolly-symbol-teal-light.svg
topolly-wordmark-dark-light.svg
```

## SVG requirements

- Clean: no editor metadata, no empty groups, no transforms that could be baked in
- Same `viewBox` across variants of the same type
- Colors via `fill="#HEX"` only. No classes, no external CSS, no `currentColor` in the kit files
- No `<text>` elements in kit SVGs (fonts won't travel). Paths only.
- `width`/`height` omitted so the SVG scales to its container

## Brand kit structure

```
{brand}-brand-kit/
├── logos/
│   ├── combined/   {brand}-combined-*.svg
│   ├── symbol/     {brand}-symbol-*.svg
│   └── wordmark/   {brand}-wordmark-*.svg
├── guidelines/
│   └── {brand}-design-guidelines.md
└── README.md
```

README.md: what's inside, file table (file / type / color / use), hex quick reference, font names + where to get them, 5 key do/don'ts.

```bash
mkdir -p /home/claude/{brand}-brand-kit/logos/{combined,symbol,wordmark} /home/claude/{brand}-brand-kit/guidelines
# write SVGs + README, copy the .md
cd /home/claude && zip -r /mnt/user-data/outputs/{brand}-brand-kit.zip {brand}-brand-kit/
```

## In the .md

Add a "Logo Files" table listing every SVG in the kit with its use case. In the .jsx, inline each variant on its proper background in the Logo tab.
