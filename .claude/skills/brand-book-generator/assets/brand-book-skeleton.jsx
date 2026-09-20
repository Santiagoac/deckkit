import { useState } from "react";

// ============================================================
// BRAND BOOK SKELETON
// Copy this file, replace every __PLACEHOLDER__, fill `brand`
// and `colors`, then flesh out each tab. Keep sub-components.
// Fonts: __FONT_NOTE__ (e.g. "Brand font Graphik is licensed, Inter used as stand-in")
// ============================================================

const brand = {
  name: "__BRAND_NAME__",
  tagline: "__TAGLINE__",
  version: "v1.0 / __DATE__",
  fonts: {
    display: "'__DISPLAY_FONT__', sans-serif",
    body: "'__BODY_FONT__', sans-serif",
    mono: "'__MONO_FONT__', monospace",
  },
  fontsLink:
    "https://fonts.googleapis.com/css2?family=__FONT_QUERY__&display=swap",
};

// Single source of truth. Every hex here must also appear in the .md.
const colors = {
  primary: {
    50: "#__", 100: "#__", 200: "#__", 300: "#__", 400: "#__",
    500: "#__", 600: "#__", 700: "#__", 800: "#__", 900: "#__", 950: "#__",
  },
  neutral: {
    50: "#__", 100: "#__", 200: "#__", 300: "#__", 400: "#__",
    500: "#__", 600: "#__", 700: "#__", 800: "#__", 900: "#__", 950: "#__",
  },
  accent: { main: "#__", hover: "#__" },
  feedback: { success: "#__", warning: "#__", error: "#__", info: "#__" },
  utility: { white: "#FFFFFF", black: "#000000" },
};

// Semantic tokens: change these, not the raw scales, when adapting layout.
const t = {
  bg: colors.neutral[50],
  card: colors.utility.white,
  border: colors.neutral[200],
  text: colors.neutral[950],
  muted: colors.neutral[600],
  cta: colors.primary[500],
  ctaHover: colors.primary[600],
  dark: colors.neutral[950],
};

// ---------- Reusable sub-components ----------

const Mono = ({ children, color = t.muted, className = "" }) => (
  <span className={`text-xs tracking-wider ${className}`} style={{ fontFamily: brand.fonts.mono, color }}>
    {children}
  </span>
);

const Section = ({ number, title, intro, children }) => (
  <section className="mb-16">
    <div className="flex items-baseline gap-3 mb-3">
      <Mono color={t.cta}>{number}</Mono>
      <h2 className="text-2xl tracking-tight" style={{ fontFamily: brand.fonts.display, fontWeight: 600, color: t.text }}>
        {title}
      </h2>
    </div>
    {intro && <p className="text-sm leading-relaxed mb-8 max-w-xl" style={{ color: t.muted }}>{intro}</p>}
    {children}
  </section>
);

const Card = ({ children, dark, className = "", style = {} }) => (
  <div
    className={`rounded-xl border p-6 ${className}`}
    style={{ backgroundColor: dark ? t.dark : t.card, borderColor: dark ? t.dark : t.border, ...style }}
  >
    {children}
  </div>
);

const ColorSwatch = ({ name, hex, subtitle, tall }) => (
  <div className="flex flex-col gap-1">
    <div className={`w-full rounded-lg border ${tall ? "h-24" : "h-16"}`} style={{ backgroundColor: hex, borderColor: t.border }} />
    <Mono>{hex}</Mono>
    <span className="text-xs font-medium" style={{ color: t.text }}>{name}</span>
    {subtitle && <span className="text-xs" style={{ color: t.muted }}>{subtitle}</span>}
  </div>
);

const ScaleRow = ({ name, scale, star }) => (
  <div className="mb-6">
    <div className="flex items-baseline justify-between mb-2">
      <span className="text-sm font-medium" style={{ color: t.text }}>{name}</span>
      <Mono>50 → 950</Mono>
    </div>
    <div className="grid grid-cols-11 gap-1">
      {Object.entries(scale).map(([step, hex]) => (
        <div key={step} className="flex flex-col items-center gap-1">
          <div className="w-full h-12 rounded" style={{ backgroundColor: hex, outline: Number(step) === star ? `2px solid ${t.text}` : "none", outlineOffset: 2 }} />
          <Mono>{step}</Mono>
        </div>
      ))}
    </div>
  </div>
);

