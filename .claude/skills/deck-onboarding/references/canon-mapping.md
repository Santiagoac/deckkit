# brand-book-generator → canon/brand.yaml

The brand book is documentation; `canon/brand.yaml` is what the build reads. Same
tokens, written twice, by you, from context — there is no parser. After BBG
Phase 2 (tokens locked), write the YAML and run `npm run canon`.

| BBG output | brand.yaml |
|---|---|
| Brand name | `name` |
| Each color scale (`color_tools.py scale … --format js`) | `palette.<name>: { 50: '#…', …, 950: '#…' }` — every step the script printed, verbatim |
| Neutrals (warm or cool) | `palette.neutral` — required; `--ink` / `--paper` derive from it |
| Semantic `bg` / `dark` | `backgrounds.<name>: { bg: <scale.step>, fg: auto, logo: dark\|light }` — `logo: dark` on light backgrounds, `light` on dark ones |
| Primary / accents | `accents.<name>: { strong: <scale.950>, soft: <scale.700>, light: <scale.400> }` — `strong` must read on every light background; the build checks |
| Display / body / mono font, Google | `typography.<role>: { family, source: google, weights: [400, 500, 700] }` |
| Display / body / mono font, licensed | `typography.<role>: { family, source: local, weights, files: { 400: File-Regular.woff2, … }, fallback: <from font-fallbacks.md> }` and `typography.licensed: true` |
| Logo SVGs | `logo: { dark: /assets/logo-dark.svg, light: /assets/logo-light.svg }` |
| Spacing base (4 or 8) | `spacing_base` |

Never add a color that is not in a scale. If BBG's feedback colors (success,
warning…) are needed, add them as scales too: one source of truth, no loose hexes.
