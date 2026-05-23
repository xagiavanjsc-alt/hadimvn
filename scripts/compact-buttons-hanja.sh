#!/usr/bin/env bash
# Compact button sizes across hanja-vocab tabs for VN-friendly density.
# Run from repo root.
set -e

shopt -s nullglob
files=(src/pages/hanja-vocab/components/*.tsx src/pages/hanja-vocab/page.tsx)

for f in "${files[@]}"; do
  # ─── PHASE 1: oversize vertical padding on buttons (py-3.5 / py-4) ──────────
  # py-3.5 is always a button (only 2 occurrences across the page)
  sed -i 's|py-3\.5|py-2.5|g' "$f"

  # py-4 ONLY when it's clearly a button context (combined with px-8 or full-width CTA)
  sed -i \
    -e 's|px-8 py-4|px-5 py-2.5|g' \
    -e 's|w-full py-4|w-full py-2.5|g' \
    -e 's|flex-1 py-4|flex-1 py-2.5|g' \
    "$f"

  # ─── PHASE 2: chunky CTA pattern → compact ─────────────────────────────────
  # Primary accent CTAs (rounded-xl + font-bold combo is button-only)
  sed -i \
    -e 's|w-full py-3 bg-app-accent-primary text-app-bg rounded-xl font-bold|w-full py-2.5 bg-app-accent-primary text-app-bg rounded-lg font-semibold text-sm|g' \
    -e 's|flex-1 py-3 bg-app-accent-primary text-app-bg rounded-xl font-bold|flex-1 py-2 bg-app-accent-primary text-app-bg rounded-lg font-semibold text-sm|g' \
    -e 's|px-6 py-3 bg-app-accent-primary text-app-bg rounded-xl font-bold|px-4 py-2 bg-app-accent-primary text-app-bg rounded-lg font-semibold text-sm|g' \
    -e 's|w-full py-3 bg-app-accent-primary text-white rounded-xl font-bold|w-full py-2.5 bg-app-accent-primary text-white rounded-lg font-semibold text-sm|g' \
    "$f"

  # Solid green/amber CTA (Weekly XP buttons, etc.)
  sed -i \
    -e 's|px-6 py-3 bg-green-500 text-app-bg rounded-xl font-bold|px-4 py-2 bg-green-500 text-app-bg rounded-lg font-semibold text-sm|g' \
    -e 's|px-6 py-3 bg-app-accent-primary text-white rounded-xl font-bold|px-4 py-2 bg-app-accent-primary text-white rounded-lg font-semibold text-sm|g' \
    "$f"

  # ─── PHASE 3: text-lg / text-base on CTA buttons → text-sm ────────────────
  # Only when in button contexts (font-bold + rounded-xl combo)
  sed -i \
    -e 's|rounded-xl font-bold text-lg|rounded-lg font-semibold text-sm|g' \
    -e 's|rounded-xl font-bold text-base|rounded-lg font-semibold text-sm|g' \
    -e 's|rounded-2xl font-bold text-base|rounded-xl font-semibold text-sm|g' \
    "$f"

  # ─── PHASE 4: secondary buttons ───────────────────────────────────────────
  # py-2.5 px-4 with text-sm → tighten to py-2 px-3 text-xs (smaller secondary)
  # Only target the explicit secondary CTA pattern with font-semibold
  sed -i \
    -e 's|py-2.5 border border-app-border text-white/70 rounded-xl text-sm cursor-pointer|py-2 border border-app-border text-white/70 rounded-lg text-sm cursor-pointer|g' \
    -e 's|py-3 border border-app-border text-white/70 rounded-xl font-semibold|py-2 border border-app-border text-white/70 rounded-lg text-sm font-medium|g' \
    -e 's|py-3 border border-app-border text-white/80 rounded-xl font-semibold|py-2 border border-app-border text-white/80 rounded-lg text-sm font-medium|g' \
    "$f"

  # ─── PHASE 5: icon buttons (w-10 h-10 → w-8 h-8 when wrapping a single icon) ─
  # Skip — too risky to sed without context. Many w-10 h-10 are for avatar bubbles.
done

echo "Done. Compacted buttons in ${#files[@]} files."