const DoDont = ({ good, items }) => (
  <Card>
    <Mono color={good ? colors.feedback.success : colors.feedback.error} className="block mb-3">
      {good ? "DO" : "DON'T"}
    </Mono>
    <ul className="space-y-2">
      {items.map((it) => (
        <li key={it} className="text-sm flex gap-2" style={{ color: t.text }}>
          <span style={{ color: good ? colors.feedback.success : colors.feedback.error }}>{good ? "✓" : "✕"}</span>
          {it}
        </li>
      ))}
    </ul>
  </Card>
);

const TypeSample = ({ label, size, font, weight = 400, tracking = "normal", text = "__SAMPLE_TEXT__" }) => (
  <div className="border-b pb-4" style={{ borderColor: t.border }}>
    <Mono className="block mb-2">{label} / {size}px / {weight}</Mono>
    <p style={{ fontFamily: font, fontSize: size, fontWeight: weight, letterSpacing: tracking, lineHeight: 1.15, color: t.text }}>{text}</p>
  </div>
);

const Button = ({ variant = "primary", children }) => {
  const v = {
    primary: { bg: t.cta, color: colors.utility.white, border: "transparent" },
    secondary: { bg: colors.primary[50], color: colors.primary[700], border: "transparent" },
    outline: { bg: "transparent", color: t.text, border: t.border },
    ghost: { bg: "transparent", color: t.cta, border: "transparent" },
    danger: { bg: colors.feedback.error, color: colors.utility.white, border: "transparent" },
  }[variant];
  return (
    <button className="px-5 py-2.5 rounded-lg text-sm font-semibold border" style={{ backgroundColor: v.bg, color: v.color, borderColor: v.border, fontFamily: brand.fonts.body }}>
      {children}
    </button>
  );
};

// Replace with real logo: inline <svg> from the brand's file, or typographic wordmark.
const Logo = ({ size = 40, onDark = false }) => (
  <span style={{ fontFamily: brand.fonts.display, fontWeight: 700, fontSize: size, letterSpacing: "-0.02em", color: onDark ? colors.utility.white : t.text }}>
    {brand.name}
  </span>
);

// ---------- Main ----------

