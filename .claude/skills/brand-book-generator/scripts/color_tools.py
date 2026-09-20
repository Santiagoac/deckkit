#!/usr/bin/env python3
"""
color_tools.py - Deterministic color utilities for brand books.

Usage:
  # Generate a 50-950 scale from an anchor hex (anchor lands on 500 by default)
  python3 color_tools.py scale "#14B8A6" --name teal
  python3 color_tools.py scale "#3E8DCB" --name blue --anchor 600 --format all

  # Check WCAG contrast between text/background pairs (any number of pairs)
  python3 color_tools.py contrast "#2D2B28" "#F7F6F3" "#FFFFFF" "#14B8A6"

Formats for `scale`: md (table), css (custom properties), js (object), tw (tailwind), all (default)
Outputs are deterministic: same input -> same output. Use them verbatim in both the .md and .jsx.
"""
import argparse
import colorsys
import sys

STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
# Target lightness (HSL, 0-1) per step. Tuned to feel like Tailwind/Radix scales.
LIGHTNESS = {
    50: 0.97, 100: 0.93, 200: 0.86, 300: 0.76, 400: 0.64,
    500: 0.52, 600: 0.42, 700: 0.34, 800: 0.27, 900: 0.21, 950: 0.13,
}


def hex_to_rgb(h):
    h = h.strip().lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    if len(h) != 6:
        raise ValueError(f"Invalid hex: {h}")
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))


def rgb_to_hex(rgb):
    return "#" + "".join(f"{round(max(0, min(1, c)) * 255):02X}" for c in rgb)


def make_scale(anchor_hex, anchor_step=500):
    r, g, b = hex_to_rgb(anchor_hex)
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    anchor_l = LIGHTNESS[anchor_step]
    scale = {}
    for step in STEPS:
        # Shift target lightness so the anchor step returns the exact input color
        weight = max(0.0, 1 - abs(step - anchor_step) / 450) ** 1.5
        target_l = LIGHTNESS[step] + (l - anchor_l) * weight
        target_l = max(0.04, min(0.98, target_l))
        # Desaturate slightly at the extremes so 50/950 don't look neon or muddy
        edge = abs(step - 500) / 450
        target_s = s * (1 - 0.25 * edge ** 2)
        if step == anchor_step:
            scale[step] = anchor_hex.upper() if anchor_hex.startswith("#") else "#" + anchor_hex.upper()
        else:
            scale[step] = rgb_to_hex(colorsys.hls_to_rgb(h, target_l, target_s))
    return scale


def rel_luminance(hex_color):
    def chan(c):
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = (chan(c) for c in hex_to_rgb(hex_color))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast_ratio(a, b):
    la, lb = rel_luminance(a), rel_luminance(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def fmt_scale(name, scale, fmt):
    out = []
    if fmt in ("md", "all"):
        out.append(f"| Scale | Hex |\n|-------|-----|")
        out += [f"| {s} | {scale[s]} |" for s in STEPS]
        out.append("")
    if fmt in ("css", "all"):
        out += [f"--{name}-{s}: {scale[s]};" for s in STEPS]
        out.append("")
    if fmt in ("js", "all"):
        out.append(f"{name}: {{")
        out += [f"  {s}: \"{scale[s]}\"," for s in STEPS]
        out.append("},\n")
    if fmt in ("tw", "all"):
        out.append(f"// tailwind.config.js -> theme.extend.colors")
        out.append(f"{name}: {{ " + ", ".join(f"{s}: \"{scale[s]}\"" for s in STEPS) + " },")
    return "\n".join(out)


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)

    s = sub.add_parser("scale")
    s.add_argument("hex")
    s.add_argument("--name", default="primary")
    s.add_argument("--anchor", type=int, default=500, choices=STEPS)
    s.add_argument("--format", default="all", choices=["md", "css", "js", "tw", "all"])

    c = sub.add_parser("contrast")
    c.add_argument("colors", nargs="+", help="pairs: text bg text bg ...")

    a = p.parse_args()
    if a.cmd == "scale":
        print(fmt_scale(a.name, make_scale(a.hex, a.anchor), a.format))
    else:
        if len(a.colors) % 2:
            sys.exit("contrast needs pairs: text bg [text bg ...]")
        print(f"{'Text':<9} {'Bg':<9} {'Ratio':>6}  AA text  AA large/UI")
        for i in range(0, len(a.colors), 2):
            t, bg = a.colors[i], a.colors[i + 1]
            r = contrast_ratio(t, bg)
            print(f"{t:<9} {bg:<9} {r:>6.2f}  {'PASS' if r >= 4.5 else 'FAIL':<7}  {'PASS' if r >= 3 else 'FAIL'}")


if __name__ == "__main__":
    main()
