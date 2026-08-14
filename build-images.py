#!/usr/bin/env python3
"""
Generate responsive sizes for every photograph in assets/img/.

Two jobs:

1. Width variants (480/768/1200/1600) so a phone downloads a phone-sized file
   instead of the full-resolution original. Never upscales.

2. A portrait crop of the hero. The hero photograph carries its own centred
   HENI wordmark, and a 16:9 source inside a tall phone viewport crops to the
   middle 26% — enough to cut the wordmark down to "HEN". The 3:4 crop keeps
   the whole thing, and the markup serves it below 700px.

    python3 build-images.py
"""

import os

from PIL import Image

SRC = "assets/img"
WIDTHS = (480, 768, 1200, 1600)
QUALITY = 82

# Photographs only — the README and any already-generated variant are skipped.
BASES = ("hero", "dining-room", "seasonal-plate", "event-cabane-a-sucre")


def save(im, path):
    im.save(path, quality=QUALITY, optimize=True, progressive=True)
    return os.path.getsize(path)


def variants(base):
    src = f"{SRC}/{base}.jpg"
    if not os.path.exists(src):
        return
    im = Image.open(src).convert("RGB")
    for w in WIDTHS:
        if w >= im.width:
            continue  # never upscale
        h = round(im.height * w / im.width)
        out = f"{SRC}/{base}-{w}.jpg"
        size = save(im.resize((w, h), Image.LANCZOS), out)
        print(f"  {out:52} {w}x{h:<5} {size // 1024} KB")


def hero_portrait():
    """3:4 centre crop, wide enough to keep the full wordmark."""
    src = f"{SRC}/hero.jpg"
    if not os.path.exists(src):
        return
    im = Image.open(src).convert("RGB")
    target_w = round(im.height * 3 / 4)
    if target_w >= im.width:
        target_w = im.width
    left = (im.width - target_w) // 2
    crop = im.crop((left, 0, left + target_w, im.height))
    # Include the crop's own width so a high-density phone still gets full detail.
    for w in sorted({480, 768, crop.width}):
        if w > crop.width:
            continue
        h = round(crop.height * w / crop.width)
        out = f"{SRC}/hero-portrait-{w}.jpg"
        size = save(crop.resize((w, h), Image.LANCZOS), out)
        print(f"  {out:52} {w}x{h:<5} {size // 1024} KB")


def main():
    print("width variants:")
    for base in BASES:
        variants(base)
    print("hero portrait crop (mobile art direction):")
    hero_portrait()


if __name__ == "__main__":
    main()
