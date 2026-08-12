(function () {
  "use strict";

  var LANG_KEY = "heni-lang";
  var html = document.documentElement;

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
    var photos = document.querySelectorAll(".ph img, .hero-media img");

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

  function initFooterYear() {
    var el = document.getElementById("footer-year");
    if (el) el.textContent = new Date().getFullYear();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initLang();
    initHeader();
    initPhotos();
    initFooterYear();
  });
})();
