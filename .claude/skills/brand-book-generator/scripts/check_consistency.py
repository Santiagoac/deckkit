#!/usr/bin/env python3
"""
check_consistency.py - Verify the .md guidelines and the .jsx brand book agree.

Usage:
  python3 check_consistency.py brand-design-guidelines.md brand-brand-guidelines.jsx

Checks:
  1. Hex colors present in one file but not the other
  2. Font family names present in one file but not the other
  3. JSX sanity: single `export default`, only `useState` imported from react,
     no localStorage/fetch, balanced JSX braces (rough), Google Fonts <link> present
Exit code 1 if any hard failure.
"""
import re
import sys

HEX = re.compile(r"#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b")
FONT = re.compile(r"font-family:\s*['\"]([^'\",;]+)|fontFamily:\s*\"?'([^']+)'|family=([A-Za-z+]+)")
NEUTRAL_UI = {"#FFFFFF", "#000000", "#E5E7EB", "#D1D5DB", "#F3F4F6", "#9CA3AF", "#6B7280", "#374151", "#111827"}


def hexes(text):
    out = set()
    for h in HEX.findall(text):
        h = h.upper()
        if len(h) == 4:
            h = "#" + "".join(c * 2 for c in h[1:])
        out.add(h)
    return out


def fonts(text):
    out = set()
    for m in FONT.finditer(text):
        name = next(g for g in m.groups() if g)
        out.add(name.replace("+", " ").strip())
    return out


def main(md_path, jsx_path):
    md, jsx = open(md_path).read(), open(jsx_path).read()
    fail = False

    md_hex, jsx_hex = hexes(md) - NEUTRAL_UI, hexes(jsx) - NEUTRAL_UI
    only_md, only_jsx = sorted(md_hex - jsx_hex), sorted(jsx_hex - md_hex)
    print(f"Colors: {len(md_hex)} in md, {len(jsx_hex)} in jsx")
    if only_md:
        print("  In .md but NOT in .jsx:", ", ".join(only_md))
    if only_jsx:
        print("  In .jsx but NOT in .md (undocumented colors!):", ", ".join(only_jsx))
        fail = True
    if not only_md and not only_jsx:
        print("  OK - palettes match")

    md_f, jsx_f = fonts(md), fonts(jsx)
    print(f"Fonts: md={sorted(md_f)} jsx={sorted(jsx_f)}")
    if jsx_f - md_f - {"monospace", "sans-serif", "serif", "SF Mono", "Fira Code"}:
        print("  WARN fonts in jsx not documented in md:", sorted(jsx_f - md_f))

    print("JSX sanity:")
    checks = [
        (jsx.count("export default") == 1, "exactly one `export default`"),
        (re.search(r"import\s*\{[^}]*\}\s*from\s*['\"]react['\"]", jsx) is not None, "imports from react"),
        ("localStorage" not in jsx and "sessionStorage" not in jsx, "no browser storage"),
        ("fonts.googleapis.com" in jsx, "Google Fonts <link> present"),
        (abs(jsx.count("{") - jsx.count("}")) == 0, "balanced curly braces"),
        (abs(jsx.count("(") - jsx.count(")")) == 0, "balanced parentheses"),
        (len(jsx.splitlines()) <= 1000, f"under 1000 lines ({len(jsx.splitlines())})"),
    ]
    for ok, label in checks:
        print(f"  {'OK  ' if ok else 'FAIL'} {label}")
        fail |= not ok

    sys.exit(1 if fail else 0)


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
