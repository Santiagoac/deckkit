# Markdown Design Guidelines Template

This document defines the structure for the `.md` design guidelines output. Adapt sections based on what information is available. Skip sections that don't apply.

## Required Sections

### 1. Header

```markdown
# {Brand Name} - Brand Guidelines

> {Brief description of what this document is and who it's for}
```

### 2. Brand Essence

Include:
- Tagline
- Positioning statement
- Tone description
- Target audience
- Anti-positioning ("Not: ...")
- Brand pillars or personality traits (as a table)

Optional:
- Brand DNA / core elements
- Metaphors or themes
- Differentiator table (vs competitors/alternatives)

### 3. Logo

Include:
- Logo type description (wordmark, symbol, combo, etc.)
- Variant list with background rules
- CSS properties if the logo is type-based
- Clear space and minimum sizing rules

Include a "Do / Don't" subsection:
- Never rotate, distort, alter
- Never apply shadows, blur, gradients
- Never change colors
- Always maintain clear space
- Always ensure sufficient contrast

If the brand has a monogram/icon, document it separately with its own rules and allowed backgrounds.

Include a "Logo Files" subsection listing all generated SVG assets:

```markdown
### Logo Files

| File | Type | Color | Background |
|------|------|-------|------------|
| {brand}-combined-primary-light.svg | Combined | Primary | Light |
| {brand}-combined-white-dark.svg | Combined | White | Dark |
| {brand}-symbol-primary-light.svg | Symbol | Primary | Light |
| ... | ... | ... | ... |

All files are available in the brand assets kit ({brand}-brand-kit.zip).
```

### 4. Colors

For each color group, use this table format:

```markdown
### {Color Name} ({Role})

{Description of when to use this color}

| Scale | Hex | Uso |
|-------|-----|-----|
| 50 | #HEXVAL | {usage note} |
| 100 | #HEXVAL | |
...
| 950 | #HEXVAL | |
```

Always include:
- Primary brand color (full scale 50-950 if available)
- Neutral palette(s)
- Accent color(s)
- Semantic/feedback colors (success, warning, error, info)
- Semantic mapping table (element -> token -> value)
- Color ratios (approximate composition percentages)
- Color rules (what NOT to do)

End with a Quick Reference CSS block:

```css
:root {
  /* Primary */
  --{prefix}-primary: #HEX;
  /* ... all tokens ... */
}
```

And a Tailwind config:

```js
colors: {
  primary: { ... },
  accent: { ... },
}
```

### 5. Typography

Include:
- Type system table: Role | Font | Use
- Google Fonts import `<link>` if applicable
- Full type scale table: Size | Name | Font | Weight
- "When to Use What" guidance
- Rules (letter-spacing, line-height, what NOT to do)

End with quick reference CSS:

```css
.heading {
  font-family: '{Font}', sans-serif;
  letter-spacing: -0.02em;
}
.body {
  font-family: '{Font}', sans-serif;
  line-height: 1.6;
}
```

### 6. Components (optional)

Document if the brand has specific component patterns:
- Buttons (variants, sizes, colors, touch targets)
- Inputs (states: normal, focus, error, disabled)
- Cards (background, borders, elevation)
- Ranking items, share cards, or other product-specific components
- Spacing & radius system

### 7. Voice & Tone (optional)

Include:
- Voice principles table: Trait | DO | DON'T
- Tone spectrum (where does the brand sit?)
- Product glossary (internal term -> user-facing term)
- Writing rules (numbered list, 5-8 rules)

### 8. Do's & Don'ts

A consolidated list:
- **Do:** (5-10 items)
- **Don't:** (5-10 items)

### 9. Quick Reference

Copy-paste ready code blocks:
- Full CSS custom properties
- Full Tailwind config
- Font imports

## Style Notes

- Use tables for structured information (colors, type scales, rules)
- Use code blocks for CSS/JS/HTML snippets
- Keep descriptions concise and actionable
- Use "Uso recomendado" or "Usage" labels for guidance
- Mark key/default values with ★ symbol
- End with version footer: `*Brand Guidelines v1.0 / {date}*`
