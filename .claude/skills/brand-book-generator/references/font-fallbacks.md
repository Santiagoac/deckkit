# Font Fallbacks

Custom or licensed fonts can't load in the .jsx (Google Fonts only). Use this map to pick the closest free alternative. Always document the real font in the .md and add a comment in the .jsx noting the substitution.

## Grotesk / Neo-grotesque (Graphik, Helvetica, Akzidenz, Suisse, Circular, Founders)

| Real font | Google Fonts fallback | Notes |
|---|---|---|
| Graphik | Inter | Closest metrics. Use weights 400/500/700 |
| Helvetica / Helvetica Neue | Inter or Roboto | |
| Suisse Int'l | Inter | |
| Circular | DM Sans | Rounder |
| Founders Grotesk | Archivo | |
| Akzidenz Grotesk | Work Sans | |
| Söhne | Inter | |
| GT America | Manrope | |

## Geometric (Futura, Avenir, Gotham, Proxima Nova)

| Real font | Google Fonts fallback |
|---|---|
| Futura | Jost |
| Avenir | Nunito Sans |
| Gotham / Proxima Nova | Montserrat |
| Brandon Grotesque | Josefin Sans |

## Humanist / UI (SF Pro, Segoe, Frutiger)

| Real font | Google Fonts fallback |
|---|---|
| SF Pro | Inter |
| Segoe UI | Open Sans |
| Frutiger | Hind or Source Sans 3 |

## Serif

| Real font | Google Fonts fallback |
|---|---|
| Tiempos / Times | Instrument Serif or Source Serif 4 |
| GT Sectra | Fraunces |
| Canela | Cormorant |
| Playfair-like display | Playfair Display |

## Mono

| Real font | Google Fonts fallback |
|---|---|
| Aeonik Mono | Space Mono or JetBrains Mono |
| SF Mono / Menlo | JetBrains Mono |
| Berkeley Mono | IBM Plex Mono |
| Operator Mono | Fira Code |

## Rules

1. Match weights available: if the brand only allows 400/500/700, load only those.
2. Never document the fallback as the brand font in the .md. The .md is source of truth for the real brand.
3. In the .jsx, add a top comment:
   ```jsx
   // Brand font is Graphik (licensed). Using Inter as visual stand-in.
   ```
4. Font stack in CSS always ends with a generic: `'Graphik', 'Inter', sans-serif`.
5. All Google Fonts load via one `<link>` with `&display=swap`.
