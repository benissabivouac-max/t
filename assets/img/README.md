# Photos — Heni

Drop your photos in this folder using the exact filenames below. The site
picks them up automatically — no code changes needed.

If a file is missing, that slot falls back to the gradient block it used
before, so the site never shows a broken image.

| Filename             | Where it appears                          | Shape        | Suggested size |
| -------------------- | ----------------------------------------- | ------------ | -------------- |
| `hero.jpg`           | Homepage full-screen hero                 | wide         | 2400 × 1400    |
| `dough.jpg`          | Homepage "Pain, fermentation, saison"     | portrait 4:5 | 1200 × 1500    |
| `wine-cellar.jpg`    | Homepage wine section + gallery           | portrait 4:5 | 1200 × 1500    |
| `dining-room.jpg`    | Homepage grid + gallery (large tile)      | wide         | 1800 × 1200    |
| `seasonal-plate.jpg` | Homepage grid + gallery                   | portrait 4:5 | 1200 × 1500    |
| `counter.jpg`        | Homepage grid + gallery                   | portrait 4:5 | 1200 × 1500    |
| `detail.jpg`         | Homepage grid                             | portrait 4:5 | 1200 × 1500    |
| `kitchen.jpg`        | About page + gallery (wide tile)          | wide         | 1800 × 1200    |
| `bread.jpg`          | Gallery                                   | portrait 4:5 | 1200 × 1500    |
| `mouneh-jars.jpg`    | Gallery                                   | portrait 4:5 | 1200 × 1500    |
| `natural-wine.jpg`   | Gallery                                   | portrait 4:5 | 1200 × 1500    |
| `set-table.jpg`      | Gallery (wide tile)                       | wide         | 1800 × 1200    |
| `dessert.jpg`        | Gallery                                   | portrait 4:5 | 1200 × 1500    |

## Generated files

Anything with a width in its name — `hero-768.jpg`, `dining-room-1200.jpg`,
`hero-portrait-706.jpg` — is produced by `build-images.py`. Don't edit those
by hand; drop in the full-size original and re-run:

```
python3 build-images.py       # responsive widths + the hero's portrait crop
python3 build-standalone.py   # rebuild the single-file demo
```

`hero-portrait-*.jpg` is a 3:4 centre crop of the hero. The full-width
photograph carries its own centred wordmark, and a 16:9 image in a tall phone
viewport crops to the middle 26% — enough to cut `HENI` down to `HEN`. The
markup serves the portrait crop to any viewport taller than it is wide.

## Notes

- **The hero.** `hero.jpg` is the long set table with flowers, shot against the
  velvet banquette and brick wall. That image carries its own typography — a
  large `HENI` wordmark and `info@heni.restaurant` — while the hero section
  also renders the site's own heading, tagline and buttons on top of it. The
  two sets of text overlap. If that reads badly once it's in, either supply a
  version of the photo without the overlaid type, or say the word and I'll
  strip the hero's own text so only the photo's typography shows.
- **Format.** `.jpg` is what the HTML asks for. To use `.webp` or `.png`
  instead, update the `src` attributes to match.
- **Cropping.** Every photo is `object-fit: cover`, so it fills its slot and
  crops the overflow. Keep the subject near the center and it will survive
  every screen size.
- **Weight.** Aim for under ~400 KB each. The hero loads first and sets how
  fast the site feels.
- **Alt text.** Each `<img>` carries `data-alt-fr` and `data-alt-en`. If a
  photo shows something different from the current description, update both
  in the HTML so the alt text stays accurate in each language.