export default function BrandGuidelines() {
  const [tab, setTab] = useState("overview");
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "logo", label: "Logo" },
    { id: "colors", label: "Colors" },
    { id: "typography", label: "Typography" },
    { id: "voice", label: "Voice & Tone" },
    { id: "applications", label: "Applications" },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: t.bg, fontFamily: brand.fonts.body, color: t.text }}>
      <link href={brand.fontsLink} rel="stylesheet" />

      <header className="sticky top-0 z-50 border-b" style={{ backgroundColor: t.bg + "F0", backdropFilter: "blur(20px)", borderColor: t.border }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={22} />
            <Mono>BRAND GUIDELINES</Mono>
          </div>
          <Mono>{brand.version}</Mono>
        </div>
        <div className="max-w-6xl mx-auto px-6 flex gap-1 overflow-x-auto">
          {tabs.map((x) => (
            <button key={x.id} onClick={() => setTab(x.id)} className="px-4 py-2 text-xs tracking-wider relative whitespace-nowrap"
              style={{ color: tab === x.id ? t.text : t.muted, fontWeight: tab === x.id ? 600 : 400 }}>
              {x.label}
              {tab === x.id && <div className="absolute bottom-0 left-4 right-4 h-px" style={{ backgroundColor: t.cta }} />}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {tab === "overview" && (
          <>
            <Section number="01" title="Brand Essence">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <h3 className="text-5xl leading-tight" style={{ fontFamily: brand.fonts.display, fontWeight: 700, letterSpacing: "-0.02em" }}>
                  {brand.tagline}
                </h3>
                <div className="space-y-5">
                  {[
                    ["Positioning", "__POSITIONING__"],
                    ["Tone", "__TONE__"],
                    ["Audience", "__AUDIENCE__"],
                    ["Not", "__NOT__"],
                  ].map(([k, v]) => (
                    <div key={k} className="border-b pb-3" style={{ borderColor: t.border }}>
                      <Mono color={t.cta} className="block mb-1">{k}</Mono>
                      <span className="text-sm">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Section>
            <Section number="02" title="Pillars">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  ["__PILLAR_1__", "__PILLAR_1_DESC__"],
                  ["__PILLAR_2__", "__PILLAR_2_DESC__"],
                  ["__PILLAR_3__", "__PILLAR_3_DESC__"],
                ].map(([title, desc]) => (
                  <Card key={title}>
                    <h4 className="text-sm font-semibold mb-2">{title}</h4>
                    <p className="text-xs leading-relaxed" style={{ color: t.muted }}>{desc}</p>
                  </Card>
                ))}
              </div>
            </Section>
          </>
        )}

        {tab === "logo" && (
          <>
            <Section number="01" title="Logo" intro="__LOGO_DESCRIPTION__">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card className="p-12 flex items-center justify-center"><Logo size={48} /></Card>
                <Card dark className="p-12 flex items-center justify-center"><Logo size={48} onDark /></Card>
              </div>
            </Section>
            <Section number="02" title="Rules">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DoDont good items={["Respect clear space", "Use official colors only", "Ensure contrast with background"]} />
                <DoDont items={["Rotate, distort or stretch", "Add shadows, gradients or effects", "Place over busy imagery"]} />
              </div>
            </Section>
          </>
        )}

        {tab === "colors" && (
          <>
            <Section number="01" title="Core Palette">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <ColorSwatch tall name="Primary" hex={colors.primary[500]} subtitle="CTAs, brand" />
                <ColorSwatch tall name="Background" hex={t.bg} subtitle="Page bg" />
                <ColorSwatch tall name="Text" hex={t.text} subtitle="Body text" />
                <ColorSwatch tall name="Accent" hex={colors.accent.main} subtitle="Highlights" />
              </div>
            </Section>
            <Section number="02" title="Scales">
              <ScaleRow name="Primary" scale={colors.primary} star={500} />
              <ScaleRow name="Neutral" scale={colors.neutral} star={50} />
            </Section>
            <Section number="03" title="Feedback">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(colors.feedback).map(([k, v]) => <ColorSwatch key={k} name={k} hex={v} />)}
              </div>
            </Section>
          </>
        )}

        {tab === "typography" && (
          <Section number="01" title="Type Scale">
            <div className="space-y-4">
              <TypeSample label="Display" size={48} font={brand.fonts.display} weight={700} tracking="-0.02em" />
              <TypeSample label="H1" size={32} font={brand.fonts.display} weight={700} tracking="-0.02em" />
              <TypeSample label="H2" size={24} font={brand.fonts.display} weight={600} tracking="-0.02em" />
              <TypeSample label="Body" size={16} font={brand.fonts.body} />
              <TypeSample label="Small" size={14} font={brand.fonts.body} />
              <TypeSample label="Mono" size={13} font={brand.fonts.mono} text="0123456789 v1.0 2026-01-01" />
            </div>
          </Section>
        )}

        {tab === "voice" && (
          <Section number="01" title="Voice Principles">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                ["__TRAIT_1__", "__DO_1__", "__DONT_1__"],
                ["__TRAIT_2__", "__DO_2__", "__DONT_2__"],
              ].map(([trait, yes, no]) => (
                <Card key={trait}>
                  <h4 className="text-sm font-semibold mb-3">{trait}</h4>
                  <p className="text-xs mb-2"><Mono color={colors.feedback.success}>DO </Mono>{yes}</p>
                  <p className="text-xs"><Mono color={colors.feedback.error}>DON'T </Mono>{no}</p>
                </Card>
              ))}
            </div>
          </Section>
        )}

        {tab === "applications" && (
          <Section number="01" title="Buttons">
            <Card className="flex flex-wrap gap-3 items-center">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </Card>
          </Section>
        )}
      </main>

      <footer className="max-w-6xl mx-auto px-6 py-8 border-t" style={{ borderColor: t.border }}>
        <Mono>{brand.name} / Brand Guidelines {brand.version}</Mono>
      </footer>
    </div>
  );
}
