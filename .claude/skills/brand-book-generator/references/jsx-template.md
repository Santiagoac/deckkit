# JSX Brand Book Template

Start from `assets/brand-book-skeleton.jsx` (copy it, fill placeholders). This file explains what goes in each tab and the patterns the skeleton already implements, so you expand it rather than rewrite it. The skeleton exposes: `brand`, `colors`, semantic tokens `t`, and components `Mono`, `Section`, `Card`, `ColorSwatch`, `ScaleRow`, `DoDont`, `TypeSample`, `Button`, `Logo`.

## File Structure

```jsx
import { useState } from "react";

// 1. Color constants object
const colors = { ... };

// 2. Reusable sub-components
const ColorSwatch = ({ ... }) => ( ... );
const Section = ({ ... }) => ( ... );
// Brand-specific components (Wordmark, Isotype, etc.)

// 3. Main component
export default function {BrandName}BrandGuidelines() {
  const [activeTab, setActiveTab] = useState("overview");
  // ... tabs, header, content
}
```

## Color Constants

Define ALL brand colors as a flat or nested object at the top of the file. This object is the single source of truth used throughout the component.

```jsx
const colors = {
  primary: {
    main: "#HEX",
    // ... variants
  },
  neutral: {
    50: "#HEX",
    // ... full scale
  },
  accent: {
    main: "#HEX",
    // ... variants
  },
  feedback: {
    success: "#HEX",
    warning: "#HEX",
    error: "#HEX",
    info: "#HEX",
  },
  utility: {
    white: "#FFFFFF",
    black: "#000000",
  },
};
```

## Reusable Sub-Components

### ColorSwatch

Renders a color preview box with hex code and label.

```jsx
const ColorSwatch = ({ name, hex, subtitle, tall }) => (
  <div className="flex flex-col gap-1">
    <div
      className={`w-full rounded-lg border border-gray-200 ${tall ? "h-24" : "h-20"}`}
      style={{ backgroundColor: hex }}
    />
    <span className="text-xs" style={{
      fontFamily: "'{MonoFont}', monospace",
      color: colors.neutral.secondary
    }}>{hex}</span>
    <span className="text-xs font-medium" style={{
      color: colors.neutral.text
    }}>{name}</span>
    {subtitle && (
      <span className="text-xs" style={{
        color: colors.neutral.secondary
      }}>{subtitle}</span>
    )}
  </div>
);
```

### Section

Consistent section header with number and title.

```jsx
const Section = ({ title, number, children }) => (
  <div className="mb-16">
    <div className="flex items-baseline gap-3 mb-8">
      <span className="text-xs tracking-widest" style={{
        fontFamily: "'{MonoFont}', monospace",
        color: colors.accent.main
      }}>{number}</span>
      <h2 className="text-2xl tracking-tight" style={{
        fontFamily: "'{HeadingFont}', sans-serif",
        fontWeight: 500,
        color: colors.neutral.text
      }}>{title}</h2>
    </div>
    {children}
  </div>
);
```

### Brand-Specific Components

If the brand has a typographic logo, create a Wordmark component:

```jsx
const Wordmark = ({ size = 42, variant = "light" }) => {
  // Render the logo using the brand's font and colors
  // Handle light/dark variants
};
```

If the brand has an isotype/icon:

```jsx
const Isotype = ({ size = 72, bg = "primary" }) => {
  // Render the icon with background variants
};
```

## Main Component Structure

### Header

Sticky header with:
- Brand name/logo on the left
- Version label on the right
- Tab navigation below

```jsx
<header className="sticky top-0 z-50 border-b" style={{
  backgroundColor: colors.background + "F0",
  backdropFilter: "blur(20px)",
  borderColor: colors.neutral.border
}}>
```

### Tabs

Standard tab set (adapt based on content available):

```jsx
const tabs = [
  { id: "overview", label: "Overview" },
  { id: "logo", label: "Logo" },
  { id: "colors", label: "Colors" },
  { id: "typography", label: "Typography" },
  { id: "voice", label: "Voice & Tone" },
  { id: "applications", label: "Applications" },
];
```

Tab buttons with active indicator:

```jsx
<button
  onClick={() => setActiveTab(tab.id)}
  className="px-4 py-2 text-xs tracking-wider transition-all relative whitespace-nowrap"
  style={{
    color: activeTab === tab.id ? colors.neutral.text : colors.neutral.secondary,
    fontWeight: activeTab === tab.id ? 500 : 400
  }}
>
  {tab.label}
  {activeTab === tab.id && (
    <div className="absolute bottom-0 left-4 right-4 h-px"
      style={{ backgroundColor: colors.accent.main }} />
  )}
</button>
```

