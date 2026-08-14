# Photos

Drop your photographs in this folder. Any slot with no file falls back to a
gradient panel labelled "Emplacement photo", so the site never shows a broken
image while you are still gathering assets.

## Filenames the pages look for

| Filename             | Where it appears                          | Shape        | Suggested size |
| -------------------- | ----------------------------------------- | ------------ | -------------- |
| `dining-room.jpg`    | Homepage hero + gallery (largest tile)    | wide 16:9    | 2400 × 1350    |
| `seasonal-plate.jpg` | Homepage band + gallery                   | any          | 1600 × 1200    |

The gallery's remaining cells are unlabelled slots. To fill one, add an `<img>`
to that `.ph` block in `gallery.html` following the pattern of the two that are
already wired.

## After adding or replacing a photo

```
python3 build-images.py       # responsive widths + the hero's portrait crop
python3 build-standalone.py   # rebuild the single-file demo
```

`build-images.py` writes every file with a width in its name — `dining-room-768.jpg`,
`dining-room-portrait-706.jpg` and so on. Don't edit those by hand.

## Notes

- **The portrait crop.** A 16:9 hero inside a tall phone viewport shows only
  the middle 26% of the frame. `build-images.py` cuts a 3:4 version, and the
  markup serves it to any viewport taller than it is wide.
- **Cropping.** Photos are `object-fit: cover`, so they fill their slot and
  crop the overflow. Keep the subject near the centre.
- **Weight.** Under ~400 KB per original. The responsive variants handle the
  rest.
- **Alt text.** Each `<img>` carries `data-alt-fr` and `data-alt-en`. Update
  both when you swap a photo, so the description stays accurate in each
  language.

## branded/

Photographs carrying a specific restaurant's name or wordmark, kept out of the
neutral template. Nothing in the site references them.
