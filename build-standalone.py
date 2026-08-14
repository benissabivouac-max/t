#!/usr/bin/env python3
"""
Bundle the three-page site into one self-contained HTML file.

CSS, JavaScript and every photograph are inlined, so the result opens from a
USB key or an email attachment with no server and no sibling files. The three
pages become sections switched by hash routing rather than separate documents.

Images that are not on disk have their <img> dropped at build time, so the
gradient placeholder shows without a failed request.

    python3 build-standalone.py  ->  heni-demo.html
"""

import base64
import os
import re

PAGES = [("index.html", "home"), ("about.html", "about"), ("gallery.html", "gallery")]
OUT = "heni-demo.html"


def data_uri(path):
    with open(path, "rb") as fh:
        return "data:image/jpeg;base64," + base64.b64encode(fh.read()).decode()


def slice_between(text, start, end):
    i = text.index(start)
    j = text.index(end, i) + len(end)
    return text[i:j]


# Embedding every responsive width would multiply the file size for no gain,
# so each image collapses to one variant: large enough for a laptop, small
# enough to keep the bundle sane.
STANDALONE_MAX_WIDTH = 1200


def pick_variant(path):
    """Prefer a generated width variant at or under the cap, else the original."""
    base, ext = os.path.splitext(path)
    best, best_w = path, 10 ** 9
    for candidate in sorted(os.listdir(os.path.dirname(path) or ".")):
        m = re.fullmatch(re.escape(os.path.basename(base)) + r"-(\d+)" + re.escape(ext), candidate)
        if not m:
            continue
        w = int(m.group(1))
        if w <= STANDALONE_MAX_WIDTH and (best == path or w > best_w or best_w > STANDALONE_MAX_WIDTH):
            best, best_w = os.path.join(os.path.dirname(path), candidate), w
    return best


def first_src(srcset):
    """Largest candidate in a srcset that is still within the cap."""
    best, best_w = None, -1
    for part in srcset.split(","):
        bits = part.strip().split()
        if not bits:
            continue
        url = bits[0]
        w = int(bits[1][:-1]) if len(bits) > 1 and bits[1].endswith("w") else 0
        if w <= STANDALONE_MAX_WIDTH and w > best_w and os.path.exists(url):
            best, best_w = url, w
    return best


def inline_images(html, cache):
    """Collapse <picture>/srcset to one embedded image; drop <img> with no file."""

    def uri(path):
        if path not in cache:
            cache[path] = data_uri(path)
        return cache[path]

    def do_source(match):
        tag = match.group(0)
        srcset = re.search(r'srcset="([^"]+)"', tag)
        if not srcset:
            return tag
        chosen = first_src(srcset.group(1))
        if not chosen:
            return ""  # nothing usable: let the next source or the img win
        tag = re.sub(r'srcset="[^"]+"', f'srcset="{uri(chosen)}"', tag)
        return re.sub(r'\s*sizes="[^"]*"', "", tag)

    def do_img(match):
        tag = match.group(0)
        src = re.search(r'src="(assets/img/[^"]+)"', tag)
        if not src:
            return tag
        path = src.group(1)
        if not os.path.exists(path):
            return ""  # no file: let the gradient placeholder stand alone
        tag = re.sub(r'\s*srcset="[^"]*"', "", tag)
        tag = re.sub(r'\s*sizes="[^"]*"', "", tag)
        return tag.replace(path, uri(pick_variant(path)))

    html = re.sub(r"<source\b[^>]*?/?>", do_source, html, flags=re.S)
    return re.sub(r"<img\b[^>]*?/?>", do_img, html, flags=re.S)


def main():
    css = open("assets/css/style.css", encoding="utf-8").read()
    js = open("assets/js/main.js", encoding="utf-8").read()

    first = open("index.html", encoding="utf-8").read()
    header = slice_between(first, "  <header", "</header>")
    footer = slice_between(first, "  <footer", "</footer>")

    cache = {}
    sections = []
    for filename, key in PAGES:
        html = open(filename, encoding="utf-8").read()
        main_html = slice_between(html, "  <main>", "  </main>")
        main_html = inline_images(main_html, cache)
        hidden = "" if key == "home" else ' hidden'
        sections.append(f'<div class="page" id="page-{key}"{hidden}>\n{main_html}\n</div>')

    header = inline_images(header, cache)
    footer = inline_images(footer, cache)

    # Point the nav and every in-page link at the hash routes
    route = {"index.html": "#home", "about.html": "#about", "gallery.html": "#gallery"}
    body = header + "\n" + "\n".join(sections) + "\n" + footer
    for filename, target in route.items():
        body = body.replace(f'href="{filename}"', f'href="{target}"')

    router = """
  // Hash routing — the three pages live in one document here, so navigation
  // swaps sections instead of loading a new file.
  (function () {
    var pages = ["home", "about", "gallery"];

    function show(name) {
      if (pages.indexOf(name) === -1) name = "home";
      pages.forEach(function (p) {
        var el = document.getElementById("page-" + p);
        if (el) el.hidden = p !== name;
      });
      document.body.classList.toggle("is-home", name === "home");
      document.querySelectorAll(".main-nav a, .footer-col a").forEach(function (a) {
        a.classList.toggle("is-active", a.getAttribute("href") === "#" + name);
      });
      var header = document.querySelector(".site-header");
      if (header) header.classList.remove("is-open");
      window.scrollTo(0, 0);
    }

    window.addEventListener("hashchange", function () {
      show(location.hash.replace("#", ""));
    });

    document.addEventListener("DOMContentLoaded", function () {
      show(location.hash.replace("#", "") || "home");
    });
  })();
"""

    doc = f"""<!doctype html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Heni — Restaurant méditerranéen, Montréal</title>
  <meta name="description" content="Site de démonstration — Heni, cuisine méditerranéenne de saison et vins naturels à Montréal." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400;0,500;0,600;1,400&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet" />
  <style>
{css}
  </style>
</head>
<body class="is-home" data-title-fr="Heni — Restaurant méditerranéen, Montréal" data-title-en="Heni — Mediterranean Restaurant, Montreal">

{body}

  <script>
{js}
{router}
  </script>
</body>
</html>
"""

    with open(OUT, "w", encoding="utf-8") as fh:
        fh.write(doc)

    size = os.path.getsize(OUT)
    print(f"{OUT}  {size / 1024 / 1024:.2f} MB  ({len(cache)} images inlined)")


if __name__ == "__main__":
    main()