### Tab Content

Each tab is conditionally rendered:

```jsx
{activeTab === "overview" && ( <div> ... </div> )}
{activeTab === "logo" && ( <div> ... </div> )}
{activeTab === "colors" && ( <div> ... </div> )}
```

## Tab Content Patterns

### Overview Tab

1. **Brand Essence** - Tagline displayed large (using display/serif font if available), description text, key-value pairs for positioning/tone/audience
2. **Brand Pillars** - 3-column grid of cards with icon, title, description
3. **DNA/Identity** - Grid of core brand elements
4. Any additional brand context (metaphors, differentiators)

### Logo Tab

1. **Wordmark** - Large logo rendered on light and dark backgrounds side by side
2. **Lockup variants** - With descriptor text if applicable
3. **Accent color variants** - On accent-colored backgrounds
4. **Monogram/Icon** - If applicable, show on different backgrounds in a grid
5. **Logo Rules** - Grid of do/don't cards

For logo previews, use:
```jsx
<div className="rounded-xl p-12 flex items-center justify-center border"
  style={{ backgroundColor: bg, borderColor: borderColor }}>
  {/* Logo component or text */}
</div>
```

### Colors Tab

1. **Primary Palette** - Large swatches in a 4+ column grid
2. **Full Scales** - Each color scale in its own row, using smaller swatches
3. **Semantic Mapping** - Table or card grid showing element -> color mapping
4. **Color Ratios** - Visual bar showing composition percentages
5. **Rules** - List of color rules

For color scales, show the full 50-950 range:

```jsx
<div className="grid grid-cols-11 gap-1">
  {Object.entries(colorScale).map(([scale, hex]) => (
    <div key={scale} className="flex flex-col items-center gap-1">
      <div className="w-full h-12 rounded" style={{ backgroundColor: hex }} />
      <span className="text-xs">{scale}</span>
    </div>
  ))}
</div>
```

### Typography Tab

1. **Type System** - Show each font family with a large sample text
2. **Font Pairing** - Side-by-side comparison
3. **Type Scale** - Each size rendered at actual size with label
4. **Usage Rules** - When to use what

For typography previews:

```jsx
<div className="space-y-6">
  <div>
    <span className="text-xs tracking-wider" style={{
      fontFamily: monoFont, color: secondaryColor
    }}>Display / 48px / {FontName}</span>
    <p className="text-5xl" style={{
      fontFamily: displayFont, fontWeight: 700
    }}>The quick brown fox</p>
  </div>
  {/* ... more sizes */}
</div>
```

### Voice & Tone Tab

1. **Principles** - Table-style cards with DO/DON'T examples
2. **Tone Spectrum** - Visual spectrum indicator
3. **Glossary** - If applicable
4. **Writing Rules** - Numbered list

### Applications Tab

1. **Button Previews** - Rendered button variants on light and dark backgrounds
2. **Card Examples** - Sample cards using brand styles
3. **Share Card / Special Components** - If applicable
4. **Dark Mode** - If applicable, show dark mode versions

## Styling Guidelines

- The brand book itself should USE the brand's own visual identity
- Background: Use the brand's background color (not pure white unless that's the brand)
- All text uses the brand's fonts loaded via Google Fonts `<link>`
- Color swatches have `border border-gray-200` for visibility on light colors
- Use `rounded-lg` or `rounded-xl` for containers
- Generous padding: `p-6`, `p-8`, `p-12` for preview containers
- Grid layouts: `grid grid-cols-1 md:grid-cols-2` or `md:grid-cols-3` for responsive
- Max width container: `max-w-6xl mx-auto px-6`

## Font Loading

Always load fonts via Google Fonts `<link>` inside the component's return:

```jsx
<link href="https://fonts.googleapis.com/css2?family={Font1}&family={Font2}&display=swap" rel="stylesheet" />
```

If the brand uses custom (non-Google) fonts, use the closest Google Fonts alternative and note this in a comment.

## Important Rules

1. The component must be self-contained in a single file
2. Only import `useState` from React
3. Use Tailwind classes for layout, inline styles for brand-specific values
4. The color constants object must match exactly what's in the .md file
5. Every color, font, and value shown in the brand book must be accurate
6. The brand book should feel like a premium design tool, not a basic document
7. Keep the component under 1000 lines (aim for 600-900 depending on complexity)
