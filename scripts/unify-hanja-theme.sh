#!/usr/bin/env bash
# Unify light-theme leftovers in src/pages/hanja-vocab/components/*.tsx
# to dark theme tokens (app-bg / app-surface / app-card / app-border / app-accent-primary).
# Run from repo root.
set -e

shopt -s nullglob
files=(src/pages/hanja-vocab/components/*.tsx)

for f in "${files[@]}"; do
  # ──────────────────────────────────────────────────────────────────
  # PHASE 1: Opacity-modified light patterns (must come BEFORE base shades)
  # ──────────────────────────────────────────────────────────────────
  sed -i \
    -e 's|hover:bg-rose-50/30|hover:bg-app-accent-primary/5|g' \
    -e 's|hover:bg-rose-50/20|hover:bg-app-accent-primary/5|g' \
    -e 's|bg-rose-50/50|bg-app-accent-primary/10|g' \
    -e 's|hover:bg-gray-50/50|hover:bg-app-surface/30|g' \
    -e 's|bg-gray-50/30|bg-app-surface/20|g' \
    -e 's|hover:bg-red-50/30|hover:bg-red-500/5|g' \
    -e 's|bg-green-50/50|bg-green-500/10|g' \
    -e 's|text-amber-700/80|text-amber-400/80|g' \
    "$f"

  # ──────────────────────────────────────────────────────────────────
  # PHASE 2: Rose shades (longest first; 500 before 50)
  # ──────────────────────────────────────────────────────────────────
  sed -i \
    -e 's|hover:bg-rose-600|hover:bg-app-accent-primary/90|g' \
    -e 's|hover:bg-rose-100|hover:bg-app-accent-primary/20|g' \
    -e 's|hover:bg-rose-50|hover:bg-app-accent-primary/10|g' \
    -e 's|hover:border-rose-300|hover:border-app-accent-primary|g' \
    -e 's|hover:border-rose-200|hover:border-app-accent-primary|g' \
    -e 's|hover:text-rose-700|hover:text-app-accent-primary|g' \
    -e 's|hover:text-rose-600|hover:text-app-accent-primary|g' \
    -e 's|bg-rose-600|bg-app-accent-primary/90|g' \
    -e 's|bg-rose-500|bg-app-accent-primary|g' \
    -e 's|bg-rose-100|bg-app-accent-primary/20|g' \
    -e 's|bg-rose-50|bg-app-accent-primary/10|g' \
    -e 's|border-rose-300|border-app-accent-primary/40|g' \
    -e 's|border-rose-200|border-app-accent-primary/30|g' \
    -e 's|border-rose-100|border-app-accent-primary/20|g' \
    -e 's|text-rose-700|text-app-accent-primary|g' \
    -e 's|text-rose-600|text-app-accent-primary|g' \
    -e 's|text-rose-500|text-app-accent-primary|g' \
    -e 's|text-rose-400|text-app-accent-primary|g' \
    -e 's|text-rose-300|text-app-accent-primary/70|g' \
    "$f"

  # ──────────────────────────────────────────────────────────────────
  # PHASE 3: Gray (background/text/border)
  # ──────────────────────────────────────────────────────────────────
  sed -i \
    -e 's|hover:bg-gray-200|hover:bg-app-surface/80|g' \
    -e 's|hover:bg-gray-100|hover:bg-app-surface/70|g' \
    -e 's|hover:bg-gray-50|hover:bg-app-surface/50|g' \
    -e 's|hover:text-gray-900|hover:text-white|g' \
    -e 's|hover:text-gray-700|hover:text-white/80|g' \
    -e 's|hover:text-gray-600|hover:text-white/70|g' \
    -e 's|hover:border-gray-300|hover:border-app-border|g' \
    -e 's|hover:border-gray-200|hover:border-app-border|g' \
    -e 's|bg-gray-300|bg-app-surface/80|g' \
    -e 's|bg-gray-200|bg-app-surface/70|g' \
    -e 's|bg-gray-100|bg-app-surface/50|g' \
    -e 's|bg-gray-50|bg-app-surface/30|g' \
    -e 's|text-gray-900|text-white|g' \
    -e 's|text-gray-800|text-white/90|g' \
    -e 's|text-gray-700|text-white/80|g' \
    -e 's|text-gray-600|text-white/70|g' \
    -e 's|text-gray-500|text-white/50|g' \
    -e 's|text-gray-400|text-white/40|g' \
    -e 's|text-gray-300|text-white/30|g' \
    -e 's|border-gray-300|border-app-border|g' \
    -e 's|border-gray-200|border-app-border|g' \
    -e 's|border-gray-100|border-app-border|g' \
    -e 's|border-gray-50|border-app-border|g' \
    -e 's|divide-gray-100|divide-app-border|g' \
    -e 's|divide-gray-50|divide-app-border|g' \
    "$f"

  # ──────────────────────────────────────────────────────────────────
  # PHASE 4: bg-white → surface
  # ──────────────────────────────────────────────────────────────────
  sed -i \
    -e 's|hover:bg-white|hover:bg-app-surface/70|g' \
    -e 's|bg-white\b|bg-app-surface/50|g' \
    "$f"

  # ──────────────────────────────────────────────────────────────────
  # PHASE 5: Semantic colors (green/amber/red/orange/blue/yellow/purple)
  # Light shades 50/100 → dark 500/X format; text 500/600/700 → 400
  # ──────────────────────────────────────────────────────────────────
  for color in green amber red orange blue yellow purple; do
    sed -i \
      -e "s|hover:bg-${color}-100|hover:bg-${color}-500/20|g" \
      -e "s|hover:bg-${color}-50|hover:bg-${color}-500/10|g" \
      -e "s|hover:border-${color}-200|hover:border-${color}-500/30|g" \
      -e "s|bg-${color}-100\b|bg-${color}-500/20|g" \
      -e "s|bg-${color}-50\b|bg-${color}-500/10|g" \
      -e "s|border-${color}-300|border-${color}-500/40|g" \
      -e "s|border-${color}-200|border-${color}-500/30|g" \
      -e "s|border-${color}-100|border-${color}-500/20|g" \
      -e "s|text-${color}-700|text-${color}-400|g" \
      -e "s|text-${color}-600|text-${color}-400|g" \
      -e "s|text-${color}-500|text-${color}-400|g" \
      "$f"
  done
done

echo "Done. Modified ${#files[@]} files."
