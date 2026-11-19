#!/usr/bin/env bash
# Rebuilds all Wivilo brand assets. Needs: node (tsx), python3 + fonttools + brotli + pillow, playwright (for PNGs).
set -e
cd "$(dirname "$0")/../.."
npx tsx scripts/brand/wivi-svg.tsx
python3 scripts/brand/build_brand.py
python3 scripts/brand/render_png.py
