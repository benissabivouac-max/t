(function () {
  "use strict";

  var LANG_KEY = "site-lang";
  var html = document.documentElement;

  // Flag the document before first paint so the reveal's hidden state applies
  // without the text flashing in and back out.
  if (
    "IntersectionObserver" in window &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    html.classList.add("js-reveal");
  }

  function applyLang(lang) {
    html.classList.remove("lang-en", "lang-fr");
    html.classList.add("lang-" + lang);
    html.setAttribute("lang", lang);

    var toggle = document.getElementById("lang-toggle");
    if (toggle) {
      toggle.textContent = lang === "fr" ? "EN" : "FR";
      toggle.setAttribute("aria-label", lang === "fr" ? "Switch to English" : "Passer au français");
    }

    var titleKey = lang === "fr" ? "titleFr" : "titleEn";
    if (document.body.dataset[titleKey]) {
      document.title = document.body.dataset[titleKey];
    }

    document.querySelectorAll("img[data-alt-fr]").forEach(function (img) {
      var alt = lang === "fr" ? img.dataset.altFr : img.dataset.altEn;
      if (alt) img.setAttribute("alt", alt);
    });
  }

  function initLang() {
    var stored = null;
    try {
      stored = localStorage.getItem(LANG_KEY);
    } catch (e) {}

    var lang = stored || "fr";
    applyLang(lang);

    var toggle = document.getElementById("lang-toggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var next = html.classList.contains("lang-fr") ? "en" : "fr";
        applyLang(next);
        try {
          localStorage.setItem(LANG_KEY, next);
        } catch (e) {}
      });
    }
  }

  function initHeader() {
    var header = document.querySelector(".site-header");
    var navToggle = document.getElementById("nav-toggle");
    if (!header) return;

    function onScroll() {
      if (window.scrollY > 24) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (navToggle) {
      navToggle.addEventListener("click", function () {
        header.classList.toggle("is-open");
        var expanded = header.classList.contains("is-open");
        navToggle.setAttribute("aria-expanded", String(expanded));
      });

      header.querySelectorAll(".main-nav a").forEach(function (link) {
        link.addEventListener("click", function () {
          header.classList.remove("is-open");
        });
      });
    }
  }

  function initPhotos() {
    var photos = document.querySelectorAll(".ph img, .hero-media img, .event-poster img");

    function onLoad(img) {
      img.classList.add("is-loaded");
      var frame = img.closest(".ph");
      if (frame) frame.classList.add("has-photo");
    }

    function onError(img) {
      // File not in assets/img/ yet — remove the <img> so the gradient
      // block underneath shows through instead of a broken-image icon.
      img.remove();
    }

    // Resolve an image if the browser has already finished with it. Called on
    // the load/error events and again on window load, because a lazy image can
    // finish between our checks and never deliver an event we hear — leaving it
    // stuck at opacity 0 over its own gradient.
    function settle(img) {
      if (!img.isConnected || img.classList.contains("is-loaded")) return;
      if (!img.complete) return;
      if (img.naturalWidth > 0) onLoad(img);
      else onError(img);
    }

    photos.forEach(function (img) {
      img.addEventListener("load", function () { onLoad(img); });
      img.addEventListener("error", function () { onError(img); });
      settle(img);
    });

    window.addEventListener("load", function () {
      photos.forEach(settle);
    });
  }

  var REVEAL_SELECTOR = [
    "main .eyebrow",
    "main h1",
    "main h2",
    "main p",
    "main .divider",
    "main .btn",
    "main .badge",
    "main .event-past",
    "main .pillar",
    "main .timeline-item",
    "main .info-list > div",
    "main .ph-label"
  ].join(", ");

  function canReveal() {
    return (
      "IntersectionObserver" in window &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function initReveal() {
    if (!canReveal()) return;

    var targets = [].slice.call(document.querySelectorAll(REVEAL_SELECTOR));

    // Drop anything nested inside another target, so a card and its own
    // heading do not animate twice at different moments.
    targets = targets.filter(function (el) {
      return !targets.some(function (other) {
        return other !== el && other.contains(el);
      });
    });

    // Stagger each element against its own section rather than the document,
    // so a section reached late does not inherit a long delay.
    var counts = {};
    targets.forEach(function (el) {
      var section = el.closest("section") || document.body;
      if (!section.dataset.revealGroup) {
        section.dataset.revealGroup = String(Object.keys(counts).length + 1);
        counts[section.dataset.revealGroup] = 0;
      }
      var group = section.dataset.revealGroup;
      var index = counts[group]++;
      el.setAttribute("data-reveal", "");
      el.style.setProperty("--reveal-delay", Math.min(index * 70, 420) + "ms");
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 }
    );

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  // Scale applied to parallax images; must match --ps in the stylesheet.
  var PARALLAX_SCALE = 1.18;

  function initParallax() {
    if (!canReveal()) return;
    // Phones skip it: the effect costs a repaint on every scroll frame and
    // reads as jitter on a small screen rather than depth.
    if (window.matchMedia("(max-width: 700px)").matches) return;

    var images = [].slice.call(
      document.querySelectorAll(".hero-media img, .band .ph img")
    );
    if (!images.length) return;

    document.documentElement.classList.add("js-parallax");

    var ticking = false;

    function update() {
      ticking = false;
      var viewport = window.innerHeight;

      images.forEach(function (img) {
        var frame = img.closest(".ph") || img.closest(".hero-media");
        if (!frame) return;
        var rect = frame.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > viewport + 200) return;

        // Centre of the frame relative to centre of the screen, as -1..1.
        var progress =
          (rect.top + rect.height / 2 - viewport / 2) /
          (viewport / 2 + rect.height / 2);
        progress = Math.max(-1, Math.min(1, progress));

        // Never travel further than the overflow the scale bought us, or the
        // image would pull away from its frame and show the gradient behind.
        var headroom = (rect.height * (PARALLAX_SCALE - 1)) / 2;
        var shift = -progress * headroom * 0.85;

        img.style.setProperty("--py", shift.toFixed(1) + "px");
      });
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("load", update);
    update();
  }

  function initFooterYear() {
    var el = document.getElementById("footer-year");
    if (el) el.textContent = new Date().getFullYear();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initLang();
    initHeader();
    initPhotos();
    initReveal();
    initParallax();
    initFooterYear();
  });
})();
